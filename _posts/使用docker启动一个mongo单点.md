---
title: docker run single mongodb
date: 2018-11-07 19:56:50
tags: Docker
---

1.安装Docker

```
yum install https://mirrors.aliyun.com/docker-ce/linux/centos/7/x86_64/stable/Packages/docker-ce-selinux-17.06.2.ce-1.el7.centos.noarch.rpm  -y
yum install https://mirrors.aliyun.com/docker-ce/linux/centos/7/x86_64/stable/Packages/docker-ce-17.06.2.ce-1.el7.centos.x86_64.rpm  -y

```
2.修改Docker配置文件
```
vim /usr/lib/systemd/system/docker.service
将ExecStart=/usr/bin/dockerd修改为
ExecStart=/usr/bin/dockerd   -H tcp://0.0.0.0:2375 -H unix:///var/run/docker.sock  --registry-mirror=https://ms3cfraz.mirror.aliyuncs.com

修改完后记得重启docker
systemctl daemon-reload
systemctl restart docker
systemctl enable docker
systemctl status docker

```


3.通过Dockerfile构建mongo镜像(或是直接docker pull nianshenlovelily/mongodb:3.2)
* 可以git clone https://github.com/zhangzhaorui/docker-mongo-single.git
* 将Dockerfile和docker-entrypoint.sh放到同级的目录下
* vim docker-entrypoint.sh #chmod +x docker-entrypoint.sh
```
#!/bin/bash
set -Eeuo pipefail

if [ "${1:0:1}" = '-' ]; then
	set -- mongod "$@"
fi

originalArgOne="$1"

# allow the container to be started with `--user`
# all mongo* commands should be dropped to the correct user
if [[ "$originalArgOne" == mongo* ]] && [ "$(id -u)" = '0' ]; then
	if [ "$originalArgOne" = 'mongod' ]; then
		find /data/configdb /data/db \! -user mongodb -exec chown mongodb '{}' +
	fi

	# make sure we can write to stdout and stderr as "mongodb"
	# (for our "initdb" code later; see "--logpath" below)
	chown --dereference mongodb "/proc/$$/fd/1" "/proc/$$/fd/2" || :
	# ignore errors thanks to https://github.com/docker-library/mongo/issues/149

	exec gosu mongodb "$BASH_SOURCE" "$@"
fi

# you should use numactl to start your mongod instances, including the config servers, mongos instances, and any clients.
# https://docs.mongodb.com/manual/administration/production-notes/#configuring-numa-on-linux
if [[ "$originalArgOne" == mongo* ]]; then
	numa='numactl --interleave=all'
	if $numa true &> /dev/null; then
		set -- $numa "$@"
	fi
fi

# usage: file_env VAR [DEFAULT]
#    ie: file_env 'XYZ_DB_PASSWORD' 'example'
# (will allow for "$XYZ_DB_PASSWORD_FILE" to fill in the value of
#  "$XYZ_DB_PASSWORD" from a file, especially for Docker's secrets feature)
file_env() {
	local var="$1"
	local fileVar="${var}_FILE"
	local def="${2:-}"
	if [ "${!var:-}" ] && [ "${!fileVar:-}" ]; then
		echo >&2 "error: both $var and $fileVar are set (but are exclusive)"
		exit 1
	fi
	local val="$def"
	if [ "${!var:-}" ]; then
		val="${!var}"
	elif [ "${!fileVar:-}" ]; then
		val="$(< "${!fileVar}")"
	fi
	export "$var"="$val"
	unset "$fileVar"
}

# see https://github.com/docker-library/mongo/issues/147 (mongod is picky about duplicated arguments)
_mongod_hack_have_arg() {
	local checkArg="$1"; shift
	local arg
	for arg; do
		case "$arg" in
			"$checkArg"|"$checkArg"=*)
				return 0
				;;
		esac
	done
	return 1
}
# _mongod_hack_get_arg_val '--some-arg' "$@"
_mongod_hack_get_arg_val() {
	local checkArg="$1"; shift
	while [ "$#" -gt 0 ]; do
		local arg="$1"; shift
		case "$arg" in
			"$checkArg")
				echo "$1"
				return 0
				;;
			"$checkArg"=*)
				echo "${arg#$checkArg=}"
				return 0
				;;
		esac
	done
	return 1
}
declare -a mongodHackedArgs
# _mongod_hack_ensure_arg '--some-arg' "$@"
# set -- "${mongodHackedArgs[@]}"
_mongod_hack_ensure_arg() {
	local ensureArg="$1"; shift
	mongodHackedArgs=( "$@" )
	if ! _mongod_hack_have_arg "$ensureArg" "$@"; then
		mongodHackedArgs+=( "$ensureArg" )
	fi
}
# _mongod_hack_ensure_no_arg '--some-unwanted-arg' "$@"
# set -- "${mongodHackedArgs[@]}"
_mongod_hack_ensure_no_arg() {
	local ensureNoArg="$1"; shift
	mongodHackedArgs=()
	while [ "$#" -gt 0 ]; do
		local arg="$1"; shift
		if [ "$arg" = "$ensureNoArg" ]; then
			continue
		fi
		mongodHackedArgs+=( "$arg" )
	done
}
# _mongod_hack_ensure_no_arg '--some-unwanted-arg' "$@"
# set -- "${mongodHackedArgs[@]}"
_mongod_hack_ensure_no_arg_val() {
	local ensureNoArg="$1"; shift
	mongodHackedArgs=()
	while [ "$#" -gt 0 ]; do
		local arg="$1"; shift
		case "$arg" in
			"$ensureNoArg")
				shift # also skip the value
				continue
				;;
			"$ensureNoArg"=*)
				# value is already included
				continue
				;;
		esac
		mongodHackedArgs+=( "$arg" )
	done
}
# _mongod_hack_ensure_arg_val '--some-arg' 'some-val' "$@"
# set -- "${mongodHackedArgs[@]}"
_mongod_hack_ensure_arg_val() {
	local ensureArg="$1"; shift
	local ensureVal="$1"; shift
	_mongod_hack_ensure_no_arg_val "$ensureArg" "$@"
	mongodHackedArgs+=( "$ensureArg" "$ensureVal" )
}

# _js_escape 'some "string" value'
_js_escape() {
	jq --null-input --arg 'str' "$1" '$str'
}

jsonConfigFile="${TMPDIR:-/tmp}/docker-entrypoint-config.json"
tempConfigFile="${TMPDIR:-/tmp}/docker-entrypoint-temp-config.json"
_parse_config() {
	if [ -s "$tempConfigFile" ]; then
		return 0
	fi

	local configPath
	if configPath="$(_mongod_hack_get_arg_val --config "$@")"; then
		# if --config is specified, parse it into a JSON file so we can remove a few problematic keys (especially SSL-related keys)
		# see https://docs.mongodb.com/manual/reference/configuration-options/
		mongo --norc --nodb --quiet --eval "load('/js-yaml.js'); printjson(jsyaml.load(cat($(_js_escape "$configPath"))))" > "$jsonConfigFile"
		jq 'del(.systemLog, .processManagement, .net, .security)' "$jsonConfigFile" > "$tempConfigFile"
		return 0
	fi

	return 1
}
dbPath=
_dbPath() {
	if [ -n "$dbPath" ]; then
		echo "$dbPath"
		return
	fi

	if ! dbPath="$(_mongod_hack_get_arg_val --dbpath "$@")"; then
		if _parse_config "$@"; then
			dbPath="$(jq -r '.storage.dbPath // empty' "$jsonConfigFile")"
		fi
	fi

	: "${dbPath:=/data/db}"

	echo "$dbPath"
}

if [ "$originalArgOne" = 'mongod' ]; then
	file_env 'MONGO_INITDB_ROOT_USERNAME'
	file_env 'MONGO_INITDB_ROOT_PASSWORD'
	# pre-check a few factors to see if it's even worth bothering with initdb
	shouldPerformInitdb=
	if [ "$MONGO_INITDB_ROOT_USERNAME" ] && [ "$MONGO_INITDB_ROOT_PASSWORD" ]; then
		# if we have a username/password, let's set "--auth"
		_mongod_hack_ensure_arg '--auth' "$@"
		set -- "${mongodHackedArgs[@]}"
		shouldPerformInitdb='true'
	elif [ "$MONGO_INITDB_ROOT_USERNAME" ] || [ "$MONGO_INITDB_ROOT_PASSWORD" ]; then
		cat >&2 <<-'EOF'

			error: missing 'MONGO_INITDB_ROOT_USERNAME' or 'MONGO_INITDB_ROOT_PASSWORD'
			       both must be specified for a user to be created

		EOF
		exit 1
	fi

	if [ -z "$shouldPerformInitdb" ]; then
		# if we've got any /docker-entrypoint-initdb.d/* files to parse later, we should initdb
		for f in /docker-entrypoint-initdb.d/*; do
			case "$f" in
				*.sh|*.js) # this should match the set of files we check for below
					shouldPerformInitdb="$f"
					break
					;;
			esac
		done
	fi

	# check for a few known paths (to determine whether we've already initialized and should thus skip our initdb scripts)
	if [ -n "$shouldPerformInitdb" ]; then
		dbPath="$(_dbPath "$@")"
		for path in \
			"$dbPath/WiredTiger" \
			"$dbPath/journal" \
			"$dbPath/local.0" \
			"$dbPath/storage.bson" \
		; do
			if [ -e "$path" ]; then
				shouldPerformInitdb=
				break
			fi
		done
	fi

	if [ -n "$shouldPerformInitdb" ]; then
		mongodHackedArgs=( "$@" )
		if _parse_config "$@"; then
			_mongod_hack_ensure_arg_val --config "$tempConfigFile" "${mongodHackedArgs[@]}"
		fi
		_mongod_hack_ensure_arg_val --bind_ip 127.0.0.1 "${mongodHackedArgs[@]}"
		_mongod_hack_ensure_arg_val --port 27017 "${mongodHackedArgs[@]}"

		# remove "--auth" and "--replSet" for our initial startup (see https://docs.mongodb.com/manual/tutorial/enable-authentication/#start-mongodb-without-access-control)
		# https://github.com/docker-library/mongo/issues/211
		_mongod_hack_ensure_no_arg --auth "${mongodHackedArgs[@]}"
		if [ "$MONGO_INITDB_ROOT_USERNAME" ] && [ "$MONGO_INITDB_ROOT_PASSWORD" ]; then
			_mongod_hack_ensure_no_arg_val --replSet "${mongodHackedArgs[@]}"
		fi

		sslMode="$(_mongod_hack_have_arg '--sslPEMKeyFile' "$@" && echo 'allowSSL' || echo 'disabled')" # "BadValue: need sslPEMKeyFile when SSL is enabled" vs "BadValue: need to enable SSL via the sslMode flag when using SSL configuration parameters"
		_mongod_hack_ensure_arg_val --sslMode "$sslMode" "${mongodHackedArgs[@]}"

		if stat "/proc/$$/fd/1" > /dev/null && [ -w "/proc/$$/fd/1" ]; then
			# https://github.com/mongodb/mongo/blob/38c0eb538d0fd390c6cb9ce9ae9894153f6e8ef5/src/mongo/db/initialize_server_global_state.cpp#L237-L251
			# https://github.com/docker-library/mongo/issues/164#issuecomment-293965668
			_mongod_hack_ensure_arg_val --logpath "/proc/$$/fd/1" "${mongodHackedArgs[@]}"
		else
			initdbLogPath="$(_dbPath "$@")/docker-initdb.log"
			echo >&2 "warning: initdb logs cannot write to '/proc/$$/fd/1', so they are in '$initdbLogPath' instead"
			_mongod_hack_ensure_arg_val --logpath "$initdbLogPath" "${mongodHackedArgs[@]}"
		fi
		_mongod_hack_ensure_arg --logappend "${mongodHackedArgs[@]}"

		pidfile="${TMPDIR:-/tmp}/docker-entrypoint-temp-mongod.pid"
		rm -f "$pidfile"
		_mongod_hack_ensure_arg_val --pidfilepath "$pidfile" "${mongodHackedArgs[@]}"

		"${mongodHackedArgs[@]}" --fork

		mongo=( mongo --host 127.0.0.1 --port 27017 --quiet )

		# check to see that our "mongod" actually did start up (catches "--help", "--version", MongoDB 3.2 being silly, slow prealloc, etc)
		# https://jira.mongodb.org/browse/SERVER-16292
		tries=30
		while true; do
			if ! { [ -s "$pidfile" ] && ps "$(< "$pidfile")" &> /dev/null; }; then
				# bail ASAP if "mongod" isn't even running
				echo >&2
				echo >&2 "error: $originalArgOne does not appear to have stayed running -- perhaps it had an error?"
				echo >&2
				exit 1
			fi
			if "${mongo[@]}" 'admin' --eval 'quit(0)' &> /dev/null; then
				# success!
				break
			fi
			(( tries-- ))
			if [ "$tries" -le 0 ]; then
				echo >&2
				echo >&2 "error: $originalArgOne does not appear to have accepted connections quickly enough -- perhaps it had an error?"
				echo >&2
				exit 1
			fi
			sleep 1
		done

		if [ "$MONGO_INITDB_ROOT_USERNAME" ] && [ "$MONGO_INITDB_ROOT_PASSWORD" ]; then
			rootAuthDatabase='admin'

			"${mongo[@]}" "$rootAuthDatabase" <<-EOJS
				db.createUser({
					user: $(_js_escape "$MONGO_INITDB_ROOT_USERNAME"),
					pwd: $(_js_escape "$MONGO_INITDB_ROOT_PASSWORD"),
					roles: [ { role: 'root', db: $(_js_escape "$rootAuthDatabase") } ]
				})
			EOJS
		fi

		export MONGO_INITDB_DATABASE="${MONGO_INITDB_DATABASE:-test}"

		echo
		for f in /docker-entrypoint-initdb.d/*; do
			case "$f" in
				*.sh) echo "$0: running $f"; . "$f" ;;
				*.js) echo "$0: running $f"; "${mongo[@]}" "$MONGO_INITDB_DATABASE" "$f"; echo ;;
				*)    echo "$0: ignoring $f" ;;
			esac
			echo
		done

		"${mongodHackedArgs[@]}" --shutdown
		rm -f "$pidfile"

		echo
		echo 'MongoDB init process complete; ready for start up.'
		echo
	fi

	unset "${!MONGO_INITDB_@}"
fi

rm -f "$jsonConfigFile" "$tempConfigFile"

exec "$@"

```
* vim Dockerfile
```
FROM debian:jessie-slim

# add our user and group first to make sure their IDs get assigned consistently, regardless of whatever dependencies get added
RUN groupadd -r mongodb && useradd -r -g mongodb mongodb

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ca-certificates \
        jq \
        numactl \
    && rm -rf /var/lib/apt/lists/*

# grab gosu for easy step-down from root (https://github.com/tianon/gosu/releases)
ENV GOSU_VERSION 1.10
# grab "js-yaml" for parsing mongod's YAML config files (https://github.com/nodeca/js-yaml/releases)
ENV JSYAML_VERSION 3.10.0

RUN set -ex; \
    \
    apt-get update; \
    apt-get install -y --no-install-recommends \
        wget \
    ; \
    rm -rf /var/lib/apt/lists/*; \
    \
    dpkgArch="$(dpkg --print-architecture | awk -F- '{ print $NF }')"; \
    wget -O /usr/local/bin/gosu "https://github.com/tianon/gosu/releases/download/$GOSU_VERSION/gosu-$dpkgArch"; \
    wget -O /usr/local/bin/gosu.asc "https://github.com/tianon/gosu/releases/download/$GOSU_VERSION/gosu-$dpkgArch.asc"; \
    export GNUPGHOME="$(mktemp -d)"; \
    gpg --keyserver ha.pool.sks-keyservers.net --recv-keys B42F6819007F00F88E364FD4036A9C25BF357DD4; \
    gpg --batch --verify /usr/local/bin/gosu.asc /usr/local/bin/gosu; \
    command -v gpgconf && gpgconf --kill all || :; \
    rm -r "$GNUPGHOME" /usr/local/bin/gosu.asc; \
    chmod +x /usr/local/bin/gosu; \
    gosu nobody true; \
    \
    wget -O /js-yaml.js "https://github.com/nodeca/js-yaml/raw/${JSYAML_VERSION}/dist/js-yaml.js"; \
# TODO some sort of download verification here
    \
    apt-get purge -y --auto-remove wget

RUN mkdir /docker-entrypoint-initdb.d

ENV GPG_KEYS \
# pub   4096R/AAB2461C 2014-02-25 [expires: 2016-02-25]
#       Key fingerprint = DFFA 3DCF 326E 302C 4787  673A 01C4 E7FA AAB2 461C
# uid                  MongoDB 2.6 Release Signing Key <packaging@mongodb.com>
    DFFA3DCF326E302C4787673A01C4E7FAAAB2461C \
# pub   4096R/EA312927 2015-10-09 [expires: 2017-10-08]
#       Key fingerprint = 42F3 E95A 2C4F 0827 9C49  60AD D68F A50F EA31 2927
# uid                  MongoDB 3.2 Release Signing Key <packaging@mongodb.com>
    42F3E95A2C4F08279C4960ADD68FA50FEA312927
# https://docs.mongodb.com/manual/tutorial/verify-mongodb-packages/#download-then-import-the-key-file
RUN set -ex; \
    export GNUPGHOME="$(mktemp -d)"; \
    for key in $GPG_KEYS; do \
        gpg --keyserver ha.pool.sks-keyservers.net --recv-keys "$key"; \
    done; \
    gpg --export $GPG_KEYS > /etc/apt/trusted.gpg.d/mongodb.gpg; \
    command -v gpgconf && gpgconf --kill all || :; \
    rm -r "$GNUPGHOME"; \
    apt-key list

# Allow build-time overrides (eg. to build image with MongoDB Enterprise version)
# Options for MONGO_PACKAGE: mongodb-org OR mongodb-enterprise
# Options for MONGO_REPO: repo.mongodb.org OR repo.mongodb.com
# Example: docker build --build-arg MONGO_PACKAGE=mongodb-enterprise --build-arg MONGO_REPO=repo.mongodb.com .
ARG MONGO_PACKAGE=mongodb-org
ARG MONGO_REPO=repo.mongodb.org
ENV MONGO_PACKAGE=${MONGO_PACKAGE} MONGO_REPO=${MONGO_REPO}

ENV MONGO_MAJOR 3.2
ENV MONGO_VERSION 3.2.20

RUN echo "deb http://$MONGO_REPO/apt/debian jessie/${MONGO_PACKAGE%-unstable}/$MONGO_MAJOR main" | tee "/etc/apt/sources.list.d/${MONGO_PACKAGE%-unstable}.list"

RUN set -x \
    && apt-get update \
    && apt-get install -y \
        ${MONGO_PACKAGE}=$MONGO_VERSION \
        ${MONGO_PACKAGE}-server=$MONGO_VERSION \
        ${MONGO_PACKAGE}-shell=$MONGO_VERSION \
        ${MONGO_PACKAGE}-mongos=$MONGO_VERSION \
        ${MONGO_PACKAGE}-tools=$MONGO_VERSION \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /var/lib/mongodb \
    && mv /etc/mongod.conf /etc/mongod.conf.orig

RUN mkdir -p /data/db /data/configdb \
    && chown -R mongodb:mongodb /data/db /data/configdb
VOLUME /data/db /data/configdb

COPY docker-entrypoint.sh /usr/local/bin/
RUN ln -s usr/local/bin/docker-entrypoint.sh /entrypoint.sh # backwards compat
ENTRYPOINT ["docker-entrypoint.sh"]

EXPOSE 27017
CMD ["mongod"]
```

* build镜像
```
docker build -t nianshenlovelily/mongo:3.2 .
```

3.使用image构建mongo
* 创建mongo数据持久化目录，将数据挂载出来
```
mkdir -p /mongo/db
```
* 启动容器(容器映射到宿主机上的端口可以自行更改 -p 宿主机端口：容器内端口，数据持久化的目录也是-v 宿主机目录：容器内目录)
```
docker run -d --name mongodb-single -p 27017:27017 -v /mongo/db:/data/db  nianshenlovelily/mongo:3.2
```



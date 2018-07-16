---
layout:     post
title:      Mcentos7上部署MySQL5.7.18
subtitle:   一只小白喵的初步探爪~
date:       2018-07-15
author:     Rebecca.Wu
header-img: img/VCG21cf0e1b728.jpg
catalog: true
tags:
    - 姿势
---

    部署MySQL走过的坑

### 目录

- 新建mysql⽤户
- 下载安装包、解压
- 下载安装包、解压
- 配置⽂件修改
- ⾃定义配置⽂件my.cnf
- 创建启动脚本，脚本详⻅（附）my.cnf
- 启动、登录修改root⽤户密码
- （附）配置⽂件和脚本

### mysql安装步骤

#### 1、 新建mysql⽤户

    # groupadd mggrp
    # useradd -g mggrp -d /home/migu_mysql -m migu_mysql
    # passwd wumx
    $ mkdir -p /home/migu_mysql/data/mysql3306/
    $ mkdir -p /home/wumx/data/mysql3306/ 注意修改成用户名的文件

#### 2、下载安装包、解压

    $ cd /home/wumx/
    $ wget https://dev.mysql.com/get/Downloads/MySQL-5.7/mysql-5.7.22-linux-glibc2.12-x86_64.tar.gz

下载过慢TAT，用网线解决网速过慢的问题

    $ tar -xvf mysql-5.7.18-linux-glibc2.5-x86_64.tar.gz
    $ mv mysql-5.7.18-linux-glibc2.5-x86_64 mysql

#### 3、数据库初始化

    $ mkdir -p /home/wumx/mysql/logs/
    $  mysql/bin/mysqld --initialize --user=wumx --basedir=/home/wumx/mysql/ --datadir=/home/wumx/data/mysql3306
    $  mysql/bin/mysqld --initialize --user=wumx --basedir=/home/wumx/mysql/ --datadir=/home/wumx/data/mysql3306
得到初始密码：

    2017-09-19T01S20S48.741868Z 0 [Warning] TIMESTAMP with implicit
    DEFAULT value is deprecated. Please use --explicit_defaults_for_timestamp
    server option (see documentation for more details).
    2017-09-19T01S20S49.824120Z 0 [Warning] InnoDB: New log files created,
    LSN=45790
    2017-09-19T01S20S50.065674Z 0 [Warning] InnoDB: Creating foreign key
    constraint system tables.
    2017-09-19T01S20S50.141032Z 0 [Warning] No existing UUID has been found,
    so we assume that this is the first time that this server has been started.
    Generating a new UUID: c5ad09a5-9cd8-11e7-b0c5-fa163e4d4512.
    2017-09-19T01S20S50.158518Z 0 [Warning] Gtid table is not ready to be
    used. Table 'mysql.gtid_executed' cannot be opened.
    2017-09-19T01S20S50.159587Z 1 [Note] A temporary password is generated
    for root@localhost: wf>yf+i>m7lJ
初始化完成后，创建tmp和log文件：

    mkdir -p /home/wumx/mysql/logs
    mkdir -p /home/wumx/data/mysql3306/tmp

#### 4、配置⽂件修改
修改~/mysql/bin/mysqld_safe 文件中/usr/local 路径为⾃⼰mysql安装路径

    $ find ~/mysql/bin -name 'mysqld_safe' | xargs perl -pi -e 's|/usr/local/|/home/wumx/|g'
若find执行过后没有报错表明路径修改成功。

#### 5、⾃定义配置⽂件my.cnf

    $ mkdir -p mysql/cnf
    $ vim ~/mysql/cnf/my.cnf
注：配置⽂件中路径为⾃定义⽬录，且启动⽤户要对该⽬录有读写权限。
详⻅（附）my.cnf（注意配置文件端口号不要冲突了）
#### 6、创建启动脚本，脚本详⻅（附）my.cnf

    $ echo "export PATH=$PATH:/home/wumx/mysql/bin">>/home/wumx/.bash_profile
    $ source ~/.bash_profile
    $ mkdir -p ~/mysql/sbin
    $ vim ~/mysql/sbin/start-mysql.sh
    $ chmod +x start-mysql.sh
    $ vim ~/mysql/sbin/stop-mysql.sh
#### 7、启动、登录修改root⽤户密码

    $ ~/mysql/sbin/start-mysql.sh
    $ mysql -u root -p -S ~/mysql/logs/mysql.sock
输入初始化得到的密码： wf>yf+i>m7lJ

    mysql > SET PASSWORD FOR 'root'@'localhost' = PASSWORD('newpass');
    Query OK, 0 rows affected, 1 warning (0.00 sec)
    mysql> set password for 'root'@'localhost' = password('wumx123');
    Query OK, 0 rows affected, 1 warning (0.00 sec)
    mysql> flush privileges;
    Query OK, 0 rows affected (0.01 sec)

大功告成！

#### （附）配置⽂件和脚本

（1）my.cnf
--------------------------------my.cnf---------------------------------------

    [client]
    port = 3307
    socket = /home/wumx/mysql/logs/mysql.sock
    # The MySQL server
    [mysqld]
    # Basic
    port = 3306
    user = wumx
    basedir = /home/wumx/mysql
    datadir = /home/wumx/data/mysql3306
    tmpdir = /home/wumx/data/mysql3306/tmp
    socket = /home/wumx/mysql/logs/mysql.sock
    #log-bin = /home/wumx/mysql/logs/mysql-bin
    log-error = /home/wumx/mysql/logs/error.log
    slow-query-log-file = /home/wumx/mysql/logs/slow.log
    skip-external-locking
    skip-name-resolve
    log-slave-updates
    lower_case_table_names=1
    #skip-grant-tables
    ###############################
    # FOR Percona 5.6
    #extra_port = 3345
    gtid-mode = 0
    #thread_handling=pool-of-threads
    #thread_pool_oversubscribe=8
    explicit_defaults_for_timestamp
    ###############################
    server-id =53306
    character-set-server = utf8
    slow-query-log
    binlog_format = mixed
    max_binlog_size = 128M
    binlog_cache_size = 1M
    expire-logs-days = 5
    back_log = 500
    long_query_time=1
    max_connections=1100
    max_user_connections=1000
    max_connect_errors=1000
    wait_timeout=86400
    interactive_timeout=86400
    connect_timeout = 20
    slave-net-timeout=30
    max-relay-log-size = 256M
    relay-log = relay-bin
    transaction_isolation = READ-COMMITTED
    performance_schema=0
    #myisam_recover
    key_buffer_size = 64M
    max_allowed_packet = 16M
    #table_cache = 3096
    table_open_cache = 6144
    table_definition_cache = 4096
    sort_buffer_size = 128K
    read_buffer_size = 1M
    read_rnd_buffer_size = 1M
    join_buffer_size = 128K
    myisam_sort_buffer_size = 32M
    tmp_table_size = 32M
    max_heap_table_size = 64M
    query_cache_type=0
    query_cache_size = 0
    bulk_insert_buffer_size = 32M
    thread_cache_size = 64
    #thread_concurrency = 32
    thread_stack = 192K
    skip-slave-start
    # InnoDB
    innodb_data_home_dir = /home/wumx/data/mysql3306
    innodb_log_group_home_dir = /home/wumx/mysql/logs
    innodb_data_file_path = ibdata1S10M:autoextend
    innodb_buffer_pool_size = 100M
    innodb_buffer_pool_instances = 8
    #innodb_additional_mem_pool_size = 16M
    innodb_log_file_size = 200M
    innodb_log_buffer_size = 16M
    innodb_log_files_in_group = 3
    innodb_flush_log_at_trx_commit = 0
    innodb_lock_wait_timeout = 10
    innodb_sync_spin_loops = 40
    innodb_max_dirty_pages_pct = 90
    innodb_support_xa = 0
    innodb_thread_concurrency = 0
    innodb_thread_sleep_delay = 500
    innodb_concurrency_tickets = 1000
    log_bin_trust_function_creators = 1
    innodb_flush_method = O_DIRECT
    innodb_file_per_table
    innodb_read_io_threads = 16
    innodb_write_io_threads = 16
    innodb_io_capacity = 2000
    innodb_file_format = Barracuda
    innodb_purge_threads=1
    innodb_purge_batch_size = 32
    innodb_old_blocks_pct=75
    innodb_change_buffering=all
    innodb_stats_on_metadata=OFF
    [mysqldump]
    quick
    max_allowed_packet = 128M
    #myisam_max_sort_file_size = 10G
    [mysql]
    no-auto-rehash
    max_allowed_packet = 128M
    prompt = '(product)\u@\h [\d]> '
    default_character_set = utf8
    [myisamchk]
    key_buffer_size = 64M
    sort_buffer_size = 512k
    read_buffer = 2M
    write_buffer = 2M
    [mysqlhotcopy]
    interactive-timeout
    [mysqld_safe]
    #malloc-lib= /home/wumx/mysql/lib/mysql/libjemalloc.so
    sql_mode='NO_ENGINE_SUBSTITUTION'
-------------------------------------------------------------------------------------
（2）启动脚本
----------------------------start-mysql.sh---------------------------------------

    #!/bin/bash
    ###author:why
    ###20170919
    source /etc/init.d/functions
    BASE_DIR="/home/wumx"
    ${BASE_DIR}/mysql/bin/mysqld_safe --defaults-file=${BASE_DIR}/mysql/cnf/my.cnf --ledir=${BASE_DIR}/mysql/bin --
    user=mysql 2>&1 > /dev/null &
    if [ $? -eq 0 ]
    then
    action "Starting MySQL:" /bin/true
    else
    action "Starting MySQL:" /bin/false
    fi
---------------------------------------------------------------------------------------
（3）停⽌脚本
----------------------------------stop-mysql.sh------------------------------------

    #!/bin/sh
    ###author:why
    ###20170919
    source /etc/init.d/functions
    BASE_DIR="/home/wumx"
    USER=root
    PASSWD=wumx123
    ${BASE_DIR}/mysql/bin/mysqladmin -u$USER -p$PASSWD -S
    ${BASE_DIR}/mysql/logs/mysql.sock shutdown &>/dev/null
    if [ $? -eq 0 ]
    then
    action "Stopping MySQL:" /bin/true
    else
    action "Stopping MySQL:" /bin/false
    fi

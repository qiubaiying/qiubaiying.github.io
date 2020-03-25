---
title: Kubernetes常用命令
date: 2018-12-01 1:20:32
tags: k8s
---
### 通过docker-cli命令和kubectl命令进行对比学习，本文介绍的命令暂时还会比较简单，会逐步完善对各个命令的option的添加，其实可以通过--help自行学习。

#### 一，docker run 和 kubectl run
- 使用docker
```
$ docker run -d --restart=always -e DOMAIN=cluster --name nginx-app -p 80:80 nginx
a9ec34d9878748d2f33dc20cb25c714ff21da8d40558b45bfaec9955859075d0
$ docker ps
CONTAINER ID        IMAGE               COMMAND                CREATED             STATUS              PORTS                         NAMES
a9ec34d98787        nginx               nginx -g daemon of   2 seconds ago       Up 2 seconds        0.0.0.0:80->80/tcp, 443/tcp   nginx-app
```

- 使用kubectl
```
# start the pod running nginx
$ kubectl run --image=nginx nginx-app --port=80 --env="DOMAIN=cluster"
deployment "nginx-app" created
```
kubectl run 在Kubernetes集群> = v1.2上将创建名是 “nginx-app”的 Deployment。但是仅仅是kubeclt run这一步并没有达到暴露端口的效果，需要
```
# expose a port through with a service
$ kubectl expose deployment nginx-app --port=80 --name=nginx-http
service "nginx-http" exposed
```

#### 二，docker ps和kubectl get pods
- docker ps
```
$ docker ps
CONTAINER ID        IMAGE               COMMAND                CREATED             STATUS              PORTS                         NAMES
a9ec34d98787        nginx               nginx -g daemon of   About an hour ago   Up About an hour    0.0.0.0:80->80/tcp, 443/tcp   nginx-app
```

- kubectl get pods
```
$ kubectl get po
NAME              READY     STATUS    RESTARTS   AGE
nginx-app-5jyvm   1/1       Running   0          1h
```

#### 三，docker exec和kubectl exec

- docker exec
```
$ docker ps
CONTAINER ID        IMAGE               COMMAND                CREATED             STATUS              PORTS                         NAMES
a9ec34d98787        nginx               nginx -g daemon of   8 minutes ago       Up 8 minutes        0.0.0.0:80->80/tcp, 443/tcp   nginx-app
$ docker exec a9ec34d98787 cat /etc/hostname
a9ec34d98787
```
- kubectl exec 
```
$ kubectl get po
NAME              READY     STATUS    RESTARTS   AGE
nginx-app-5jyvm   1/1       Running   0          10m
$ kubectl exec nginx-app-5jyvm -- cat /etc/hostname
nginx-app-5jyvm
```
交互式命令
```
使用docker
$ docker exec -ti a9ec34d98787 /bin/sh
# exit
使用kubectl
$ kubectl exec -ti nginx-app-5jyvm -- /bin/sh      
# exit
```

#### 四，docker logs和kubectl logs查看container或pod日志

- docker logs
```
$ docker logs -f a9e
192.168.9.1 - - [14/Jul/2015:01:04:02 +0000] "GET / HTTP/1.1" 200 612 "-" "curl/7.35.0" "-"
192.168.9.1 - - [14/Jul/2015:01:04:03 +0000] "GET / HTTP/1.1" 200 612 "-" "curl/7.35.0" "-"
```

- kubectl logs
```
$ kubectl logs -f nginx-app-zibvs
10.240.63.110 - - [14/Jul/2015:01:09:01 +0000] "GET / HTTP/1.1" 200 612 "-" "curl/7.26.0" "-"
10.240.63.110 - - [14/Jul/2015:01:09:02 +0000] "GET / HTTP/1.1" 200 612 "-" "curl/7.26.0" "-"
```

#### 五，docker stop rm 和kubectl delete

- 使用docker
```
$ docker ps
CONTAINER ID        IMAGE               COMMAND                CREATED             STATUS              PORTS                         NAMES
a9ec34d98787        nginx               nginx -g daemon of   22 hours ago        Up 22 hours         0.0.0.0:80->80/tcp, 443/tcp   nginx-app
$ docker stop a9ec34d98787
a9ec34d98787
$ docker rm a9ec34d98787
a9ec34d98787
```

- 使用kubectl(kubectl直接删除pod，使用kubectl删除拥有该pod的Deployment。如果直接删除pod，则Deployment将会重新创建该pod。)
```
$ kubectl get deployment nginx-app
NAME        DESIRED   CURRENT   UP-TO-DATE   AVAILABLE   AGE
nginx-app   1         1         1            1           2m
$ kubectl get po -l run=nginx-app
NAME                         READY     STATUS    RESTARTS   AGE
nginx-app-2883164633-aklf7   1/1       Running   0          2m
$ kubectl delete deployment nginx-app
deployment "nginx-app" deleted
$ kubectl get po -l run=nginx-app
# Return nothing
```

#### 六，















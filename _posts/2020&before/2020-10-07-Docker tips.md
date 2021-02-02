---
layout:     post
title:      docker 基本操作
date:       2020-10-07
author:     Yukun SHANG
catalog: 	 true
tags:
    - Tools

---

# docker 基本操作

- create new container from image

```
docker run [image name/id]
```

- list all the containers

```
docker ps -a
```

- start container

```
docker start [container name/id]
```

- enter container

```
docker exec -it [container name/id] /bin/sh
```


If you are using docker on Ubuntu, the following command may be correct.

```
docker exec -it [container name/id] bash
```

- stop container

```
docker stop [container name/id]
```

- remove 

```
docker rm [container name/id]
```


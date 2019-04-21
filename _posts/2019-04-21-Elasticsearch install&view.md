---
layout:     post
title:      Elasticsearch的安装和查看
subtitle:   
author:     大暴马
catalog: 	 true
description: Elasticsearch安装和kibana的工具
tags:
    - ES
    - 开发
---

### 安装并运行 Elasticsearch

首先安装较新的版本的 Java，可以从 www.java.com 获得官方提供的最新版本的 Java。
然后从 <https://www.elastic.co/downloads/elasticsearch> 获取最新版本的 Elasticsearch


### 前台(foregroud)启动 Elasticsearch

```js
cd elasticsearch-<version>
./bin/elasticsearch  
```
如果想把 Elasticsearch 作为一个守护进程在后台运行，那么可以在后面添加参数 -d，即./bin/elasticsearch -d

测试 Elasticsearch 是否启动成功，可以打开另一个终端，执行以下操作：

curl 'http://localhost:9200/?pretty'

应该得到和下面类似的响应：

```json
{
  "name" : "Tom Foster",
  "cluster_name" : "elasticsearch",
  "version" : {
    "number" : "2.1.0",
    "build_hash" : "72cd1f1a3eee09505e036106146dc1949dc5dc87",
    "build_timestamp" : "2015-11-18T22:40:03Z",
    "build_snapshot" : false,
    "lucene_version" : "5.3.1"
  },
  "tagline" : "You Know, for Search"
}
```

这就意味着你现在已经启动并运行一个 Elasticsearch 节点了，你可以用它做实验了。 
单个 节点 可以作为一个运行中的 Elasticsearch 的实例。 
而一个 集群 是一组拥有相同 cluster.name 的节点， 他们能一起工作并共享数据，还提供容错与可伸缩性。
(当然，一个单独的节点也可以组成一个集群) 你可以在 elasticsearch.yml 配置文件中 修改 cluster.name ，
该文件会在节点启动时加载 (译者注：这个重启服务后才会生效)。 
关于上面的 cluster.name 以及其它 [重要配置更改](https://elasticsearch.cn/book/elasticsearch_definitive_guide_2.x/important-configuration-changes.html) 信息， 

当 Elastcisearch 在前台运行时，你可以通过按 Ctrl+C 去停止。

### 安装 Sense
Sense 是一个 Kibana 应用 它提供交互式的控制台，通过你的浏览器直接向 Elasticsearch 提交请求。
安装与运行 Sense：
1. 在 Kibana 目录下运行下面的命令，下载并安装 Sense app：
```shell
./bin/kibana plugin --install elastic/sense 
```
2. 启动 Kibana
```shell
./bin/kibana
```
3. 在你的浏览器中打开 Sense
  访问 <http://localhost:5601/app/sense>

### 微信扫一下，最新最全最好看的电影都有，谢谢了~
 ![](https://open.weixin.qq.com/qr/code?username=zhihuishangye)
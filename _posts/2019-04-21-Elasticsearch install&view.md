---
layout:     post
title:      Elasticsearch安装、查看和交互
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

### 和 Elasticsearch 交互

#### JAVA API
如果你正在使用 Java，在代码中你可以使用 Elasticsearch 内置的两个客户端：

1. 节点客户端（Node client）
节点客户端作为一个非数据节点加入到本地集群中。换句话说，它本身不保存任何数据，但是它知道数据在集群中的哪个节点中，并且可以把请求转发到正确的节点。
2. 传输客户端（Transport client）
轻量级的传输客户端可以可以将请求发送到远程集群。它本身不加入集群，但是它可以将请求转发到集群中的一个节点上。

两个 Java 客户端都是通过 9300 端口并使用本地 Elasticsearch 传输 协议和集群交互。
集群中的节点通过端口 9300 彼此通信。如果这个端口没有打开，节点将无法形成一个集群。

Java 客户端作为节点必须和 Elasticsearch 有相同的 主要 版本；否则，它们之前将无法互相理解。

[JAVA API文档](https://www.elastic.co/guide/en/elasticsearch/client/java-api/current/index.html)
里面包含了document操作、search、Aggregation(聚合)、Query DSL(通用的查询框架，专注于通过Java API构建类型安全的SQL查询)、Java API Administration

#### JAVA rest client
<JAVA rest client文档>(https://www.elastic.co/guide/en/elasticsearch/client/java-rest/current/index.html)
分成

<details>
<summary>Java Low Level REST Client</summary>
minimal dependencies
load balancing across all available nodes
failover in case of node failures and upon specific response codes
failed connection penalization (whether a failed node is retried depends on how many consecutive times it failed; the more failed attempts the longer the client will wait before trying that same node again)
persistent connections
trace logging of requests and responses
optional automatic discovery of cluster nodes
</details>

和

<details>
<summary>Java High Level REST Client</summary>
The Java High Level REST Client works on top of the Java Low Level REST client. Its main goal is to expose API specific methods, that accept request objects as an argument and return response objects, so that request marshalling and response un-marshalling is handled by the client itself.

Each API can be called synchronously or asynchronously. The synchronous methods return a response object, while the asynchronous methods, whose names end with the async suffix, require a listener argument that is notified (on the thread pool managed by the low level client) once a response or an error is received.

The Java High Level REST Client depends on the Elasticsearch core project. It accepts the same request arguments as the TransportClient and returns the same response objects.
</details>

#### RESTful API with JSON over HTTP
所有其他语言可以使用 RESTful API 通过端口 9200 和 Elasticsearch 进行通信。其实各个语言的客户端，都是RESTful API的封装而已。
一个 Elasticsearch 请求和任何 HTTP 请求一样由若干相同的部件组成：
```sh
curl -X<VERB> '<PROTOCOL>://<HOST>:<PORT>/<PATH>?<QUERY_STRING>' -d '<BODY>'
```

  part|说明
 ----|----
VERB|适当的 HTTP 方法 或 谓词 : `GET`、 `POST`、 `PUT`、 `HEAD` 或者 `DELETE`
PROTOCOL | http 或者 https（如果你在 Elasticsearch 前面有一个https代理）
HOST|Elasticsearch 集群中任意节点的主机名，或者用 localhost 代表本地机器上的节点。
PORT|运行 Elasticsearch HTTP 服务的端口号，默认是 9200 。
PATH|API 的终端路径（例如 _count 将返回集群中文档数量）。Path 可能包含多个组件，例如：_cluster/stats 和 _nodes/stats/jvm 。
QUERY_STRING|任意可选的查询字符串参数 (例如 ?pretty 将格式化地输出 JSON 返回值，使其更容易阅读)
BODY|一个 JSON 格式的请求体 (如果请求需要的话)

 
 例如，计算集群中文档的数量，我们可以用这个:
 ```shell
 curl -i -XGET 'http://localhost:9200/_count?pretty' -d ' //-i表示显示header
 {
     "query": {
         "match_all": {}
     }
 }
 '
 
 //返回值如下
 {
     "count" : 0,
     "_shards" : {
         "total" : 5,
         "successful" : 5,
         "failed" : 0
     }
 }
 ```
 
### 微信扫一下，最新最全最好看的电影都有，谢谢了~
 ![](https://open.weixin.qq.com/qr/code?username=zhihuishangye)
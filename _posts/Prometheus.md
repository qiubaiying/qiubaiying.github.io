---
title: Prometheus On Kubernetes
date: 2018-09-19 20:03:50
tags: k8s
---
<font face="STCAIYUN">我是短小精悍的分割线(๑•̀ㅂ•́)ﻭ✧-------------------------------------------------------------------------------------(๑•̀ㅂ•́)ﻭ✧-</font>

### Prometheus简介
&nbsp;
Prometheus是由 SoundCloud 开发的开源监控报警系统和时序列数据库(TSDB).自2012年起,许多公司及组织已经采用 Prometheus,并且该项目有着非常活跃的开发者和用户社区.现在已经成为一个独立的开源项目。Prometheus 在2016加入 CNCF(Cloud Native Computing Foundation),作为在kubernetes之后的第二个由基金会主持的项目。 Prometheus的实现参考了Google内部的监控实现，与源自Google的Kubernetes结合起来非常合适，很多理念与 Google SRE 运维之道不谋而合。另外相比influxdb的方案，性能更加突出，而且还内置了
报警功能。它针对大规模的集群环境设计了拉取式的数据采集方式，只需要在应用里面实现一个metrics接口，然后把这个接口告诉Prometheus就可以完成数据采集。上图:  
![prometheus.png](Prometheus/prometheus.png)
&nbsp;

### 在k8s中使用到的组件及各组件作用

| 组件名称      | 作用                                                      |
| ------------- |:---------------------------------------------------------:|
| node-exporter | 负责收集节点上的metrics监控数据，并将数据推送给prometheus |
| prometheus    | 负责存储这些数据                                          |
| grafana       | 将数据通过网页以图形的形式展现给用户                      |          
&nbsp;

### 主要功能
- 多维 数据模型（时序由 metric 名字和 k/v 的 labels 构成）。
- 灵活的查询语句（PromQL）。
- 无依赖存储，支持 local 和 remote 不同模型。
- 采用 http 协议，使用 pull 模式，拉取数据，简单易懂。
- 监控目标，可以采用服务发现或静态配置的方式。
- 支持多种统计数据模型，图形化友好。

>__以上来源于网络__

&nbsp;
### 一，环境介绍
* 操作系统：CentOS Linux release 7.5.1804 (Core)
* 内核版本：3.10.0-862.11.6.el7.x86_64
* Docker版本：17.03.2-ce
* k8s版本：v1.10.0
* k8s集群：3个master 3个etcd 3个node （kubeadm部署，网络使用flannel-v0.10.0-amd64）
&nbsp;
### 二，所需image，我放到了Dockerhub。
```
docker pull nianshenlovelily/node-exporter:1.0
docker pull nianshenlovelily/prometheus:v2.0.0
docker pull nianshenlovelily/grafana:4.2.0

PS:可以先用一台服务器pull下来，打好tag，然后push到自己的私有仓库中，这样deploy的时候速度更快。
```
&nbsp;
### 三，部署rbac
> rbac基于角色的访问控制,具体的解释可以看净超哥的Blog,我的友链里有三个前同事大佬的Blog大家可以关注一下。
  https://jimmysong.io/kubernetes-handbook/guide/rbac.html

```
vim rbac.yaml

---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: prometheus
  namespace: kube-system
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: prometheus
rules:
- apiGroups: [""]
  resources:
  - nodes
  - nodes/proxy
  - services
  - endpoints
  - pods
  verbs: ["get", "list", "watch"]
- apiGroups:
  - extensions
  resources:
  - ingresses
  verbs: ["get", "list", "watch"]
- nonResourceURLs: ["/metrics"]
  verbs: ["get"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: prometheus
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: prometheus
subjects:
- kind: ServiceAccount
  name: prometheus
  namespace: kube-system
```
#### 通过上述文件创建rbac
```
kubectl apply -f rbac.yaml
```
&nbsp;
### 四，daemonset方式部署node-exporter
&nbsp;
> Why daemonset Not deployment
>> Deployment 部署的副本 Pod 会分布在各个 Node 上，每个 Node 都可能运行好几个副本。DaemonSet 的不同之处在于：每个 Node 上最多只能运行一个副本。
&nbsp;
> 主要区别：
>> * The scalability is much better when using a Deployment, because you will have a Single-Pod-per-Node model when using the DaemonSet.
>> * It is possible to exclusively run a Service on a dedicated set of machines using taints and tolerations with a DaemonSet.
>> * On the other hand the DaemonSet allows you to access any Node directly on Port 80 and 443, where you have to setup a Service object with a Deployment.
&nbsp;
> DaemonSet的典型应用场景有：
>> - 在集群的每个节点上运行存储 Daemon，比如 glusterd 或 ceph。
>> - 在每个节点上运行日志收集 Daemon，比如 flunentd 或 logstash。
>> - 在每个节点上运行监控 Daemon，比如 Prometheus Node Exporter 或 collectd。

&nbsp;
```
vim node-exporter.yaml

---
apiVersion: extensions/v1beta1
kind: DaemonSet
metadata:
  name: node-exporter
  namespace: kube-system #部署到kube-system这个namespace中
  labels:
    k8s-app: node-exporter
spec:
  template:
    metadata:
      labels:
        k8s-app: node-exporter
    spec:
      containers:
      - image: nianshenlovelily/node-exporter:1.0 #自己选择从哪里pull镜像,推荐放到自己的私有Harbor镜像仓库中，这样pull的最快。
        name: node-exporter
        ports:
        - containerPort: 9100
          protocol: TCP
          name: http
---
apiVersion: v1
kind: Service
metadata:
  labels:
    k8s-app: node-exporter
  name: node-exporter
  namespace: kube-system
spec:
  ports:
  - name: http
    port: 9100
    nodePort: 31672
    protocol: TCP
  type: NodePort 
  selector:
    k8s-app: node-exporter
```
#### 通过上述文件创建pod和service
```
kubectl apply -f node-exporter.yaml
```
&nbsp;

### 五，创建configmap将prometheus组件的配置文件外挂出来
&nbsp;
> 可参考官方文档https://prometheus.io/docs/prometheus/latest/configuration/configuration/

```
vim prometheus-configmap.yaml

apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: kube-system
data:
  prometheus.yml: |
    global:
      scrape_interval:     15s
      evaluation_interval: 15s
    scrape_configs:

    - job_name: 'kubernetes-apiservers'
      kubernetes_sd_configs:
      - role: endpoints
      scheme: https
      tls_config:
        ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
      bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token
      relabel_configs:
      - source_labels: [__meta_kubernetes_namespace, __meta_kubernetes_service_name, __meta_kubernetes_endpoint_port_name]
        action: keep
        regex: default;kubernetes;https

    - job_name: 'kubernetes-nodes'
      kubernetes_sd_configs:
      - role: node
      scheme: https
      tls_config:
        ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
      bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token
      relabel_configs:
      - action: labelmap
        regex: __meta_kubernetes_node_label_(.+)
      - target_label: __address__
        replacement: kubernetes.default.svc:443
      - source_labels: [__meta_kubernetes_node_name]
        regex: (.+)
        target_label: __metrics_path__
        replacement: /api/v1/nodes/${1}/proxy/metrics

    - job_name: 'kubernetes-cadvisor'
      kubernetes_sd_configs:
      - role: node
      scheme: https
      tls_config:
        ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
      bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token
      relabel_configs:
      - action: labelmap
        regex: __meta_kubernetes_node_label_(.+)
      - target_label: __address__
        replacement: kubernetes.default.svc:443
      - source_labels: [__meta_kubernetes_node_name]
        regex: (.+)
        target_label: __metrics_path__
        replacement: /api/v1/nodes/${1}/proxy/metrics/cadvisor

    - job_name: 'kubernetes-service-endpoints'
      kubernetes_sd_configs:
      - role: endpoints
      relabel_configs:
      - source_labels: [__meta_kubernetes_service_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      - source_labels: [__meta_kubernetes_service_annotation_prometheus_io_scheme]
        action: replace
        target_label: __scheme__
        regex: (https?)
      - source_labels: [__meta_kubernetes_service_annotation_prometheus_io_path]
        action: replace
        target_label: __metrics_path__
        regex: (.+)
      - source_labels: [__address__, __meta_kubernetes_service_annotation_prometheus_io_port]
        action: replace
        target_label: __address__
        regex: ([^:]+)(?::\d+)?;(\d+)
        replacement: $1:$2
      - action: labelmap
        regex: __meta_kubernetes_service_label_(.+)
      - source_labels: [__meta_kubernetes_namespace]
        action: replace
        target_label: kubernetes_namespace
      - source_labels: [__meta_kubernetes_service_name]
        action: replace
        target_label: kubernetes_name

    - job_name: 'kubernetes-services'
      kubernetes_sd_configs:
      - role: service
      metrics_path: /probe
      params:
        module: [http_2xx]
      relabel_configs:
      - source_labels: [__meta_kubernetes_service_annotation_prometheus_io_probe]
        action: keep
        regex: true
      - source_labels: [__address__]
        target_label: __param_target
      - target_label: __address__
        replacement: blackbox-exporter.example.com:9115
      - source_labels: [__param_target]
        target_label: instance
      - action: labelmap
        regex: __meta_kubernetes_service_label_(.+)
      - source_labels: [__meta_kubernetes_namespace]
        target_label: kubernetes_namespace
      - source_labels: [__meta_kubernetes_service_name]
        target_label: kubernetes_name

    - job_name: 'kubernetes-ingresses'
      kubernetes_sd_configs:
      - role: ingress
      relabel_configs:
      - source_labels: [__meta_kubernetes_ingress_annotation_prometheus_io_probe]
        action: keep
        regex: true
      - source_labels: [__meta_kubernetes_ingress_scheme,__address__,__meta_kubernetes_ingress_path]
        regex: (.+);(.+);(.+)
        replacement: ${1}://${2}${3}
        target_label: __param_target
      - target_label: __address__
        replacement: blackbox-exporter.example.com:9115
      - source_labels: [__param_target]
        target_label: instance
      - action: labelmap
        regex: __meta_kubernetes_ingress_label_(.+)
      - source_labels: [__meta_kubernetes_namespace]
        target_label: kubernetes_namespace
      - source_labels: [__meta_kubernetes_ingress_name]
        target_label: kubernetes_name

    - job_name: 'kubernetes-pods'
      kubernetes_sd_configs:
      - role: pod
      relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
        action: replace
        target_label: __metrics_path__
        regex: (.+)
      - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
        action: replace
        regex: ([^:]+)(?::\d+)?;(\d+)
        replacement: $1:$2
        target_label: __address__
      - action: labelmap
        regex: __meta_kubernetes_pod_label_(.+)
      - source_labels: [__meta_kubernetes_namespace]
        action: replace
        target_label: kubernetes_namespace
      - source_labels: [__meta_kubernetes_pod_name]
        action: replace
        target_label: kubernetes_pod_name
```
#### 通过上述文件创建configmap
```
kubectl apply -f prometheus-configmap.yaml
```
&nbsp;
### 六，创建prometheus-deployment-svc.yaml文件部署prometheus pod和svc
&nbsp;

```
vim prometheus-deployment-svc.yaml

---
apiVersion: apps/v1beta1
kind: Deployment
metadata:
  labels:
    name: prometheus-deployment
  name: prometheus
  namespace: kube-system
spec:
  replicas: 1
  selector:
    matchLabels:
      app: prometheus
  template:
    metadata:
      labels:
        app: prometheus
    spec:
      containers:
      - image: nianshenlovelily/prometheus:v2.0.0
        name: prometheus
        command:
        - "/bin/prometheus"
        args:
        - "--config.file=/etc/prometheus/prometheus.yml"
        - "--storage.tsdb.path=/prometheus"
        - "--storage.tsdb.retention=24h"
        ports:
        - containerPort: 9090
          protocol: TCP
        volumeMounts:
        - mountPath: "/prometheus"
          name: data
        - mountPath: "/etc/prometheus"
          name: config-volume
        resources:
          requests:
            cpu: 900m
            memory: 1000Mi
          limits:
            cpu: 999m
            memory: 2500Mi
      serviceAccountName: prometheus    
      volumes:
      - name: data
        emptyDir: {}   #目前申请的机器的磁盘空间有点小，没有做数据持久化，之后申请新的磁盘后会做，我目前使用GlusterFS做持久化存储。
      - name: config-volume
        configMap:
          name: prometheus-config
---
kind: Service
apiVersion: v1
metadata:
  labels:
    app: prometheus
  name: prometheus
  namespace: kube-system
spec:
  type: NodePort
  ports:
  - port: 9090
    targetPort: 9090
    nodePort: 30008
  selector:
    app: prometheus
```
#### 通过上述文件创建prometheus的pod和svc
```
kubectl apply -f prometheus-deployment-svc.yaml
```
&nbsp;

### 七，做一下验证
&nbsp;
> 1.查看一下我们刚才创建的资源
```
kubectl get svc,pod -n kube-system  -o wide
```
![get.png](Prometheus/get.png)
&nbsp;
> 2.node-exporter对应的nodeport端口为31672，通过访问http://$IP:31672/metrics 可以看到对应的metrics，$IP就是你的集群内主机的IP地址，如我访问的就是http://172.18.130.33:31672/metrics

![metrics.png](Prometheus/metrics.png)
&nbsp;
> 3.prometheus对应的nodeport是30008，通过访问http://172.18.130.34:30008/targets 因为我的prometheus pod 调度到了我的node2上，所以我使用node2的ip：port来访问，可以看到prometheus已经成功连接上了k8s的apiserver

![pro.png](Prometheus/pro.png)
&nbsp;
> 4.prometheus的UI界面上提供了查询K8S集群中每个POD的MEM使用情况，查询条件如下：(更多的metrics可以参考ui上的-insert metric at cursor- 根据需求自定义即可。)
```
sum by (pod_name)( rate(container_memory_usage_bytes{image!="", pod_name!=""}[1m] ) )
```

![mem.png](Prometheus/mem.png)
&nbsp;
> 5.在prometheus的webui上查询到了数据，说明我们的node-exporter可以正常向prometheus中写入数据，如果不能写入数据可以查看node-exporter或者prometheus的pod的日志定位问题，但是prometheus原生的ui个人感觉不够好看（手动少女心），网上一些云原生的项目都是用prometheus+grafana，接下来我们部署grafana。

&nbsp;

### 八，通过grafana-deployment-svc.yaml部署grafana的pod和svc
```
vim grafana-deployment-svc.yaml

apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: grafana-core
  namespace: kube-system
  labels:
    app: grafana
    component: core
spec:
  replicas: 1
  template:
    metadata:
      labels:
        app: grafana
        component: core
    spec:
      containers:
      - image: nianshenlovelily/grafana:4.2.0
        name: grafana-core
        imagePullPolicy: IfNotPresent
        resources:
          limits:
            cpu: 100m
            memory: 100Mi
          requests:
            cpu: 100m
            memory: 100Mi
        env:
          - name: GF_AUTH_BASIC_ENABLED
            value: "true"
          - name: GF_AUTH_ANONYMOUS_ENABLED
            value: "false"
        readinessProbe:
          httpGet:
            path: /login
            port: 3000
        volumeMounts:
        - name: grafana-persistent-storage
          mountPath: /var
      volumes:
      - name: grafana-persistent-storage
        emptyDir: {}
---
apiVersion: v1
kind: Service
metadata:
  name: grafana
  namespace: kube-system
  labels:
    app: grafana
    component: core
spec:
  type: NodePort
  ports:
    - port: 3000
  selector:
    app: grafana
    component: core
```
#### 通过上述文件创建grafana的pod和svc
```
kubectl apply -f grafana-deployment-svc.yaml
```
&nbsp;
#### 配置和使用
- 查看pod和svc的状态
```
kubectl get pod,svc -n kube-system -o wide
```
![grafana.png](Prometheus/grafana.png)

- 登陆webui
> 查看自己的pod调度到哪个node上和映射的port是什么，之后我会通过traefik配置域名，先通过ip:port的方式访问，我的是http://172.18.130.35:31350/login 默认的用户名密码admin/admin

![grafanaui.png](Prometheus/grafanaui.png)

- 配置数据源为prometheus

![database.png](Prometheus/database.png)

- 导入面板315

![import.png](Prometheus/import.png)

- 界面确实很漂亮

![use.png](Prometheus/use.png)

### 通过traefik配置域名(之后会总结部署traefik的文章，traefik的网络性能并不是很好且不支持TCP/UDP，好的地方就是带一个ui比较好看)

```
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
   name: grafana
   namespace: kube-system
spec:
   rules:
   - host: k8s-grafana.nianshenlovelily.cn
     http:
       paths:
       - path: /
         backend:
          serviceName: grafana
          servicePort: 3000
```
* 附一张traefik的ui图
![traefik.png](Prometheus/traefik.png)

+ 后续要做的工作
  - Prometheus的数据持久化
  - Grafana Alerting

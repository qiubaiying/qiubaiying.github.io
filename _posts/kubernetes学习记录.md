---
title: k8s learning record
date: 2018-11-12 20:00:10
tags: k8s
---
![abc.jpg](kubernetes学习记录/abc.jpg)
* PS:其实我挺希望看到这一天的。Kubernetes已烂大街，西二旗的地铁上随手都能碰到会Kubernetes的人，各种CKA培训广告不需要用所谓的“8节课涨薪20万”这样的噱头。这篇文章主要介绍的k8s的核心概念和落地实践中逐渐总结起来的，之后随着使用的更加深入和业务的需求会逐渐更新，想记录下来的东西有很多想继续研究下去的东西也有很多，比如istio，Envoy。想要使用k8s，必须要对k8s的各个组件有个大致的了解，如果不知道k8s的几个核心概念很难使用k8s集群去部署管理自己的应用。
### 学习k8s的原因
因为 Kubernetes 太热门了。2017 年 9 月，Mesosphere 宣布 支持 Kubernetes；10 月，Docker 宣布将在新版本中加入对 Kubernetes 的原生支持。至此，容器编排引擎领域的三足鼎立时代结束，Kubernetes 赢得全面胜利。其实早在 2015 年 5 月，Kubernetes 在 Google 上的的搜索热度就已经超过了 Mesos 和 Docker Swarm，从那儿之后更是一路飙升，将对手甩开了十几条街。目前，AWS、Azure、Google、阿里云、腾讯云等主流公有云提供的是基于 Kubernetes 的容器服务；Rancher、CoreOS、IBM、Mirantis、Oracle、Red Hat、VMWare 等无数厂商也在大力研发和推广基于 Kubernetes 的容器 CaaS 或 PaaS 产品。可以说，Kubernetes 是当前容器行业最炙手可热的明星。每一轮新技术的兴起，无论对公司还是个人既是机会也是挑战。如果这项新技术未来必将成为主流，那么作为 IT 从业者，正确的做法就尽快掌握。

* 新技术意味着新的市场和新的需求。初期掌握这种技术的人不会很多，而市场需求会越来越大，因而会形成供不应求的卖方市场，物以稀为贵，这对技术人员将是一个难得的价值提升机会。
* 学习新技术需要时间和精力，早起步早成材。

### 了解Kubernetes集群是什么。
Kubernetes将底层的计算资源连接在一起对外体现为一个高可用的计算机集群。Kubernetes将资源高度抽象化，允许将容器化的应用程序部署到集群中。为了使用这种新的部署模型，需要将应用程序和使用环境一起打包成容器。与过去的部署模型相比，容器化的应用程序更加灵活和可用，在新的部署模型中，应用程序被直接安装到特定的机器上，Kubernetes能够以更高效的方式在集群中实现容器的分发和调度运行。Kubernetes上部署应用程序时，会先通知master启动容器中的应用程序，master调度容器以在集群的节点上运行，node节点使用master公开的Kubernetes API与主节点进行通信。最终用户还可以直接使用Kubernetes API与集群进行交互。

### 有关k8s几个架构方面的说明
1.Kubernetes Cluster由Master和Node组成，节点上运行着若干Kubernetes服务，下图为我的k8s集群的架构图：
![k8s.png](kubernetes学习记录/k8s.png)
&nbsp;


* Master 是KubernetesCluster的大脑，运行着如下Daemon服务：kube-apiserver、kube-scheduler、kube-controller-manager、etcd和Pod网络（例如 flannel,calico）。
![master.png](kubernetes学习记录/master.png)

1. APIServer 提供HTTP/HTTPS RESTful API，即KubernetesAPI。API Server是KubernetesCluster的前端接口，提供了资源操作的唯一入口，并提供认证、授权、访问控制、API注册和发现等机制，各种客户端工具（CLI 或 UI）以及Kubernetes其他组件可以通过它管理Cluster的各种资源。
2. Scheduler 负责决定将Pod放在哪个Node上运行。Scheduler在调度时会充分考虑Cluster的拓扑结构，当前各个节点的负载，以及应用对高可用、性能、数据亲和性的需求。
3. Controller Manager 负责管理Cluster各种资源，保证资源处于预期的状态，负责维护集群的状态，比如故障检测、自动扩展、滚动更新等。Controller Manager由多种controller组成，包括 replication controller、endpoints controller、namespace controller、serviceaccounts controller等。
4. etcd 保存 Kubernetes Cluster 的配置信息和各种资源的状态信息。当数据发生变化时，etcd 会快速地通知 Kubernetes 相关组件。
5. pod网络，k8s cluster的集群网络我个人觉得是k8s中最难理解最难操作部分，Pod要能够相互通信，K8s Cluster必须部署Pod网络，flannel是其中一个可选方案，flannel的网络性能相较于calico比较差，有打算替换flannel网络到calico，因为我的集群使用的是kubeadm安装的，所以之后会研究kubeadm安装的集群如何替换当前的网络方案。
&nbsp;

* Node 是Pod运行的地方，也是真正的工作节点，类似于openstack中的Nova Compute, Kubernetes支持Docker、rkt等容器Runtime。 Node上运行的Kubernetes组件有kubelet、kube-proxy和Pod网络（例如 flannel）。
![node.png](kubernetes学习记录/node.png)
1. kubelet 是Node的agent，当Scheduler确定在某个Node上运行Pod后，会将Pod的具体配置信息（image、volume 等）发送给该节点的kubelet，kubelet根据这些信息创建和运行容器，并向Master报告运行状态。
2. kube-proxy service在逻辑上代表了后端的多个Pod，外界通过service访问Pod。service接收到的请求转发到pod就是通过kube-proxy完成的。每个Node都会运行kube-proxy服务，它负责将访问service的TCP/UPD数据流量转发到后端的容器。如果有多个副本，kube-proxy会实现负载均衡。
3. Pod 要能够相互通信，Kubernetes Cluster必须部署Pod网络，flannel是其中的一种。网络是个大问题，需要深入的研究一下！！！
&nbsp;

* 我测试集群的一张图
可以发现在master节点上上也run有kubelet和kube-proxy的pod，这是因为 Master上也可以运行应用，即Master同时也是一个Node。几乎所有的 Kubernetes组件本身也运行在Pod里，kubelet除外，执行如下命令：
```
kubectl get pod -n kube-system -o wide
```
![pod.png](kubernetes学习记录/pod.png)
&nbsp;

### 了解几个核心的概念（实际上kubernetes实用性的概念还有很多，可能每个名词都能够解释很久，而且这些理论性上的东西还有很多想要深入了解需要学习的东西还有很多。
* Cluster：Cluster 是计算、存储和网络资源的集合，Kubernetes 利用这些资源运行各种基于容器的应用。
* Master节点：集群的大脑，协调控制管理整个集群，协调集群中的所有行为/活动，例如应用的运行、修改、更新等。为了实现高可用，可以运行多个 Master。
* Nodes节点：运行应用的工作节点。可以是VM虚拟机、物理机。每个node上都有一个Kubelet，用于管理node节点与Kubernetes Master通信。每个Node节点上至少还要运行container runtime（比如docker或者rkt）。Node 由 Master 管理，Node 负责监控并汇报容器的             状态，并根据 Master 的要求管理容器的生命周期。
* Pod之后会越来越多的听到这个词，Pod是Kubernetes的最小工作单元。每个Pod包含一个或多个容器。Pod 中的容器会作为一个整体被Master调度到一个Node上运行。
  k8s引入pod的概念出于2个考虑：
 （1）可管理性。有些容器天生就是需要紧密联系，一起工作。Pod 提供了比容器更高层次的抽象，将它们封装到一个部署单元中。Kubernetes 以 Pod 为最小单位进行调度、扩展、共享资源、管理生命周期。
 （2）通信和资源共享。Pod中的所有容器使用同一个网络namespace，即相同的IP地址和Port空间。它们可以直接用localhost通信。同样的，这些容器可以共享存储，当Kubernetes挂载volume到Pod，本质上是将volume挂载到Pod中的每一个容器。
  Pods有两种使用方式：
 （1）运行单一容器。one-container-per-Pod是Kubernetes最常见的模型，这种情况下，只是将单个容器简单封装成Pod。即便是只有一个容器，Kubernetes管理的也是Pod而不是直接管理容器.
 （2）运行多个容器。但问题在于哪些容器应该放到一个 Pod 中？ 答案是：这些容器联系必须非常紧密，而且需要直接共享资源。
* Controller：Kubernetes通常不会直接创建Pod，而是通过Controller来管理Pod的。Controller中定义了Pod的部署特性，比如有几个replicas，在什么样的Node上运行等。为了满足不同的业务场景，k8s提供了多种Controller，包括Deployment、ReplicaSet、DaemonS  et、StatefuleSet、Job等。
 （1）Deployment是最常用的Controller，可以通过kubectl get deployment -n namespace来查看某个ns下的deployment。Deployment可以管理Pod的多个副本，并确保Pod按照期望的状态运行。
 （2）ReplicaSet实现了Pod的多副本管理。使用Deployment时会自动创建ReplicaSet，也就是说Deployment是通过ReplicaSet来管理Pod的多个副本，通常不需要直接使用ReplicaSet。
 （3）DaemonSet用于每个Node最多只运行一个 Pod 副本的场景。正如其名称所揭示的，DaemonSet通常用于运行daemon。比如我们的Prometheus通过node-exporter收集各个node上pod的资源占用信息时，node-exporter就是通过DaemonSet启动的，还有EFK中的fluentd。
 （4）StatefuleSet能够保证Pod的每个副本在整个生命周期中名称是不变的。而其他Controller不提供这个功能，当某个Pod发生故障需要删除并重新启动时，Pod的名称会发生变化。同时StatefuleSet会保证副本按照固定的顺序启动、更新或者删除。在启动有状态的服      务时，我们通常会用到StatefuleSet，如rabbitmq cluster，zookeeper cluster等。
 （5）Job用于运行结束就删除的应用。而其他Controller中的Pod通常是长期持续运行。
* Service：每个deployment如果定义了多个replicas则会会启动多个pod，每个pod都有一个ip地址，且随着pod的重启，销毁，启动，pod的ip地址是在不断变化的，通过pod的ip地址来访问应用显然是不现实的。Kubernetes Service定义了外界访问一组特定Pod的方式。           service有自己的IP和端口，service为Pod提供了负载均衡。RC、RS和Deployment只是保证了支撑服务的微服务Pod的数量(pod的高可用)，但是没有解决如何访问这些服务的问题。一个Pod只是一个运行服务的实例，随时可能在一个节点上停止，在另一个节点           以一个新的IP启动一个新的Pod，因此不能以确定的IP和端口号提供服务。要稳定地提供服务需要服务发现和负载均衡能力。服务发现完成的工作，是针对客户端访问的服务，找到对应的的后端服务实例。在K8s集群中，客户端需要访问的服务就是Service对            象。每个Service会对应一个集群内部有效的虚拟IP，集群内部通过虚拟IP访问一个服务。在Kubernetes集群中微服务的负载均衡是由Kube-proxy实现的。Kube-proxy是Kubernetes集群内部的负载均衡器。它是一个分布式代理服务器，在Kubernetes的每个节            点上都有一个；这一设计体现了它的伸缩性优势，需要访问服务的节点越多，提供负载均衡能力的Kube-proxy就越多，高可用节点也随之增多。与之相比，我们平时在服务器端做个反向代理做负载均衡，还要进一步解决反向代理的负载均衡和高可用问题。
* Namespace：如果有多个用户或项目组使用同一个k8s集群，为了避免互相干扰，如何将他们创建的Controller、Pod等资源分开？Namespace可以将一个物理的Cluster逻辑上划分成多个虚拟Cluster，每个逻辑上的Cluster就是一个Namespace。不同Namespace里的资源是             完全隔离。Kubernetes集群初始有两个命名空间，分别是默认命名空间default和系统命名空间kube-system。

### 通过一个例子理解各个组件间的协作
* 启动pod，并设置副本数为2.
```
kubectl run httpd-app --image=httpd --replicas=2
```
![create.png](kubernetes学习记录/create.png)

* 将pod中启动的apache服务暴露到集群内部，使集群内部可以访问
![svc.png](kubernetes学习记录/svc.png)

Kubernetes部署了deployment httpd-app，有两个副本Pod，分别运行在node2和node3。
1. kubectl发送部署请求到API Server。
2. API Server通知Controller Manager创建一个deployment资源。
3. Scheduler执行调度任务，将两个副本Pod分发到k8s-node2和k8s-node3。
4. k8s-node1和k8s-node2上的kubectl在各自的节点上创建并运行Pod。
5. 应用的配置和当前状态信息保存在etcd中，执行kubectl get pod 时 API Server会从etcd中读取这些数据。

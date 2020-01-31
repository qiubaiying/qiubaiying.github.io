---
layout:     post
title:      embedding技术总结
subtitle:   embedding
date:       2020-01-21
author:     ZhangWenXiang
header-img: img/bg-ai-dark1.jpeg
catalog: true
tags:
    - embedding
    - graph embedding
    - 深度学习
---  

# embedding技术总结

## 一、MF类模型
1. MF https://www.zhihu.com/question/268848413/answer/351881184
2. PMF
3. BPMF https://zhuanlan.zhihu.com/p/26067454
https://zhuanlan.zhihu.com/p/39020670

## 二、word2vec类模型
### Word2Vec  
Word2Vec是谷歌的杰作，开启了万物皆可embedding的时代。。。  
Word2Vec主要提出了两种方法Hierarchical Softmax和 Negative Sampling，其中负采样用的更多一些。Word2Vec虽然源于NLP但却高于NLP，已经被用到了很多其它领域，这里就不多介绍了，相信都比较了解，直接祭上论文吧(google 2013)  
 - [Efficient Estimation of Word Representations in Vector Space](https://arxiv.org/abs/1301.3781)
 - [Distributed Representations of Words and Phrases and their Compositionality](https://arxiv.org/pdf/1310.4546.pdf)

### Item2Vec
微软2016年发表的一篇论文，这个论文并没有太大的理论创新，但是应用性极强，将word2vec应用于推荐广告领域，现在也有一些公司将这种方法用于召回场景中，可以说极大的拓宽了word2vec的应用范围。
- [ITEM2VEC: NEURAL ITEM EMBEDDING FOR COLLABORATIVE FILTERING](https://arxiv.org/pdf/1603.04259.pdf)

### Airbnb
这篇论文是Airbnb 2018年在kdd发表的，理论创新较少，但确与业务紧密结合，是工程领域里面具有很大影响力的论文。
1. 明确拒绝的item放入negative sample
2. global context：将最终预定的listing作为全局正样本，在所有滑窗中都参与训练
3. 负采样：专门增加一个负采样的逻辑，就是从与central listing相同城市的集合中采样
4. 聚合成listing_type和user_type：为了解决数据稀疏问题，将listing和用户根据固定的属性(用户年龄、身高等；房子尺寸、位置等)进行聚合
5. user和item向量在同一空间：在同一向量空间下的user_type和listing_type embedding，这一点很有意思，这样user和listing就可以直接计算距离了。
- [Real-time Personalization using Embeddings for Search Ranking at Airbnb](https://dl.acm.org/doi/abs/10.1145/3219819.3219885)

## 三、Graph Embedding
word2vec相关的方法本质上就是一种sequence embedding，主要对sequence序列进行建模。但是随着业务场景的复杂，word2vec就无法满足了。Graph Embedding作为一种解决方案，在研究和工程领域的应用都越来越多了。

1. [DeepWalk] DeepWalk- Online Learning of Social Representations (SBU 2014)

简单，baseline
random walk：沿着给定节点深度优先搜索，可以访问已经访问过的节点，直到满足长度要求
参考代码：
https://github.com/imsheridan/CogDL-TensorFlow/blob/master/cogdl/models/emb/deepwalk.py#L65

2. [Node2vec] Node2vec - Scalable Feature Learning for Networks (Stanford 2016)
只是采样策略不同
node2vec这篇文章还是对DeepWalk随机游走方式的改进。为了使最终的embedding结果能够表达网络局部周边结构和整体结构，其游走方式结合了深度优先搜索和广度优先搜索。
参考：https://zhuanlan.zhihu.com/p/56542707

3. [LINE] LINE - Large-scale Information Network Embedding (MSRA 2015)
negative sample后损失函数和w2d以及LR一样 https://www.cnblogs.com/pinard/p/7249903.html

相比DeepWalk纯粹随机游走的序列生成方式，Line将一阶、二阶的邻近关系引入目标函数，
 - 一阶：节点相似性，相邻节点的相似（只能无向图，无法有向图）
 - 二阶：邻居相似性，A和B具有相似朋友圈，那么A和B就相似
 参考： https://zhuanlan.zhihu.com/p/74746503

9. [SDNE] Structural Deep Network Embedding (THU 2016)
参考：https://zhuanlan.zhihu.com/p/75223319

二阶损失：自编码器重构损失；一阶损失：自编码器中间向量之间距离

10. [Alibaba Embedding] Billion-scale Commodity Embedding for E-commerce Recommendation in Alibaba (Alibaba 2018)

DeepWalk + side information解决embedding问题非常棘手的冷启动问题，并针对不同side information进行了进一步的改造形成了最终的解决方案EGES（Enhanced Graph Embedding with Side Information）。

## 四、Graph Neural Networks
GCN
GAT
GraphSage

## 五、其它
DSSM
Youtoube

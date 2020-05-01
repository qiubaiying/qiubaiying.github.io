---
layout:     post
title:      A Novel Hierarchical Binary Tagging Framework for Relational Triple Extraction
subtitle:   
date:       2020-05-01
author:     YM
header-img: img/3.jpg
catalog: true
tags:
    - 关系抽取
    - 论文笔记
---

## A Novel Hierarchical Binary Tagging Framework for Relational Triple Extraction

> 今天这篇论文提出了一个比较新颖的方法来做实体关系联合抽取，实体关系联合抽取也叫三元组抽取，目的在从文本中抽取出结构化的关系三元组(Subject, Relation, Object)用以构建知识图谱。这篇文章是最近由吉林大学常毅团队发表在ACL2020上的

### **Motivation and Background**

- 关系三元组抽取(Relational Triple Extraction, RTE)，也叫实体-关系联合抽取，是信息抽取领域中的一个经典任务，三元组抽取的目的刚才提到过了，旨在从文本中抽取出结构化的关系三元组(Subject, Relation, Object)用以构建知识图谱。近年来，随着NLP领域的不断发展，在简单语境下(例如，一个句子仅包含一个关系三元组)进行关系三元组抽取已经能够达到不错的效果。但在复杂语境下(一个句子中包含多个关系三元组，有时甚至多达五个以上)，尤其当多个三元组有重叠的情况时，许多现有模型的表现就显得有些捉襟见肘了。

  > 具体的三元组的例子来看一下这张图
  >
  > 比如united states 和trump这个实体对，存在着country——president这个关系，组成了一个实体对。这是一个比较normal的例子
  >
  > 但是还会有一些复杂的情况，比如两个三元组，他们共享相同的实体对，或者共享其中一个实体。这样的重叠的三元组的提取是比较具有挑战性的，也是这篇文章主要做出贡献的地方

<img src="https://testxiaoming.oss-cn-shanghai.aliyuncs.com/img/image-20200427094801681.png" alt="image-20200427094801681" style="zoom: 67%;" />

> Normal表示三元组之间无重叠；
> EPO(Entity Pair Overlap)表示多（两）个三元组之间共享同一个实体对；
> SEO(Single Entity Overlap)表示多（两）个三元组之间仅共享一个实体。注意在某些复杂的情况下，一个句子可能既是EPO类型，同时也是SEO类型。



> 在介绍完问题的背景后，我们来看一下对这个问题的解决方式的分析

### **Problem formulation**

> 之前的文章中通过Seq2Seq模型、并通过强化学习的方式来做进一步提升，或者使用基于图卷积网络（GCN）的模型将文本建模为关系图来研究重叠三元组提取问题
>
> 但是他们都存在一个比较相似的思路，就是（下面的但是开始）

- 近些年，基于神经网络的模型在三元组提取任务中取得了相当大的成功，但是他们将关系视为实体対上的一个离散的标签，也就是说法：<u>**首先通过命名实体识别(NER)确定出句子中所有的实体，然后学习一个关系分类器在提取出的所有的实体对上做关系抽取，最终得到我们所需的关系三元组。**</u> 

> RC是在给定实体对和输入文本的情况下，抽取出实体对在句子中所表达的关系
>
> RTE则是在仅给定输入文本的情况下，抽取出包含在文本中的所有可能的关系三元组

- 然而这种Formulation在多个关系三元组有重叠的情况下会有如下问题：
  - 在所有提取的实体对中，很多都不形成有效关系，从而产生了太多的negative examples
  - 当同一实体参与多个关系时，分类器可能会感到困惑。 没有足够的训练样例的情况下，分类器就很难准确指出实体参与的关系

- 这篇文章中提出了一个新的Formulation，实现了一个不受重叠三元组问题困扰的HBT标注框架(Hierarchical Binary Tagging Framework)来解决RTE任务。HBT框架最核心思想是，**<u>把关系(Relation)建模为将头实体(Subject)映射到尾实体(Object)的函数，而不是将其视为实体对上的标签</u>**。

> 这篇文章中不再去学习关系分类器 ![[公式]](https://www.zhihu.com/equation?tex=f(s%2C+o)+\rightarrow+r) ，而是学习关系特定的尾实体标注器 ![[公式]](https://www.zhihu.com/equation?tex=f_{r}(s)+\rightarrow+o) ，

- **这里关系特定的尾实体标注器** ![[公式]](https://www.zhihu.com/equation?tex=f_%7Br%7D%28s%29+%5Crightarrow+o)将在**给定关系和头实体（subject）的条件下**识别出所有可能的尾实体（object），或不返回任何object，表示给定的主题和关系没有三元组

  > 关系是给定的，比如两个常用的公开数据集，会有给好的几十个，和几百个关系。

- 总结一下，在这种框架下，关系三元组抽取问题就被分解为如下的两步过程：

  - 抽取所有可能的subject，这一点和之前的没什么改动
  - 对于每一个 subject，将其输入到每一个关系对应的提取器中，抽取每个关系对应的 object

  

  > 然后根据之前描述的两部任务，我们可以大致看到这个模型的构成是这样的，主要分为encoder和decode两部分，decoder主要分为提取subject的subject tagger和特定关系下提取object的的 object taggers
>
  > 然后的话，具体的细节会在后面去讲
  >
  > 我们首先来看一下根据这篇文章的想法，这个任务的损失函数是什么样的

- HBT框架整体结构如下图所示：

<img src="https://testxiaoming.oss-cn-shanghai.aliyuncs.com/img/image-20200427095031155.png" alt="image-20200427095031155" style="zoom:67%;" />

### Hierarchical Binary Tagging  Framework

<img src="https://testxiaoming.oss-cn-shanghai.aliyuncs.com/img/image-20200427133724481.png" alt="image-20200427133724481" style="zoom:67%;" />

- 对于training set D上的sentence xj和xj中可能存在的三元组的集合![[公式]](https://www.zhihu.com/equation?tex=T_%7Bj%7D)，我们希望去最大化data likelihood，也就是第一个式子。

- 根据链式法则，可以把第一个式子转化为第二个式子。

  > 右边部分下角标的 表示 ![[公式]](https://www.zhihu.com/equation?tex=T_%7Bj%7D) 中指定s的三元组集合，集合中的ro对来计算后面这个部分

- **<u>公式2到公式3其实是"将relation建模为函数"这一思想的关键一步。对于给定的一个subject，其在句子中所参与的关系个数一般来说是有限的，因此只有部分relation能够将其映射到相应的object上去(对应公式3的中间部分)，最终得到一个有效的三元组。</u>**

- 那么对于未参与的关系，文中提出了"null object"的概念，也就是说，在这种情况下函数会将subject映射到一个空的尾实体上(对应公式3的右端部分)，表示subject并不参与该关系，也就无法抽取出有效的三元组。

> 我们通过学习p（s|xj）和pr（o|s，xj）这两个tagger来提取出subject和object

对上式取对数，则损失函数如下

![[公式]](https://www.zhihu.com/equation?tex=J(\theta)%3D\sum_{j%3D1}^{D}{[+\sum_{s\in+T_{j}}log\+p_{\theta}(s|x_{j})+%2B+\sum_{r\in+T_{j}|s}log\+p_{\phi_{r}}(o|s%2Cx_{j})+%2B+\sum_{r\notin+T_{j}|s}log\+p_{\phi_{r}}(o_{\oslash}|s%2Cx_{j})+]})

> 这里面的下角标符号有些复杂
> ![[公式]](https://www.zhihu.com/equation?tex=s%5Cin+T_%7Bj%7D) 表示subject出现在 ![[公式]](https://www.zhihu.com/equation?tex=T_%7Bj%7D) 的三元组中； 
> ![[公式]](https://www.zhihu.com/equation?tex=T_%7Bj%7D%7Cs) 表示 ![[公式]](https://www.zhihu.com/equation?tex=T_%7Bj%7D) 中以s为首的三元组集合，即 ![[公式]](https://www.zhihu.com/equation?tex=%5C%7B+%28s%2C+r_%7Bk%7D%2C+o_%7Bl%7D%29+%5C%7D) ； ![[公式]](https://www.zhihu.com/equation?tex=%28r%2Co%29+%5Cin+T_%7Bj%7D%7C+s) 表示 ![[公式]](https://www.zhihu.com/equation?tex=%28r%2Co%29) 对出现在以s为首的三元组中，即 ![[公式]](https://www.zhihu.com/equation?tex=%28s%2Cr%2Co%29) 为真实三元组标签；
>  ![[公式]](https://www.zhihu.com/equation?tex=o_%7B%5Coslash%7D) 表示以s为头实体，在关系r下，句子中没有对应的尾实体。

#### BERT Encoder层： 

<img src="https://testxiaoming.oss-cn-shanghai.aliyuncs.com/img/image-20200427135000164.png" alt="image-20200427135000164" style="zoom:67%;" />

> 他的encoder层是现在实体识别里比较常见的做法

对于输入的文本，通过 BERT 得到每个词的词表征，把 BERT encoder的输出当作词向量使用。

> 这里感觉很normal

### Hierarchical Decoder层

这一层由两个部分组成，一个是提取subject的subject tagger，一个是由一系列relation-specific object taggers（之所以这里是多个taggers是因为有多个可能的relation）.

#### Subject Tagger层： 

![image-20200427212924709](https://testxiaoming.oss-cn-shanghai.aliyuncs.com/img/image-20200427212924709.png)

采用两个相同的二进制分类器，通过为每个标记分配一个二进制标记（0/1）来分别检测对象的开始和结束位置

对BERT的输出的特征向量作sigmoid激活，计算该token作为subject的开始、结束的概率大小。如果结果超过设定阈值，则标记为1，反之为0。其中xi是第i个token的编码表示；pi是第i个token是subject的start或者end的概率

![[公式]](https://www.zhihu.com/equation?tex=p_{i}^{start\_s}%3D\sigma(W_{start}x_{i}%2Bb_{start}))

![[公式]](https://www.zhihu.com/equation?tex=p_{i}^{end\_s}%3D\sigma(W_{end}x_{i}%2Bb_{end}))

为了获得更好的W（weight）和b（bias）subject tagger需要优化这个似然函数： ![[公式]](https://www.zhihu.com/equation?tex=p_%7B%5Ctheta%7D%28s%7Cx%29%3D%5Cprod_%7Bt%5Cin+%5C%7Bstart%5C_s%2C+start%5C_e%5C%7D%7D%5E%7B%7D%5Cprod_%7Bi%3D1%7D%5E%7BL%7D%28p_%7Bi%7D%5E%7Bt%7D%29%5E%7BI%5C%7By_%7Bi%7D%5E%7Bt%7D%3D1%5C%7D%7D%281-p_%7Bi%7D%5E%7Bt%7D%29%5E%7BI%5C%7By_%7Bi%7D%5E%7Bt%7D%3D0%5C%7D%7D) ，

他表示的所有对于长为L的句子，每个token的start和end联合概率，I这个函数。。。对于每个点，尝试是不是start还是end，然后带入上面的pi的计算，来优化w，b。

> L是句子的长度，I{Z}=1如果Z是true，<img src="https://testxiaoming.oss-cn-shanghai.aliyuncs.com/img/image-20200427212328779.png" alt="image-20200427212328779" style="zoom:50%;" />是x的第i个token是结束位置的二进制标签

对预测出来的start标注为1，取与之最近的end之间的tokens为预测实体。

如上图中，start对应的token为“Jackie”，最近的end对应的token为“Brown”，则“Jackie R. Brown”为一个subject实体。

#### Relation-specific Object Taggers层

<img src="https://testxiaoming.oss-cn-shanghai.aliyuncs.com/img/image-20200427212554267.png" alt="image-20200427212554267" style="zoom:50%;" />

这些标记器的结构与之前的subject tagger相同，也是两个相同的二进制分类器，通过为每个标记分配一个二进制标记（0/1）来分别检测对象的开始和结束位置

这里面融入上一步的subject特征，结合之前BERT Encoder的编码内容，用来在指定的relation下预测对应的object的起止位置，概率计算如下和之前相比多了v：

![[公式]](https://www.zhihu.com/equation?tex=p_%7Bi%7D%5E%7Bstart%5C_o%7D%3D%5Csigma+%28W_%7Bstart%7D%5E%7Br%7D%28x_%7Bi%7D%2Bv_%7Bsub%7D%5E%7Bk%7D%29%2Bb_%7Bstart%7D%5E%7Br%7D%29)

![[公式]](https://www.zhihu.com/equation?tex=p_%7Bi%7D%5E%7Bend%5C_o%7D%3D%5Csigma+%28W_%7Bend%7D%5E%7Br%7D%28x_%7Bi%7D%2Bv_%7Bsub%7D%5E%7Bk%7D%29%2Bb_%7Bend%7D%5E%7Br%7D%29)

![[公式]](https://www.zhihu.com/equation?tex=v_%7Bsub%7D%5E%7Bk%7D) Suject Tagger预测的第k个实体的平均向量，如 

![[公式]](https://www.zhihu.com/equation?tex=v_%7BJackie+R.+Brown%7D%5E%7B1%7D%3Dmean%28x_%7BJackie%7D%2C+x_%7BR.%7D%2C+x_%7BBrown%7D%29)


这么做的目的是保证xi和v是相同的维度

对于每个关系r对应的tagger，需要优化的似然函数如下来获得更好的W（weight）和b（bias）这个公式等号右边和之前是完全一样的：

![[公式]](https://www.zhihu.com/equation?tex=p_%7B%5Cphi_%7Br%7D%7D%28o%7Cs%2CX%29%3D%5Cprod_%7Bt%5Cin+%5C%7Bstart%5C_o%2Cstart%5C_e+%5C%7D%7D%5E%7B%7D%5Cprod_%7Bi%3D1%7D%5E%7BL%7D%28p_%7Bi%7D%5E%7Bt%7D%29%5E%7BI%5C%7By_%7Bi%7D%5E%7Bt%7D%3D1%5C%7D%7D%281-p_%7Bi%7D%5E%7Bt%7D%29%5E%7BI%5C%7By_%7Bi%7D%5E%7Bt%7D%3D0%5C%7D%7D)

> 对于objext为null的 ![[公式]](https://www.zhihu.com/equation?tex=o_%7B%5Coslash%7D) 的情况，对于所有token来说， ![[公式]](https://www.zhihu.com/equation?tex=y_%7Bi%7D%5E%7Bend%5C_o_%7B%5Coslash%7D%7D%3Dy_%7Bi%7D%5E%7Bend%5C_o_%7B%5Coslash%7D%7D%3D0)



### Experiments

<img src="https://testxiaoming.oss-cn-shanghai.aliyuncs.com/img/image-20200428084711263.png" alt="image-20200428084711263" style="zoom:67%;" />

实验主要使用的数据集是NYT和WebELG。他们是重叠三元组提取任务上很常用的数据集，因为他们包含很多的重叠关系的三元组。![image-20200427220013661](https://testxiaoming.oss-cn-shanghai.aliyuncs.com/img/image-20200427220013661.png)

上表是在两个数据集上与现有的解决重叠三元组问题的方法进行了全面的比较。

HBTrandom是随机初始化BERT所有参数的框架；

HBTLSTM是在（Zheng等人，2017）中基于LSTM的结构实例化的框架，具有预训练的GLOVE嵌入（Pennington等人，2014）;  

HBT是使用预训练的BERT权重的成熟框架。

与纽约时报和纽约时报上最好的最新方法相比，F1得分达到了令人鼓舞的17.5％和30.2％的提高。  

在WebNLG数据集。他的提升是很显著的，即使不利用预训练的BERT，HBTrandom和HBTLSTM仍比现有的最新模型效果好很多。

> 那么具体对于之前提到的三种类型的句子是如何提升的呢

<img src="https://testxiaoming.oss-cn-shanghai.aliyuncs.com/img/image-20200428093447449.png" alt="image-20200428093447449" style="zoom:67%;" />

具体到之前的三种类型的句子，我们可以看到，大多数的baselines都是从左到右性能逐渐下降的，说明提取重叠三原则的难度是更大的。和其他模型相比之下，具有预训练的BERT权重的HBT表现出来的效果更为稳定，也就是说他对于每一个 subject，先将其输入到每一个关系对应的提取器中，再抽取每个关系对应的 object的做法，不容易收到重叠三元组的影响。

<img src="https://testxiaoming.oss-cn-shanghai.aliyuncs.com/img/image-20200428093925259.png" alt="image-20200428093925259" style="zoom:67%;" />

文章中验证了HBT从具有不同三元组数量的句子中提取三元组的能力
之前大多数baseline的性能随句子中包含的关系三元组数量的增加而降低，而HBT的性能会比较稳定。

两个数据集上的F1得分有了最大的改进（即NYT上为37.8） 和WebNLG上的35.2）都来自最困难的类别（N>=5），可以感觉到HBT模型比其他模型更适合于这种复杂的场景

> 最后文章还分析了模型对于预测三元组的不同元素（E1，R，E2）的性能

![image-20200428105210185](https://testxiaoming.oss-cn-shanghai.aliyuncs.com/img/image-20200428105210185.png)



分析了预测三元组的不同元素（E1，R，E2）的性能，其中E1代表主题实体，E2代表对象实体，R代表关系 它们之间。 

NYT：我们还发现（E1，E2）和（E1，R，E2）的F1分数之间只有很小的差距，但（E1，R，E2）和（E1，R）/（  R，E2）。 它表明，在提取的三元组中，实体对的大多数关系都可以正确识别，而某些提取的实体无法形成有效的关系三元组。 换句话说，这意味着识别关系比为模型识别实体要容易一些。

与NYT相比，对于WebNLG，（E1，E2）和（E1，R，E2）之间的性能差距相对大于（E1，R，E2）和（E1，R）/（R，E2）之间的性能差距 。 它表明错误识别关系比错误识别实体会带来更多的性能下降。 这样的观察结果还表明，与《纽约时报》观察到的相反，建议的HBT模型识别关系比WebNLG中的实体更具挑战性。 将这种差异归因于两个数据集中包含的关系数量不同（即NYT中的24个和WebNLG中的246个），这使WebNLG中的关系识别更加困难。





在附录中他还有也展示了在更多的数据集上与最近的13种Strong Baselines的比较情况，这里我就没有放上来了，那些数据集不是专门用来测试重叠三元组的，只是单纯提取三元组模型的数据集。但是他最后的实验结果中，即使在数据集仅包含少量重叠三元组的情况下，他的表现也很优异。

> F1分数（F1 Score），是统计学中用来衡量二分类模型精确度的一种指标。F1分数可以看作是模型精确率和召回率的一种调和平均

### Conculsion

- 这个方法通过将关系建模为函数，多个场景下均改善了关系三元组抽取的性能，尤其在现有方法难以解决的重叠三元组问题上取得了较大的提升。
- HBT模型避开了对关系类型的预测，并倾向于从给定的句子中提取尽可能多的关系三元组.不再拘泥于给一个实体对打上relation标签的方法，而是把Relation建模为将Subject映射到Object的函数，是一个新的视角。

- 相比之前的最好的重叠三元组的提取结果有着不错的提升

- 实验做得很充分！从各种角度分析了HBT这个模型对于三元组提取任务的不同方面的提升
- 而且在包含少量重叠三元组的数据上也进行了实验，结果也很好（最近WebNLG被超过了一些）



### **Something Else**

- 模型输入句子的最大长度设置为100个单词




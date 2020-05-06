 ##  Transfer Learning 迁移学习
 > Book:《迁移学习简明手册》王晋东   
 > Ref:    
 [1]. [Understanding How Feature Structure Transfers in Transfer Learning](https://github.com/jyniki/Learn2019/blob/master/research/tutorials/Understanding%20How%20Feature%20Structure%20Transfers%20in%20Transfer%20Learning.pdf)   
 [2]. [A Survey on Transfer Learning](https://github.com/jyniki/Learn2019/blob/master/research/reference/A%20Survey%20on%20Transfer%20Learning.pdf)    
 [3]. [A Survey on Deep Transfer Learning](https://github.com/jyniki/Learn2019/blob/master/research/reference/A%20Survey%20on%20Deep%20Transfer%20Learning.pdf)


 #### 1. Introduction 介绍
 - 迁移学习是利用数据、任务或模型之间的**相似性**，将在旧的领域学习过或训练好的模型，应用于新的领域。
 - 为什么要用迁移学习？
   - 大数据与少标注之间的矛盾：尽管可以获得到海量的数据，但数据往往是很初级的原始形态，很少有数据被加以正确的人工标注。
   - 大数据与若计算之间的矛盾：利用海量的大数据训练模型需要大设备、强计算能力的设备（从头开始训练一个卷积网络通常需要较长时间且依赖于强大的GPU计算资源）
   - 普适化模型与个性化需求之间矛盾：当通用任务具体到每个个体、每个需求时，都存在其唯一性和特异性，一个普适化的通用模型根本无法满足。
   - 特定应用的需求：一些特定的应用（比如一个新的推荐系统，没有足够的用户数据，如何进行精准的推荐？一个崭新的图片标注系统，没有足够的标签，如何进行精准的服务？）
 - 迁移学习作用：
   - 迁移数据标注（解决大数据与少标注的矛盾）：通过寻找一些与目标数据相近的有标注的数据，从而利用这些数据来构建模型，增加目标数据的标注。
   - 模型迁移（大数据与弱计算）：利用大公司在大数据上训练好的模型，迁移到所需的任务中，针对任务进行微调，进行自适应更新，从而取得更好的效果
   - 自适应学习（普适化模型与个性化需求）：利用迁移学习的思想，进行自适应的学习。考虑到不同用户之间的相似性和差异性，对普适化模型进行灵活的调整，以实现个性。
   - 相似领域知识迁移（特定应用的需求）：利用迁移数据标注、模型迁移和自适应学习方法，从数据和模型方法上进行迁移学习，以满足特定领域应用的需求。
- 迁移学习 VS 传统机器学习
    |  比较项目    | 传统机器学习     | 迁移学习     |
    | ---- | ---- | ---- |
    | 数据分布     |训练和测试数据服从相同的分布      |   训练和测试数据服从不同的分布   |
    | 数据标注     | 需要足够的数据标注来训练模型     |  不需要足够的数据标注    |
    | 模型        | 每个任务需要分别建模     | 模型可以在不同任务之间迁移     |
- 迁移学习 VS 多任务学习
  - 迁移学习：强调信息复用，从一个领域(domain)迁移到另一个领域。
  - 多任务学习：多个相关任务一起协同学习



#### 2. Domains 迁移学习的研究领域

![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/transfer-learning.png)
- 按目标域标签分类
  - 监督迁移学习 (Supervised Transfer Learning)
  - 半监督迁移学习 (Semi-Supervised Transfer Learning)
  - 无监督迁移学习 (Unsupervised Transfer Learning)
  `其中少标签或无标签的问题（半监督和无监督迁移学习）是目前研究的热点和难点`

- [按学习方法分类](#4-transfer-learning-methods-%e8%bf%81%e7%a7%bb%e5%ad%a6%e4%b9%a0%e6%96%b9%e6%b3%95)
  - 基于样本(*数据*)的迁移学习方法 (Instance based Transfer Learning) 
    - 通过权重复用，对源领和目标域的样本进行迁移
  - 基于*特征*的迁移学习方法 (Feature based Transfer Learning)
    - 通过对特征进行变换，将源域和目标域的特征转换到一个空间，在这个空间，两个域的特征相似
  - 基于*模型*的迁移学习方法 (Model based Transfer Learning) 
    - 构建参数共享的模型，主要应用在神经网络中
  - 基于关系的迁移学习方法 (Relation based Transfer Learning)
    - 挖掘和利用源域与目标域的关系，进行类比迁移。该方法使用较少。
  
- 按特征分类
  - 同构迁移学习 (Homogeneous Transfer Learning)：
    - 又称领域自适应
    - 源域和目标域的特征空间和标签空间相同 
  - 异构迁移学习 (Heterogeneous Transfer Learning)：
    - 源域和目标域的特征空间和/或标签空间不同
![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/transfer5.png)

- 按离线与在线形式分类
  - 离线迁移学习 (Offline Transfer Learning)：
    - 源域和目标域均是给定的，迁移一次即可，但是算法无法对新加入的数据进行学习，模型也无法得到更新。
    - 目前绝大多是迁移学习方法都采用了离线方式
  - 在线迁移学习 (Online Transfer Learning)
    - 随着数据的动态加入，迁移学习算法可以不断得到更新

#### 3.Basic Knowledge 迁移学习基础知识
(1). Domain(领域)    
- **领域(Domain)**: 是进行学习的主体。领域主要由两部分构成:`数据`和`生成这些数据`的概率分布。通常我们用$\mathcal{D}$来表示一个domain，用$\mathcal{P}$来表示一个概率分布。领域上的数据，通常用**x**来表示，是一种向量的表示形式(**x**$_i$表示第$i$个样本或特征)。用**X**表示一个领域的数据，是一种矩阵形式。用$\mathcal{X}$来表示数据的特征空间。
  - Source Domain(源领域)：有知识、有大量数据标注的领域，是要迁移的对象，通常用$D_s$表示。
  - Target Domain(目标领域)：最终要赋予知识、赋予标注的对象，通常用$D_t$表示   
  

(2). Task(任务)
- **任务(Task)**： 是学习的目标，主要由两部分组成：`标签和标签对应的函数`，通常用$\mathcal{Y}$来表示，用$f(·)$来表示一个学习函数。
  - 源领域的类别空间可以表示为$\mathcal{Y_s}$
  - 目标领域的类别空间可以表示为$\mathcal{Y_t}$   

(3). Transfer Learning 迁移学习定义
- **迁移学习 (Transfer Learning)**： 给定一个有标记的源域$\mathcal{D_s}$=$\{x_i,y_i$${\}}^n_{i=1}$和一个无标记的目标域$\mathcal{D_t}$=${\{}x_j{\}}^{n+m}_{j=n+1}$。这两个领域的数据分布$\mathcal{P}(x_s)$和$\mathcal{P}(x_t)$不同，即$\mathcal{P}(x_s)\neq\mathcal{P}(x_t)$。迁移学习的目的就是要借助$\mathcal{D_s}$的知识，来学习目标域$\mathcal{D_t}$的知识 (标签)。
- 迁移学习的定义需要考虑：
  - 特征空间的异同，即$\mathcal{X_s}$和$\mathcal{X_t}$是否相等
  - 类别空间的异同，即$\mathcal{Y_s}$和$\mathcal{Y_t}$是否相等
  - 条件概率分布的异同，即$\mathcal{Q_s(y_s|x_s)}$和$\mathcal{Q_s(y_t|x_t)}$是否相等     

- 利用上述形式化，给出领域自适应（即<u>同构迁移学习</u>）的定义为：
  - **领域自适应（Domain Adaptation）**：给定一个有标记的源域$\mathcal{D_s}$=$\{x_i,y_i$${\}}^n_{i=1}$和一个无标记的目标域$\mathcal{D_t}$=${\{}x_j{\}}^{n+m}_{j=n+1}$。假定它们的特征空间相同，即$\mathcal{X_s}=\mathcal{X_t}$，并且它们的类别空间也相同，即$\mathcal{Y_s}=\mathcal{Y_t}$。但是这两个域的边缘分布不同，即$\mathcal{P_s(y_s|x_s)}{\neq}\mathcal{P_s(y_t|x_t)}$，条件概率分布也不同，$\mathcal{Q_s(y_s|x_s)}{\neq}\mathcal{Q_s(y_t|x_t)}$。迁移学习的目标就是利用有标记的数据$\mathcal{D_s}$去学习一个分类器$f:\mathcal{x_t}{\to}\mathcal{y_t}$来预测目标域$\mathcal{D_t}$的标签$\mathcal{y_t}{\in}\mathcal{Y_t}$
- 总结：**相似性是核心，度量准则是重要手段**
  - 总体思路：开发算法来最大限度地利用有标注的领域的知识，来辅助目标领域的知识获取和学习
  - 迁移学习的核心是找到源领域和目标领域之间的**相似性**，并加以合理利用。      
  - 度量和利用相似性：度量工作的目标有两点，一是很好地度量两个领域的相似性，不仅定性地告诉我们它们是否相似，更定量地给出相似程度。二是以度量为准则，通过所要采用的学习手段，增大两个领域之间的相似性，从而完成迁移学习。

(4). 度量准则
- 距离
  - 欧式距离
  - 闵可夫斯基距离
  - 马氏距离
- 相似度
  - 余弦相似度：衡量两个向量的相关性
  - 互信息：度量两个概率分布对象的相关性
  - 皮尔逊相关系数：衡量两个随机变量的相关性
  - Jaccard相关系数：判断两个集合的相关性
- KL散度和JS距离
  - KL散度：衡量两个概率分布的距离
  - JS距离：衡量对称度
- 最大均值差异MMD：度量再⽣核希尔伯特空间（Reproducing Kernel Hilbert Space）中两个分布的距离，是一种核学习方法
- Principal Angle：两组数据对应维度的夹角之和
- A-distance：通常被用来计算两个领域数据的相似程度
- Hilbert-Schmidit Independence Criterion：用来检验两组数据的独立性

#### 4. Transfer Learning Methods 迁移学习方法
> `分类方式：基于学习方法进行分类` 
>  
(1). 基于样本迁移(Instance based Transfer Learning)
> - 根据一定的权重生成规则，对数据样本进行重用，来进行迁移学习。   
> - 如下图：源域中存在不同种类的动物，如狗、鸟、猫等，目标域只有狗这一种类别。在迁移时，为了最大限度地和目标域相似，可以人为地提高源域中属于狗这个类别的样本权重。
> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/Instance-based.jpg)
> - 根据特征的同构和异构性，又可以分为<u>同构和异构</u>迁移学习。
> 
(2). 基于特征迁移(Feature based Transfer Learning) 
> - 通过特征变换的方式互相迁移，来减少源领和目标域之间的差距；或者将源域和目标域的> 数据特征变换到统一特征空间中，然后利用传统的机器学习方法进行分类识别。
> - 可以分为<u>有监督和无监督</u>两种情况：
>   - 有监督特征构造的基本思想是学习一个低维的特征表示，使得特征可以在相关的国歌> 任务中共享，同时也要使分类回归的误差最小。
>   - 无监督特征构造的基本思想：第一步通过在源域上学习一个基向量；第二步在目标域> 上基于基向量学习更高维特征；最后在目标域上，将判别算法应用于具有相应标签的更高> 维特征，以训练分类和回归模型应用到目标域。
> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/Feature-based.jpg)

(3). 基于参数/模型迁移(Parameter/Model based Transfer Learning)
> - 从源域和目标域中找到两者之间共享的参数信息。
> - 该迁移方式要求的假设条件是：源域中的数据与目标域中的数据可以共享一些模型的参数
> - 目前绝大多数基于模型的迁移学习方法都与<u>深度神经网络</u>进行结合。
> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/Model-feature.jpg)

(4). 基于关系迁移(Relation Based Transfer Learning)
> - 关注源域和目标域的样本之间的关系。它不假设每一个域的数据都是独立同分布的，而是将数据之间的联系从源域迁移到目标域。


#### 5. Deep Transfer Learning Methods 深度迁移学习
- 深度迁移学习优势：
  - 与传统的非深度迁移学习方法相比，深度迁移学习直接提升了在不同任务上的学习效果
  - 由于深度学习直接对原始数据进行学习，所以其对比非深度方法还有两个优势:`自动化地提取更具表现力的特征`;`满足了实际应用中的端对端需求`
  - 深度迁移学习方法（BA、DDC、DAN）对比传统迁移学习方法（TCA、GFK），在精度上具有巨大的优势

- 深度迁移学习方法:
   - Instance-based deep transfer learning
     - 使用特定的权重调整策略，在源域中选择实例设定适当的权重值，将其作为目标域中训练集的补充。
     - 此方法假设:虽然在两个域之间有两个域,但源域中的部分实例可以通过适当的权重从而利用到目标域中。
   
     ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/transfer1.png)

   - Mapping-based deep transfer learning
     - 将实例从源域和目标域映射到一个新的数据空间。在新的数据空间，来自两个域的实例相似，适合于联合深度神经网络
     - 此方法假设：虽然两个源域之间存在差异，但在一个精心设计的新数据空间中，它们可能更相似
     
     ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/transfer2.png)

   - Network-based deep transfer learning
     - 对源域预先训练的部分网络进行重用，包括其网络结构和连接参数，将其迁移为目标域中深度神经网络的一部分。
     - 此方法假设：神经网络类似于人脑的处理机制，是一个迭代的、连续的抽象过程。该网络的前端可以看作是一个特征提取器，所提取的特征具有通用性。
     
     ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/transfer3.png)

   - Adversarial-based deep transfer learning
     - 引入生成对抗网络（GAN）中的对抗性技术，以找到适用于源域和目标域的可迁移表示
     - 此方法假设：对于有效的迁移，良好的表示应该是在主要学习任务有差异性，而在源域与目标域之间无差异。
   
     ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/transfer4.png)
     


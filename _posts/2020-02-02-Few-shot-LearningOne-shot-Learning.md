---
layout:     post
title:      Few-shot/One-shot/Zero-shot Learning 
subtitle:   少样本/零样本学习介绍
date:       2020-02-02
author:     JY
header-img: img/post-bg.jpg
catalog: true
tags:
    - Introduction
---

##  

在迁移学习中，由于传统深度学习的学习能力弱，往往需要海量数据和反复训练才能具有泛化能力。

#### 1. Few-shot learning and One-shot learning
Ref: [Few-shot Learning: A Survey](https://github.com/jyniki/Learn2019/blob/master/research/reference/Few-shot%20Learning-%20A%20Survey.pdf)     

(1). 介绍 Introduction 
- Few-shot learning(FSL)通过结合先验知识来学习有限监督信息的新任务。
- 应用：
  - 可以帮助减少数据密集型应用的数据收集工作，例如图像分类、图像检索、对象跟踪、手势识别、图像加字幕、视频时间检测、语言建模等。
  - 同时适合应用于一些难以获取受监督信息的任务，目标任务只有少量样本，通过FSL为少见的情况学习合适的模型。

(2). 定义 Definition   
- 考虑一个监督学习任务T，FSL处理的数据集$D=\left\{D^{\text { train }}, D^{\text { test }}\right\}$中包括训练集$D^{\mathrm{train}}=\left\{\left(x^{(i)}, y^{(i)}\right)\right\}_{i=1}^{I}$和测试集$D^{\text { test }}=\left\{x^{\text { test }}\right\}$
- 通常考虑N类K-shot分类任务，其中$D^{train}$包括N个类，每个类有K个示例，I=KN。$p(x, y)$表示输入$x$和输出$y$之间的真实联合分布。FSL通过拟合$D^{train}$学习从$x$到$y$发现最优解$o^*$，并且在$D_{test}$应用上有良好表现。为了近似$o^*$，Model

  


训练集中，每个类别都有样本，但都只是少量样本（只有一个或几个） 

(3). 方法 Methods
Few-shot Learning 算法大致可分为三类：  

- Mode Based：旨在通过模型结构的的设计快速在少量样本上更新参数，直接建立输入x和预测值P的映射函数
- Metric Based：通过度量batch集中的样本和support集中样本的距离，借助最邻近的思想完成分类
- Optimization Based：普通的梯度下降方法难以在few-shot场景下拟合，因此需要通过调整优化方法来完成小样本分类的任务    
![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/Few-shot.png)



- Siamese Networks（孪生网络）
  - 通过有监督的方式训练孪生网络来学习，然后复用网络所提取的特征进行one/few-shot learning      



#### 2. Zero-shot learning

Ref: [A Survey of Zero-Shot Learning: Settings, Methods, and Applications](https://github.com/jyniki/Learn2019/blob/master/research/reference/A%20Survey%20of%20Zero-Shot%20Learning.pdf)               
- 在实际场景中，数据集每类可能没有足够的训练实例，且应用时需要对之前未见过的实例进行分类（训练实例中没有覆盖的类会出现在测试实例中）。Zero-shot learning是一种极具应用前景的学习范式，其训练实例所涵盖的类与应用时需要分类的类是不相交的。

(1). 介绍 Introduction
- <u>监督分类方法</u>存在如下限制 restrictions：
  - 每类都需要足够的标记训练实例
  - 学习得到的分类器只能对训练数据所覆盖类的实例进行分类，缺乏处理以前未见类的能力
  
- 目前已有的类似方法：
  - Few-shot/one-shot learning methods：利用其他类实例中包含的知识训练实例很少的类的分类，解决训练实例较少的类的分类问题
  - Open set recognition metheds：利用训练数据学习分类器时，考虑不可见类存在的事实。学习后的分类器能够确定实例是否属于不可见类，<u>但不能确定实例属于哪个特定的不可见类</u> 
  - Cumulative learning and class-incremental learning methods：利用模型学习，将已有的分类器与新出现的带标签的实例相适应，从而能够对新类别进行分类。    
  - Open world recognition methods：通过检测unseen类、获取unseen类的标记实例、对分类器进行模型自适应和调整，使分类器能够利用所获取的标记实例对unseen类进行分类。
  > 上述方法，如果测试实例属于模型学习（或自适应）过程中没有可用标记实例的unseen类，则学习分类器无法确定它们的类标记。然而在实际应用中，需要分类器能够确定属于这些类的实例的类标签。

- 应用场景分析：
  - <u>目标类（target classes）数目大</u>：为大量的类收集足够的标记实例难度大。目前有的图像数据集只能覆盖这些类的一小部分，有许多对象类没有标记的实例（如活动识别，由于人类活动类别的数量，而现有数据集所覆盖的活动类数量有限，许多活动类在现有数据集中没有标记实例）
  - <u>目标类（target classes）稀少</u>：在细粒度（fine-grained）图像分类应用中，如需要识别不同品种的花，但为每个特定的花卉品种收集足够的图像实例难度大，存在许多稀有品种无法找到对应的标记实例
  - <u>目标类（target classes）随时间会发生变化</u>：对于识别某一风格或品牌产品的图像，由于会有新的风格和品牌的产品出现，而新产品很难找到相应的标记实例。
  - <u>一些特定的任务中，获取带标签的实例成本高</u>：由于实例标记过程成本高且耗时，现有数据集所涵盖的类的数量有限，且许多类没有标记实例。如图像语义分割问题中，对训练数据图像的标记是像素级的
  > 上述应用场景中，有许多类没有标记实例，需要分类器具有能够确定<u>属于这些类的实例的类标签</u>的能力。因此需要Zero-shot learning，对没有标记实例的类的实例进行分类。

(2).定义 Definition    
  - 在zero-shot learning中，特征空间(feature space)中存在一些标记的训练实例，这些训练实例所涵盖的类称为seen classes；同时在特征空间中，还存在一些属于另一些类的未标记的测试实例，这些类称为unseen classes。特征空间通常是实数空间，通常假定每个实例都属于一个类，则每个实例都可以表示为特征空间中的一个向量(Vector)。    
    ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/ZS1.png)
    - 用$S=\{c_{i}^{S} | i=1, \ldots, N_{s}\}$表示所有seen的类别的集合其中每个$c_{\dot{i}}^{S}$表示一个seen类别
    - 用$\mathcal{U}=\{c_{i}^{u} | i=1, \ldots, N_{u}\}$表示所有unseen别的集合，其中每个$c_{i}^{u}$表示一个unseen类别。其中$S \cap \mathcal{U}=\varnothing$  
    - 用$\mathcal{X}$表示特征空间，是一个D维的实数空间$\mathbb{R}^{D}$
    - 用$D^{t r}=\left\{\left(\mathrm{x}_{i}^{t r}, y_{i}^{t r}\right)\in X \times \mathcal{S}\right\}_{i=1}^{N_{t r}}$表示所属类别为seenclassesd的的训练标签实例集合。每个标签实例$\left(\mathrm{x}_{i}^{t r} y_{i}^{t r}\right)$，$\mathrm{x}_{i}^{t r}$是特征空间中的实例，$y{i}^{t r}$是对应的类标签
    - 用$X^{t e}=\left\{\mathbf{x}_{i}^{t e} \in X\right\}_{i=1}^{N_{te}}$表示测试实例集合，每个$\mathbf{x}_{i}^{t e}$是特征空间中的测试例，用$Y^{t e}=\left\{y_{i}^{t e} \in \mathcal{U}\right\}_{i=1}^{N{t e}}$表示需要被预测的$X^{t e}$对应的类标签。
    ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/ZS2.png)   
  - **Definition 1.1**：对于给定所属类别在seen classes集合$S$中的训练标签实例$D^{t r}$，zero-shot learning的目标是学习一个分类器$f^{u}(\cdot) : X \rightarrow \mathcal{U}$，能够对所述类别在unseen classes集合$\mathcal{U}$的测试实例$X^{t e}$进行分类。
    - 从Definition 1.1可以看出，zero-shot learning的一般思想是将训练实$D^{t r}$中包含的知识转移到测试实例的分类任务中。
    - zero-shot learning中，有相同的特征空间，但由于训练和测试实例所涵盖标签空间是不相交的，因此zero-shot learning其本质属于transfer learnin中的heterogeneous(异构) transfer learning。（迁移学习相关内容详见[Transfer-Learning.md](https://github.com/jyniki/Learn2019/blobmaster/research/Transfer-Learning.md)）     
    ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/ZS3.png)
    - 与HTL-DLS(heterogeneous transfer learning with different labelspaces)方法比较：HTL-DLS方法中，存在一些标签实例所属的类在目标标签空中，而zero-shot learning中，不存在所属的类在在目标标签空间（unseenclasses）中的已标记实例。
  
  - **Auxiliary information 辅助信息**：由于zero-shot learning中不存属于unseen classes的已标记实例，因此在解决zero-shot learning问题中需一些辅助信息。
      - 辅助信息应该包含所有unseen classes的信息
      - 同时辅助信息应该与特征空间中的实例相关联
      - 目前zero-shot learning方法所涉及的辅助信息通常是一些语义信息(semantic information)，它形成了一个包含可见类和不可见类的空间。由于这个空间包含语义信息，所以通常称为语义空间。

  - **语义空间**：
      - 与特征空间相似，语义空间通常也是实数空间。
      - 在语义空间中，每个类都有一个相应的向量表示，被称为这个类的类原(class prototype)
      - 用$\mathcal{T}$表示语义空间，是一个M维的实数空间$\mathbb{R}^{M}$
      - $\mathbf{t}_{i}^{s} \in \mathcal{T}$是seen类别$\mathcal{c}{i}^{s}$的类原型
      - $\mathfrak{t}_{i}^{u} \in \mathcal{T}$是unseen类别$\mathcal{c}_{i}^{u}$的类原型
      - $T^{s}=\left\{\mathbf{t}_{i}^{s}\right\}_{i=1}^{N_{s}}$表seen classes的类原型集，$T^{u}=\left\{t_{i}^{u}\right\}_{i=1}{N_{u}}$表示unseen classes的类原型集
      - 用$\pi(\cdot) : \mathcal{S} \cup \mathcal{U} \rightarrow\mathcal{T}$表示类原型函数，输入类标签，输出相应的类原型
  - 在zero-shot learning中，除了训练实例$D^{t r}$，类原型$T^{s}$和$T^{u}$也参与zero-shot 分类器$f^{u}(\cdot)$的学习获取。
      ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/ZS4.png)

  - Zero-shot classifier **learning setting**：   
    - **Definition 1.2**：(Class-Inductive Instance-Inductive Setting, CIII):模型学习只使用标记的训练实例集$D^{t r}$和seen class类原型集$T^{s}$
    - **Definition 1.3**：(Class-Transductive Instance-Inductive Setting, CTII):模型学习使用了训练实例集$D^{t r}$、seen class类原型集$T^{s}$和unseen class类原型集$T^{u}$
    - **Definition 1.4**：(Class-Transductive Instance-Transductive Setting, CTIT):模型学习使用了训练实例集$D^{t r}$、seen class类原型集$T^{s}$、unseen class类原型集$T^{u}$和未标签的测试实例   
      - `从CIII到CTIT，分类器模型学习了越来越多测试实例的信息`
      ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/ZS5.png)
      - `在CIII设置下(one-order transformation)，由于模型学习不涉及测试实例的信息，因此在该设置下的一些方法中，域偏移的问题比较严重。但是由于该设置下的模型没有针对特定的unseen classes和测试实例进行优化，当需要对新的unseen class或测试实例进行分类时，模型的泛化能力通常要优于CTII或CTIT设置下学习的模型`      
      - `在CTII设置下(two-order transformation)，由于模型涉及到unseen class类原型，因此域偏移问题不那么严重，然而此学习设置下的模型泛化到新的unseen classes的能力有限`
      - `在CTIT设置下(high-order transformation)，由于模型对特定的unseen classes和测试实例进行了优化，领域偏移问题最不严重，但模型泛化能力最有限 `    



#### 3. Methods 方法     

![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/ZS6.png)  

**I. Classifier-Based Methods**       
`focus:直接学习一个能分类unseen classes的分类器`        
- 现有的基于分类器的方法通常采用一种one-versus-rest(一对多)的解决方案来学习多类zero-shot分类器。对于每个unseen class，都学习一个binary one-versus-rest(二元一对多)分类器$f_{i}^{u}(\cdot) : \mathbb{R}^{D} \rightarrow\{0,1\}$。 最终得到zero-shot分类器由$N_u$个binary one-versus-rest分类器组成$\left\{f_{i}^{u}(\cdot) | i=1, \ldots, N_{u}\right\}$
  - **correspondence methods**：通过对unseen每个类binary one-versus-rest分类器与对应类原型的相对关系来构造unseen classes分类器
    - 在语义空间中，每个类只有一个对应的原型，可以将原型看作这个类的表示；同时在特征空间中，对于每个类都有对应的binary one-versus-rest分类器，也可以看作是这个类的表示。
    - Aim：学习这两种表示形式之间的对应函数（correspondence function）
    - General procedure：
      - step1：利用可用数据（根据不同的学习设置，可用数据是不同的），学习对应函数    
      - step2：对于每个unseen class，根据对应类原型和学习得到的对应函数，构建该类的binary one-versus-rest分类器
      - step3：；利用得到的这些二元分类器$\left\{f_{i}^{u}(\cdot)\right\}_{i=1}^{N_{u}}$，实现对测试实例的分类       

  - **relationship methods**：根据类之间的关系构造unseen classes分类器     
    - 在特征空间中，可以利用可用数据（根据不同的学习设置，可用数据是不同的）学习seen classes的binary one-versus-rest分类器$\left\{f_{i}^{s}(\cdot)\right\}_{i=1}^{N_{s}}$；同时通过计算相应原型之间的关系或通过其他方法获得seen classes和unseen classes之间的关系
    - Aim：学习seen classes这些binary one-versus-rest分类器和这些类的关系   
    - General procedure：
      - step1：利用可用数据学习seen classes的这些二元分类器$\left\{f_{i}^{s}(\cdot)\right\}_{i=1}^{N_{s}}$    
      - step2：通过计算相应原型之间的关系或通过其他方法获得seen classes和unseen classes之间的关系$\delta$
      - step3：利用得到的seen classes分类器$\left\{f_{i}^{s}(\cdot)\right\}_{i=1}^{N_{s}}$和关系$\delta$，构建unseen classes的分类器$f^{u}(\cdot)=\left\{f_{i}^{u}(\cdot)\right\}_{i=1}^{N_{u}}$，实现对测试实例的分类  
    
  - **combination methods**：通过对“用于构成类的基本元素”的分类器进行组合，为unseen classes构造分类器   
    - 在特征空间，认为有一组<u>基本元素</u>用于组成类，每个seen class和unseen class都是这些基本元素的组合。对应的映射到语义空间，每个维度代表一个基本元素，每个类原型代表对应类的这些基本元素的组合。 因此该方法主要使用于语义空间，其中类原型中的每个维度取1或0，表示类是否具有相应的元素。
    - 由于该方法目前是基于二元属性空间（binary attribute spaces）发展的，因此基本元素在该空间中称为属性(attribute)。在binary attribute spaces中，seen classes 和unseen classes的类原型由属性组成，每个维度都是一个属性。因此对于类$c_i$对应的类原型$t_i$，使用$a_i$表示类原型由属性组成。将seen classes对应的类原型集表示为 $A^{s}=\left\{\mathbf{a}_{i}^{s}\right\}_{i=1}^{\dot{N}_{s}}$，将unseen classes对应的类原型集表示为$A^{u}=\left\{\mathbf{a}_{i}^{u}\right\}_{i=1}^{N_{u}}$                
    - General procedure：
      - step1：利用可用数据（根据不同的学习设置，可用数据是不同的），首先学习属性(attributes)的分类器$\left\{f_{i}^{a}(\cdot)\right\}_{i=1}^{M}$        
      - step2：根据学习得到的属性分类器，通过一些推理模型（inference model）得到unseen classes的分类器$f^{u}(\cdot)=\left\{f_{i}^{u}(\cdot)\right\}_{i=1}^{N_{u}}$        
  

**II. Instance-Based Methods**    
`focus:获取属于unseen类的标签实例并将其用于分类器学习`       
- 基于实例的方法的目标是首先为unseen classes获取带标签的实例，然后用这些实例学习zero-shot 分类器
  - **projection methods**：通过将特征空间实例和语义空间类原型映射到公共空间，为unseen classes获取带标签的实例。从而在公共空间实现分类。
    - 在特征空间中，有标签的训练实例属于seen classes。同时在语义空间，seen classes和unseen classes的类原型都存在。
    - 由于特征空间和语义空间都是实数空间，其中实例和类原型都是向量，类原型也可以认为是带标签的实例，因此两个空间可以映射到同一个公共空间。
    - 对于每个unseen class，在特征空间没有带标签的实例，它在语义空间的类原型是该类唯一的标签实例。因此对于每个unseen class，只有一个带标签的实例可用。
    - General procedure:
      - step1：通过映射函数$\theta(\cdot)$和$\xi(\cdot)$将在特征空间$\mathcal(X)$的实例$x_i$和在语义空间$\mathcal(T)$的类原型$t_j$映射到公共空间$\mathcal{P}$
     $X \rightarrow \mathcal{P} : \mathbf{z}_{i}=\theta\left(\mathbf{x}_{i}\right)$,$\mathcal{T} \rightarrow \mathcal{P} : \mathbf{b}_{j}=\xi\left(\mathbf{t}_{j}\right)$
       - step2：由于unseen classes只有很少的标签实例，通常使用最邻近分类（1NN）或其他类似方法进行分类，1NN方法能够对只带一个标签的实例进行分类。最终得到在公共空间实现unseen classes分类的分类器。     
  
  - **instance-borrowing methods**：通过借用训练实例，为unseen classes获取带标签的实例，从而学习unseen classes分类器实现分类
    - 该方法基于类之间的相似性。对于unseen class实例，通过找到类似的seen class实例，从而识别unseen class的实例。     
    - General procedure:
      - step1：在实例借用前，需要确定unseen classes，因此在模型优化时涉及到unseen classes对应的类原型。所以不能用CIII学习设置。
      - step2：对于每个unseen class。从训练实例中借用一些实例，并分配该类的标签
      - step3：利用所有unseen class的借用实例，学习unseen classes分类器，实现对测试实例的分类。
  
  - **synthesizing methods**：通过合成一些伪实例获取unseen classes的标签实例，从而学习unseen classes分类器实现分类
    - step1：在实例合成前，需要确定unseen classes，因此在模型优化时涉及到unseen classes对应的类原型。所以不能用CIII学习设置。
    - step2：合成一些伪实例获取unseen classes的标签实例
      - 合成方法1：估计每个seen class实例的分布参数，并利用语义空间中的类原型，计算出seen classes和unseen classes之间的关系。根据分布参数和seen & unseen classes之间的关系，为每个unseen class合成为伪实例
      - 合成方法2：生成模型利用seen class学习从属性（attribute）到特征的转换。然后对每一个unseen class，将对应的类原型和一些噪声作为生成模型的输入，合成相应的伪实例   
    - step3：利用所有unseen class的伪实例，学习unseen classes分类器，实现对测试实例的分类
![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/ZS7.png)



#### 4. Application
(1). Classification    
> Ref: [A CLOSER LOOK AT FEW-SHOT CLASSIFICATION](https://github.com/jyniki/Learn2019/blob/master/research/reference/A%20CLOSER%20LOOK%20AT%20FEW-SHOT%20CLASSIFICATION.pdf)

(2). Object detection
> Ref: [A Deep One-Shot Network for Query-based Logo Retrieval](https://github.com/jyniki/Learn2019/blob/master/research/reference/A%20Deep%20One-Shot%20Network%20for%20Query-based%20Logo%20Retrieval.pdf)

(3). Recognition
> Ref: [Recent Advances in Zero-shot Recognition](https://github.com/jyniki/Learn2019/blob/master/research/reference/Recent%20Advances%20in%20Zero-shot%20Recognition.pdf)


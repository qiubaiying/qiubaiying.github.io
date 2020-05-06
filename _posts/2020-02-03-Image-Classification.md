---
layout: post          
title: Image Classification 图像分类               
categories: CV          
tags: Classification Deep-Learning
---
## Image Classification 图像分类

#### 1.  Introduction 介绍：
  - 图像分类主要解决如何将图像按视觉特点分为不同类别的问题。其是计算机视觉中的基础任务，也是图像检测、图像分割、图像搜索等高级任务的根本。
    
#### 2.  Challenge 困难和挑战：

  - 多视角：收集同一个物体图像，获取的角度是多变的；
    
  - 尺度：在现实生活中，很多物体的尺度都是千变万化；
    
  - 遮挡：目标物体可能被挡住。有时候只有物体的一小部分是可见的；
    
  - 光照条件：在像素层面上，光照的影响非常大；
    
  - 类内差异：一类物体的个体之间有许多不同的对象，每个都有自己的外形，细粒度分类难度大。

    
#### 3. Classification Model 分类模型：

  ```markdown
  根据不同的数据集特性和场景功能需求，选择不同的分类模型进行图像分类。
  ```

  *场景功能需求：*
     
  - Binary Classification/Multiclass Classification Model 二/多分类模型
  - General Image Classification/Fine-grained Image Classification Model通用图像分类/细粒度图像分类模型
    - General Image Classification Model：主要解决识别图像上主体类别的问题（Example: 区分猫/狗）
    
    - Fine-grained Image Classification Model：解决如何将大类进行细分类的问题（Example: 识别狗的品种） 
      
      ​    
    

  *数据集特性：*   
     
  -  Supervised/Unsupervised Classification Model 有监督/无监督分类模型
     ![img](picture/classification.jpg)  

​    


#### 4.  Image Classification Technique 图像分类方法：  
  **4.1 Traditional Methods 传统方法：**      
  ```markdown
  需要进行特征提取和分类两个步骤。
  ```
  - 特征提取方法（ref: https://blog.csdn.net/yuanlulu/article/details/82148429）
    - SIFT特征描述算子，在不同的尺寸空间上查找关键点，并计算出关键点的方向。SIFT所查找到的关键点是一些十分突出、不会因光照、仿射变换和噪音等因素而变化的点，如角点、边缘点、暗区的亮点及亮区的暗点等，适合提取`关键点特征`
    - ORB特征描述算子，运行时间远由于SIFT，可用于**实时性**特征检测，适合提取`角点特征`
    - HOG (Histogram of Oriented Gradient，方向梯度直方图)：*提取前先灰度化然后Gamma矫正，降低图像局部的阴影和光照变化所造成的影响，同时抑制噪声的干扰*。适合提取`边缘特征`
    - LBP (Local Binary Pattern，局部二值模式)：一种用来描述图像局部纹理特征的算子，具有旋转不变性和灰度不变性等优点，适合提取`纹理特征`。
    - HAAR特征：分为边缘特征、线性特征、中心特征和对角线特征，组合成特征模板
    - **小结：** 
         - SIFT、ORB提取的是关键点的信息，可以用于表示某些图像的细节，可用于图像匹配和场景融合等。
    
          - HOG、LBP、HAAR提取的面的特征信息，可以表示某一区域的特征，可用于物体识别等。
    
  - 分类模型
    - Naive Bayesian 
    - Random Forest
    - AdaBoost
    - KNN
    - SVM

     `注：分类模型的选择通常比特征选择简单的多，只需要把备选的模型都试一遍，挑效果最好的模型进行调参，得到最优的分类器。`


  **4.2 Deep Learning 深度学习：**

  ```markdown
  深度学习在图像分类中的应用主要是以卷积神经网络（Convolution Neural Network,CNN）为代表，
  主要通过`有监督的方法`让Machine去学习如何表达某张图片的特征。
  ```

  图像分类网络模型:   
  > - 常用的标准网络模型：LeNet、AlexNet、VGGNet系列、ResNet系列、Inception系列、DenseNet系列、Googlenet、Nasnet、Xception、SENet  
  > - 轻量化网络模型：Mobilenet v1,v2、Shufflenet v1,v2、Squeezenet           
  >
  > **(1). VGG**           
  >> - 主要使用了3 $\times$ 3的卷积和2 $\times$ 2的池化操作的重复结构，串联起来便可达到使网络的层数更多，计算量更少的效果。
  >> - 常见的CNN结构一般为：输入$\to$[[卷积$\to$激活函数]$\times$$N$$\to$池化]$\times$$M$$\to$[全连接$\to$激活]$\times$$K$$\to$全连接，$N$个卷积+激活+池化构成一个子网络，最后进行一个全连接+softmax（对于二分类使用sigmoid）  
  > 
  > **(2). ResNet**
  >> 随着模型深度加深到一定程度，错误率反而增加，其原因归根于优化难题 ，即模型越复杂，随机梯度下降（SGD）优化越难。
  >> - ResNet提出了“残差结构”理论，即输入$X$经过$N$层网络之后输出$Y$,然后再将$X$和$Y$作对应元素相加，这样就结合了原始$X$的信息，形成一个`残差块`。*这个操作不会增加网络的参数和计算量，但可以加速训练和提高训练的效果，且当模型加深后，能很好地解决**退化**问题。*    
  >>![img](picture/ResNet.png)       
  >> - 对于模型，针对不同的数据集进行调参，包括学习率learning rate，epochs大小，优化算法，加入BatchNormalization、Dropout或Early Stopping等操作，或者调整后面基层的网络类型与神经元数量，或者调整基础网络base。当训练模型达到满意的效果，且无明显的过拟合现象，就可以保存模型，以供后期预测或推断（Inference）使用。
  >
  > **(3). Inception**   
  >> Inception与VGG和ResNet相比，从宽度方面着手。其核心思想是使用多尺寸卷积核去观察输入数据，然后由计算机选择使用哪种尺寸或更加关注哪种尺寸。    
  >> - Inception V1吸纳了Network in Network的思想，使用1 $\times$ 1的卷积和来进行*降维和升维*，同时使用不同的卷积核（1 $\times$ 1、3 $\times$ 3、5 $\times$ 5卷积）来设置不同的感受野，让网络看到不同层面和大小的电脑关系，最后将所有看到的东西串联起来形成该层的输出。然后利用多个这样的结构，形成一个大的网络。       
  >> ![img](picture/InceptionV1.png)   
  >> - Inception V2使用小卷积核来替换大卷积核（使用两个3 $\times$ 3卷积代替5 $\times$ 5），使得卷积参数大大减少；同时提出了非对称卷积操作（将3 $\times$ 3卷积转换为1 $times$ 3和3 $\times$ 1两个卷积效果的叠加），使得参数进一步减小。另外还使用了Batch Normalization（BN）结构使得整个网络更容易训练。     
  >> ![img](picture/InceptionV2.png)   
  >> - Inception V3对下采样过程中的特征提取作了组合，*常规的操作一般是卷积再池化或池化后再卷积，Inception V3则将这一步作了分支，使得网络变宽*  
  >>![img](picture/InceptionV3.png)         
  >> - Inception V4吸收了ResNet的思想，传统ResNet过程中使用的是CNN结构，`将CNN结构换成Inception的基本结构`，得到了Inception-ResNet混合结构。 
  >    
  >> *Inception 系列论文:*  
  >> - Inception V1: [Going Deeper with Convolutions](https://arxiv.org/pdf/1409.4842.pdf)           
  >> - Inception V2: [Batch Normalization: Accelerating Deep Network Training by Reducing Internal Covariate Shift](http://de.arxiv.org/pdf/1502.03167)          
  >> - Inception V3: [Rethinking the Inception Architecture for Computer Vision](https://arxiv.org/pdf/1512.00567.pdf)
  >> - Inception V4: [Inception-v4, Inception-ResNet and the Impact of Residual Connections on Learning](https://arxiv.org/pdf/1602.07261.pdf)
> 
> **(4). Xception** 
>> - 上述Inception系列中卷积操作在空间和通道方向是耦合的在处理一个感受野时，会同时考虑所有通道，如RGB三通道）。   
>> - Inception使用1 $\times$ 1卷积将输入映射到多个更小间，对每个子空间再进行卷积操作；而Xception则直接为*每个输道*进行单独空间映射，再使用1 $\times$ 1卷积获取跨通道信息。 
>> Xception的移动版应用为MobileNet。       
> 
> **(5). DenseNet**
>> - DenseNet主要更关注于**feature**方面，网络结构不复杂有效。  
>> - 在上述ResNet类网络中，利用跨层跳转的方式，增强层与层的信息传递，而DenseNet将所有层都连接起来，即**当前层会接面所有层的直接信息传递，所以会达到一种减轻梯度消失的效果；传播梯度时，所有层都可以直接从$loss$中获取梯度信息**
>> - ResNet是做的$Y=F(X)+X$的操作，而DenseNet则做的是$Y=[X_0,X_1,...X_N])$的操作，在使用1 $\times$ 1卷积进行通维。

#### 5.  Summary 总结分析 
- 介绍了图像分类中的传统方法和深度学习方法
- 介绍了深度学习研究领域比较成熟的几个图像分类模型。
- 目前服务器端常用的还是ResNet系列和Inception系列，VGG模型使用频率已经相应减少；而在移动端则是以MobileNet这类用得比较多。
- 深度学习进行图像分类是基于大量数据的监督学习获取知识的，学习样本与标签需要一一对应起来。当类别多样、类别之间关系定义不明确等情况时，深度学习进行图像分类的缺点就十分明显。

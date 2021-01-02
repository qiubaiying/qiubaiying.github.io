---
layout:     post
title:      Image Segmentation 
subtitle:   图像分割介绍
date:       2020-02-05
author:     JY
header-img: img/post-bg.jpg
catalog: true
tags:
    - Introduction
---



#### **1. Introduction 介绍**
- 图像分割是将图像细分为多个图像子区域的过程，使得图像更加易于理解和分析。
- 图像分割主要用于定位物体的边界，即将每个像素进行分类，使得同一物体具有共同的类别属性，即可展现出共同的视觉特性。
- 分割时一般会使用某种属性(颜色、亮度、纹理等)的相似度量方法，使得同一个子区域中的像素在此方法的计算下都很相似，而不同区域则差异很大。——**类内差异小，类见差异大**      
![img](picture/processing.png)



#### **2. Methods 方法**

(1). 传统分割算法 
> - *基于阈值的分割方法*            
>   - 基于图像的灰度特征来计算一个或多个灰度阈值，并将图像中每个像素的灰度值与阈值作比较，最后将像素根据比较结果分到合适的类别中。**该方法最为关键的一步就是按照某个准则函数来求解最佳灰度阈值。**
>   - **单阈值分割**:图像只有目标和背景两大类，只需要选取一个阈值进行分割  
> **多阈值分割**:图像中有多个目标需要提取，需要选取多个阈值将每个目标分隔开    
>   - 优点：阈值法特别适用于目标和背景占据不同灰度级范围的图。  
> 缺点：只考虑像素点灰度值本身的特征，一般不考虑空间特征，对噪声比较敏感，鲁棒性不高。    
> 
> - *基于区域的分割方法*  
>   - 以直接寻找区域为基础，按照相似性准则分成不同的区域。
>   - **种子区域生长法**：从单个像素出发，逐步合并以形成所需要的分割区域；该方法的关键是选择合适的初始种子像素以及合理的生长准则。     
> **区域分裂合并法**：从全局出发，逐步切割至所需的分割区域。   
> **分水岭法**：把图像看作是测地学上的拓扑地貌，图像中每一点像素的灰度值表示该点的海拔高度，每一个局部极小值及其影响区域称为集水盆，而集水盆的边界则形成分水岭。          
>   - 优点：对复杂图像分割效果好       
> 缺点：算法复杂，计算量大
> - *基于边缘检测的分割方法*
>   - 通过检测包含不同区域的边缘来实现分割。通常不同区域的边界上像素的灰度值变化比较剧烈，如果将图片从空间域通过傅里叶变换到频率域，边缘就对应着高频部分，这是一种非常简单的边缘检测算法。    
>   - **串行边缘检测**：想确定当前像素点是否属于检测边缘上的一点，取决于先前像素的验证结果。      
> **并行边缘检测**：一个像素点是否属于检测边缘上的一点取决于当前正在检测的像素点以及与该像素点的一些临近像素点。
>   - 最简单的边缘检测方法是并行微分算子法，它利用相邻区域的像素值不连续的性质，采用一阶或者二阶导数来检测边缘点。
>   - 目前常用的边缘检测算子有梯度、Canny、Sobel等。近年来还提出了基于曲面拟合的方法、基于边界曲线拟合的方法、基于反应-扩散方程的方法、串行边界查找、基于变形模型的方法。   
>   - 优点：边缘定位准确，速度快      
> 缺点：(I).不能保证边缘的连续性和封闭性；在高细节区域存在大量的碎边缘，难以形成一个大区域。(II).边缘点信息获取到之后还需要后续的处理或者其他相关算法相结合才能完成分割任务。    
> - *K-means聚类算法*
>   - 首先从总的数据对象中选择k个对象作为初始的聚类中心，然后扫描剩下的其他对象，按其与各聚类中心的相似距离进行划分，然后在每个新的划分中重新计算聚类中心，不断重复这两步，直到中心变化不大或达到最大迭代次数。
>   - 相似距离常常指像素与聚类中心的绝对差异或差异的平方，这种差异通常有颜色、纹理、位置或它们的加权组合。   
>   - 缺点：该算法对初始聚类中心和聚类个数依赖较强。   
> - *图切割 Graph Cut*
>   - 将图像分割与图论中的最小割联系起来，可用于前景背景分割
>   - 通过将图像转换为上述S-T图，通过由Boykov和Kolmogorov发明的max-flow/min-cut算法获得S-T图的min cut，这个min cut把图的顶点分为两个不相交的子集S和T，这两个子集就对应图像的前景像素集和背景像素集，即完成了图像分割。  
>   - 具体步骤：
>       - 首先将图像中的像素点转换为无向图$＜V,E＞$中的顶点（Vertex)，相邻像素间用实边连接。   
>        - 在图中添加两个Terminal顶点，分别用S和T表示，可理解为代表前景和背景，这两个点之外的其他点都会与这两个顶点相连。每条边都有一个非负的权值We，可理解为cost。
>       - 一个cut（割集）就是图中边集合E的一个子集，这个cut的cost就是子集内所有边权值的总和，如果一个cut内所有边的权值之和最小，那么它就是min cut。       
![img](picture/graph-cut.png)



(2). 深度学习方法

> 基于CNN，有FCN、SegNet、DeepLab、RefineNet、PSPNet、Mask R-CNN、MaskLab、FCIS和PANet等算法。（详见[3、分割算法分类](#3分割算法分类))



#### **3、Methods 分割算法分类**
> 根据不同的分割粒度，主要可以分为物体分割、语义分割和实例分割这3类图像分割算法(另外还有全景分割则是将语义分割和实例分割结合)。其中基于深度学习的主要有**语义分割**和**实例分割**。
> ![img](picture/compare.png)     
> `从左至右分别为语义分割、实例分割和全景分割`



##### 物体分割

> - 物体分割是将图像的前景和背景进行分割，前景一般包含实际分析所关心的物体。 ——`不需要区分主体间的差别，输入为图片，输出是一张与输入同尺寸的二值灰度梦版图`
> - 深度学习在物体分割方面有一定研究(但研究较少)，如[Deep Image Matting](https://github.com/jyniki/Learn2019/blob/master/research/reference/Deep%20Image%20Matting.pdf)
>> - 提出了一种基于深度学习的新算法，主要解决传统方法中只有low-level features和缺乏high-level context的问题。                    
>> - 该深度模型分为两个阶段，第一阶段是深度卷积编码-解吗网络，将原图和对应的三分图（前景、背景和未知区域三色分开的图，trimap）作为输入，并预测图像的alpha matte（蒙版）。第二阶段是一个小型卷积神经网络，对第一个网络预测的alpha matte进行精炼，从而拥有更精准的$\alpha$值和锐化边缘。     
>> ![img](picture/deep-image-matting.png)
---
---


##### 语义分割

> - 语义分割主要是在像素级别进行分类，同类别的分为一类。它比目标检测算法预测的边框更加精细。——`是从像素级别理解和识别图片的内容，其输入为图片，输出是与输入图片同尺寸的分割标记，每个像素会被识别为一个类别`   
> - 深度学习在语义分割的应用主要有FCN、SegNet、DeepLab、Refine和NetPSPNet等。
>> *(1) FCN*                         
>> [《Fully Convolutional Networks for Semantic Segmentation》](https://arxiv.org/pdf/1411.4038.pdf) 
>> - **卷积化（convolutionalization）:**对于一般的分类CNN网络，都会在网络的最会加入一些全连接层，通过softmax后就可以获得类别概率信息，但这个概率信息是1维的，**只能标识整个图片的类别，不能标识每个像素点的类别**，因此这种全连接方法不适用于图像分割。而FCN**将后面几个全连接层换成卷积**，这样就获得一张2维的feature map，后接softmax层获得每个像素点的分类信息，从而实现分割问题。      
![img](picture/FCN1.jpg)     
>> - **上采样（upsampling）:**与CNN在卷积层之后使用全连接层得到**固定长度的特征向量**进行分类（全连接层+softmax输出）不同，FCN可以**接受任意尺寸的输入图像**，采用反卷积层对最后一个卷积层的feature map进行**上采样**，使其恢复到输入图像相同的尺寸，从而可以对每个像素都产生一个预测，同时保留原始输入图像的空间信息，最后在上采样的特征图上进行逐像素分类。  
>> ![img](picture/FCN.jpg)
>> - **跳跃结构（skip architecture）:** 直接将全卷积后的结果进行上采样后得到的结果通常是很粗糙的，需要跳跃结构用来优化最终结果。其思路是将不同池化层的结果进行上采样，然后结合这些结果来优化输出(fusion)。
>> ![img](picture/skip.jpg)
>> - FCN优点：进行像素级别端对端的训练    
>> ![img](picture/FCN2.jpg)            
>> - FCN缺点：对细节处理不够好，没有充分考虑像素间的空间相关性；忽略了空间规整（spatial regularization）步骤，缺乏空间一致性。
---
>> *(2) UNet*  
>>[https://arxiv.org/pdf/1505.04597v1.pdf](https://arxiv.org/pdf/1505.04597v1.pdf)     
>> U-Net整体的流程是编码和解码（encoder-decoder）
>> U-Net包括两个部分，第一部分为特征提取，类似于VGG；第二部分为上采样部分。
>> - 特征提取部分：每经过一个池化层就为一个尺度，包括原图尺度一共有5个尺度
>> - 上采样部分：每上采样一次，就和特征提取部分对应的通道数相同尺度融合，*但融合前要将其crop* 
![img](picture/unet.png)

---
>> *(3) SegNet*               
>> [《A Deep Convolutional Encoder-Decoder Architecture for Image Segmentation》](https://arxiv.org/abs/1511.00561)
>> - **编码-解码器架构：** SegNet具有编码器网络和相应的解码器网络，接着是按最终像素的分类层。
>>   - Encoder 编码器       
>>     - 在编码器处，执行卷积和最大池化。    
>>     - 卷积的作用是提取特征，SegNet使用的卷积为[same](https://blog.csdn.net/leviopku/article/details/80327478)卷积，卷积后不改变图片大小。     
>>     - 通过池化（pooling）使图片变小，并存储相应的最大池化索引（位置）
>>   - Decoder 解码器     
>>     - 在解码器处，进行上采样和（反）卷积       
>>     - 上采样使图片变大到原始尺寸，SegNet通过调用相应编码器层处的最大池化索引以进行上采样，得到稀疏的特征图。    
>>     - （反）卷积的作用是使得图像分类后特征得以重现，通过将特征图与可训练的解码滤波器卷积得到高维的特征图  
>>      *(对比FCN解码技术：对编码的特征图进行降维，并在解码网络中使用反卷积进行上采样获得特征图。上采样的特征图与降维的编码图维度相同，进行element-wise add得到最终的解码特征图。FCN解码模型需要存储编码特征图，在嵌入式设备中内存紧张)*
>>     ![img](picture/decoder.png) 
>>   - 最后使用softmax分类器来预测每个像素的类别      
>>     ![img](picture/SegNet.png)
---
>> *(4) PSPNet*                         
>> [《Pyramid Scene Parsing Network》](https://arxiv.org/pdf/1612.01105.pdf)
>> ##### **主要贡献：**
>> - 考虑更多的上下文信息以及不同的全局信息，提出了一个金字塔场景分析网络。使用了多尺度Pooling得到不同尺度的特征图，Concat起来得到多尺度特征。
>> - 对基于深度监督损失函数的ResNet(残差网络)提出了一种有效的优化策略
>> - 构建了一个用于state of the art的场景解析和语义分割的实践系统
>> ##### 金字塔池化模块
>> - 融合了四种不同尺度下的特征。由于不同层级输出不同尺寸的特征图，为了保持全局特征的权重，在每个金字塔层级后使用$1{\times}1$的卷积核。当某个层级维度为n时，可将语境特征的维数降到原始特征的1/n，然后通过双线性插值直接对低维特征图进行上采样，使其与原始特征图尺度相同，最终将不同层级的特征图拼接为最终的金字塔池化全局特征。   
>> ##### 金字塔场景分析网络（PSPNet） 
>> - 对于输入图像，使用一个带有拓展网络策略（dilated network）且预训练过的ResNet模型来提取特征图（feature map）
>> - 对特征图使用金字塔池化模块来获取语境信息
>> - 将融合得到的全局特征与原始特征图连接起来
>> - 通过一层卷积生成最终的预测图      
>> ![img](picture/PSPNet.png)
>> ##### 残差网络优化
>> - 对于ResNet残差网络，除了使用softmax loss（图中loss1），还引入了res4b22残差块，构造另一个辅助分类器（图中loss2），并引入一个权重参数来控制loss2的权重，辅助分类器能够优化学习过程。
>> ![img](picture/ResNet101.png)
---
>> *(5) DeepLab系列*
>> - DeepLab中主要使用的技术包括<u>多尺度特征融合、残差块、膨胀卷积以及膨胀空间金字塔池化</u>。
>>      - 其主要特征提取网络采用了ResNet方式
>>      - 膨胀卷积（空洞卷积 Atrous Convolution）有一个拓张因子（rate），它将决定卷积的感受野大小，将输入的Feature Map隔rate-1进行采样，然后再将采样后的结果进行卷积操作（使用0填充卷积之间的缝隙，缝隙大小为拓张因子减1，变相扩大了卷积的视野。）
>>      - 膨胀空间金字塔池化主要利用不同扩张因子的卷积操作获取多尺度的特征信息，同时为了利用全局的信息，最后使用了全局平均池化获取图像级别的特征
>>      - 最后将综合的结果送入条件随机场（CRF）进行精细调整（CRF会尝试取寻找像素之间的关系：相邻且相似的像素属于同一类别是大概率事件，CRF考虑了像素级别分类的概率，通过迭代完成细化分割操作），完成最终结果输出。      

>> **DeepLab v1**                           
>> [《Semantic Image Segmentation with Deep Convolutional Nets and Fully Connected CRFs》](https://arxiv.org/abs/1412.7062)   
>> - 是结合了深度卷积神经网络（DCNN）和概率图模型（DenseCRF）的方法。主要使用DCNN 进行密集的分类任务，产生比较粗糙的分割结束，然后使用完全连接的条件随机场(CRF)对分割进行细化。  
>> - 缺点：
>>      - DCNN的高级特征具有内在不变性
>>      - DCNN连续池化和下采样造成分辨率降低    
>>      - 对于物体存在多尺度的问题，是用多个MLP（多层感知器）结合多尺度特征解决，增加了特征计算量和存储空间。    

>> **DeepLab v2**                       
>> [《DeepLab: Semantic Image Segmentation with Deep Convolutional Nets, Atrous Convolution, and Fully Connected CRFs》](https://arxiv.org/abs/1606.00915)  
>> - 在最后几个最大池化层中去除下采样，使用空洞卷积代替，以更高的采样密度计算特征映射。
>> - 提出ASPP（atrous spatial pyramid pooling）模块，在给定的输入上以不同采样率的空洞卷积并行采样，以获得了更好的分割效果。
>>     - DeepLabv2中提出的ASPP模块，在特征顶部映射图中并行使用了四种采样率的空洞卷积。
>> ![img](picture/ASPP.png)
>> - DCNN的高层特征具有内在不变性，采用全连接的CRF增强模型捕捉细节的能力。        

>> **DeepLab v3**                         
>> [《Rethinking Atrous Convolution for Semantic Image Segmentation》](https://arxiv.org/pdf/1706.05587.pdf)    
>> - 比较了多种捕获多尺度信息的方式：
>>      - 图像金字塔（Image Pyramid）:将输入图像放缩成不同比例，分别应用到DCNN上，将预测结果融合到最终输出，如DeepMedic、2-scale-RefineNet
>>      - 编解码结构（Encoder-Decoder）：利用Encoder阶段的多尺度特征，运用到Decoder阶段上恢复空间分辨率，如FCN、SegNet、PSPNet等
>>      - 级联空洞卷积（Deeper w. Atrous Convolution）：即语境模块，一般级联在原始模型的顶端，以获得长距离的语境信息，例如DenceCRF（能够对任意场距离内像素之间的关系进行建模），因此改善逐项素分类得到的分割结果。
>>      - 空间金字塔池化（Spatial Pyramid Pooling）：空间金字塔池化具有不同采样率和多种视野的卷积核，能够以多尺度捕捉对象。一般采用平行的多尺度空洞卷积（ASPP）或者多区域池化（PSPNet）得到对应尺寸语境信息的特征，最后再将其融合形成综合多个尺度语境特征向量。 
>>      ![img](picture/DeepLabV3.jpeg)
>> - 重新讨论了空洞卷积的使用，使用Atrous Convolution使网络更深且保持小的output_stride（即保持特征图分辨率）
>> - 介绍再串行和并行中采用Atrous Convolution的模块
>>      - 以串行方式设计atrous convolution模块时，复制了ResNet最后一个Block（如下图Block4），并分别进行级联与膨胀卷积操作.这种网络模型引入的stride能更容易的捕获较深的block中的大范围信息。例如将整体图像feature融合到最后一个小分辨率的feature map中，如图（a）。**但是这种连续的步长设计，对于语义分割是不利的，会破坏图像的细节信息**。因此采用由期望output_stride值来确定rates的atrous convolution进行模型设计，如图（b）
>>        ![img](picture/Atrous-Convolution.png)
>>      - 以并行方式设计atrous convolution模块时，DeepLabv3使用ASPP结构对feature map进行处理，将**BN层**添加到ASPP中，不同采样率的空洞卷积可以有效捕获多尺度信息。但随着采样率（rate）的增加，有效的卷积核参数下降($3{\times}3$的卷积退化为$1{\times}1$的卷积，只有中心的权重有效，即滤波器有效权重逐渐变小)，因此采用了全局平均池化对模型的feature map进行处理，将特征输入到$1{\times}1$卷积，然后将特征进行双线性上采样（bilinearly upsample）到特定的空间维度。      
>>        ![img](picture/Atrous-Convolution1.png

>> **DeepLab v3＋**                  
>> [《Encoder-Decoder with Atrous Separable Convolution for Semantic Image Segmentation》](https://arxiv.org/abs/1802.02611)    
>> - Deeplabv1、Deeplabv2当前存在的缺陷：输出图放大的效果不好，信息太少
>> - Deeplabv3+应用了编码-解码结构（这是一种比较快的输出图信息扩充方法），把中间一层的特征图用于输出图方法   
>> ![img](picture/deeplabv3+(2).png)      
>> - **DeepLabv3+编码-解码器结构分析：**
>>      - 将DeepLabv3作为编码器
>>      - 解码器模块：
>>          - 编码器特征双线性插值上采样4倍
>>          - 与具有相同空间分辨率的相应低级特征合并，作用一个$1{\times}1$卷积在低级特征上以减少通道
>>          - 经过一些$3{\times}3$的卷积以精炼特征
>>          - 再双线性插值上采样4倍
>>      - 在ASPP和解码模块使用depthwise separate convolution，提高编码器-解码器网络的运行速率和健壮性。
>> ![img](picture/deeplabv3+.png)
>> - 采用**Xception**模型，并对Xception进行了改进，Entry flow保持不变，添加了更多的Middle flow。所有的max pooling被depthwise separable convolution代替。在每个$3{\times}3$depthwise convolution之外，添加了BN和ReLU。
>> ![img](picture/deeplab3+(1).png)
---
---



##### 实例分割

> - 实例分割将同种类但属于不同个体的物体都区分来开。实例分割主要会预测物体的类别标签并使用像素级实例Mask来定位图像中不同数量的实例。(实例分割同时对位置信息和类别信息进行判定)
> - 目前深度学习在实例分割方面的应用主要包括Mask RCNN、FCIS、MaskLab、PANet
>> *(1) FCIS*                               
>> [《Fully Convolutional Instance-aware Semantic Segmentation》](https://arxiv.org/pdf/1611.07709.pdf)      
>> - **FCN**在实例分割上的缺点：由于卷积的平移不变性使得同一像素在图像不同区域会获得相同的相应（分类分数），即对位置不敏感，<u>只有类别输出，没有单个对象输出</u>。但实例分割则需要在不同区域操作（位置信息），使得同一像素在不同区域可能会代表不同的语义信息。——**FCN输出的是类别的概率，而没有单个实例对应的输出**
>> - **Instance FCN**在实例分割上的缺点：空间金字塔扫描非常耗时，<u>只有单个输出，无语义信息</u>，需要单独的网络检测类别信息，没有做到端对端学习。
>> ![img](picture/FCIS.jpg)    
>> - **FCIS特点**：
>>      - **Position-sensitive Score Map Parameterization**：     
>>     采用InstanceFCN中提出的positive-sensitive score map，每个score表示一个像素在某个相对位置上属于某个物体实例的似然得分。并在此基础上对物体实例区分inside/outside, inside提取关于物体的特征进行分割，outside提取物体外的特征，然后对每个像素取最大值进行平均投票，进行类别判断。           
>>      - **Joint Mask Prediction and Classification**：      
>>     使用了RPN网络代替滑窗操作，RPN会产生ROI。RPN与FCIS共享卷积，RPN产生的ROI会作用在score maps上，同时产生分类和分割预测。 
>>     FCIS使用ResNet模型，去除最后一层全连接层，仅训练卷积层，使用RPN生成ROIs，从Conv5层，生成$2k^2{\times}(C+1)$个得分图，计算分割概率图和分割得分。     
>> ![img](picture/FCIS-1.jpg)   
---
>> *(2) Mask R-CNN*          
>> [《Mask R-CNN》](https://arxiv.org/pdf/1703.06870.pdf)
>> - **Mask R-CNN**将[Faster R-CNN](https://github.com/jyniki/Learn2019/blob/master/research/Object-Detection-and-Recognition.md#3-deep-learning-%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0)与[FCN](#语义分割)结合起来，在ROI上进行分割。       
>> ![img](picture/maskrcnn.png) 
>> - 网络的输入为一张图片，输出为<u>类别、Bbox和Mask</u>，其中使用并行的FCN网络层获得Mask。每个ROI Align会对应$K{\times}m^2$维度的Mask输出（$K$为类别个数，$m$对应池化分辨率），每个Class对应一个Mask，避免了类内竞争，使分割结果不会有重叠的现象，
>> - 针对尺度同变性、像素到像素的平移同变性等情况，Mask R-CNN将Faster R-CNN中的ROI Pooling进行改良，提出了ROI Align，主要使用了双线性插值，而原始的ROI Pooling操作会破坏像素到像素的平移同变性（池化后的特征图谱与ROI中的信息不能很好的对齐）。
>> ![img](picture/ROIAlign.png)   
---
>> *(3) MaskLab*                     
>> [《MaskLab: Instance Segmentation by Refining Object Detection with Semantic and Direction Features》](https://arxiv.org/pdf/1712.04837.pdf)
>> - MaskLab基于Faster R-CNN检测网络，对检测出的ROI中进行<u>语义分割和方向预测</u>，从而实现前景和背景的分割。
>> - MaskLab使用ResNet-101作为特征提取器，包括BBox与分类、语义分割（不同类别）和方向预测（不同实例）三个组件，构建于Faster R-CNN之上。
>>      - 使用Faster R-CNN检测到回归框后，语义分割回归根据回归框预测的类别选取对应的语义通道对该区域裁剪，同时，方向预测将对应每个方向的方向信息进行继承，再使用$1{\times}1$卷积对语义输出和朝向输出的融合结果进行操作，得到粗分割Mask。
>> ![img](picture/masklab.png)
>> - 采用hypercolumn feature对得到的粗分割Mask进行细化（Mask refinement）：仅用方向和语义回归的到的粗分割Mask与ResNet-101中的低层次特征进行并联，在经过一个小型的卷积网络（3层），便可以得到细化后的Mask。
---
>> *(4) PANet*              
>> [《Path Aggregation Network for Instance Segmentation》](https://arxiv.org/abs/1803.01534)
>> - 底层特征在识别边缘线条和纹理等基础特征方面很有优势，有助于识别大型目标，但底层到高层路径太长，信息流动不够充分。PANet在Mask R-CNN的基础上进一步融合了高层和底层特征，采用了**自底向上**的路径增广方法，提升了基于候选区域的实例分割的信息流传播。      
>> - 使用了自适应特征池化来融合（逐像素相加或取最大）各个层次特征，使得能够更加充分地利用各个层次的信息。
>> - 在最后添加了一个补充的小全连接层来提升Mask预测结果
>> ![img](picture/PANet.png)


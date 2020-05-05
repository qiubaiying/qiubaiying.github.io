---
layout:     post
title:      Semantic Segmentation 
subtitle:   Semantic Segmentation模型及损失函数总结
date:       2020-04-12
author:     JY
header-img: img/post-bg.jpg
catalog: true
tags:
    - Overview
---

## UNet-family



### U-Net

[[paper](https://arxiv.org/pdf/1505.04597.pdf)] : U-Net: Convolutional Networks for Biomedical Image Segmentation

> 根据 UNet的结构，它能够结合底层和高层的信息。
>
> **底层(深层)信息**：经过多次下采样后的低分辨率信息。能够提供分割目标在整个图像中上下文语义信息，可理解为反应目标和它的环境之间关系的特征。这个特征有助于物体的类别判断（所以分类问题通常只需要低分辨率/深层信息，不涉及多尺度融合）
>
> **高层(浅层)信息**：经过concatenate操作从encoder直接传递到同高度decoder上的高分辨率信息。能够为分割提供更加精细的特征，如梯度等。
>
> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Semantic-Segmentation/U-Net.png)



### V-Net

[[paper](https://arxiv.org/pdf/1606.04797.pdf)]:V-Net: Fully Convolutional Neural Networks for Volumetric Medical Image Segmentation

> 相当于3D的unet
>
> <img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Semantic-Segmentation/V-Net.png" alt="img" style="zoom:50%;" />
>
> <img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Semantic-Segmentation/vnet.png" alt="img" style="zoom:80%;" />





### H-DenseUNet

 [[paper](https://arxiv.org/pdf/1709.07330.pdf)]: H-DenseUNet: Hybrid Densely Connected UNet for Liver and Tumor Segmentation from CT Volumes

>  网络可以很好的提取混合特征：片内特征和片间的融合特征
>
> 网络很好的解决了用2D训练缺少体积上下文信息以及3D训练需要消耗高额计算内存的问题
>
> <img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Semantic-Segmentation/H-DenseUNet.png" alt="img" style="zoom:40%;" />
>
> > 每一个3D输入，通过变换处理函数F，将3D的体积快变成2D的相邻的slices；然后将这些2D slices送进2D DenseUNet，用来提取片内特征；3D的原始输入和2D DenseUNet(用于有效的片内2D特征提取)转换之后的预测结果concat在一起送进3D网络3D DenseUNet(用于上下文信息探测)，用来提取片间特征；然后将两者特征融合并经由HFF层(用于联合优化片内特征和片间特征的混合特征融合层)预测最终结果。
>
> > 原始3D volume上下各填充一层slice 按照 012、 123、 234、 345 ... 的方式，将3D volume变换成 2D slices。



### UNet++

[[paper](https://arxiv.org/pdf/1807.10165.pdf)]: UNet++: A Nested U-Net Architecture for Medical Image Segmentation

> https://zhuanlan.zhihu.com/p/44958351
>
> <img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Semantic-Segmentation/U-Net++.png" alt="img" style="zoom:50%;" />



### MDU-Net

[[paper](https://arxiv.org/pdf/1812.00352.pdf)]: MDU-Net: Multi-scale Densely Connected U-Net for biomedical image segmentation

> <img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Semantic-Segmentation/MDU-Net.png" alt="img" style="zoom:50%;" />



### DANet

[[paper](https://arxiv.org/pdf/1809.02983.pdf)]:

> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Semantic-Segmentation/danet.png)
>
> <img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Semantic-Segmentation/danet1.png" alt="img" style="zoom:50%;" />

### DUNet

[[paper](https://arxiv.org/pdf/1811.01206.pdf)]: DUNet: A deformable network for retinal vessel segmentation

> **Deformable U-Net**
>
> <img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Semantic-Segmentation/deformable convolution.png" alt="img" style="zoom: 33%;" />
>
> **Deformable Convolution**
>
> <img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Semantic-Segmentation/deformable convolution1.png" alt="img" style="zoom:30%;" />
>
> **Structure**
>
> <img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Semantic-Segmentation/DUNet.png" alt="img" style="zoom:30%;" />



### Multi-path U-Net 

[[paper](https://arxiv.org/pdf/1810.07003.pdf)]: Dense Multi-path U-Net for Ischemic Stroke Lesion Segmentation in Multiple Image Modalities 

> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Semantic-Segmentation/Multi-path U-Net.png)



### Bridged U-net

[[paper](https://arxiv.org/pdf/1807.04459.pdf)]: Prostate Segmentation using 2D Bridged U-net

> <img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Semantic-Segmentation/Bridged U-net.png" alt="img" style="zoom:50%;" />



### SUNet

[[paper](https://arxiv.org/pdf/1810.13304.pdf)]: SUNet: a deep learning architecture for acute stroke lesion segmentation and
outcome prediction in multimodal MRI

> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Semantic-Segmentation/SAUNet.png)



### LadderNet

LADDERNET: Multi-Path Networks Based on U-Net for Medical Image Segmentation [[paper](https://arxiv.org/pdf/1810.07810.pdf)]

> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Semantic-Segmentation/LadderNet.png)



### Attention U-Net

[[paper](https://arxiv.org/pdf/1804.03999.pdf)]: Attention U-Net: Learning Where to Look for the Pancreas

> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Semantic-Segmentation/Attention U-net.png)
>
> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Semantic-Segmentation/Attention Gate.png)



### M-Net

[[paper](references/M-NET.pdf)]: M-NET: A Convolutional Neural Network for Deep Brain Structure Segmentation

> <img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Semantic-Segmentation/M-Net.png" alt="img" style="zoom:150%;" />
>
> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Semantic-Segmentation/M-net1.png)



### Improved Attention M-Net

[[paper](https://arxiv.org/pdf/1810.07842.pdf)]: A Novel Focal Tversky Loss Function with Improved Attention U-Net for Lesion Segmentation

> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Semantic-Segmentation/Improved Attention U-net.png)



### R2U-Net

[[paper](https://arxiv.org/pdf/1802.06955.pdf)]: Recurrent Residual Convolutional Neural Network based on U-Net (R2U-Net) for Medical Image Segmentation 

> <img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Semantic-Segmentation/R2U-Net.png" alt="img" style="zoom:150%;" />
>
> <img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Semantic-Segmentation/recurrent convolutional units.png" alt="img" style="zoom:25%;" />



### SE-Net

[[paper]](https://arxiv.org/pdf/1803.02579.pdf): Concurrent Spatial and Channel ‘Squeeze & Excitation’ in Fully Convolutional Networks 

> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Semantic-Segmentation/SE-Net.png)



### Y-Net

[[paper](references/Y-Net_2D.pdf)]: Y-Net: Joint Segmentation and Classiﬁcation for Diagnosis of Breast Biopsy Images

> (input: 2D)
>
> <img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Semantic-Segmentation/Y-Net1.png" alt="img" style="zoom:150%;" />
>
> 
>
> **U-Net** vs **Y-Net**
>
> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Semantic-Segmentation/Y-Net2.png)

[[paper](https://link.springer.com/content/pdf/10.1007%2F978-3-030-00931-1.pdf)]: Detection and Delineation of Acute Cerebral Infarct on DWI Using Weakly Supervised Machine Learning (Y-Net)

> (input: 3D)
>
> <img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Semantic-Segmentation/Y-Net.png" alt="img" style="zoom:50%;" />



### MultiResUNet

[[paper](https://arxiv.org/pdf/1902.04049v1.pdf)]: MultiResUNet : Rethinking the U-Net Architecture for Multimodal Biomedical Image Segmentation

> <img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Semantic-Segmentation/MultiResNet.png" alt="img" style="zoom:180%;" />
>
> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Semantic-Segmentation/MultiRes block.png)
>
> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Semantic-Segmentation/res path.png)



### CE-Net

[[paper](https://arxiv.org/pdf/1903.02740.pdf)]: CE-Net: Context Encoder Network for 2D Medical Image Segmentation

> 
>
> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Semantic-Segmentation/CE-net.png)



### Graph U-Net

[[paper](https://openreview.net/pdf?id=HJePRoAct7)]: Graph U-Net 

> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Semantic-Segmentation/Graph U-net.png)



### CSA U-NET

[[paper](https://arxiv.org/pdf/1903.05558.pdf)]: Connection Sensitive Attention U-NET for Accurate Retinal Vessel Segmentation 

> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Semantic-Segmentation/CSA U-NET.png)
>
> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Semantic-Segmentation/CSA U-NET attention gate.png)



### CIA-Net

[[paper](https://arxiv.org/pdf/1903.05358.pdf)]: CIA-Net: Robust Nuclei Instance Segmentation with Contour-aware Information Aggregation

> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Semantic-Segmentation/CIA-Net.png)



### W-Net

[[paper](/Users/jiangyu/Desktop/warehouse/model/UNet-toolbox/references/W-Net.pdf)]: W-Net: A Deep Model for Fully Unsupervised Image Segmentation

> <img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Semantic-Segmentation/W-Net.png" alt="img" style="zoom:67%;" />

[[paper](/Users/jiangyu/Desktop/warehouse/model/UNet-toolbox/references/W-Net1.pdf)]:  W-Net: Reinforced U-Net for Density Map Estimation

> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Semantic-Segmentation/W-Net1.png)

### ScleraSegNet

[[paper](https://github.com/ShawnBIT/Paper-Reading/blob/master/ScleraSegNet.pdf)]: ScleraSegNet: an Improved U-Net Model with Attention for Accurate Sclera Segmentation

> <img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Semantic-Segmentation/ScleraSegNet.png" alt="img" style="zoom:50%;" />
>
> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Semantic-Segmentation/attention block.png)



### AHCNet

 [[paper](https://github.com/ShawnBIT/Paper-Reading/blob/master/AHCNet.pdf)]: AHCNet: An Application of Attention Mechanism and Hybrid Connection for Liver Tumor Segmentation in CT Volumes

> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Semantic-Segmentation/AHCBlock.png)
>
> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Semantic-Segmentation/AHCNet.png)



### Probabilistic U-Net

[[paper](https://arxiv.org/pdf/1905.13077.pdf)]: A Hierarchical Probabilistic U-Net for Modeling Multi-Scale Ambiguities

> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Semantic-Segmentation/Probabilistic U-Net.png)



### Partially Reversible U-Net

[[paper](https://arxiv.org/pdf/1906.06148.pdf)]: A Partially Reversible U-Net for Memory-Efficient Volumetric Image Segmentation  

> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Semantic-Segmentation/Partially Reversible U-Net.png)



### RA-UNet

[[paper](http://xxx.itp.ac.cn/pdf/1909.10360v1)]: RA-UNet: Residual Attention U-Net for Semantic Segmentation of Cataract Surgical Instruments 

> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Semantic-Segmentation/RA-Unet.jpg)



### Unet-GAN 

[[paper](https://arxiv.org/pdf/1910.13681.pdf)]: The Domain Shift Problem of Medical Image Segmentation and Vendor-Adaptation by Unet-GAN

> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Semantic-Segmentation/Unet-GAN-block.png)
>
> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Semantic-Segmentation/Unet-GAN.png)



### Siamese U-Net

[[paper](/Users/jiangyu/Desktop/warehouse/model/UNet-toolbox/references/Siamese U-Net.pdf)]:Siamese U-Net with Healthy Template for Accurate Segmentation of Intracranial Hemorrhage 

> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Semantic-Segmentation/Siamese U-Net.png)

### U-Det:

>![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Semantic-Segmentation/U-Det.png)





## ---

## Losses

![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Semantic-Segmentation/loss.png)



https://blog.csdn.net/m0_37477175/article/details/83004746

### Cross Entropy Loss

> - binary cross entropy  二分类交叉熵
> - categorical cross entropy 多分类交叉熵
> - weighted cross entropy  加权交叉熵
>
> 缺点：交叉熵的损失函数单独评估每个像素矢量的类预测，然后对所有像素求平均值。但是图像中常出现类别不均衡（class imbalance）的问题，由此导致训练会被像素较多的类主导，对于较小的物体很难学习到其特征，从而降低网络的有效性



### Dice Coefficient Loss

> $$\begin{equation}
> \text {Dice}=\frac{2|A \cap B|}{|A|+|B|}
> \end{equation}$$，该指标范围从0到1，其中1表示完整的重叠，loss=1-dice
>
> dice loss比较适用于样本极度不均的情况

### IOU Loss

> $$I O U=\frac{|A \cap B|}{|A|+|B|-|A \cap B|}$$
>
> loss=1-IOU

### Focal Loss

> 可以改善目标不均衡的现象

### Generalized Dice loss 

> 在使用**DICE loss**时，对**小目标**是十分不利的，因为在只有前景和背景的情况下，小目标一旦有部分像素预测错误，那么就会导致Dice大幅度的变动，从而导致梯度变化剧烈，训练不稳定。
>
> 
>
> the generalized Dice loss在dice loss基础上给每个类别加权，起到平衡各类（包括背景类）目标区域对loss的贡献。

### Tversky loss

> $$T(A, B)=\frac{|A \cap B|}{|A \cap B|+\alpha|A-B|+\beta|B-A|}$$
>
> 是dice系数和jaccard系数的一种广义系数




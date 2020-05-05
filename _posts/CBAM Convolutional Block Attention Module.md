### CBAM: Convolutional Block Attention Module



1、简介

- SENet方法是在feature map的通道上进行attention生成，然后与原来的feature map相乘。
- 本文所提的attention只关注了通道层面上哪些层面上哪些会具有更强的反馈能力，但是在空间维度上并不能体现出attention

<img src="picture/CBAM1.png" alt="img" style="zoom:50%;" />

2、方法介绍

**Channel attention module**

- 首先将feature map在spatial(空间)维度上进行压缩，得到一个一维矢量以后再进行操作

  > 在对输入feature map进行spatial维度压缩时，不单单考虑average pooling，还额外引入max pooling作为补充

- 通过两个pooling函数以后总共可以得到两个一维矢量，global average pooling对feature map上的每一个像素点都有补充，而global max pooling在进行梯度反向传播计算只有feature map中相应最大的地方有梯度的反馈，能作为GAP的补充
- 具体做法：以$F$表示输入feature map，$F_{avg}^c$和$F^c_{max}$分别代表经过global average pooling和global max pooling计算后的feature。$W_0$和$W_1$代表的是多层感知机模型中的两层参数，这部分的计算可以用如下公式表示：

$$
\begin{aligned} \mathbf{M}_{\mathbf{c}}(\mathbf{F}) &=\sigma(\operatorname{MLP}(\text {AvgPool}(\mathbf{F}))+\operatorname{MLP}(\operatorname{MaxPool}(\mathbf{F}))) \\ &=\sigma\left(\mathbf{W}_{\mathbf{1}}\left(\mathbf{W}_{\mathbf{0}}\left(\mathbf{F}_{\mathbf{a v g}}^{\mathbf{c}}\right)\right)+\mathbf{W}_{\mathbf{1}}\left(\mathbf{W}_{\mathbf{0}}\left(\mathbf{F}_{\max }^{\mathbf{c}}\right)\right)\right) \end{aligned}
$$



![img](picture/CBAM2.png)



**Spatial attention module**

- 在spatial层面上也需要网络能明白feature map中哪些部分应该有更高的响应。

- 首先，还是使用average pooling和max pooling对输入feature map进行压缩操作，只不过这里的压缩变成了通道层面上的压缩，对输入特征分别在通道维度上做了mean和max操作。

- 最后得到了两个二维的feature，将其按通道维度拼接在一起得到一个通道数为2的feature map，之后使用一个包含单个卷积核的隐藏层对其进行卷积操作，要保证最后得到的feature在spatial维度上与输入的feature map一致

- $$
  \begin{aligned} \mathbf{M}_{\mathbf{s}}(\mathbf{F}) &=\sigma\left(f^{7 \times 7}([A v g P o o l(\mathbf{F}) ; M a x P o o l(\mathbf{F})])\right) \\ &=\sigma\left(f^{7 \times 7}\left(\left[\mathbf{F}_{\mathbf{a v g}}^{\mathbf{s}} ; \mathbf{F}_{\max }^{\mathbf{s}}\right]\right)\right) \end{aligned}
  $$

![img](picture/CBAM3.png)

![img](picture/CBAM4.png)


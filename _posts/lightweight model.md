## Lightweight Models（轻量化模型）

### **模型轻量化方法总结**

- 卷积核分解：使用$1\times N$和$N\times 1$卷积核代替$N\times N$卷积核
- 使用深度压缩deep compression方法：网络剪枝、量化、哈弗曼编码、知识蒸馏
- 奇异值(SVD)分解
- 硬件加速器
- 低精度浮点数保存



### **轻量化模型优势**：

- 在分布式训练中，与服务器通信需求小
- 参数少，从云端下载模型的数据量小
- 更适合在FPGA等内存首先的嵌入式、移动端设备上部署



### 轻量化模型基础：

##### 深度可分离卷积

>传统卷积：
>
><img src="picture/conv-std.jpg" alt="img" style="zoom:50%;" />
>
>深度可分离卷积：
>
>- **step1**
>
><img src="picture/depthwise-conv.jpg" alt="img" style="zoom:48%;" />
>
>- **step2**
>
><img src="picture/pointwise-conv.jpg" alt="img" style="zoom:48%;" />

### 轻量化模型：

#### 1. SqueezeNet

paper: 《SQUEEZENET: ALEXNET-LEVEL ACCURACY WITH 50X FEWER PARAMETERS AND <0.5MB MODEL SIZE》

##### Innovation:

###### **Architectural Design Strategies**

> > - 使用$1\times 1$卷积代替$3\times 3$卷积，减少参数量
> > - 减少$3\times 3$卷积的通道数：一个$3\times 3$卷积的计算量是$3\times 3\times M \times N$(其中M，N是输入Feature Map和输出Feature Map的通道数)，通过减少M，N以减小参数数量
> > - 将下采样（downsample）后置：较大的Feature Map含有更多的信息，因此将下采样往分类层移动（该操作提升了网络的精度，但是会增加网络的计算量）

###### **Fire Module**

> > <img src="picture/Fire module.png" alt="img" style="zoom:30%;" />
> >
> > <img src="picture/fire_module.png" alt="img" style="zoom: 50%;" />
> >
> > - Fire Module主要包含两层卷积操作：第一层squeeze层由一组连续的$1\times 1$卷积核组成；第二层expand层是由一组连续的$1\times 1$卷积核和一组连续的 $3\times 3$卷积核concatenate
> > - trick：为了尽量降低$3\times 3$的输入通道数，让squeeze中的filter个数小于expand中的filter个数

###### **SqueezeNet**

> > 整个SqueezeNet是由Fire Module堆积而成的。
> >
> > 其中穿插着stride=2的maxpool层，其主要作用是下采样
> >
> > ![img](picture/squeezeNet.png)

###### **Deep Compression**

> > 使用模型压缩方法进一步压缩网络



#### 2. Xception 

paper:《Xception: Deep Learning with Depthwise Separable Convolutions》

##### Innovation:

（从Inception到Xception发展）

###### Pointwise Convolution

> $1\times1$卷积，主要用于数据降维或升维，减少参数量
>
> ![img](picture/Pointwise Convolution.png)

###### Convolution kernel replacement

>  使用多个小卷积核替代大卷积核 (使用两个$3\times 3$卷积核代替$5\times 5$卷积)
>
> <img src="picture/2.png" alt="img" style="zoom:50%;" />

###### Bottleneck

> 先使用pointwise convolution对数据进行降维，再进行常规卷积核的卷积，最后 再使用pointwise convolution对数据进行升维
>
> <img src="picture/3.png" alt="img" style="zoom:30%;" />

###### Depthwise Separable Convolution

> ![img](picture/Separable Convolution.png)
>
> - 将通道之间的相关性与空间相关性分开处理。采用 Depthwise Separable Convolution来替换原来 Inception-v3中的卷积操作。
>
>   Standard Convolution：$2*3*3*3=54$
>
>   Depthwise Separate Convolution：$2*3*3+2*1*1*3=24$
>
>   ![img](picture/1.png)
>
>   



#### 3. MobileNet v1

paper: 《MobileNets: Efficient Convolutional Neural Networks for Mobile Vision Applications》

##### Innovation:

###### Depthwise Separable Convolution

> **深度可分离卷积**：将常规卷积分为两部分，一是深度卷积，n 个卷积核和 n 个输入特征图分别卷积；二是 1x1 卷积，将第一步的卷积结果融合起来。
>
> <img src="picture/Convolution.png" alt="img" style="zoom:50%;" />



###### width multiplier

> 宽度乘数 α 的作用是在每层均匀地稀疏网络。对于给定层和 α，输入通道的数量 M 变为 αM，输出通道的数量 N 变为 αN。α常用取值[1,0.75,0.5,0.25]



###### Resolution Multiplier

> 分辨率乘数ρ 应用于输入图像，并且每个层的特征图随后被相同的乘数减少。ρ∈(0,1)通常隐式设置，使得网络的输入分辨率为 224、192、160 或 128



#### 4. MobileNet v2

paper: 《MobileNetV2: Inverted Residuals and Linear Bottlenecks》

##### Innovation：

###### Compare with MobileNet v1

> ![img](picture/MobileNet v2.svg)
>
> 相同点：
>
> - 都采用Depthwise卷积搭配Pointwise卷积都方式来提取特征（DW+PW = Depth-wise Separable Convolution）
>
> 
>
> 不同点：
>
> - **Linear Bottleneck**：
>
>   > **V2 在 DW 卷积之前新加了一个 PW 卷积**。因为 DW 卷积由于本身的计算特性决定它自己没有改变通道数的能力，上一层给它多少通道，它就只能输出多少通道。所以如果上一层给的通道数本身很少的话，DW 也只能很委屈的在低维空间提特征，因此效果不够好。现在 V2 为了改善这个问题，给每个 DW 之前都配备了一个 PW，专门用来升维。
>
>   > **V2 去掉了第二个 PW 的激活函数** ，称为Linear Bottleneck。因为激活函数在高维空间能够有效的增加非线性，而在低维空间时则会破坏特征，不如线性的效果好。由于第二个 PW 的主要功能就是降维，因此按照上面的理论，降维之后就不宜再使用 ReLU6 了。
>
>   

###### Compare with ResNet

> ![img](picture/mobilenetv2.svg)
>
> 相同点：
>
> - MobileNet V2 借鉴 ResNet，都采用了 $1 \times 1 \rightarrow 3 \times 3 \rightarrow 1 \times 1$ 的模式。
> - MobileNet V2 借鉴 ResNet，同样使用 Shortcut 将输出与输入相加
>
> 
>
> 不同点：
>
> - **Inverted residuals blocks**
>
>   > ResNet 使用 **标准卷积** 提特征，MobileNet 始终使用 **DW卷积** 提特征。
>
>   > ResNet **先降维**、卷积、再升维，而 MobileNet V2 则是 **先升维** 、卷积、再降维，希望特征提取能够在高维进行。直观的形象上来看，ResNet 的微结构是**沙漏形**，而 MobileNet V2 则是**纺锤形**，结构称为 Inverted Residual Block。



#### 5. ShuffleNet v1 

paper: 《ShuffleNet: An Extremely Efficient Convolutional Neural Network for Mobile Devices》

##### Innovation：

###### Group convolution

> Group convolution的实质就是将卷积分为 g 个独立的组，分别计算。即：
>
> - 把 input feature 分为 g 组，每组的大小为$H*W*C/g$
> - 把 kernel 也分为 g 组，每组有 k/g 个 $h*w*C/g$ 的卷积核
> - 按顺序，每组 input feature 和 kernel 分别做普通卷积，输出 g 组 $H'*W'*k/g$ 的特征图，一共有 g 组，总输出 $H'*W'*k$
>
> **深度可分离卷积的第一步就是分组卷积的一个特例，分组数等于输入通道数**，因此可以把 pointwise convolution（1x1）用 pointwise group convolution 代替，将卷积运算限制在每个Group内来降低计算量。
>
> <img src="picture/group convolution.png" alt="img" style="zoom:60%;" />

###### channel shuffle

> 由于Xception和ResNeXt中存在大量密集的1*1卷积，导致网络十分低效。因此，提出了**pointwise group convolutions**来减少1*1卷积的计算复杂度。但是，这样会使通道间的信息没有得到很好的交流融合。所以，继而提出**channel shuffle**来帮助信息在不同特征通道中的流动
>
> 
>
> **group卷积能够获得不同group中的输入数据，输入特征和输出特征就能很好的关联起来**
>
> ![img](picture/channel shuffle.png)



#### 6. ShuffleNet v2

paper: 《ShuffleNet V2: Practical Guidelines for Efficient CNN Architecture Design》

###### Innovation：

###### metric

> 目前网络结构计算复杂度由FLOPs（浮点运算数）间接度量。然而用FLOPs不能完全衡量模型，因为FLOPs没有考虑MAC（内存访问成本）和并行度这些对速度有相当大影响。其中分组卷积（group convolution）是对MAC消耗比较多的操作
>
> 
>
> 提出了4条关于轻量化网络设计的原则：
>
> G1. **当输入通道数和输出通道数的值接近1:1时，能减少MAC时间**
>
> G2. **过多的group卷积，会增加MAC（memory access cost，内存访问成本）时间**
>
> G3. **网络的分裂会降低平行度**
>
> G4. **Element-wise操作是不可以忽略的，包括ReLU，AddTensor，ADDBias等**
>
> ```
> 根据上述的4条原则，设计一种高效而且轻量化网络的关键是，如何保持大通道数和通道数不变的情况下，即不使用过多卷积，又不过多分组。
> ```

###### channel split

> <img src="picture/ShuffleNet-V2.png" alt="img" style="zoom:30%;" />
>
> - 在**ShuffleNetv1**的模块中，大量使用了1x1组卷积，这违背了**G2**原则，另外采用了类似ResNet中的bottleneck layer，输入和输出通道数不同，这违背了**G1**原则。同时使用过多的Group，违背了**G3**原则。短路连接中存在大量的元素级Add运算，这违背了**G4**原则
>
> - ShuffleNet v2改进：
>   - 在每个单元的开始，通过Channel split将c特征通道的输入被分为两支，分别带有 c−c' 和c'个通道（实际实现时c'=c/2）。按照准则G3，一个分支的结构仍然保持不变，做等同映射，另一个分支包含三个连续卷积， 为满足G1，令输入和输出通道相同。与 ShuffleNet V1 不同的是，两个 1×1 卷积不再是组卷积(Group Convolution)，因为Channel Split分割操作已经产生了两个组。
>   - 卷积之后，把两个分支拼接(Concat)起来，从而通道数量保持不变 (G1)，而且也没有Add操作（element-wise操作）（G4）。然后进行与ShuffleNetV1相同的Channel Shuﬄe操作来保证两个分支间能进行信息交流。



#### 7. GhostNet

paper: 《GhostNet: More Features from Cheap Operations》

##### Introduction

> ​         通过训练好的网络输出特征图发现，其中存在大量冗余信息。一些特征图可以由其他特征图经过一些简单的变化得到，如输入图像经过ResNet50产生的特征图中，里面有许多成对的相似特征图。
>
> <img src="picture/ghost.png" alt="img" style="zoom:50%;" />
>
> 本文提出了能用更少参数提取更多特征的 **Ghost模块**
>



##### Innovation:

###### **ghost module**

> > - 将普通的卷积层分解为两部分，第一部分包含正常的卷积，但是卷积的数量被严格控制。
>> - 在给定第一部分的固有特征图后，应用一系列简单的**线性运算**以生成更多的特征图
> >
>> Details:
> >
>> - (a) 输入数据 ，卷积层的操作为，其中为输出的 n维特征图，为该层的卷积核，可得该层的计算量为。通常n和c很大，使得卷积操作计算量大切大量冗余。
> >
>> - (b) 输入数据 ，卷积层的操作为，其中为输出的m维特征图，mn。为获得原来的n维特征，对 Y'的内在特征分别使用一系列简单线性操作来产生s维 ghost特征。
> >
>>   ，其中为生成y' 的 j-th ghost特征图的线性变换函数，n=m*s，Y=[$y_{11},y_{12},\dots,y_{ms}$]
> >
>>   
> >
> > <img src="picture/ghost%20module.png" alt="img" style="zoom:40%;" />
> >
> > Comparation:
> >
> > - 对比Mobilenet、Squeezenet和Shufflenet中大量使用 pointwise卷积，Ghost模块的原始卷积可以自定义卷积核数量
> >- 目前大多数方法都是先做pointwise卷积降维，再用depthwise卷积进行特征提取，而Ghost则是先做原始卷积，再用简单的线性变换来获取更多特征
> > - 目前的方法中处理每个特征图大都使用depthwise卷积或shift操作，而Ghost模块使用线性变换，可以有很大的多样性
> > - Ghost模块同时使用identity mapping来保持原有特征
> 

###### **ghost bottleneck**

> > <img src="picture/ghost%20bottleneck.png" alt="img" style="zoom:25%;" />
>



##### Experiments

> ｄ＝３的表现最好 (因为１１的卷积核无法在特征图上引入空间信息，而ｄ为５或者是７导致了过拟合和更大的计算量）


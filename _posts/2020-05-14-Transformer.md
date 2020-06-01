---
layout:     post
title:      Transformer
subtitle:   Attention in RNN
date:       2020-05-14
author:     小周同学
header-img: img/post-bg.jpg
catalog: true
tags:
    - Overview
---

------

### Transformer介绍

论文地址：https://arxiv.org/abs/1706.03762

attention这个概念大家都很熟悉，在图像识别上也能作为加强特征的工具。但真正让attention发扬光大的还是其在NLP中的应用，故在此对从RNN到Transformer做一个小的总结。

#### RNN介绍

RNN即循环神经网络，与普通的神经网络不同的是，其增加了一个循环的部分，如图1所示。

<img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/2020-05-14-Transformer/fig1.jpg" alt="fig" style="zoom:50%;" />

​                                                                                                  图1

输入的x代表一个单词，输出的L为翻译的结果，y是真实的结果。可以看到之后的每一个L都用到了之前x的信息，即“循环利用”。

但这种结构在满足输出序列和输入序列的长度相同的情况下才能使用，然后大多数情况下这是不成立的。所以对RNN进行变种，构建Encoder-Decoder模型：

<img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/2020-05-14-Transformer/fig2.jpg" alt="img" style="zoom:30%;" />

<img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/2020-05-14-Transformer/fig3.jpg" alt="0?wx_fmt=png" style="zoom:60%;" />

即先将输入序列编码成一个上下文向量C，然后从C中解码得到相应的输出序列。图2为两种实现方式，整体结构都是一致的。

但是这样做存在一些缺点：1、C中必须包含输入序列中的所有信息，它的长度会成为限制模型性能的瓶颈；2、由于C是输入序列中所有单词编码而来的，所以输入序列中任意单词对输出序列中的目标单词的影响力都是相同的，但明显输出序列的每个单词都应该专注于输入序列中对应的某些单词。这就引出了注意力机制，即让输出序列专注于对应的单词。

这时采取的做法是在生成每个单词yi的时候，原先相同的中间变量C会被替换为根据当前生成单词而不断变化的Ci，如下图所示。

<img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/2020-05-14-Transformer/fig4.jpg" alt="0?wx_fmt=png" style="zoom:60%;" />

此时问题的关键在于如何求得每个输出序列中的单词对应的Ci，以中文“我爱中国”翻译为英文“I Love China"为例：

<img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/2020-05-14-Transformer/fig5.jpg" alt="img" style="zoom:40%;" />

对于“我爱中国”的每个字在编码器中都存在其对应的向量hi，在进行翻译时，cj则可表示为每个输入序列对应向量的加权和，那么问题又转化为对系数aij的求取。直观上来看，单词‘I’对应“我”那么对应的a11应该比较大，a12，a13，a14就会比较小。具体的做法是通过将生成yj单词时Decoder中隐层节点j-1时刻的状态$H_{j-1}$，和输入序列中每个单词对应的隐层节点状态hi进行对比，即通过函数F(hi,$H_{j-1}$)来获得目标单词yj和每个输入单词的关系。F函数在不同论文里可能会采取不同的方法，然后函数F的输出经过Softmax进行归一化就得到了符合概率分布取值区间的注意力分配概率分布数值。具体过程如下图所示。

<img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/2020-05-14-Transformer/fig6.jpg" alt="0?wx_fmt=png" style="zoom:60%;" />

​	这个注意力的实现其实就是利用当前单词的输入编码和原序列的编码一一进行对比，来判断当前单词与原序列各个单词的相关性，从而给每个原序列中的单词增加一个相关性系数来实现注意力机制。

#### Attention机制的本质思想

把attention机制从上述的Encoder-Decoder的框架中剥离，可得下图：

<img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/2020-05-14-Transformer/fig7.jpg" alt="0?wx_fmt=png" style="zoom:70%;" />

可以把Source中的构成元素想象成是由一系列的<Key,Value>数据对构成，此时给定Target中的某个元素Query，通过计算Query和各个Key的相似性或者相关性，得到每个Key对应Value的权重系数，然后对Value进行加权求和，即得到了最终的Attention数值。所以本质上Attention机制是对Source中元素的Value值进行加权求和，而Query和Key用来计算对应Value的权重系数。即可以将其本质思想改写为如下公式：

<img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/2020-05-14-Transformer/fig8.jpg" alt="0?wx_fmt=png" style="zoom:80%;" />

在上述翻译的场景下，我们通过比较Target中某个单词与原序列的编码得到权值，则此时的Key便代表原序列中的编码，而此时的Value与Key相同，都表示原序列中单词的编码。注意力机制更具体地计算过程如下：

<img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/2020-05-14-Transformer/fig9.jpg" alt="0?wx_fmt=png" style="zoom:70%;" />



可以将其归纳为两个过程：第一个过程是根据Query和Key计算权重系数，第二个过程根据权重系数对Value进行加权求和。而第一个过程又可以细分为两个阶段：第一个阶段根据Query和Key计算两者的相似性或者相关性；第二个阶段对第一阶段的原始分值进行归一化处理。

#### Self Attention（自注意力）模型

自注意力模型指的是Target=Source这种特殊情况下的注意力计算机制，比如在'The animal didn't cross the street because it was too tired'这句话中判断it代指的内容，即需要用到自注意力机制。

<img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/2020-05-14-Transformer/fig10.jpg" alt="img" style="zoom:60%;" />

比如输入两个单词Thinking和Machines，使用三个矩阵将其分别转换为Attention中的Query、Key和Value。然后对于每个单词分别计算其在这个序列中对每个单词对应的权重，如下图所示。

<img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/2020-05-14-Transformer/fig11.jpg" alt="img" style="zoom:60%;" />

这个例子中使用Query和Key的点积来衡量两者的关系，从图中可以看出，对于Thinking这个单词，其对于自己的权重最大，对于Machines的权重较小。整个过程可分为7步，论文中将其称为Scaled Dot-Product Attention（即分为第四步的缩放和第三步的点积，很好理解）：

<img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/2020-05-14-Transformer/fig12.jpg" alt="image-20200514203626318" style="zoom:60%;" />

实际训练时采用矩阵实现：

<img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/2020-05-14-Transformer/fig13.jpg" alt="img" style="zoom:40%;" />



<img src="http://jalammar.github.io/images/t/self-attention-matrix-calculation-2.png" alt="img" style="zoom:50%;" />

这时便可以一次处理完序列中的所有词汇。

#### Transformer

然后便来到了本文的正题Transformer！从一个宏观的角度来看Transformer如下：

<img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/2020-05-14-Transformer/fig14.jpg" alt="img" style="zoom:40%;" />

Transformer就如它的名字一样代表一个转换器，将输入序列转化为指定的结果。看细致一点如下：

<img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/2020-05-14-Transformer/fig15.jpg" alt="img" style="zoom:40%;" />

Transformer的内部也是类似前述的Encoder-Dercoder的结构，但在Transformer中Encoders和Decorders由单独的6个Encoder和Decorder实现：

<img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/2020-05-14-Transformer/fig16.jpg" alt="img" style="zoom:40%;" />

其中每个Encoder的内部结构如下图所示：

<img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/2020-05-14-Transformer/fig17.jpg" alt="img" style="zoom:50%;" />

可以看到，在一个encoder中首先经过前述的自注意力模型来获得序列中的内部间的关系，计算公式与前述一致：

<img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/2020-05-14-Transformer/fig18.jpg" alt="img" style="zoom:50%;" />

 然后再经过一个前向神经网络：

<img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/2020-05-14-Transformer/fig19.jpg" alt="img" style="zoom:50%;" />

其更具体的过程如下图所示：

<img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/2020-05-14-Transformer/fig20.jpg" alt="img" style="zoom:50%;" />

同时本文使用Multi-Head Attention作为自注意力机制模块，Multi-Head Attention相当于h个不同的self-attention的集成（ensemble），在这里以h=8举例说明。Multi-Head Attention的输出分成3步：

<img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/2020-05-14-Transformer/fig21.jpg" alt="img" style="zoom:50%;" />

整个过程如下图所示：

<img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/2020-05-14-Transformer/fig22.jpg" alt="img" style="zoom:50%;" />

说白了其实是对于一个序列X，使用多个self-attention模块得到多个Zi，然后通过一个矩阵融合这些Z的信息得到一个融合了多个self-attention模块的信息Z，本质上是对Z进行了增强。

同时要提一下编码器结构中的细节：编码器采用了残差网络结构同时增加了layer-normalization如下图所示：

<img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/2020-05-14-Transformer/fig23.jpg" alt="img" style="zoom:50%;" />

更具体的结构如下：

<img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/2020-05-14-Transformer/fig24.jpg" alt="img" style="zoom:50%;" />

但其实没必要深究，只需要知道编码器最后输出的向量融合了原序列内部中各个单词之间的关系就可以咯。然后就要说到解码器Decoder部分了：

<img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/2020-05-14-Transformer/fig25.jpg" alt="img" style="zoom:67%;" />

如上图所示，解码器包含三个模块：self-attention，encoder-decoder attention，feed forword，（论文中不是这样命名的但各个模块意思是这样的），相比于编码器多了一个encoder-decoder attention模块。解码器不仅接收上个解码器的输出，同时也接收最后一层编码器的输出。同样的解码器也采用了残差网络的结构，以仅含有2个编码器和解码器为例：

<img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/2020-05-14-Transformer/fig26.jpg" alt="img" style="zoom:67%;" />

流程是这样的，Decoder中的self-attention模块仅接收上个Decoder的输出，encoder-decoder attention模块同时接收Encoder的输出和self-attention模块的输出，最后便如Encoder一样送入前向网络中得到这个Decoder的输出。如前述每个attention模块需要输入三个值：Query，Key，Value，对于self-attention模块而言这三个值都来自上一个Decoder的输出，即将上一个Decoder的输出乘以三个矩阵便可得到那个三个值。那么这里有一个问题，encoder-decoder attention模块如何同时接收Encoder的输出和self-attention模块的输出呢？论文中采取的做法是**输入的Query来自self-attention模块的输出，Key和Value来自编码器的输出**。这很合道理，Decoder中的self-attention模块得到Target中的Query如翻译后这个位置的单词是什么，而Encoder融合了原序列中的信息便可以提供Key和Value来告诉Decoder这个位置的单词应该是什么。

要理解实际中具体的处理流程可以参考：

<img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/2020-05-14-Transformer/fig27.gif" alt="img" style="zoom:80%;" />

上图为Decoder翻译第一个单词时的过程，翻译完第一个单词得到'I'之后，将'I'又作为Decoder的输入：

<img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/2020-05-14-Transformer/fig28.gif" alt="img" style="zoom:80%;" />

从上图可看到解码器每次输出的单词都会作为下一次处理的输入，重复这个过程直到解码器输出eos(end of sentence)。这时Decoder中的self-attention模块的作用便体现出来了，即可以理解Decoder以及处理好的单词信息帮助其对下一个单词进行翻译。

**但这其中存在一定的问题：**那就是Encoder输出的K和V都是固定的维度，而Decoder部分由于每次接受的输入不同（随着翻译的过程会越来越多）其维度会不断变化，怎么保证这二者的维度一致呢？这应该属于代码实现的问题，暂且不管。

**对于这个问题目前了解到了：**Decoder部分每次只将上一个单词的query输入到decoder，但这个query同时也用到了之前翻译过的单词的信息，所以decoder部分每次接受的输入的维度也会是相同的（decoder从一个固定的token起始，后面就用上一个单词的query了）。可见https://zhuanlan.zhihu.com/p/47510705。

最后便是Linear和Softmax层了：

<img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/2020-05-14-Transformer/fig29.jpg" alt="img" style="zoom:60%;" />

如上图所示，Decoder最后的输出经过一个全连接层转化为固定维度的向量，这个维度等于数据集的字典大小，再经过softmax转化为概率值，哪个位置概率值最大，说明翻译的单词处于这个位置，通过查预先设定好的字典便可以得到这个单词的内容。损失函数便是Decoder的输出和真实标签交叉熵损失或者KL散度：

<img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/2020-05-14-Transformer/fig30.jpg" alt="img" style="zoom:50%;" />

这里面其实还遗留了一个问题，那就是这个Transformer模型并没有捕捉输入序列中单词的位置信息，而只能获得各个单词间的相关度（结合Self Attention的计算方式想一想可以明白这一点），为了解决这一点，论文在编码向量时引入了位置编码（Position Embedding）。具体地说，位置编码会在词向量中加入了单词的位置信息，这样Transformer就能区分不同位置的单词了。那么怎么编码这个位置信息呢？常见的模式有：a. 根据数据学习；b. 自己设计编码规则。在这里作者采用了第二种方式。那么这个位置编码该是什么样子呢？通常位置编码是一个长度为$d_{model}$的特征向量，这样便于和词向量进行单位加的操作，如下图所示：

<img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/2020-05-14-Transformer/fig31.jpg" alt="img" style="zoom:45%;" />

论文中给出的编码公式如下：

<img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/2020-05-14-Transformer/fig32.jpg" alt="img" style="zoom:50%;" />

<img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/2020-05-14-Transformer/fig33.jpg" alt="img" style="zoom:50%;" />

这个公式中各个符号的意义去看论文吧。

最后的最后，贴一下论文中的原图：

<img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/2020-05-14-Transformer/fig34.jpg" alt="Attention Is All You Need" style="zoom:20%;" />

从图中可以注意到，在Decoder部分我们前面提到的self-attention模块在论文中是Masked Multi-Head Attention，多了一个Masked，这是为什么呢？Mask是为了在Decoder部分掩盖未来的位置，因为翻译过程我们当前还并不知道下一个输出词语。我对这个的理解是这个Mask是在训练时才会用到，因为训练时我们是有Target的，并且会将这个Target输入到Decoder中，这时便需要Mask来掩盖当前处理单词后面的信息。Mask的具体实现在Scaled Dot-Product Attention部分：

<img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/2020-05-14-Transformer/fig35.jpg" alt="Attention Is All You Need" style="zoom:20%;" />

通过将未来的位置设置为-inf来实现。



#### 写在最后

写这个主要还是为了那该死的第三代胶囊网络太难理解，其中有一个概念叫Set Transformer（也是第三代胶囊网络一作的另一篇论文），而Set Transformer是Transformer的变种，所以想要理解最好还是要理解一下Transformer。由于这里面涉及到的东西还是挺多的，为了避免之后忘记又要重新找资料，干脆到这里按照我理解的思路总结。出发点还是那该死的胶囊网络。

参考：
http://jalammar.github.io/illustrated-transformer/（好博客）

https://blog.csdn.net/tg229dvt5i93mxaq5a6u/article/details/78422216（好博客）

https://zhuanlan.zhihu.com/p/48508221

https://zhuanlan.zhihu.com/p/47282410

https://zhuanlan.zhihu.com/p/44145288（这个是RNN的图例来源）




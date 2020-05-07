## Image Generation 图像生成

### 1. Introduction 介绍
(1). 判别模型 vs 生成模型 
`以图像数据为例`

- **判别模型**的形式主要是根据原始图像推测图像<u>具备的一些性质</u>（例如根据数字图像推测数字的名称、根据自然场景图像推测物体边界
- **生成模型**通常给出的输入是图像具备的性质，而输出是性质对应的图像。生成模型相当于构建了图像的分布，因此利用生成模型，可以完成<u>图像自动生成（采样）、图像信息补全</u>等工作。

(2). 深度学习应用于生成模型
- 在机器学习中，生成模型可以用来直接对数据建模，也可以用来建立变量间的条件概率分布。
- 生成模型对图像数据进行建模过程：将图像表示为一个随机向量X，其中每一维都表示一个像素值。假设自然场景的图像都服从一个未知的分布p(x)，希望通过一些观测样本来估计其分布。
- 传统机器学习生成模型（如高斯混合模型、朴素贝叶斯等）采用浅层结构，在解决很多简单或者限制较多的问题上效果明显，但其建模能力和表示能力有限，在遇到一些更复杂的涉及自然信号（如人类语言、自然图像和视觉场景等）的问题时就难以建模。
- 图像生成模型建模难点：图像为**高维随机向量**，且图像中不同像素之间存在的复杂的依赖关系。       
- 深度学习是一类通过多层表示来对数据之间的复杂关系进行建模的算法，可以用于对数据进行高层抽象建模。
    - 深度生成模型：从隐含层到输入数据的重构过程，一般用来表达数据的高阶相关性或者描述数据的联合统计分布
    - 深度判别模型：从输入数据到隐含测的归约过程，通常用来分类数据的内在模式或者描述数据的后验分布



### 2. Generative Models 生成模型

`生成模型：对于给定训练数据，这些训练数据从某种分布$p_{data}$中生成，目标是从中学习到一个模型$p_{model}$，来以相同的数据分布生成新的样本` 
**Taxonomy of Generative Models**
![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/Generative-model.png)     

> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/generate-model.png) 

#### (1). 自回归模型（Autoregressive model）   
> `以PixelRNN和PixelCNN为例` 
>
> PixelRNN和PixelCNN都属于全可见信念网络(Fully visible belief network)，对一个密度分布<u>显示建模</u>(Explicit density model)    
>
> - 根据图像数据x，对图像的概率分布或者似然p(x)建模。
> - 方法：通过使用链式法则(chain rule)将似然分解为一维分布的乘积。在给定所有下标小于i的像素($x_1$到$x_{i-1}$)的条件下，有每个像素$x_i$的条件概率，这时图像中所有像素(n{\times}n)的联合概率(图像的似然)就是所有这些像素点<u>似然的乘积</u>，是一个易处理的密度函数（tractable density function）
> $$p_{\theta}(x)=\prod_{i=1}^{n^2}{p_{\theta}(x_i|x_1,...x_{i-1}})$$  
> - 在训练过程中，需要最大化训练样本图像的似然p(x)来训练模型    
>
> **PixelRNN:** 从左上角一个一个生成像素，每一个对之前像素依赖的关系都通过RNN(LSTM)来建模。
>
> **PixelCNN:** 逐行扫描，取待生成像素点周围的像素（上面和左边的所有像素），传递给CNN来生成该像素值。每一个像素位置都有一个神经网络输出，该输出将会是像素的softmax损失值   
>
> **优点**：GAN只善于处理连续数据，pixelCNN对连续数据和非连续数据都能很好perform；且通过链式显示计算likehood，使得训练稳定；给出了很好的评估度量，通过所能计算的数据的似然来度量样本的质量。
>
> **缺点**：由于PixelRNN和PixelCNN是按照像素点去生成图像，导致计算成本高，生成速度慢；且PixelRNN和PixelCNN目前还没有成功做出unsupervised/semi-supervised feature learning



#### (2). 变分自编码器（VAE）    

> **Basic Knowledge: 自编码器 AutoEncoder**：
> - 自编码器的主要目的是将高维矩阵$x$经过Encoder压缩到低维矩阵$z$，然后再经过Decoder将$z$还原成$\widehat{x}$，尽量使得$x=\widehat{x}$，即<u>无损</u> 。
> - 在训练过程中，损失函数常常为像素级别的MSE操作（对比输入输出的每个像素点的差异，然后累加求和再求平均），获取损失函数值对模型参数的变化，利用梯度下降法更新参数，以达到降低损失函数值的需求，从而完成训练，得到Encoder和Decoder。  
> - 编码器和解码器可以有多种形式，最先提出的是非线性层的线性组合，又有了深层的全连接网络，目前常用的是CNN。
>![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/Autoencoder.png)
> - AutoEncoder能够重构数据，学习数据特征（这些学习到的特征具有捕捉训练数据中蕴含的变化因素的能力，即获得一个含有训练数据中变化因子的隐变量z），初始化监督学习模型。
> 
> **VAE(Variational Autoencoders)**： 
> - 编码-解码过程解析：        
>   - 输入数据x，经过编码器得到特征z
>   - 将隐向量z限制为一个近似的正态分布(先验假设)，在编码器网络$q_{\phi}(z|x)$中，会输出一个关于z的均值和对角协方差矩阵。 
>   - 在解码器网络$p_{\theta}x|z)$中，同样会输出一个关于x的均值和的对角协方差矩阵，这里的x维度和输入的x维度相同       
>   - 为了真正得到z（给定x下的z和给定z下的x），将会从上述分布$q_{\phi}(z|x)$和$p_{\theta}x|z)$中采样。
> - 对于给定z的x的条件概率分布p(x|z)是复杂的（使用神经网络来表示），得到了一个带有隐函数z的难解的密度函数：
> $$p_{\theta}(x)={\int}p_{\theta}(z)p_{\theta}(x|z)dz$$ 
> - 该密度函数无法直接优化，需要通过推导出似然函数的下界然后对该下界进行优化
> - 推导过程： 
>   Data likelihood: $p_{\theta}(x)={\int}p_{\theta}(z)p_{\theta}(x|z)dz$ 
> Posterior density: $p_{\theta}(z|x)=p_{\theta}(z)p_{\theta}(x|z)/p_{\theta}(x)$ 
> 利用编码器网络$q_{\phi}(z|x)$估计出$p_{\theta}(z|x)$ 
> 使用对数似然：  ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/VAE_function.png)
> - 由上推导可以看到，真正的损失函数$\mathcal{L}$由两部分构成:输入输出差异与分布差异，其中分布差异用的是KL散度。要让似然变大，需要让p(x|z)变大（最大限度地重构数据），同时让KL散度值变小（让后验概率与前验概率分布相似），在训练过程中根据损失函数，使用优化算法进行参数更新
> 
> - **优点：** 就生成模型来说，是一种有据可循的方法，使得查询推断成为可能
> - **缺点：** 只能推断真实分布的近似值，而隐变量分布和真实分布之间的gap不可度量，因此导致VAE存在着生成图像模糊的问题。 
![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/VAE.png)      



#### (3). 基于流的方法（Glow）

>`基于流的生成模型通过寻找可逆的双射来实现输入和潜在空间的相互转换`
>
> 对输入的复杂的高维数据进行一个非线性变换，通过这个变换将输入的高维数据映射到潜在空间，产生独立的潜在变量。同时这个变换是可逆的，反之亦然。
> - 假设定义x是一个高维的随机向量，并且x的真实分布p(x)未知，模型为$p_{\theta}(x)$，则需要最小化的对数似然函数为： 
> $$\frac{1}{N}\sum^N_{i=1}{-logp_\theta(x_i)}$$
> - 为了实现空间之间的映射，可以找一个可逆的映射函数，使得$z=f_\theta(x)$，同时$x=g_\theta(z)$，$g_{\theta}^-1=f_\theta$
> - Glow采用分层变换的思想， 将映射$f$函数变换为$f_1{\odot}f_2{\odot}...{\odot}f_k$   
> - 可以将其想象成一个flow: 
> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/flow.png)
> - Glow网络框架：整个flow需要分K次单步flow完成，一个单步flow模块包括三个部分（第一部分actnorm即把激活神经元归一化，可以理解为将输入数据做预处理；第二部分可逆$1{\times}1$卷积，简化整体的计算量；第三部分Affine Transformation，是实现可逆转换的关键）
> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/Glow.png)
> 
> **优点：**
> - **精确的潜在变量推断和对数似然评估。** 在VAE中编码后只能推理出对应于潜在变量的真实分布近似值（隐变量分布与真实分布之间的gap不可度量），GAN是一种学习范式，没有编码器进行潜在变量的推断，且由于其存在G和D两个模型互相博弈的特点，理论的近似极限无法确定。在Glow可逆生成模型中，可以在没有近似的情况下实现潜在变量的精确的推理(精确建模真实数据的分布)，还可以优化数据的精确对数似然。
> - **高效的推理和合成。** 自回归模型如PixelCNN，也是可逆的，然而这样的模型合成难以实现并行化而基于流的生成模型如Glow和RealNVP都能有效实现推理与合成的并行化。
> - **对下游任务有用的潜在空间。** 自回归模型的隐藏层有未知的边际分布，使其执行有效的数据操作上很困难；在GAN中，由于模型没有编码器使得数据点通常不能在潜在空间中直接被表征，并且表征完整的数据分布也是不容易的。而在可逆生成模型和VAE中允许多种应用，例如数据点之间的插值，已有数据点的有目的修改。
> - **内存的巨大潜力。** 如 RevNet论文所述，在可逆神经网络中计算梯度需要一定量的内存，而不是线性的深度。
> 
> **缺点：** 算法整体偏数学化，计算量大    



#### (4). 生成对抗网络（GAN）

> Ref：[《Tutorial: GAN Overview》](https://github.com/jyniki/Learn2019/blob/master/research/tutorials/GAN%20overview.pdf)
> - GAN不在考虑显式密度函数，而是利用博弈思想不断的优化生成器和判别器从而使得生成的图像与真实图像在分布上越来越相近。
> - GAN的思想提出过程:
>   - 采用**Maximum Likelihood Estimation**训练生成器学习分布规律：首先有一个生成器$P_G$和一组参数$\theta$，以及从真实分布$P_data(x)$中采样出来的数据${x^1,x^2,...x^m}$
>   - 希望通过不断地调整$P_G$和$\theta$，让$P_G(x;\theta)$越接近$P_{data}(x)$越好。具体做法如下：
>       - 找到一个最佳的参数组${\theta}^*$，使生成器的结果最接近$P_{data}(x)$，即对于每个真实抽样$x^i$的likelihood都最大，等价于所有真实抽样$x^i$的likelihood的乘积最大：$L=\prod_{i=1}^{m} P_{G}\left(x^{i} ; \theta\right)$
>       - 上述求解${\theta}^*$以最大化likelihood问题等价于求解${\theta}^*$以最小化KL Divergence问题（证明过程略）${\theta}^*=\arg \max _{\theta} \prod_{i=1}^{m} P_{G}\left(x^{i} ; \theta\right)=\arg \min _{\theta} KL\left(P_{d a t a} \| P_{G}\right)$
>       - **对于KL Divergence的最小化问题，引入神经网络G进行求解**。$G^{*}=\arg \min _{G} \operatorname{Div}\left(P_{G}, P_{d a t a}\right)$，该神经网络即为生成网络（能够实现对于已知分布的数据z，可以把数据z转化成一个未知分布的数据x，并希望这个未知分布$P_G(x)$与$P_{data}(x)$之间的散度距离Divergence越小越好）
>       - 然而理论上并不知道$P_G(x)$和$P_data(x)$是什么，因此Divergence往往无法计算，因此**新建了一个神经网络D专门用来衡量$P_G(x)$和$P_data(x)$之间的Divergence**，该神经网络即为判别网络
>
> - **训练过程:**
> > 前向传播过程：
> > > - 模型输入：随机产生一个随机向量作为生成模型的数据，然后经过生成模型后产生一个新的向量，作为Fake Image；同时，从数据集中随机选择一张图片，将图片转化成向量，作为Real Image
> > > - 模型输出：将Fake Image和Real Image两个向量分别输入判别网络，分别输出一个0~1之间的数，用于表示输入向量为Real Image的概率，使用得到两个输出值计算损失函数。  
> >
> > 反向传播过程：
> > > 通过Minimax博弈公式联合训练生成器和判别器两个网络          
> > > $$
> > > \mathop{\min}\limits_{\theta_g}\mathop{\max}\limits_{\theta_d}[E_{x{\sim}p_{data}}logD_{\theta_d}(x)+E_{{z}{\sim}p_{(z)}}log(1-D_{\theta_d}(G_{\theta_g}(z)))]
> > > $$
> > >
> > > - 第一部分是训练判别器D，先从真实数据分布$p_{data}(x)$中抽样$x$,然后从先验分布中抽样z，并通过确定的生成器产生仿造数据$\tilde{\mathcal{x}}=G_{\theta_g}(z)$，然后把$x$和$\tilde{\mathcal{x}}$输入判别器中训练，使得目标函数$\tilde{\mathcal{V}}_D$最大。 
> > >   `使用梯度上升法(Gradient ascent on discriminator):`
> > >   $$\tilde{\mathcal{V}}_D=\mathop{\max}\limits_{\theta_d}[E_{x{\sim}p_{data}}logD_{\theta_d}(x)+E_{{z}{\sim}p_{(z)}}log(1-D_{\theta_d}(G_{\theta_g}(z)))] $$
> > >   （其实最大化$\tilde{\mathcal{V}}_D$问题的求解实际上是在求解$p_{data}$与$p_G$之间的**JS散度**，推导过程略）
> > >
> > > - 第二部分是训练生成器（此时判别器已经确定），先从先验分布中抽样新的z，然后将z输入生成器中训练，使得目标函数$\tilde{\mathcal{V}}_G$最小。    
> > >
> > >   `使用梯度下降法(Gradient descent on generator):`
> > >   $$\tilde{\mathcal{V}}_G=\mathop{\min}\limits_{\theta_g}{[E_{{z}{\sim}p_{(z)}}log(1-D_{\theta_d}(G_{\theta_g}(z)))]}$$
> > >   这样循环交替，最终生成器产生的数据$\tilde{\mathcal{x}}$就会越来越接近真实数据$x$
> > >
> > > - **生成过程：**  
> > >
> > > - 指定维度的噪声向量作为输入生成器网络,从训练分布中采样并将结果直接作为输出
> > > ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/gan7.png)  
>
> **优点：**
> - GAN生成的图像比较清晰，在很多GAN的拓展工作中也取得了很大的提高。     
>
> **缺点：** 
> - GAN生成的多样性不足
> - 训练过程不稳定，容易发生模式坍塌    
> - GAN中JS散度不适合衡量生成数据分布和真实数据分布的距离



#### (5). GAN的改进和优化

> GAN系列算法发展
> 
> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/GAN-development.png)
> 
> | 发表时间  | 名称          | 中文名称               | 论文地址                       |
> | -------- | ------------- | ---------------------- | ------------------------------------ |
> | 14年06月 | GANS          | 生成对抗网络           | https://arxiv.org/pdf/1406.2661.pdf  |
> | 14年11月 | CGAN          | 条件生成对抗网络       | https://arxiv.org/pdf/1411.1784.pdf  |
> | 15年06月 | LAPGAN        | 拉普拉斯金字塔GAN      | https://arxiv.org/pdf/1506.05751.pdf |
> | 15年11月 | DCGAN         | 深度卷积生成对抗网络   | https://arxiv.org/pdf/1511.06434.pdf |
> | 15年12月 | VAEGAN        | 变分自编码器GAN        | https://arxiv.org/pdf/1512.09300.pdf |
> | 16年05月 | BiGAN         | 双向生成对抗网络       | https://arxiv.org/pdf/1605.09782.pdf |
> | 16年06月 | CoGAN         | 帮合生成对抗网络       | https://arxiv.org/pdf/1606.07536.pdf |
> | 16年06月 | fGAN          | f-散度生成对抗网络     | https://arxiv.org/pdf/1606.00709.pdf |
> | 16年06月 | ImprovedDCGAN | 提升的DCGAN            | https://arxiv.org/pdf/1606.03498.pdf |
> | 16年06月 | InfoGAN       | 互信息生成对抗网络     | https://arxiv.org/pdf/1606.03657.pdf |
> | 16年09月 | EBGAN         | 基于能量的生成对抗网络 | https://arxiv.org/pdf/1609.03126.pdf |
> | 16年09月 | SRGAN         | 超分辨率生成对抗网络   | https://arxiv.org/pdf/1609.04802.pdf |
> | 16年11月 | LSGAN         | 最小二乘生成对抗网络   | https://arxiv.org/pdf/1611.04076.pdf |
> | 16年12月 | StackGAN      | 堆栈式生成对抗网络     | https://arxiv.org/pdf/1612.03242.pdf |
> | 17年01月 | WGAN          | Was距离生成对抗网络    | https://arxiv.org/pdf/1701.07875.pdf |
> | 17年03月 | BEGAN         | 边界均衡生成对抗网络   | https://arxiv.org/pdf/1703.10717.pdf |
> | 17年03月 | CycleGAN      | 循环生成对抗网络       | https://arxiv.org/pdf/1703.10593.pdf |
> | 17年03月 | TripleGAN     | 三部分生成对抗网络     | https://arxiv.org/pdf/1703.02291.pdf |
> | 17年04月 | WGAN-GP       | 加强版WGAN             | https://arxiv.org/pdf/1704.00028.pdf |
> | 17年05月 | DRAGAN        | 深度回归分析GAN        | https://arxiv.org/pdf/1705.07215.pdf |
> | 17年10月 | PGGAN         | 渐进生成对抗网络       | https://arxiv.org/pdf/1710.10196.pdf |
> | 17年10月 | StackGAN++    | 提升的堆线式GAN        | https://arxiv.org/pdf/1710.10916.pdf |
> | 17年11月 | StarGAN       | 星型结构GAN            | https://arxiv.org/pdf/1711.09020.pdf |
> | 17年11月 | XGAN          | X型结构GAN             | https://arxiv.org/pdf/1711.05139.pdf |
> | 17年12月 | ComboGAN      | 合一式生成对抗网络     | https://arxiv.org/pdf/1712.06909.pdf |
> | 18年02月 | SNGAN         | 频谱归一化生成对抗网络 | https://arxiv.org/pdf/1802.05957.pdf |
> | 18年05月 | SAGAN         | 自注意力生成对抗网络   | https://arxiv.org/pdf/1805.08318.pdf |
> | 18年07月 | RGAN          | 相对生成对抗网络       | https://arxiv.org/pdf/1807.00734.pdf |
> | 18年09月 | BigGAN        | 大规模生成对抗网络     | https://arxiv.org/pdf/1809.11096.pdf |
> | 18年12月 | StyleGAN      | 基于样式的生成对抗网络 | https://arxiv.org/pdf/1812.04948.pdf |
> | 19年03月 | S3GAN         | 更少标签的生成对抗网络 | https://arxiv.org/pdf/1903.02271.pdf |




- **基于散度(Divergence)的改进**
> JS Divergence距离偏差问题：
> - 大多数情况下$P_G$和$P_data$没有重合，对于与$P_data$都没有交集的$P_{G_0}$和$P_{G_1}$，用Js散度去衡量二者的距离时，都是一样的。但实际$P_{G_1}与$P_data$的距离比$P_{G_0}与$P_data$的距离近，无法用Js散度体现。     
>
> (I). LSGAN
> - 将判别器最后的sigmoid激活层变为linear激活层，即将二分类问题转换为回归问题。
> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/LSGAN.png)
> - 使用了最小二乘损失函数代替了GAN的损失函数:
> $$V(D)=\min _{D}\{\frac{1}{2} E_{x \sim P_{data}}[D(x)-a]^{2}+\frac{1}{2} E_{z \sim P_{z}}[D(G(z))-b]^{2}\}$$
> $$V(G)=\min _{G}\{\frac{1}{2} E_{z \sim P_{z}}[D(G(z))-c) ]^{2}\}$$
> > （其中常数a、b分别表示真实图像和生成图像的标记；c是生成器为了让判别器认为生成图片是真实图片而定的值。常设a=c=1，b=0）
> >
> > - 交叉熵虽然会使分类正确，但导致那些在决策边界被分类为真的、但是仍远离真实数据的生成样本不会继续迭代；而最小二乘损失函数会对处于判别为真但仍然远离决策边界的样本进行惩罚，把远离决策边界的假样本迭代进入决策边界，从而提高生成图像的质量。   
> - sigmoid交叉熵损失很容易达到饱和状态（梯度为0），而最小二乘损失只在一点达到饱和,因此使用最小二乘损失使得GAN训练更稳定。
> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/LSGAN(1).png)    
>
> (II). WGAN
> - WGAN计算损失函数时使用**Wasserstein距离**去衡量生成数据分布和真实数据分布之间的距离，其生成器和判别器的目标表达式为：
> $$V(G)=\min _{D \in 1-L i p s c h i t z}\left\{-E_{\tilde{\mathcal{x}} \sim P_{G}}[D(x)]\right\}$$
> $$V(D)=\max _{D \in 1-L i p s c h i t z}\left\{E_{x \sim P_{d a t a}}[D(x)]-E_{\tilde{\mathcal{x}} \sim P_{G}}[D(x)]\right\}$$
> > 该判别器目标表达式的求解结果就是$P_G$与$P_data$之间的wasserstein距离，目标函数没有log项； 
> > 其中 $D \in 1-L i p s c h i t z$等价于$\left\|\nabla_{x} D(x)\right\| \leq 1$ for all $x$
> - 传统GAN的判别器输出的结果是在(0,1)区间内，但在WGAN中输出的结果是Wasserstein距离，没有上下界，因此随着训练的进行，$P_G$的Wasserstein值会越来越小，$P_{data}$的Wasserstein值会越来越大，使得判别器永远无法收敛。
>   - 为了解决上述问题，需要给判别器加上限制，让$P_G$不会持续地一直降低，$P_{data}$也不会持续地一直升高（让D函数变得更平滑）。
>   - 因此，WGAN中的判别器D被加上了1-Lipschitz function的限制：
> $$\|f(x_{1})-f(x_{2})\| \leq K\|x_{1}-x_{2}\| \ (\mathrm{K}=1)$$
> - 由于判别网络D输出的是一般意义上的分数，而不是概率，因此最后一层**去掉了sigmoid操作**
>
> **优点：**
>  - 解决了模式崩溃（collapse mode）的问题，生成结果多样性更丰富 
>
> **缺点：**
>   - 由于Wasserstein距离需要满足Lipschitz限制，因此直接将网络的参数（权重）限制在了一定范围。
>   - WGAN在处理Lipschitz限制条件时，直接采用了weight clipping独立地限制每个网络参数的取值范围，其最优策略是尽可能让所有参数走极端，由于将权重剪切到一定范围，造成判别器的参数几乎都集中在最大值和最小值上，不能充分发挥深度神经网络的拟合能力。且weight clipping导致训练时容易造成梯度消失或梯度爆炸（选择过小的话会导致梯度消失，选择过大的话会导致梯度爆炸）。
>
> (III). WGAN-GP
> - WGAN-GP是WGAN之后的改进版，主要改进了连续性限制的条件，解决了梯度消失和梯度爆炸的问题。
> - 在WGAN-GP中提出了梯度惩罚（gradient penalty）的方式以满足lipschitz连续性条件，并通过建立损失函数来满足判别器的梯度不超过K的Lipschitz限制。判断器的目标表达式如下：
> $$V(G, D) \approx \max _{D}\left\{[E_{x \sim P_{\text {data}}}[D(x)]-E_{x \sim P_{G}}[D(x)]\right.-\lambda \int_{x} \max \left(0,\left\|\nabla_{x} D(x)\right\|-1\right) d x \}$$
> > 对目标表达式增添了一个条件（第三项），实际上统计的就是所有梯度的模不满足小于或等于1的项，并给这些项分配一个惩罚参数$\lambda$，计算出惩罚值，并将所有惩罚值累加起来。当累加惩罚够大时，会影响$\max_D\{\mathrm{V}(D, G)\}$的取值，导致这样的$D$不再是最优解。  
> - 上述D(x)的数值空间是整个样本空间，由于这个增添的条件对于所用的x有效，会导致惩罚变得非常高，也带来很多没必要的计算。因此将惩罚项中x的范围缩小为$P_{penalty}$，$P_{penalty}$是介于$P_G$和$P_{data}$之间的区域。目标表达式转化为如下：
> $$V(G, D) \approx \max _{D} \{E_{x \sim P_{\text {data}}}[D(x)]-E_{x \sim P_{G}}[D(x)]-\lambda E_{x \sim P_{\text {penalty}}}\left[\max \left(0,\left\|\nabla_{x} D(x)\right\|-1\right)\right] \}$$
> > 在实验中，发现$\left\|\nabla_{x} D(x)\right\|$越接近1，训练得越快，效果也越好，于是表达式可简化成：
> >$$V(G, D) \approx \max _{D}\{ E_{x \sim P_{\text {data}}}[D(x)]-E_{x \sim P_{G}}[D(x)]-\lambda E_{x \sim P_{\text {penalty}}}[(\|\nabla_{x}D(x)\|-1)^2]\}$$
>
> **优点：**
> - WGAN-GP比WGAN有更快的收敛速度，并能生成更高质量的样本
>
> **缺点：**
> - 只是对梯度的模大于1的区域的x作出了惩罚，并没有保证每个x的梯度的模都小于或等于1
>
> (IV).SNGAN
>
> - SNGAN(频谱归一化GAN)提出了用谱范数标准化神经网络的参数矩阵W，从而让神经网络的梯度被限制在一个范围内。
---
- **基于网络(Network)的改进**
> (I). DCGAN
> - DCGAN将GAN和CNN结合起来，DCGAN中的Generator和Discriminator都采用CNN，同时取消了池化层Pooling，使用带步长的卷积层（strided convolution）代替。对Generator来说，要做上采样，采用的是分数步长的卷积（fractionally-strideconvolution），即反卷积（DeConv2D）；对Discriminator来说，一般采用整数步长的卷积，即普通卷积Conv2D。  
> - 避免在卷积层之后使用全连接层（全连接层虽然增加了模型的稳定性，但也减缓了收敛速度）。一般来说，Generator的输入（噪声）采用均匀分布；discriminator的最后一个卷积层一般先摊平（flatten），然后连接一个单节点的softmax。  
> - 除了Generator的输出层和Discriminator的输入曾外，其他层都使用了Batch Normalization，将特征层的输出归一化。即使初始化很差，也能保证网络中有足够强的梯度，加速了训练，提高了训练的稳定性。
> - 对于Generator，输出层采用Tanh激活函数，其他层使用ReLU激活函数；而在Discriminator中使用LeakyReLU激活函数，防止梯度稀疏。     
> **缺点：** 由于DCGAN的生成器中使用了反卷积，而反卷积固有地存在“棋盘效应（Checkerboard Artifacts）”，约束力DCGAN生成能力的上限。
>
> (II). ImproveDCGAN     
> - DCGAN做了结构细化，但是未解决在训练过程中GAN收敛性不稳定的问题
> - 为解决收敛性不稳定的问题，ImproveDCGAN针对DCGAN训练过程提出了不同的增强方法：
>   - 特征匹配（feature mapping）：生成器把判别器的中间层输出作为目标（一般中间层都是D的最后几层），让生成的中间层输出和真实数据的中间层输出尽可能相同。
>   - 批次判别（minibatch discrimination）：每次不是判别单张图片，而是判别一批图片
>   - 历史平均（historical averaging）：在更新参数值时，把过去的值也纳入考虑
>   - 单侧标签平滑（one-sided label smoothing）：将判别式的目标函数中正负样本的系数不再是0-1，而是$\alpha$和$\beta$。原本判别器的目标输出值是[0=假图像，1=真图像]，现在可能变成[0=假图像，0.9=真图像]    
>   - 虚拟批次正态化（virtual batch normalizaiton）：在训练前提取一个batch，根据这个batch做normalize。（由于该方法计算成本很高，所以仅仅被用在生成器当中）
>
> **优点：**
> - 能够让模型在**生成高分辨率图像**时表现得更好。 
>       
>
> (III).SAGAN    
> - 由于卷积网络的局部感受野的限制，如果要生成大范围相关（Long-range dependency）的区域，卷积网络就会出现问题。因此需要找到一种能够利用全局信息的方法。传统的做法有：用更深的卷积网络，或者直接采用全连接层获取全局信息，但是**参数量太大导致计算量太大**。
> - SAGAN将Attention机制引入了GAN的图像生成中，用带有自注意力的特征图去代替传统的卷积特征图。
>   - 首先，f(x),g(x),h(x)都是普通的$1{\times}1$卷积，其作用是减少图像中的通道数量。差别只在于输出通道大小不同
>   - 将f(x)的输出转置并和g(x)的输出相乘，再经过softmax归一化得到一个attention map
>   - 将得到的attention map和h(x)逐像素点相乘，得到自适应注意力的特征图
> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/SAGAN.png) 
> - SAGAN的优化：
>   - Spectral Normalization：稳定了训练和生成过程
>   - TTUR：平衡了判别器D和生成器G的训练速度
> **优点：**
> - 可以很好的处理长范围、多层次的依赖
> - 生成图像时每一个位置的细节和远端的细节协调好
> - 判别器还可以更准确地对全局图像结构实施复杂的几何约束                 
---

- **基于生成器(Generator)和判别器(Discriminator)的改进**
> (I). RGAN
> - RGAN在提升伪数据是真实的概率的同时，降低了真实数据是真实的概率
> - 提出了相对判断器，采用评估给定的实际数据比随机抽样的假数据更真实的概率。在训练过程中，不仅让$D_{fake}$向$D_{real}$移动，而且让$D_{real}$向$D_{fake}$移动
> 
> (II).EBGAN    
> - EBGAN改动了判别器，使其不再去鉴别输入图像是来自于$P_{data}$还是$P_g$，而是去鉴别输入图像的重构性高不高
> - AutoEncoder是提前用真实图片训练好的，如果输入是来自真实数据集的图片，这个autoencoder就能产生和输入非常相似的图片，但如果输入的是其他图片，autoencoder的输出就不会和输入相似。
> - 把这个autoencoder放入判别器中，每当判别器输入x，通过这个autoencoder得到重构图像x’,通过x与x'的差值作为评判输入图像x质量好坏的标准，当差值越低的时候，意味着输入图片越符合真实图片的特征。 
> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/EBGAN.png)  
> - EBGAN的最大特点就是discriminator一开始就非常强（因为有pretrain），因此generator在一开始就能获得比较大的“能量驱动”（energy based），使得在一开始generator就进步非常快，能够在短期内获得一个比较不错的generator。
> 
> (VII). BEGAN
> - 提出了一种新的评价生成器生成质量的方式，使GAN使用很简单网络结构，不加一些trick（如BN、minibatch、SeLU激活函数等），也能够很好的实现训练效果，能够很快且稳定的收敛，完全不用担心模式崩溃和训练不平衡的问题。   
>   - 以往的生成器生成质量评估使用估计概率分布的方法，希望生成器生成的数据分布尽可能的接近真实数据的分布。
>   - BEGAN中提出的新的评价方式：估计分布的分布误差之间的相似度，如果分布的误差接近，那么分布肯定也接近。  
> - Discriminator使用的是AutoEncoder结构，判别器的目标是通过优化**自编码器损失**分布之间的Wasserstein距离下限
> - Generator使用与判别器中解码器相同的网络结构。
> - 在训练中添加额外的均衡过程来平衡生成器和判别器
> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/BEGAN.png)

- **基于应用(application)的改进**   
> <u>在图像生成上的应用:</u>    
>
> (I). CGAN
> - GAN中输出仅依赖随机噪声，无法控制生成内容；但CGAN将条件输入c添加到随机噪声中，条件c可以是任何信息，如图像标注、对象的属性、文本描述甚至是图片。<u>判别器需要判断$x$是否是真实图片，同时要判断$x$和$c$是否匹配。</u>
> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/CGAN.png)    
> - CGAN是有监督学习，如引入图像作为监督信息，CGAN就可以完成一些**paired data**才能完成的任务：如把轮廓图转化为真实图片，把mask转化成真实图，把黑白图转化为真实图等。其中 最具代表性的工作为pix2pix：
>   - pix2pix提出将CGAN的损失与L1正则化损失相结合（L1相比L2产生比较少的模糊图像），使得生成器不仅被训练以欺骗判别器，而且还生成尽可能接近真实标注的图像。 
> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/Pix2Pix.png) 
>   
>
> (II). TripleGAN 
> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/TripleGAN.jpg)
> (III). StackGAN 
> (IV). LapGAN 
> (V). ProGAN 
> (VI). StyleGAN 
> (VII). SRGAN

​        

> <u>在风格迁移上的应用:</u>
>(I). CycleGAN
> (II). CoGAN



>
> <u>在特征提取上的应用:</u>
> (I). InfoGAN
> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/InfoGAN.png)
> (II). VAEGAN
> - VAE中的解码器可以单独被提取出来作为生成器使用。
>   - 但是VAE解码产生的图片往往比较模糊，因为
> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/VAEGAN.png)
>
> (III). BiGAN    
>
> - BiGAN的提出，将encoder与decoder的训练可以分开进行
> - 学习了生成器$E=G^{-1}$的逆，在训练过程中允许学习从潜在空间到数据的映射
> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/BiGAN.jpg)      
>
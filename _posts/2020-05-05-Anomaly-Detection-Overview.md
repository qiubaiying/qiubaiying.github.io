---
layout:     post
title:      Anomaly Detection
subtitle:   Anomaly Detection论文及模型总结
date:       2020-05-05
author:     JY
header-img: img/post-bg-AD.jpg
catalog: true
tags:
    - Overview
---
## Anomaly Detection

**Model**

> - [Anogan](#Anogan)
>
> - [f-Anogan](#f-Anogan)
> - [EGBAD](#EGBAD)
> - [ALOCC](#ALOCC)
> - [AAE](#AAE)
> - [VAE](#vae)
> - [ganomaly](#ganomaly)
> - [ALAD](#ALAD)
> - [Skip-GANomaly](#Skip-GANomaly)
> - [ADAE](#ADAE)
> - [HADGAN](#HADGAN)
> - [CAVGA](#CAVGA)
> - [ALAE](#ALAE)



**Paper**

> - [One Class (Anomaly) Classification target](#Anomaly-Classification-Target)
>
> - [Out-of-Distribution (OOD) Detction target](#OOD-Detction-Target)
> - [One Class (Anomaly) Segmentation target](#Anomaly-Segmentation-Target)



------

### Model

模型异常检测思想：

> 在仅有负样本（正常数据）或者少量正样本的情况下：
>
> **训练阶段**：网络仅仅通过负样本（正常样本）的数据分布，得到能够生成或重建正常数据的模型
>
> **测试阶段**：使用测试样本输入训练好的模型，如果经过模型生成或重建后输出和输入一样或者接近，表明测试的是正常数据，否则是异常数据



#### Anogan

```
Unsupervised Anomaly Detection with Generative Adversarial Networks to Guide Marker Discovery (2017)
```

> AnoGAN运用DCGAN学习normal data的latent space，并假设这个latent space无法重构出anomaly，重构误差高的地方被检测为anomaly
>
> <img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Anomaly-Detection/AD.png" alt="img" style="zoom:50%;" />
>
> 异常分数：
>
> $A(\mathbf{x})=(1-\lambda) \cdot R(\mathbf{x})+\lambda \cdot D(\mathbf{x})$



#### f-Anogan

```
f-AnoGAN: Fast unsupervised anomaly detection with generative adversarial networks (2019)
```

> Anogan的完善（会议->期刊）
>
> <img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Anomaly-Detection/AD1.png" alt="img" style="zoom:50%;" />
> 三种训练方式：
>
> - ziz：$$\left.L_{z i z}(z)=\frac{1}{d} \| z-\hat{z}\right) \|^{2}$$
>
> 
>
> - izi：$$L_{i z i}(x)=\frac{1}{n}\|x-G(\hat{z})\|^{2}$$
>
> 
>
> - izif：$$L_{i z i f}(x)=\frac{1}{n}\|x-G(\hat{z})\|^{2}+\lambda \frac{1}{n_{d}}\|f(x)-f(G(\hat{z}))\|^{2}$$
>
> 对比的baseline：
>
> <img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Anomaly-Detection/AD2.png" alt="img" style="zoom:40%;" />



#### EGBAD

```
Efficient GAN-Based Anomaly Detection (2018-02)
```

> 基于Bigan模型
>
> 训练时生成器将潜在表示z映射到$\hat x$，编码器E将输入样本x映射到潜在表示$\hat z$，判别器不仅考虑实际和生成图像的差异，还考虑了潜在表示的差异
>
> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Anomaly-Detection/AD7.png)
>
> 异常分数：$$A(x)=\alpha L_{G}(x)+(1-\alpha) L_{D}(x)$$ 
>
> - 生成器：$$L_{G}(x)=\|x-G(E(x))\|_{1}$$
>
>   
>
> - 判别器：$$L_D(x)=\sigma(D(x, E(x)), 1)$$  or  $$L_D(x)=\left\|f_{D}(x, E(x))-f_{D}(G(E(x)), E(x))\right\|_{1}$$
>
> *测试时不需要将 x编码成 z这一步耗时的部分*



#### ALOCC

```
Adversarially Learned One-Class Classifier for Novelty Detection (2018-05)
```

> 模型由R和D两个网络组成，其中R部分包括了一个自动编码和自动译码器，而D部分则是一个CNN网络，用于对经过R重新生成的数据进行一分类，从而实现异常检测
>
> <img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Anomaly-Detection/AD3.png" alt="img" style="zoom:50%;" />
>
> 损失函数：$$\mathcal{L}=\mathcal{L}_{\mathcal{R}+\mathcal{D}}+\lambda \mathcal{L}_{\mathcal{R}}$$
>
> - $$L _{R+D}=\min _{ R } \max _{ D }\left( E _{X \sim p_{t}}[\log ( D (X))]++ E _{\tilde{X} \sim p_{t}+ N _{\sigma}}[\log (1- D ( R (\tilde{X})))]\right)$$
> - $$L _{ R }=\left\|X-X^{\prime}\right\|^{2}$$ (增强原始数据，抑制异常数据)
>
> 
>
> 测试阶段：
>
> $$\operatorname{OCC}(X)=\left\{\begin{array}{ll}
> \text { Target Class } & \text { if } D ( R (X))>\tau \\
> \text { Novelty (Outlier) } & \text { otherwise }
> \end{array}\right.$$



#### AAE

```
Unsupervised Detection of Lesions in Brain MRI using constrained adversarial auto-encoders (2018-06)
```

> 用AAE来学习建模正常数据分布
>
> <img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Anomaly-Detection/AD11.png" alt="img" style="zoom:50%;" />
>
> - 对于在正常分布的的两个数据之间的距离，有时比一个正常和一个异常之间的距离还大，所以提出在隐空间也加一个约束
>
> - 通过潜在约束，以确保正常样本在潜在空间的一致性，能够更准确地检测异常区域
>
>   
>
> 实验：
>
> <img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Anomaly-Detection/AD9.png" alt="img" style="zoom:50%;" />



#### VAE

```
Anomaly Detection for Skin Disease Images Using Variational Autoencoder (2018-07)
```

> <img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Anomaly-Detection/AD8.png" alt="img" style="zoom:50%;" />
> $$Anomaly \ score =s_{i w a e}^{k l}(x)+s_{i w a e}^{r e c o n s t}(x)$$
> 
> $$\begin{aligned}
> &s_{i w a e}^{k l}(x)=-\log \left(\frac{1}{L} \sum_{i=1}^{L} \frac{p\left(z_{i}\right)}{q\left(z_{i} | x\right)}\right)\\
>&s_{i w a e}^{r e c o n s t}(x)=-\log \left(\frac{1}{L} \sum_{i=1}^{L} p\left(x | z_{i}\right)\right)
> \end{aligned}$$



#### ganomaly

```
Ganomaly: Semi-supervised anomaly detection via adversarial training (2018-11)
```
> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Anomaly-Detection/AD4.png)
> 损失函数：$$\mathcal{L}=w_{adv}\mathcal{L}_{adv}+w_{con}\mathcal{L}_{con}+w_{enc} \mathcal{L}_{enc}$$
>
> 
>
> 异常分数：$$\mathcal{A}(\hat{x})=\left\|G_{E}(\hat{x})-E(G(\hat{x}))\right\|_{1}$$



#### ALAD

```
Adversarially Learned Anomaly Detection (2018-12)
```

> Efficient GAN的升级版
>
> <img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Anomaly-Detection/AD12.png" alt="img" style="zoom:40%;" />
>
> 训练过程：
>
> <img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Anomaly-Detection/AD13.png" alt="img" style="zoom:67%;" />
>
> 异常分数：$A(x)=\left\|f_{x x}(x, x)-f_{x x}(x, G(E(x)))\right\|_{1}$



#### Skip-GANomaly

```
Skip-ganomaly: Skip connected and adversarially trained encoder-decoder anomaly detection (2019-01)
```

> <img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Anomaly-Detection/AD5.png" alt="img" style="zoom:50%;" />
> <img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Anomaly-Detection/AD6.png" alt="img" style="zoom:40%;" />
> 损失函数：$$\mathcal{L}=\lambda_{a d v} \mathcal{L}_{a d v}+\lambda_{c o n} \mathcal{L}_{c o n}+\lambda_{l a t} \mathcal{L}_{l a t}$$
>
> 
>
> 异常分数：$$\mathcal{A}(\dot{x})=\lambda R(\dot{x})+(1-\lambda) L(\dot{x})$$



#### ADAE

```
Anomaly Detection with Adversarial Dual Autoencoders (2019-02)
```

> <img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Anomaly-Detection/AD10.png" alt="img" style="zoom:50%;" />
>
> 训练过程：
>
> - $${L}_{D}=\|X-D(X)\|_{1}-\|G(X)-D(G(X))\|_{1}$$ (重建实际输入，但不重建生成输入)
> - $${L}_{G}=\|X-G(X)\|_{1}+\|G(X)-D(G(X))\|_{1}$$ (生成器除了重建实际输入之外，还重建生成的数据)
>
> 测试过程
>
> - 异常分数：$${A}(\hat{x})=\|\hat{x}-{D}({G}(\hat{x}))\|_{2}$$
>
> <img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Anomaly-Detection/AD14.png" alt="img" style="zoom:50%;" />



#### HADGAN

```
Discriminative Reconstruction Constrained Generative Adversarial Network for Hyperspectral Anomaly Detection (2020=01)
```

> > HADGAN的应用对象为高光谱图像
> >
> > 利用原图和生成图像得到Residual image进行异常检测
>
> 训练模型在f-Anogan的基础上加入了类似于AAE中的隐空间分布约束
>
> <img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Anomaly-Detection/AD18.png" alt="img" style="zoom:50%;" />
>
> <img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Anomaly-Detection/AD17.png" alt="img" style="zoom:50%;" />
>
> 测试时利用Residual image计算得到$D_{spatial}$和$D_{spectral}$，最终得到$$D_{SS}=\lambda_1D_{spatial}+(1-\lambda_1)D_spectral$$





#### CAVGA

```
Attention Guided Anomaly Localization in Images (v1: 2019-11 v2:2020-05)
```

> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Anomaly-Detection/AD15.png)
>
> > 无监督$CAVGA_u$：
> >
> > - 使用卷积潜变量来保留输入数据的空间信息（VAE架构），并加入鉴别器提升VAE模型重构性能
> > - 对于由编码器得到的的feature map，计算得到attention map，使得潜变量的特征表示可以编码所有的正常区域
> >
> > - Attention Expansion Loss损失使从卷积潜变量中生成的attention map覆盖正常图像的全图
>
> > 损失函数：$$L_{\text {final}}=w_{r} L+w_{a d v} L_{a d v}+w_{a e} L_{a e}$$
> >
> > - $$L=L_{R}(x, \hat{x})+K L\left(q_{\phi}(z | x) \| p_{\theta}(z | x)\right)$$
> >
> > - $$L_{a d v}=-\frac{1}{N} \sum_{i=1}^{N} \log \left(D\left(x_{i}\right)\right)+\log \left(1-D\left(\hat{x}_{i}\right)\right)$$
> >
> > - $$L_{a e, 1}=\frac{1}{|A|} \sum_{i, j}\left(1-A_{i, j}\right)$$
> >
> >   > 使用Grad-CAM计算A并使用Sigmoid进行归一化，$A_{i,j}\in[0,1]$
> >   >
> >   > 对于正常图像，注意力应遍布全图
>
> 
>
> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/Anomaly-Detection/AD16.png)
>
> > 弱监督$CAVGA_w$：在训练集中加入少量的异常图片来提高模型的检测和定位效果
>
> > 以无监督$CAVGA_u$为基础，在输出$z$后加入一个二分类器$C$，用二元交叉熵损失$L_{bce}$来训练
> >
> > 由于生成的attention map依赖于分类器的性能，通过complementary guided attention loss（互补引导注意损失）来提升$C$的性能
> >
> > - $L_{cga}$使异常attention map注意的区域最小化，同时正常attention map尽可能覆盖全图
> > - 仅在$p=y=c_n$即正常图像分类正确的时候计算互补引导注意损失项
>
> > 损失函数：$$L_{\text {final}}=w_{r} L+w_{\text {adv}} L_{a d v}+w_{c} L_{b c e}+w_{\text {cga}} L_{\text {cga}}$$
> >
> > - $$L=L_{R}(x, \hat{x})+K L\left(q_{\phi}(z | x) \| p_{\theta}(z | x)\right)$$
> > - $$L_{bce}=-\left[y_{i} \log x_{i}+\left(1-y_{i}\right) \log \left(1-x_{i}\right)\right]$$
> > - $$L_{a d v}=-\frac{1}{N} \sum_{i=1}^{N} \log \left(D\left(x_{i}\right)\right)+\log \left(1-D\left(\hat{x}_{i}\right)\right)$$
> > - $$L_{c g a, 1}=\frac{\mathbb{1}\left(p=y=c_{n}\right)}{\left|A_{x}^{c_{n}}\right|} \sum_{i, j}\left(1-\left(A_{x}^{c_{n}}\right)_{i, j}+\left(A_{x}^{c_{a}}\right)_{i, j}\right)$$



#### ALAE

> 

---

### Paper

#### Anomaly-Classification-Target

> 基于一分类的异常分类方法

- Estimating the Support of a High- Dimensional Distribution [**OC-SVM**] | **[Journal of Neural Computation' 01]** | [`[pdf]`](http://users.cecs.anu.edu.au/~williams/papers/P132.pdf)
- A Survey of Recent Trends in One Class Classification | **[AICS' 09]** | [`[pdf]`](https://aran.library.nuigalway.ie/xmlui/bitstream/handle/10379/1472/camera_ready_occ_lnai.pdf?sequence=1)
- Anomaly detection using autoencoders with nonlinear dimensionality reduction | **[MLSDA Workshop' 14]** | [`[link]`](https://dl.acm.org/citation.cfm?id=2689747)
- A review of novelty detection | **[Signal Processing' 14]** | [`[link]`](https://www.sciencedirect.com/science/article/pii/S016516841300515X)
- Variational Autoencoder based Anomaly Detection using Reconstruction Probability | **[SNU DMC Tech' 15]** | [`[pdf]`](http://dm.snu.ac.kr/static/docs/TR/SNUDM-TR-2015-03.pdf)
- High-dimensional and large-scale anomaly detection using a linear one-class SVM with deep learning | **[Pattern Recognition' 16]** | [`[link]`](https://dl.acm.org/citation.cfm?id=2952200)
- Transfer Representation-Learning for Anomaly Detection | **[ICML' 16]** | [`[pdf]`](https://pdfs.semanticscholar.org/c533/52a4239568cc915ad968aff51c49924a3072.pdf)
- Outlier Detection with Autoencoder Ensembles | **[SDM' 17]** | [`[pdf]`](http://saketsathe.net/downloads/autoencode.pdf)
- Provable self-representation based outlier detection in a union of subspaces | **[CVPR' 17]** | [`[pdf]`](https://arxiv.org/pdf/1704.03925.pdf)
- [**ALOCC**]Adversarially Learned One-Class Classifier for Novelty Detection | **[CVPR' 18]** | [`[pdf]`](https://arxiv.org/pdf/1802.09088.pdf) [`[code]`](https://github.com/khalooei/ALOCC-CVPR2018)
- Learning Deep Features for One-Class Classification | **[arXiv' 18]** | [`[pdf]`](https://arxiv.org/pdf/1801.05365.pdf) [`[code]`](https://github.com/PramuPerera/DeepOneClass)
- Efficient GAN-Based Anomaly Detection | **[arXiv' 18]** | [`[pdf]`](https://arxiv.org/pdf/1802.06222.pdf)
- Hierarchical Novelty Detection for Visual Object Recognition | **[CVPR' 18]** | [`[pdf]`](https://arxiv.org/pdf/1804.00722.pdf)
- Deep One-Class Classification | **[ICML' 18]** | [`[pdf]`](http://data.bit.uni-bonn.de/publications/ICML2018.pdf)
- Reliably Decoding Autoencoders’ Latent Spaces for One-Class Learning Image Inspection Scenarios | **[OAGM Workshop' 18]** | [`[pdf]`](https://workshops.aapr.at/wp-content/uploads/Proceedings/2018/OAGM_2018_paper_19.pdf)
- q-Space Novelty Detection with Variational Autoencoders | **[arXiv' 18]** | [`[pdf]`](https://arxiv.org/pdf/1806.02997.pdf)
- GANomaly: Semi-Supervised Anomaly Detection via Adversarial Training | **[ACCV' 18]** | [`[pdf]`](https://arxiv.org/pdf/1805.06725.pdf)
- Deep Anomaly Detection Using Geometric Transformations | **[NIPS' 18]** | [`[pdf]`](http://papers.nips.cc/paper/8183-deep-anomaly-detection-using-geometric-transformations.pdf)
- Generative Probabilistic Novelty Detection with Adversarial Autoencoders | **[NIPS' 18]** | [`[pdf]`](http://papers.nips.cc/paper/7915-generative-probabilistic-novelty-detection-with-adversarial-autoencoders.pdf)
- A loss framework for calibrated anomaly detection | **[NIPS' 18]** | [`[pdf]`](http://papers.nips.cc/paper/7422-a-loss-framework-for-calibrated-anomaly-detection.pdf)
- A Practical Algorithm for Distributed Clustering and Outlier Detection | **[NIPS' 18]** | [`[pdf]`](http://papers.nips.cc/paper/7493-a-practical-algorithm-for-distributed-clustering-and-outlier-detection.pdf)
- Efficient Anomaly Detection via Matrix Sketching | **[NIPS' 18]** | [`[pdf]`](http://papers.nips.cc/paper/8030-efficient-anomaly-detection-via-matrix-sketching.pdf)
- Adversarially Learned Anomaly Detection | **[IEEE ICDM' 18]** | [`[pdf]`](https://arxiv.org/pdf/1812.02288.pdf)
- Anomaly Detection With Multiple-Hypotheses Predictions | **[ICML' 19]** | [`[pdf]`](https://arxiv.org/pdf/1810.13292v5.pdf)
- Exploring Deep Anomaly Detection Methods Based on Capsule Net | **[ICMLW' 19]** | [`[pdf]`](https://arxiv.org/pdf/1907.06312v1.pdf)
- Latent Space Autoregression for Novelty Detection | **[CVPR' 19]** | [`[pdf]`](https://arxiv.org/pdf/1807.01653.pdf)
- OCGAN: One-Class Novelty Detection Using GANs With Constrained Latent Representations | **[CVPR' 19]** | [`[pdf]`](https://arxiv.org/pdf/1903.08550.pdf)
- Unsupervised Learning of Anomaly Detection from Contaminated Image Data using Simultaneous Encoder Training | **[arXiv' 19]** | [`[pdf]`](https://arxiv.org/pdf/1905.11034.pdf)
- Using Self-Supervised Learning Can Improve Model Robustness and Uncertainty | **[NeurIPS' 19]** | [`[pdf]`](https://arxiv.org/abs/1906.12340) [`[code]`](https://github.com/hendrycks/ss-ood)
- Classification-Based Anomaly Detection for General Data | **[ICLR' 20]** | [`[pdf]`](https://openreview.net/pdf?id=H1lK_lBtvS)
- Robust Subspace Recovery Layer for Unsupervised Anomaly Detection | **[ICLR' 20]** | [`[pdf]`](https://openreview.net/pdf?id=rylb3eBtwr)
- RaPP: Novelty Detection with Reconstruction along Projection Pathway | **[ICLR' 20]** | [`[pdf]`](https://openreview.net/pdf?id=HkgeGeBYDB)
- Novelty Detection Via Blurring | **[ICLR' 20]** | [`[pdf]`](https://openreview.net/pdf?id=ByeNra4FDB)
- Deep Semi-Supervised Anomaly Detection | **[ICLR' 20]** | [`[pdf]`](https://openreview.net/pdf?id=HkgH0TEYwH)
- Robust anomaly detection and backdoor attack detection via differential privacy | **[ICLR' 20]** | [`[pdf]`](https://openreview.net/pdf?id=SJx0q1rtvS)



#### OOD-Detction-Target

> 基于异常分布的异常检测方法

- A Baseline for Detecting Misclassified and Out-of-Distribution Examples in Neural Networks | **[ICLR' 17]** | [`[pdf]`](https://arxiv.org/pdf/1610.02136.pdf)
- [**ODIN**] Enhancing The Reliability of Out-of-distribution Image Detection in Neural Networks | **[ICLR' 18]** | [`[pdf]`](https://arxiv.org/pdf/1706.02690.pdf)
- Training Confidence-calibrated Classifiers for Detecting Out-of-Distribution Samples | **[ICLR' 18]** | [`[pdf]`](https://arxiv.org/pdf/1711.09325.pdf)
- Learning Confidence for Out-of-Distribution Detection in Neural Networks | **[arXiv' 18]** | [`[pdf]`](https://arxiv.org/pdf/1802.04865.pdf)
- Out-of-Distribution Detection using Multiple Semantic Label Representations | **[NIPS' 18]** | [`[pdf]`](http://papers.nips.cc/paper/7967-out-of-distribution-detection-using-multiple-semantic-label-representations.pdf)
- A Simple Unified Framework for Detecting Out-of-Distribution Samples and Adversarial Attacks | **[NIPS' 18]** | [`[pdf]`](http://papers.nips.cc/paper/7947-a-simple-unified-framework-for-detecting-out-of-distribution-samples-and-adversarial-attacks.pdf)
- Deep Anomaly Detection with Outlier Exposure | **[ICLR' 19]** | [`[pdf]`](https://openreview.net/pdf?id=HyxCxhRcY7)
- Why ReLU networks yield high-confidence predictions far away from the training data and how to mitigate the problem | **[CVPR' 19]** | [`[pdf]`](https://arxiv.org/pdf/1812.05720.pdf)
- Outlier Exposure with Confidence Control for Out-of-Distribution Detection | **[arXiv' 19]** | [`[pdf]`](https://arxiv.org/abs/1906.03509v2) [`[code]`](https://github.com/nazim1021/OOD-detection-using-OECC)
- Likelihood Ratios for Out-of-Distribution Detection | **[NeurIPS' 19]** | [`[pdf]`](https://arxiv.org/pdf/1906.02845.pdf)
- Input Complexity and Out-of-distribution Detection with Likelihood-based Generative Models | **[ICLR' 20]** | [`[pdf]`](https://openreview.net/pdf?id=SyxIWpVYvr)



#### Anomaly-Segmentation-Target

> 基于一分类的异常分割方法

- Anomaly Detection and Localization in Crowded Scenes | **[TPAMI' 14]** | [`[pdf]`](http://www.svcl.ucsd.edu/publications/journal/2013/pami.anomaly/pami_anomaly.pdf)
- Novelty detection in images by sparse representations | **[IEEE Symposium on IES' 14]** | [`[link]`](https://ieeexplore.ieee.org/document/7008985/)
- Detecting anomalous structures by convolutional sparse models | **[IJCNN' 15]** | [`[pdf]`](http://www.cs.tut.fi/~foi/papers/IJCNN2015-Carrera-Detecting_Anomalous_Structures.pdf)
- Real-Time Anomaly Detection and Localization in Crowded Scenes | **[CVPR Workshop' 15]** | [`[pdf]`](https://arxiv.org/pdf/1511.06936.pdf)
- Learning Deep Representations of Appearance and Motion for Anomalous Event Detection | **[BMVC' 15]** | [`[pdf]`](https://arxiv.org/pdf/1510.01553.pdf)
- Scale-invariant anomaly detection with multiscale group-sparse models | **[IEEE ICIP' 16]** | [`[link]`](https://ieeexplore.ieee.org/document/7533089/)
- [**AnoGAN**] Unsupervised Anomaly Detection with Generative Adversarial Networks to Guide Marker Discovery | **[IPMI' 17]** | [`[pdf]`](https://arxiv.org/pdf/1703.05921.pdf)
- Deep-Anomaly: Fully Convolutional Neural Network for Fast Anomaly Detection in Crowded Scenes | **[Journal of Computer Vision and Image Understanding' 17]** | [`[pdf]`](https://arxiv.org/pdf/1609.00866.pdf)
- Anomaly Detection using a Convolutional Winner-Take-All Autoencoder | **[BMVC' 17]** | [`[pdf]`](http://eprints.whiterose.ac.uk/121891/1/BMVC2017.pdf)
- Anomaly Detection in Nanofibrous Materials by CNN-Based Self-Similarity | **[Sensors' 17]** | [`[pdf]`](http://www.mdpi.com/1424-8220/18/1/209/pdf)
- Defect Detection in SEM Images of Nanofibrous Materials | **[IEEE Trans. on Industrial Informatics' 17]** | [`[pdf]`](http://home.deib.polimi.it/boracchi/docs/2017_Anomaly_Detection_SEM.pdf)
- Abnormal event detection in videos using generative adversarial nets | **[ICIP' 17]** | [`[link]`](https://ieeexplore.ieee.org/document/8296547/)
- An overview of deep learning based methods for unsupervised and semi-supervised anomaly detection in videos | **[arXiv' 18]** | [`[pdf]`](https://arxiv.org/pdf/1801.03149.pdf)
- Improving Unsupervised Defect Segmentation by Applying Structural Similarity to Autoencoders | **[arXiv' 18]** | [`[pdf]`](https://arxiv.org/pdf/1807.02011.pdf)
- Satellite Image Forgery Detection and Localization Using GAN and One-Class Classifier | **[IS&T EI' 18]** | [`[pdf]`](https://arxiv.org/pdf/1802.04881.pdf)
- Deep Autoencoding Models for Unsupervised Anomaly Segmentation in Brain MR Images | **[arXiv' 18]** | [`[pdf]`](https://arxiv.org/pdf/1804.04488.pdf)
- AVID: Adversarial Visual Irregularity Detection | **[arXiv' 18]** |[`[pdf]`](https://arxiv.org/pdf/1805.09521.pdf)
- MVTec AD -- A Comprehensive Real-World Dataset for Unsupervised Anomaly Detection | **[CVPR' 19]** | [`[pdf]`](https://www.mvtec.com/fileadmin/Redaktion/mvtec.com/company/research/mvtec_ad.pdf)
- Exploiting Epistemic Uncertainty of Anatomy Segmentation for Anomaly Detection in Retinal OCT | **[IEEE TMI' 19]** | [`[pdf]`](https://arxiv.org/pdf/1905.12806v1.pdf)
- Uninformed Students: Student-Teacher Anomaly Detection with Discriminative Latent Embeddings | **[arXiv' 19]** | [`[pdf]`](https://arxiv.org/pdf/1911.02357.pdf)
- Attention Guided Anomaly Detection and Localization in Images | **[arXiv' 19]** | [`[pdf]`](https://arxiv.org/pdf/1911.08616v1.pdf)


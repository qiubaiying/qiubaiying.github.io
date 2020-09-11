---
layout:     post
title:      PaperSharing - A Error correction tool "CARE" (Content-Aware)
subtitle:   2020 Bioinformatics 
date:       2020-08-23
author:     Xuan
header-img: img/post-bg-2.png
catalog: true
tags:
    - Paper_sharing 
    - Error_correction
---

> Title: CARE: Content-Aware Sequencing Read Error Correction

- a alignment-based method 
- using **minhash** : for efficient similarity search
- GPU acceleration (handle human genome in only 4 hours)
- evaluation: false positive; true positive; superior de nove assembly
- written in C++ [code](https://github.com/fkallen/CARE)

>>  how to compare assembly results?


## Content
![paper structure](/img/post-ct-care.png)

1.Two catagories of the existing EC(error correction) methods:

- k-mer spectrum based methods
- multiple sequence alignment based methods

> **k-mer**: inspect kmer spectrum; **determine** solid or weak kmer (trusted or untrusted) by choosing threshold (assuming that an errorneous kmer does not appear frequently); **replace** weak kmers by similar solid kmers;  
**weakness**: may fail is in low coverage genomic regions where error-free k-mers are identified as weak since their frequency falls below the utilized abundance threshold.  
e.g. SGA-EC (Simpson and Durbin, 2012), Musket (Liu et al., 2013), RACER (Ilie and Molnar, 2013), Lighter (Song et al., 2014), Blue (Greenfield et al., 2014), BFC (Li, 2015), BLESS (Heo et al., 2016), RECKONER (Długosz and Deorowicz, 2017), and Athena (Abdallah et al., 2019). 

> **multiple sequence alignment (MSA)** : **build MSA**; **correct** according to consensus MSA column; 
**advantages**: well performance on low coverage region compared with kmer-based methods
**weakness**: higher computational complexity  
e.g. Coral (Salmela and Schröder, 2011) and ECHO (Kao et al., 2011),Fiona (Schulz et al., 2014), Karect (Allam et al., 2015), Bcool (Limasset et al., 2019), and BrownieCorrector (Heydari et al., 2019)  distinguished by utilized **data structures (such as suffix trees/arrays, hash tables, or de Bruijn graphs)**

2.challenges of MSA methods

- efficiently **calculate similarity** of reads to build MSA
- accurate and quick *select candidate reads* of a seed/anchor read

> CARE uses *minhash* to approch the above aims



### Jaccard Index

S(A,B) = |A_∩\_B|/|A∪B|

>A，B 两个集合：A = {s1, s3, s6, s8, s9} ; B = {s3, s4, s7, s8, s10}  
根据Jaccard Index公式，A,B的相似度 S(A,B) = |A_∩\_B|/|A∪B| = 2/8 = 0.25  
<\br>
随机从两个集合中各挑选一个元素s(A)、s(B)，刚好这两个无素相同的概率 **其实等于** 在A∪B这个大的随机域里，选中的元素落在A_∩B_这个区域的概率，这个概率就等于Jaccard的相似度！**这就是MinHash的基本原理**  
找一个随机的哈希函数h,对集合的每一个元素作哈希运算，比如集合A，可以算出5个hash值，因为是随机的，这5个hash值里值最小的那个元素，对于A集合中所有元素概率都是均等的。同样方法从B中取最小hash值，2个minhash相等的概率就是集合的相似度了。


### Minhash

Minhash a specific locality sensitive hashing *subsampling technique* (originally introduced 2000)

>给出N个集合，找到相似的集合对，如何实现呢？直观的方法是比较任意两个集合。那么可以十分精确的找到每一对相似的集合，但是时间复杂度是O(n2)。**Minhash和LSH（Locality-sensitive Hashing）**来实现上述目的，在相似的集合较少的情况下，可以在O(n)时间找到大部分相似的集合对。  
<\br>
只需要找到N个哈希函数，对集合生成一组minhash，算两个集合的相似度，也就是这2组minhash中，交集/并集了。这个计算相对容易了，因为每个集合的元素数变成了常数N，也就是说，MinHash其实是一种降维技术。

## Innovation


1. Using minhashing

CARE is based on a variant of minhashing to quickly find a set of candidate reads which are similar to a query read with high probability.


## learning


## Reference

[CARE: Content-Aware Sequencing Read Error Correction](https://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=8621325)

[MinHash原理与应用](http://jm.taobao.org/2012/10/29/minhash-intro/)

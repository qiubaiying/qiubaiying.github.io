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

> *k-mer*: inspect kmer spectrum; *determine* solid or weak kmer (trusted or untrusted) by choosing threshold (assuming that an errorneous kmer does not appear frequently); *replace* weak kmers by similar solid kmers;  
*weakness*: may fail is in low coverage genomic regions where error-free k-mers are identified as weak since their frequency falls below the utilized abundance threshold.  
e.g. SGA-EC (Simpson and Durbin, 2012), Musket (Liu et al., 2013), RACER (Ilie and Molnar, 2013), Lighter (Song et al., 2014), Blue (Greenfield et al., 2014), BFC (Li, 2015), BLESS (Heo et al., 2016), RECKONER (Długosz and Deorowicz, 2017), and Athena (Abdallah et al., 2019). 

> *multiple sequence alignment (MSA)* : *build MSA*; *correct* according to consensus MSA column; 
*advantages*: well performance on low coverage region compared with kmer-based methods
*weakness*: higher computational complexity  
e.g. Coral (Salmela and Schröder, 2011) and ECHO (Kao et al., 2011),Fiona (Schulz et al., 2014), Karect (Allam et al., 2015), Bcool (Limasset et al., 2019), and BrownieCorrector (Heydari et al., 2019)  distinguished by utilized *data structures (such as suffix trees/arrays, hash tables, or de Bruijn graphs)*

2.challenges of MSA methods

- efficiently *calculate similarity* of reads to build MSA
- accurate and quick *select candidate reads* of a seed/anchor read

> CARE uses *minhash* to approch the above aims

3.Definition of Minhash

Minhash a specific locality sensitive hashing *subsampling technique* (originally introduced 2000)

 
## Innovation


1. Using minhashing

CARE is based on a variant of minhashing to quickly find a set of candidate reads which are similar to a query read with high probability.


## learning


## Reference

[CARE: Content-Aware Sequencing Read Error Correction](https://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=8621325)

[MinHash原理与应用](http://jm.taobao.org/2012/10/29/minhash-intro/)

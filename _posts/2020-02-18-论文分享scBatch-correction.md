---
layout:     post
title:      ‘Batch Effect Correction of RNA-seq Data through Sample Distance Matrix Adjustment’
subtitle:   Paper sharing
date:       2020-02-18
author:     Xuan
header-img: img/post-bg-1.png
catalog: true
tags:
    - Paper_share
---

# Paper sharing

## scBatch: **Batch Effect Correction** of **RNA-seq** Data through **Sample Distance Matrix Adjustment**

papar info: 2020; published in Bioinformatics

## Novelty

- unfinish
- not seq error correction, it is the correction for **gene expression counts** 

## Brief introduction

1.Batch effect: _batch_ means a number of the factors (including different laboratories, different sample preparation batches, different sequencing...)

2.Existing Methods:
- establish linear models of gene expression with biolofical groups (e.g. disease and control group)
> - DE gene analysis package (Limma).  
2017- scPLS

- empirical Bayes algorithm (e.g. ComBat)
> - an improved version 2020-ComBat-seq (by nagative binomial regression)

- consensus clustering method (SC3: conduct clustering analysis based on multiple distance metrics)
> - BatchEffectRemovel.  


3.Limitation of linear methods: require the knowledge of biological groups for each observation, which is hardly feasible.

4.spike-in genes?
> spike-in方法，指在RNA-seq建库过程中参入一些预先知道序列信息以及序列绝对数量的内参，这样在进行RNA-Seq测序的时候就可以通过不同样本之间内参（spike-in）的量来做一条标准曲线，就可以非常准确地对不同样本之间的表达量进行矫正。  
常用的spike-in类型：ERCC Control RNA （External RNA Controls Consortium）.

5.workflow
- input： gene expression counts matrix

6.Dataset
- simulated data : (PROPER for data simulation)
- real data


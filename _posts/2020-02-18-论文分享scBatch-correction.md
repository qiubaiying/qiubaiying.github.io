---
layout:     post
title:      论文分享-‘Batch Effect Correction’
subtitle:   A review of k-mer counting methods
date:       2020-02-18
author:     Xuan
header-img: img/post-bg-2.jpg
catalog: true
tags:
    - Paper
---

# Paper sharing

## scBatch: **Batch Effect Correction** of **RNA-seq** Data through **Sample Distance Matrix Adjustment**

papar info: 2020; published in Bioinformatics

##Novelty

##Brief introduction

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

4. spike-in genes?

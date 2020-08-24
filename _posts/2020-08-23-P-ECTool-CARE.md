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

## Innovation


1. Using minhashing

CARE is based on a variant of minhashing to quickly find a set of candidate reads which are similar to a query read with high probability.


## learning


## Reference

[CARE: Content-Aware Sequencing Read Error Correction](https://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=8621325)

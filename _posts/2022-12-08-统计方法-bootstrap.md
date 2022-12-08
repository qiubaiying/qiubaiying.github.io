---
layout:     post
title:      Statistic Notes - Bootstrap 
subtitle:   Bootstrapped datasets / Bootstrapping steps
date:       2022-12-08
author:     Xuan
header-img: img/post-bg-2.png
catalog: true
tags:
    - bootstrap - statquest
---


# What is the bootstrapping for?

- A way to generated simulated datasets, randomly selection data and allowing for duplicates. (Sampling with replacement)
- A resampling method to estimate parametersinstead of repeating experiment many times for a reasonable distribution.
    - data are non-normal
    - unknown statistical properties (e.g. PCA )
    - lack a standard calculation

## bootstrapping steps

Application Scenario: only a single sample is available

preparaion: an exist/raw dataset


Step1: make a bootstrapped dataset (randomly select the same number of data from the existing dataset)

Step2: calculate statistics(e.g. mean)

Step3: keep track of the calculated statistics

Step4: repeat step1-3 a bunch of times

> bootstrapping procedura can maintains data structure but reshuffles values; can sample each value multiple times, or not at all

![bootstrapping steps](/img/post-ct-steps.png)


## Reference

[Using bootstrapping](https://www.youtube.com/watch?v=N4ZQQqyIf6k&list=RDLVXz0x-8-cgaQ&start_radio=1)

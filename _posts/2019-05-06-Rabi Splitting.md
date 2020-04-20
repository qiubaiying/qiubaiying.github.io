---
layout:     post
title:      Rabi Splitting
subtitle:   演讲的记录与收获
date:       2019-05-06
author:     JPZhuang
header-img: img/post-bg-coffee.jpeg
catalog: true
tags:
    - 演讲
    - AMO
---

<head>
    <script src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML" type="text/javascript"></script>
    <script type="text/x-mathjax-config">
        MathJax.Hub.Config({
            tex2jax: {
            skipTags: ['script', 'noscript', 'style', 'textarea', 'pre'],
            inlineMath: [['$','$']]
            }
        });
    </script>
</head>



> 和能带理论中打开gap的机制很像，他们有共同之处吗？


## Model

两个耦合的振子

$$ 
\begin{aligned} m_{A} \ddot{x}_{A}+k_{A} x_{A}+\kappa\left(x_{A}-x_{B}\right) &=0 \\ m_{B} \ddot{x}_{B}+k_{B} x_{B}-\kappa\left(x_{A}-x_{B}\right) &=0 \end{aligned}
$$

方程的解有形式$x_{i}(t)=x_{i}^{0} \exp \left[-i \omega_{ \pm} t\right]$
本征频率
$$ 
\omega_{ \pm}^{2}=\frac{1}{2}\left[\omega_{A}^{2}+\omega_{B}^{2} \pm \sqrt{\left(\omega_{A}^{2}-\omega_{B}^{2}\right)^{2}+4 \Gamma^{2} \omega_{A} \omega_{B}}\right]
 $$
 - 其中$\omega_{A}^{0}=\sqrt{k_{A} / m_{A}}$和$\omega_{B}^{0}=\sqrt{k_{B} / m_{B}}$
 - $\omega_{A}=\sqrt{\left(k_{A}+\kappa\right) / m_{A}},\omega_{B}=\sqrt{\left(k_{B}+\kappa\right) / m_{B}}$
 - $\Gamma=\frac{\sqrt{\kappa / m_{A}} \sqrt{\kappa / m_{B}}}{\sqrt{\omega_{A} \omega_{B}}}$

## 性质分析

- absence of coupling
- coupling is introduced  ---a frequency splitting

$$ 
\left[\omega_{+}-\omega_{-}\right]=\Gamma
 $$

> 参考
>  [Strong coupling, energy splitting, and level crossings: A classical perspective](https://www.photonics.ethz.ch/fileadmin/user_upload/novotny10a.pdf)
>





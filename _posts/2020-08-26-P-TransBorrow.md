---
layout:     post
title:      PaperSharing - A genome-guided transcriptome assembly method "TransBorrow"
subtitle:   2020 Genome Research
date:       2020-08-26
author:     Xuan
header-img: img/post-bg-2.png
catalog: true
tags:
    - Paper_sharing 
    - assembly
---

> Title: TransBorrow: genome-guided transcriptome assembly by borrowing assemblies from different assemblers
Author: 山东大学（威海）柳军涛课题组和[沙特阿卜杜拉国王科技大学（KAUST）高欣教授课题组](http://sfb.kaust.edu.sa)

## Question

1. "map subpaths to the splicing graph" - what is the **splicing graph**?

2. 如何结合不同方法的结果？

3. 创新点是？

4. 如何比较评价组装结果的好坏？

- 在模拟数据上，作者分别在转录层面和基因层面的组装精度（图2A-2D），以及对于不同表达水平转录本的恢复能力上（图2E-2G）来综合评估TransBorrow的性能。

- 在真实数据集上，作者通过在转录层面的组装精度比较（图3），基因层面的组装精度的比较（图4），恢复不同表达水平的转录本的比较（图5），以及运行时间和内存使用情况的比较来综合评估TransBorrow的性能。


## Content

1.TransBorrow Flowchart
> 该组装工具首先建立基于片段回贴的剪接图，并利用双端测序信息从剪接图中提取可靠的双端子路。然后，它通过构建所谓的色彩图从不同的组装工具中借用可靠的子序列。随后，将这些可靠的子序列和双端子路径作为可靠的子路径映射到剪接图中，以指导表达的转录本正确组装。最后，作者采用一种新设计的路径延伸方法，通过在每个剪接图上以上述可靠的子路径为种子来搜索表示转录本的路覆盖，路覆盖中的每一条路径代表一个预测出的表达转录本（图1）。

2.三个同类经典组装工具相比





## Innovation

1.TransBorrow的优点
- TransBorrow尝试通过利用来自其他组装工具的不同组装结果来识别所有表达的转录本。
在此步骤中产生的可靠子序列将作为种子，有效地指导后续的组装过程。
- TransBorrow开发了一个新的图模型——色彩图，它是通过合并不同的组装结果来构建的。
基于色彩图，TransBorrow可以从合并后的组装结果中准确、高效地提取出可靠的子序列。
- TransBorrow为每个剪接图构造一个加权节点图，其边权值准确表示剪接图中每个节点的进出边之间的正确连接。
- TransBorrow利用了一种全新设计的路径延伸策略，通过种子化提取出的可靠子路，迭代选择最优邻居进行路径延伸，从而在每个加权节点图上搜索处表示表达转录的路覆盖。

2.TransBorrow的缺点
- 当前版本的TransBorrow不兼容long-read RNA-seq数据集。
- 当前版本的TransBorrow在每个单独的基因座中执行转录组组装，而不考虑嵌合转录本的拼接。
- 当前版本的TransBorrow是一个基于参考基因组的组装工具，与从头组装不兼容



## learning


## Reference
[Genome Research | TransBorrow：通过借用不同拼接工具的拼接结果来引导完成转录组拼接](https://mp.weixin.qq.com/s/CfVkNG8yUEQbeGEwADtKGw) DrugAI 公众号，金淑婷

[TransBorrow download](https://sourceforge.net/projects/transcriptomeassembly/files/TransBorrow/)


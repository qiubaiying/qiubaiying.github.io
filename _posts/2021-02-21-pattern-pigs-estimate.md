---
layout:     post
title:      Scrum Patterns(57):团队('Pigs')的估算(译)
subtitle:   A Scrum Book——The Spirit of the Game
date:       2021-02-21
author:     Bruce Wong
header-img: img/PigsEstimate_Head.jpg  
catalog: true
tags:
    - 敏捷
    - Agile
    - 译文
    - Scrum Patterns
---

##  Bruce有话说   
对工作量的估计应该基于已经掌握的情况和经验，而不是错误的假设和一厢情愿的想法。因此，应该让开发团队(其成员致力于开发产品)评估工作量。 既然估算如此重要，为什么这里会把团队称为‘Pigs’呢？难道用来形容估算的人都很笨吗？哈哈。显然不是。在敏捷圈里有一个经典小故事《鸡和猪的故事》。今天翻译的这篇Scrum Pattern的文章就是从这个故事入手，来讲解估算的事情，你将了解到：  
+ 为什么需要团队给出评估而不是某些专家或者其他干系人。 
+ 估算要持续更新不可能一次获得准确值。  
+ 估算是预测而不是承诺。

## 正文   

团队手头有一个产品Backlog或Sprint Backlog。团队使用工作量估算，对产品待办事项(PBIs)和任务(或其他Sprint待办事项)，进行预测、计划和安排工作和交付。开发团队作为一个独立的团队来进行自管理。  

✥       ✥       ✥ 

##### 团队应该根据实际情况作出估算，而不是基于假设或一厢情愿。  

有时，当有新的工作出现时，一个有同理心的经理可能想要保护团队，不让他们进行评估，他(她)可能会主动进行评估。撤销长期的评估需要团队花费一些精力，特别是当经理、产品负责人或其他有权威或对团队有权力的人将评估强加给团队的时候。  

![PigsEstimate_Pre.jpg](/img/scrum/PigsEstimate_Pre.jpg)  

开发工作往往依赖于有经验的人员和专家来进行评估。但是，可能要做这项工作的人缺乏经验，或者团队在进行评估时忘记了涉及一个重要的部分(例如，测试)。  

当其他人给出评估时，团队可能不会感到对backlog的完成有责任。如果团队中有专家，会出现层次结构，而团队作为一个整体可能不会获得评估的所有权。  

#### 因此:  

##### 让那些承担实际工作的人来做估算。
在Scrum的圈子里有一个说法，估算是猪的事而不是鸡([1]，第31页;[2], 51页;和[3]，第123页)。  

术语“猪”(开发团队成员)和“鸡”(团队以外的人)源于以下笑话:  
> 一只鸡和一只猪在一起，鸡说:“我们开一家餐馆吧!” 猪想了想说:“那我们该给餐馆取什么名字呢?” 鸡说:“火腿和蛋!” 猪说:“谢谢，不用了，对这个店来说我会全身心投入的，但你只是参与一下!”(源自[5]，第42页)  

![PigsEstimate_Post.jpg](/img/scrum/PigsEstimate_Post.jpg)  

估算应努力让产品研发相关所有部分尽可能的达成共识。研究表明，当估算结合了参与迭代工作的每个人的独立的评估、反馈的时候，估算会准确很多。因为开发团队是跨职能的，所以开发团队可以一起创建高质量的估算([4])。  


✥       ✥       ✥   

团队感到对自己的工作有责任感。这本身就很好，也会增加团队对其评估工作的关注。哦，如果他们是来自研发团队，那么他们将获得长期的高质量评估。  

特别是，产品负责人(可能和产品负责人团队一起工作)估计业务价值，而开发团队估计完成PBIs所需的成本或工作。这些团队中的任何一个都可以使用德尔菲法[6]或任何其他技术来对估算达成共识(参见估算点)。尽可能获得跨功能开发团队所有成员的观点是特别重要的。  

随着更多信息的出现，开发团队应该不断修改评估。团队可以评估新创建的产品待办事项列表项，因为它与产品负责人一起创建细化的产品待办事项列表，并且在Sprint计划中审查评估是很自然的。开发团队可以遵循直觉，根据新的信息重新进行评估。当Scrum团队在细化的产品待办事项列表，努力实现粒度梯度的同时，其实也对产品待办事项列表进行了重构，这时候估算也必然会出现更新。  

在Scrum中采用这种模式的大多数应用中，估算只是一种预测，干系人不应该将其视为一种承诺。另一方面，除了“猪”以外，没有人可以做估算。没有任何理由去挑战已经给出的估算。例如，产品负责人不能将他们对交付的愿望强加于团队对工作需要多长时间的预测之上。随着时间的推移，来自经验的洞察将帮助团队调整其估算，使其更准确。  

[1] Ken Schwaber and Mike Beedle. Agile Software Development with Scrum (Series in Agile Software Development). London: Pearson, Oct 21, 2001, p. 35.

[2] Mike Cohn. Agile Estimating and Planning, 1 edition. Englewood Cliffs, NJ: Prentice-Hall, 2005, p. 51.

[3] Kenneth S. Rubin. Essential Scrum: A Practical Guide to the Most Popular Agile Process. Reading, MA: Addison-Wesley Signature Series (Cohn), Aug. 5, 2012, p. 123.

[4] Magne Jørgensen. “What we Know about Software Development Effort Estimation.” In IEEE Software 31(2), March/April 2014, pp. 37-40.

[5] Ken Schwaber and Mike Beedle. Agile Software Development with Scrum (Series in Agile Software Development). London: Pearson, Oct. 2001, p. 42.

[6] —. Wikipedia, “Wideband Delphi.” Wikipedia, https://en.wikipedia.org/wiki/Wideband_delphi, September 2017 (accessed 2 November 2017).


> Picture credits: http://www.antiquegamblingchips.com/CelebritiesPlayingPoker.htm.

## 原文引用
- [ScrumBook.org——Pigs Estimate](http://scrumbook.org.datasenter.no/value-stream/estimation-points/pigs-estimate.html)


---
layout:     post
title:      分享几个团队敏捷转型过程中的故事
subtitle:   
date:       2021-07-17
author:     Bruce Wong
header-img: img/pexels-brett-jordan-7462586.jpg 
catalog: true
tags:
    - 敏捷
    - Agile
    - Scrum
    - Coach/Facilitate

---

作为ScrumMaster，有机会和不同的团队合作，会发现Team在从传统工作方式转变为敏捷开发方式的时候，会有一些相似的经历(一些弯路都会走一下)。这也是团队成长的必经之路。今天向分享几个我在多个转型团队中遇到的相似的故事，希望能够引起你的共鸣和思考。  

## 故事1 单件流 vs 并行工作  
下面图例是从一个团队的Scrum电子看板中两个Dev的开发状态，这个团队刚刚从传统瀑布开发方式转型，当前这个项目是第一次用Scrum方式跑Sprint。每个Sprint为期3周，这是第一周周五时候的Snapshot。  
![Single VS Multiple Tasks](/img/scrum/singlevsmultiple.jpg)  
从图中看到以下几点：
+ **1/3 Sprint即将过去，没有能开始测试的User Story。**  
+ **Dev1同时开始4个User Story(用户故事)，而Dev2只做一个。谁是更适合Scrum的方式？**   

Scrum的5个价值观中有一条就是Focus(聚焦)，大家应该在同一时间聚焦一个任务。因为多任务造成的上下文切换会导致效率的损失。从实际工作角度，像Dev1这样同时开始4个任务也不太可能，除非这4个属于一个User Story的子任务，否则在同一时间是无法真正并行的。肯定还是要串行来开发。那开发人员为什么还要一起开始这么多任务呢？宁可在1/3 Sprint时间过去都没有一个可以开始测试。如果4个用户故事属于一个更大的故事，而他们4个无法独立测试，那为什么要拆分这么多子任务？Dev2很聚焦，只作一个用户故事，同样经过很长时间，但测试无法开始进行。  
按照Scrum的思想，我们是希望能够尽早测试用户故事，从而验证逻辑的正确性，以便能够通过反馈进行调整。所以Dev1和Dev2都需要做一些调整，例如将大的用户故事进行拆分；尽早完成用户故事并进行测试形成反馈闭环。  

## 故事2 Sprint Backlog Item VS Bug  
下面这个截图是同一个项目的另一个团队，在Sprint第二周周五的早会结束后的看板状态。  
![Finishing OR Starting](/img/scrum/finishorstart.jpg)  
从图中可以看到，Testing状态的User Story已经堆积了一些，同时有一些存在明显的Bug(验收标准没有通过)。团队虽然也在修改bug，而同时也在继续将的print Backlog中的Item拽入Doing列中。和团队沟通发现大家有如下几个想法：
+ **Sprint中Bug和Sprint Backlog Item谁更重要？**  
    大家普遍认为Sprint backlog Item更重要。可以留一些Bug而不能不开始backlog的开发。因为大家默认会认为没做和做了但有Bug，前者客户不能接受。
+ **虽然有Bug，但是如果不做剩下的Sprint Backlog会导致一些更重要的Story没有做进来，无法达到Sprint Goal。**  
    这一点很有意思，因为团队在Sprint中应该先做优先级最高的backlog，如果在2周过去后发现没做的Item里面仍然有很重要的Backlog，那会是什么原因呢？  

在Sprint中，我们应该保证每一个Sprint Backlog都能够通过AC(验收标准)的测试。同时也要达到DoD(完成标准)。如果仍然有"Bug"剩余，如果已经通过了AC和DoD，那么可以考虑真的是Bug还是前面的标准过低了。Bug如果无法在当次Sprint完成，那么建议汇入Product Backlog和其他Backlog一起重新排序，决定是否在后续Sprint中fix掉。这个故事另一个分享点就是，Sprint中也需要优先做最重要的事情，避免由于突然原因无法完成Sprint所有任务的时候，对Sprint Goal的影响讲到最低。  

## 故事3 Sprint中发现的Improvement如何来做？  
这个问题是同一个项目中的BA来问的我，因为Team在Sprint中对某些用户故事提出了更好的建议，大家希望当成Improvement来做，这个时候希望能有JIRA来跟踪，但是BA不确定这类JIRA是否应该在当次Sprint内完成还是在紧接着的下一个Sprint中。我的想法是，先确定这类Improvement是什么性质的：
+ 如果是对当次Sprint Goal相关的，很大可能就是Bug。例如因为进一步了解了业务逻辑，从而发现了更好的实现方式，或者之前的设计不合理了。这种如果时间允许，最好在当前Sprint中做完。  
+ 如果和当次Sprint Goal无关，可能是由于对系统的了解和业务的熟悉，团队对以往做过的功能有了新的思考，这种最好将它和剩余的Product Backlog放到一起，从Product Goal的角度来思考优先级，看放到后续那个Sprint中。  

---
layout:     post
title:      排序算法(上)
subtitle:   讲解一些常用常考的算法
date:       2019-06-30
author:     HY
header-img: img/algorithm/suanfa.png
catalog: true
music-id:   28405261
tags:
    - 算法(algorithm)
---

# 前言
- **~~blog一时更新快了,原本是想一星期一篇的~~**
>快要考试了,所以blog也就进入了复习阶段了,此次blog主要是写给自己的,做个学习和知识的总结,当然,如果有感兴趣的朋友也可以和我一块探讨算法的有趣和奥妙.

![](https://github.com/MHYCDH/MHYCDH.github.io/blob/master/img/hardwork/wirte17.gif?raw=true)

----

## 期末复习篇:基础_排序算法(上)

>查找和排序算法算得上是算法当中的最基础的入门知识了,因其**代码相对较短,应用较常见**,所以要学算法,排序和查找算法都是必须先要掌握的.不管是现在的考试,还是在未来的面试当中,都会问到到排序算法及其相关的问题,而且一般最常考的有归并排序和快速排序,所以对这两种排序的代码要懂得信手拈来才行.即使是问到别的排序问题,不用着急,万变不离其宗,只要熟悉了思想,灵活运用是不难的.( ͡° ͜ʖ ͡°)✧

>下面就解析几种简单常用的排序算法

### 冒泡排序
- **冒泡排序是最简单的排序之一了,最大体思想就是通过与相邻元素的比较和交换来把大的或者是小的数交换到最前面(小的排前面)或者最后面(大的排后面),这个过程类似于水泡上升一样,因此得名**
>**咱们看看"冒泡"的过程**
![冒牌排序](https://github.com/MHYCDH/MHYCDH.github.io/blob/master/img/algorithm/Bubble_sort.gif?raw=true "冒泡排序")

**可以看出,每一轮排序结束后,就会把数组中剩余的最大的数排到最后面,依次冒泡就会得到一个有序序列,冒泡的书简复杂度为O(n^2).**
>C代码实现
```c
void Bubble_sort(int arr[],int len)
{
    int i,j,temp;
    for(i = 0 ; i < len - 1 ; ++i)
    {
        for(j = 0 ; j < len - 1 - i ; ++j)
        {
            if(a[j] > a[j+1])
            {
                    temp = a[j];
                    a[j] = a[j+1];
                    a[j+1] = temp;
            }
        }
    }
    retuen;
}
```
![冒泡排序](https://github.com/MHYCDH/MHYCDH.github.io/blob/master/img/algorithm/bubble_sort2.png?raw=true)

**冒泡排序总结:**

**优点**:比较简单,空间复杂度较低,属于稳定排序.  **缺点**:时间复杂度太高,效率低

***

### 选择排序
- **选择排序的思想和冒泡排序有点类似:都是在一次排序后把最大或者最小的元素排在最前面(小)或者最后面(大),但是过程不同.冒泡排序是通过相邻数字的比较和交换,而选择排序是通过对整个数组的选择.**
>咱们看看"选择"的过程
![选择排序](https://github.com/MHYCDH/MHYCDH.github.io/blob/master/img/algorithm/select_sort.gif?raw=true "选择排序")

**选择排序也可以看作是冒泡排序的优化,因为其目的是相同的,只不过选择排序只有在确定了最小(大)数的前提下进行交换,大大减少了交换的次数,选择排序的时间复杂度为O(n^2)**
>C代码实现
```c
void select_sort(int arr[],int len)
{
    int i , j , temp;
    for(i = 1 ; i <= len - 1 ; ++i)
    {
        for(j = 1 ; j <= len ; ++j)
        {
            if(a[i]>a[j])
            {
                temp=a[i];
                a[i]=a[j];
                a[j]=temp;
            }
        }
    }
    return;
}
```
![选择排序](https://github.com/MHYCDH/MHYCDH.github.io/blob/master/img/algorithm/select_sort2.png?raw=true)
**总结思路**:用for循环进行比较,定义一个交换变量temp,首先前两个数进行比较,较小的数放进temp,temp在于剩下的数组进行比较,如果出现比temp小的数,就用它代替temp原来的数据.

**效率分析**:**0到len-1的任意i都会进行一次交换和len-1-i此比较,因此共有N此交换以及(len-1)+(len-2)+...+2+1=len(len-1)/2次比较.**

***

### 插入排序
- **插入排序不是通过交换位置,而是通过比较找到合适的位置插入元素达到排序的目的.可以理解为打扑克的时候,整理手牌的时候通常会把大的牌拿出来插到后面,小的插到前面,在数组中我们要注意在插入一个数的时候要保证这个数前面的数已经有序.**
>咱们再来看看"~~插入"的过程~~
![插入排序](https://github.com/MHYCDH/MHYCDH.github.io/blob/master/img/algorithm/insert_sort.gif?raw=true "插入排序")

**直观的看出,将原序列元素取出,放回时找到合适的位置放入排序好的数(前面的数<=该数<后面的数)**

>C代码实现
```c
void insert_sort(int arr[],int len)
{
    int i , j , k;
    for(i = 1 ; i < len ; ++i)
    {
        k = arr[i];
        for(j = i - 1;j >= 0; --j)
        {
            if(arr[j]>n)
            {
                arr[j+1]=arr[j];
                arr[j]=n;
            }
        }
    }
}
```
**总结**:插入排序对几乎排好序的序列是非常高效的,但是在一般情况下(无序程度较高),插入排序是低效的,因为他每次只能将数据移动一位

## 结语:
**复习的道路还没有走完,算法的路更是才刚刚开始,第二篇我会抓紧时间把它写好之后分享给大家,非常感谢大家的观看.**

**~~我要去睡了~~**

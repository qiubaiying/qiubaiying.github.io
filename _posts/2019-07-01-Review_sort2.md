---
layout:     post
title:      排序算法(下)
subtitle:   讲解一些常用常考的算法
date:       2019-07-01
author:     MHYCDH
header-img: img/algorithm/suanfa.png
catalog: true
tags:
    - 算法(algorithm)
---
# 前言
**~~熬夜写blog~~**

![](https://github.com/MHYCDH/MHYCDH.github.io/blob/master/img/hardwork/wirte11.gif?raw=true)

>在[上一章](https://mhycdh.github.io/2019/06/30/Review_sort/)当中,我们讲到关于排序算法中的一些基础的知识,分别讲述了冒泡排序,选择排序和插入排序.这次,我继续把剩下的一些排序讲下去,我会努力去把它们讲明白讲透的(ง •̀_•́)ง

****

## 快速排序
**快速排序,这名字一听就觉得不一般,而它在实际应用中也确实是表现最好的排序算法,虽然它很高端,但其思想其实还是来自于冒泡排序.**

**回顾一下:冒泡排序是通过相邻元素的比较和交换把最小(大)的数冒到顶端,而快速排序则是比较和交换小数和大数,这样一来不仅能把小数冒到最上面,大数也沉到了底下**
>我们来看看所谓的"快排"
![快速排序](https://github.com/MHYCDH/MHYCDH.github.io/blob/master/img/algorithm/quick_sort.gif?raw=true "快速排序")

**它采用的是一种分治的策略,通过一次排序将要排序的数据分成两个独立的部分.**

**其中一部分的所有数据比另一部分的所有数据都要小,然后再用同样的方法对这两组数据进行快速排序,整个排序过程可以用递归进行.**

**快速排序是不稳定的,其平均时间复杂度为O(nlgn)**
>C代码实现

```c
void swap(int *a,int *b)
{
    int temp;
    temp = *a;
    *a = *b;
    *b = temp;    
}

void quick_sort(int arr[],int maxlen,int begin,int end)
{
    int i.j,temp;
    if(begin<end)
    {
        i = begin + 1;  //将数组中下标为begin的数作为基准数
        
                        //因此从arr[begin+1]开始与基准数进行比较
                        
        j = end;        //arr[end]为数组的最后一位
        
    }
    while(i < j)
    {
        if(arr[i]>arr[begin])   //如果比较的数组元素大于基准数
        
        {
        
            swap(&arr[i],&arr[j]);//交换两个数的位置
            
            j--;
            
        }
        else
        {
            i++;    //将数组元素向后一位,继续与基准数进行比较
            
        }
    }
    if(arr[i] >= arr[begin])    //用>=,否则当数组元素出现有相同的值的时候,会出错
    
    {
    
        i--;
        
    }
    swap(&arr[begin],&arr[i]);//交换arr[i]与arr[begin]的位置

    quick_sort(arr,maxlen,begin,i);
    quick_sort(arr,maxlen,j,end);
}
```
**快排总结**:

**结合了几种方式来排序:冒泡 +[二分](https://github.com/julycoding/The-Art-Of-Programming-By-July/blob/master/ebook/zh/04.01.md)+[递归](https://baike.baidu.com/item/%E9%80%92%E5%BD%92)分治**

****

## 归并排序
**归并排序是一种不同与其他排序算法的一种排序方法,因为归并排序使用了递归分治的思想,理解起来也比较容易.**

**其基本思想是:先递归,划分子问题,然后合并结果,空间复杂度为O(n),时间复杂度为O(nlogn)**
>咱们看看归并的过程
![归并排序](https://github.com/MHYCDH/MHYCDH.github.io/blob/master/img/algorithm/merge_sort.gif?raw=true)

**过程简述:把待排序的序列看成两个有序的子序列,然后合并两个子序列,接着再把子序列看成两个有序序列...倒着来看,其实是两两合并,然后四四合并,最终形成的有序序列**
![归并排序示例图](https://github.com/MHYCDH/MHYCDH.github.io/blob/master/img/algorithm/merge_sort2.png?raw=true)

>C代码实现(分为合并与归并)

```c

void merge(int arr[],int left,int n,int m,int right,int len/*数组大小*/)
{
    int aux[len]={0};//临时数组
    
    int i,j,k;
    
    //i和j和k分别是第一个数组索引,第二个数组索引,临时数组索引
    
    for(i = left,j = m+1 , k = 0 ; k <= right - left ; k++)//将i和j和k分别指向数组开头
    
    {
    
        if(i == m+1)//若i到达第一个数组的尾部,就将第二个数组剩下的元素都复制到临时数组中
        
        {
            aux[k]=arr[j++];
            continue;
        }
        
        if(j == right+1)//如果j到达第二个数组的尾部,将第一个数组剩下的元素都复制到临时数组中
        
        {
            aux[k]=arr[i++];
            continue;
        }
        
        if(arr[i]<arr[j])//如果第一个数组的当前元素比第二数组的当前元素小,该元素复制到临时数组中
        
        {
            aux[k]=arr[i++];
        }
        
        else//如果第二个数组的当前元素比第一个数组的当前元素小,该元素复制到临时数组中
        
        {
            aux[k]=arr[j++];
        }
        
    }

    for(i = left , j = 0 ; j <= right; i++, j++)//将有序的临时数组元素赋值到被排序的数组arr中
    
    {
        arr[i]=aux[j];
    }
    
}

void merge_sort(int arr[],int start,int end)

{
    if(start < end)
    
    {
        int i;
        i = (end + start)/2;//对前半部分进行排序
        
        merge_sort(arr,start,i);//对后半部分进行排序
        
        merge(arr,start,i,end);//合并两个已排序的部分
        
    }
    
}
```

**归并排序总结**
**通过先递(归)分解数组,在合(并)数列就完成了归并排序**
***
## 桶排序
**桶排序算是技术排序的一种改进和推广,但是经常会有人把计数排序和桶排序混为一谈,其实桶排序要比计数排序要复杂很多,我们先来说说他的基本思想**

>咱们看看桶的原理
![](https://github.com/MHYCDH/MHYCDH.github.io/blob/master/img/algorithm/Bucket_sort.gif?raw=true)
其实我们还可以用更加形象的例子

我们假设班上有5个同学,这5个同学分别考了5分,3分,5分,2分和8分.

接下来是将分数进行从大到小排序
![桶排序漫画](https://github.com/MHYCDH/MHYCDH.github.io/blob/master/img/algorithm/bucket_sort2.png?raw=true)
**方法**:我们可以制定一个大小为11的空数组(桶),编号是从a[0]到a[10].

这时我们假设a[0]为0分,a[1]为1分...a[9]为9分,a[10]为10分这样排下来.

然后让每个人前往分数所对应的区域,我们会发现出现这种情况:
![桶排序](https://github.com/MHYCDH/MHYCDH.github.io/blob/master/img/algorithm/bucket_sort3.png?raw=true)
>a[2]有1个人, a[3]有1个人, a[5]有2个人, a[8]有1个人.

这时候,我们只需要将他们一个个从小到大依次呼唤出来(打印出来)就好了.
>C代码实现

```c
void bucket_sort(int arr[],int len,int x)
{
    int i,j,k;
    for(i = 0 ; i <= len ; i++)
    {
    
        arr[i] = 0;       //初始化为0
        
    }
    for(i = 1 ; i <= x ; i++)
    
    {
        scanf("%d",&t);     //把每个数读到变量t中去
        
        arr[t++];//进行计数
        
    }
    for(i = 0 ; i <= len ; i++)     //依次判断
    
    {
        for(j = 1; j <= arr[j]; j++)      //出现几次就打印几次
        
        {
            printf("%d",i);
        }
        
    }
    
}
```

**如果你仔细观察可以发现,我们实现的是从小到大,但是我们要求的是从大到小排序,那怎么办呢?**

答案很简单:**只需要将for(i=0;i<=len;i++)改成for(i=len;i>=0;i--)就可以了**
## 桶排序总结
**最后再说说时间复杂度,桶排序的时间复杂度为O(M+N).最好的桶时间复杂度能达到O(N)所以,这是一种非常快的排序算法.**

**但是,桶排序的空间复杂度为O(N+M),如果输入的数量非常庞大,而桶的数量也会非常多,空间代价无疑是昂贵的,此外,桶排序是稳定的**

**结语：**

**这几个排序算法与[上一章](https://mhycdh.github.io/2019/06/30/Review_sort/)的这几个常见排序算法能够解决很多关于数据排序的问题了，关于更多的排序算法（如：希尔排序，计数排序，堆排序等），我会在后面找个时间继续把它们说完、写整的。**

**下面是总结所有排序算法各自适用的场景:**

![适用图](https://camo.githubusercontent.com/9602fa0fb65208b0f9e645028cdc36eccb37dc3a/687474703a2f2f7374617469632e636f646563656f2e636f6d2f696d616765732f323031362f30332f32663066356336623563376230303762303066306433333432376137306462302e706e67)

**上面的算法实现大多数是使用线性存储结构，像插入排序这种算法用链表实现更好，省去了移动元素的时间。具体的存储结构在具体的实现版本中也是不同的。**

>对于上面的知识回顾呢,我像引用一句比较深入的话.
>很多人会觉得,这些我都看过了,很多都知道了.
>但是到了真实应用场景的时候,却发现自己想不起来.
>其实更重要的,还是这些**知识之间的关联,需要你进行深入的思考才能得到的,找到知识之间的联系,找到知识和实际场景之间的联系,多想想为什么,才能做到融汇贯通**


**非常感谢大家的观看,如果有更多更好的想法可以在评论区留言哦**

---
layout:     post                    # 使用的布局（不需要改）
title:      算法练习--MoudleOne            # 标题 
subtitle:   基于算法实现漂亮的数组,二进制间距,以及两数组求最短索引的问题 #副标题
date:       2018-11-28              # 时间
author:     MasterJen                # 作者
header-img: img/mdsource/post-bg-a-23.jpg   #这篇文章标题背景图片
catalog: true                       # 是否归档
tags:                               #标签
    - 算法
---

## Hey Algorithm

>Do what you say,say what you do.--做你说过的,说你能做的.

最近无意间发现了一个比较好的网站,就是LeetCode,上面有许多的题库,支持多种语言,类似于牛客网,不过感觉问题的深度,还是比较ok的.

今天就做了几个,感觉收获还是颇丰的,接下来,就给大家分享一下我个人感觉比较有意思的题吧.

一 : 漂亮的数组的问题

    对于某些固定的 N,如果数组 A 是整数 1, 2, ..., N 组成的排列,使得:
    
    对于每个 i < j,都不存在 k 满足 i < k < j 使得 A[k] * 2 = A[i] + A[j].
    
    那么数组 A 是漂亮数组.
    
    给定 N,返回任意漂亮数组 A（保证存在一个）. 
    
实例1:

    输入:4
    输出:[2,1,4,3]
    
实例2:

    输入:5
    输出:[3,1,2,5,4]
    
那么它的思路是什么呢?  (参阅借鉴了 该博客 ![https://blog.csdn.net/qq_17550379/article/details/83572902])

         这个问题有一个非常美妙的数学解法.首先我们要证明漂亮数组满足这样几种性质
         
         减法（减去一个数仍然是漂亮数组）
         
          (A[k]−x)∗2=A[k]∗2−2∗x≠(A[i]−x+A[j]−x)
         
         乘法（乘上一个数仍然是漂亮数组）
         
          A[k]∗2∗x≠(A[i]+A[j])∗x=A[i]∗x+A[j]∗x
         
          有了上面这两个性质,我们就可以很快解决这个问题了.我们知道一个数组A可以分为奇数部分A1和偶数部分A2.此时我们如果有一个漂亮数组B,我们根据前面的性质知道2*B-1是一个漂亮数组并且是奇数数组,而2*B也是一个漂亮数组并且是偶数数组.
         
         那么我们通过2*B+2*B-1必然可以构成任意一个漂亮数组了.真的非常棒.
         
实现方法如下:

     public static int[] beautifulArray(int N) {
    //        创建一个 ArrayList数组
            ArrayList<Integer> res = new ArrayList<>();
    //        添加1 初始值
            res.add(1);
    //        如果 res的大小 小于 N
            while (res.size() < N) {
    //            创建一个数组
                ArrayList<Integer> tmp = new ArrayList<>();
    //            添加奇数
                for (int i : res) if (i * 2 - 1 <= N) tmp.add(i * 2 - 1);
    //            添加 偶数
                for (int i : res) if (i * 2 <= N) tmp.add(i * 2);
    //            把当前的 list 赋予给 res
                res = tmp;
            }
    //        把list 转换为 数组
            return res.stream().mapToInt(i -> i).toArray();
        }           
        
测试结果如下:

               int[] ints = beautifulArray(6);
               
              System.out.println(Arrays.toString(ints));
              
               [1, 5, 3, 2, 6, 4]          

二 二进制间距问题:

    给定一个正整数 N,找到并返回 N 的二进制表示中两个连续的 1 之间的最长距离.
    
    如果没有两个连续的 1,返回 0 .
    
    示例 1:
    
    输入:22
    输出:2
    解释:
    22 的二进制是 0b10110 .
    在 22 的二进制表示中,有三个 1,组成两对连续的 1 .
    第一对连续的 1 中,两个 1 之间的距离为 2 .
    第二对连续的 1 中,两个 1 之间的距离为 1 .
    答案取两个距离之中最大的,也就是 2 .
    示例 2:
    
    输入:5
    输出:2
    解释:
    5 的二进制是 0b101 .
    示例 3:
    
    输入:6
    输出:1
    解释:
    6 的二进制是 0b110 .
    示例 4:
    
    输入:8
    输出:0
    解释:
    8 的二进制是 0b1000 .
    在 8 的二进制表示中没有连续的 1,所以返回 0 .
    
根据问题,我们就得到了思路:

    定义一个表示间距的变量 dist ,一个表示存在的值的位置的变量 pre
    
    进行相与运算,判断是否有相同的二进制,然后进行判断操作
    
爱码如下:

     public static int  binaryGap(int N) {
    //            默认的 间距是  0  当前的pre代表的是 当有位置上的值相同时,进行更新
              int dist = 0, pre = -1;
    //          因为整数的最大 就是 2的31次方,遍历
              for (int i = 0; i < 32; i++) {
    //          如果  N的二进制 和 1 右移 i次方的值一样 都为 1
                  if ((N & (1 << i)) != 0) {
    //                  比较当前的 二进制间距 和此位置的i-之前的位置的间距 返回 最大的值
                      if (pre != -1) dist = Math.max(dist, i - pre);
    //                  进行更新此位置
                      pre = i;
                  }
              }
              return dist;
          }
        
测试如下:

              int i = binaryGap(5);
              System.out.println(i);
              
              2        
    
三 两个数组之间求共同值的最短索引的问题

    假设Andy和Doris想在晚餐时选择一家餐厅,并且他们都有一个表示最喜爱餐厅的列表,每个餐厅的名字用字符串表示.
    
    你需要帮助他们用最少的索引和找出他们共同喜爱的餐厅. 如果答案不止一个,则输出所有答案并且不考虑顺序. 你可以假设总是存在一个答案.
    
    输入:
    ["Shogun", "Tapioca Express", "Burger King", "KFC"]
    ["Piatti", "The Grill at Torrey Pines", "Hungry Hunter Steakhouse", "Shogun"]
    输出: ["Shogun"]
    解释: 他们唯一共同喜爱的餐厅是“Shogun”.
  
    输入:
       ["Shogun", "Tapioca Express", "Burger King", "KFC"]
       ["KFC", "Shogun", "Burger King"]
       输出: ["Shogun"]
       解释: 他们共同喜爱且具有最小索引和的餐厅是“Shogun”,它有最小的索引和1(0+1).
     
思路来了:

    先把一个 数组 进行存放到 map中 另一个 Set数组用来存放共同的 值
    
    遍历第一个数组时  然后判断 该数组里面有没有 第二个数组 对应的该下标的值,
    
    如果包含  说明 他们有共同值,然后得到 一个总的下标值 得到一个数组在map中对应的下标值加上当前的下标值
           
    判断大小,如果更小的话,那么交换最小的值,并且把当前的set清空
    
    保证 永远是 最小的索引.
    
     最后返回 该set集合对应的数组.
     
爱码如下:

      public static String[] findRestaurant(String[] list1, String[] list2) {
    //           首先 定义一个 最大的整型数值
                int min=Integer.MAX_VALUE;
    //            得到一个 Set 保证每个结果都是唯一的
                Set<String> res = new HashSet<>();
    //            得到 Map
                Map<String, Integer> list1Map = new HashMap<>();
    //            遍历第一个数组  并且把数组放到 Map中去  key 代表的是 值value代表的是 下标
                for (int i = 0; i < list1.length; i++) {
                    list1Map.put(list1[i], i);
    //                如果下标 大于了 整型的最大值,不用判断
                    if(i>min)break;//大于i,就不用判断了,后面的索引会更大
    //                放到 map中后 ,如果 Map中的值 包括 list2中的此下标的值
                    // 继续遍历 List2数组中的数据
                    for (int j = 0; j <list2.length ; j++) {
                        if(list1Map.containsKey(list2[j])){
    //                    得到 此此值对应的 下标 然后加上 当前的 i
                            int cursum=list1Map.get(list2[j])+j;
    //                    如果 值 比min小的话 ,那么就说明 可以使用 把最小的值 赋予给了 min
                            if(cursum<min){
    //               还有更小的,就更新min,把当前的结果清空
                                min=cursum;
    //                        清空res
                                res.clear();
                            }
    //                    如果当前的就是 最小的 话 那么 就要把 此下标对应的值 放到  res中去
                            if(cursum==min){
                                res.add(list2[j]);
                            }
                        }
                    }
                }
                String str[]= new String[res.size()];
                return res.toArray(str);
            }     
            
测试结果如下:

              String[] strings1 = new String[]{"Shogun", "Tapioca Express"};
              String[] strings2 = new String[]{"Tapioca Express","Shogun"};
              String[] restaurant = findRestaurant(strings1, strings2);
    
              for (String s : restaurant) {
                  System.out.println(s);
              }
              
              Tapioca Express
              Shogun
              
以上三题就是最近做题时,感觉有点难度的问题,比较烧脑,当然,收获也肯定很多,极力推荐大家多练习.              
                                             
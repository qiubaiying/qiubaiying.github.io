---
layout:     post
title:      leetcode 400 数组 篇
subtitle:   iOS定时器详解
date:       2019-09-21
author:     953max
header-img: 
catalog: 	 true
tags:
    - leetcode
    - 数组
---
#从Array中remove系列
###27 Remove Element
```java
class Solution {
    public int removeElement(int[] nums, int val) {      
        int count = 0;
        int index = 0;
        int tmp = 0;
        for(int i = 0;i<nums.length;i++){            
            if(nums[i] == val){                
                count++;
            }
            else{
                tmp = nums[index];//swap
                nums[index] = nums[i];
                nums[i] = tmp;
                index++;
            }
        }
        return nums.length - count;        
    }
}
```
给定一个数组，删除给定的元素并返回一个没有该元素的数字，但是要你返回这个数组的长度len，也就是说[0,..len]中间不能有val元素
更新两个指针，一个遇到val就加1，一个遇到非val，swap然后加1.


###26 Remove Duplicates from Sorted Array
```java
/*
 * @lc app=leetcode id=26 lang=java
 *
 * [26] Remove Duplicates from Sorted Array
 */
class Solution {
    public int removeDuplicates(int[] nums) {
        //array duplicate系列
        //two pointer
        //如果i > i-1 i,j一起出发，如果i == i-1 i前进，j不动，等待下一个赋值
        //
        int j = 0;
        for(int i = 0;i < nums.length;i++){
            if( i < 1 || nums[i] > nums[i-1]){
                nums[j] = nums[i];
                j++;
            }
            else{

                continue;

            }
        }
        return j;
    }
}
```
和27差不多，一样是要求删除元素，不过这里是重复元素，然后让我们返回删除后元素的长度，一样是更新两个指针，从i = 1开始，




80

Remove Duplicates from Sorted Array II



277

Find the Celebrity



189

Rotate Array



41

First Missing Positive



299

Bulls and Cows



134

Gas Station



118

Pascal's Triangle

很少考

119

Pascal's Triangle II

很少考

169

Majority Element

很少考

229

Majority Element II

很少考

274

H-Index



275

H-Index II

Binary Search

243

Shortest Word Distance



244

Shortest Word Distance II



245

Shortest Word Distance III



217

Contains Duplicate



219

Contains Duplicate II

很少考

220

Contains Duplicate III

很少考

55

Jump Game



45

Jump Game II



121

Best Time to Buy and Sell Stock



122

Best Time to Buy and Sell Stock II



123

Best Time to Buy and Sell Stock III



188

Best Time to Buy and Sell Stock IV



309

Best Time to Buy and Sell Stock with Cooldown



11

Container With Most Water



42

Trapping Rain Water



334

Increasing Triplet Subsequence



128

Longest Consecutive Sequence



164

Maximum Gap

Bucket

287

Find the Duplicate Number



135

Candy

很少考

330

Patching Array

很少考







提高





4

Median of Two Sorted Arrays



321

Create Maximum Number

很少考

327

Count of Range Sum

很少考

289

Game of Life









Interval





57

Insert Interval



56

Merge Intervals



252

Meeting Rooms



253

Meeting Rooms II



352

Data Stream as Disjoint Intervals

TreeMap







Counter





239

Sliding Window Maximum



295

Find Median from Data Stream



53

Maximum Subarray



325

Maximum Size Subarray Sum Equals k



209

Minimum Size Subarray Sum



238

Product of Array Except Self



152

Maximum Product Subarray



228

Summary Ranges



163

Missing Ranges









Sort





88

Merge Sorted Array



75

Sort Colors



283

Move Zeroes




6

Wiggle Subsequence



280

Wiggle Sort



324

Wiggle Sort II



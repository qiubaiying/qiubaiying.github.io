---
layout:     post
title:      Spark中的UDAF及Stage
subtitle:   spark, UDAF, stage, tasks
date:       2019-08-09
author:     ZhangWenXiang
header-img: img/bg-ai-dark1.jpeg
catalog: true
tags:
    - 机器学习
    - spark
    - 大数据
    - 分布式计算
---

# Spark中的UDAF简介及其Stage

udaf操作会分为两个stage：
- 1. partial_merge: 本地进行merge，是一种窄依赖。tasks数量取决于上一步的partitions。
- 2. merge：不同partition的数据进行merge，是一种宽依赖，需要shuffle，因此tasks数量取决于设置的值spark.default.parallelism

```scala
class MyAvg extends UserDefinedAggregateFunction {
    // Input type
    def inputSchema: org.apache.spark.sql.types.StructType = StructType(StructField("value", DoubleType) :: Nil)
    // This is the internal fields you keep for computing your aggregate. 计算缓存
    def bufferSchema: StructType = StructType( StructField("count", LongType) :: StructField("sum", DoubleType) :: Nil
    )
    // Return type
    def dataType: DataType = DoubleType
    //幂等性
    def deterministic: Boolean = true
    //初始值
    def initialize(buffer: MutableAggregationBuffer): Unit = {   buffer(0) = 0L //计数count
      buffer(1) = 0.0 //求和sum
    }
    //根据给定输入，更新缓存buffer
    def update(buffer: MutableAggregationBuffer,input: Row): Unit = { 
        buffer(0) = buffer.getAs[Long](0) + 1
        buffer(1) = buffer.getAs[Double](1) + input.getAs[Double](0)
    }
    //合并merge两个buffer：包括计算partial和合并partial
    def merge(buffer1: MutableAggregationBuffer, buffer2: Row): Unit = { buffer1(0) = buffer1.getAs[Long](0) + buffer2.getAs[Long](0) buffer1(1) = buffer1.getAs[Double](1) + buffer2.getAs[Double](1)
    }
    //最终输出值
    def evaluate(buffer: Row): Any = { buffer.getDouble(1) / buffer.getLong(0)
    } 
  }
```

使用：
```scala
val df = spark.sql("select user, num from table")
df.groupBy("user")
  .agg(MyAvg(col("num")).as("avg"))
```
---
layout:     post 
title:      Oracle编写高效sql
subtitle:   sql优化
date:       2019-09-02
author:     张鹏
header-img: img/post-bg-debug.png
catalog: true   
tags:                              
    - Oracle
---

#### 编写高效SQL

1.选择最有效率的表明顺序（只在基于规则的优化器中有效）

- Oracle的解析器按照从右到左的顺序处理FROM子句中的表名，FROM子句中写在最后的表（基础表driving table）将被最先处理，在FROM子句中包含多个表的情况下，你必须选择记录条数最少的表最为基础表。假如有三个以上的表连接查询，那就需要选择交叉表（intersection table）作为基础表，交叉表是指那个被其他表引用的表

2.WHERE子句中的连接顺序

- Oracle采用自上而下的顺序解析WHERE子句，根据这个原理，表之间的连接必须写在其他WHERE条件之前，那些可以过滤掉最大数量记录的条件必须写在WHERE子句的末尾

3.SELECT语句中避免使用`*`

- Oracle在解析过程中，会将`*`依次转换为所有的列名，这个工作是通过查询数据字典完成的，这意味着耗费更多的时间

4.用EXISTS代替IN，用NOT EXISTS代替NOT IN

- 在许多基于基础表的查询中，为了满足一个条件，往往需要对另一个表进行连接。在这种情况下，使用EXISTS（或NOT EXISTS）通常将提高查询的效率。在子查询中，NOT IN子句将执行一个内部的排序和合并，无论在哪种情况下，NOT IN都是最低效的（因为他对子查询中的表执行了一个全表遍历）。为了避免使用NOT IN，我们可以把它改写成外连接（Outer Joins）或NOT EXISTS。

```plsql
select nsrsbh,nsrmc,nsr_swjg_dm from dj_nsrxx where nsr_swjg_dm in(select swjg_dm from dm_swjg start with swjg_dm='13400000000' connect by prior swjg_dm=sj_swjg_dm)
select nsrsbh,nsrmc,nsr_swjg_dm from dj_nsrxx where exists(select 1 from dm_swjg where swjg_dm=dj_nsrxx.nsr_swjg_dm start with swjg_dm='13400000000' connect by prior swjg_dm=sj_swjg_dm)
```
5.用索引提高效率

- 索引用来提高检索数据的效率，在大型表中使用索引十分有效。索引需要空间来存储，也需要定期维护，每当有记录在表中增减或索引列被修改时，索引本身也会被修改，这意味着每条记录的INSERAT，DELETE，UPDATE将为此多付出４，５次的磁盘I/O。因为索引需要额外的存储空间和处理，那些不必要的索引反而会使查询反应时间变慢
- 定期重构索引能够提高使用索引的效率

```plsql
ALTER INDEX<INDEXNAME> REBUILD <TABLESPACENAME>
```
6.用EXISTS代替DISTINCT

- 当查询一个包含一对多表信息的连接查询时，避免在SELECT子句中使用DISTINCT，可以考虑使用EXISTS替换

```plsql
select distinct nsrsbh,nsrmc from dj_nsrxx,sb_sbxx where dj_nsrxx.nsrdzdah=sb_sbxx.nsrdzdah
select nsrsbh,nsrmc from dj_nsrxx where exists(select 1 from sb_sbxx where nsrdzdah=dj_nsrxx.nsrdzdah)
```
7.避免在索引列上使用NOT

- 当在索引列上使用NOT时，Oracle会自动进行全表扫描，不再使用索引

8.避免在索引列上使用函数

- WHERE子句中，假如索引列是函数的一部分。优化器将不使用索引而使用全表扫描

9.用>=替代>

```plsql
select nsrsbh,nsrmc from dj_nsrxx where Irrq >= to_date('20131201','yyyymmdd');
select nsrsbh,nsrmc from dj_nsrxx where Irrq>to_date('20131130','yyyymmdd');
```
10.用UNION替换OR（适用于索引列）

```plsql
select nsrsbh,nsrmc from dj_nsrxx where nsr_swjg_dm='13401010000' or djzclx_dm='410';

select nsrsbh,nsrmc from dj_nsrxx where nsr_swjg_dm='13401010000' union select nsrsbh,nsrmc from dj_nsrxx where djzclx_dm='410';
```
11.用IN来替换OR

```plsql
select nsrsbh,nsrmc from dj_nsrxx where nsr_swjg_dm='111111111' or nsr_swjg_dm='22222222';
select nsrsbh,nsrmc from dj_nsrxx where nsr_swjg_dm in ('11111111','22222222');
```
12.避免在索引列上使用IS NULL或IS NOT NULL

- 假如唯一性索引建立在表的A列和B列上，并且表中存在一条记录的值为（123,null），Oracle将不接受下一条具有相同A、B值（123,null）的记录插入。然而假如所有的索引列都为空，Oracle将认为整个键值为空，但是空不等于空。因此你可以插入1000条具有相同键值的记录，当然他们都是空。因为空值不存在索引，所以WHERE子句中对索引列进行控制比较将使Oracle停用该索引。

13.总是使用索引的第一个列

- 假如索引是建立在多个列上，只有在他的第一个列被where子句引用时，优化器才会选择使用该索引。即表的（A，B）列上建立了联合索引，则当where条件中有where A='a'时才能使用索引，若只有where B='b'语句的话，不能使用索引

14.在可能的情况下使用UNION ALL 代替UNION

- UNION会对两个子查询结果进行排序，并去掉重复记录；UNION ALL不进行排序和去重处理

15.避免隐式改变索引的类型

- 当比较不同数据类型的数据时，Oracle自动对列进行简单的类型转换

```plsql
select nsrsbh,nsrmc from dj_nsrxx where djzclx_dm=410;
select nsrsbh,nsrmc from dj_nsrxx where to_number(djzclx_dm)=410;
```
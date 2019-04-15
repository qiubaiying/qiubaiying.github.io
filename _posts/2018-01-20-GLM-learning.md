# 数据的风流韵事——基于R语言的广义线性模型
## 刘栋梁 2018.1.20 于南京林业大学

我们在建模的时候，关心的目标变量Y可能服从很多种分布。像线性回归，我们会假设目标变量Y服从正态分布，而Logistic回归，则假设服从伯努利分布，泊松回归假设服从泊松分布。在广义线性模型的理论框架中，假设目标变量Y则是服从指数分布族，正态分布、伯努利分布和泊松分布都属于指数分布族，因此线性回归、Logistic回归和泊松回归都可以看作是广义线性模型（GLM）的特例。本文不涉及理论推导，重点通过实践来熟悉GLM分析过程。

## 泊松回归预测案例（婚外情数据）

李小璐被爆出轨后，明星出轨队又加一分，吃瓜看戏之余不禁想到，我们能否用数据来分析此事呢？先利用已有数据建立模型。

### 数据处理

婚外情数据即著名的“Fair’s Affairs”，取自于1969年《今日心理》（Psychology Today）所做的一个非常有代表性的调查，该数据从601个参与者身上收集了9个变量：

affairs：出轨次数  
gender：性别   
age：年龄   
yearsmarried：结婚年限   
children：是否有小孩   
religiousness：宗教信仰程度   
education：教育程度（20分为满分）   
occupation：职业种类（逆向编号的戈登7种分类）   
rating：对婚姻满意度（5分为满分）   

**1.导入数据**

```R
install.packages("AER")  #加载AER宏包，可能有依赖问题，注意解决。
data(Affairs,package="AER") #从AER包中加载数据。
View(Affairs) #查看数据
```
**2.利用summary（）来查看数据一些描述性统计量  **
```R
summary(Affairs) #进行描述统计
```
我们可以知道：

样本中男性286人，女性315人
被调查者中年龄最小17岁，最大为57岁，平均年龄为32岁
被调查婚姻中有小孩的有430人，没有小孩的有171人
宗教信仰程度平均值为3.116，对婚姻满意度平均值为3.932（两个均为5分值）

查看出轨次数

```R
table(Affairs$affairs) #输出Affairs工作表的affairs行
```
也可以这样子写。
```R
A <- table(Affairs$affairs) #将输出的内容保存到A中，注意这时是不输出的。
#（这与MATLAB不同，不需要分号终止输出。）
A #重新调用A，这时候会输出上一步储存在A中的内容（可以是表格，也可以是图片）。
```
注意这两种方法之间的区别。
利用table查看出轨次数可以看出601个参与者中有451人从来没有出轨，38个人出轨12次。

**3.检查缺失值和异常值**

查看缺失值

```R
sum(is.na(Affairs)) #is：是否，na:缺失值（NA） Affairs表里是否有缺失值并汇总。
#值得一提的是，这行命令用了两个函数sum()和is.na(),这就是函数嵌套，后续为了方便我们还要用到这种形式。
```
没有缺失值。

查看异常值
```R
library(ggplot2) #加载ggplot2宏包
boxplot(Affairs$age) #对Affairs表中的age行绘箱线图
```
在处理异常值上我主要从年龄、婚姻年限、宗教信仰程度三个方面进行异常值检查（其余变量在前面的summary检查中可以看出）下图是年龄的箱线图结果，可以看出有一个异常值。下一步我们需要做的，就是把这个异常值找出来。

定位并查看异常值：
```R
max(Affairs$age) #找出Affairs表中的age行的最大值
Affairs[Affairs$age==57,] #定位到年龄最大值为57岁，查看满足条件的行
```
>共有22条年龄为57岁数据，在这里对于这22条数据如何处理？删除这些年龄为57的数据可以吗，毕竟相比于601的总样本量，22条数据不算什么。
>事实证明，这些数据不能删
>为什么呢？删除了这57条数据后，在后边建模时，年龄的变量P>0.05,而书上P<0.05，也就是说，假如删除了这57条数据，后面就不能把age的变量考虑进来用作评估是否会出轨的指标。对于异常值的处理除了删除也可以忽略，这次按书上要求，选择不对这些异常值做处理。

值得一提的是。"<-"、"="、"=="这三个符号是有所不同的。
><- : 赋值
>
>= :传值；这两者只有很小的区别。
>
>== :比较运算，判断两个数是否相等。
>
>```R
>A <- c(1,2,3) #c()把值转换成向量或列表
>A = c(1,2,3)
>#赋值运用这两者没有多大区别。
>#在函数调用中，func(x=1)与func(x<-1)是有区别的，前者调用完后变量x不会被保留，而后者会在工作区里保留变量x=1。
>#如length(x=seq(1,10))计算完成后x不会被保留，而length(x<-seq(1,10))计算完后你会在工作区里发现x这个变量。
>length(x=seq(1,10)) #计算序列1到10的长度，即有几个数。
>length(x<-seq(1,10)) #这时workspace里会有变量x。
>```

**4.将数据变量全变为数值型变量**

为了方便后续的建模分析，把数据变量全转为数值型变量，其中gender列女（F）为1，男（M）为0，Children列有孩子为1，没孩子为0 。

```R
table(Affairs$affairs) #注意先转成表格
a <- sub("female",1,Affairs$gender)
b <- sub("male",0,a)
Affairs$gender <- a                         
Affairs$gender <- b
as.numeric(Affairs$gender)

table(Affairs$children)
c <- sub("yes",1,Affairs$children)
d <- sub("no",0,c)
Affairs$children <- c                         
Affairs$children <- d
as.numeric(Affairs$children)
```
##模型建立
**泊松回归分析**
```R
fit_full <- glm(affairs ~ gender+age + yearsmarried +children+ religiousness +education+ occupation + rating, data = Affairs, family = poisson) #建立模型
summary(fit_full)
fit_less <- glm(affairs ~ age + yearsmarried + religiousness + occupation + rating,data = Affairs, family = poisson)  #将不显著相关的变量除去，再进行拟合
summary(fit_less)
```
**拟合结果解读**
```R
anova(fit_reduce,fit_full,test = "Chisq") #卡方检验，P值大于0.05，说明两模型拟合程度一样好
coef(fit_less) #查看回归系数（与0比较）
confint(fit_less) #利用 confint() 函数获取系数的置信区间
```
回归系数表

| 指标            | 回归系数        |
| ------------- | ----------- |
| (Intercept)截距 | 2.53390528  |
| age           | -0.03225530 |
| yearsmarried  | 0.11569843  |
| religiousness | -0.35403714 |
| occupation    | 0.07982824  |
| rating        | -0.40944272 |

## 模型预测

各位明星到底谁更容易出轨呢？利用下面数据进行预测。

（自己根据互联网整理的数据，可能有不准确的地方，只做演示，就不要求严谨了）

| 姓名     | age   | yearsmarried   | religiousness   | occupation   | rating   |
| ---- | ---- | ------------ | ------------- | ---------- | ------ |
| 文章   | 30   | 7            | 1             | 1          | 3      |
| 马伊琍  | 38   | 7            | 1             | 1          | 4      |
| 李小璐  | 36   | 6            | 1             | 1          | 2      |
| 贾乃亮  | 33   | 6            | 1             | 1          | 4      |
| 黄磊   | 47   | 11           | 1             | 1          | 5      |

将上述数据保存为csv格式，导入R中。

> Rstudio提供了导入数据的简单方法，在 "Environment" 框中，点击"Import Dataset"下拉菜单，或者通过“File”菜单 中"Import Dataset" 下拉菜单。注意第一次使用需要安装readr宏包。

```R
test$affairs <- predict(fit_less,newdata = test,type = "response")
#利用predict进行预测
test$good_companion_rank <- rank(test$affairs) #给出好伴侣排行榜
View(test)
```

结果如下：

| 姓名   | age  | yearsmarried | religiousness | occupation | rating | affairs  | good_companion_rank |
| ---- | ---- | ------------ | ------------- | ---------- | ------ | -------- | ------------------- |
| 黄磊   | 47   | 11           | 1             | 1          | 5      | 0.969637 | 1                   |
| 马伊琍  | 38   | 7            | 1             | 1          | 4      | 1.228892 | 2                   |
| 贾乃亮  | 33   | 6            | 1             | 1          | 4      | 1.286199 | 3                   |
| 文章   | 30   | 7            | 1             | 1          | 3      | 2.395515 | 4                   |
| 李小璐  | 36   | 6            | 1             | 1          | 2      | 2.648016 | 5                   |

从结果来看，模型很好的模拟了实际情况，文章、李小璐出轨次数都大于平均值（1.456）。而且事实证明，文章、李小璐都出轨了。

## 总结

1. 泊松分布适合于描述单位时间（或空间）内随机事件发生的次数。如某一服务设施在一定时间内到达的人数，电话交换机接到呼叫的次数，汽车站台的候客人数，机器出现的故障数，自然灾害发生的次数，一块产品上的缺陷数，显微镜下单位分区内的细菌分布数等等。下一步可以试试森林火灾发生次数与各种因素的回归分析。
2. 模型结果受对婚姻满意度影响较大（不行就分实在是真理），而满意度指标较为主观，应尽可能寻找更为客观的标准。
3. 建立模型所用数据是针对西方人的数据调查，并不完全符合国人情况，比如宗教信仰在我们婚姻关系中并没有那么大的影响，应该寻找符合我国国情的婚姻情况调查数据。
4. 检验出轨最靠谱的可能是女人的直觉，或者说统计也是具有局限性的，还是要根据实际情况具体问题具体分析。

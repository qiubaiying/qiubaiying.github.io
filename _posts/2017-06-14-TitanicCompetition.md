---
layout:     post
title:      Titanic Competition
subtitle:   Machine Learning from Disater
date:       2017-06-14
author:     Jiayi
header-img: img/titanic01.jpg
catalog: true
tags:
    - R
	
---


#### This is the competition of Titanic：Machine Learning from Disater from Kaggle

Get the dataset
---------------

    train <- read.csv("train.csv")
    test <- read.csv("test.csv")
    library(dplyr)
    full <- bind_rows(train, test)

    head(full)

    ##   PassengerId Survived Pclass
    ## 1           1        0      3
    ## 2           2        1      1
    ## 3           3        1      3
    ## 4           4        1      1
    ## 5           5        0      3
    ## 6           6        0      3
    ##                                                  Name    Sex Age SibSp
    ## 1                             Braund, Mr. Owen Harris   male  22     1
    ## 2 Cumings, Mrs. John Bradley (Florence Briggs Thayer) female  38     1
    ## 3                              Heikkinen, Miss. Laina female  26     0
    ## 4        Futrelle, Mrs. Jacques Heath (Lily May Peel) female  35     1
    ## 5                            Allen, Mr. William Henry   male  35     0
    ## 6                                    Moran, Mr. James   male  NA     0
    ##   Parch           Ticket    Fare Cabin Embarked
    ## 1     0        A/5 21171  7.2500              S
    ## 2     0         PC 17599 71.2833   C85        C
    ## 3     0 STON/O2. 3101282  7.9250              S
    ## 4     0           113803 53.1000  C123        S
    ## 5     0           373450  8.0500              S
    ## 6     0           330877  8.4583              Q

    summary(full)

    ##   PassengerId      Survived          Pclass          Name          
    ##  Min.   :   1   Min.   :0.0000   Min.   :1.000   Length:1309       
    ##  1st Qu.: 328   1st Qu.:0.0000   1st Qu.:2.000   Class :character  
    ##  Median : 655   Median :0.0000   Median :3.000   Mode  :character  
    ##  Mean   : 655   Mean   :0.3838   Mean   :2.295                     
    ##  3rd Qu.: 982   3rd Qu.:1.0000   3rd Qu.:3.000                     
    ##  Max.   :1309   Max.   :1.0000   Max.   :3.000                     
    ##                 NA's   :418                                        
    ##      Sex           Age            SibSp            Parch      
    ##  female:466   Min.   : 0.17   Min.   :0.0000   Min.   :0.000  
    ##  male  :843   1st Qu.:21.00   1st Qu.:0.0000   1st Qu.:0.000  
    ##               Median :28.00   Median :0.0000   Median :0.000  
    ##               Mean   :29.88   Mean   :0.4989   Mean   :0.385  
    ##               3rd Qu.:39.00   3rd Qu.:1.0000   3rd Qu.:0.000  
    ##               Max.   :80.00   Max.   :8.0000   Max.   :9.000  
    ##               NA's   :263                                     
    ##     Ticket               Fare            Cabin          
    ##  Length:1309        Min.   :  0.000   Length:1309       
    ##  Class :character   1st Qu.:  7.896   Class :character  
    ##  Mode  :character   Median : 14.454   Mode  :character  
    ##                     Mean   : 33.295                     
    ##                     3rd Qu.: 31.275                     
    ##                     Max.   :512.329                     
    ##                     NA's   :1                           
    ##    Embarked        
    ##  Length:1309       
    ##  Class :character  
    ##  Mode  :character  
    ##                    
    ##                    
    ##                    
    ## 

    sapply(full,function(x) sum(is.na(x)))     

    ## PassengerId    Survived      Pclass        Name         Sex         Age 
    ##           0         418           0           0           0         263 
    ##       SibSp       Parch      Ticket        Fare       Cabin    Embarked 
    ##           0           0           0           1           0           0

    sapply(full,function(x) sum(x==''))

    ## PassengerId    Survived      Pclass        Name         Sex         Age 
    ##           0          NA           0           0           0          NA 
    ##       SibSp       Parch      Ticket        Fare       Cabin    Embarked 
    ##           0           0           0          NA        1014           2

    embarked.na <- full$Embarked
    which(embarked.na %in% "")

    ## [1]  62 830

    full_62 <- full[full$PassengerId==62,]
    full_62

    ##    PassengerId Survived Pclass                Name    Sex Age SibSp Parch
    ## 62          62        1      1 Icard, Miss. Amelie female  38     0     0
    ##    Ticket Fare Cabin Embarked
    ## 62 113572   80   B28

    full_830 <- full[full$PassengerId==830,]
    full_830

    ##     PassengerId Survived Pclass                                      Name
    ## 830         830        1      1 Stone, Mrs. George Nelson (Martha Evelyn)
    ##        Sex Age SibSp Parch Ticket Fare Cabin Embarked
    ## 830 female  62     0     0 113572   80   B28

    library(ggplot2)
    library(scales)
    library(ggthemes)
    embark_fare <- full %>% filter(PassengerId !=62 & PassengerId !=830)
    ggplot(embark_fare, aes(x=Embarked, y=Fare, fill=factor(Pclass)))+geom_boxplot()+geom_hline(aes(yintercept=80), colour='red', linetype='dashed',lwd=2)+scale_y_continuous(labels=dollar_format())+theme_few()+ggtitle('the embarkment by passenger class and median fare')

![](img/unnamed-chunk-3-1.png)

Add a new chunk by clicking the *Insert Chunk* button on the toolbar or
by pressing *Ctrl+Alt+I*.

When you save the notebook, an HTML file containing the code and output
will be saved alongside it (click the *Preview* button or press
*Ctrl+Shift+K* to preview the HTML file).

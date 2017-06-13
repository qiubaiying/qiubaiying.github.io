---
layout:     post
title:      Soccer Data Analysis
subtitle:   Soccer Data Analysis
date:       2017-06-12
author:     Jiayi
header-img: img/post-bg-2015.jpg
catalog: true
tags:
    - Python
---


> This blog was initially released [BY Jiayi](https://jiayiwangjw.github.io), author [@Jiayi](https://jiayiwangjw.github.io/) 

# Preface

We will be using an open dataset from the popular site <a href="https://www.kaggle.com">Kaggle</a>. This <a href="https://www.kaggle.com/hugomathien/soccer">European Soccer Database</a> has more than 25,000 matches and more than 10,000 players for European professional soccer seasons from 2008 to 2016. 
![](https://kaggle2.blob.core.windows.net/datasets-images/63/141/e5591c2bbb5997993769650c8bf5ab79/dataset-original.jpg)



## Dataset
We will be using an open dataset from the popular site <a href="https://www.kaggle.com">Kaggle</a>. This <a href="https://www.kaggle.com/hugomathien/soccer">European Soccer Database</a> has more than 25,000 matches and more than 10,000 players for European professional soccer seasons from 2008 to 2016. 

Although we won’t be getting into the details of it for our example, the dataset even has attributes on weekly game updates, team line up, and detailed match events.

The goal of this notebook is to walk you through an end to end process of analyzing a dataset and introduce you to what we will be covering in this course. Our simple analytical process will include some steps for exploring  and cleaning our dataset, some steps for predicting player performance using basic statistics, and some steps for grouping similar clusters using machine learning. 


## Getting Started
<br> To get started, we will need to:
<ol>
<li>Download the data from: <a href="https://www.kaggle.com/hugomathien/soccer">https://www.kaggle.com/hugomathien/soccer</a></li>
<li>Extract the zip file called "soccer.zip"</li>
</ol>

## Import Libraries
We will start by importing the Python libraries we will be using in this analysis. These libraries include:
**sqllite3** for interacting with a local relational database
**pandas** and **numpy** for data ingestion and manipulation
**matplotlib** for data visualization
specific methods from **sklearn** for Machine Learning and 
**customplot**, which contains custom functions we have written for this notebook



```python
import sqlite3
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.cluster import KMeans
from sklearn.preprocessing import scale
from customplot import *
```


### Ingest Data

Now, we will need to read the dataset using the commands below. 

**Note:** Make sure you run the import cell above (shift+enter) before you run the data ingest code below.

**df** is a variable pointing to a pandas data frame. 


```python
# Create your connection.
cnx = sqlite3.connect('database.sqlite')
df = pd.read_sql_query("SELECT * FROM Player_Attributes", cnx)
```

## Exploring Data

We will start our data exploration by generating simple statistics of the data. 
Let us look at what the data columns are using a pandas attribute called "columns".


```python
df.columns
```

    Index(['id', 'player_fifa_api_id', 'player_api_id', 'date', 'overall_rating',
           'potential', 'preferred_foot', 'attacking_work_rate',
           'defensive_work_rate', 'crossing', 'finishing', 'heading_accuracy',
           'short_passing', 'volleys', 'dribbling', 'curve', 'free_kick_accuracy',
           'long_passing', 'ball_control', 'acceleration', 'sprint_speed',
           'agility', 'reactions', 'balance', 'shot_power', 'jumping', 'stamina',
           'strength', 'long_shots', 'aggression', 'interceptions', 'positioning',
           'vision', 'penalties', 'marking', 'standing_tackle', 'sliding_tackle',
           'gk_diving', 'gk_handling', 'gk_kicking', 'gk_positioning',
           'gk_reflexes'],
          dtype='object')



Next will display simple statistics of our dataset. You need to run each cell to make sure you see the outputs.


```python
df.describe().transpose()
```




<div>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>count</th>
      <th>mean</th>
      <th>std</th>
      <th>min</th>
      <th>25%</th>
      <th>50%</th>
      <th>75%</th>
      <th>max</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>id</th>
      <td>183978.0</td>
      <td>91989.500000</td>
      <td>53110.018250</td>
      <td>1.0</td>
      <td>45995.25</td>
      <td>91989.5</td>
      <td>137983.75</td>
      <td>183978.0</td>
    </tr>
    <tr>
      <th>player_fifa_api_id</th>
      <td>183978.0</td>
      <td>165671.524291</td>
      <td>53851.094769</td>
      <td>2.0</td>
      <td>155798.00</td>
      <td>183488.0</td>
      <td>199848.00</td>
      <td>234141.0</td>
    </tr>
    <tr>
      <th>player_api_id</th>
      <td>183978.0</td>
      <td>135900.617324</td>
      <td>136927.840510</td>
      <td>2625.0</td>
      <td>34763.00</td>
      <td>77741.0</td>
      <td>191080.00</td>
      <td>750584.0</td>
    </tr>
    <tr>
      <th>overall_rating</th>
      <td>183142.0</td>
      <td>68.600015</td>
      <td>7.041139</td>
      <td>33.0</td>
      <td>64.00</td>
      <td>69.0</td>
      <td>73.00</td>
      <td>94.0</td>
    </tr>
    <tr>
      <th>potential</th>
      <td>183142.0</td>
      <td>73.460353</td>
      <td>6.592271</td>
      <td>39.0</td>
      <td>69.00</td>
      <td>74.0</td>
      <td>78.00</td>
      <td>97.0</td>
    </tr>
    <tr>
      <th>crossing</th>
      <td>183142.0</td>
      <td>55.086883</td>
      <td>17.242135</td>
      <td>1.0</td>
      <td>45.00</td>
      <td>59.0</td>
      <td>68.00</td>
      <td>95.0</td>
    </tr>
    <tr>
      <th>finishing</th>
      <td>183142.0</td>
      <td>49.921078</td>
      <td>19.038705</td>
      <td>1.0</td>
      <td>34.00</td>
      <td>53.0</td>
      <td>65.00</td>
      <td>97.0</td>
    </tr>
    <tr>
      <th>heading_accuracy</th>
      <td>183142.0</td>
      <td>57.266023</td>
      <td>16.488905</td>
      <td>1.0</td>
      <td>49.00</td>
      <td>60.0</td>
      <td>68.00</td>
      <td>98.0</td>
    </tr>
    <tr>
      <th>short_passing</th>
      <td>183142.0</td>
      <td>62.429672</td>
      <td>14.194068</td>
      <td>3.0</td>
      <td>57.00</td>
      <td>65.0</td>
      <td>72.00</td>
      <td>97.0</td>
    </tr>
    <tr>
      <th>volleys</th>
      <td>181265.0</td>
      <td>49.468436</td>
      <td>18.256618</td>
      <td>1.0</td>
      <td>35.00</td>
      <td>52.0</td>
      <td>64.00</td>
      <td>93.0</td>
    </tr>
    <tr>
      <th>dribbling</th>
      <td>183142.0</td>
      <td>59.175154</td>
      <td>17.744688</td>
      <td>1.0</td>
      <td>52.00</td>
      <td>64.0</td>
      <td>72.00</td>
      <td>97.0</td>
    </tr>
    <tr>
      <th>curve</th>
      <td>181265.0</td>
      <td>52.965675</td>
      <td>18.255788</td>
      <td>2.0</td>
      <td>41.00</td>
      <td>56.0</td>
      <td>67.00</td>
      <td>94.0</td>
    </tr>
    <tr>
      <th>free_kick_accuracy</th>
      <td>183142.0</td>
      <td>49.380950</td>
      <td>17.831746</td>
      <td>1.0</td>
      <td>36.00</td>
      <td>50.0</td>
      <td>63.00</td>
      <td>97.0</td>
    </tr>
    <tr>
      <th>long_passing</th>
      <td>183142.0</td>
      <td>57.069880</td>
      <td>14.394464</td>
      <td>3.0</td>
      <td>49.00</td>
      <td>59.0</td>
      <td>67.00</td>
      <td>97.0</td>
    </tr>
    <tr>
      <th>ball_control</th>
      <td>183142.0</td>
      <td>63.388879</td>
      <td>15.196671</td>
      <td>5.0</td>
      <td>58.00</td>
      <td>67.0</td>
      <td>73.00</td>
      <td>97.0</td>
    </tr>
    <tr>
      <th>acceleration</th>
      <td>183142.0</td>
      <td>67.659357</td>
      <td>12.983326</td>
      <td>10.0</td>
      <td>61.00</td>
      <td>69.0</td>
      <td>77.00</td>
      <td>97.0</td>
    </tr>
    <tr>
      <th>sprint_speed</th>
      <td>183142.0</td>
      <td>68.051244</td>
      <td>12.569721</td>
      <td>12.0</td>
      <td>62.00</td>
      <td>69.0</td>
      <td>77.00</td>
      <td>97.0</td>
    </tr>
    <tr>
      <th>agility</th>
      <td>181265.0</td>
      <td>65.970910</td>
      <td>12.954585</td>
      <td>11.0</td>
      <td>58.00</td>
      <td>68.0</td>
      <td>75.00</td>
      <td>96.0</td>
    </tr>
    <tr>
      <th>reactions</th>
      <td>183142.0</td>
      <td>66.103706</td>
      <td>9.155408</td>
      <td>17.0</td>
      <td>61.00</td>
      <td>67.0</td>
      <td>72.00</td>
      <td>96.0</td>
    </tr>
    <tr>
      <th>balance</th>
      <td>181265.0</td>
      <td>65.189496</td>
      <td>13.063188</td>
      <td>12.0</td>
      <td>58.00</td>
      <td>67.0</td>
      <td>74.00</td>
      <td>96.0</td>
    </tr>
    <tr>
      <th>shot_power</th>
      <td>183142.0</td>
      <td>61.808427</td>
      <td>16.135143</td>
      <td>2.0</td>
      <td>54.00</td>
      <td>65.0</td>
      <td>73.00</td>
      <td>97.0</td>
    </tr>
    <tr>
      <th>jumping</th>
      <td>181265.0</td>
      <td>66.969045</td>
      <td>11.006734</td>
      <td>14.0</td>
      <td>60.00</td>
      <td>68.0</td>
      <td>74.00</td>
      <td>96.0</td>
    </tr>
    <tr>
      <th>stamina</th>
      <td>183142.0</td>
      <td>67.038544</td>
      <td>13.165262</td>
      <td>10.0</td>
      <td>61.00</td>
      <td>69.0</td>
      <td>76.00</td>
      <td>96.0</td>
    </tr>
    <tr>
      <th>strength</th>
      <td>183142.0</td>
      <td>67.424529</td>
      <td>12.072280</td>
      <td>10.0</td>
      <td>60.00</td>
      <td>69.0</td>
      <td>76.00</td>
      <td>96.0</td>
    </tr>
    <tr>
      <th>long_shots</th>
      <td>183142.0</td>
      <td>53.339431</td>
      <td>18.367025</td>
      <td>1.0</td>
      <td>41.00</td>
      <td>58.0</td>
      <td>67.00</td>
      <td>96.0</td>
    </tr>
    <tr>
      <th>aggression</th>
      <td>183142.0</td>
      <td>60.948046</td>
      <td>16.089521</td>
      <td>6.0</td>
      <td>51.00</td>
      <td>64.0</td>
      <td>73.00</td>
      <td>97.0</td>
    </tr>
    <tr>
      <th>interceptions</th>
      <td>183142.0</td>
      <td>52.009271</td>
      <td>19.450133</td>
      <td>1.0</td>
      <td>34.00</td>
      <td>57.0</td>
      <td>68.00</td>
      <td>96.0</td>
    </tr>
    <tr>
      <th>positioning</th>
      <td>183142.0</td>
      <td>55.786504</td>
      <td>18.448292</td>
      <td>2.0</td>
      <td>45.00</td>
      <td>60.0</td>
      <td>69.00</td>
      <td>96.0</td>
    </tr>
    <tr>
      <th>vision</th>
      <td>181265.0</td>
      <td>57.873550</td>
      <td>15.144086</td>
      <td>1.0</td>
      <td>49.00</td>
      <td>60.0</td>
      <td>69.00</td>
      <td>97.0</td>
    </tr>
    <tr>
      <th>penalties</th>
      <td>183142.0</td>
      <td>55.003986</td>
      <td>15.546519</td>
      <td>2.0</td>
      <td>45.00</td>
      <td>57.0</td>
      <td>67.00</td>
      <td>96.0</td>
    </tr>
    <tr>
      <th>marking</th>
      <td>183142.0</td>
      <td>46.772242</td>
      <td>21.227667</td>
      <td>1.0</td>
      <td>25.00</td>
      <td>50.0</td>
      <td>66.00</td>
      <td>96.0</td>
    </tr>
    <tr>
      <th>standing_tackle</th>
      <td>183142.0</td>
      <td>50.351257</td>
      <td>21.483706</td>
      <td>1.0</td>
      <td>29.00</td>
      <td>56.0</td>
      <td>69.00</td>
      <td>95.0</td>
    </tr>
    <tr>
      <th>sliding_tackle</th>
      <td>181265.0</td>
      <td>48.001462</td>
      <td>21.598778</td>
      <td>2.0</td>
      <td>25.00</td>
      <td>53.0</td>
      <td>67.00</td>
      <td>95.0</td>
    </tr>
    <tr>
      <th>gk_diving</th>
      <td>183142.0</td>
      <td>14.704393</td>
      <td>16.865467</td>
      <td>1.0</td>
      <td>7.00</td>
      <td>10.0</td>
      <td>13.00</td>
      <td>94.0</td>
    </tr>
    <tr>
      <th>gk_handling</th>
      <td>183142.0</td>
      <td>16.063612</td>
      <td>15.867382</td>
      <td>1.0</td>
      <td>8.00</td>
      <td>11.0</td>
      <td>15.00</td>
      <td>93.0</td>
    </tr>
    <tr>
      <th>gk_kicking</th>
      <td>183142.0</td>
      <td>20.998362</td>
      <td>21.452980</td>
      <td>1.0</td>
      <td>8.00</td>
      <td>12.0</td>
      <td>15.00</td>
      <td>97.0</td>
    </tr>
    <tr>
      <th>gk_positioning</th>
      <td>183142.0</td>
      <td>16.132154</td>
      <td>16.099175</td>
      <td>1.0</td>
      <td>8.00</td>
      <td>11.0</td>
      <td>15.00</td>
      <td>96.0</td>
    </tr>
    <tr>
      <th>gk_reflexes</th>
      <td>183142.0</td>
      <td>16.441439</td>
      <td>17.198155</td>
      <td>1.0</td>
      <td>8.00</td>
      <td>11.0</td>
      <td>15.00</td>
      <td>96.0</td>
    </tr>
  </tbody>
</table>
</div>



## Data Cleaning: Handling Missing Data
Real data is never clean. We need to make sure we clean the data by converting or getting rid of null or missing values.<br>
The next code cell will show you if any of the 183978 rows have null value in one of the 42 columns.


```python
#is any row NULL ?
df.isnull().any().any(), df.shape
```

    (True, (183978, 42))



Now let's try to find how many data points in each column are null.


```python
df.isnull().sum(axis=0)
```




    id                        0
    player_fifa_api_id        0
    player_api_id             0
    date                      0
    overall_rating          836
    potential               836
    preferred_foot          836
    attacking_work_rate    3230
    defensive_work_rate     836
    crossing                836
    finishing               836
    heading_accuracy        836
    short_passing           836
    volleys                2713
    dribbling               836
    curve                  2713
    free_kick_accuracy      836
    long_passing            836
    ball_control            836
    acceleration            836
    sprint_speed            836
    agility                2713
    reactions               836
    balance                2713
    shot_power              836
    jumping                2713
    stamina                 836
    strength                836
    long_shots              836
    aggression              836
    interceptions           836
    positioning             836
    vision                 2713
    penalties               836
    marking                 836
    standing_tackle         836
    sliding_tackle         2713
    gk_diving               836
    gk_handling             836
    gk_kicking              836
    gk_positioning          836
    gk_reflexes             836
    dtype: int64


## Fixing Null Values by Deleting Them

In our next two lines, we will drop the null values by going through each row.



```python
# Fix it

# Take initial # of rows
rows = df.shape[0]

# Drop the NULL rows
df = df.dropna()
```

Now if we check the null values and number of rows, we will see that there are no null values and number of rows decreased accordingly.


```python
#Check if all NULLS are gone ?
print(rows)
df.isnull().any().any(), df.shape
```

    183978
    




    (False, (180354, 42))



To find exactly how many lines we removed, we need to subtract the current number of rows in our data frame from the original number of rows.


```python
#How many rows with NULL values?

rows - df.shape[0]
```




    3624



Our data table has many lines as you have seen. We can only look at few lines at once. Instead of looking at same top 10 lines every time, we shuffle - so we get to see different random sample on top. This way, we make sure the data is not in any particular order when we try sampling from it (like taking top or bottom few rows) by randomly shuffling the rows.


```python
#Shuffle the rows of df so we get a distributed sample when we display top few rows

df = df.reindex(np.random.permutation(df.index))
```

Predicting: 'overall_rating' of a player, now that our data cleaning step is reasonably complete and we can trust and understand the data more, we will start diving into the dataset further. 

### Let's take a look at top few rows.

We will use the head function for data frames for this task. This gives us every column in every row.


```python
df.head(5)
```




<div>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>id</th>
      <th>player_fifa_api_id</th>
      <th>player_api_id</th>
      <th>date</th>
      <th>overall_rating</th>
      <th>potential</th>
      <th>preferred_foot</th>
      <th>attacking_work_rate</th>
      <th>defensive_work_rate</th>
      <th>crossing</th>
      <th>...</th>
      <th>vision</th>
      <th>penalties</th>
      <th>marking</th>
      <th>standing_tackle</th>
      <th>sliding_tackle</th>
      <th>gk_diving</th>
      <th>gk_handling</th>
      <th>gk_kicking</th>
      <th>gk_positioning</th>
      <th>gk_reflexes</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>164033</th>
      <td>164034</td>
      <td>229000</td>
      <td>361793</td>
      <td>2015-10-09 00:00:00</td>
      <td>65.0</td>
      <td>71.0</td>
      <td>left</td>
      <td>medium</td>
      <td>medium</td>
      <td>27.0</td>
      <td>...</td>
      <td>58.0</td>
      <td>63.0</td>
      <td>28.0</td>
      <td>27.0</td>
      <td>26.0</td>
      <td>14.0</td>
      <td>10.0</td>
      <td>14.0</td>
      <td>13.0</td>
      <td>12.0</td>
    </tr>
    <tr>
      <th>175609</th>
      <td>175610</td>
      <td>155264</td>
      <td>28284</td>
      <td>2014-01-10 00:00:00</td>
      <td>69.0</td>
      <td>74.0</td>
      <td>right</td>
      <td>medium</td>
      <td>medium</td>
      <td>55.0</td>
      <td>...</td>
      <td>59.0</td>
      <td>40.0</td>
      <td>69.0</td>
      <td>70.0</td>
      <td>67.0</td>
      <td>12.0</td>
      <td>15.0</td>
      <td>10.0</td>
      <td>14.0</td>
      <td>14.0</td>
    </tr>
    <tr>
      <th>76665</th>
      <td>76666</td>
      <td>167833</td>
      <td>32711</td>
      <td>2014-09-18 00:00:00</td>
      <td>63.0</td>
      <td>63.0</td>
      <td>right</td>
      <td>medium</td>
      <td>high</td>
      <td>62.0</td>
      <td>...</td>
      <td>58.0</td>
      <td>75.0</td>
      <td>64.0</td>
      <td>65.0</td>
      <td>65.0</td>
      <td>6.0</td>
      <td>5.0</td>
      <td>15.0</td>
      <td>7.0</td>
      <td>9.0</td>
    </tr>
    <tr>
      <th>6407</th>
      <td>6408</td>
      <td>194716</td>
      <td>73047</td>
      <td>2015-04-10 00:00:00</td>
      <td>64.0</td>
      <td>66.0</td>
      <td>left</td>
      <td>medium</td>
      <td>medium</td>
      <td>63.0</td>
      <td>...</td>
      <td>28.0</td>
      <td>32.0</td>
      <td>67.0</td>
      <td>64.0</td>
      <td>64.0</td>
      <td>10.0</td>
      <td>10.0</td>
      <td>12.0</td>
      <td>8.0</td>
      <td>12.0</td>
    </tr>
    <tr>
      <th>105794</th>
      <td>105795</td>
      <td>199110</td>
      <td>196484</td>
      <td>2014-02-07 00:00:00</td>
      <td>76.0</td>
      <td>84.0</td>
      <td>right</td>
      <td>high</td>
      <td>low</td>
      <td>62.0</td>
      <td>...</td>
      <td>69.0</td>
      <td>78.0</td>
      <td>25.0</td>
      <td>24.0</td>
      <td>21.0</td>
      <td>8.0</td>
      <td>10.0</td>
      <td>10.0</td>
      <td>14.0</td>
      <td>6.0</td>
    </tr>
  </tbody>
</table>
<p>5 rows × 42 columns</p>
</div>



Most of the time, we are only interested in plotting some columns. In that case, we can use the pandas column selection option as follows. Please ignore the first column in the output of the one line code below. It is the unique identifier that acts as an index for the data.<br><br>
**Note:** From this point on, we will start referring to the columns as "features" in our description.


```python
df[:10][['penalties', 'overall_rating']]
```




<div>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>penalties</th>
      <th>overall_rating</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>164033</th>
      <td>63.0</td>
      <td>65.0</td>
    </tr>
    <tr>
      <th>175609</th>
      <td>40.0</td>
      <td>69.0</td>
    </tr>
    <tr>
      <th>76665</th>
      <td>75.0</td>
      <td>63.0</td>
    </tr>
    <tr>
      <th>6407</th>
      <td>32.0</td>
      <td>64.0</td>
    </tr>
    <tr>
      <th>105794</th>
      <td>78.0</td>
      <td>76.0</td>
    </tr>
    <tr>
      <th>85271</th>
      <td>76.0</td>
      <td>78.0</td>
    </tr>
    <tr>
      <th>29207</th>
      <td>61.0</td>
      <td>74.0</td>
    </tr>
    <tr>
      <th>133409</th>
      <td>58.0</td>
      <td>78.0</td>
    </tr>
    <tr>
      <th>61074</th>
      <td>61.0</td>
      <td>70.0</td>
    </tr>
    <tr>
      <th>120585</th>
      <td>80.0</td>
      <td>76.0</td>
    </tr>
  </tbody>
</table>
</div>



## Feature Correlation Analysis 
Next, we will check if 'penalties' is correlated to 'overall_rating'. We are using a similar selection operation, bu this time for all the rows and within the correlation function. 

# Are these correlated (using Pearson's correlation coefficient) ?

```python
df['overall_rating'].corr(df['penalties'])
```

We see that Pearson's Correlation Coefficient for these two columns is 0.39. <br><br>
Pearson goes from -1 to +1. A value of 0 would have told there is no correlation, so we shouldn’t bother looking at that attribute. A value of 0.39 shows some correlation, although it could be stronger. <br><br>
At least, we have these attributes which are slightly correlated. This gives us hope that we might be able to build a meaningful predictor using these ‘weakly’ correlated features.<br><br>
Next, we will create a list of features that we would like to iterate the same operation on.

## Create a list of potential Features that you want to measure correlation with


```python
potentialFeatures = ['acceleration', 'curve', 'free_kick_accuracy', 'ball_control', 'shot_power', 'stamina']
```

The for loop below prints out the correlation coefficient of "overall_rating" of a player with each feature we added to the list as potential.


```python
# check how the features are correlated with the overall ratings

for f in potentialFeatures:
    related = df['overall_rating'].corr(df[f])
    print("%s: %f" % (f,related))

```

    acceleration: 0.243998
    curve: 0.357566
    free_kick_accuracy: 0.349800
    ball_control: 0.443991
    shot_power: 0.428053
    stamina: 0.325606
    

### Which features have the highest correlation with overall_rating?

Looking at the values printed by the previous cell, we notice that the to two are "ball_control" (0.44) and "shot_power" (0.43). So these two features seem to have higher correlation with "overall_rating".


## Data Visualization:
Next we will start plotting the correlation coefficients of each feature with "overall_rating". We start by selecting the columns and creating a list with correlation coefficients, called "correlations".


```python
cols = ['potential',  'crossing', 'finishing', 'heading_accuracy',
       'short_passing', 'volleys', 'dribbling', 'curve', 'free_kick_accuracy',
       'long_passing', 'ball_control', 'acceleration', 'sprint_speed',
       'agility', 'reactions', 'balance', 'shot_power', 'jumping', 'stamina',
       'strength', 'long_shots', 'aggression', 'interceptions', 'positioning',
       'vision', 'penalties', 'marking', 'standing_tackle', 'sliding_tackle',
       'gk_diving', 'gk_handling', 'gk_kicking', 'gk_positioning',
       'gk_reflexes']
```


```python
# create a list containing Pearson's correlation between 'overall_rating' with each column in cols
correlations = [ df['overall_rating'].corr(df[f]) for f in cols ]
```


```python
len(cols), len(correlations)
```




    (34, 34)



We make sure that the number of selected features and the correlations calculated are the same, e.g., both 34 in this case. Next couple of cells show some lines of code that use pandas plaotting functions to create a 2D graph of these correlation vealues and column names. 


```python
# create a function for plotting a dataframe with string columns and numeric values

def plot_dataframe(df, y_label):  
    color='coral'
    fig = plt.gcf()
    fig.set_size_inches(20, 12)
    plt.ylabel(y_label)

    ax = df2.correlation.plot(linewidth=3.3, color=color)
    ax.set_xticks(df2.index)
    ax.set_xticklabels(df2.attributes, rotation=75); #Notice the ; (remove it and see what happens !)
    plt.show()
```


```python
# create a dataframe using cols and correlations

df2 = pd.DataFrame({'attributes': cols, 'correlation': correlations}) 
```


```python
# let's plot above dataframe using the function we created
    
plot_dataframe(df2, 'Player\'s Overall Rating')
```


![png](SoccerDataAnalysis_files/SoccerDataAnalysis_42_0.png)


## Analysis of Findings

Now it is time for you to analyze what we plotted. Suppose you have to predict a player's overall rating. Which 5 player attributes would you ask for?
**Hint:** Which are the five features with highest correlation coefficients?

## Clustering Players into Similar Groups

Until now, we used basic statistics and correlation coefficients to start forming an opinion, but can we do better? What if we took some features and start looking at each player using those features? Can we group similar players based on these features? Let's see how we can do this. 

**Note:** Generally, someone with domain knowledge needs to define which features. We could have also selected some of the features with highest correlation with overall_rating. However, it does not guarantee best outcome always as we are not sure if the top five features are independent. For example, if 4 of the 5 features depend on the remaining 1 feature, taking all 5 does not give new information.

## Select Features on Which to Group Players


```python
# Define the features you want to use for grouping players

select5features = ['gk_kicking', 'potential', 'marking', 'interceptions', 'standing_tackle']
select5features
```




    ['gk_kicking', 'potential', 'marking', 'interceptions', 'standing_tackle']




```python
# Generate a new dataframe by selecting the features you just defined

df_select = df[select5features].copy(deep=True)
```


```python
df_select.head()
```




<div>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>gk_kicking</th>
      <th>potential</th>
      <th>marking</th>
      <th>interceptions</th>
      <th>standing_tackle</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>164033</th>
      <td>14.0</td>
      <td>71.0</td>
      <td>28.0</td>
      <td>15.0</td>
      <td>27.0</td>
    </tr>
    <tr>
      <th>175609</th>
      <td>10.0</td>
      <td>74.0</td>
      <td>69.0</td>
      <td>74.0</td>
      <td>70.0</td>
    </tr>
    <tr>
      <th>76665</th>
      <td>15.0</td>
      <td>63.0</td>
      <td>64.0</td>
      <td>62.0</td>
      <td>65.0</td>
    </tr>
    <tr>
      <th>6407</th>
      <td>12.0</td>
      <td>66.0</td>
      <td>67.0</td>
      <td>51.0</td>
      <td>64.0</td>
    </tr>
    <tr>
      <th>105794</th>
      <td>10.0</td>
      <td>84.0</td>
      <td>25.0</td>
      <td>25.0</td>
      <td>24.0</td>
    </tr>
  </tbody>
</table>
</div>



## Perform KMeans Clustering

Now we will use a machine learning method called KMeans to cluster the values (i.e., player features on gk_kicking, potential, marking, interceptions, and standing_tackle). We will ask for four clusters. We will talk about KMeans clustering and other machine learning tools in Python in Week 7 so we won't discuss these methods here.


```python
# Perform scaling on the dataframe containing the features

data = scale(df_select)

# Define number of clusters
noOfClusters = 4

# Train a model
model = KMeans(init='k-means++', n_clusters=noOfClusters, n_init=20).fit(data)
```


```python
print(90*'_')
print("\nCount of players in each cluster")
print(90*'_')

pd.value_counts(model.labels_, sort=False)
```

    __________________________________________________________________________________________
    
    Count of players in each cluster
    __________________________________________________________________________________________
    




    0    50444
    1    23788
    2    50218
    3    55904
    dtype: int64




```python
# Create a composite dataframe for plotting
# ... Use custom function declared in customplot.py (which we imported at the beginning of this notebook)

P = pd_centers(featuresUsed=select5features, centers=model.cluster_centers_)
P
```




<div>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>gk_kicking</th>
      <th>potential</th>
      <th>marking</th>
      <th>interceptions</th>
      <th>standing_tackle</th>
      <th>prediction</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>-0.042786</td>
      <td>0.705142</td>
      <td>1.028476</td>
      <td>0.983227</td>
      <td>1.030906</td>
      <td>0</td>
    </tr>
    <tr>
      <th>1</th>
      <td>1.920554</td>
      <td>0.038680</td>
      <td>-1.110334</td>
      <td>-0.651640</td>
      <td>-1.199541</td>
      <td>1</td>
    </tr>
    <tr>
      <th>2</th>
      <td>-0.335917</td>
      <td>-0.842965</td>
      <td>0.548630</td>
      <td>0.407480</td>
      <td>0.551229</td>
      <td>2</td>
    </tr>
    <tr>
      <th>3</th>
      <td>-0.477137</td>
      <td>0.105603</td>
      <td>-0.947568</td>
      <td>-0.975185</td>
      <td>-0.914116</td>
      <td>3</td>
    </tr>
  </tbody>
</table>
</div>



## Visualization of Clusters
We now have 4 clusters based on the features we selected, we can treat them as profiles for similar groups of players. We can visualize these profiles by plotting the centers for each cluster, i.e., the average values for each featuere within the cluster. We will use matplotlib for this visualization. We will learn more about matplotlib later. 


```python
# For plotting the graph inside the notebook itself, we use the following command

%matplotlib inline
```


```python
parallel_plot(P)
```


![png](SoccerDataAnalysis_files/SoccerDataAnalysis_55_0.png)


## Analysis of Findings
### Can you identify the groups for each of the below?

Two groups are very similar except in gk_kicking - these players can coach each other on gk_kicking, where they differ
Two groups are somewhat similar to each other except in potential.


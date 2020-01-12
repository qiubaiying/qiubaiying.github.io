---
layout:     post
title:      Logistic Regression
subtitle:   逻辑回归
date:       2020-01-11
author:     Young
header-img: img/1*ScEjBlA2xNW4fflEu7DJCg.png
catalog: true
tags:
    - machine learning
    - python
---

### [Linear Regression vs Logistic Regression](https://www.javatpoint.com/linear-regression-vs-logistic-regression-in-machine-learning)

<p align="center">
  <img src="https://static.javatpoint.com/tutorial/machine-learning/images/linear-regression-vs-logistic-regression.png" style="zoom:80%" />
</p>

- **Main difference between them is how they are being used**
  <br>
  The Linear Regression is used for **solving Regression problems** whereas Logistic Regression is used for **solving the Classification problems**. 

  <table class="alt">
  <tbody><tr>
  	<th>Linear Regression</th>
  	<th>Logistic Regression</th>
  </tr>
  <tr>
    <td>Linear regression is used to predict the <b>continuous dependent variable</b> using a given set of independent variables.</td>
    <td>Logistic Regression is used to predict the <b>categorical dependent variable </b> using a given set of independent variables.</td>
  </tr>
  <tr>
    <td>Linear Regression is used for <b>solving Regression problem</b>.</td>
    <td>Logistic regression is used for <b>solving Classification problems</b>.</td>
  </tr>
  <tr>
    <td>In Linear regression, we predict the value of <b>continuous variables</b>.</td>
    <td>In logistic Regression, we predict the values of <b>categorical variables</b>.</td>
  </tr>
  <tr>
    <td>In linear regression, we find <b>the best fit line</b>, by which we can easily predict the output.</td>
    <td>In Logistic Regression, we find <b>the S-curve</b> by which we can classify the samples.</td>
  </tr>
  <tr>
    <td><b>Least square estimation method</b> is used for estimation of accuracy.</td>
    <td><b>Maximum likelihood estimation method</b> is used for estimation of accuracy.</td>
  </tr>
  <tr>
    <td>The output for Linear Regression must be a <b>continuous value</b>, such as price, age, etc.</td>
  	<td>The output of Logistic Regression must be a <b>Categorical value</b> such as 0 or 1, Yes or No, etc.</td>
  </tr>
  <tr>
  	<td>In Linear regression, it is required that relationship between dependent variable and independent variable must be linear.</td>
  	<td>In Logistic regression, it is not required to have the linear relationship between the dependent and independent variable.</td>
  </tr>
  <tr>
  	<td>In linear regression, there may be collinearity between the independent variables.</td>
  	<td>In logistic regression, there should not be collinearity between the independent variable.</td>
  </tr>
  </tbody></table>

### Theory

- **Decision boundary**
  <p align="center">
    <img src="https://ml-cheatsheet.readthedocs.io/en/latest/_images/logistic_regression_sigmoid_w_threshold.png" style="zoom:80%" />
  </p>
  
  - Suppose we have a generic training set $\lbrace \left(x^{(1)}, y^{(1)}\right),\left(x^{(2)}, y^{(2)}\right), \ldots,\left(x^{(m)}, y^{(m)}\right) \rbrace$, where $𝑥(𝑚)$  is the input variable of the 𝑚-th example, while $𝑦(𝑚)$ is its output variable, ranging from 0 to 1. Finally we have the hypothesis function for logistic regression, $h_{\theta}(x)=\frac{1}{1+e^{-\theta^T x}}$.

### Interpretation

**[The cost function used in linear regression won't work here](https://www.internalpointers.com/post/cost-function-logistic-regression)**

- If we try to use the cost function of the linear regression in Logistic Regression $\sum^m_{i=1}(y^{(i)}-\frac{1}{1+e^{-\theta^T x}})^2$, then it would be of no use as it would **end up being a non-convex function with many local minimums**, in which it would be very **difficult to minimize the cost value and find the global minimum**.
  <p align="center">
    <img src="https://miro.medium.com/max/2096/1*dPXwswig8RTCAjstnUZNGQ.png" style="zoom:80%" />
  </p>

- Logistic regression cost function
  <p align="center">
  $$
  cost\left(h_{\theta}(x), y\right)=\left\{\begin{array}{ll}{-\log \left(h_{\theta}  
  (x)\right)} & {\text { if } y=1} \\ {-\log \left(1-h_{\theta}(x)\right)} & {\text { if } y=0}\end{array}\right.
  $$
  </p>
  即，$cost\left(h_{\theta}(x), y\right)=-y \log \left(h_{\theta}(x)\right)-(1-y) \log \left(1-h_{\theta}(x)\right)$
  
- With the optimization in place, the logistic regression cost function can be rewritten as:
  <p align="center">
  $$
  \begin{aligned} J(\theta) &=\frac{1}{m} \sum_{i=1}^{m} 
  cost\left(h_{\theta}\left(x^{(i)}\right), y^{(i)}\right) \\ &=-\frac{1}{m}\left[\sum_{i=1}^{m} y^{(i)} \log    
  \left(h_{\theta}\left(x^{(i)}\right)\right)+\left(1-y^{(i)}\right) \log \left(1-h_{\theta}\left(x^{(i)}\right)\right)\right]   \end{aligned}
  $$
  </p>

- **$\frac{\partial}{\partial \theta_{j}} J(\theta)=\frac{1}{m} \sum_{i=1}^{m}\left(h_{\theta}\left(x^{(i)}\right)-y^{(i)}\right) x_{j}^{(i)}$[推导过程](https://stats.stackexchange.com/questions/278771/how-is-the-cost-function-from-logistic-regression-derivated)**
<p align="center">
  <img src="https://cdn.mathpix.com/snip/images/bx-W2Eom_W9ksP6UlnL9Cwl5nmbjv56GmoO-xdg1gZ8.original.fullsize.png" style="zoom:80%" />
</p>

- **$\frac{d}{d x} \sigma(x)=\sigma(x)(1-\sigma(x))$[推导过程](https://stats.stackexchange.com/questions/278771/how-is-the-cost-function-from-logistic-regression-derivated)**
<p align="center">
  <img src="https://cdn.mathpix.com/snip/images/aBPya8ZqTGWzuwbbIlYXBRGakE3Bum2JPUtiik-dUAM.original.fullsize.png" style="zoom:80%" />
</p>


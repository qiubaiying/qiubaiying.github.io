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
    <td>In logistic Regression, we predict the values of <b>categorical variables</tb>.</td>
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

- A solution for classification is logistic regression. **Instead of fitting a straight line or hyperplane, the logistic regression model uses the logistic function to squeeze the output of a linear equation between 0 and 1**. The **logistic function** is defined as: $\operatorname{logistic}(\eta)=\frac{1}{1+\exp (-\eta)}$

- The step from linear regression to logistic regression is **kind of straightforward**. In the linear regression model, we have modelled the relationship between outcome and features with a linear equation: $\hat{y}^{(i)}=\beta_{0}+\beta_{1} x_{1}^{(i)}+\ldots+\beta_{p} x_{p}^{(i)}$
- For classification, we prefer probabilities between 0 and 1, so we **wrap the right side of the equation into the logistic function**. This forces the output to assume only values between 0 and 1.
  <p align="center">
  $$
  P\left(y^{(i)}=1\right)=\frac{1}{1+\exp \left(-\left(\beta_{0}+\beta_{1} 
  x_{1}^{(i)}+\ldots+\beta_{p} x_{p}^{(i)}\right)\right)}
  $$
  </p>
  
- **Decision boundary**
  
  <p align="center">
    <img src="https://ml-cheatsheet.readthedocs.io/en/latest/_images/logistic_regression_sigmoid_w_threshold.png" style="zoom:80%" />
  </p>

### Interpretation

- **Cost function**
  <br>
  Unfortunately we can’t (or at least shouldn’t) use the same cost function MSE (L2) as we did for linear regression. Why? There is a great math explanation in chapter 3 of Michael Neilson’s deep learning book [[5]](http://neuralnetworksanddeeplearning.com/chap3.html
) , but for now I’ll **simply say it’s because our prediction function is non-linear (due to sigmoid transform)**. Squaring this prediction as we do in MSE **results in a non-convex function with many local minimums**. If our cost function has many local minimums, gradient descent may not find the optimal global minimum.
  <p align="center">
  $$
  J(\theta)=-\frac{1}{m} \sum_{i=1}^{m}\left[y^{(i)} \log   
  \left(h_{\theta}\left(x^{(i)}\right)\right)+\left(1-y^{(i)}\right) \log \left(1-
  h_{\theta}\left(x^{(i)}\right)\right)\right]
  $$
  </p>

- **The key thing to note is the cost function penalizes confident and wrong predictions more than it rewards confident and right predictions**! The corollary is increasing prediction accuracy (closer to 0 or 1) has diminishing returns on reducing cost due to the logistic nature of our cost function.
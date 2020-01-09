---
layout:     post
title:      Linear Regression
subtitle:   线性回归
date:       2020-01-08
author:     Young
header-img: img/1*ScEjBlA2xNW4fflEu7DJCg.png
catalog: true
tags:
    - machine learning
    - python
---


## 线性回归的原理
  - 线性回归的一般形式
    <p align="center">
    $$
    f(x)=\sum _{i=0}^{d}\theta_i x_i
    $$
    </p>
    如何来确定 𝜃 的值，使得 𝑓(𝑥) 尽可能接近y的值呢？均方误差是回归中常用的性能度量，即：
    <p align="center">
    $$
    J(\theta)=\frac{1}{2}\sum _{j=1}^{n}(h_{\theta}(x^{(i)})-y^{(i)})^2
    $$
    </p>

  - Why do we use the **Mean-Squared Loss(MSE)**?

  <p align="center">
    <img src="https://github.com/Julian-young/Julian-young.github.io/raw/dev-jiale/img/WX20200108-193842.png" style="zoom:80%" />
  </p>

## 线性回归损失函数、代价函数、目标函数

  [Objective function, cost function, loss function: are they the same thing?](https://stats.stackexchange.com/questions/179026/objective-function-cost-function-loss-function-are-they-the-same-thing)
	
  <p align="center">
    <img src="https://github.com/Julian-young/Julian-young.github.io/raw/dev-jiale/img/WX20200108-200933@2x.png" style="zoom:80%" />
  </p>

## 线性回归的优化方法

  [Gradient Descent](https://ml-cheatsheet.readthedocs.io/en/latest/gradient_descent.html)

  - Consider the 3-dimensional graph below in the context of a cost function. **Our goal is to move from the mountain in the top right corner (high cost) to the dark blue sea in the bottom left (low cost)**. The arrows represent the direction of steepest descent (negative gradient) from any given point–the direction that decreases the cost function as quickly as possible.

  <p align="center">
    <img src="https://ml-cheatsheet.readthedocs.io/en/latest/_images/gradient_descent.png" style="zoom:80%" />
  </p>

  - **What is the objective of Gradient Descent?**
    <br>
    Gradient, in plain terms means slope or slant of a surface. So **gradient descent literally means descending a slope to reach the lowest point on that surface**. 

    <br>
    
    **Gradient descent is an iterative algorithm, that starts from a random point on a function and travels down its slope in steps until it reaches the lowest point of that function.**
    
  - **The Point of GD**
    <br>
    Minimizing any cost function means finding the deepest valley in that function. Keep in mind that, the cost function is used to monitor the error in predictions of an ML model. **So, the whole point of GD is to minimize the cost function**.

  <p align="center">
    <img src="https://miro.medium.com/max/1588/1*4VbVds8vD-CgAiOWTrs_Vw.png" style="zoom:80%" />
  </p>

  - **Learning rate**
    <br>
    The size of these steps is called the learning rate. **With a high learning rate we can cover more ground each step, but we risk overshooting the lowest point** since the slope of the hill is constantly changing. **With a very low learning rate, we can confidently move in the direction of the negative gradient** since we are recalculating it so frequently. **A low learning rate is more precise, but calculating the gradient is time-consuming**, so it will take us a very long time to get to the bottom.
  
  - Now let’s run gradient descent using our new cost function. There are two parameters in our cost function we can control: *m* (weight) and *b* (bias). Since we need to consider the impact each one has on the final prediction, we need to use **partial derivatives**. We calculate the partial derivatives of the cost function with respect to each parameter and store the results in a gradient.
    - Given the cost function:
      <p align="center">
      $$
      f(m,b)=\frac{1}{N}\sum (y_i-(mx_i+b))^2
      $$
      </p>
      
    - The gradient can be calculated as:
    <p align="center">
    $$
    {f}'(m,b)=\begin{bmatrix}
    \frac{df}{dm}\\ 
    \frac{df}{db}
    \end{bmatrix}=\begin{bmatrix}
    \frac{1}{N}\sum -2x_i(y_i-(mx_i+b))\\ 
    \frac{1}{N}\sum -2(y_i-(mx_i+b))
    \end{bmatrix}
    $$
    </p>
    
    ```python 
    
      def update_weights(m, b, X, Y, learning_rate):
          m_deriv = 0
          b_deriv = 0
          N = len(X)
          for i in range(N):
              m_deriv += -2*X[i] * (Y[i] - (m*X[i] + b))
              b_deriv += -2*(Y[i] - (m*X[i] + b))

          //We subtract because the derivatives point in direction of steepest ascent
          m -= (m_deriv / float(N)) * learning_rate
          b -= (b_deriv / float(N)) * learning_rate

      return m, b
    ```

- **开销分析**
  <br>
  Suppose we have 10,000 data points and 10 features. The sum of squared residuals consists of as many terms as there are data points, so 10000 terms in our case. We need to compute the derivative of this function with respect to each of the features, so in effect we will be doing **10000 * 10 = 100,000 computations per iteration**. It is common to **take 1000 iterations**, in effect we have **100,000 * 1000 = 100000000 computations** to complete the algorithm. **That is pretty much an overhead and hence gradient descent is slow on huge data**.

  <p align="center">
    <img src="https://suniljangirblog.files.wordpress.com/2018/12/descent.png" style="zoom:80%" />
  </p>
  
  [Stochastic Gradient Descent (SGD)](https://towardsdatascience.com/stochastic-gradient-descent-clearly-explained-53d239905d31)
  
  - **Where can we potentially induce randomness in our gradient descent algorithm??**
  
    <br>
  
    Yes, you might have guessed it right !! **It is while selecting data points at each step to calculate the derivatives**. SGD **randomly picks one data point from the whole data set at each iteration** to reduce the computations enormously.
  
  - **Mini-batch gradient descent**
  
    <br>
    It is also common to **sample a small number of data points instead of just one point at each step** and that is called “mini-batch” gradient descent. **Mini-batch tries to strike a balance between the goodness of gradient descent and speed of SGD**.
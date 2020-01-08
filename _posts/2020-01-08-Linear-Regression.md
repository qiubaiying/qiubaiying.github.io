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

## 线性回归的概念

- **线性回归的原理**

  - Why do we use the a **Mean-Squared Loss(MSE)**?
  
  <p align="center">
    <img src="https://github.com/Julian-young/Julian-young.github.io/raw/dev-jiale/img/WX20200108-193842.png" style="zoom:80%" />
  </p>

- **线性回归损失函数、代价函数、目标函数**
	
	[Objective function, cost function, loss function: are they the same thing?](https://stats.stackexchange.com/questions/179026/objective-function-cost-function-loss-function-are-they-the-same-thing)
	
	<p align="center">
    <img src="https://github.com/Julian-young/Julian-young.github.io/raw/dev-jiale/img/WX20200108-200933@2x.png" style="zoom:80%" />
  </p>

- **线性回归的优化方法**

  [Gradient Descent](https://ml-cheatsheet.readthedocs.io/en/latest/gradient_descent.html)
  
  - Consider the 3-dimensional graph below in the context of a cost function. **Our goal is to move from the mountain in the top right corner (high cost) to the dark blue sea in the bottom left (low cost)**. The arrows represent the direction of steepest descent (negative gradient) from any given point–the direction that decreases the cost function as quickly as possible.
  
  <p align="center">
    <img src="https://ml-cheatsheet.readthedocs.io/en/latest/_images/gradient_descent.png" style="zoom:80%" />
  </p>
  
  - The Point of GD
    <br>
    Minimizing any cost function means finding the deepest valley in that function. Keep in mind that, the cost function is used to monitor the error in predictions of an ML model. So, the whole point of GD is to **minimize the cost function**.
  
  <p align="center">
    <img src="https://miro.medium.com/max/1588/1*4VbVds8vD-CgAiOWTrs_Vw.png" style="zoom:80%" />
  </p>
  
  - Learning rate
    <br>
    The size of these steps is called the learning rate. **With a high learning rate we can cover more ground each step, but we risk overshooting the lowest point** since the slope of the hill is constantly changing. **With a very low learning rate, we can confidently move in the direction of the negative gradient** since we are recalculating it so frequently. **A low learning rate is more precise, but calculating the gradient is time-consuming**, so it will take us a very long time to get to the bottom.
  
  -  Now let’s run gradient descent using our new cost function. There are two parameters in our cost function we can control: *m* (weight) and *b* (bias). Since we need to consider the impact each one has on the final prediction, we need to use **partial derivatives**. We calculate the partial derivatives of the cost function with respect to each parameter and store the results in a gradient.
    -  Given the cost function:
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
	# Calculate partial derivatives
	    # -2x(y - (mx + b))
	    m_deriv += -2*X[i] * (Y[i] - (m*X[i] + b))

	    # -2(y - (mx + b))
	    b_deriv += -2*(Y[i] - (m*X[i] + b))

	# We subtract because the derivatives point in direction of steepest ascent
	m -= (m_deriv / float(N)) * learning_rate
	b -= (b_deriv / float(N)) * learning_rate

	return m, b
    ```


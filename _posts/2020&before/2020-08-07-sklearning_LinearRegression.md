---
layout:     post
title:      sklearn中的LinearRegression
date:       2020-08-07
author:     Yukun SHANG
catalog: 	 true
tags:
    - Machine Learning
---

## sklearn中的LinearRegression

```python
#创建并拟合模型
from sklearn.linear_model import LinearRegression
model = LinearRegression()
model.fit(X,y)
print("Predict 12 inch cost:$%.2f" % model.predict([[12]]))
 
>> Predict 12 inch cost:$13.68
```

上述代码中 sklearn.linear_model.LinearRegression 类是一个估计器（estimator）。 估计器依据观测值来预测结果。 在 scikit-learn 里面，所有的估计器都带有 fit() 和 predict() 方法。 fit() 用来分析模型参数，predict() 是通过 fit() 算出的模型参数构成的模型，对解释变量进行预测获得的值。 因为所有的估计器都有这两种方法，所有 scikit-learn 很容易实验不同的模型。 LinearRegression 类的 fit() 方法学习下面的一元线性回归模型：



## 源码解读（github上的源码暂时没找到）

* 函数原型：

  ```python
  class sklearn.linear_model.LinearRegression\(fit_intercept=True,normalize=False,copy_X=True,n_jobs=1):
  ```

  - fit_intercept:模型是否存在截距
  - normalize:模型是否对数据进行标准化（在回归之前，对X减去平均值再除以二范数），如果fit_intercept被设置为False时，该参数将忽略。
    该函数有属性：coef_可供查看模型训练后得到的估计系数，如果获取的估计系数太大，说明模型有可能过拟合。

主要思想：`sklearn.linear_model.LinearRegression`求解线性回归方程参数时，首先判断训练集X是否是稀疏矩阵，如果是，就用Golub&Kanlan双对角线化过程方法来求解；否则调用C库中LAPACK中的用基于分治法的奇异值分解来求解。在sklearn中并不是使用`梯度下降法`求解线性回归，而是使用最小二乘法求解。
sklearn.LinearRegression的fit()方法：

```python
if sp.issparse(X):#如果X是稀疏矩阵
      if y.ndim < 2:
          out = sparse_lsqr(X, y)
          self.coef_ = out[0]
          self._residues = out[3]
      else:
          # sparse_lstsq cannot handle y with shape (M, K)
          outs = Parallel(n_jobs=n_jobs_)(
              delayed(sparse_lsqr)(X, y[:, j].ravel())
              for j in range(y.shape[1]))
          self.coef_ = np.vstack(out[0] for out in outs)
          self._residues = np.vstack(out[3] for out in outs)
  else:
      self.coef_, self._residues, self.rank_, self.singular_ = \
          linalg.lstsq(X, y)
      self.coef_ = self.coef_.T
```

- 如果y的维度小于2，并没有并行操作。
- 如果训练集X是稀疏矩阵，就用`sparse_lsqr()`求解，否则使用`linalg.lstsq()`

### linalg.lstsq()方法

`scipy.linalg.lstsq()`方法就是用来计算X为非稀疏矩阵时的模型系数。这是使用普通的最小二乘OLS法来求解线性回归参数的。

- scipy.linalg.lstsq()方法源码
  scipy提供了三种方法来求解`least-squres problem`最小均方问题，即模型优化目标。其提供了三个选项`gelsd`,`gelsy`,`geless`，这些参数传入了`get_lapack_funcs()`。这三个参数实际上是C函数名，函数是从LAPACK(Linear Algebra PACKage)中获得的。
  gelsd：它是用singular value decomposition of A and a divide and conquer method方法来求解线性回归方程参数的。
  gelsy：computes the minimum-norm solution to a real/complex linear least squares problem
  gelss：Computes the minimum-norm solution to a linear least squares problem using the singular value decomposition of A.
  scipy.linalg.lstsq()方法使用gelsd求解（并没有为用户提供选项）。

### sparse_lsqr()方法源码

`sqarse_lsqr()`方法用来计算X是稀疏矩阵时的模型系数。`sparse_lsqr()`就是不同版本的`scipy.sparse.linalg.lsqr()`,参考自论文`C. C. Paige and M. A. Saunders (1982a). "LSQR: An algorithm for sparse linear equations and sparse least squares", ACM TOMS`实现。
相关源码如下：

```python
    if sp_version < (0, 15):
        # Backport fix for scikit-learn/scikit-learn#2986 / scipy/scipy#4142
        from ._scipy_sparse_lsqr_backport import lsqr as sparse_lsqr
    else:
        from scipy.sparse.linalg import lsqr as sparse_lsqr
```





## 关于$R^2$

在模型评价方面，sklearning用R 方r-squared）评估预测的效果。

R 方也叫确定系数（coefficient of determination），表示模型对现实数据拟合的程度。 计算 R 方的方法有几种。 一元线性回归中 R 方等于皮尔逊积矩相关系数（Pearson product moment correlation coefficient 或 Pearson's r）的平方。这种方法计算的 R 方一定介于 0～1 之间的正数。 其他计算方法，包括 scikit-learn 中的方法，不是用皮尔逊积矩相关系数的平方计算的，因此当模型拟合效果很差的时候 R 方会是负值。 下面用 scikitlearn 方法来计算 R 方：

* y误差平方和 = Σ(y实际值 - y预测值)^2:

$$
SS_{res} = \sum_{i = 1}^n(y_i - f(x_i))^2
$$



* y的总波动 = Σ(y实际值 - y平均值)^2

$$
SS_{tot} = \sum_{i = 1}^n(y_i - \bar y)^2
$$



* R方 = 1 - SSres/SStot:

$$
R^2 = 1 - SS_{res}/SS_{tot}
$$





## 关于每次预测结果都有略微不同的思考

跑出来的R方差别挺大的，有时候居然还是负值。

可能的原因是，输入的x太多了，所以会有众多局部最优解。所以每次跑的时候，就会有众多的结果，而且R方千差万别。

所以在反演实验中，我的做法是限制R方的范围，输出一个合理的R方




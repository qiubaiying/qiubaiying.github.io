# n*n 矩阵相乘的时间复杂度是多少



## 一般做法 ： O(N^3)

```
int A[n,n],B[n,n],C[n,n]  
    for i in 1 to n
        for j in 1 to n  
            for k in 1 to n  
                C[i,j]+=B[i,k]*A[k,j]
```



## 优化方法

随着时间的推移，学者研究出更优的方法，目前最优的时间复杂度是O(N^2.3728642)



## Reference

[我们可以推测矩阵乘法最优解的时间复杂度么？](https://blog.csdn.net/hanghangde/article/details/50085999)


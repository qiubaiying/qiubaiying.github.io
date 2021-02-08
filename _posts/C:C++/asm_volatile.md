## What is asm volatile?

`asm volatile` is Inline assembly in **Linux C**



## Basic Rules

```c
 asm [ volatile ] (  
         assembler template
         [ : output operands ]                /* optional */
         [ : input operands  ]                /* optional */
         [ : list of clobbered registers ]    /* optional */
         );
```

**asm** is `keyword`

**volatile**为可选关键字，表示不需要gcc对下面的汇编代码做任何优化







## Reference:

https://blog.csdn.net/slvher/article/details/8864996


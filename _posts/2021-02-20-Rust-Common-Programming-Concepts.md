---
layout: post
title: Rust Common Programming Concepts
subtitle: 
date: 2021-02-20
author: ChaosNyaruko
header-img: 
catalog: true
tags:
    - rust
---
介绍一些Rust的基本语法概念，这些概念在很多别的语言中找到类似的表示，有相同也有区分。

# Variable and Mutability
1. Rust中的变量默认是不可变的(immutable), Rust的安全性和易写并发的推手(nudge)之一
2. 不可变变量并不等于常量(constants)
   - 始终不可变，并且总是需要[annotate]
   - 可以在任何范围内声明，包括全局(global)
   - 只能用一个常量表达式(constant expression)赋值

   ``` Rust
   const MAX_POINTS: u32 = 100_000;
   ```

3. Shadowing
    - 和mut不同
    - 同一个名字可以成为不同的类型

# Data Types
1. Rust是静态类型语言(statically typed)
2. 当有多种可能性编译器无法直接推导(infer)出来时，要使用类型注解(type annotation)
    ``` Rust
    let guess: u32 = "42".parse().expect("Not a number!");
    ```
3. Scalar Types
    - integers
        - i/u 区分有无符号
        - 有明确大小(an explicit size)
        - 也可以使用isize/usize表示架构相关大小(64/32)
        - 对于原始数值类型(primitive numeric types)，可以使用标准库的特定想法处理overflow, wrapping_\*, checked_\*, overflowing_\*, saturating_\*
    - floating-point numbers
        - f32, f64, 默认为f64
    - Booleans
        - bool
        - true/false
    - characters
        - char
        - single quotes
        - 4bytes, represents a Unicode Scalar Value(U+0000~U+D7FF, U+E000~U+10FFFF)
4. Compound Types
    - tuples
        - fixed length
        - the types of the different value in the tuple don't have to be the same
        - optional type annotations
        - use pattern matching to destructure a tuple value
        - x.0/x.1/....is also available
    - arrays
        - also fixed length(use **vector** if the size needs to be growed or shrinked)
        - every element must have the **same** type
        - data allocated on the stack rather than the heap
        - optional type annotation: [type; size]
        - [value:size]: a more concise way to initialize an array with the same value
        - using indexing, e.g.[], to access array elements
5. Functions
    - fn
    - snake case
    - can be defined anywhere(before or after usage)
    - parameters
        - subtle difference from argument
        - must declare the type of each parameter
        - statements optionally ending in an **expression**
        - expressions do not include ending semicolons
        - return values: most functions return the last expression implicitly

6. Comments
    - start with two slashes `//`
    - documentation comments
7. Control Flow
    - arms
    - condition: must be a bool, or we'll get an error. No automatically conversion
    - `if` is an expression
    - loop, while, for
        - returning values from loops
        - `for` is the most common
        - Range(a type): e.g. (1..4), 1 included, 4 exclude

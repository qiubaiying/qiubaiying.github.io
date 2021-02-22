---
layout: post
title: Rust中的核心概念之一-Ownership
subtitle: 
date: 2021-02-22
author: ChaosNyaruko
header-img: 
catalog: true
tags:
    - rust
---

# 什么是Ownership
Ownership是Rust中的一个核心特点，可以理解成是Rust做到内存安全的重要手段。不同于带GC的语言或是C/C++这样显式管理内存的语言，ownership系统实现了在编译期管理内存(但又不需要程序员过分手动介入)从而避免了GC开销。
硬要说的话个人感觉像是C++中的RAII，但是由于带有编译器级别的检查，比C++更不容易出错。

# Ownership的规则
- Rust中所有的值(value)都有一个作为所有者(owner)的变量(variable) 
- (一个值)同时只能有一个owner(参考Rust中赋值的Move语义和在内存管理中起到的作用)
- 当owner离开作用域(scope)时，其对应的值(value)就会被释放(dropped)(无论是堆上还是栈上的)

# 解释
## Variable Scope
和其他语言类似，变量离开作用域后，就失效了
## Heap and Stack
和C/C++一样，Rust的内存管理也分为堆和栈，栈上内存由操作系统自动管理，堆上内存需要
## Move
## Clone
## Another wrinkle: Stack-Only Data
## A Special Annotation
## Return Values and Scope
## 太过仪式化(too much ceremony)和繁琐？-> reference
```Rust
fn main() {
    let s1 = gives_ownership();         // gives_ownership moves its return
                                        // value into s1

    let s2 = String::from("hello");     // s2 comes into scope

    let s3 = takes_and_gives_back(s2);  // s2 is moved into
                                        // takes_and_gives_back, which also
                                        // moves its return value into s3
} // Here, s3 goes out of scope and is dropped. s2 goes out of scope but was
  // moved, so nothing happens. s1 goes out of scope and is dropped.

fn gives_ownership() -> String {             // gives_ownership will move its
                                             // return value into the function
                                             // that calls it

    let some_string = String::from("hello"); // some_string comes into scope

    some_string                              // some_string is returned and
                                             // moves out to the calling
                                             // function
}

// takes_and_gives_back will take a String and return one
fn takes_and_gives_back(a_string: String) -> String { // a_string comes into
                                                      // scope

    a_string  // a_string is returned and moves out to the calling function
}
```

# 我的看法
ownership 有点像C++的右值和移动语义，但也有所不同，体会下这段代码
```Rust
fn main() {
    let s = String::from("hello");  // s comes into scope

    takes_ownership(s);             // s's value moves into the function...
                                        // ... and so is no longer valid here

    let x = 5;                      // x comes into scope

    makes_copy(x);                  // x would move into the function,
                                    // but i32 is Copy, so it’s okay to still
                                    // use x afterward

                                                                                                                            
} // Here, x goes out of scope, then s. But because s's value was moved, nothing
  // special happens.

fn takes_ownership(some_string: String) { // some_string comes into scope
  println!("{}", some_string);
} // Here, some_string goes out of scope and `drop` is called. The backing
// memory is freed.

fn makes_copy(some_integer: i32) { // some_integer comes into scope
    println!("{}", some_integer);
} // Here, some_integer goes out of scope. Nothing special happens.

```

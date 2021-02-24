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
和其他语言类似，变量离开作用域后，就失效了。当一个变量离开作用域时，Rust会自动调用`drop`
函数，释放内存

## Heap and Stack
和C/C++一样，Rust的内存管理也分为堆和栈，栈上内存由操作系统自动管理，堆上内存需要程序员手动管理（Rust中通过Ownership规则和编译器自动插入释放内存的语句，避免像C/C++那样的显式管理）

## Move
Rust中的简单赋值`=`大多类似于其他语言中的浅拷贝，仅拷贝栈上内容。在Rust中，这种变量和数据交互(interact)的方式称为Move。当发生Move(我理解为“实际”所有权的转移)后，原变量在离开作用域后，编译器不会插入`drop`，从而避免内存的重复释放

这里还引出Rust的另一个设计思想：Rust永远不会“自动”(automatically)去“深拷贝”数据。因此，默认赋值行为的运行时代价都可以认为是比较低的

`String`结构示例  
```Rust
let s1 = String::from("hello")
let s2 = s1
```

![Representation in memory after `s1` has been invalidated](/img/string.svg)


## Clone
那么如果我们真的需要深拷贝一块数据需要怎么做呢，在Rust中需要显式调用`clone`。这实际上也是显式提醒程序员，这里有一段特殊的代码要执行，有可能消耗会比较大

```Rust
fn main() {
    let s1 = String::from("hello");
    let s2 = s1.clone();

    println!("s1 = {}, s2 = {}", s1, s2);
}

```

## Another wrinkle: Stack-Only Data
一些简单数据类型，像整型，我们不调用`clone`，也不是Move语义，原因在于，这些简单类型在编译期就能确定大小，并且完全存储于栈上，所以拷贝比较快。  
Rust中有一种特殊的注解(annotation) `Copy`trait, 实现了这个trait类型的变量在赋值后依然可以使用。但如果实现了`Drop`trait，`Copy`就无法使用  
什么样的类型可以实现`Copy`trait呢？可以参考官方文档，通常来说，没有需要分配资源的类型可以实现。以下是一些实现了`Copy`的类型  
- 所有整型，如`u32`
- Boolean类型,`bool`
- 浮点型, 如`f64`
- 字符类型，`char`
- 元组(Tuples)，当然只能包含同样实现`Copy`的类型，如`(i32, i32)`实现了，但`(i32, String)`没有

## Functions
函数中传参和返回值也一样有ownership的转移问题，传参即赋值，返回值会将ownship move到调用它的函数

## 太过仪式化(too much ceremony)和繁琐？-> references
如果严格按照Ownership的规则编写代码，在涉及到函数调用和返回时会显得非常繁琐，感受一下:  
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

如果每个函数，即使是非常简单的都要这么写，未免有些冗杂繁琐，好在Rust提供了reference机制，后面再学

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

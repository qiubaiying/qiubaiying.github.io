---
layout: post
title: 
subtitle: 
date: 2021-03-15
author: ChaosNyaruko
header-img: 
catalog: true
tags:
    - rust
---
# Concept
A partial reference of a contiguous sequence of elements in a collection.  
- contiguous
- a data type that does not have ownership

# Usage
## String Slices
```Rust
   let s = String::from("hello world");

   let hello = &s[0..5];
   let world = &s[6..11];

```

![string slice referring to part of a String](/img/string_slice.svg)

Like others languages, we can simpify the syntax if we want to start at the first index(zero) or include the last byte of `String`  
```Rust

#![allow(unused)]
fn main() {
let s = String::from("hello");

let slice = &s[0..2];
let slice = &s[..2];

}

```
```Rust

#![allow(unused)]
fn main() {
let s = String::from("hello");

let len = s.len();

let slice = &s[3..len];
let slice = &s[3..];

}

```
```Rust

#![allow(unused)]
fn main() {
let s = String::from("hello");

let len = s.len();

let slice = &s[0..len];
let slice = &s[..];

}

```

# Attention
- String slice range indices must occur at valid UTF-8 character boundaries.
- String literals are slices
- Using string slices as parameters usually make our API more general and useful without losing any functionality.

---
layout: post
title: Reference
subtitle: 
date: 2021-03-05
author: ChaosNyaruko
header-img: 
catalog: true
tags:
    - rust
---
# Reference
Something like `&String`, the concept is similar to a Pointer  in C/C++/Golang/...  
It will not take the ownership, thus we can drop some tuple code to make it simpler.

# Borrowing
having references as function parameters

# Scope
A reference's scope starts from where it is introduced and continues through the last time that reference is used.
```Rust
	let mut s = String::from("hello");

	let r1 = &s; // no problem
	let r2 = &s; // no problem
	println!("{} and {}", r1, r2);
	// r1 and r2 are no longer used after this point

	let r3 = &mut s; // no problem
	println!("{}", r3);
```

# Recapitulation
- At any given time, you can have *either* one mutable or any number of immutable references.
- References must always be valid. (Dangling references will not be allowed in Rust by compiler)


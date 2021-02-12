---
layout:     post
title:      Our first post
subtitle:   Getting my laptop to run jekyll properly
date:       2021-02-12
author:     Brad
header-img: img/blog1-bg.jpeg
catalog: true
tags:
    - blog
    - jekyll
---

## Installation

 >having Jekyll installed on a relatively old Macbook turned out to be a very daunting task.

To start with, the system protected the original Ruby and forbid other installation such as Jekyll. Hence it required a new Ruby.  After a couple fail attempts to use homebrew to directly install ruby and jekyll, I decided to use RVM to better manage the different versions of Ruby installed. Here are the command lines that worked for me.  

	$ xcode-select --install
  $ brew install ruby
  $ gem install bundler jekyll


## blah

### 123

	$ xcode-select --print-path

### 123

	$ sudo xcode-select -switch /Applications/Xcode.app

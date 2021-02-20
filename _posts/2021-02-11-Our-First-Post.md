---
layout:     post
title:      Our first post
subtitle:   Getting my laptop to run jekyll properly and create our blog
date:       2021-02-11
author:     Brad
header-img: img/blog1-bg.jpeg
catalog: true
tags:
    - blog
    - jekyll
---

## Installation

 >having Jekyll installed on a relatively old MacBook turned out to be a very daunting task.

To start with, the OS system protected the original Ruby therefor forbid other third party installation such as Jekyll, it required a new Ruby installed to have Jekyll and bundler running properly.  After a couple fail attempts to use homebrew to directly install ruby and Jekyll, I decided to use RVM(a ruby manager) to better manage the different versions of Ruby installed. One thing to note is that the new OS system convert to zsh from bash, hence a lot of tutorials online are essentially outdated. It took me a couple hours to figure out the correct code and process to install a proper Ruby and to set a correct $PATH parameter to run Jekyll; here are the command lines that worked for me.  

	$ xcode-select --install  

Installing RVM, the keys change very often.

	$ gpg --keyserver hkp://pool.sks-keyservers.net --recv-keys

Using RVM to install Ruby

	$ rvm install 3.0.0  
	$ rvm use 3.0.0  
	$ which ruby
	$ ruby -v  
	$ echo 'export PATH="$HOME/.gem/ruby/X.X.0/bin:$PATH"' >> ~/.zshrc
	$ export GEM_HOME=$HOME/gems
	$ export PATH=$HOME/gems/bin:$PATH

Homebrew can also install ruby, but the $PATH parameter has to change manually

	$ brew install ruby  

Finally we can use Ruby Gem to install jekyll and bundle

	$ gem install bundler jekyll  
	$ jekyll -v  


## Using Jekyll to create our blog

>Creating a blog, on the other hand, also turned out to be very confusing.

Before I started off with search viable themes and templates, I had to learn the mechanism of github pages. As a github noob, all of these github terms such as "clone", "push" and "pull" are very new to me. After extensive research and learning, I manage to create the repository and set up a github page for our group.

### Choosing a theme

After browsing over 50 different themes, I finally decided to use a template called BY blog, a modified version of Hux's blog. By forking and cloning the repo, I can use jekyll to host it locally and modify it in the way we want.

	$ bundle exec jekyll serve

I also got to learn how to modify Jekyll pages to perform practical changes such as changing our icon, background image and so on; the background image of this particular blog is the photo I took when I was at Jasper, Canada.

![img](/img/blog1-bg.jpeg)

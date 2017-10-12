---
layout:     post
title:      Socket-concurrent server
subtitle:   Network assignment
date:       2017-10-10
author:     Shine
header-img: img/home-bg-art.jpg
catalog: true
tags:
    
- linux Network


---

## iterative server ##

- handles both the connection request and transaction involved in the call itself.thus once client A 
starts a transaction with the server,client B cannot make a call until A is finished.

- The prototype can be described as floowing:


>while(1)
>
>{
>
>   new_fd=the connection fo server accept the client(new_fd=accept(listenfd,**,**))

>logic processing...

>send message by this new_fd

>close new_fd

>}

## concurrent server  ##

- serve more than one client at a time.there is a easy way to realize a concurrent server by the function fork().

- it can be describe as :

>while(1)

>{

>   connfd=the connection of server which accept the client's request

>if(child process) 

> close listenfd

> logic processing

>close connfd

>close processing

>else if(parent process)

>close connfd


>}


 
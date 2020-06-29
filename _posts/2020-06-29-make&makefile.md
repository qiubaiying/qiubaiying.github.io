---
layout:     post
title:      Make your own Makefile  
subtitle:   自动编译
date:       2020-06-29
author:     Xuan
header-img: img/post-bg-3.png
catalog: true
tags:
    - Make 
---

# how to write the Makefile file

Filename **must be** Makefile/makefile


## basic complie parameters

-c: 编译，生成 .o 文件

-o: 链接，生成 可执行文件 （e.g. test）

```
# 自动寻找需要包含的 *.h 头文件
g++ -c function1.cpp 
#= ‘g++ -c function1.cpp -o fun1.o’

g++ -c main.cpp
g++ -o test main.o function1.o

#conbine in one step
g++ -o hello main.cpp function1.cpp

```

## a simple example

```
# Makefile
all:
        g++ -o hello main.cpp function1.cpp function2.cpp
clean:
        rm -rf *.o hello
```

all， clean 为target，target也可被指定为其他名字；但之后缩进后的代码会执行编译；

命令行输入 make 将默认执行第一个 target （即 all）下方的命令；如要执行清理操作，则需要输入 make clean，指定执行 clean 这个 target 下方的命令。

## an advanced version of the example （选择性编译的功能）

```
all: hello
hello: main.o function1.o function2.o
        g++ main.o function1.o function2.o -o hello
main.o: main.cpp
        g++ -c main.cpp
function1.o: function1.cpp
        g++ -c function1.cpp
function2.o: function2.cpp
        g++ -c function2.cpp

clean:
        rm -rf *.o hello

```

使用Makefile选择性编译的功能

文件基本语法 : <target>:<dependencies>。即，目标：目标依赖的文件。

## an advanced + version of the example （变量替代）

```
CC = g++
CFLAGS = -c -Wall
LFLAGS = -Wall

all: hello
hello: main.o function1.o function2.o
        $(CC) $(LFLAGS) main.o function1.o function2.o -o hello
main.o: main.cpp
        $(CC) $(CFLAGS) main.cpp
function1.o: function1.cpp
        $(CC) $(CFLAGS) function1.cpp
function2.o: function2.cpp
        $(CC) $(CFLAGS) function2.cpp

clean:
        rm -rf *.o hello

```

定义了三个变量：CC，CFLAGS，和 LFLAGS。

- CC 表示选择的编译器（也可以改成 gcc）；
- CFLAGS 表示编译选项，-c 即 g++ 中的 -c，-Wall 表示显示编译过程中遇到的所有 warning；
- LFLAGS 表示链接选项，它就不加 -c 了。

引用变量名时需要用 **$()** 将其括起来


## an concise version of the example （避免重复输入，简洁版）

```
CC = g++
CFLAGS = -c -Wall
LFLAGS = -Wall

all: hello
hello: main.o function1.o function2.o
        $(CC) $(LFLAGS) $^ -o $@
main.o: main.cpp
        $(CC) $(CFLAGS) $<
function1.o: function1.cpp
        $(CC) $(CFLAGS) $<
function2.o: function2.cpp
        $(CC) $(CFLAGS) $<

clean:
        rm -rf *.o hello

```

为了避免重复输入文件名，引入符号 $@ ，$<，$^

例如，有 [target]: [dependencies] 对：all: library.cpp main.cpp

- $@ 指代当前的 [target]
- $< 指代当前 [dependencies] 中的 第一个 dependency
- $^ 指代当前 [dependencies] 中的 所有的 dependencies

## an concise + version of the example （自动检测 cpp 文件，并且自动替换文件名后缀）

两个新的命令：patsubst 和 wildcard，去实现自动检测 cpp 文件，并且自动替换文件名后缀

- wildcard 用于获取符合特定规则的文件名
- patsubst 应该是 pattern substitution 的缩写。用它可以方便地将 .cpp 文件的后缀换成 .o。它的基本语法是：$(patsubst 原模式，目标模式，文件列表)

```
SOURCE_DIR = . # 如果是当前目录，也可以不指定
SOURCE_FILE = $(wildcard $(SOURCE_DIR)/*.cpp)
target:
        @echo $(SOURCE_FILE)

#输出当前目录下所有的 .cpp 文件: ./function1.cpp ./function2.cpp ./main.cpp
```

```
SOURCES = main.cpp function1.cpp function2.cpp
OBJS = $(patsubst %.cpp, %.o, $(SOURCES))
target:
        @echo $(OBJS)

#输出替换后的结果名： main.o function1.o function2.o
```

使用以上两个命令更新后，

```
OBJS = $(patsubst %.cpp, %.o, $(wildcard *.cpp))
CC = g++
CFLAGS = -c -Wall
LFLAGS = -Wall

all: hello
hello: $(OBJS)
        $(CC) $(LFLAGS) $^ -o $@
main.o: main.cpp
        $(CC) $(CFLAGS) $< -o $@
function1.o: function1.cpp
        $(CC) $(CFLAGS) $< -o $@
function2.o: function2.cpp
        $(CC) $(CFLAGS) $< -o $@

clean:
        rm -rf *.o hello

```

## an concise ++ version of the example （替换相同编译模式的行）

用 Static Pattern Rule，其语法为：targets: target-pattern: prereq-patterns

其中 targets 不再是一个目标文件了，而是一组目标文件。而 target-pattern 则表示目标文件的特征。例如目标文件都是 .o 结尾的，那么就将其表示为 %.o，prereq-patterns (prerequisites) 表示依赖文件的特征，例如依赖文件都是 .cpp 结尾的，那么就将其表示为 %.cpp。

通过上面的方式，可以对 targets 列表中任何一个元素，找到它对应的依赖文件，例如通过 targets 中的 main.o，可以锁定到 main.cpp。

```
OBJS = $(patsubst %.cpp, %.o, $(wildcard *.cpp))
CC = g++
CFLAGS = -c -Wall
LFLAGS = -Wall

all: hello
hello: $(OBJS)
        $(CC) $(LFLAGS) $^ -o $@
$(OBJS):%.o:%.cpp
        $(CC) $(CFLAGS) $< -o $@

clean:
        rm -rf *.o hello

```


# Reference
[Makefile 入门](https://zhuanlan.zhihu.com/p/149346441)
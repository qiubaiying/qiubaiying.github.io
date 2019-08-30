---
layout:     post 
title:      Java基础0830
subtitle:   Math、File
date:       2019-08-30
author:     张鹏
header-img: img/post-bg-debug.png
catalog: true   
tags:                         
    - Java
---

# Java基础

#### Math类

- java.lang.Math提供了一系列静态方法用于科学计算；其方法的参数和返回值类型一般为double型

#### File类

- java.io.File类代表系统文件名（路径和文件名）
- File类常见的构造方法
   - `public File(String pathname)`
   以pathname为路径创建file对象，如果pathname为绝对路径，则默认的当前路径在系统属性user.dir中存储
   - `public File(String parent,String child)`
   以parent为父路径，child为子路径创建File对象
- File的静态属性String separator存储了当前系统的路径分隔符

------

#### File类常用方法

- 通过File对象可以访问文件的属性
```java
public boolean canRead();
public boolean canWrite();
public boolean exists();
public boolean isDirectory();
public boolean isFile();
public boolean isHidden();
public long lastmodified();
public long length();
public String getName();
public String getPath();
```
- 通过File对象创建空文件或目录（在该对象所指的文件或目录不存在的情况下）
```java
public boolean createNewFile()throw IOException
public boolean delete();
public boolean mkdir();
public boolean mkdirs();//创建在路径中的一系列目录
```
- 例子：
```java
import java.io.*;
public class Test{
    public static void main(String[] args){
        String separator=File.separator;
        String filename="myfile.txt";
        String directory="mydir1"+separator+"mydir2";
        File f=new File(directory,filename);
        if(f.exists()){
            System.out.println("文件名："+f.getAbsolutePath());
            System.out.println("文件大小:"+f.length());
        }else{
            f.getParentFile().mkdirs();
            try{
                f.createNewFile();
            }catch(IOException e){
                e.printStackTrace();
            }
        }
    }
}
```

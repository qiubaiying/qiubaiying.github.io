---
layout:     post 
title:      Java基础0826
subtitle:   String
date:       2019-08-26
author:     张鹏
header-img: img/post-bg-debug.png
catalog: true   
tags:                         
    - Java
---

# Java基础

### 常用类

- 字符串相关的类（String、StringBuffer）
- 基本数据类型包装类
- Math类
- File类
- 枚举类

------

#### String类
- java.lang.String类代表了不可变的字符序列

##### String类常用方法

- `public char charAt(int index)`
返回字符串中第index个字符
- `public int length()`
返回字符串的长度
- `public int indexOf(String str)`
返回字符串中出现str的第一个位置
- `public int indexOf(String str,int fromIndex)`
返回字符串中从fromIndex开始出现str的第一个位置
- `public boolean equalsIgnoreCase(String another)`
比较字符串与another是否一样（忽略大小写）
- `public String replace(char oldChar,char newChar)`
在字符串中用newChar字符替换oldChar字符
- `public boolean startsWith(String prefix)`
判断字符串是否以prefix字符串开头
- `public boolean endsWith(String prefix)`
判断字符串是否以prefix字符串结尾
- `public String toUpperCase()`
返回一个字符串为该字符串的大写形式
- `public String toLowerCase()`
返回一个字符串为该字符串的小写形式
- `public String substring(int beginIndex)`
返回该字符串从beginIndex开始到结尾的字符串
- `public String substring(int beginIndex,int endIndex)`
返回该字符串从beginIndex开始，到endIndex结束的子字符串
- `public String trim()`
返回将该字符串去掉开头和结尾空格之后的字符串
- `public static String valueOf(......)`
将基本数据类型转换为字符串
- `public String[] split(Stirng regex)`
将一个字符串按照指定的分隔符分隔，返回分隔后的字符串数组

   - 例1：
   ```java
   public class Test{
       public static void main(String[] args){
           String s1="sun java",s2="Sun Java";
           System.out.println(s1.cahrAt(1));//u
           System.out.println(s2.length());//8
           System.out.println(s1.indexOf("java"));//4
           System.out.println(s1.indexOf("Java"));//-1
           System.out.println(s1.equals(s2));//false
           System.out.println(s1.equalsIgnoreCase(s2));//true
           
           String s="我是程序员，我在学java";
           String sr=s.replace('我','你');
           System.out.println(sr);//你是程序员，你在学java
       }
   }
   ```
  
   - 例2：
   ```java
   public class Test{
       public static void main(String[] args){
           String s="Welcome to Java World!";
           String s1="   sun java   ";
           System.out.println(s.startsWith("Welcome"));//true
           System.out.println(s.endsWith("World"));//false
           String sL=s.toLowerCase();
           String sU=s.toUpperCase();
           System.out.println(sL);//welcome to java world!
           System.out.println(sU);//WELCOME TO JAVA WORLD!
           String subs=s.substring(11);
           System.out.println(subs);//Java World!
           String sp=s1.trim();
           System.out.println(sp);//sun java
       }
   }
   ```
  
   - 例3：
   ```java
   public class Test{
       public static void main(String[] args){
           int j=1234567;
           String sNumber=String.valueOf(j);
           System.out.println("j是"+sNumber.length()+"位数。")；
           String s="Mary,F,1976";
           String[] sPlit=s.split(",");
           for(int i=0;i<sPlit.length;i++){
               System.out.println(sPlit[i]);
           }
       }
   }
   输出结果：
   j是7位数
   Mary
   F
   1976
   ```
   
   - 例4：编写一个程序，输出一个字符串中的大写英文字母数，小写英文字母数以及非英文字母数
   ```java
   public class Test{
	public static void main(String[] args){
		String s="AAAAaaaa12345646_+_+_&&*HNBGada";
		int lCount=0,uCount=0,oCount=0;
		for(int i=0;i<s.length();i++){
			char c=s.charAt(i);
			if(c>='a' && c<='z'){
				lCount++;
			}else if(c>='A' && c<='Z'){
				uCount++;
			}else{
				oCount++;
			}
		}
		
		System.out.println(lCount+" "+uCount+" "+oCount);
	}
}
   ```
   
   - 例5：编写一个方法，输出在一个字符串中，指定字符串出现的次数
   ```java
   public class Test{
	public static void main(String[] args){
		String s="sunjavasunjavasunjavasunjavasunjavasunjavasunjavasunjavasunjavasunjava";
		String sToFind="java";
		int count=0;
		int index= -1;
		while((index = s.indexOf(sToFind)) != -1){
			s=s.substring(index+sToFind.length());
			count++;
		}
		System.out.println(count);
	}
}
   ```
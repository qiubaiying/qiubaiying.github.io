---
layout: post
title: 入门dubbo
subtitle: 😝dubbo-1
date: 2019-05-08
author: 华仔
header-img: img/post-bg-debug.png
catalog: false
tags:
    - Java
    - Dubbo
---

#### 起因
​	刚好最近开始在重新写`concert`，所以就重新动手从零搭了完整的项目，到了dubbo，正好记录一下。

#### 选用版本

```xml
<properties>
	<alibaba.dubbo.version>2.6.6</alibaba.dubbo.version>
	<netty.version>4.1.34.Final</netty.version>
	<curator.version>2.6.0</curator.version>
</properties>

<dependencies>
    <!-- dubbo -->
    <dependency>
        <groupId>com.alibaba</groupId>
        <artifactId>dubbo</artifactId>
        <version>${alibaba.dubbo.version}</version>
    </dependency>
    <dependency>
        <groupId>io.netty</groupId>
        <artifactId>netty-all</artifactId>
        <version>${netty.version}</version>
    </dependency>
    <dependency>
        <groupId>org.apache.curator</groupId>
        <artifactId>curator-framework</artifactId>
        <version>${curator.version}</version>
    </dependency>
</dependencies>
```

#### 编写demo

```java
package cn.biddy.services;
import java.util.List;

/**
 * 功能描述:
 *
 * @author YanAnHuaZai
 * create: 2019-05-08 16:58
 * project name: concert
 **/
public interface DemoService {

   String sayHello(String name);

   List getNumbers();

}
```

```java
package cn.biddy.services;

import java.util.ArrayList;
import java.util.List;

/**
 * 功能描述:
 *
 * @author YanAnHuaZai
 * create: 2019-05-08 17:02
 * project name: concert
 **/
public class DemoServiceImpl implements DemoService{

   @Override
   public String sayHello(String name) {
      return "Hello " + name;
   }

   @Override
   public List getNumbers() {
      List list = new ArrayList();
      for (int i = 0; i < 10; i++) {
         list.add("" + i);
      }
      return list;
   }
}
```

```java
package cn.biddy.services;

import org.springframework.context.support.ClassPathXmlApplicationContext;

public class Provider {
   
    public static void main(String[] args) throws Exception {  
        ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext(new String[] {"applicationContext-dubbo.xml"});
        context.start();
       System.out.println("started");
        System.in.read(); // 为保证服务一直开着，利用输入流的阻塞来模拟  
    }  
   
}  
```

```java
package cn.biddy.services;

import org.springframework.context.support.ClassPathXmlApplicationContext;

import java.util.List;
  
public class Consumer {  
  
    public static void main(String[] args) throws Exception {  
        ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext(  
                new String[] {"applicationContext-dubbo.xml"});
        context.start();  
  
        DemoService demoService = (DemoService) context.getBean("demoService"); //  
        String hello = demoService.sayHello("tom"); // ִ  
        System.out.println(hello); //   
  
        //   
        List list = demoService.getNumbers();
        if (list != null && list.size() > 0) {  
            for (int i = 0; i < list.size(); i++) {  
                System.out.println(list.get(i));  
            }  
        }  
        System.in.read();
    }  
  
}  
```

![](http://blog-ipic.yananhuazai.cn/Fl3NCACUhpyRmY4jAoxq59cnjrvx"项目结构图")

#### 生产者和消费者的配置文件

**applicationContext-dubbo：）provider**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:dubbo="http://code.alibabatech.com/schema/dubbo"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd
        http://code.alibabatech.com/schema/dubbo
        http://code.alibabatech.com/schema/dubbo/dubbo.xsd"
       default-lazy-init="true">

    <!-- provider -->
    <!-- 具体的实现bean -->
    <bean id="demoService" class="cn.biddy.services.DemoServiceImpl" />

    <!-- 提供方应用信息，用于计算依赖关系 -->
    <dubbo:application name="concert_service"  />

    <!-- 使用multicast广播注册中心暴露服务地址
    <dubbo:registry address="multicast://224.5.6.7:1234" />-->

    <!-- 使用zookeeper注册中心暴露服务地址 -->
    <dubbo:registry address="zookeeper://192.168.66.202:2181" />

    <!-- 用dubbo协议在20880端口暴露服务 -->
    <dubbo:protocol name="dubbo" port="20880" />

    <!-- 声明需要暴露的服务接口 -->
    <dubbo:service interface="cn.biddy.services.DemoService" ref="demoService" />

</beans>
```

**applicationContext-dubbo：）consumer**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:dubbo="http://code.alibabatech.com/schema/dubbo"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd
        http://code.alibabatech.com/schema/dubbo
        http://code.alibabatech.com/schema/dubbo/dubbo.xsd"
       default-lazy-init="true">

    <!-- consumer -->
    <!-- 消费方应用名，用于计算依赖关系，不是匹配条件，不要与提供方一样 -->
    <dubbo:application name="concert_service_api" />

    <!-- 使用zookeeper注册中心暴露服务地址 -->
    <!-- <dubbo:registry address="multicast://224.5.6.7:1234" /> -->
    <dubbo:registry address="zookeeper://192.168.66.202:2181" />

    <!-- 生成远程服务代理，可以像使用本地bean一样使用demoService -->
    <dubbo:reference id="demoService" interface="cn.biddy.services.DemoService" />

</beans>
```

#### 先跑provider然后再跑consumer，实测没问题
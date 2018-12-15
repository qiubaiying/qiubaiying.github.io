---
layout:     post                    # 使用的布局（不需要改）
title:      如何整合springboot+dubbo?           # 标题 
subtitle:   基于springboot+dubbo+zookeeper完成小案例 #副标题
date:       2018-12-1              # 时间
author:     MasterJen                # 作者
header-img: img/mdsource/post-bg-a-24.jpg   #这篇文章标题背景图片
catalog: true                       # 是否归档
tags:                               #标签
    - 分布式
---

## Hey SpringBoot + Dubbo + Zookeeper

>There is but one secret to sucess—never give up! --成功只有一个秘诀－－永不放弃! 

前几天介绍了spring整合Dubbo和zookeeper,相信大家也已经玩的很熟练了,那么今天就带大家使用另一种方式实现分布式开发吧 ,那就是SpringBoot工具集进行整合.

首先创建一个 项目 springboot-dubbo,其 pom配置文件如下:

     <groupId>com.test</groupId>
        <artifactId>springboot-dubbo</artifactId>
        <version>1.0-SNAPSHOT</version>
        <modules>
            <module>springboot-dubbo-one</module>
        </modules>
        <packaging>pom</packaging>
    
        <parent>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-parent</artifactId>
            <version>2.0.6.RELEASE</version>
            <relativePath/> <!-- lookup parent from repository -->
        </parent>
        
其次创建 module ,springboot-dubbo-one 这也是个pom类型里面包括了 实体类,业务,controller模块

    <?xml version="1.0" encoding="UTF-8"?>
    <project xmlns="http://maven.apache.org/POM/4.0.0"
             xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
             xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
        <parent>
            <artifactId>springboot-dubbo</artifactId>
            <groupId>com.test</groupId>
            <version>1.0-SNAPSHOT</version>
        </parent>
        <modelVersion>4.0.0</modelVersion>
        <artifactId>springboot-dubbo-one</artifactId>
        <packaging>pom</packaging>
        <modules>
            <module>dubbo-service</module>
            <module>dubbo-serviceimpl</module>
            <module>dubbo-controller</module>
            <module>dubbo-common</module>
            <module>dubbo-dao</module>
        </modules>
        <build>
            <resources>
                <resource>
                    <directory>src/main/java</directory>
                    <includes>
                        <include>**/*.xml</include>
                        <include>**/*.*</include>
                    </includes>
                    <filtering>true</filtering>
                </resource>
                <resource>
                    <directory>src/main/resources</directory>
                    <includes>
                        <include>**/*.xml</include>
                        <include>**/*.*</include>
                    </includes>
                    <filtering>true</filtering>
                </resource>
            </resources>
        </build>
    </project>    
    
创建实体类模块: dubbo-common

    <?xml version="1.0" encoding="UTF-8"?>
    <project xmlns="http://maven.apache.org/POM/4.0.0"
             xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
             xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
        <parent>
            <artifactId>springboot-dubbo-one</artifactId>
            <groupId>com.test</groupId>
            <version>1.0-SNAPSHOT</version>
        </parent>
        <modelVersion>4.0.0</modelVersion>
        <artifactId>dubbo-common</artifactId>
        <dependencies>
            <dependency>
                <groupId>redis.clients</groupId>
                <artifactId>jedis</artifactId>
            </dependency>
            <dependency>
                <groupId>com.fasterxml.jackson.core</groupId>
                <artifactId>jackson-databind</artifactId>
                <version>2.9.7</version>
            </dependency>
        </dependencies>
    </project>
    
实体类创建类和对象.

    public class City implements Serializable {
        private String name;
        private Integer id;
    
        public String getName() {
            return name;
        }
    
        public void setName(String name) {
            this.name = name;
        }
    
        public Integer getId() {
            return id;
        }
    
        public void setId(Integer id) {
            this.id = id;
        }
    }

创建数据层 ,dubbo-dao 其pom文件如下:

    <?xml version="1.0" encoding="UTF-8"?>
    <project xmlns="http://maven.apache.org/POM/4.0.0"
             xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
             xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
        <parent>
            <artifactId>springboot-dubbo-one</artifactId>
            <groupId>com.test</groupId>
            <version>1.0-SNAPSHOT</version>
        </parent>
        <modelVersion>4.0.0</modelVersion>
    
        <artifactId>dubbo-dao</artifactId>
        <dependencies>
            <dependency>
                <groupId>com.test</groupId>
                <artifactId>dubbo-common</artifactId>
                <version>1.0-SNAPSHOT</version>
                <scope>compile</scope>
            </dependency>
        </dependencies>
    </project>
    
Mapper如下:

    public interface CityMapper {
        void addCity(String name);
    
        void updateCity(City city);
    
        void deleteCity(Integer id);
    
        List<City> getCityList();
    }
    
对应的mapper.xml文件
    
    <?xml version="1.0" encoding="UTF-8" ?>
    <!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd" >
    <!--这个地方必须是对应的接口的权限定名称-->
    <mapper namespace="com.test.dubbo.mapper.CityMapper">
        <!--
            id必须和接口中对应方法的名字一样
            parameterType 必须和方法的参数一致
            resultType必须和方法的返回值一致
        -->
        <!--
           id必须和接口中对应方法的名字一样
           parameterType 必须和方法的参数一致
           resultType必须和方法的返回值一致
       -->
        ......
    </mapper>
    
业务层: dubbo-service,pom文件:

    <?xml version="1.0" encoding="UTF-8"?>
    <project xmlns="http://maven.apache.org/POM/4.0.0"
             xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
             xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
        <parent>
            <artifactId>springboot-dubbo-one</artifactId>
            <groupId>com.test</groupId>
            <version>1.0-SNAPSHOT</version>
        </parent>
        <modelVersion>4.0.0</modelVersion>
    
        <artifactId>dubbo-service</artifactId>
        <dependencies>
            <dependency>
                <groupId>com.test</groupId>
                <artifactId>dubbo-common</artifactId>
                <version>1.0-SNAPSHOT</version>
                <scope>compile</scope>
            </dependency>
        </dependencies>    
    </project>
    
接口文件:

    public interface CityService {
        void addCity(String name);
    
        void updateCity(City city);
    
        void deleteCity(Integer id);
    
        List<City> getCityList();
    }

具体的业务实现模块: dubbo-serviceimpl ,其pom 文件:

    <?xml version="1.0" encoding="UTF-8"?>
    <project xmlns="http://maven.apache.org/POM/4.0.0"
             xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
             xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
        <parent>
            <artifactId>springboot-dubbo-one</artifactId>
            <groupId>com.test</groupId>
            <version>1.0-SNAPSHOT</version>
        </parent>
        <modelVersion>4.0.0</modelVersion>
    
        <artifactId>dubbo-serviceimpl</artifactId>
    
        <dependencies>
    
            <dependency>
               <groupId>com.test</groupId>
                <artifactId>dubbo-service</artifactId>
                <version>1.0-SNAPSHOT</version>
            </dependency>
    
            <!--
                启动类
            -->
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-starter-web</artifactId>
            </dependency>
            <!-- https://mvnrepository.com/artifact/com.alibaba.boot/dubbo-spring-boot-starter -->
            <dependency>
                <groupId>com.alibaba.boot</groupId>
                <artifactId>dubbo-spring-boot-starter</artifactId>
                <version>0.2.0</version>
            </dependency>
            <dependency>
                <groupId>com.test</groupId>
                <artifactId>dubbo-dao</artifactId>
                <version>1.0-SNAPSHOT</version>
                <scope>compile</scope>
            </dependency>
            <!--
                连接数据库 以及整合 mybatis 的依赖包
               -->
            <dependency>
                <groupId>org.mybatis</groupId>
                <artifactId>mybatis-spring</artifactId>
                <version>1.3.2</version>
            </dependency>
    
        <!--
            整合Mybatis 的依赖包
        -->
            <dependency>
                <groupId>org.mybatis.spring.boot</groupId>
                <artifactId>mybatis-spring-boot-starter</artifactId>
                <version>1.3.2</version>
            </dependency>
        <!--
            连接池的依赖包
        -->
            <dependency>
                <groupId>com.alibaba</groupId>
                <artifactId>druid-spring-boot-starter</artifactId>
                <version>1.1.10</version>
            </dependency>
            <dependency>
                <groupId>mysql</groupId>
                <artifactId>mysql-connector-java</artifactId>
            </dependency>
    <!--
        solr 索引的依赖包
    -->
            <dependency>
                <groupId>org.apache.solr</groupId>
                <artifactId>solr-solrj</artifactId>
                <version>5.5.5</version>
            </dependency>
        </dependencies>
    
    </project>
    
具体的 实现类如下: 首先创建启动类 ServiceStartApp

    @SpringBootApplication  // 启动的注解
    @MapperScan(value = "com.test.dubbo.mapper")// 扫描mapper的注解
    @DubboComponentScan({"com.test.dubbo.service"})// 扫描 dubbo 注解
    public class ServiceStartApp {
        public static void main(String[] args) {
            SpringApplication.run(ServiceStartApp.class,args);
        }
    }

配置 Dubbo和zookeerper的文件 ServiceConfig

    @Configuration
    public class ServiceConfig {
      //相当于<dubbo:application name="servicespringboot"/>
        @Bean
        public ApplicationConfig applicationConfig() {
            ApplicationConfig applicationConfig = new ApplicationConfig();
            applicationConfig.setName("servicespringboot");
            return applicationConfig;
        }
    
        //<dubbo:registry protocol="zookeeper" address=""/>
        @Bean
        public RegistryConfig registryConfig() {
            RegistryConfig registryConfig = new RegistryConfig();
          
            registryConfig.setAddress("zookeeper://zookeeper地址:2181");
         
            return registryConfig;
        }
    
        //  <dubbo:protocol name="dubbo" port="23456"/>
        @Bean
        public ProtocolConfig protocolConfig(){
    
            ProtocolConfig protocolConfig=new ProtocolConfig();
            protocolConfig.setName("dubbo");
            protocolConfig.setPort(20880);
            return protocolConfig;
        }    
    }
    
这样就完成了配置 ,连接到了zookeeper注册中心,具体的业务实现类如下:

    @Service
    public class CityServiceImpl implements CityService {
        @Autowired
        private CityMapper cityMapper;
        
        @Override
        public void addCity(String name) {
            cityMapper.addCity(name);
           
        }
    
        @Override
        public void updateCity(City city) {
                cityMapper.updateCity(city);
           
        }
        ....
    }
    
yml配置文件如下: 

    server:
      port: 9003#tomcat 运行端口
    spring:
      datasource:
        url: jdbc:mysql://:3306/你的数据库?useUnicode=true&amp;characterEncoding=utf-8&useSSL=false
        driver-class-name: com.mysql.jdbc.Driver
        username: root
        password: 
        type: com.alibaba.druid.pool.DruidDataSource #连接池的类型
      mvc:
        view:
          suffix: .html

这样就完成了 提供者,继续编写 消费者 dubbo-controller,其pom 文件如下:

    <?xml version="1.0" encoding="UTF-8"?>
    <project xmlns="http://maven.apache.org/POM/4.0.0"
             xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
             xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
        <parent>
            <artifactId>springboot-dubbo-one</artifactId>
            <groupId>com.test</groupId>
            <version>1.0-SNAPSHOT</version>
        </parent>
        <modelVersion>4.0.0</modelVersion>
    
        <artifactId>dubbo-controller</artifactId>
    
        <dependencies>
    
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-starter-web</artifactId>
            </dependency>
    
    
            <dependency>
                <groupId>com.alibaba.boot</groupId>
                <artifactId>dubbo-spring-boot-starter</artifactId>
                <version>0.2.0</version>
            </dependency>
            <dependency>
                <groupId>com.test</groupId>
                <artifactId>dubbo-service</artifactId>
                <version>1.0-SNAPSHOT</version>
            </dependency>
        </dependencies>
    </project>

编写 启动类ControllerStartApp

    @SpringBootApplication
    @DubboComponentScan // 扫描 所有的 Dubbo的引用类
    public class ControllerStartApp {
        public static void main(String[] args) {
            SpringApplication.run(ControllerStartApp.class,args);
        }
    }
    
配置类 ControllerConfig

    @Configuration
    public class ControllerConfig {
        @Bean
        public ApplicationConfig applicationConfig(){
            ApplicationConfig applicationConfig = new ApplicationConfig();
            applicationConfig.setName("controllerspringboot");
            return applicationConfig;
        }
        @Bean
        public RegistryConfig registryConfig(){
            RegistryConfig registryConfig = new RegistryConfig();
            registryConfig.setAddress("zookeeper://你的zookeeper地址");
            return registryConfig;
        }
    }
    
具体Controller如下:

    @RestController
    @RequestMapping("/city")
    public class CityController {
        // 这是引用 Dubbo 的 Service实现类 通过zookeeper注册中心
        @Reference 
        private CityService cityService;
    
        @RequestMapping("/getcitylist")
        public List<City> getCityList(){
            return cityService.getCityList();
        }
    }
    
这样就完成了springboot+Dubbo+Zookeeper 的简单案例.
    
    
    

        
    


        


        



        
    

    

        
    

        

        
    

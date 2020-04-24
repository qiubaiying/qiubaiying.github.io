---
layout:     post                        # 使用的布局（不需要改）
title:      SpringBoot项目整合SwaggerUI              # 标题
subtitle:   个人学习记录                  # 副标题
date:       2020-04-21                  # 时间
author:     AhogeK                      # 作者
header-img:  https://static1.smartbear.co/swagger/media/images/tools/swaggerhub/sh-wow-hosted-interactive-api-documentation.png?ext=.png    # 这篇文章标题背景图片
catalog: true                           # 是否归档
tags:                                   # 标签
    - Swagger
    - 项目学习
---

### Swagger-UI
> REST APIs文档生成工具。Swagger 是一个规范和完整的框架，用于生成、描述、调用和可视化 RESTful 风格的 Web 服务。

### 常用注解
* **Api**
    - Api 用在类上，说明该类的作用。可以标记一个Controller类做为swagger 文档资源
      - ``@Api(value = "/user", description = "Operations about user")``
* **ApiModel**
  * 描述一个Model的信息（这种一般用在post创建的时候，使用@RequestBody这样的场景，请求参数无法使用@ApiImplicitParam注解进行描述的时候；
* **ApiModelProperty**
  * 描述一个model的属性。
* **ApiOperation**
  * 用在方法上，说明方法的作用，每一个url资源的定义
    * ```java
        @ApiOperation(
          value = "Find purchase order by ID",
          notes = "For valid response try integer IDs with value <= 5 or > 10. Other values will generated exceptions",
          response = Order,
          tags = {"Pet Store"})
* **ApiParam**
  * ApiParam请求属性
    * ``public ResponseEntity<User> createUser(@RequestBody @ApiParam(value = "Created user object", required = true)  User user)``
* **ApiResponse**
  * 响应配置
    * ``@ApiResponse(code = 400, message = "Invalid user supplied")``
* **ApiResponses**
  * 响应集配置
    * ``@ApiResponses({ @ApiResponse(code = 400, message = "Invalid Order") })``
    * code： 响应码(int型)，可自定义
    * message：状态码对应的响应信息
* **ResponseHeader**
  * 响应头设置
    * ``@ResponseHeader(name="head1",description="response head conf")``
* **ApiImplicitParams**
  * 用在方法上包含一组参数说明
* **ApiImplicitParam**
  * 用在@ApiImplicitParams注解中，指定一个请求参数的各个方面
    * paramType：参数放在哪个地方
    * name：参数代表的含义
    * value：参数名称
    * dataType： 参数类型，有String/int，无用
    * required ： 是否必要
    * defaultValue：参数的默认值

### 相关依赖添加

[mvnrepository](https://mvnrepository.com/search?q=springfox-swagger)
```pom
<dependency>
    <groupId>io.springfox</groupId>
    <artifactId>springfox-swagger-ui</artifactId>
    <version>2.9.2</version>
</dependency>
<dependency>
    <groupId>io.springfox</groupId>
    <artifactId>springfox-swagger2</artifactId>
    <version>2.9.2</version>
</dependency>
```

### 添加Swagger 配置类

*Swagger对生成API文档的范围有三种不同的选择*
* 生成指定包下面的类的API文档
* 生成有指定注解的类的API文档
* 生成有指定注解的方法的API文档

```java
/**
 * Swagger2API文档的配置
 */
@Configuration
@EnableSwagger2
public class Swagger2Config {
    @Bean
    public Docket createRestApi(){
        return new Docket(DocumentationType.SWAGGER_2)
                .apiInfo(apiInfo())
                .select()
                //为当前包下controller生成API文档
                .apis(RequestHandlerSelectors.basePackage("com.macro.mall.tiny.controller"))
                //为有@Api注解的Controller生成API文档
//                .apis(RequestHandlerSelectors.withClassAnnotation(Api.class))
                //为有@ApiOperation注解的方法生成API文档
//                .apis(RequestHandlerSelectors.withMethodAnnotation(ApiOperation.class))
                .paths(PathSelectors.any())
                .build();
    }

    private ApiInfo apiInfo() {
        return new ApiInfoBuilder()
                .title("SwaggerUI演示")
                .description("mall-tiny")
                .contact("macro")
                .version("1.0")
                .build();
    }
}
```

@EnableSwagger2 表示启用Swagger的支持

第一个方法用于创建API文档 返回一个 Docket（*这是一个构建器，它是swagger-springmvc框架的主要接口。为配置提供合理的默认值和方便的方法。*）

.apiInfo： 设置Api的信息类似标题描述，创建人信息之类的，而下面的apiInfo()就是单独设置SwaggerUI信息的方法，用到了ApiInfoBuilder()类。
  * title: 更新API标题
  * description: 更新API描述
  * contact: 更新此API负责人的联系信息
    * 此处参数只是一个String  实际可传一个Contact对象，对象参数包括 负责人的姓名、个人网址以及Email
  * version: 更新api版本号
  * build: 构建

.select(): 为api选择初始化一个生成器。 返回一个 ApiSelectorBuilder

.paths(PathSelectors.any()): ApiSelectorBuilder的方法 设置路径筛选，该方法中含一句pathSelector = and(pathSelector, selector);表明条件为相与

### Controller中的使用
类上

```java
@Api(value = "SysAreaController", tags = "地区管理Controller")
```

方法上

```java
@ApiOperation(value = "事项信息列表搜索", notes = "事项信息列表搜索")
@ApiImplicitParams({
        @ApiImplicitParam(name = "affiliationApp", value = "所属应用", required = true, dataType = "String", paramType = "query"),
        @ApiImplicitParam(name = "current", value = "当前页数", dataType = "int", paramType = "query"),
        @ApiImplicitParam(name = "size", value = "每页大小", dataType = "int", paramType = "query")
})
```

返回模型上

```java
@ApiModelProperty(name = "id", notes = "地区id")
private String id;
```

### 通过MybatisGenerator自动在实体类上生成模型api信息
> CommentGenerator为MyBatis Generator的自定义注释生成器，修改addFieldComment方法使其生成Swagger的@ApiModelProperty注解来取代原来的方法注释，添加addJavaFileComment方法，使其能在import中导入@ApiModelProperty，否则需要手动导入该类，在需要生成大量实体类时，是一件非常麻烦的事。

```java
/**
 * 给字段添加注释
 */
@Override
public void addFieldComment(Field field, IntrospectedTable introspectedTable,
                            IntrospectedColumn introspectedColumn) {
    String remarks = introspectedColumn.getRemarks();
    //根据参数和备注信息判断是否添加备注信息
    if(addRemarkComments&&StringUtility.stringHasValue(remarks)){
//            addFieldJavaDoc(field, remarks);
        //数据库中特殊字符需要转义
        if(remarks.contains("\"")){
            remarks = remarks.replace("\"","'");
        }
        //给model的字段添加swagger注解
        field.addJavaDocLine("@ApiModelProperty(value = \""+remarks+"\")");
    }
}
```

```java
@Override
public void addJavaFileComment(CompilationUnit compilationUnit) {
    super.addJavaFileComment(compilationUnit);
    //只在model中添加swagger注解类的导入
    if(!compilationUnit.isJavaInterface()&&!compilationUnit.getType().getFullyQualifiedName().contains(EXAMPLE_SUFFIX)){
        compilationUnit.addImportedType(new FullyQualifiedJavaType(API_MODEL_PROPERTY_FULL_CLASS_NAME));
    }
}
```
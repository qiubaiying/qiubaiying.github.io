---
layout:     post                        # 使用的布局（不需要改）
title:      Spring的组件后续学习记录 # 标题
subtitle:      # 副标题
date:       2020-06-09                  # 时间
author:     AhogeK                      # 作者
header-img:  https://i.pximg.net/img-original/img/2020/05/12/00/00/09/81495684_p0.jpg    # 这篇文章标题背景图片
catalog: true                           # 是否归档
tags:                                   # 标签
    - SpringBoot
    - Mybatis
---
#### 关于Spring中的@Async注解
> Spring 中，被 ``@Async`` 标注的方法，称之为异步方法，这些方法执行时是以在一个独立的线程中运行，调用这无需等待其完成，可直接进行其他的任何操作。

开启异步，需要添加 ``@EnableAsync``标注的配置类

#### Spring中的后置处理器BeanPostProcessor
> ``BeanPostProcessor``是 Spring IOC 容器提供的一个扩展接口，其可以在Spring容器完成Bean的实例化、配置以及其他初始化方法前后添加自己的逻辑。

```java
@Component
public class AhogeKBeanPostProcessor implements BeanPostProcessor {

  // 是在bean实例化，依赖注入及自定义初始化方法（例如配置文件中bean标签中添加的init-method属性指定的初始化方法）之前
	public Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {
		System.out.println("Post process before initialization ... " + beanName + " ------> " + bean);
		return bean;
	}

  // 是在bean实例化、依赖注入及自定义及自定义初始化方法之后
	public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
		System.out.println("Post process after initialzation ..." + beanName + " ------> " + bean);
		return bean;
	}

}
```
当中的 ``postProcessBeforeInitialization`` 跟 ``postProcessAfterInitialization`` 两个方法就是实现该接口后重写的在实例化初始化前后执行的方法

**注：接口中的两个方法不能返回null，如果返回null会使后续的初始化方法报空指针或通过``getBean()``方法获取不到实例对象**

后置处理器是从 Spring IoC 容器中取出 bean 实例对象处理后再放回

在Spring机制中可以指定后置处理器调用顺序，通过让BeanPostProcessor接口实现类实现Ordered接口getOrder方法，该方法返回一整数，默认值为 0，优先级最高，值越大优先级越低

```java
@Component
public class AhogekBeanPostProcessor2 implements BeanPostProcessor, Ordered {

	public Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {
		System.out.println("before " + beanName);
		return bean;
	}

	public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
		System.out.println("after " + beanName);
		return bean;
	}

	public int getOrder() {
		return 0;
	}

}
```

#### ApplicationContextAware
> ApplicationContextAware 可以让Bean通过实现该接口来得到Spring容器

```java
public class SpringContextHolder implements ApplicationContextAware {
	
	private static ApplicationContext applicationContext = null;
	
	/**
	 * get static variable ApplicationContext
	 */
	public static ApplicationContext getApplicationContext() {
		assertContextInjected();
		return applicationContext;
	}

	/**
	 * 从静态变量applicationContext中得到Bean，自动转型为所赋值对象的类型
	 */
	 @SuppressWarnings("unchecked")
	public static <T> T getBean(String name) {
		 assertContextInjected();
		 return (T) applicationContext.getBean(name);
	 }
	 
	 /**
	  * 清除SpringContextHolder中的ApplicationContext为Null
	  */
	 public static void clearHolder() {
		 applicationContext = null;
	 }
	
	private static void assertContextInjected() {
		Validate.validState(applicationContext != null, 
				"applicaitonContext属性未注入, 请在applicationContext.xml中定义SpringContextHolder.");
	}

	/**
	 * 实现ApplicationContextAware接口，注入Context到静态变量中
	 */
	public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
		SpringContextHolder.applicationContext = applicationContext;
	}

}
```

以上同就是通过创建工具方法，实现ApplicationContextAware来获取ApplicationContext，以此可以直接通过该工具类在直接获取指定Bean实例。

#### BeanValidationPostProcessor

实现了BeanPostProcessor，是简单的BeanPostProcessor实现类，用于确认管理JSR-303相关注释约束的Bean，在bean调用初始化之前有违反约束的情况就会抛出异常

#### InitDestroyAnnotationBeanPostProcessor

它是在Bean初始化和销毁的时候所作的一个前置/后置处理器。就是把类中有@PostConstruct、@PreDestroy两个注解的方法信息进行缓存

#### @Inject @Autowired @Resource区别
* @Inject
  * JSR330规范，通过``AutowiredAnnotationBeanPostProcessor``类实现依赖注入。可以与``@Named``配合使用
* @Autowired
  * Spring提供的注解，通过``AutowiredAnnotationBeanPostProcessor``实现依赖注入，与``@Inject``具有互换性
* @Resource
  * JSR250规范，通过``CommonAnnotationBeanPostProcessor``实现依赖注入

#### @PropertySource

```java
@Configuration
@PropertySource(value = "classpath:/test.properties")
public class Cap8MainConfig {
	
	@Bean
	public Ash ash() {
		return new Ash();
	}
}
```

```java
public class Ash {
	@Value("Ash")
	private String name;
	@Value("#{20+2}")
	private Integer age;
	@Value("${ash.gun}")
	private String gun;
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public Integer getAge() {
		return age;
	}
	public void setAge(Integer age) {
		this.age = age;
	}
	public String getGun() {
		return gun;
	}
	public void setGun(String gun) {
		this.gun = gun;
	}
	public Ash(String name, Integer age, String gun) {
		super();
		this.name = name;
		this.age = age;
		this.gun = gun;
	}
	public Ash() {
	}
	@Override
	public String toString() {
		return "Ash [name=" + name + ", age=" + age + ", gun=" + gun + "]";
	}
}
```

test.properties
```properties
ash.gun=R4C
```

---
【相关阅读】
1. [Spring中@Async](https://www.cnblogs.com/wihainan/p/6516858.html)
2. [Spring中的后置处理器BeanPostProcessor讲解](https://www.cnblogs.com/sishang/p/6576665.html)
3. [ApplicationContextAware接口的作用](https://blog.csdn.net/bailinbbc/article/details/76446594)
4. [Class BeanValidationPostProcessor](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/validation/beanvalidation/BeanValidationPostProcessor.html)
5. [@Inject和@Autowired以及@Resource区别](https://blog.csdn.net/u012734441/article/details/51706504)
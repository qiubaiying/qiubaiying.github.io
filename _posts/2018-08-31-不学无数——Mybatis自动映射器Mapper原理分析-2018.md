---
layout:     post                    # 使用的布局（不需要改）
title:      不学无数—Mybatis自动映射器Mapper原理分析          # 标题
subtitle:   Mybatis自动映射器Mapper原理分析 #副标题
date:       2018-09-19             # 时间
author:     不学无数                      # 作者
header-img: img/post-bg-hacker.jpg    #这篇文章标题背景图片
catalog: true                       # 是否归档
tags:                               #标签
    - Java
    - MyBatis
---

在使用`MyBatis`时，有时候会想，为什么只写一个接口没有编写任何的实现类，但是就能返回接口的实例，并且调用接口的方法返回数据库中的数据？此时脑海中浮现了写动态代理时候的记忆，记得动态代理也是接管了接口，不需要实际的代理角色。然后经过源码的Debug发现果然是运用了动态代理的技术。如果对于动态代理技术不熟悉的同学可以看[不学无数—动态代理](http://modouxiansheng.top/2018/09/15/%E4%B8%8D%E5%AD%A6%E6%97%A0%E6%95%B0-Java%E5%8A%A8%E6%80%81%E4%BB%A3%E7%90%86-2018/)

## Mybatis自动映射器Mapper的源码分析

首先我们想Debug源码就得写一个测试类如下：

```
@Autowired
private SqlSessionFactory sqlSessionFactory;

@Test
public void testMybatis(){
    SqlSession sqlSession = sqlSessionFactory.openSession();
    TBapCheckPtsTranscdMapper mapper = sqlSession.getMapper(TBapCheckPtsTranscdMapper.class);
    TAmsAcPmtDtlPo tAmsAcPmtDtlPo= new TAmsAcPmtDtlPo();
    mapper.queryTransCdByType(tAmsAcPmtDtlPo);
}

```

`Mapper`是这样的

```
public interface TBapCheckPtsTranscdMapper {

	List<Map<String,String>> queryTransCdByType(TAmsAcPmtDtlPo tAmsAcPmtDtlPo);

}

```

首先先弄明白如何得到的接口的实际对象，由此Debug进去。

```
TBapCheckPtsTranscdMapper mapper = sqlSession.getMapper(TBapCheckPtsTranscdMapper.class);

```

然后进行Debug源码，发现在`MapperProxyFactory`中，返回了代理对象。

```
 protected T newInstance(MapperProxy<T> mapperProxy) {
    return (T) Proxy.newProxyInstance(mapperInterface.getClassLoader(), new Class[] { mapperInterface }, mapperProxy);
  }

```
然后发现在执行接口的方法的时候进入到了代理`MapperProxy`

```
@Override
public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
try {
  //诸如hashCode()、toString()、equals()等方法，将target指向当前对象this
  if (Object.class.equals(method.getDeclaringClass())) {
    return method.invoke(this, args);
  } else if (isDefaultMethod(method)) {
    return invokeDefaultMethod(proxy, method, args);
  }
} catch (Throwable t) {
  throw ExceptionUtil.unwrapThrowable(t);
}
final MapperMethod mapperMethod = cachedMapperMethod(method);
return mapperMethod.execute(sqlSession, args);
}
```

## 自己写一个小例子

首先自己定义个实体类

```
public class User {
    private Integer id;
    private String name;
    private String age;
    -----get,set方法
}
```

然后Mapper接口如下

```
public interface UserMapper {
    public User findUserById(Integer id);
}

```

代理类如下

```
public class MapperProxy implements InvocationHandler {

	@SuppressWarnings("unchecked")
	public <T> T newInstance(Class<T> clz) {
		return (T) Proxy.newProxyInstance(clz.getClassLoader(), new Class[] { clz }, this);
	}

	@Override
	public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
		if (Object.class.equals(method.getDeclaringClass())) {
			try {
				// 诸如hashCode()、toString()、equals()等方法，将target指向当前对象this
				return method.invoke(this, args);
			} catch (Throwable t) {
			}
		}
		//后面的xml解析之类的就先不模拟，在这直接返回数据
		return new User((Integer) args[0], "zhangsan", "18");
	}
}

```

测试如下

```
public static void main(String[] args) {
    ClassLoader classLoader = UserMapper.class.getClassLoader();
    MapperProxy mapperProxy = new MapperProxy();
    //通过代理生成接口的实例对象
    UserMapper mapper = (UserMapper) Proxy.newProxyInstance(classLoader, new Class[]{UserMapper.class},mapperProxy);
    User user = mapper.findUserById(10000);
    System.out.println("ID:" + user.getId());
    System.out.println("Name:" + user.getName());
    System.out.println("Age:" + user.getAge());
}

```

打印如下

```
ID:10000
Name:zhangsan
Age:18
Practice.Day09.MapperProxy@24d46ca6

```










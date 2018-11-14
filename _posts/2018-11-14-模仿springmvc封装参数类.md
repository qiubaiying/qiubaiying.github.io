---
layout:     post                    # 使用的布局（不需要改）
title:      spring中是如何封装参数类的?           # 标题 
subtitle:   基于BeanUtiles工具类实现参数封装 #副标题
date:       2018-11-14              # 时间
author:     MasterJen                # 作者
header-img: img/mdsource/post-bg-a-5.jpg   #这篇文章标题背景图片
catalog: true                       # 是否归档
tags:                               #标签
    - java_Utils
---

## Hey BeanUtils

>God helps those who help themselves.-- 天助自助者.

闲暇之余，写了一个封装工具类BeanUtils，模仿了spring中的参数封装类，实现了参数的封装，具体代码如下:

BeanUtilsTest 方法fillObject() 方法参数 params 类

     //模仿 springmvc中的封装工具类
     public class BeanUtilsTest {
     //   时间类的 默认
         private static SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
         private static SimpleDateFormat simpleDateFormat1 = new SimpleDateFormat("yyyy-MM-dd");
         //存放转换器,key是目标类型的类型, value是转换器
         private static Map<Class, Convert> convertMap = new HashMap<>();
     //    可以自定义时间类型.
         public static void register(Class c, Convert convert) {
             convertMap.put(c, convert);
         }    
         /**
          * 封装类 实现方法
          *
          * @param params 参数  key 是属性名  value 是值
          * @param tClass 被封装的类的类型
          * @param <T>
          * @return
          */
         public static <T> T fillObject(Map<String, String[]> params, Class<T> tClass) {
     //        创建该泛型 类的实例
             T t = null;
     //        根据 类的class 进行实例化 通过反射
             try {
     //            得到实例化对象
                 t = tClass.newInstance();
             } catch (InstantiationException e) {
                 e.printStackTrace();
             } catch (IllegalAccessException e) {
                 e.printStackTrace();
             }
     //        获得请求参数   String 就是 key  Stringp[] 就是对应的值
             Set<Map.Entry<String, String[]>> entries = params.entrySet();
     //        进行 遍历
             for (Map.Entry<String, String[]> entry : entries) {
     //            得到属性
                 String key = entry.getKey();
     //            得到值
                 String[] value = entry.getValue();
     //            根据类 和属性  进行得到其set方法
                 try {
                     PropertyDescriptor propertyDescriptor = new PropertyDescriptor(key, tClass);
     //           得到 set 方法
                     Method writeMethod = propertyDescriptor.getWriteMethod();
                     if (writeMethod != null) {
     //                    对 set方法进行赋值  注意  参数是 String[] 类型的 判断 属性值是什么类型的，如果是单体类型的，那么可以只要数组的第一个值
                         Class<?>[] parameterTypes = writeMethod.getParameterTypes();
     //                    理论上  set 方法 只有一个参数  只要第一个参数类型 然后进行判断
                         Class<?> parameterType = parameterTypes[0];
                         if (parameterType == String.class) {
     //                            把数组变成 字符串类型的   赋值给 set方法
                             writeMethod.invoke(t, Arrays.toString(value));
     //                            如果是 数组类型的  那么 进行 赋值
                         } else if (parameterType == String[].class) {
     //                        把 数组类型的  转换成 object[] 数组类型 进行赋值
                             writeMethod.invoke(t, new Object[]{value});
     //                        如果 是基本类型的 话  那么值 只有一个，，所以 只取数组的第一个
                         } else if (parameterType == int.class || parameterType == Integer.class) {
     //                            判断 数组长度，，如果长度不是1  那么说明有错误
                             if (value.length != 1) {
                                 throw new RuntimeException("属性" + key + "的数组长度错误");
                             } else {
                                 writeMethod.invoke(t, Integer.parseInt(value[0]));
                             }
     //                        如果是 时间类型的
                         } else if (parameterType == Date.class) {
     //                        使用 自定义类型的 时间，还是 规定的
                             Date date = null;
     //                        看看有没有用户定义的 时间类型
                             Convert convert = convertMap.get(Date.class);
                             if (convert != null) {
                                 //通过自定义转换器实现  结果是 自定义类型的
                                 date = (Date) convert.convert(value[0]);
     //                            就是默认的
                             } else {
                                 try {
                                     date = simpleDateFormat.parse(value[0]);
                                 } catch (Exception e) {
                                     try {
                                         date = simpleDateFormat1.parse(value[0]);
                                     } catch (Exception e1) {
                                         e.printStackTrace();
                                     }
                                     e.printStackTrace();
                                 }
                             }
     //                        把时间装进去
                             writeMethod.invoke(t, date);
                         }
                     }
                 } catch (Exception e) {
                     e.printStackTrace();
                 }
             }
     //        返回结果
             return t;
         }
     }

时间转换类 将String类型的转换为 Date 类型的

    /**
     *
     * 指定一个接口,内部包含有转换方法
     * S 代表原始类型,T代表目标类型
     * @Author
     */
    public interface Convert<S,T> {
        /**
         * 将原始类型转换为目标类型
         * @param s
         * @return
         */
        T convert(S s);
    }
    
具体时间<泛型>转换类 

    public class MyConvert implements Convert<String, Date> {
    //    自己定义时间格式
        private SimpleDateFormat simpleDateFormat =new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
        @Override
        public Date convert(String source) {
            try {
                return source==null?null:simpleDateFormat.parse(source);
            } catch (ParseException e) {
                e.printStackTrace();
            }
            return null;
        }
    }
    
测试类

        public void test4() {
    //        测试类
                Map<String, String[]> params = new HashMap<>();
                  params.put("user_name", new String[]{"张三"});
                 params.put("password", new String[]{"小姐姐", "小哥哥", "小姐姐和小哥哥"});
                  params.put("user_id", new String[]{"11111"});
                  params.put("create_time", new String[]{"2016/10/16 10:10:10"});
    //              注册时间 自定义时间
                  MyConvert myMyMyDataConvert = new MyConvert();
                  BeanUtilsTest.register(Date.class, myMyMyDataConvert);
    //              进行封装
            User user = BeanUtilsTest.fillObject(params, User.class);
            System.out.println(user.toString());
        }

如下便完成了类的基本参数封装.
        
    
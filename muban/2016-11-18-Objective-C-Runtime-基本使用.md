---
layout:     post
title:      Objective-C Runtime 基本使用
subtitle:   Runtime 使用案例
date:       2017-02-04
author:     BY
header-img: img/post-bg-ios9-web.jpg
catalog: true
tags:
    - Obj-C
    - Runtime
    - iOS
--- 

# 前言

>在上一篇文章[《Objective-C Runtime详解》](http://www.jianshu.com/p/a36bfc976b8e)中我们探讨了Runtime的基本原理，这篇文章我们将总结一下Runtime的一些基本使用

# 使用方法


- 查询方法
- 给分类添加属性
- 更换代码的实现方法
- 动态添加方法
- 字典转属性

# 准备

 先创建两个类

`ClassA.h`

```
#import <Foundation/Foundation.h>

@interface ClassA : NSObject {
    // 公有变量
    NSString *_publicVar1;
    NSString *_publicVar2;

}
// 公有属性
@property(nonatomic,copy) NSString *publicProperty1;
@property(nonatomic,copy) NSString *publicProperty2;

/* 公有方法 */
-(void)methodAOfClassAWithArg:(NSString *)arg;

@end

```

`ClassA.m`

```
#import "ClassA.h"

@interface ClassA()
// 私有属性
@property(nonatomic,copy) NSString *privateProperty1;
@property(nonatomic,copy) NSString *privateProperty2;

@end

@implementation ClassA {
    // 私有变量
    NSString *_privateVar1;
    NSString *_privateVar2;
}

/* 公有方法 */
-(void)methodAOfClassAWithArg:(NSString *)arg {
    NSLog(@" methodAOfClassA arg = %@", arg);
}

/* 私有方法 */
-(void)MethodBOfClassAWithArg:(NSString *)arg {
    NSLog(@" methodBOfClassA arg = %@", arg);
}
@end
```

`ClassB.h`

```
#import <Foundation/Foundation.h>

@interface ClassB : NSObject

/* 公有方法 */
-(void)methodAOfClassBWithArg:(NSString *)arg;

@end
```

`ClassB.m`

```
#import "ClassB.h"

@implementation ClassB
- (void)methodAOfClassBWithArg:(NSString *)arg {
    NSLog(@" methodAOfClassB arg = %@", arg);
}

-(void)methodBOfClassBWithArg:(NSString *)arg {
    NSLog(@" methodBOfClassB arg = %@", arg);
}

@end
```

## 查询方法
---

在Objective-C Runtime下没有真正意义上的私有变量和方法，因为这些私有变量和方法都可以通过Runtime方法获取，这当然包括系统的私有API。接下来我们来一一介绍获取类中属性和方法的方法。当然不要忘了`#import <objc/runtime.h>`.

#### 获取类的名称

方法：`const char *object_getClassName(id obj)`，使用比较简单，传入对象即可得到对应分类名。

```
ClassA *classA = [[ClassA alloc] init];
const char *className = object_getClassName(classA);
NSLog(@"className = %@", [NSString stringWithUTF8String:className]);

//输出
className = ClassA
```

#### 获取类中的方法

方法：`Method *class_copyMethodList(Class cls, unsigned int *outCount) `

上代码：

```
UInt32 count;
char dst;
Method *methods = class_copyMethodList([classA class], &count);//获取方法列表
for (int i = 0; i < count; i++) {
    Method method = methods[i];// 获取方法
    SEL methodName = method_getName(method);// 获取方法名
    method_getReturnType(method, &dst, sizeof(char));// 获取方法返回类型
    const char *methodType = method_getTypeEncoding(method);// 获取方法参数类型和返回类型
    NSLog(@"methodName = %@",NSStringFromSelector(methodName));
    NSLog(@"dst = %c", dst);
}
    
 // 输出
 methodName = methodAOfClassAWithArg:
 dst = v
 methodType = v24@0:8@16
 methodName = MethodBOfClassAWithArg:
 dst = v
 methodType = v24@0:8@16
 methodName = publicProperty1
 dst = @
 methodType = @16@0:8
 methodName = setPublicProperty1:
 dst = v
 methodType = v24@0:8@16
 methodName = publicProperty2
 dst = @
 methodType = @16@0:8
 methodName = setPublicProperty2:
 dst = v
 methodType = v24@0:8@16
 methodName = privateProperty1
 dst = @
 methodType = @16@0:8
 methodName = setPrivateProperty1:
 dst = v
 methodType = v24@0:8@16
 methodName = privateProperty2
 dst = @
 methodType = @16@0:8
 methodName = setPrivateProperty2:
 dst = v
 methodType = v24@0:8@16
 methodName = .cxx_destruct
 dst = v
 methodType = v16@0:8

```

`class_copyMethodList([classA class], &count)` 传入元类和计数器地址，返回方法列表。这里注意，返回的是`Method`结构体类型的C数组，`Method`类型我们在[上篇文章](http://www.jianshu.com/p/a36bfc976b8e)中已经详细说明，

```
typedef struct objc_method *Method;

struct objc_method {
    SEL method_name                                          OBJC2_UNAVAILABLE;
    char *method_types                                       OBJC2_UNAVAILABLE;
    IMP method_imp                                           OBJC2_UNAVAILABLE;
} 
```

但要区分`Method *methods`与`Method method`的区别，这是比较基础C语言知识。还有`Uint32`是OC定义的`unsigned int`类型`typedef unsigned int UInt32;`

这里我们来看看 `method_getReturnType(method, &dst, sizeof(char))` 方法简单输出返回值类型，输出为 `v` 和 `@` ,参考Apple文档可知道返回类型为 `void` 和 `id`

```
A void v
A method selector (SEL)  ：
An object (whether statically typed or typed id) @ 
```

`method_getTypeEncoding(method)`方法可以输出返回值，参数类型以及接收器类型。我们看输出的`v24@0:8@16`，分析上面的说明就可以知道： `v24`返回类型为`viod`,`@0`接收器类型为`id`,`@16`参数类型为`id`

至于类型后面的值观察可以发现都是相差8，我认为是在method中的位置，分别以8bit存储不同类型的数据。

若有两个参数返回值为 `v32@0:8@16@24` ,对比可以猜测，在method中各个成员的排列是这样的： `接收器|SEl标识|参数1|参数2|...|返回值`，然后由 `method_getTypeEncoding(method)` 输出的顺序为: `返回值类型|接收器类型|SEL标识|参数1|参数2|...` 此处为个人见解，如有错误或不同意见欢迎提出探讨。

最后发现了一个奇怪的方法 `.cxx_destruct` ,在中[这篇文章](http://my.safaribooksonline.com/book/programming/objective-c/9780132908641/3dot-memory-management/ch03)中：
>ARC actually creates a -.cxx_destruct method to handle freeing instance variables. This method was originally created for calling C++ destructors automatically when an object was destroyed.

和《Effective Objective-C 2.0》中提到的：
>When the compiler saw that an object contained C++ objects, it would generate a method called .cxx_destruct. ARC piggybacks on this method and emits the required cleanup code within it.

可以了解到，`.cxx_destruct` 方法原本是为了C++对象析构的，ARC借用了这个方法插入代码实现了自动内存释放的工作

关于 `.cxx_destruct` 可以参考这篇文章:[ARC下dealloc过程及.cxx_destruct的探究](http://blog.jobbole.com/65028/)

#### 获取类中的属性

在 [上篇文章](http://www.jianshu.com/p/a36bfc976b8e) 的 `Property` 中我们也提到了获取类中的属性的方法，如下：

```
id LenderClass = objc_getClass("ClassA");//获取classA 的元类同[ClassA class]
unsigned int outCount;//属性数量
// 获取属性列表
objc_property_t *properties = class_copyPropertyList(LenderClass, &outCount);

// 遍历
for (int i = 0; i < outCount; i++) {

    objc_property_t property = properties[i];
    
    const char *propertyName = property_getName(property);// 获取属性名
    const char *propertyAttributes = property_getAttributes(property);// 获取属性描述
    
    printf("propertyName：%s \n", propertyName);
    printf("propertyAttributes:%s\n--------\n", propertyAttributes);//属性名及描述
}
```

```
// 输出
propertyName：privateProperty1 
propertyAttributes:T@"NSString",C,N,V_privateProperty1
--------
propertyName：privateProperty2 
propertyAttributes:T@"NSString",C,N,V_privateProperty2
--------
propertyName：publicProperty1 
propertyAttributes:T@"NSString",C,N,V_publicProperty1
--------
propertyName：publicProperty2 
propertyAttributes:T@"NSString",C,N,V_publicProperty2
--------
```
发现会输出公有属性以及私有属性。

#### 获取类中的成员变量

我们可以发现获取类中的方法，属性过程基本一致：通过元类获取方法列表或属性列表，然后在进行遍历。获取成员变量也一样：

```
id selfClass = [Calss class];
unsigned int numIvars = 0;
Ivar *ivars = class_copyIvarList(selfClass, &numIvars);
for(int i = 0; i < numIvars; i++) {
    Ivar ivar = ivars[i];
    const char *ivarName = ivar_getName(ivar);
    const char *ivarType = ivar_getTypeEncoding(ivar);// 获取类型
    
    printf("ivarName:%s\n", ivarName);
    printf("ivarType:%s\n------\n", ivarType);
}
```

```
// 输出
ivarName:_publicVar1
ivarType:@"NSString"
------
ivarName:_publicVar2
ivarType:@"NSString"
------
ivarName:_privateVar1
ivarType:@"NSString"
------
ivarName:_privateVar2
ivarType:@"NSString"
------
ivarName:_publicProperty1
ivarType:@"NSString"
------
ivarName:_publicProperty2
ivarType:@"NSString"
------
ivarName:_privateProperty1
ivarType:@"NSString"
------
ivarName:_privateProperty2
ivarType:@
```
可以发现输出了所有的成员变量，包括属性声明的 `_+属性名` 变量。

## 给分类添加属性
---

众所周知，分类中是不能声明属性的。

我们创建一个 `CalssA` 的分类 `ClassA+CategoryA` ,在 `ClassA+CategoryA` 中添加一个属性 `name`

```
#import "ClassA.h"

@interface ClassA (CategoryA)

@property (nonatomic, strong) NSString *name;

@end

```

若在我们调用`CalssA`分类的`name` 将会crash，原因是分类中使用 `@property` 声明属性并不会生成`setter`和`getter`方法,但是我们会想，我们可以自己实现呀，没错，看下面的代码

```
#import "ClassA+CategoryA.h"
#import <objc/runtime.h>

@implementation ClassA (CategoryA)

- (NSString *)name {
    return name;
}

- (void)setName:(NSString *)name {
    _name = name;
}

@end
```
这里会报编译错误，因为分类中使用 `@property` 声明属性也不会生成成员变量 _name，并且手动声明也不行

![](http://ww1.sinaimg.cn/large/7853084cgw1f9zsknx42yj20fw033gm0.jpg)

编译错误，提示实例变量无法添加到分类中，用正常的方法确实无法在分类中添加属性。

但是可以通过Runtim机制进行“添加”。其本质是给这个类添加属性关联，而非把这个属性添加到类中。

```
#import "ClassA+CategoryA.h"
#import <objc/runtime.h>


@implementation ClassA (CategoryA)

- (NSString *)name {
    return objc_getAssociatedObject(self, @selector(name));
}

- (void)setName:(NSString *)name {
    objc_setAssociatedObject(self, @selector(name), name, OBJC_ASSOCIATION_COPY_NONATOMIC);
}

@end
```

调用：

```
classA.name = @"邱帅";
NSLog(@"%@",classA.name);

// 输出
2016-11-21 16:18:48.084 UseRuntime[4392:1325037] 邱帅
```
可以看出添加属性成功！

我们来看看关联属性的这几个方法：

```
OBJC_EXPORT void objc_setAssociatedObject(id object, const void *key, id value, objc_AssociationPolicy policy)
    OBJC_AVAILABLE(10.6, 3.1, 9.0, 1.0);
    
OBJC_EXPORT id objc_getAssociatedObject(id object, const void *key)
    OBJC_AVAILABLE(10.6, 3.1, 9.0, 1.0);
    
OBJC_EXPORT void objc_removeAssociatedObjects(id object)
    OBJC_AVAILABLE(10.6, 3.1, 9.0, 1.0);

```
`objc_setAssociatedObject()` 方法为关联属性，参数如下：

- `object`：属性关联的源对象，这里使用了`self`，代表关联本类的对象
- `key`:区分属性的唯一标识，因为关联的属性可能不止一个，我们使用了`- (NSString *)name`方法的`SEL` `@selector(name)`作为唯一标示，当然也可以用下面的方法来生成Key :

```
//利用静态变量地址唯一不变的特性
1、static void *strKey = &strKey;

2、static NSString *strKey = @"strKey"; 

3、static char strKey;
```

- `value`：关联的属性值
- `policy`：设置关联对象的`copy`、`story`、`nonatomic`等参数:

这些常量对应着引用关联值的政策，也就是 Objc 内存管理的引用计数机制。

```
typedef OBJC_ENUM(uintptr_t, objc_AssociationPolicy) {
    OBJC_ASSOCIATION_ASSIGN = 0,           
    OBJC_ASSOCIATION_RETAIN_NONATOMIC = 1,              
    OBJC_ASSOCIATION_COPY_NONATOMIC = 3,                                                  
    OBJC_ASSOCIATION_RETAIN = 01401,       
    OBJC_ASSOCIATION_COPY = 01403                                               
};
```
`objc_getAssociatedObject()` 方法通过 `object` 与 `Key` 直接获取关联的属性值

`objc_removeAssociatedObjects()` 移除关联

我们使用上面的获取类中属性和成员变量的方法，发现输出：

```
// 有属性输出
propertyName：name 
propertyAttributes:T@"NSString",&,N
```
没有成员变量 `_name`，进一步说明分类中不能添加成员变量！其本质是添加属性与分类之间关联。


## 更换代码实现方法（Method Swizzling）
---
在[上篇](http://www.jianshu.com/p/a36bfc976b8e)中详细介绍了`Method Swizzling`的原理，其本质是更换了 `selector` 的 `IMP` 。

```
#import "ViewController.h"
#import <objc/runtime.h>
#import "ClassA.h"
#import "ClassB.h"

@interface ViewController ()

@end

@implementation ViewController

+ (void)load {
    Method classA_method = class_getInstanceMethod([ClassA class], @selector(methodAOfClassAWithArg:));
    Method classB_method = class_getInstanceMethod([ClassB class], @selector(methodAOfClassBWithArg:));
    method_exchangeImplementations(classA_method, classB_method);
}
- (void)viewDidLoad {
    [super viewDidLoad];
    
    [classA methodAOfClassAWithArg:@"classA 发出的 A方法"];
    [classB methodAOfClassBWithArg:@"classB 发出的 A方法"];
}    

// 输出

2016-11-22 13:07:15.151 UseRuntime[1015:533335]  methodAOfClassB arg = classA 发出的 A方法
2016-11-22 13:07:15.151 UseRuntime[1015:533335]  methodAOfClassA arg = classB 发出的 A方法
```

首先交换方法写在 `+(void)load`,在程序的一开始就调用执行，你将不会碰到并发问题。 

我们可以发现两个方法的实现过程以及对换。

当然，平时使用我们并不会这么做，当我们要在系统提供的方法上再扩充功能时(不能重写系统方法)，就可以使用`Method Swizzling`.

我们给`NSArray`添加一个分类`AddLog`,给 `arrayByAddingObject:`方法添加一个输出方法：

```
#import "NSArray+AddLog.h"
#import <objc/runtime.h>

@implementation NSArray (AddLog)

+ (void)load {

    SEL ori_selector = @selector(arrayByAddingObject:);
    SEL my_selector = @selector(my_arrayByAddingObject:);
    
    Method ori_method = class_getInstanceMethod([NSArray class], ori_selector);
    Method my_method  = class_getInstanceMethod([NSArray class], my_selector);
    
    if (([NSArray class], ori_selector, method_getImplementation(my_method), method_getTypeEncoding(my_method))) {
        
        class_replaceMethod([NSArray class], my_selector, method_getImplementation(ori_method), method_getTypeEncoding(ori_method));
        
    } else {
        method_exchangeImplementations(ori_method, my_method);
    }

}

- (NSArray *)my_arrayByAddingObject:(id)anObject {

    NSArray *array = [self my_arrayByAddingObject:anObject];
    NSLog(@"添加了一个元素 %@", anObject);
    return array;
}

@end

```
我们来看看这三个方法：

- `class_addMethod()`：给一个方法添加新的方法和实现
- `class_replaceMethod(）`：取代了对于一个给定的类的实现方法
- `method_exchangeImplementations(）`：交换两个类的实现方法

这里我们先使用 `class_addMethod()` 在类中添加方法，若返回Yes说明类中没有该方法，然后再使用 `class_replaceMethod()` 方法进行取代;若返回NO，说明类中有该方法，使用`method_exchangeImplementations()`直接交换两者的 `IMP`.

其实在这里直接使用`method_exchangeImplementations()`进行交换就可以了。因为类中必定有`arrayByAddingObject：`方法。


我给我们自己的方法命名为`my_arrayByAddingObject:`,在原来的方法名上加上前缀，既可以防止命名冲突，又方便阅读，在我们`my_arrayByAddingObject:`方法中调用本身

```
NSArray *array = [self my_arrayByAddingObject:anObject];
```

看似会陷入递归调用，其实则不会，因为我们已经在`+ (void)load `方法中更换了`IMP`,他会调用`arrayByAddingObject:`方法，然后在后面添加我们需要添加的功能。

`arrayByAddingObject:`方法的调用不变；


```
NSArray *arr1 = @[@"one", @"two"];
NSArray *arr2 = [arr1 arrayByAddingObject:@"three"];
NSLog(@"arr2 = %@", arr2);
```

```
// 输出
2016-11-22 13:57:00.021 UseRuntime[1147:743449] 添加了一个元素 three
2016-11-22 13:57:00.021 UseRuntime[1147:743449] arr2 = (
    one,
    two,
    three
)
```

## 动态添加方法

动态添加方法就是在消息转发前在`+ (BOOL)resolveInstanceMethod:(SEL)sel`方法中使用`class_addMethod()` 添加方法。

下面我面添加一个名为`resolveThisMethodDynamically`的方法：

```
void dynamicMethodIMP(id self, SEL _cmd) {
    // implementation ....
    printf("执行了dynamicMethodIMP!!!!");
}

+ (BOOL)resolveInstanceMethod:(SEL)sel {
    
    if (sel == @selector(resolveThisMethodDynamically)) {
        class_addMethod([self class], sel, (IMP) dynamicMethodIMP, "v@:");
        return YES;
    }
    return [super resolveInstanceMethod:sel];
}
```
调用：

```
performSelector:@selector(resolveThisMethodDynamically)];

// 输出
执行了dynamicMethodIMP!!!!
```
对于上面添加的的方法 `resolveThisMethodDynamically` ，使用 `[self performSelector:@selector(resolveThisMethodDynamically)]` 进行调用，不能使用`[self resolveThisMethodDynamically]`,因为压根就没有声明 `-(void)resolveThisMethodDynamically`,会报编译错误。

整个过程就是，`performSelector:`调用`resolveThisMethodDynamically`方法，然后在列表中找不到（因为类中根本就没有注册该方法），然后跳入 `+ (BOOL)resolveInstanceMethod:` 中，我们再为`resolveThisMethodDynamically`方法添加具体实现。

## 字典转属性

将字典转化为模型，是在我们iOS开发中最为常用的技能。iOS的模型框架如`JSONModel`,`MJExtension`,`MJExtension`等皆是利用了runtime，将字典转为模型，不过兼顾的细节更多。下面我们来实现一个简易的字典转模型框架。

先上代码：

```
#import "NSObject+BYModel.h"
#import <objc/runtime.h>
#import <objc/message.h>

@implementation NSObject (BYModel)

- (void)by_modelSetDictionary:(NSDictionary *)dic {

    Class cls = [self class];
    
    // 遍历本类和父类的变量
    while (cls) {
        //获取所有成员变量
        unsigned int outCount = 0;
        Ivar *ivars = class_copyIvarList(cls, &outCount);
        
        for (int i = 0; i < outCount; i++) {
            Ivar ivar = ivars[i];
            
            // 获取变量名
            NSMutableString *ivar_Name = [NSMutableString stringWithUTF8String:ivar_getName(ivar)];
        
            [ivar_Name replaceCharactersInRange:NSMakeRange(0, 1) withString:@""];// _ivar -> ivar
            
            //
            NSString *key = [ivar_Name copy];
            if ([key isEqualToString:@"dece"]) {
                key = @"description";
            }
            if ([key isEqualToString:@"ID"]) {
                key = @"id";
            }
            
            id value = dic[key];
            if (!value) continue;
            
            // 拼接SEL    ivar -> setIvar:
            
            NSString *cap = [ivar_Name substringToIndex:1];
            cap = cap.uppercaseString; // a->A
            [ivar_Name replaceCharactersInRange:NSMakeRange(0, 1) withString:cap];
            [ivar_Name insertString:@"set" atIndex:0];
            [ivar_Name appendString:@":"];
            
            SEL selector = NSSelectorFromString(ivar_Name);
            
            // 判断类型并发送消息
            NSString *type = [NSString stringWithUTF8String:ivar_getTypeEncoding(ivar)];
            
            if ([type hasPrefix:@"@"]) { // 对象类型
                objc_msgSend(self, selector, value);
            } else { // 非对象类型
                if ([type isEqualToString:@"d"]) {
                    objc_msgSend(self, selector, [value doubleValue]);
                } else if ([type isEqualToString:@"f"]) {
                    objc_msgSend(self, selector, [value floatValue]);
                } else if ([type isEqualToString:@"i"]) {
                    objc_msgSend(self, selector, [value intValue]);
                } else {
                    objc_msgSend(self, selector, [value longLongValue]);
                }
            }
            
            
        }
        // 获取父类进行遍历变量
        cls = class_getSuperclass(cls);
    }
    
}

```

这个这个段代码可能出现编译错误：

![](http://ww3.sinaimg.cn/large/7853084cgw1fa3b5fbvsqj20k001fjrn.jpg)

解决办法很简单：

将项目 Project -> Build Settings -> Enable strct checking of objc_msgSend Calls 设置为 **NO** 即可

![](http://ww1.sinaimg.cn/large/7853084cgw1fa3b6mm9h7j20oh0aj0v8.jpg)

接下来我们创建一个模型类`Student`

```
#import <Foundation/Foundation.h>

@interface Student : NSObject

@property (nonatomic, strong) NSString *name;
@property (nonatomic, assign) int age;
@property (nonatomic, assign) int idNumber;

@end


```

使用我们的转模型方法：

```
NSDictionary *dic = @{ @"name":@"邱帅", @"age": @(23), @"idNumber":@(1234567)};

Student *stu = [Student new];
[stu by_modelSetDictionary:dic];

NSLog(@"%@", [NSString stringWithFormat:@"%@, %d, %d", stu.name, stu.age, stu.idNumber]);

// 输出
2016-11-24 15:32:46.351 Demo_字典转模型（Runtime）[2131:884627] 邱帅, 23, 1234567
```

该方法先利用我们上面介绍的`class_copyIvarList()`获取类中的成员变量列表，然后进行遍历，拼接字符串`setIvar:`，最后调用`objc_msgSend()`直接发送设置变量的消息，完成属性的赋值。

```
while (cls) {

	//code..
	
 cls = class_getSuperclass(cls);
}
```
这个循环是则获取父类中的属性：当前类的属性遍历结束之后，指向父类，若父类存在则在继续遍历属性，否则就退出循环。

当然，这个方法只是介绍了利用runtime进行字典转模型的原理,实际中还有很多需要考虑的细节，项目中我还是推荐使用像[YYModel](https://github.com/ibireme/YYModel)这些比较成熟而且安全的模型框架。

关于快速字典转模型可以参考我写的一篇[《快速完成JSON\字典转模型 For YYModel》](http://www.jianshu.com/p/b7d8cf650722)。




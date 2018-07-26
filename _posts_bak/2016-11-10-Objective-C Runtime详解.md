---
layout:     post
title:      Objective-C Runtime 详解
subtitle:   Runtime 详解
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
>最近在学习Runtime的知识，恰巧发现了这篇博客[《Objective-C Runtime》](http://yulingtianxia.com/blog/2014/11/05/objective-c-runtime/)，在此基础上，进行了些许补充说明,如有错误或其他想法，欢迎提出交流。

## 基础知识
- 引言
- 简介
- 与Runtime交互
- RunTime术语
- 消息
- 动态方法解析
- 消息转发
- 健壮的实例变量
- 动态添加属性(Object-C Associated Objects)
- 方法调剂（Method Swizzling）
- 总结

### 引言

Objective-C的方法调用实则为“发送消息”,我们来看`[dog eat]`实际会被编译器转化为

```
objc_msgSend(dog, SEL)//SEL为eat方法的标识符@selector(@"eat")
```

若方法中函数参数，则为：

```
objc_msgSend(dog, SEL, arg1, arg2, ...)
```

如果消息的接收者能够找到对应的方法，那么就相当于直接执行了接收者这个对象的特定方法；否则，消息要么被转发，或是临时向接收者动态添加这个方法对应的实现内容，要么就干脆就crash掉。

现在可以看出`[dog eat]`真的不是一个简简单单的方法调用。因为这只是在编译阶段确定了要向接收者发送`eat`这条消息，而`dog`将要如何响应这条消息，那就要看运行时发生的情况来决定了。

Objective-C 的 Runtime 铸就了它动态语言的特性，这些深层次的知识虽然平时写代码用的少一些，但是却是每个 Objc 程序员需要了解的。

### 简介

因为Objc是一门动态语言，所以它总是想办法把一些决定工作从编译连接推迟到运行时。也就是说只有编译器是不够的，还需要一个运行时系统 (runtime system) 来执行编译后的代码。这就是 Objective-C Runtime 系统存在的意义，它是整个Objc运行框架的一块基石。

Runtime其实有两个版本:“modern”和 “legacy”。我们现在用的 Objective-C 2.0 采用的是现行(Modern)版的Runtime系统，只能运行在 iOS 和 OS X 10.5 之后的64位程序中。而OS X较老的32位程序仍采用 Objective-C 1中的（早期）Legacy 版本的 Runtime 系统。这两个版本最大的区别在于当你更改一个类的实例变量的布局时，在早期版本中你需要重新编译它的子类，而现行版就不需要。

Runtime基本是用C和汇编写的，可见苹果为了动态系统的高效而作出的努力。你可以在[这里](https://opensource.apple.com/source/objc4/)下到苹果维护的开源代码。苹果和GNU各自维护一个开源的runtime版本，这两个版本之间都在努力的保持一致。

### 与Runtime交互

Objc 从`三种`不同的层级上与 Runtime 系统进行交互，分别是通过 `Objective-C 源代码`，通过 Foundation 框架的`NSObject类定义的方法`，通过对 `runtime 函数`的直接调用。

#### Objective-C源代码

大部分情况下你就只管写你的Objc代码就行，runtime 系统自动在幕后辛勤劳作着。
还记得引言中举的例子吧，消息的执行会使用到一些编译器为实现动态语言特性而创建的数据结构和函数，Objc中的类、方法和协议等在 runtime 中都由一些数据结构来定义，这些内容在后面会讲到。（比如`objc_msgSend`函数及其参数列表中的`id`和`SEL`都是啥）

#### NSObject的方法

Cocoa 中大多数类都继承于`NSObject`类，也就自然继承了它的方法。最特殊的例外是`NSProxy`，它是个抽象超类，它实现了一些消息转发有关的方法，可以通过继承它来实现一个其他类的替身类或是虚拟出一个不存在的类，说白了就是领导把自己展现给大家风光无限，但是把活儿都交给幕后小弟去干。

有的`NSObject`中的方法起到了抽象接口的作用，比如`description`方法需要你重载它并为你定义的类提供描述内容。`NSObject`还有些方法能在运行时获得类的信息，并检查一些特性，比如`class`返回对象的类；`isKindOfClass`:和`isMemberOfClass:`则检查对象是否在指定的类继承体系中；`respondsToSelector:`检查对象能否响应指定的消息；`conformsToProtocol:`检查对象是否实现了指定协议类的方法；`methodForSelector:`则返回指定方法实现的地址。

#### Runtime的函数

Runtime 系统是一个由一系列函数和数据结构组成，具有公共接口的动态共享库。头文件存放于`/usr/include/objc`目录下。许多函数允许你用纯C代码来重复实现 Objc 中同样的功能。虽然有一些方法构成了`NSObject`类的基础，但是你在写 Objc 代码时一般不会直接用到这些函数的，除非是写一些 Objc 与其他语言的桥接或是底层的debug工作。在[Objective-C Runtime Reference](https://developer.apple.com/reference/objectivec/1657527-objective_c_runtime)中有对 Runtime 函数的详细文档。

### Runtime术语

还记得引言中的`objc_msgSend:`方法吧，它的真身是这样的

```
id objc_msgSend ( id self, SEL op, ... );
```
下面将会逐渐展开介绍一些术语，其实它们都对应着数据结构。

#### SEL

`objc_msgSend`函数第二个参数类型为`SEL`，它是`selector`在Objc中的表示类型（Swift中是`Selector`类）。`selector`是方法选择器，可以理解为区分方法的标识，而这个标识的数据结构是SEL:

```
typedef struct objc_selector *SEL;
```

本质上，SEL只是一个指向方法的指针（准确的说，只是一个根据方法名hash化了的KEY值，能唯一代表一个方法），它的存在只是为了加快方法的查询速度。这个查找过程我们将在下面讨论。

我们可以在运行时添加新的selector，也可以在运行时获取已存在的selector，我们可以通过下面三种方法来获取SEL:

1. sel_registerName函数

2. Objective-C编译器提供的@selector()

3. NSSelectorFromString()方法

#### id

`objc_msgSend`第一个参数类型为`id`，大家对它都不陌生，它是一个指向类实例的指针：

```
typedef struct objc_object *id;
```

那`objc_object`又是啥呢：

```
struct objc_object { Class isa; };
```
`objc_object`结构体包含一个`isa`指针，根据`isa`指针就可以顺藤摸瓜找到对象所属的类。

PS:`isa`指针不总是指向实例对象所属的类，不能依靠它来确定类型，而是应该用`class`方法来确定实例对象的类。因为KVO的实现机理就是将被观察对象的isa指针指向一个中间类而不是真实的类，这是一种叫做 **isa-swizzling** 的技术，详见[官方文档](https://developer.apple.com/library/content/documentation/Cocoa/Conceptual/KeyValueObserving/Articles/KVOImplementation.html#//apple_ref/doc/uid/20002307-BAJEAIEE)的这句段说明

>Key-Value Observing Implementation Details

>Automatic key-value observing is implemented using a technique called isa-swizzling.

>The isa pointer, as the name suggests, points to the object's class which maintains a dispatch table. This dispatch table essentially contains pointers to the methods the class implements, among other data.

>When an observer is registered for an attribute of an object the isa pointer of the observed object is modified, pointing to an intermediate class rather than at the true class. As a result the value of the isa pointer does not necessarily reflect the actual class of the instance.

>You should never rely on the isa pointer to determine class membership. Instead, you should use the class method to determine the class of an object instance.

#### Class

之所以说`isa`是指针是因为`Class`其实是一个指向`objc_class`结构体的指针：

```
typedef struct objc_class *Class;
```
而`objc_class`就是我们摸到的那个瓜，里面的东西多着呢：

```
struct objc_class {
    Class isa  OBJC_ISA_AVAILABILITY;

#if !__OBJC2__
    Class super_class                                        OBJC2_UNAVAILABLE;
    const char *name                                         OBJC2_UNAVAILABLE;
    long version                                             OBJC2_UNAVAILABLE;
    long info                                                OBJC2_UNAVAILABLE;
    long instance_size                                       OBJC2_UNAVAILABLE;
    struct objc_ivar_list *ivars                             OBJC2_UNAVAILABLE;
    struct objc_method_list **methodLists                    OBJC2_UNAVAILABLE;
    struct objc_cache *cache                                 OBJC2_UNAVAILABLE;
    struct objc_protocol_list *protocols                     OBJC2_UNAVAILABLE;
#endif

} OBJC2_UNAVAILABLE;
```
可以看到运行时一个类还关联了它的超类指针，类名，成员变量，方法，缓存，还有附属的协议

PS:`OBJC2_UNAVAILABLE`之类的宏定义是苹果在 Objc 中对系统运行版本进行约束的黑魔法，为的是兼容非Objective-C 2.0的遗留逻辑，但我们仍能从中获得一些有价值的信息，有兴趣的可以查看源代码

`Objective-C 2.0` 的头文件虽然没暴露出`objc_class`结构体更详细的设计，我们依然可以从`Objective-C 1.0` 的定义中小窥端倪

在`objc_class`结构体中：`ivars`是`objc_ivar_list`指针；`methodLists`是指向`objc_method_list`指针的指针。也就是说可以动态修改`*methodLists`的值来添加成员方法，这也是Category实现的原理，同样解释了Category不能添加属性的原因。而最新版的 Runtime 源码对这一块的描述已经有很大变化，可以参考下美团技术团队的[深入理解Objective-C：Category](http://tech.meituan.com/DiveIntoCategory.html).

PS：任性的话可以在Category中添加`@dynamic`的属性，并利用运行期动态提供存取方法或干脆动态转发；或者干脆使用关联度对象（AssociatedObject）

其中`objc_ivar_list`和`objc_method_list`分别是成员变量列表和方法列表：

```
struct objc_ivar_list {
    int ivar_count                                           OBJC2_UNAVAILABLE;
#ifdef __LP64__
    int space                                                OBJC2_UNAVAILABLE;
#endif
    /* variable length structure */
    struct objc_ivar ivar_list[1]                            OBJC2_UNAVAILABLE;
}                                                            OBJC2_UNAVAILABLE;

struct objc_method_list {
    struct objc_method_list *obsolete                        OBJC2_UNAVAILABLE;

    int method_count                                         OBJC2_UNAVAILABLE;
#ifdef __LP64__
    int space                                                OBJC2_UNAVAILABLE;
#endif
    /* variable length structure */
    struct objc_method method_list[1]                        OBJC2_UNAVAILABLE;
}
```
如果你C语言不是特别好，可以理解为`objc_ivar_list`结构体存储着`objc_ivar`数组列表，而`objc_ivar`结构体存储了类的单个成员变量的信息；同理`objc_method_list`结构体存储着`objc_method`数组列表，而o`bjc_method`结构体存储了类的某个方法的信息。

最后要提到的还有一个`objc_cache`，顾名思义它是缓存，它在`objc_class`的作用很重要，在后面会讲到。

不知道你是否注意到了`objc_class`中也有一个`isa`对象，这是因为一个 ObjC 类本身同时也是一个对象，为了处理类和对象的关系，runtime 库创建了一种叫做元类 (Meta Class) 的东西，类对象所属类型就叫做元类，它用来表述类对象本身所具备的元数据。类方法就定义于此处，因为这些方法可以理解成类对象的实例方法。每个类仅有一个类对象，而每个类对象仅有一个与之相关的元类。当你发出一个类似`[NSObject alloc]`的消息时，你事实上是把这个消息发给了一个类对象 (Class Object) ，这个类对象必须是一个元类的实例，而这个元类同时也是一个根元类 (root meta class) 的实例。所有的元类最终都指向根元类为其超类。所有的元类的方法列表都有能够响应消息的类方法。所以当 `[NSObject alloc]` 这条消息发给类对象的时候，`objc_msgSend()`会去它的元类里面去查找能够响应消息的方法，如果找到了，然后对这个类对象执行方法调用。

![](http://7ni3rk.com1.z0.glb.clouddn.com/Runtime/class-diagram.jpg)

上图实线是 `super_class` 指针，虚线是`isa`指针。 有趣的是根元类的超类是`NSObjec`t，而`isa`指向了自己，而`NSObject`的超类为`nil`，也就是它没有超类

####Method

`Method`是一种代表类中的某个方法的类型。

```
typedef struct objc_method *Method;
```
而`objc_method`在上面的方法列表中提到过，它存储了方法名，方法类型和方法实现：

```
struct objc_method {
    SEL method_name                                          OBJC2_UNAVAILABLE;
    char *method_types                                       OBJC2_UNAVAILABLE;
    IMP method_imp                                           OBJC2_UNAVAILABLE;
}                                                            OBJC2_UNAVAILABLE;

```
- 方法名 `method_name` 类型为 `SEL`, 相同名字的方法即使在不同类中定义，它们的方法选择器也相同。
- 方法类型`method_types`是个`char`指针，存储着方法的 参数类型 和 返回值 类型。
- `method_imp`指向了方法的实现，本质上是一个函数指针，后面会详细讲到。

#### Ivar

Ivar是一种代表类中实例变量的类型。定义如下：

```
typedef struct objc_ivar *Ivar;
```
它是一个指向objc_ivar结构体的指针，结构体有如下定义:

```
struct objc_ivar {
    char *ivar_name                                          OBJC2_UNAVAILABLE;
    char *ivar_type                                          OBJC2_UNAVAILABLE;
    int ivar_offset                                          OBJC2_UNAVAILABLE;
#ifdef __LP64__
    int space                                                OBJC2_UNAVAILABLE;
#endif
}                                                            OBJC2_UNAVAILABLE;
```
这里我们注意第三个成员 `ivar_offset`。它表示基地址偏移字节。

在编译我们的类时，编译器生成了一个 `ivar` 布局，显示了在类中从哪可以访问我们的 `ivars` 。

我们对 ivar 的访问就可以通过 `对象地址` ＋ `ivar偏移字节`的方法。

但是当我们增加了父类的`ivar`，这个时候布局就出错了，我们就不得不重新编译子类来恢复兼容性。

而Objective－C Runtime中使用了`Non Fragile ivars`来避免这个问题

使用`Non Fragile ivars`时，Runtime会进行检测来调整类中新增的`ivar`的偏移量。 这样我们就可以通过 `对象地址 ＋ 基类大小 + ivar偏移字节`的方法来计算出`ivar`相应的地址，并访问到相应的`ivar`。

可以根据实例查找其在类中的名字，也就是“反射”：

```
-(NSString *)nameWithInstance:(id)instance {
    unsigned int numIvars = 0;
    NSString *key=nil;
    Ivar * ivars = class_copyIvarList([self class], &numIvars);
    for(int i = 0; i < numIvars; i++) {
        Ivar thisIvar = ivars[i];
        const char *type = ivar_getTypeEncoding(thisIvar);
        NSString *stringType =  [NSString stringWithCString:type encoding:NSUTF8StringEncoding];
        if (![stringType hasPrefix:@"@"]) {
            continue;
        }
        if ((object_getIvar(self, thisIvar) == instance)) {//此处若 crash 不要慌！
            key = [NSString stringWithUTF8String:ivar_getName(thisIvar)];
            break;
        }
    }
    free(ivars);
    return key;
}
```
`class_copyIvarList` 函数获取的不仅有实例变量，还有属性。但会在原本的属性名前加上一个下划线。(属性的本质就是 `_属性名+set+get方法`)

#### IMP

`IMP`在`objc.h`中的定义是：

```
typedef id (*IMP)(id, SEL, ...);
```
它就是一个[函数指针](http://yulingtianxia.com/blog/2014/04/17/han-shu-zhi-zhen-yu-zhi-zhen-han-shu/)，这是由编译器生成的。当你发起一个 ObjC 消息之后，最终它会执行的那段代码，就是由这个函数指针指定的。而 `IMP` 这个函数指针就指向了这个方法的实现。既然得到了执行某个实例某个方法的入口，我们就可以绕开消息传递阶段，直接执行方法，这在后面会提到。

我们再来看看objc_msgSend()的定义：` id objc_msgSend(id self, SEL op, ...)`

你会发现`IMP`指向的方法与`objc_msgSend`函数类型相同，参数都包含id和SEL类型。每个方法名都对应一个SEL类型的方法选择器，而每个实例对象中的`SEL`对应的方法实现肯定是唯一的，通过一组`id`和`SEL`参数就能确定唯一的方法实现地址。

#### Cache

在`runtime.h`中Cache的定义如下：

```
typedef struct objc_cache *Cache
```
还记得之前 `objc_class` 结构体中有一个 `struct objc_cache *cache` 吧，它到底是缓存啥的呢，先看看 `objc_cache` 的实现：

```
struct objc_cache {
    unsigned int mask /* total = mask + 1 */                 OBJC2_UNAVAILABLE;
    unsigned int occupied                                    OBJC2_UNAVAILABLE;
    Method buckets[1]                                        OBJC2_UNAVAILABLE;
};
```
`objc_cache` 的定义看起来很简单，它包含了下面三个变量：

- `mask`:可以认为是当前能达到的最大index（从0开始的），所以缓存的size（total）是mask+1
- `occupied`:被占用的槽位，因为缓存是以散列表的形式存在的，所以会有空槽，而occupied表示当前被占用的数目
- `buckets`:用数组表示的hash表，cache_entry类型，每一个cache_entry代表一个方法缓存

(buckets定义在objc_cache的最后，说明这是一个可变长度的数组)

`Cache`为方法调用的性能进行优化,下面我们来看看`objc_msgSend`具体又是如何分发的呢？ 我们来看下runtime层`objc_msgSend`的源码。

在`objc-msg-arm.s`中，`objc_msgSend`的代码如下：

ps：Apple为了高度优化objc_msgSend的性能，这个文件是汇编写成的，不过即使我们不懂汇编，详尽的注释也可以让我们一窥其真面目

```
ENTRY objc_msgSend
# check whether receiver is nil
teq     a1, #0
    beq     LMsgSendNilReceiver
# save registers and load receiver's class for CacheLookup
stmfd   sp!, {a4,v1}
ldr     v1, [a1, #ISA]
# receiver is non-nil: search the cache
CacheLookup a2, v1, LMsgSendCacheMiss
# cache hit (imp in ip) and CacheLookup returns with nonstret (eq) set, restore registers and call
ldmfd   sp!, {a4,v1}
bx      ip
# cache miss: go search the method lists
LMsgSendCacheMiss:
ldmfd sp!, {a4,v1}
b _objc_msgSend_uncached
LMsgSendNilReceiver:
    mov     a2, #0
    bx      lr
LMsgSendExit:
END_ENTRY objc_msgSend
STATIC_ENTRY objc_msgSend_uncached
# Push stack frame
stmfd sp!, {a1-a4,r7,lr}
add     r7, sp, #16
# Load class and selector
ldr a3, [a1, #ISA] /* class = receiver->isa  */
/* selector already in a2 */
/* receiver already in a1 */
# Do the lookup
MI_CALL_EXTERNAL(__class_lookupMethodAndLoadCache3)
MOVE    ip, a1
# Prep for forwarding, Pop stack frame and call imp
teq v1, v1 /* set nonstret (eq) */
ldmfd sp!, {a1-a4,r7,lr}
bx ip
```

如果向更深入了解 `objc_cache` ,可以看看这篇博文[深入理解Objective-C：方法缓存](http://www.cocoachina.com/ios/20150818/13075.html)

从上述代码中可以看到，`objc_msgSend`（就ARM平台而言）的消息分发分为以下几个步骤：

1. 判断receiver是否为nil，也就是objc_msgSend的第一个参数self，也就是要调用的那个方法所属对象
2. 从缓存里寻找，找到了则分发，否则
3. 利用objc-class.mm中_class_lookupMethodAndLoadCache3（为什么有个这么奇怪的方法。本文末尾会解释）方法去寻找selector
4. 如果支持GC，忽略掉非GC环境的方法（retain等）
5. 从本class的method list寻找selector，如果找到，填充到缓存中，并返回selector，否则
6. 寻找父类的method list，并依次往上寻找，直到找到selector，填充到缓存中，并返回selector，否则
7. 调用_class_resolveMethod，如果可以动态resolve为一个selector，不缓存，方法返回，否则
8. 转发这个selector，否则
9. 报错，抛出异常

从上面的分析中我们可以看到，当一个方法在比较“上层”的类中，用比较“下层”（继承关系上的上下层）对象去调用的时候，如果没有缓存，那么整个查找链是相当长的。就算方法是在这个类里面，当方法比较多的时候，每次都查找也是费事费力的一件事情。

当我们需要去调用一个方法数十万次甚至更多地时候，查找方法的消耗会变的非常显著。就算我们平常的非大规模调用，`除非一个方法只会调用一次，否则缓存都是有用的。`在运行时，那么多对象，那么多方法调用，节省下来的时间也是非常可观的。可见缓存的重要性。

方法缓存存在什么地方？

让我们再去去翻看 `objc_class` 的定义，

```
struct objc_class {
    Class isa  OBJC_ISA_AVAILABILITY;

#if !__OBJC2__
    Class super_class                                        OBJC2_UNAVAILABLE;
    const char *name                                         OBJC2_UNAVAILABLE;
    long version                                             OBJC2_UNAVAILABLE;
    long info                                                OBJC2_UNAVAILABLE;
    long instance_size                                       OBJC2_UNAVAILABLE;
    struct objc_ivar_list *ivars                             OBJC2_UNAVAILABLE;
    struct objc_method_list **methodLists                    OBJC2_UNAVAILABLE;
    struct objc_cache *cache                                 OBJC2_UNAVAILABLE;
    struct objc_protocol_list *protocols                     OBJC2_UNAVAILABLE;
#endif

} OBJC2_UNAVAILABLE;
```

我们看到在类的定义里就有`cache`字段，没错，类的所有缓存都存在metaclass上，所以每个类都只有一份方法缓存，而不是每一个类的object都保存一份。

子类类即便是从父类取到的方法，也会存在类本身的方法缓存里。而当用一个父类对象去调用那个方法的时候，也会在父类的metaclass里缓存一份。

#### Property

`@property`标记了类中的属性，这个不必多说大家都很熟悉，它是一个指向objc_property结构体的指针：

```
typedef struct objc_property *Property;
typedef struct objc_property *objc_property_t;//这个更常用
```

现在在类中声明声明属性和成员变量：

```
@interface ViewController ()
{
    int age;
    NSString *name;
}
@property (nonatomic, strong) NSString *property1;
@property (nonatomic, strong) NSString *property2;
@property (nonatomic, assign) int age;//这里的age为属性，对应变量：_age
@property (nonatomic, assign) long ID;

@end
```

然后用下面的方法来获取类中属性列表：

```
id LenderClass = objc_getClass("ViewController");//获取calss
//id LenderClass = [MyViewController class];//同上
unsigned int outCount;//属性数量
objc_property_t *properties = class_copyPropertyList(LenderClass, &outCount);//获取属性列表
for (int i = 0; i < outCount; i++) {// 遍历
    objc_property_t property = properties[i];
    const char *propertyName = property_getName(property);
    const char *propertyAttributes = property_getAttributes(property);
    printf("propertyName：%s \n", propertyName);
    printf("propertyAttributes:%s\n--------\n", propertyAttributes);//属性名及描述
}
```

控制台输出：

```
propertyName：property1 
propertyAttributes:T@"NSString",&,N,V_property1
--------
propertyName：property2 
propertyAttributes:T@"NSString",&,N,V_property2
--------
propertyName：age 
propertyAttributes:Ti,N,V_age
--------
propertyName：ID 
propertyAttributes:Tq,N,V_ID
```


我们再来来看看获取成员变量的方法：

```
id selfClass = [self class];
unsigned int numIvars = 0;
Ivar *ivars = class_copyIvarList(selfClass, &numIvars);
for(int i = 0; i < numIvars; i++) {
    Ivar ivar = ivars[i];
    const char *ivarType = ivar_getTypeEncoding(ivar);// 获取类型
    const char *ivarName = ivar_getName(ivar);
    printf("ivarName:%s\n", ivarName);
    printf("ivarType:%s\n------\n", ivarType);
}
```
控制台输出：

```
ivarName:age
ivarType:i
------
ivarName:name
ivarType:@"NSString"
------
ivarName:_age
ivarType:i
------
ivarName:_property1
ivarType:@"NSString"
------
ivarName:_property2
ivarType:@"NSString"
------
ivarName:_ID
ivarType:q
```

我们会发现与 `class_copyIvarList` 函数不同，使用 `class_copyPropertyList` 函数只能获取类的属性，而不包含成员变量。但此时获取的属性名是不带下划线的,得到属性或者变量名后我们就可以使用KVC去修改访问类中的私有属性或变量。所以OC中没有真正意义上的私有变量，私有方法也是。

### 消息
前面做了这么多铺垫，现在终于说到了消息了。Objc 中发送消息是用中括号 `[]` 把接收者和消息括起来，而直到运行时才会把消息与方法实现绑定。

有关消息发送和消息转发机制的原理，可以查看[这篇文章](http://yulingtianxia.com/blog/2016/06/15/Objective-C-Message-Sending-and-Forwarding/)。

#### objc_msgSend函数

在引言中已经对 `objc_msgSend` 进行了一点介绍，看起来像是 `objc_msgSend` 返回了数据，其实 `objc_msgSend` 从不返回数据而是你的方法被调用后返回了数据。下面详细叙述下消息发送步骤：

1. 检测这个 消息 是不是要忽略的。比如 Mac OS X 开发，在ARC中有了垃圾回收就不理会MRC的 `retain`, `release` 这些函数了。
2. 检测这个 目标对象 是不是 `nil` 对象。ObjC 的特性是允许对一个 `nil` 对象执行任何一个方法不会 Crash，因为会被忽略掉。
3. 如果上面两个都过了，那就开始查找这个类的 `IMP`，先从 `cache` 里面找，完了找得到就跳到对应的函数去执行。
4. 如果 `cache` 找不到就找一下方法分发表。
5. 如果分发表找不到就到超类的分发表去找，一直找，直到找到NSObject类为止。
6. 如果还找不到就要开始进入动态方法解析了，后面会提到。

PS:这里说的分发表其实就是 `Class` 中的方法列表，它将方法选择器和方法实现地址联系起来。
![](https://developer.apple.com/library/mac/documentation/Cocoa/Conceptual/ObjCRuntimeGuide/Art/messaging1.gif)

其实编译器会根据情况在`objc_msgSend`, `objc_msgSend_stret`, `objc_msgSendSuper`, 或 `objc_msgSendSuper_stret`四个方法中选择一个来调用。如果消息是传递给超类，那么会调用名字带有”Super”的函数；如果消息返回值是数据结构而不是简单值时，那么会调用名字带有`”stret”`的函数。排列组合正好四个方法

PS：有木有发现这些函数的命名规律哦？带 `“Super”` 的是消息传递给超类；`“stret”`可分为`“st”`+`“ret”`两部分，分别代表 `“struct”` 和 `“return”` ；`“fpret”`就是 `“fp”` + `“ret”`，分别代表`“floating-point”`和 `“return”`。

#### 方法中的隐藏参数
我们经常在方法中使用 `self` 关键字来引用实例本身，但从没有想过为什么 `self` 就能取到调用当前方法的对象吧。其实 `self` 的内容是在方法运行时被偷偷的动态传入的

当 `objc_msgSend` 找到方法对应的实现时，它将直接调用该方法实现，并将消息中所有的参数都传递给方法实现,同时,它还将传递两个隐藏的参数:

- 接收消息的对象（也就是`self`指向的内容）
- 方法选择器（`_cmd`指向的内容）

之所以说它们是隐藏的是因为在源代码方法的定义中并没有声明这两个参数。它们是在代码被编译时被插入实现中的。尽管这些参数没有被明确声明，在源代码中我们仍然可以引用它们。在下面的例子中，`self`引用了接收者对象，而`_cmd`引用了方法本身的选择器：

```
- strange
{
    id  target = getTheReceiver();
    SEL method = getTheMethod();
 
    if ( target == self || method == _cmd )
        return nil;
    return [target performSelector:method];
}
```
在这两个参数中，`self` 更有用。实际上,它是在方法实现中访问消息接收者对象的实例变量的途径

而当方法中的 `super` 关键字接收到消息时，编译器会创建一个 `objc_super` 结构体：

```
struct objc_super { id receiver; Class class; };
```
这个结构体指明了消息应该被传递给特定父类的定义。但`receiver`仍然是`self`本身，这点需要注意，因为当我们想通过`[super class]`获取超类时，编译器只是将指向`self`的`id`指针和`class`的`SEL`传递给了o`bjc_msgSendSuper`函数，因为只有在`NSObject`类才能找到`class`方法，然后`class`方法调用`object_getClass()`，接着调用`objc_msgSend(objc_super->receiver`, `@selector(class))`，传入的第一个参数是指向`self`的`id`指针，与调用`[self class]`相同，所以我们得到的永远都是`self`的类型。

#### 获取方法地址

在 `IMP` 那节提到过可以避开消息绑定而直接获取方法的地址并调用方法。这种做法很少用，除非是需要持续大量重复调用某方法的极端情况，避开消息发送泛滥而直接调用该方法会更高效。
NSObject类中有个`methodForSelector:`实例方法，你可以用它来获取某个方法选择器对应的 `IMP` ，举个栗子：

```
void (*imp)(id, SEL, BOOL);//定义一个函数指针
imp = (void (*)(id, SEL, BOOL))[self methodForSelector:@selector(setFilled:)];//获取setFilled:函数的IMP
```

### 动态方法解析

你可以动态地提供一个方法的实现。例如我们可以用 `@dynamic` 关键字在类的实现文件中修饰一个属性：

```
@dynamic propertyName;
```
这表明我们会为这个属性提供存取方法，也就是说编译器不会默认为我们生成 `setPropertyName:`和 `prepertyName` 方法，而需要我们自己提供动态方法。我们可以通过分别重载 `resolveIntanceMethod：` 和 `resolvrClassMethod:` 方法分别添加实例方法实现和类方法实现。因为当 Runtime 系统在 `Cache` 和方法分发表中（包括父类）找不到要执行的方法时，Runtime会调用 `resolveIntanceMethod：` 和 `resolvrClassMethod:` 来给我们一次动态添加实现的机会。我们需要 `class_addMethod`函数完成向特定类添加特定方法实现的操作：

```
void dynamicMethodIMP(id self, SEL _cmd) {
    // implementation ....
}
@implementation MyClass
+ (BOOL)resolveInstanceMethod:(SEL)aSEL
{
    if (aSEL == @selector(resolveThisMethodDynamically)) {
          class_addMethod([self class], aSEL, (IMP) dynamicMethodIMP, "v@:");
          return YES;
    }
    return [super resolveInstanceMethod:aSEL];
}
@end

```
上面的例子为resolveThisMethodDynamically方法添加了实现内容，也就是dynamicMethodIMP方法中的代码。其中 “v@:” 表示返回值和参数，这个符号涉及 [Type Encoding](https://developer.apple.com/library/mac/DOCUMENTATION/Cocoa/Conceptual/ObjCRuntimeGuide/Articles/ocrtTypeEncodings.html)

PS：动态方法解析会在消息转发机制浸入前执行。如果 `respondsToSelector:` 或 `instancesRespondToSelector:` 方法被执行，动态方法解析器将会被首先给予一个提供该方法选择器对应的 `IMP` 的机会。如果你想让该方法选择器被传送到转发机制，那么就让`resolveInstanceMethod:` 返回 `NO` 。

### 消息转发
#### 重定向
在消息转发机制执行前，Runtime 系统会再给我们一次偷梁换柱的机会，即通过重载`- (id)forwardingTargetForSelector:(SEL)aSelector` 方法替换消息的接受者为其他对象：

```
- (id)forwardingTargetForSelector:(SEL)aSelector
{
    if(aSelector == @selector(mysteriousMethod:)){
        return alternateObject;
    }
    return [super forwardingTargetForSelector:aSelector];
}
```

毕竟消息转发要耗费更多时间，抓住这次机会将消息重定向给别人是个不错的选择，不过千万别返回`self`，因为那样会死循环

#### 转发

当动态方法解析不作处理返回NO时，消息转发机制会被触发。在这时`forwardInvocation:`方法会被执行，我们可以重写这个方法来定义我们的转发逻辑：

```
- (void)forwardInvocation:(NSInvocation *)anInvocation
{
    if ([someOtherObject respondsToSelector:
            [anInvocation selector]])
        [anInvocation invokeWithTarget:someOtherObject];
    else
        [super forwardInvocation:anInvocation];
}
```

该消息的唯一参数是个`NSInvocation`类型的对象——该对象封装了原始的消息和消息的参数。我们可以实现`forwardInvocation:`方法来对不能处理的消息做一些默认的处理，也可以将消息转发给其他对象来处理，而不抛出错误。

当一个对象由于没有相应的方法实现而无法响应某消息时，运行时系统将通过 `forwardInvocation:` 消息通知该对象。每个对象都从NSObject类中继承了 `forwardInvocation:` 方法。然而，NSObject中的方法实现只是简单地调用了 `doesNotRecognizeSelector:` 。通过实现我们自己的 `forwardInvocation:` 方法，我们可以在该方法实现中将消息转发给其它对象。

`forwardInvocation:` 方法就像一个不能识别的消息的分发中心，将这些消息转发给不同接收对象。或者它也可以象一个运输站将所有的消息都发送给同一个接收对象。它可以将一个消息翻译成另外一个消息，或者简单的”吃掉“某些消息，因此没有响应也没有错误。`forwardInvocation:`方法也可以对不同的消息提供同样的响应，这一切都取决于方法的具体实现。该方法所提供是将不同的对象链接到消息链的能力。

注意： `forwardInvocation:` 方法只有在消息接收对象中无法正常响应消息时才会被调用。 所以，如果我们希望一个对象将negotiate消息转发给其它对象，则这个对象不能有`negotiate`方法。否则，`forwardInvocation:`将不可能会被调用。

#### 转发和多继承
转发和继承相似，可以用于为Objc编程添加一些多继承的效果。就像下图那样，一个对象把消息转发出去，就好似它把另一个对象中的方法借过来或是“继承”过来一样。

![](https://developer.apple.com/library/mac/documentation/Cocoa/Conceptual/ObjCRuntimeGuide/Art/forwarding.gif)

这使得不同继承体系分支下的两个类可以“继承”对方的方法，在上图中 `Warrior` 和 `Diplomat` 没有继承关系，但是 `Warrior` 将`negotiate` 消息转发给了 `Diplomat` 后，就好似 `Diplomat` 是 `Warrior` 的超类一样。
消息转发弥补了 Objc 不支持多继承的性质，也避免了因为多继承导致单个类变得臃肿复杂。它将问题分解得很细，只针对想要借鉴的方法才转发，而且转发机制是透明的

#### 替代者对象(Surrogate Objects)
转发不仅能模拟多继承，也能使轻量级对象代表重量级对象。弱小的女人背后是强大的男人，毕竟女人遇到难题都把它们转发给男人来做了。这里有一些适用案例，可以参看[官方文档](https://developer.apple.com/library/mac/documentation/Cocoa/Conceptual/ObjCRuntimeGuide/Articles/ocrtForwarding.html#//apple_ref/doc/uid/TP40008048-CH105-SW11)。

#### 转发于继承
尽管转发很像继承，但是NSObject类不会将两者混淆。像 `respondsToSelector:` 和 `isKindOfClass:` 这类方法只会考虑继承体系，不会考虑转发链。比如上图中一个 `Warrior` 对象如果被问到是否能响应 `negotiate` 消息：

```
if ( [aWarrior respondsToSelector:@selector(negotiate)] )
    ...
```
结果是 `NO` ，尽管它能够接受 `negotiate` 消息而不报错，因为它靠转发消息给 `Diplomat` 类来响应消息。

如果你为了某些意图偏要“弄虚作假”让别人以为`Warrior` 继承到了 `Diplomat` 的 `negotiate` 方法，你得重新实现 `respondsToSelector: ` 和 `isKindOfClass:` 来加入你的转发算法：

```
- (BOOL)respondsToSelector:(SEL)aSelector
{
    if ( [super respondsToSelector:aSelector] )
        return YES;
    else {
        /* Here, test whether the aSelector message can     *
         * be forwarded to another object and whether that  *
         * object can respond to it. Return YES if it can.  */
    }
    return NO;
}
```

除了`respondsToSelector: `和 `isKindOfClass:`之外，`instancesRespondToSelector:`中也应该写一份转发算法。如果使用了协议，`conformsToProtocol:`同样也要加入到这一行列中。类似地，如果一个对象转发它接受的任何远程消息，它得给出一个`methodSignatureForSelector:`来返回准确的方法描述，这个方法会最终响应被转发的消息。比如一个对象能给它的替代者对象转发消息，它需要像下面这样实现`methodSignatureForSelector:`:

```
- (NSMethodSignature*)methodSignatureForSelector:(SEL)selector
{
    NSMethodSignature* signature = [super methodSignatureForSelector:selector];
    if (!signature) {
       signature = [surrogate methodSignatureForSelector:selector];
    }
    return signature;
}
```

### 健壮的实例变量(Non Fragile ivars)

在 Runtime 的现行版本中，最大的特点就是健壮的实例变量。当一个类被编译时，实例变量的布局也就形成了，它表明访问类的实例变量的位置。从对象头部地址开始，实例变量依次根据自己所占空间而产生位移：

再翻出Ivar的定义：

```
struct objc_ivar {
    char *ivar_name                                          OBJC2_UNAVAILABLE;
    char *ivar_type                                          OBJC2_UNAVAILABLE;
    int ivar_offset                                          OBJC2_UNAVAILABLE;
#ifdef __LP64__
    int space                                                OBJC2_UNAVAILABLE;
#endif
}                                                            OBJC2_UNAVAILABLE;
```

`ivar` 的访问可以通过 `对象地址` ＋ `ivar偏移字节(ivar_offset)`的方法。

当我们增加了父类的`ivar`，这个时候布局就出错了，我们就不得不重新编译子类来恢复兼容性。

在健壮的实例变量下编译器生成的实例变量布局跟以前一样，但是当 runtime 系统检测到与超类有部分重叠时它会调整你新添加的实例变量的位移，那样你在子类中新添加的成员就被保护起来了

需要注意的是在健壮的实例变量下，不要使用 `sizeof(SomeClass)`，而是用 `class_getInstanceSize([SomeClass class])` 代替；也不要使用 `offsetof(SomeClass, SomeIvar)` ，而要用 `ivar_getOffset(class_getInstanceVariable([SomeClass class], "SomeIvar"))` 来代替。

```
/* 定义一个Student类 */
@interface Student : NSObject
{
@private
    int age;
}
@end

@implementation Student
// 重写%@输出方法
- (NSString *)description
{
    NSLog(@"current pointer = %p", self);
    NSLog(@"age pointer = %p", &age);
    return [NSString stringWithFormat:@"age = %d", age];
}

@end

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        // insert code here...
        
        Student *student = [[Student alloc] init];
        Ivar age_ivar = class_getInstanceVariable(object_getClass(student), "age");//获取"age"的ivar
        int *age_pointer = (int *)((__bridge void *)(student) + ivar_getOffset(age_ivar));//定义一个指向age_ivar的指针：指向地址为 student对象地址 + age_ivar的偏移量（ivar_offset）
        NSLog(@"age ivar offset = %td", ivar_getOffset(age_ivar));//输出offset偏移量
        *age_pointer = 10;//对指针age_pointer指向的变量（age_ivar）赋值
        NSLog(@"%@", student);//输出重写的description方法
        
    }
    return 0;
}
```
观察控制台输出：

```
2016-11-11 16:22:56.364 Iavr_offset[1501:928608] age ivar offset = 8
2016-11-11 16:22:56.365 Iavr_offset[1501:928608] current pointer = 0x100400170
2016-11-11 16:22:56.365 Iavr_offset[1501:928608] age pointer = 0x100400178
2016-11-11 16:22:56.366 Iavr_offset[1501:928608] age = 10
```

我们发现`age pointer = current pointer + age ivar offset`

### Objective-C Associated Objects

在 OS X 10.6 之后，Runtime系统让Objc支持向对象动态添加变量。涉及到的函数有以下三个：

```
 void objc_setAssociatedObject ( id object, const void *key, id value, objc_AssociationPolicy policy );
 id objc_getAssociatedObject ( id object, const void *key );
 void objc_removeAssociatedObjects ( id object );
```
这些方法以键值对的形式动态地向对象添加、获取或删除关联值。其中关联政策是一组枚举常量：

```
enum {
   OBJC_ASSOCIATION_ASSIGN  = 0,
   OBJC_ASSOCIATION_RETAIN_NONATOMIC  = 1,
   OBJC_ASSOCIATION_COPY_NONATOMIC  = 3,
   OBJC_ASSOCIATION_RETAIN  = 01401,
   OBJC_ASSOCIATION_COPY  = 01403
};
```
这些常量对应着引用关联值的政策，也就是 Objc 内存管理的引用计数机制。

### Method Swizzling

之前所说的消息转发虽然功能强大，但需要我们了解并且能更改对应类的源代码，因为我们需要实现自己的转发逻辑。当我们无法触碰到某个类的源代码，却想更改这个类某个方法的实现时，该怎么办呢？可能继承类并重写方法是一种想法，但是有时无法达到目的。这里介绍的是 Method Swizzling ，它通过重新映射方法对应的实现来达到“偷天换日”的目的。跟消息转发相比，Method Swizzling 的做法更为隐蔽，甚至有些冒险，也增大了debug的难度。

这里摘抄一个 NSHipster 的例子

```
#import <objc/runtime.h> 

@implementation UIViewController (Tracking)

+ (void)load {
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        Class class = [self class];
        // When swizzling a class method, use the following: 
        // Class class = object_getClass((id)self); 
        SEL originalSelector = @selector(viewWillAppear:);
        SEL swizzledSelector = @selector(xxx_viewWillAppear:);
        Method originalMethod = class_getInstanceMethod(class, originalSelector);
        Method swizzledMethod = class_getInstanceMethod(class, swizzledSelector);
        BOOL didAddMethod =
            class_addMethod(class,
                originalSelector,
                method_getImplementation(swizzledMethod),
                method_getTypeEncoding(swizzledMethod));
        if (didAddMethod) {
            class_replaceMethod(class,
                swizzledSelector,
                method_getImplementation(originalMethod),
                method_getTypeEncoding(originalMethod));
        } else {
            method_exchangeImplementations(originalMethod, swizzledMethod);
        }
    });
}
#pragma mark - Method Swizzling 
- (void)xxx_viewWillAppear:(BOOL)animated {
    [self xxx_viewWillAppear:animated];
    NSLog(@"viewWillAppear: %@", self);
}
@end
```
上面的代码通过添加一个 `Tracking` 类别到 `UIViewController` 类中，将 `UIViewController` 类的 `viewWillAppear:` 方法和 `Tracking` 类别中 `xxx_viewWillAppear:` 方法的实现相互调换。`Swizzling` 应该在 `+load` 方法中实现，因为 `+load` 是在一个类最开始加载时调用。`dispatch_once` 是GCD中的一次性方法，它保证了代码块只执行一次，并让其为一个原子操作，线程安全是很重要的。

先用 `class_addMethod` 和 `class_replaceMethod` 函数将两个方法的实现进行调换，如果类中已经有了 `viewWillAppear:` 方法的实现，那么就调用 `method_exchangeImplementations` 函数交换了两个方法的 `IMP` ，这是苹果提供给我们用于实现 `Method Swizzling` 的便捷方法。
最后 `xxx_viewWillAppear:` 方法的定义看似是递归调用引发死循环，其实不会的。因为 `[self xxx_viewWillAppear:animated]` 消息会动态找到 `xxx_viewWillAppear:` 方法的实现，而它的实现已经被我们与 `viewWillAppear:`方法实现进行了互换，所以这段代码不仅不会死循环，如果你把 `[self xxx_viewWillAppear:animated]` 换成 `[self viewWillAppear:animated]` 反而会引发死循环。
看到有人说 `+load`方法本身就是线程安全的，因为它在程序刚开始就被调用，很少会碰到并发问题，于是 `stackoverflow` 上也有大神给出了另一个 `Method Swizzling` 的实现：

```
- (void)replacementReceiveMessage:(const struct BInstantMessage *)arg1 {
    NSLog(@"arg1 is %@", arg1);
    [self replacementReceiveMessage:arg1];
}
+ (void)load {
    SEL originalSelector = @selector(ReceiveMessage:);
    SEL overrideSelector = @selector(replacementReceiveMessage:);
    Method originalMethod = class_getInstanceMethod(self, originalSelector);
    Method overrideMethod = class_getInstanceMethod(self, overrideSelector);
    if (class_addMethod(self, originalSelector, method_getImplementation(overrideMethod), method_getTypeEncoding(overrideMethod))) {
            class_replaceMethod(self, overrideSelector, method_getImplementation(originalMethod), method_getTypeEncoding(originalMethod));
    } else {
            method_exchangeImplementations(originalMethod, overrideMethod);
    }
}
```
其实也就是去掉了`dispatch_once`的部分罢了。

`Method Swizzling` 的确是一个值得深入研究的话题，`Method Swizzling` 的最佳实现是什么呢？小弟才疏学浅理解的不深刻，找了几篇不错的资源推荐给大家：

- [Objective-C的hook方案（一）: Method Swizzling](http://blog.csdn.net/yiyaaixuexi/article/details/9374411)
- [Method Swizzling](http://nshipster.com/method-swizzling/)
- [How do I implement method swizzling?](http://stackoverflow.com/questions/5371601/how-do-i-implement-method-swizzling)
- [What are the Dangers of Method Swizzling in Objective C?](http://stackoverflow.com/questions/5339276/what-are-the-dangers-of-method-swizzling-in-objective-c)
- [JRSwizzle](https://github.com/rentzsch/jrswizzle)

### 总结

我们之所以让自己的类继承 `NSObject` 不仅仅因为苹果帮我们完成了复杂的内存分配问题，更是因为这使得我们能够用上 Runtime 系统带来的便利。深入理解 Runtime 系统的细节更有利于我们利用消息机制写出功能更强大的代码，比如 `Method Swizzling` 等。



参考链接

- 原文：[Objective-C Runtime](http://yulingtianxia.com/blog/2014/11/05/objective-c-runtime/)
- Apple官方文档：[Objective-C Runtime Programming Guide](https://developer.apple.com/library/content/documentation/Cocoa/Conceptual/ObjCRuntimeGuide/Introduction/Introduction.html#//apple_ref/doc/uid/TP40008048)
- Apple开源代码：[Objective-C Runtime源码](https://opensource.apple.com/source/objc4/)
- [Objective-C runtime之运行时的基本特点](http://blog.csdn.net/wzzvictory/article/details/8615569)
- [Understanding the Objective-C Runtime](http://cocoasamurai.blogspot.jp/2010/01/understanding-objective-c-runtime.html)
---
layout: post
title: HashMap源码解读(转)
subtitle: 这个也是个基础鸭😝😝😝
date: 2019-02-22
author: 华仔
header-img: img/post-bg-debug.png
catalog: true
published: false
tags:
    - Java
    - 基础知识
    - 源码
---

HashMap简介：
    HashMap在底层数据结构上采用了数组＋链表＋红黑树，通过散列映射来存储键值对数据因为在查询上使用散列码（通过键生成一个数字作为数组下标，这个数字就是hash code）所以在查询上的访问速度比较快，HashMap最多允许一对键值对的Key为Null，允许多对键值对的value为Null。它是非线程安全的。在排序上面是无序的。

 

HashMap的主要成员变量：

transient Node<K,V>[] table：这是一个Node类型的数组（也有称作Hash桶），可以从下面源码中看到静态内部类Node在这边可以看做就是一个节点，多个Node节点构成链表，当链表长度大于8的时候转换为红黑树。



 ![](https://img-blog.csdn.net/20180529155827859)



![](https://img-blog.csdnimg.cn/20181227162958496)

transient int size：表示当前HashMap包含的键值对数量

transient int modCount：表示当前HashMap修改次数

int threshold：表示当前HashMap能够承受的最多的键值对数量，一旦超过这个数量HashMap就会进行扩容

final float loadFactor：负载因子，用于扩容

static final int DEFAULT_INITIAL_CAPACITY = 1 << 4：默认的table初始容量

static final float DEFAULT_LOAD_FACTOR = 0.75f：默认的负载因子

介绍完了重要的几个参数后我们来看看HashMap的构造参数。

 

HashMap的构造方法有四种：

![](https://img-blog.csdn.net/20180529164049237)

    public HashMap(int initialCapacity, float loadFactor) {
        if (initialCapacity < 0)
            throw new IllegalArgumentException("Illegal initial capacity: " +
                                               initialCapacity);
        if (initialCapacity > MAXIMUM_CAPACITY)
            initialCapacity = MAXIMUM_CAPACITY;
        if (loadFactor <= 0 || Float.isNaN(loadFactor))
            throw new IllegalArgumentException("Illegal load factor: " +
                                               loadFactor);
        this.loadFactor = loadFactor;
        this.threshold = tableSizeFor(initialCapacity);
    }

 

    public HashMap(int initialCapacity) {
        this(initialCapacity, DEFAULT_LOAD_FACTOR);
    }

 

    public HashMap() {
        this.loadFactor = DEFAULT_LOAD_FACTOR; // all other fields defaulted
    }

 

    public HashMap(Map<? extends K, ? extends V> m) {
        this.loadFactor = DEFAULT_LOAD_FACTOR;
        putMapEntries(m, false);
    }
    前面三个构造器的区别都是在于指定初始容量以及负载因子，如果你选择默认的构造器那么在创建的时候不会指定threshold的值，而第二个以及第三个构造器在一开始的时候就会根据下面的这个方法来确认threshold值，可以看到下面用到了移位算法（有关内容可以查看博文：Java移位操作符以及按位操作符），最后一个构造器很显然就是把另一个Map的值映射到当前新的Map中这边不再赘述。

 

![](https://img-blog.csdn.net/20180529165142867)




    这边先提下负载因子（loadFactor），源码中有个公式为threshold = loadFactor * 容量。HashMap和HashSet都允许你指定负载因子的构造器，表示当负载情况达到负载因子水平的时候，容器会自动扩容，HashMap默认使用的负载因子值为0.75f（当容量达到四分之三进行再散列（扩容））。当负载因子越大的时候能够容纳的键值对就越多但是查找的代价也会越高。所以如果你知道将要在HashMap中存储多少数据，那么你可以创建一个具有恰当大小的初始容量这可以减少扩容时候的开销。但是大多数情况下0.75在时间跟空间代价上达到了平衡所以不建议修改。

下面将根据默认的构造为出发点，从初始化一个HashMap到使用Get，Put方法进行一些源码解析。

put(K key, V value)：
    在使用默认构造器初始化一个HashMap对象的时候，首次Put键值对的时候会先计算对应Key的hash值通过hash值来确定存放的地址。

![](https://img-blog.csdn.net/20180529174713329?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3UwMTA4OTAzNTg=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)

    紧接着调用了putVal方法，在刚刚初始化之后的table值为null因此程序会进入到resize()方法中。而resize方法就是用来进行扩容的（稍后提到）。扩容后得到了一个table的节点（Node）数组，接着根据传入的hash值去获得一个对应节点p并去判断是否为空，是的话就存入一个新的节点（Node）。反之如果当前存放的位置已经有值了就会进入到else中去。接着根据前面得到的节点p的hash值以及key跟传入的hash值以及参数进行比较，如果一样则替覆盖。如果存在Hash碰撞就会以链表的形式保存，把当前传进来的参数生成一个新的节点保存在链表的尾部（JDK1.7保存在首部）。而如果链表的长度大于8那么就会以红黑树的形式进行保存。
    
    final V putVal(int hash, K key, V value, boolean onlyIfAbsent,
                   boolean evict) {
        Node<K,V>[] tab; Node<K,V> p; int n, i;
        if ((tab = table) == null || (n = tab.length) == 0) //首次初始化的时候table为null
            n = (tab = resize()).length; //对HashMap进行扩容
        if ((p = tab[i = (n - 1) & hash]) == null) //根据hash值来确认存放的位置。如果当前位置是空直接添加到table中
            tab[i] = newNode(hash, key, value, null);
        else {
            //如果存放的位置已经有值
            Node<K,V> e; K k;
            if (p.hash == hash &&
                ((k = p.key) == key || (key != null && key.equals(k))))
                e = p; //确认当前table中存放键值对的Key是否跟要传入的键值对key一致
            else if (p instanceof TreeNode) //确认是否为红黑树
                e = ((TreeNode<K,V>)p).putTreeVal(this, tab, hash, key, value);
            else {//如果hashCode一样的两个不同Key就会以链表的形式保存
                for (int binCount = 0; ; ++binCount) {
                    if ((e = p.next) == null) {
                        p.next = newNode(hash, key, value, null);
                        if (binCount >= TREEIFY_THRESHOLD - 1) // -1 for 1st 判断链表长度是否大于8
                            treeifyBin(tab, hash);
                        break;
                    }
                    if (e.hash == hash &&
                        ((k = e.key) == key || (key != null && key.equals(k))))
                        break;
                    p = e;
                }
            }
                
                if (e != null) { // existing mapping for key
                V oldValue = e.value;
                if (!onlyIfAbsent || oldValue == null)
                    e.value = value; //替换新的value并返回旧的value
                afterNodeAccess(e);
                return oldValue;
            }
        }
        ++modCount;
        if (++size > threshold)
            resize();//如果当前HashMap的容量超过threshold则进行扩容
        afterNodeInsertion(evict);
        return null;
    } 

扩容机制核心方法Node<K,V>[] resize()：
    HashMap扩容可以分为三种情况：

第一种：使用默认构造方法初始化HashMap。从前文可以知道HashMap在一开始初始化的时候会返回一个空的table，并且thershold为0。因此第一次扩容的容量为默认值DEFAULT_INITIAL_CAPACITY也就是16。同时threshold = DEFAULT_INITIAL_CAPACITY * DEFAULT_LOAD_FACTOR = 12。

第二种：指定初始容量的构造方法初始化HashMap。那么从下面源码可以看到初始容量会等于threshold，接着threshold = 当前的容量（threshold） * DEFAULT_LOAD_FACTOR。

第三种：HashMap不是第一次扩容。如果HashMap已经扩容过的话，那么每次table的容量以及threshold量为原有的两倍。

    这边也可以引申到一个问题就是HashMap是先插入数据再进行扩容的，但是如果是刚刚初始化容器的时候是先扩容再插入数据。
    
    final Node<K,V>[] resize() {
        Node<K,V>[] oldTab = table;//首次初始化后table为Null
        int oldCap = (oldTab == null) ? 0 : oldTab.length;
        int oldThr = threshold;//默认构造器的情况下为0
        int newCap, newThr = 0;
        if (oldCap > 0) {//table扩容过
             //当前table容量大于最大值得时候返回当前table
             if (oldCap >= MAXIMUM_CAPACITY) {
                threshold = Integer.MAX_VALUE;
                return oldTab;
            }
            else if ((newCap = oldCap << 1) < MAXIMUM_CAPACITY &&
                     oldCap >= DEFAULT_INITIAL_CAPACITY)
            //table的容量乘以2，threshold的值也乘以2           
            newThr = oldThr << 1; // double threshold
        }
        else if (oldThr > 0) // initial capacity was placed in threshold
        //使用带有初始容量的构造器时，table容量为初始化得到的threshold
        newCap = oldThr;
        else {  //默认构造器下进行扩容  
             // zero initial threshold signifies using defaults
            newCap = DEFAULT_INITIAL_CAPACITY;
            newThr = (int)(DEFAULT_LOAD_FACTOR * DEFAULT_INITIAL_CAPACITY);
        }
        if (newThr == 0) {
        //使用带有初始容量的构造器在此处进行扩容
            float ft = (float)newCap * loadFactor;
            newThr = (newCap < MAXIMUM_CAPACITY && ft < (float)MAXIMUM_CAPACITY ?
                      (int)ft : Integer.MAX_VALUE);
        }
        threshold = newThr;
        @SuppressWarnings({"rawtypes","unchecked"})
            Node<K,V>[] newTab = (Node<K,V>[])new Node[newCap];
        table = newTab;
      if (oldTab != null) {
        //对新扩容后的table进行赋值，条件中的代码删减
        }
        return newTab;
    }
    前文提到负载因子loadFactor保持在0.75f是在时间跟空间上达到一个平衡，实际上也就是说0.75f是效率相对比较高的，下面将贴出测试案例。可以看到同样的初始容量但是负载因子不同的map，map2，map4中map4是最快的，而相同的负载因子初始容量map3，map4中map3的速度更快。
    
    public static void main(String[] args) {
        // TODO Auto-generated method stub
        HashMap<Integer,Integer> map = new HashMap<Integer,Integer>(16,100);
        HashMap<Integer,Integer> map2 = new HashMap<Integer,Integer>(16,0.5f);
        HashMap<Integer,Integer> map3 = new HashMap<Integer,Integer>(100);    
        HashMap<Integer,Integer> map4 = new HashMap<Integer,Integer>();    
        DateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmss:SS");
        Date d = new Date();
        System.out.println(sdf.format(d));
        for(int i = 0 ; i<5000000;i++){
            map.put(i, i);
        }
        Date d2 = new Date();
        System.out.println(sdf.format(d2));
        Date d3 = new Date();
        System.out.println(sdf.format(d3));
        for(int i = 0 ; i<5000000;i++){
            map2.put(i, i);
        }
        Date d4 = new Date();
        System.out.println(sdf.format(d4));
        Date d5 = new Date();
        System.out.println(sdf.format(d5));
        for(int i = 0 ; i<5000000;i++){
            map3.put(i, i);
        }
        Date d6 = new Date();
        System.out.println(sdf.format(d6));
        Date d7 = new Date();
        System.out.println(sdf.format(d7));
        for(int i = 0 ; i<5000000;i++){
            map4.put(i, i);
        }
        Date d8 = new Date();
        System.out.println(sdf.format(d8));
    }
20180705152534:83
20180705152546:87
20180705152546:87
20180705152550:643
20180705152550:643
20180705152552:980
20180705152552:980
20180705152556:132
get(Object key)：
    先前HashMap通过hash code来存放数据，那么get方法一样要通过hash code来获取数据。可以看到如果当前table没有数据的话直接返回null反之通过传进来的hash值找到对应节点（Node）first，如果first的hash值以及Key跟传入的参数匹配就返回对应的value反之判断是否是红黑树，如果是红黑树则从根节点开始进行匹配如果有对应的数据则结果否则返回Null，如果是链表的话就会循环查询链表，如果当前的节点不匹配的话就会从当前节点获取下一个节点来进行循环匹配，如果有对应的数据则返回结果否则返回Null。

![img](https://img-blog.csdn.net/20180529190316241?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3UwMTA4OTAzNTg=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)

    final Node<K,V> getNode(int hash, Object key) {
        Node<K,V>[] tab; Node<K,V> first, e; int n; K k;
        //如果当前table没有数据的话返回Null
        if ((tab = table) != null && (n = tab.length) > 0 &&
            (first = tab[(n - 1) & hash]) != null) {
            //根据当前传入的hash值以及参数key获取一个节点即为first,如果匹配的话返回对应的value值
            if (first.hash == hash && // always check first node
                ((k = first.key) == key || (key != null && key.equals(k))))
                return first;
            //如果参数与first的值不匹配的话
            if ((e = first.next) != null) {
                //判断是否是红黑树，如果是红黑树的话先判断first是否还有父节点，然后从根节点循环查询是否有对应的值
                if (first instanceof TreeNode)
                    return ((TreeNode<K,V>)first).getTreeNode(hash, key);
                do {
                //如果是链表的话循环拿出数据
                if (e.hash == hash &&
                        ((k = e.key) == key || (key != null && key.equals(k))))
                        return e;
                } while ((e = e.next) != null);
            }
        }
        return null;
    }

---------------------
作者：u010890358 
来源：CSDN 
原文：https://blog.csdn.net/u010890358/article/details/80496144 
版权声明：本文为博主原创文章，转载请附上博文链接！
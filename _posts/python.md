## 一. range
range(10)	0,1,…,9
range(1, 10)	1, 2, … 9
range(1, 10, 2)	1,3,5,7,9

## 二. list fruits = ['grape', 'apple', 'strawberry', 'waxberry']
### 1. 通过enumerate函数处理列表之后再遍历可以同时获得元素索引和值 for index, elem in enumerate(list1):
### 2. 切片(左闭右开)：fruits2 = fruits[1:4] 返回结果 apple strawberry waxberry
### 3. 倒转、反向切片：fruits5 = fruits[::-1] 返回结果 ['waxberry', 'strawberry', 'apple', 'grape']
### 4. 排序：（a）倒序 list3 = sorted(list1, reverse=True) （b）根据字符串长度排序 list4 = sorted(list1, key=len) (c)直接在对象上排序，改变原始对象 list1.sort(reverse=True)
### 5. 生成式和生成器：一个空间、一个时间
- 1. 用列表的生成表达式语法创建列表容器，这种语法创建列表之后元素已经准备就绪所以需要耗费较多的内存空间
f = [x ** 2 for x in range(1, 1000)]
print(sys.getsizeof(f))  # 查看对象占用内存的字节数
print(f) 会打印出真实的元素
- 2. 请注意下面的代码创建的不是一个列表而是一个生成器对象，通过生成器可以获取到数据但它不占用额外的空间存储数据，每次需要数据的时候就通过内部的运算得到数据(需要花费额外的时间)
f = (x ** 2 for x in range(1, 1000))
print(sys.getsizeof(f))  # 相比生成式生成器不占用存储数据的空间
print(f) 不会打印真实元素
for val in f:每次运算得到数据
    print(val)

## 三. tuple: 与list不同之处在于元组的元素不能修改
t = ('骆昊', 38, True, '四川成都')
- 1. 元素不可修改：# t[0] = '王大锤'  # TypeError； list可以修改 fruits[0]='orange'
- 2. 回收：变量t重新引用了新的元组原来的元组将被垃圾回收 t = ('王大锤', 20, True, '云南昆明')
- 3. list与tuple互转：# person = list(t)； fruits_tuple = tuple(fruits_list)
### tuple优点
- 1. 不可变，对于多线程更加合适。因为不可修改，自动就是线程安全的
- 2. tuple创建时间和空间占用都由于list

## 四. dict字典
- 1. 创建：scores = {'骆昊': 95, '白元芳': 78, '狄仁杰': 82}，items2 = dict(zip(['a', 'b', 'c'], '123'))，items3 = {num: num ** 2 for num in range(1, 10)}
- 2. 遍历
scores.get('武则天', 60): 可以设置默认值
for key in scores:
    print(f'{key}: {scores[key]}')
- 3. 更新：scores['白元芳'] = 65, scores.update(冷面=67, 方启鹤=85)
- 4. 删除 print(scores.popitem()), print(scores.pop('骆昊', 100))

## 五. 函数
- 1. 函数命名冲突：Python没有函数重载的概念，那么后面的定义会覆盖之前的定义，也就意味着两个函数同名函数实际上只有一个是存在的，用import来明确是哪个模块的函数
- 2. 导入模块，执行问题：如果我们导入的模块除了定义函数之外还中有可以执行代码，那么Python解释器在导入这个模块时就会执行这些代码。通过
if __name__ == '__main__':
    #执行代码快
    print('sss')
来解决，将代码放在main中，只有直接执行改模块，才会执行main。
- 3. 变量作用域
def foo():
    b = 'hello'

    # Python中可以在函数内部再定义函数
    def bar():
        c = True
        print(a)
        print(b)
        print(c)

    bar()
    # print(c)  # NameError: name 'c' is not defined

if __name__ == '__main__':
    a = 100
    # print(b)  # NameError: name 'b' is not defined
    foo()
- - 1. a是一个全局变量（global variable），属于全局作用域，因为它没有定义在任何一个函数中
- - 2. Python查找一个变量时会按照“局部作用域”、“嵌套作用域”、“全局作用域”和“内置作用域”的顺序进行搜索
def foo():
    a = 200
    print(a)  # 200

if __name__ == '__main__':
    a = 100
    foo()
    print(a)  # 100
在调用foo函数后，我们发现a的值仍然是100，这是因为当我们在函数foo中写a = 200的时候，是重新定义了一个名字为a的局部变量，它跟全局作用域的a并不是同一个变量，因为局部作用域中有了自己的变量a，因此foo函数不再搜索全局作用域中的a。如果我们希望在foo函数中修改全局作用域中的a，代码如下所示
def foo():
    global a
    a = 200
    print(a)  # 200
- - 3. 闭包：https://zhuanlan.zhihu.com/p/22229197

## 六. 对象 https://github.com/jackfrued/Python-100-Days/blob/master/Day01-15/09.面向对象进阶.md
- 1. 在Python中，属性和方法的访问权限只有两种，也就是公开的和私有的，私有的用两个下划线作为开头：变量 self.__foo， 方法def __bar(self):
(1). 其实即便私有的，也是可以访问的：test._Test__foo
(2). 一般不设置私有变量，可以单下划线作为开头表示暗示或隐喻的保护，不是语法上的规则
- 2. property修饰符
(1).只有@property表示只读。
(2).同时有@property和@*.setter表示可读可写。
(3).同时有@property和@*.setter和@*.deleter表示可读可写可删除
- 3. slots 
如果我们需要限定自定义类型的对象只能绑定某些属性，可以通过在类中定义__slots__变量来进行限定。需要注意的是__slots__的限定只对当前类的对象生效，对子类并不起任何作用 
   #限定Person对象只能绑定_name, _age和_gender属性
    __slots__ = ('_name', '_age', '_gender')
- 4. 静态方法 @staticmethod：调用时不会创建对象（不会执行__init__等方法）
    @staticmethod
    def is_valid(a, b, c):
- 5. 继承和多态 见github链接
## 七、参数传递：https://www.zhihu.com/question/20591688
对于list，这种传递方式“items = origin_items[:]” 不会改变原有值，相当于items是新的内存；但是np.array则相反“item=np.array()” 如果item改变，原始值会发生改变，因此要用copy方法。
 
## 八、matplot
https://zhuanlan.zhihu.com/p/93423829
## 九、numpy
1. 
（1）np.array“item=np.array()” 如果item改变，原始值会发生改变，因此要用copy方法；
（2）b=a.T，抓组转置修改会改变原数组；
（3）b = a.flatten()多维数组变成一维，是复制，b改变不会改变a
（4）数组自带的flat属性则会改变原始值：b = a.flat b会影响a
（5）b = a.ravel()作用类似flat，b会影响a；但是aa = a.transpose()，b = aa.ravel()这样b就不会改变a，但是flat则不行
2. item.shape改变item形状，但是item.reshape则是返回新的array
---
layout:     post
title:      Tensorflow的使用
subtitle:   ＴensorFlow
date:       2018-06-12
author:     徐清华
header-img: img/post-bg-ios9-web.jpg
catalog: 	 true
tags:
    - TensorFlow
---

>Tensorflow 是谷歌开发的一款主要用于深度学习的强大工具.其功能涵盖了深度学习从数据获取,数据解析,模型建立,模型训练,模型预测的全过程.本文将会根据[这篇官方教程](https://www.tensorflow.org/programmers_guide/low_level_intro)对tensorflow进行简单的介绍.

# Basics

#### Tensor Values
&emsp;&emsp;Tensorflow中数据单元的核心概念是**张量(tensor)**.一个张量由一组数据组成,这组数据以多维数组的形式进行存储.一个张量的**秩(rank)**指的是数组的维度的个数,**形状(shape)**指的是描述各个维度大小的整数组成的数对.TensorFlow中使用numpy的数组来表示张量的值.

```3. # a rank 0 tensor; a scalar with shape [],
[1., 2., 3.] # a rank 1 tensor; a vector with shape [3]
[[1., 2., 3.], [4., 5., 6.]] # a rank 2 tensor; a matrix with shape [2, 3]
[[[1., 2., 3.]], [[7., 8., 9.]]] # a rank 3 tensor with shape [2, 1, 3]
```

#### Graph
&emsp;&emsp;一个可计算的图是由一系列Tensorflow的操作组成的.该图应该包括两中组件:
&emsp;&emsp;&emsp;&emsp;1.操作(Operations).图中的每个节点都是操作.操作描述了使用和生成tensor的过程.

&emsp;&emsp;&emsp;&emsp;2.张量(Tensors).图中的每条边表示张量.这些张量表示的数据将会按照图中的执行顺序进行传递.TensorFlow的大部分的函数的返回值都是张量.**注意:张量并不直接包含任何数值,只是构筑图的过程中的占位符!!!**

&emsp;&emsp;下面给出一个具体的例子进行说明:

```
a = tf.constant(3.0, dtype=tf.float32)
b = tf.constant(4.0) # also tf.float32 implicitly
total = a + b
print(a)
print(b)
print(total)
```

&emsp;&emsp;上述语句的执行结果如下:

```
Tensor("Const:0", shape=(), dtype=float32)
Tensor("Const_1:0", shape=(), dtype=float32)
Tensor("add:0", shape=(), dtype=float32)
```

&emsp;&emsp;&emsp;&emsp;可以看出,打印出来的tensor并没有直接打印出3.0,4.0,7.0的值.上述的代码仅仅构建了一个可计算的图.**这些tensor都将会用来展示operation的执行结果**.例如tensor a的第一个参数就表示该tensor是操作Const:0 执行完成之后的结果.

&emsp;&emsp;另外,图中的每一个操作都有一个独一无二的名字.这个名字是和python中的变量名有所区别的.tensor的命名规则是:产生该tensor的操作名称+输出下标.例如add:0的含义是add操作的第一个输出.

#### TensorBoard

&emsp;&emsp;Tensorflow提供一个非常强大的工具叫Tensorboard.它最强大的功能之一就是能够可视化的展示一个可计算的图.具体的操作过程如下:

&emsp;&emsp;&emsp;&emsp;1.首先,将可计算的图模型保存到Tensorboard文件.

```
writer = tf.summary.FileWriter('.')
writer.add_graph(tf.get_default_graph())
```

&emsp;&emsp;上述指令会在当前目录下生成如下格式的文件:

```
events.out.tfevents.{timestamp}.{hostname}
```

&emsp;&emsp;2.然后在命令行中使用如下指令用于开启tensorboard的服务

```
tensorboard --logdir .
```

&emsp;emsp;3.将上一步的命令执行结果中的网址,输入到浏览器中将会看到如下的图:

![image.png](https://upload-images.jianshu.io/upload_images/12011882-f20c99dd7f08e467.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#### Session
&emsp;&emsp;为了完成张量的计算,需要创建tf.Session对象.一个session对象封装了tensorflow运行时的所有状态,并且能够真正的执行tensorflow的操作.如果说tf.Graph是一个python程序的源代码,那么tf.Session就像是可执行程序.
&emsp;&emsp;接下来的程序代码将会创建一个session对象并且调用它的run函数,来计算之前设计的tensor值

```
sess = tf.Session()
print(sess.run(total))
```
&emsp;&emsp;上述代码执行的结果是:7.0.我们可以把多个tensor放到session.run中执行.run函数封装了对于tuple的输入,例如:

```
print(sess.run({'ab':(a, b), 'total':total}))
```

&esmp;&emsp;执行的结果是

```
{'total': 7.0, 'ab': (3.0, 4.0)}
```

&emsp;&emsp;在run函数的执行过程中,每一个tensor都有唯一的值.例如下面的这段程序将会掉哟里能够tf.random_uniform来构造一个能够生成随机三维向量的tensor.(取值范围在0到1之间)

```
vec = tf.random_uniform(shape=(3,))
out1 = vec + 1
out2 = vec + 2
print(sess.run(vec))
print(sess.run(vec))
print(sess.run((out1, out2)))
```

&emsp;&emsp;上述代码的执行结果如下:

```
[ 0.52917576  0.64076328  0.68353939]
[ 0.66192627  0.89126778  0.06254101]
(
  array([ 1.88408756,  1.87149239,  1.84057522], dtype=float32),
  array([ 2.88408756,  2.87149239,  2.84057522], dtype=float32)
)
```

&emsp;&emsp;值得一提的是,有些tensorflow的方法的返回值是operation而不是tensor.将operation放到session.run()函数中执行的话,会产生副作用而不是直接得到返回的效果哦. **例子如下[initialization](https://www.tensorflow.org/programmers_guide/low_level_intro#Initializing%20Layers),  [training](https://www.tensorflow.org/programmers_guide/low_level_intro#Training) 都是operation的典型代表.**

#### Feeding
&emsp;&emsp;根据前文的介绍,相信你应该已经能够发现一个问题:tensorflow的graph总是会产生一个常数的结果.除此之外,图还能够能接受常数作为输入,这就是placeholder.每一个placeholder都表示能够在后续的计算运行过程中提供一个值,这一点和函数的输入参数有些类似.

```
x = tf.placeholder(tf.float32)
y = tf.placeholder(tf.float32)
z = x + y
```

&emsp;&emsp;在定义了placeholder之后,我们可以在调用session.run()函数的时候输入参数feed_dict.如下:
```
print(sess.run(z, feed_dict={x: 3, y: 4.5}))
print(sess.run(z, feed_dict={x: [1, 3], y: [2, 4]}))
```

&emsp;&emsp;执行结果如下:

```
7.5
[ 3.  7.]
```
&emsp;&emsp;值得一提的一点是,feed_dict这个参数的设置可以用来改变图中任何一个tensor的值.因此placeholder和任何其他tensor的区别在于placeholder如果没有被初始化将会报错.

#### Datasets
&emsp;&emsp;前文提到placeholder仅仅对于普通的任务有用,如果是一个数据量巨大的任务,上述的方法就显得力不从心了.因此,tensorflow中还存在另外一个机制:datasets.使用dataset就能够实现数据的流输入.而有了dataset之后,如果想要得到可执行的tensor需要首先将dataset转换成tf.data.Iterator.然后调用Iterator的get_next()函数来获取tensor.最简单的获取iterator的方法是调用make_one_shot_iterator方法.以下面的代码为例,这个叫next_item的张量在每次调用run函数时都会返回my_data中的一行数据.

```
my_data = [
    [0, 1,],
    [2, 3,],
    [4, 5,],
    [6, 7,],
]
slices = tf.data.Dataset.from_tensor_slices(my_data)
next_item = slices.make_one_shot_iterator().get_next()
```

&emsp;&emsp;注意,在接近数据流的末尾的时候,将会导致Dataset跑出越界异常.举例来说,下面的代码在读取到最后无数据可读的时候将会抛出异常.

```
while True:
  try:
    print(sess.run(next_item))
  except tf.errors.OutOfRangeError:
    break
```

&emsp;&emsp;如果Dataset的生成依赖于之前的操作,那么需要首先对该iterator进行初始化才能够后续进行使用.

```
r = tf.random_normal([10,3])
dataset = tf.data.Dataset.from_tensor_slices(r)
iterator = dataset.make_initializable_iterator()
next_row = iterator.get_next()

sess.run(iterator.initializer)
while True:
  try:
    print(sess.run(next_row))
  except tf.errors.OutOfRangeError:
    break
```
#### Layers

&emsp;&emsp;根据学习理论,一个可训练的模型应该能够是可调节的,通过调节模型,使得对于相同的输入能够给出不同的结果.从而和真实的结果逼近.Layers就是在模型中增加可调节参数的主要手段之一.

&emsp;&emsp;Layers能够将变量和变量之上的操作打包.举例来说, [densely-connected layer](https://developers.google.com/machine-learning/glossary/#fully_connected_layer)实现了对所有输入的加权求和并且取激活函数.这些连接权重和偏倚就是通过layer的对象来管理的.layer的使用应该包括以下过程:

&emsp;&emsp;&emsp;&emsp;1.创建layer.下面的代码创建了一个Dense layer.该层能够接收1个batch的输入向量,然后为每个输入向量生成一个输出向量.layer的使用方法和函数很类似,直接调用即可.

```
x = tf.placeholder(tf.float32, shape=[None, 3])
linear_model = tf.layers.Dense(units=1)
y = linear_model(x)
```

&emsp;&emsp;&emsp;&emsp;layer需要检查他的输入来确定输出的内部向量的维度.所以,在这里我们必须 设置x的shape使得layer能够正确的输出.现在我们已经定义了输出的计算值为y,只剩下一个需要解决的细节我们就可以执行这个计算了.

&emsp;&emsp;&emsp;&emsp;2.初始化layer.layer包含的变量在使用之前必须进行初始化.尽管你可以一个一个的对变量进行初始化.但是我们在tensorflow中更常用的做法是使用如下函数对所有的变量一起进行初始化.

```
init = tf.global_variables_initializer()
sess.run(init)
```

&emsp;&emsp;&emsp;&emsp;值得注意的是,tf.global_variables_initializer只创建并且返回operation的接口(而不是tensor).这个操作能够对所有的变量进行初始化.此外,该方法仅仅对于在它调用之前已经定义的变量奏效,因此该方法的调用一般会放在整个程序的末尾.

&emsp;&emsp;3.执行layer.现在layer已经完成了初始化.我们可以通过执行linear_model的tensor来输出结果了.

```
print(sess.run(y, {x: [[1, 2, 3],[4, 5, 6]]}))
```
&emsp;&emsp;&emsp;&emsp;上述代码的执行结果如下:

```
[[-3.41378999]
 [-9.14999008]]
```
&emsp;&emsp;&emsp;&emsp;4.layer的简便写法.对于每一个layer类,tensorflow都提供了一个快捷写法(就是大写变小写???????).这两种写法的唯一区别在于简化版本的写法创建和运行在一条语句就可以完成.但是这样写的话就会损失layer的重用性,也无法进行调试.谨慎使用.

```
x = tf.placeholder(tf.float32, shape=[None, 3])
y = tf.layers.dense(x, units=1)

init = tf.global_variables_initializer()
sess.run(init)

print(sess.run(y, {x: [[1, 2, 3], [4, 5, 6]]}))
```

#### Feature columns

&emsp;&emsp;feature columns 实际上是特征的取值范围.最简单的例子来源于tf.feature_column.input_layer函数的使用.这个函数只接受dense column作为输入.所以为了能够查看catagorical column的结果,我们必须把它封装在tf.feature_column.indicator_column中.

```
features = {
    'sales' : [[5], [10], [8], [9]],
    'department': ['sports', 'sports', 'gardening', 'gardening']}

department_column = tf.feature_column.categorical_column_with_vocabulary_list(
        'department', ['sports', 'gardening'])
department_column = tf.feature_column.indicator_column(department_column)

columns = [
    tf.feature_column.numeric_column('sales'),
    department_column
]

inputs = tf.feature_column.input_layer(features, columns)
```

&emsp;&emsp;运行上述代码将会得到特征的编码(完成了自动编码的过程,还有一些其他的封装).此外,像layer一样,feature columns也可以有中间状态.所以需要提前初始化!**Catagorical的数据在内部使用了查找表的方式进行存储,所以在初始化的时候有自己独特的初始化函数**

```
var_init = tf.global_variables_initializer()
table_init = tf.tables_initializer()
sess = tf.Session()
sess.run((var_init, table_init))
```

&emsp;&emsp;一旦中间状态被初始化了.那么你就可以想任何其他的tensor一样直接打印执行结果了.

```
print(sess.run(inputs))
```
&emsp;&emsp;该语句的执行结果如下,可以看出类别都是用了one-hot的编辑方式进行了编码表示.

```
[[  1.   0.   5.]
 [  1.   0.  10.]
 [  0.   1.   8.]
 [  0.   1.   9.]]
```
&emsp;&emsp;忍不住赞叹一句666666666666666666666,想人所想,急人所急!

---

#### 6 Training
&emsp;&emsp;经过前面的介绍之后,我们应该对tensorflow的主要功能有了一些认识.下面将会训练一个小型的回归模型来练习一下.

&emsp;&emsp;&emsp;&emsp;1.获取数据.以x作为输入的数据,而y作为输出的真实值.

```
x = tf.constant([[1], [2], [3], [4]], dtype=tf.float32)
y_true = tf.constant([[0], [-1], [-2], [-3]], dtype=tf.float32)
```

&emsp;&emsp;&emsp;&emsp;2.定义模型.首先建立一个简单的线性模型,该模型只有一个输出.

```
linear_model = tf.layers.Dense(units=1)

y_pred = linear_model(x)
```

&emsp;&emsp;&emsp;&emsp;可以通过下列方法获取预测的值.

```
sess = tf.Session()
init = tf.global_variables_initializer()
sess.run(init)

print(sess.run(y_pred))
```
&emsp;&emsp;&emsp;&emsp;由于模型没有经过训练,所以输出结果很差.下文中的教程将会继续完成训练的过程.

```
[[ 0.02631879]
 [ 0.05263758]
 [ 0.07895637]
 [ 0.10527515]]
```

#### 损失函数

&emsp;&emsp;为了能够优化一个模型,我们首先需要定义一个损失函数,在这里我们使用的是均方误差作为损失函数.而均方误差函数在tensorflow中是可以直接拿来用的.

```
loss = tf.losses.mean_squared_error(labels=y_true, predictions=y_pred)

print(sess.run(loss))
```

&emsp;&emsp;上述代码的执行结果为2.23962.显然效果还不够好,所以需要进一步的训练才能够得到较为满意的结果.

#### 训练

&emsp;&emsp;tensorflow中使用的优化器(optimizer)都是实现的标准的优化函数,都在tf.train.Optimizer中作为一个单独的子类.这些优化器能够做到优化模型的参数,从而减少损失值.这其中最简单的就是梯度下降.梯度下降通过将每个变量都根据梯度成比例的更新的方法来实现模型的优化调整.

```
optimizer = tf.train.GradientDescentOptimizer(0.01)
train = optimizer.minimize(loss)
```

&emsp;&emsp;这段代码设计了一个图的组件,并且返回了一个可执行的过程.当这个过程被执行的时候,图中的变量值将会被更新.

```
for i in range(100):
  _, loss_value = sess.run((train, loss))
  print(loss_value)
```

&emsp;&emsp;可以观察到,train 是个操作而不是一个tensor,并没有返回任何数值.因此我们同时执行了loss tensor就是想得到loss值进行打印.打印的结果如下:

```
1.35659
1.00412
0.759167
0.588829
0.470264
0.387626
0.329918
0.289511
0.261112
0.241046
...
```


#### 完整的demo程序

```
x = tf.constant([[1], [2], [3], [4]], dtype=tf.float32)
y_true = tf.constant([[0], [-1], [-2], [-3]], dtype=tf.float32)

linear_model = tf.layers.Dense(units=1)

y_pred = linear_model(x)
loss = tf.losses.mean_squared_error(labels=y_true, predictions=y_pred)

optimizer = tf.train.GradientDescentOptimizer(0.01)
train = optimizer.minimize(loss)

init = tf.global_variables_initializer()

sess = tf.Session()
sess.run(init)
for i in range(100):
  _, loss_value = sess.run((train, loss))
  print(loss_value)

print(sess.run(y_pred))
```


---

# Graphs and Sessions

---

# Tensors

---

# Variables

---

# TensorBoard

---

# Importing Data

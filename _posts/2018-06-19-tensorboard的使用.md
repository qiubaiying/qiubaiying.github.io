---
layout:     post
title:      Tensorboard的使用
subtitle:   ＴensorBoard
date:       2018-06-19
author:     徐清华
header-img: img/post-bg-ios9-web.jpg
catalog: 	 true
tags:
    - TensorFlow
    - TensorBoard
---


> TensorBoard是通过读取tensorflow产生的事件文档来运行的．这些文档中包含着代码运行过程中产生的总结信息．下面本文将会对tensorboard进行详细的介绍．

# １.生命周期

&emsp;&emsp;首先，创建想要收集数据的tensorflow graph,然后指明想要收集数据的节点．summary是一个operation.[收集操作](https://www.tensorflow.org/api_guides/python/summary).

&emsp;&emsp;例如，假设你在ＭNIST数据集上训练卷积神经网络．你呢，想记录随着学习的深入，学习率的变化程度哟，还有目标函数的变化哟．想要收集这些信息呢，就需要使用 [`tf.summary.scalar`](https://www.tensorflow.org/api_docs/python/tf/summary/scalar) ．然后呢就要给这些总结信息 `scalar_summary`一个相对比较有意义的标签 `tag`,例如 `'learning rate'` ，`'loss function'`.等等

&emsp;&emsp;也许呢，你还想可视化的观察一下某一层的激活函数的输出情况，或者是梯度和权重的分布情况．我们可以通过 [`tf.summary.histogram`](https://www.tensorflow.org/api_docs/python/tf/summary/histogram) 来收集这些信息．想要对这些总总结信息有更深入的了解，就需要查看一下文档． [summary operations](https://www.tensorflow.org/api_guides/python/summary).

&emsp;&emsp;Tensorflow中的operation在运行之前什么都不会做．当然，如果你运行这个operation的一个下行operation也是可以触发这个operation的运行的．Summary的节点是外围节点，没有任何的操作节点是需要依赖这些节点的．因此，我们需要把这些总结节点一个个的自己运行完，这很烦呀，所以有个快捷键．[`tf.summary.merge_all`](https://www.tensorflow.org/api_docs/python/tf/summary/merge_all) 可以将这些节点合并成一个节点，然后运行这个节点就好啦．具体运行的方法是使用writer.add_summary触发．触发一次就可以写入这一批执行的信息，不多不少．然后每次运行的时候都会产生输出信息，把这个节点传给[`tf.summary.FileWriter`](https://www.tensorflow.org/api_docs/python/tf/summary/FileWriter)就可以写入到文件当中．

&emsp;&emsp; `FileWriter` 使用logdir作为输入参数．这个参数可以说是非常重要的．所有的输出信息都会在这个目录中输出．同时，还可以选择graph作为参数．通过接收graph，tensorboard就可以将整个图像进行可视化的展示啦． [Tensor shape information](https://www.tensorflow.org/programmers_guide/graph_viz#tensor-shape-information).

&emsp;&emsp;现在，你就可以修改你的graph增加一个`FileWriter`了,如果你愿意的话，你就可以在每一步都进行一下summary 的操作，然后把每一步的信息都显示出来．不过最好呢，是每隔n步再进行一次信息的总结．下面是 [simple MNIST tutorial](https://github.com/tensorflow/tensorflow/blob/master/tensorflow/examples/tutorials/mnist/mnist.py)的一个简单的改编版本的代码,在代码中我们增加了一些总结的操作，每隔10步就会执行一次．运行`tensorboard --logdir=/tmp/tensorflow/mnist`, 你就可以看到可视化的数据．源代码在[这里](https://www.github.com/tensorflow/tensorflow/blob/r1.8/tensorflow/examples/tutorials/mnist/mnist_with_summaries.py).

```
def variable_summaries(var):
  """Attach a lot of summaries to a Tensor (for TensorBoard visualization)."""
  with tf.name_scope('summaries'):
    mean = tf.reduce_mean(var)
    tf.summary.scalar('mean', mean)
    with tf.name_scope('stddev'):
      stddev = tf.sqrt(tf.reduce_mean(tf.square(var - mean)))
    tf.summary.scalar('stddev', stddev)
    tf.summary.scalar('max', tf.reduce_max(var))
    tf.summary.scalar('min', tf.reduce_min(var))
    tf.summary.histogram('histogram', var)

def nn_layer(input_tensor, input_dim, output_dim, layer_name, act=tf.nn.relu):
  """Reusable code for making a simple neural net layer.

  It does a matrix multiply, bias add, and then uses relu to nonlinearize.
  It also sets up name scoping so that the resultant graph is easy to read,
  and adds a number of summary ops.
  """
  # Adding a name scope ensures logical grouping of the layers in the graph.
  with tf.name_scope(layer_name):
    # This Variable will hold the state of the weights for the layer
    with tf.name_scope('weights'):
      weights = weight_variable([input_dim, output_dim])
      variable_summaries(weights)
    with tf.name_scope('biases'):
      biases = bias_variable([output_dim])
      variable_summaries(biases)
    with tf.name_scope('Wx_plus_b'):
      preactivate = tf.matmul(input_tensor, weights) + biases
      tf.summary.histogram('pre_activations', preactivate)
    activations = act(preactivate, name='activation')
    tf.summary.histogram('activations', activations)
    return activations

hidden1 = nn_layer(x, 784, 500, 'layer1')

with tf.name_scope('dropout'):
  keep_prob = tf.placeholder(tf.float32)
  tf.summary.scalar('dropout_keep_probability', keep_prob)
  dropped = tf.nn.dropout(hidden1, keep_prob)

# Do not apply softmax activation yet, see below.
y = nn_layer(dropped, 500, 10, 'layer2', act=tf.identity)

with tf.name_scope('cross_entropy'):
  # The raw formulation of cross-entropy,
  #
  # tf.reduce_mean(-tf.reduce_sum(y_ * tf.log(tf.softmax(y)),
  #                               reduction_indices=[1]))
  #
  # can be numerically unstable.
  #
  # So here we use tf.losses.sparse_softmax_cross_entropy on the
  # raw logit outputs of the nn_layer above.
  with tf.name_scope('total'):
    cross_entropy = tf.losses.sparse_softmax_cross_entropy(labels=y_, logits=y)
tf.summary.scalar('cross_entropy', cross_entropy)

with tf.name_scope('train'):
  train_step = tf.train.AdamOptimizer(FLAGS.learning_rate).minimize(
      cross_entropy)

with tf.name_scope('accuracy'):
  with tf.name_scope('correct_prediction'):
    correct_prediction = tf.equal(tf.argmax(y, 1), tf.argmax(y_, 1))
  with tf.name_scope('accuracy'):
    accuracy = tf.reduce_mean(tf.cast(correct_prediction, tf.float32))
tf.summary.scalar('accuracy', accuracy)

# Merge all the summaries and write them out to /tmp/mnist_logs (by default)
merged = tf.summary.merge_all()
train_writer = tf.summary.FileWriter(FLAGS.summaries_dir + '/train',
                                      sess.graph)
test_writer = tf.summary.FileWriter(FLAGS.summaries_dir + '/test')
tf.global_variables_initializer().run()
```

&esmp;&emsp;剩下的部分需要介绍的就不是很多啦．

&esmp;&emsp;&esmp;&emsp;1.`name_scope`对变量进行分类有助于在tensorboard中进行查看

&esmp;&emsp;&esmp;&emsp;2.session 是可以保存和恢复的

&esmp;&emsp;&esmp;&emsp;3.meta_data是运行时的统计信息，包括运行内存啦什么的．

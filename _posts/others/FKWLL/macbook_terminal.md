# Step1
设置bash文件，不同人的bash文件不一样
```
vim ~/.bashrc
```
# Step2
在里面加入
```
export http_proxy="http://127.0.0.1:1087"
export https_proxy="http://127.0.0.1:1087"
```
其中127.0.0.1是默认的IP， 1087是代理的端口号
端口号的查看示例，以ShadowSocks为例：
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200216223750685.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80MzA4NTY5NA==,size_16,color_FFFFFF,t_70)


![在这里插入图片描述](https://img-blog.csdnimg.cn/20200216223842556.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80MzA4NTY5NA==,size_16,color_FFFFFF,t_70)

# Step3
重新打开terminal，或者
```
source ~/.bashrc
```

# Step4
terminal的代理连接是和SSR的PAC模式对应的，如果切换成别的模式，可能会connect失败
# 注意：端口号一定要写对！！！


# 效果
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200224111502939.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80MzA4NTY5NA==,size_16,color_FFFFFF,t_70)
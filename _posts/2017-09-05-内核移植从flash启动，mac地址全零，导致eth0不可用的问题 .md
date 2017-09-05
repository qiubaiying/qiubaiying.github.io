---
layout:     post
title:      内核移植从flash启动，mac地址全零，导致eth0不可用的问题
subtitle:   学习嵌入式系统刚刚开始，理论基础欠缺，所以导致在实际移植遇到问题比较难解决。
date:       2017-09-05
author:     Shuaiqijun
header-img: img/post-bg-hacker.jpg
catalog: true
tags:
    - Linux
    - Uboot
---

学习嵌入式系统刚刚开始，理论基础欠缺，所以导致在实际移植遇到问题比较难解决。想熟悉流程，先按照网上的
一些介绍文章移植了u－boot，移植了2.4.21的内核。系统跑起来了，但是发现一个问题，简单的说就是eth0不可用，这样target
board无法与server连通，nfs和tftp都是不可用的，以后的嵌入式软件移植不可能仅仅通过串口连接完成。所以必须解决这个问题，从网上搜
索，没有发现有价值的东西。在CU上咨询，a－ki给我了很多好的建议，使得这个问题最终得到了解决。
－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－
## 问题：u-boot从flash启动后ethaddr无效，导致eth0无效。
环境：移植到at91rm9200，u-boot的版本为 1.1.1
具体过程如下：
u-boot移植运行正常，过程就不叙述了。在u-boot运行正常的情况下，准备移植内核：
大体上的规划如下：

```bash
0x0000 0000
           INTERNAL　ROM（128K　BYTES） 
0x1000 0000（第0扇区）
           boot.bin       FLASH 
0x1001 0000（第0扇区）
          uboot.gz        FLASH 
0x1002 0000（第1扇区）
          ulmage          FLASH 
0x1012 0000（第9扇区）
          ramdisk         FLASH 
0x107E 0000（第63扇区）
　　　u-boot环境变量     FLASH 
0x2000 0000
                         SDRAM 
0x2100 0000
         ulmage          SDRAM 
0x2110 0000
        ramdisk          SDRAM
我采用的是第一种，在终端设定环境变量。具体如下：
u－boot>setenv ipaddr 192.168.1.100          ＃设定目标板ip
u－boot>setenv serverip 192.168.1.106        ＃主机ip
u－boot>setenv ethaddr 00:00:00:00:ff:01     ＃设定目标板mac地址
u－boot>saveenv                              ＃保存环境变量
u－boot>tftpboot 20000000 boot.bin           ＃采用tftp协议，将boot.bin下载到20000000的SDRAM
u－boot>protect off 1:0                      ＃除保护
u－boot>erase 1:0                            ＃清除bank1的第0扇区
u－boot>cp.b 20000000 10000000 2984          ＃把boot.bin从ram复制到flash区10000000处，2984为boot.bin的大小（16进制）
u－boot>tftpboot 20000000 u-boot.bin.gz      ＃同上
u－boot>cp.b 20000000 10010000 aacf
然后更换引脚，设为片外启动。断电重启，这是u-boot从flash开始引导，出现提示符，设定环境变量使过程自动化：
u－boot>setenv bootargs root=/dev/ram rw initrd=0x21100000,6000000 ramdisk_size=15360 console=ttyS0,115200 mem=32M
u－boot>setenv bootcmd tftpboot 21100000 ramdisk-rmk7\;tftpboot 21000000 uImage\;bootm 21000000
u－boot>saveenv
u－boot>run bootcmd
成功进入login提示，输入root，进入系统：
＃ifconfig eth0 192.168.1.100
＃ping 192.168.1.106
可以ping通。
接下来要固化到flash里面：
u－boot>setenv bootcmd tftpboot 21100000 ramdisk-rmk7\;tftpboot 21000000 uImage
u－boot>saveenv
u－boot>run bootcmd
u－boot>protect off 1:2-11
u－boot>erase 1:2-11
u－boot>cp.b 21000000 10020000 9c64f
u－boot>erase 1:12-60
u－boot>cp.b 21100000 10120000 5591e6
u－boot>setenv bootcmd cp.b 10020000 21000000 9c64f\;cp.b 10120000 21100000 5591e6\;bootm 21000000
u－boot>saveenv
重新上电后，顺利进入login，输入root进入，执行命令如下：
AT91RM9200DK login: root
[root@AT91RM9200DK /root]$ifconfig eth0 192.168.1.100
SIOCSIFFLAGS: Cannot assign requested address
[root@AT91RM9200DK /root]$ifconfig
[root@AT91RM9200DK /root]$ifconfig eth0 up
SIOCSIFFLAGS: Cannot assign requested address
[root@AT91RM9200DK /root]$
查看启动提示过程，发现：
eth0: Link now 10-HalfDuplex
eth0: AT91 ethernet at 0xfefbc000 int=24 10-HalfDuplex (00:00:00:00:00:00)
eth0: Davicom 9196 PHY (Copper)
也就是说mac地址没有写入，成为了00:00:00:00:00:00。


解决方案：a－ki提示：在9200开发板上外接的是一个PHY芯片 
MAC是存在u-boot,或者是在linux里的。在u-boot里，有两种方式可以设定MAC地址。
一是通过终端设定环境变量:
U-Boot> setenv ethaddr 12:34:56:78:90:ab
这种方式，你可以人为的为每块板子设定不同的MAC地址。
二是可以在u－boot的include/configs/yourboard.h程序中做宏定义:
#define CONFIG_ETHADDR  12:34:56:78:90:ab
至于在linux里面MAC地址存在，当然可以是存在EEPROM里，但我想也应该是由程序读出来
然后由驱动构造成完整的以太网桢，再通过9200的MII接口写入PHY（如dm9161)后，由PHY来发出。不会象某些芯片会自动读入。
   
我在具体的实践中发现，这两种方案都不能把问题解决。更换了mac地址，这个时候还是在u－boot>提示符下更改的，仍然不成立。也就是说一旦写
入flash，mac地址就全为零，无效。那么，能否直接在进入linux之后在修改mac地址，然后指定ip呢？经过实践，此方案可行。具体方法如下：
－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－
在超级终端中启动linux后，以root身份登陆，执行下面语句：
＃ifconfig eth0 hw ether 00:e0:4c:4d:8d:5f     //此处是重新赋予mac地址
eth0: Setting MAC address to 00:e0:4c:4d:8d:5f     //显示结果
＃ifconfig eth0      //此处设置你的目标板的ip
＃ifconig                                                    //查看设置内容
＃ping -c 8                 //ping 你的server，来检验一下
－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－
问题总结：我觉得这里是u－boot和linux不一致的地方，具体的原理部分还不是很不清楚，该分歧的地方具
体在那里有待研究。不过我觉得这里不是mac地址设置的问题。实验了一下，mac地址是可以随便设的。只不过在u－boot里面设定的ethaddr没有
读到linux下面，使得其为00：00：00：00：00：00。所以需要重新设定mac地址。如果有人清楚的知道该问题的核心所在，请告诉我，呵呵，
在此多谢了。我也会好好思考的。

－－－－－－－－－－－－－－－－－－－－－
```

## 补充：

解决方法二：
读代码，以及从网上查找得知，u－boot的网络驱动是没有问题的，只是在和Linux的配合上不太协调。  
可以将kernel的net驱动部分修改一下，指定一个默认的合法的mac地址。

我现在用的版本是Linux－2.4.27－vsr1
先修改驱动：
linux-2.4.27//drivers/at91/net/at91_ether.c

    265 /*
    266  * Set the ethernet MAC address in dev->dev_addr
    267  */
    268 static void get_mac_address(struct net_device *dev) {
    269         AT91PS_EMAC regs = (AT91PS_EMAC) dev->base_addr;
    270         char addr[6];
    271         static char default_ether_addr[]={0x36,0xB9,0x04,0x00,0x24,0x80};
    272         unsigned int hi, lo;
    273 
    274         /* Check if bootloader set address in Specific-Address 1 */
    275         hi = regs->EMAC_SA1H;
    276         lo = regs->EMAC_SA1L;
    277         addr[0] = (lo & 0xff);
    278         addr[1] = (lo & 0xff00) >> 8;
    279         addr[2] = (lo & 0xff0000) >> 16;
    280         addr[3] = (lo & 0xff000000) >> 24;
    281         addr[4] = (hi & 0xff);
    282         addr[5] = (hi & 0xff00) >> 8;
    283 
    284         if (is_valid_ether_addr(addr)) {
    285                 memcpy(dev->dev_addr, &addr, 6);
    286                 return;
    287         }
    288 
    289         /* Check if bootloader set address in Specific-Address 2 */
    290         hi = regs->EMAC_SA2H;
    291         lo = regs->EMAC_SA2L;
    292         addr[0] = (lo & 0xff);
    293         addr[1] = (lo & 0xff00) >> 8;
    294         addr[2] = (lo & 0xff0000) >> 16;
    295         addr[3] = (lo & 0xff000000) >> 24;
    296         addr[4] = (hi & 0xff);
    297         addr[5] = (hi & 0xff00) >> 8;
    298 
    299         if (is_valid_ether_addr(addr)) {
    300                 memcpy(dev->dev_addr, &addr, 6);
    301                 return;
    302         }
    303         /*default_ether_addr*/
    304         memcpy(dev->dev_addr,&default_ether_addr, 6);
    305 }
然后修改：
linux-2.4.27/include/asm-arm/arch-at91rm9200/pio.h
  找到static inline void AT91_CfgPIO_EMAC_MII(void)函数，并将其替换如下内容，然后重新编译内核。
static inline void AT91_CfgPIO_EMAC_MII(void) {
        AT91_SYS->PIOA_PDR |= AT91C_PA16_EMDIO | AT91C_PA15_EMDC | AT91C_PA14_ERXER | AT91C_PA13_ERX1
                | AT91C_PA12_ERX0 | AT91C_PA11_ECRS_ECRSDV | AT91C_PA7_ETXCK_EREFCK;
        AT91_SYS->PIOB_PDR |= AT91C_PB25_EF100 | AT91C_PB19_ERXCK | AT91C_PB18_ECOL | AT91C_PB17_ERXDV
                | AT91C_PB16_ERX3 | AT91C_PB15_ERX2;
        AT91_SYS->PIOD_PDR |= AT91C_PD0_ETX0 | AT91C_PD1_ETX1 | AT91C_PD4_ETXEN | AT91C_PD2_ETX2
                | AT91C_PD3_ETX3 | AT91C_PD5_ETXER;
        AT91_SYS->PIOB_BSR |= AT91C_PB25_EF100 | AT91C_PB19_ERXCK | AT91C_PB18_ECOL | AT91C_PB17_ERXDV
                | AT91C_PB16_ERX3 | AT91C_PB15_ERX2;
        AT91_SYS->PIOD_BSR |= AT91C_PD2_ETX2 | AT91C_PD3_ETX3 | AT91C_PD5_ETXER;
}

  完成后MII接口的网络可以使用，该驱动现在可以支持MII和RMII接口网络，  这个需要在配置时选择，我现在用的是MII。  写入flash启动后mac地址就显示为你所设定的mac地址了。  
可以用diff制作一个补丁，方便使用。
                
                
                

本文来自ChinaUnix博客，如果查看原文请点：http://blog.chinaunix.net/u2/63379/showart_503710.html
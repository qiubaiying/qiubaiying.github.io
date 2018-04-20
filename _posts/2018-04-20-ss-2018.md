## SS/SSR 简介
目录
* 介绍
* 区别
* 客户端
* 其他
* 当前科学上网方式
* 福利
*** 
### 介绍
&nbsp;&nbsp;&nbsp;&nbsp;SS 的全称是Shadowsocks，是一种加密的传输方式（一种基于Socks5 代理方式的网络数据加密传输包）；SS 是目前主流的科学上网方式。<br/>
&nbsp;&nbsp;&nbsp;&nbsp;SSR（全称ShadowsocksR）是SS 的修改版，也算是增强版，是在SS 的基础上做了些功能的增加和修改。<br/>
&nbsp;&nbsp;&nbsp;&nbsp;有很多的SS 客户端，但是仅仅有SS 客户端还不能翻墙，**还得需要在SS 客户端中添加正常可用的SS 信息，SS 信息可以自己买VPS 服务器搭建，也可以买别人搭建好的，也有人搭建了免费共享出来的**。网上卖SS 信息的非常多非常多（不过跑路的也很多，自己当心），但都不是官方提供，SS 官网并不卖服务。
- SS 唯一官网（官网不卖服务）：<https://shadowsocks.org>
- 维基百科详细介绍：<https://zh.wikipedia.org/wiki/Shadowsocks>
- 原理看这个：<http://vc2tea.com/whats-shadowsocks>
- SSR 维基百科详细介绍：<https://zh.wikipedia.org/wiki/Shadowsocks#ShadowsocksR>
- 利用AWS 搭建免费Shadowsocks：[http://lichendi.com/2016/06/07/shadowsocks/](http://lichendi.com/2016/06/07/%E5%88%A9%E7%94%A8AWS%E6%90%AD%E5%BB%BA%E5%85%8D%E8%B4%B9shadowsocks/)
- Google Cloud 可以免费拿一台VPS 试用一年：<http://51.ruyo.net/p/2144.html>
- 个人觉得不错的SS/SSR 服务商：
	- [https://ww.rixcloud.com](https://my.rixcloud.com/aff.php?aff=397)
	- <https://www.喵帕斯.com>
	- <https://墙洞.com>
	- <https://www.boomssc.com>
	- <https://duotai.love>
	- <http://www.dropboxchina.com/ss.html>
- 免费SS 账号分享（能不能用，能用多久我就不确定了）
	- <https://free-ss.site>
	- <https://doub.loan/sszhfx>
	- <https://tool.ssrshare.xyz/tool/free_ssr>
	- <http://share-shadowsocksr.herokuapp.com>
- SSR 免费节点订阅地址（至于节点能不能用我就不知道了，别人分享的）：
	- <https://raw.githubusercontent.com/ImLaoD/sub/master/ssrshare.com>
	- <https://www.ssrshare.xyz/freessr>
	- <http://share-shadowsocksr.herokuapp.com/subscribe?valid=1>

### 区别
&nbsp;&nbsp;&nbsp;&nbsp;VPN 也是传输方式，VPN 默认是全局的（也有少数是可以分流的），开启后所有App 软件都会走代理，而且VPN 的特征值太明显，目前已被G·F·W 干扰。<br/>
&nbsp;&nbsp;&nbsp;&nbsp;SS 是和VPN 完全不同类型的东西，SS 的客户端是智能代理智能分流，根据规则自动判断，只有被墙了的才会走代理（自己也可以设置代理域名和IP），不需要代理的走直连，这样就可以7x24的开启SS，国内和没被墙的走直连不走代理，国内国外两不误。SS 比VPN 好用太多了！
<br/>
> 相比传统的VPN(IKE,IPSec,PPTP…)，Shadowsocks协议具有更好的灵活性和隐蔽性，且搭建相对简单，因此可以拥有相对传统VPN更快的速度和更高的稳定性；另对比V2Ray这种科学上网的集合体，Shadowsocks在服务端更加轻量，单一协议完善程度更高；在移动端有更丰富的客户端选择，兼容性和灵活性更优。（此段摘自：<https://medium.com/@unbiniliumm/95187ef07ced>）

### 客户端

- iOS 客户端（国区可下载）：
	- [Surge 3](https://itunes.apple.com/cn/app/surge-3-web-developer-tool/id1329879957)
	- [Quantumult](https://itunes.apple.com/cn/app/quantumult/id1252015438)
	- [Ranger NetworkTool](https://itunes.apple.com/cn/app/ranger-networktool/id1330474376)
	- [A.BIG.T IV](https://itunes.apple.com/cn/app/a-big-t-iv/id1342485820)
	- [Postern](https://itunes.apple.com/cn/app/postern/id1352320896)
	- [ShadowPocket](https://itunes.apple.com/cn/app/shadowpocket/id1354988493)
	- [SuperWingy](https://itunes.apple.com/cn/app/id1290093815)
	- [FirstWingy](https://itunes.apple.com/cn/app/firstwingy/id1316416848)
	- [Detour](https://itunes.apple.com/cn/app/id1260141606)
	- [SkipWorld](https://itunes.apple.com/cn/app/skipworld/id1183653098)
	- [Kitsunebi](https://itunes.apple.com/cn/app/id1275446921)
	- [BananaNet](https://itunes.apple.com/cn/app/id1234881211)
	- [SsrConnectPro](https://itunes.apple.com/cn/app/id1272045249)
	- [Surge Enterprise](https://itunes.apple.com/cn/app/id1249961855)
	- [寒梅 - Mume Red](https://itunes.apple.com/cn/app/id1256315160)
- iOS 客户端（仅国区下架，其他区可下载）：
	- [Surge](https://itunes.apple.com/us/app/surge-web-developer-tool-proxy/id1040100637)
	- [Shadowrocket](https://itunes.apple.com/us/app/shadowrocket-for-shadowsocks/id932747118?mt=8)
	- [Wingy](https://itunes.apple.com/us/app/wingy-http-s-socks5-proxy-utility/id1178584911)
	- [Wingy](https://itunes.apple.com/us/app/wingy-shadow-vpn-for-http-socks5-ss/id1148026741)
	- [XNode](https://itunes.apple.com/us/app/id1265578116)
	- [A.BIG.T](https://itunes.apple.com/us/app/surfing-advanced-proxy/id1051326718)
	- [Potatso 2](https://itunes.apple.com/us/app/id1162704202)
	- [Potatso Lite](https://itunes.apple.com/us/app/id1239860606)
	- [OpenWingy](https://itunes.apple.com/cn/app/openwingy/id1294672758)
	- [AnyFlow](https://itunes.apple.com/us/app/anyflow-a-super-cool-network-tool/id1176894911)
	- [Shadowing](https://itunes.apple.com/us/app/shadowing/id1194879940)
	- [Shadowfish](https://itunes.apple.com/us/app/shadowfish/id1220680757)
	- [Fugu2](https://itunes.apple.com/us/app/fugu-2/id1215255916)
	- [Mume VPN](https://itunes.apple.com/cn/app/mume-vpn/id1144787928)
	- [Circuit 捷径](https://itunes.apple.com/us/app/id1115240504)
	- ......
- iOS 客户端（全区下架）：
	- [Cross](https://itunes.apple.com/cn/app/cross-proxy-client/id1194595243)
	- [Take](https://itunes.apple.com/us/app/id1176857712)
	- [ShadowAgent](https://itunes.apple.com/cn/app/id1187813723)
	- [LiFi](https://itunes.apple.com/cn/app/lifi-shadowsocks-and-shadowsocksr-vpn-client/id1153372559)
	- ......
- Mac 客户端：
	- [Surge for Mac](http://nssurge.com/)
	- [ShadowsocksX](https://github.com/shadowsocks/shadowsocks-iOS/releases)
	- [ShadowsocksX-NG](https://github.com/shadowsocks/ShadowsocksX-NG/releases/)
	- [ShadowsocksX-NG-R](https://github.com/qinyuhang/ShadowsocksX-NG-R/releases)
	- [GoAgentX](https://pan.lanzou.com/i0dskef)
	- [非官方GoAgentX](https://github.com/mithril-global/GoAgentX)
	- [Flora](https://github.com/huacnlee/flora-kit)
	- [Postern](https://itunes.apple.com/us/app/poster/id411445577?mt=12)
	- [SpechtLite](https://github.com/zhuhaow/SpechtLite/releases)
	- [Buff](https://www.plutox.top/)
	- [A.BIG.T](https://itunes.apple.com/cn/app/a-big-t/id1114040100)
	- [ShadowTunnel](https://itunes.apple.com/cn/app/shadowtunnel-shadowsocks-shadowsocksr-client/id1187938179)
	- [SsrConnect](https://itunes.apple.com/app/id1217575505)
- Win 客户端：
	- [Shadowsocks](https://github.com/shadowsocks/shadowsocks-windows/releases)
	- [Shadowsocks 2.3.1](https://github.com/shadowsocks/shadowsocks-windows/releases/tag/2.3.1)（XP 系统可用）
	- [ShadowsocksR](https://github.com/shadowsocksr-backup/shadowsocksr-csharp/releases)
	- [ShadowsocksRR](https://github.com/shadowsocksrr/shadowsocksr-csharp/releases)
	- [flora](https://github.com/huacnlee/flora-kit)
	- [SScap](https://sourceforge.net/projects/sscap/)
	- [SSTap](https://www.sockscap64.com/sstap)
	- [SocksCap](https://www.sockscap64.com/sockscap-64-free-download/)
- Android 客户端：
	- [Shadowsocks 影梭](https://github.com/shadowsocks/shadowsocks-android/releases)
	- [Shadowsocks 影梭 Google Play](https://play.google.com/store/apps/details?id=com.github.shadowsocks)
	- [ShadowsocksR](https://github.com/shadowsocksr-backup/shadowsocksr-android/releases)
	- [ShadowsocksRR](https://github.com/shadowsocksrr/shadowsocksr-android/releases)
	- [NetPatch](https://play.google.com/store/apps/details?id=co.netpatch.firewall)
	- [Postern](https://play.google.com/store/apps/details?id=com.tunnelworkshop.postern)（Postern 支持导入Surge配置）
- Linux 客户端：
	- [Shadowsocks-qt5](https://github.com/shadowsocks/shadowsocks-qt5)
	- [ShadowsocksR](https://github.com/ssrbackup/shadowsocksr)
	- [Avege](https://github.com/avege/avege)
	- [flora](https://github.com/huacnlee/flora-kit)
	- [electron-ssr](https://github.com/erguotou520/electron-ssr)
- OpenWRT 客户端：
	- [OpenWRT-Shadowsocks](https://github.com/shadowsocks/openwrt-shadowsocks)

### 其他
&nbsp;&nbsp;&nbsp;&nbsp; iOS 设备上使用SS 客户端也会显示VPN 图标：是因为使用了iOS 系统的VPN Network Extension接口（以及NEPacketTunnelProvider 和NWUDPSession 组件），iOS 9 才开放的此接口，这些新接口让我们可以制作出私密协议的VPN产品，苹果官方称之为Enterprise VPN。正是因为iOS 9 之后开放了这个接口和组件才能有今天iOS 上的各式各样的SS 客户端。<br/>
&nbsp;&nbsp;&nbsp;&nbsp; 官方文档：<https://developer.apple.com/documentation/networkextension> <br/>
&nbsp;&nbsp;&nbsp;&nbsp; 引用一句clowwindy的话：
> 往往不需要政府造墙，网民也会自发造墙

### 当前科学上网方式
（百分比为上界）
1. Shadowsocks 63.2%
2. ShadowsocksR 37.1%
3. 蓝灯 lantern 23%
4. VPN 17%
5. 赛风 14.7%
6. GAE 12.8%
7. Hosts 10.6%
8. 自由门 8.1%
9. VPN Gate 6.2%
10. V2Ray 5.6%
- [来自 ShadowsocksR news]

### 福利
触动力，所有打折优惠软件一网打尽！使用优惠码「congcong」还能立减5元，马上下手咯！
<http://www.hitnology.com/listgoods>
![congcong](https://github.com/congcong0806/ss/blob/master/redeem-congcong.jpg)

&copy; Copyright 聪聪：<https://t.me/congcong>

感谢你的阅读，如有问题，望多指正，谢谢！

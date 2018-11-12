---
layout:     post                    # 使用的布局（不需要改）
title:      WebSocket简单使用           # 标题 
subtitle:   基于WebSocket实现简单聊天室 #副标题
date:       2018-11-12              # 时间
author:     MasterJen                # 作者
header-img: img/mdsource/post-bg-a-1.jpg   #这篇文章标题背景图片
catalog: true                       # 是否归档
tags:                               #标签
    - java
---
## Hey WebSocket

>Good morning！ The clouds in the sky are so white, I hope you feel like white clouds. --早安！天上的云好洁白,希望你的心情也如白云一般。

WebSocket是什么? 根据官方解释:服务器可以主动向客户端推送信息,客户端也可以主动向服务器发送信息,是真正的双向平等对话,属于服务器推送技术的一种。

那我们可以通过WebSocket来进行搭建一个简单的聊天室,也可以在支付功能中生成二维码,然后直接发给客户端。当然还有很多。这里就不一一列举了。

基于 springboot 实现 简单聊天室功能 首先导入 依赖包

            <!--解析字符串-->
            <dependency>
                <groupId>com.google.code.gson</groupId>
                <artifactId>gson</artifactId>
            </dependency>
            <!--websocket依赖包-->
            <dependency>
                <groupId>org.springframework</groupId>
                <artifactId>spring-websocket</artifactId>
            </dependency>
            <!--web 包-->
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-starter-web</artifactId>
            </dependency>
            
使用注解方式 进行创建配置类  WebSocketConfig

    @Configuration
    @EnableWebSocket
    public class WebSocketConfig implements WebSocketConfigurer {
    //    注册 WebSocket 处理器添加消息管理器,以及拦截器
        @Override
        public void registerWebSocketHandlers(WebSocketHandlerRegistry webSocketHandlerRegistry) {
            webSocketHandlerRegistry.addHandler(new ChatMessageHandler(),"/websocket/*").addInterceptors(new ChatInterceptor());
        }
    }
    
配置 拦截器 进行拦截用户,获取用户的姓名,以及用户的url.方便后期处理消息。注意:(约束优于代码,自己定义规范)

    //拦截器
    public class ChatInterceptor extends HttpSessionHandshakeInterceptor {
        /**
         *   返回true 表示放行
         *   false 代表拦截
         * @param request
         * @param response
         * @param wsHandler  处理器
         * @param attributes map 属性
         * @return
         * @throws Exception
         */
    //    在进行连接之前,需要进行握手
        @Override
        public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
    //        向属性中添加值，，用作标记  保证唯一性
            String url = request.getURI().toString();
    //        获取 最后一个/后面的是标记  得到姓名
            String name = url.substring(url.lastIndexOf("/")+ 1);
            attributes.put("name",name);
            return super.beforeHandshake(request, response, wsHandler, attributes);
        }
    //    在握手之后
        @Override
        public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Exception ex) {
            super.afterHandshake(request, response, wsHandler, ex);
        }
    }
    
写消息处理类 

    //消息处理类
    public class ChatMessageHandler extends TextWebSocketHandler {
    //    创建map 用来存取所有的用户名以及 WebSocket连接
        Map<String,WebSocketSession> client = new HashMap<>();
    
    
    //    进行连接
        @Override
        public void afterConnectionEstablished(WebSocketSession session) throws Exception {
    //        目的是得到所有的 发送人的连接  以及姓名
            Map<String, Object> attributes = session.getAttributes();
            client.put((String)attributes.get("name"),session);//保存了所有的连接
            super.afterConnectionEstablished(session);
        }
    
    //  处理消息
        @Override
        protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
    //       进行获取发送的内容  里面拼接的字符串
            byte[] bytes = message.asBytes();
    //        获取 String 字符串
            String contentMessage = new String(bytes);//获取发送过来的内容
    //        进行解析
            Map<String,String> map = new Gson().fromJson(contentMessage, Map.class);//对 发送过来的数据进行解析  得到  发送给谁
            String to = (String)map.get("to");//得到 接收人的姓名
    //        得到消息
            String content  = map.get("content");
    //       得到 接收人的连接
            WebSocketSession ses = client.get(to);
    //        得到发送人
            String from =(String)session.getAttributes().get("name");
            if(ses!=null&&ses.isOpen()){
    //            进行发送
                ses.sendMessage(new TextMessage("收到"+from+"的消息"+"内容是"+content));
            }
    
    //        群发
            for (Map.Entry<String, WebSocketSession> stringWebSocketSessionEntry : client.entrySet()) {
    //            遍历所有的用户以及 连接
                WebSocketSession allsession = stringWebSocketSessionEntry.getValue();
                if(allsession!=null&&allsession.isOpen()){
    //                进行群发
                    allsession.sendMessage(new TextMessage("收到"+from+"的消息"+"内容是"+content));
                }
            }
            super.handleTextMessage(session, message);
        }
    //  连接关闭后
        @Override
        public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
            super.afterConnectionClosed(session, status);
        }
    }
    
前端页面中的异步请求 

    <script type="text/javascript">
            var websocket = null;
    
            function abc() {
                // 初始化websocket
                var name = document.getElementById("name").value;
                //判断浏览器是否支持websocket
                if ('WebSocket' in window) {
                    //注意  这里的 /websocket 是项目名 +/websocket  如果是本地的话,那么就不用写 项目,如果是 发布到远程的话,那么就需要加上项目名。
                    websocket = new WebSocket("ws://" + document.location.host + "/websocket/" + name);
    
                    websocket.onopen = function () {
                        // alert("链接成功")
                        setMessage("连接成功")
                    }
                    websocket.onclose = function () {
                        setMessage("连接关闭")
                    }
                    websocket.onerro = function () {
                        setMessage("连接出错")
                    }
                    websocket.onmessage = function (message) {
                        setMessage(message.data)
                    }
    
                } else {
                    alert("什么破浏览器,连websocket都不支持,给我五百万,我帮重装一个")
                }
            }
    
    
            function setMessage(data) {
                var xianshi = document.getElementById("xianshi");
                xianshi.innerHTML = data;
            }
    
    
            function close() {
                if (websocket != null) {
                    websocket.close()
                }
            }
    
            //发送消息
            function sendmessage() {
                var to = document.getElementById("to").value;//接收者
    
                var msg = document.getElementById("content").value;//获取要发送的内容
                if (websocket != null) {//防止有的人上来就点发送
                    var message='{"to":"'+to+'","content":"'+msg+'"}';
                    websocket.send(message)
                }
    
            }
    
    
            //页面关闭之前
            window.onbeforeunload = function () {
                close();
            }
    
    
        </script>
        <body>
            用户名: <input id="name">
            <button onclick="abc()">连接</button>
            <br>
            接收者:<input id="to"><br>
            
            内容:<input id="content">
            <button onclick="sendmessage()">发送</button>
            
            <span id="xianshi"></span>
        </body>
        
如此便完成了简单的聊天室,当然,可以根据自己的需求进行群发或者单发,至于WebSocket整合支付功能,同以上原理,如果有伙伴有疑问,可以留言哦。        
 

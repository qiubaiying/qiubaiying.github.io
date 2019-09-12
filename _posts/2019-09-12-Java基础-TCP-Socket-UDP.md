---
layout:     post 
title:      Java基础0912
subtitle:   TCP_Socket、UDP
date:       2019-09-12
author:     张鹏
header-img: img/post-bg-debug.png
catalog: true   
tags:                         
    - Java
---

# Java基础网络编程

### TCP_Socket简例

- 例1：
- Server端


```java
import java.io.*;
import java.net.*;

public class TestServer{
    public static void main(String args[]){
        try{
            ServerSocket s=new ServerSocket(8888);
            while(true){
                Socket s1=s.accept();
                OutputStream os=s1.getOutputStream();
                DataOutputStream dos=new DataOutputStream(os);
                dos.writeUTF("hello,"+s1.getInetAddress()+"port#"+s1.getPort()+" bye-bye!");
                dos.close();
                s1.close();
            }
        }catch(IOException e){
            e.printStackTrace();
            System.out.println("程序运行出错："+e);
        }
    }
}
```

- cilent端

```java
import java.io.*;
import java.net.*;

public class TestClient{
    public static void main(String[] args){
        try{
            Socket s1=new Socket("127.0.0.1",8888);
            InputStream is=s1.getInputStream();
            DataInputStream dis=new DataInputStream(is);
            System.out.println(dis.readUTF());
            dis.close();
            s1.close();
        }catch(ConnectException conExc){
            conExc.printStackTrace();
            System.out.println("服务器连接失败！");
        }catch(IOException e){
            e.printStackTrace();
        }
    }
}
```

- 例2：

- Server端

```java
import java.io.*;
import java.net.*;

public class TestSocketServer{
    public static void main(String[] args){
        InputStream in=null;
        OutputStream out=null;
        try{
            ServerSocket ss=new ServerSocket(5888);
            Socket socket=ss.accept();
            in=socket.getInputStream();
            out=socket.getOutputStream();
            DataOutputStream dos=new DataOutputStream(out);
            DataInputStream dis=new DataInputStream(in);
            String s=null;
            if((s=dis.readUTF())!=null){
                System.out.println(s);
                System.out.println("from:"+socket.getInetAddress());
                System.out.println("Port:"+socket.getPort());
            }
            dos.writeUTF("hi,hello");
            dis.close();
            dos.close();
            socket.close();
        }catch(IOException e){
            e.printStackTrace();
        }
    }
}
```
- client端

```java
import java.io.*;
import java.net.*;

public class TestSocketClient{
    public static void main(String[] args){
        InputStream is=null;
        OutputStream os=null;
        try{
            Socket socket=new Socket("127.0.0.1",5888);
            is=socket.getInputStream();
            os=socket.getOutputStream();
            DataInputStream dis=new DataInputStream(is);
            DataOutputStream dos=new DataOutputStream(os);
            dos.writeUTF("hey!");
            String s=null;
            if((s=dis.readUTF())!=null);
            System.out.println(s);
            dos.close();
            dis.close();
            socket.close();
        }catch(IOException e){
            e.printStackTrace();
        }
    }
}
```

### UDP

- 不可靠的
- 效率高
- 数据报/非连接

- 例子：
- Server层

```java
import java.net.*;
public class TestUDPServer{
    public static void main(String[] args) throws Exception{
        byte buf[]=new byte[1024];
        DatagramPacket dp=new DatagramPacket(buf,buf.length);
        DatagramSocket ds=new DatagramSocket(5678);
        while(true){
            ds.receive(dp);
            System.out.println(new String(buf,0,dp.getLength()));
        }
    }
}
```
- client层

```java
import java.net.*;
public class TestUDPClient{
    public static void main(String[] args) throws Exception{
        byte[] buf=(new String("hello")).getBytes();
        DatagramPacket dp=new DatagramPacket(buf,buf.length,new InetSocketAddress("127.0.0.1",5678));
        DatagramSocket ds=new DatagramSocket(9999);
        ds.send(dp);
        ds.close();
    }
}
```
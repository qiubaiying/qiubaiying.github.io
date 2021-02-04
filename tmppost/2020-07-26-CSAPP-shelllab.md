---
layout:     post   				    # 使用的布局（不需要改）
title:      深入理解计算机系统(CSAPP)_shelllab	# 标题 
#subtitle:   脚本，xss #副标题
date:       2020-07-26 				# 时间
author:     s-seven 						# 作者
header-img: img/post-bg-2015.jpg 	#这篇文章标题背景图片
catalog: true 						# 是否归档
tags:								#标签
    - CSAPP

---

# shelllab

shell是代表用户运行程序的交互式命令行解释器，它解释由用户输入的命令并且把它们送到内核。这个实验我们要补充7个函数，使shell能够运行。

要实现的7个函数是：

eval: 主要功能是解析cmdline，并且运行。

builtin cmd: 辨识和解析出bulidin命令: quit, fg, bg, and jobs。

do bgfg: 实现bg和fg命令。

waitfg: 实现等待前台程序运行结束。

sigchld handler: 响应SIGCHLD。

sigint handler: 响应 SIGINT (ctrl-c) 信号。

sigtstp handler: 响应 SIGTSTP (ctrl-z) 信号。

## eval  执行用户刚刚键入的命令行

如果用户请求一个内置命令(quit、作业、bg或fg)，那么立即执行它。否则，派生一个子进程并在该子进程的上下文中运行作业。如果作业正在前台运行，请等待它终止，然后返回。注意:每个子进程必须有一个惟一的进程组ID，这样当我们在键盘上键入ctrl-c (ctrl-z)时，我们的后台子进程就不会从内核接收SIGINT (SIGTSTP)。

参考书525页的代码

```c
void eval(char *cmdline)
{   
    char *argv[MAXARGS];
    int bg;             
    pid_t pid;            
    sigset_t mask;    
    bg = parseline(cmdline, argv); //解析命令行  
    if (argv[0] == NULL)	
        return;      
    if (!builtin_cmd(argv))   //判断是否为内置命令，设置阻塞
    {       
        if (sigemptyset(&mask) < 0)	  
            unix_error("sigemptyset error");
        if (sigaddset(&mask, SIGCHLD))	
            unix_error("sigaddset error");	
        if (sigaddset(&mask, SIGINT))	 
            unix_error("sigaddset error");
        if (sigaddset(&mask, SIGTSTP))	 
            unix_error("sigaddset error");	
        if (sigprocmask(SIG_BLOCK, &mask, NULL) < 0)	
            unix_error("sigprocmask error"); 
        //创建子进程	
        if ((pid = fork()) < 0)	   
            unix_error("fork error"); 	
        if (pid == 0)
        {	   
            //  解除阻塞	
            sigprocmask(SIG_UNBLOCK, &mask, NULL);   
            if (setpgid(0, 0) < 0)		//创建虚拟进程组
                unix_error("setpgid error");
            if (execve(argv[0], argv, environ) < 0) 
            {	
                printf("%s: Command not found\n", argv[0]);	
                exit(0);	
            }	
        } 	
        addjob(jobs, pid, (bg == 1 ? BG : FG), cmdline);
        sigprocmask(SIG_UNBLOCK, &mask, NULL); //解除阻塞
        if (!bg)	   
            waitfg(pid);  //前台进程
        else	   
            printf("[%d] (%d) %s", pid2jid(pid), pid, cmdline);  //后台则打印
    }    
    return;
}
```



##builtin_cmd 

如果用户输入了builtin command，那么立即执行

```c
int builtin_cmd(char **argv)
{   
    sigset_t mask,prev_mask;  
    sigfillset(&mask);  
    if(!strcmp(argv[0],"quit"))   //退出命令
        exit(0);   
    else if(!strcmp(argv[0],"&"))  
        //忽略单独的&     
        return 1;  
    else if(!strcmp(argv[0],"jobs"))  //输出作业列表中所有作业信息   
    {       
        sigprocmask(SIG_BLOCK,&mask,&prev_mask); //访问全局变量，阻塞所有信号     
        listjobs(jobs);  
        sigprocmask(SIG_SETMASK,&prev_mask,NULL);  
        return 1;  
    }  
    else if(!strcmp(argv[0],"bg")||!strcmp(argv[0],"fg"))  //实现bg和fg两条内置命令   
    {       
        do_bgfg(argv);   
        return 1; 
    }   
    return 0; 
}
```



## do_bgfg 

执行内置的bg和fg命令

```c
void do_bgfg(char **argv)
{   
  
    struct job_t *jobp=NULL; 
    //  如果没有参数，则忽略命令  
    if (argv[1] == NULL)
    {	
        printf("%s command requires PID or %%jobid argument\n", argv[0]);	
        return; 
    }   
    if (isdigit(argv[1][0])) //判断串1的第0位是否为数字，进程号  
    {	
        pid_t pid = atoi(argv[1]);  //atoi把字符串转化为整型数
        if (!(jobp = getjobpid(jobs, pid))) 
        {	  
            printf("(%d): No such process\n", pid);	 
            return;
        }   
    }   
    else if (argv[1][0] == '%')//%后面是任务号
    {	
        int jid = atoi(&argv[1][1]);	
        if (!(jobp = getjobjid(jobs, jid)))
        {	   
            printf("%s: No such job\n", argv[1]);	
            return;
        }   
    }   
    else 
    {	
        printf("%s: argument must be a PID or %%jobid\n", argv[0]);	
        return;  
    }   
    // bg后台进程
    if (!strcmp(argv[0], "bg"))
    {	
        if (kill(-(jobp->pid), SIGCONT) < 0)
            unix_error("kill (bg) error");
        jobp->state = BG;	
        printf("[%d] (%d) %s", jobp->jid, jobp->pid, jobp->cmdline); 
    }     
    // fg前台进程
    else if (!strcmp(argv[0], "fg"))
    {
        if (kill(-(jobp->pid), SIGCONT) < 0)	
            unix_error("kill (fg) error");	
        jobp->state = FG;	
        waitfg(jobp->pid);  
    }   
    else 
    {	
        printf("do_bgfg: Internal error\n");
        exit(0);   
    } 
    return;
}
```



## waitfg 

阻止直到进程pid不再是前台进程

```c
void waitfg(pid_t pid) //传入的是一个前台进程的pid
{   
    sigset_t mask;   
    sigemptyset(&mask);  //初始化mask为空集合   
    while(pid==fgpid(jobs))   
    {        
        sigsuspend(&mask);  //暂时挂起   
    }
}
```



## sigchld_handler

子作业终止(成为僵尸)，或停止，因为它收到了SIGSTOP或SIGTSTP信号。处理程序将回收所有可用的僵尸子程序，但不等待当前正在运行的任何其他子程序终止。

```c
void sigchld_handler(int sig)
{   
    struct job_t *job1; 
    //新建结构体  
    int olderrno = errno,status; 
    sigset_t mask, prev_mask;   
    pid_t pid;  
    sigfillset(&mask);   
    while((pid=waitpid(-1,&status,WNOHANG|WUNTRACED))>0) 
    {        
        //尽可能回收子进程       
        sigprocmask(SIG_BLOCK,&mask,&prev_mask);  //需要deletejob，阻塞所有信号        
        job1 = getjobpid(jobs,pid);  //通过pid找到job    
        if(WIFSTOPPED(status)) //子进程停止引起的waitpid函数返回   
        {        
            job1->state = ST;   
            printf("Job [%d] (%d) terminated by signal %d\n",job1->jid,job1->pid,WSTOPSIG(status));  
        }       
        else      
        {        
            if(WIFSIGNALED(status)) //子进程终止引起的返回 
                printf("Job [%d] (%d) terminated by signal %d\n",job1->jid,job1->pid,WTERMSIG(status));  
            deletejob(jobs, pid);  //终止的进程直接回收 
        }      
            fflush(stdout);       
        sigprocmask(SIG_SETMASK, &prev_mask, NULL);
    }   
    errno = olderrno;
}
```



## sigint_handler 

当用户在键盘上键入ctrl-c时，内核将向shell发送一个SIGINT。捕获它并将其发送到前台作业

```c
void sigint_handler(int sig)
{   
    pid_t pid ;   
    sigset_t mask, prev_mask;  
    int olderrno=errno; 
    sigfillset(&mask);   
    sigprocmask(SIG_BLOCK,&mask,&prev_mask);  //需要获取前台进程pid，阻塞所有信号 
    pid = fgpid(jobs);  //获取前台作业pid    
    sigprocmask(SIG_SETMASK, &prev_mask, NULL);   
    if(pid!=0)  //只处理前台作业  
        kill(-pid,SIGINT);  
    errno = olderrno;  
    return;
}
```

## sigtstp_handler

每当用户在键盘上键入ctrl-z时，内核就向shell发送一个SIGTSTP。捕获它并通过发送一个SIGTSTP来挂起前台作业。

```C
void sigtstp_handler(int sig)
{    
    pid_t pid;   
    sigset_t mask,prev_mask; 
    int olderrno = errno; 
    sigfillset(&mask);   
    sigprocmask(SIG_BLOCK,&mask,&prev_mask);  //需要获取前台进程pid，阻塞所有信号   
    pid = fgpid(jobs);   
    sigprocmask(SIG_SETMASK,&prev_mask,NULL); 
    if(pid!=0)     
        kill(-pid,SIGTSTP);  
    errno = olderrno;
    return;
}
```


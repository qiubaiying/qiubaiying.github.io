# Lab2:内存管理

在这个实验中，我们将为操作系统编写内存管理代码。内存管理有两个组件。
第一个组件是内核的物理内存分配器，以便内核可以分配内存并在以后释放它。分配器将以4096字节为单位进行操作，称为页。我们需要维护数据结构，记录哪些物理页面是空闲的，哪些是已分配的，以及有多少进程共享每个已分配的页面。还需要编写分配和释放内存页的例程。
内存管理的第二个组成部分是虚拟内存，它将内核和用户软件使用的虚拟地址映射到物理内存中的地址。x86硬件的内存管理单元(MMU)在指令使用内存时执行映射，参考一组页表。我们要根据提供的规范修改JOS以设置MMU的页表。

Lab 2包含以下新的源文件:

- `inc/memlayout.h`
- `kern/pmap.c`
- `kern/pmap.h`
- `kern/kclock.h`
- `kern/kclock.c`

memlayout.h描述了虚拟地址空间的结构，我们需要通过修改pmap.c文件来实现这个结构。memlayout.h和pmap.h文件定义了一个PageInfo结构，利用这个结构可以记录有哪些物理页是空闲的。kclock.c和kclock.h文件中操作的是用电池充电的时钟，以及CMOS RAM设备。在这个设备中记录着PC机拥有的物理内存的数量。在pmap.c中的代码必须读取这个设备中的信息才能弄清楚到底有多少内存。

## Part 1：物理页管理

操作系统必须跟踪哪些物理RAM是空闲的，哪些是当前正在使用的。JOS以页面粒度管理PC的物理内存，这样它就可以使用MMU来映射和保护每一块分配的内存。

现在，我们要编写物理页面分配器。它通过struct PageInfo对象的链接列表(与xv6不同，这些对象没有嵌入到空闲页面本身中)跟踪哪些页面是空闲的，每个对象对应一个物理页面。在编写其余的虚拟内存实现之前，我们要先编写物理页分配程序，因为页表管理代码将需要分配物理内存来存储页表。

### 练习1

在kern/pmap.c文件中，你必须实现以下功能的代码(可能按给出的顺序)。

boot_alloc ()

mem_init()(仅在调用check_page_free_list(1)时有效)

page_init ()

page_alloc ()

page_free ()

check_page_free_list()和check_page_alloc()会检查页分配代码是否正确。

我们打开pmap.c文件，在内核刚开始运行的时候会调用mem_init()这个函数，对内存进行一些初始化的设置，然后这个函数会调用i386_detect_memory ()来检测现在系统中有多少可用的内存空间。然后是一条我们需要改的代码：

```c
// Remove this line when you're ready to test this function.
//panic("mem_init: This function is not finished\n");
pages = (struct PageInfo *) boot_alloc(npages * sizeof(struct PageInfo));
memset(pages, 0, npages * sizeof(struct PageInfo));
```

用boot_alloc来进行分配内存，这是一个仅用于 JOS 设置自身虚拟内存系统时使用的物理内存分配器，仅用于 mem_init 函数。当初始化页面以及空闲内存列表后，不再使用 boot_alloc，而使用 page_alloc。

执行完这个函数，下一条指令为：

`kern_pgdir = (pde_t *) boot_alloc(PGSIZE);`

`memset(kern_pgdir, 0, PGSIZE);`

其中kern_pgdir是一个指针，pde_t *kern_pgdir，它是指向操作系统的页目录表的指针，操作系统之后工作在虚拟内存模式下时，就需要这个页目录表进行地址转换。我们为这个页目录表分配的内存大小空间为PGSIZE，即一个页的大小。并且首先把这部分内存清0。

然后调用boot_alloc函数，来看这个函数：

这个简单的物理内存分配器仅在JOS设置其虚拟内存系统时使用。page_alloc()是真正的分配器。

如果n&gt;0，分配足够的连续物理内存页来容纳“n”字节。不初始化内存。返回内核虚拟地址。

如果n==0，则返回下一个空闲页的地址，而不分配任何内容。

这个函数只能在初始化过程中使用，在page_free_list列表被设置之前。

而这个函数的核心思想就是维护一个静态变量nextfree，里面存放着下一个可以使用的空闲内存空间的虚拟地址，所以每次当我们想要分配n个字节的内存时，我们都需要修改这个变量的值。

```c
static void *
boot_alloc(uint32_t n)
{
	static char *nextfree;	// 空闲内存的下一个字节的虚拟地址
	char *result;

	// 如果这是第一次，初始化nextfree。“end”是链接器自动生成的符号，它指向内核的bss段的末尾:链接器没有*没有*分配给任何内核代码或全局变量的第一个虚拟地址。
	if (!nextfree) {
		extern char end[];
		nextfree = ROUNDUP((char *) end, PGSIZE);
	}

	// 分配一个大到足以容纳“n”字节的块，然后更新nextfree。确保nextfree与多个PGSIZE保持对齐。
	//
	// LAB 2: Your code here.
	cprintf("boot_alloc, nextfree:%x\n", nextfree);
   	result = nextfree;
    	if (n != 0) {
        	nextfree = ROUNDUP(nextfree + n, PGSIZE);
    	}   

      	return result;
	//return NULL;
}
```

回到刚刚的mem_init()函数往下走，到了`kern_pgdir[PDX(UVPT)] = PADDR(kern_pgdir) | PTE_U | PTE_P;·`这条指令，这一条指令就是再为页目录表添加第一个页目录表项。

然后调用需要我们修改的函数page_init()：

```c
void
page_init(void)
{
// NB: 不实际接触物理内存对应的空闲页面
    size_t i;

    //  1)将物理页面0标记为使用中。这样我们就保留了实际模式的IDT和BIOS结构，以备需要时使用。
    pages[0].pp_ref = 1;

    //  2) 剩余的基本内存[PGSIZE, npages_basemem * PGSIZE]是空闲的
    //把页面设为空闲，并插入链表头
    for (i = 1; i < npages_basemem; i++) {
        pages[i].pp_ref = 0;
        pages[i].pp_link = page_free_list;
        page_free_list = &pages[i];
    }

    //  3) 然后是IO的[IOPHYSMEM, EXTPHYSMEM]，永远不能分配它。
    for (i = IOPHYSMEM/PGSIZE; i < EXTPHYSMEM/PGSIZE; i++) {
        pages[i].pp_ref = 1;
    }

    //  4) 然后[EXTPHYSMEM，…]。有些是在用的，有些是空闲的。物理内存中的内核在哪里?哪些页已经用于页表和其他数据结构
    size_t first_free_address = PADDR(boot_alloc(0));  //转为物理地址
    for (i = EXTPHYSMEM/PGSIZE; i < first_free_address/PGSIZE; i++) {
        pages[i].pp_ref = 1;
    }
    for (i = first_free_address/PGSIZE; i < npages; i++) {  
        pages[i].pp_ref = 0;
        pages[i].pp_link = page_free_list;
        page_free_list = &pages[i];
    }
}

```

初始化关于所有物理内存页的相关数据结构后，进入check_page_free_list(1)函数，这个函数的功能就是检查page_free_list链表的所谓空闲页，是否真的都是合法的，空闲的。当输入参数为1时，这个函数要在检查前先进行一步额外的操作，对空闲页链表free_page_list进行修改，经过page_init，free_page_list中已经存放了所有的空闲页表，但是他们的顺序是按照页表的编号从大到小排列的。当前操作系统所采用的页目录表entry_pgdir中，并没有对大编号的页表进行映射，所以这部分页表我们还不能操作。但是小编号的页表，即从0号页表开始到1023号页表，已经映射过了，所以可以对这部分页表进行操作。那么check_page_free_list(1)要完成的就是把这部分页表对应的PageInfo结构体移动到free_page_list的前端，供操作系统现在使用。

然后先实现page_alloc（）：

这个函数实现的是分配一个物理页，函数的返回值就是这个物理页所对应的结构体

```c
//分配物理页面。如果(alloc_flags & ALLOC_ZERO)，则用“\0”字节填充整个返回的物理页。不增加页的引用计数—调用者必须在必要时执行这些操作(显式地或通过page_insert)。
//请确保将已分配页面的pp_link字段设置为NULL，以便page_free可以检查无双重错误。
//如果内存不足，则返回NULL。
//提示:使用page2kva和memset
struct PageInfo *
page_alloc(int alloc_flags)
{
	// Fill this function in
   	 if (page_free_list == NULL) {
        return NULL;
    }
    struct PageInfo *allocated_page = page_free_list;  //取出空闲页的结构体
    page_free_list = page_free_list->pp_link;   //修改相关信息
    allocated_page->pp_link = NULL;  
    if (alloc_flags & ALLOC_ZERO) {
        memset(page2kva(allocated_page), '\0', PGSIZE);  //初始化内存
    }
    return allocated_page;
}
```

然后是page_free()函数：

这个方法的功能就是把一个页的PageInfo结构体再返回给page_free_list空闲页链表，代表回收了这个页。

```c
void
page_free(struct PageInfo *pp)page_free(struct PageInfo *pp)

{
    //修改被回收的页的结构体信息，释放后需要加入空闲页列表之中
    assert(pp->pp_ref == 0 && pp->pp_link == NULL); 
    pp->pp_link = page_free_list;
    page_free_list = pp; 
}
```

需要完善的几个函数都已经补充好了，make grade查看结果：

![屏幕截图.jpg](http://ww1.sinaimg.cn/large/005KQQDely1gdenh5cn0hj30as01awec.jpg)
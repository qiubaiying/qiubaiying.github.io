- 模糊搜索文件：按下t
- 快速切换分支： 按下w
- 搜索：按下s
- 到issue：gi
- 到code：gc
- 到dashboard：gd
- 快速回复评论：选中评论然后按下r， 如果要输入表情，按下：



### Create 

https://www.jianshu.com/p/6969de20cd52



### gitignore 和 fork 同步

https://www.youtube.com/watch?v=3FRIGBbsuxA

生成gitignore的工具：https://www.toptal.com/developers/gitignore

fork的同步，如果没有做什么贡献，其实重新fork一下也行

如果做了贡献，就要去merge





### Git中的回滚撤销

可以向前滚，也可以向后滚

https://www.youtube.com/watch?v=kCp1cTjaE0o

git reset [版本号]

git revert [commit id]

公共分支（master）使用git revert

自己的分支使用git reset





### **git** **合并**

https://www.youtube.com/watch?v=l0Gz7if7_TI

### **git** **分支**

https://www.youtube.com/watch?v=cdBFxeSvD2Q

- 创建分支：

git branch test1

(注意，在哪个分支下创建，就是来源于哪个分支)

- 查看分支:

git branch 

- 切换分支：

git checkout test1

- 创建并且切换到新的分支：

git checkout -b test2

- 删除分支：

git branch -d test1

- 强制删除分支：

git branch -D test1

- 合并分支

git merge test2

- 在远程创建分支：

git push origin test2

- 在远程删除分支：

git push origin :test2

- 在远程创建分支并改名：

git push origin test2:t2





### **~/.gitconfig**

https://www.youtube.com/watch?v=OVLR9qRc9ak

这一节讲的很好

设置别名 还有单独为git设置代理


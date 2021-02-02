---
layout:     post
title:      pythob web module
date:       2020-09-10
author:     Yukun SHANG
catalog: 	 true
tags:
    - python
---

# pythob web module

### Case:

```python
# main.py
import web
urls = ("/.*", "index")
class index:
	def GET(self):
		return 'Hello, world!'
if __name__ == "__main__":
	app = web.application(urls, globals())
	app.run()
```



### How to run

```python
# 10091: Post id
python main.py 10091
```

click http://0.0.0.0:10091/  to open

If there are some problems, use http://127.0.0.1:10091/  instead.



## Reference

https://blog.csdn.net/u011299686/article/details/52870816

https://www.pythonf.cn/read/25687
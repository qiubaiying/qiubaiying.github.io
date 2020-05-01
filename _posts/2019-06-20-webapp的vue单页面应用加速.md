---
layout:     post
title:      为Vue.js 单页应用提速
subtitle:   以下介绍了有关如何缓解此类问题的几种方法，以及在响应性和性能方面进一步改进 Vue.js 应用的其他方法。
date:       2019-06-20
author:     Joey
header-img: img/post-bg-timg.jpeg
catalog: true
tags:
    - Web
    - Vue
    - JavaScript
    - 前端
---

#### 功能组件

- 功能组件是不包含任何状态和实例的组件。将无状态 Vue 组件转换为功能组件可以大大提高渲染性能。

只需在顶层 template 标记中添加 functional 关键字即可：

```
<template functional> <div>...</div> </template>
```

要像以前一样访问 prop 和数据，你必须进行一些小的调整。

```
<template functional>  
  <div>{{ props.someProp }}</div> 
</template> 
<script> 
  export default {  
    props: {    
      someProp: String  
    } 
  }
</script>
```

如果你使用 i18n 进行国际化，则必须在 parent 之前加上 **$t**：

```
{{ parent.$t('app.not-found.message') }}
```

使用功能组件，我们无权使用方法或计算的 prop。但是，我们仍然可以使用 $options 访问方法。

```
<template functional>  
  <div>
    {{ $options.username(props.user) }}
  </div> 
</template> 
<script> 
  export default {  
    props: {    
      user: User,  
    },   
    username(user: User): string {    
        return user.name;  
    } 
  }
</script>
```

延迟加载组件

延迟加载组件可以节省大量的初始下载时间。调用 import() 函数时，将会下载所有延迟加载的资源。对于 Vue 组件，仅在请求渲染时才发生。对话框是注定会这样的。通常仅在用户交互后才显示它们。

```
<template> 
  <div>     
    ...    
    <app-modal-dialog v-if="showDialog" />  
  </div> 
</template> 
<script> 
  export default {  
    components: {    
      ModalDialog: () => import('./ModalDialog.vue')  
    } 
  }
</script>
```

Webpack 将为 ModalDialog 组件创建一个单独的块，该块不会在页面加载时立即下载，而是仅在需要时才下载。

注意不要延迟加载应自动显示的组件。例如以下内容（无提示）将无法加载模式对话框。


```
mounted() {
  this.$bvModal.show('password-check'); 
},
```

原因是已安装的 hook 是在延迟加载模态组件之前进行评估的。


#### 延迟加载路由

构建 SPA 时，JavaScript 捆绑包可能会变得很大，从而增加页面加载时间。如果我们可以将每个路由的组成部分拆分为一个单独的块，然后仅在访问路由时才加载它们，则效率会更高。

```
import ProjectList from '@/components/ProjectList.vue'; 
export const routes = [  
  {    
    path: '/projects',    
    name: 'projects',    
    component: ProjectList,  
  }, 
]
```

定义一个异步组件非常容易，该组件将由 Webpack 自动进行代码拆分。只需更改导入语句：

```
const ProjectList = () => import('@/components/ProjectList.vue');
```

除此之外，无需更改路由配置。通过以下方式在生产模式下构建你的应用：

```
"build": "vue-cli-service build --mode production"
```

并确认会生成很多块

#### Vue 和 Webpack 中的代码拆分

你还可以通过在浏览器中打开开发者控制台来验证此功能是否正常。在 Network 标签中，一旦你访问新路由，就会异步加载多个 JavaScript 文件。在开发模式下，每个块都将被赋予一个自动递增的数字。在生产模式下，将使用自动计算的哈希值代替。


#### 延迟加载的块和预取缓存

Vue 有一个很酷的功能就是 Vue 自动添加 Webpack 的魔术注释，以便进一步自动预取其他块（请参阅预取缓存一节） 。但是，预取仅在浏览器完成初始加载并变为空闲之后才开始。


#### 使对象列表不可变

通常，我们将从后端获取对象列表，例如用户、项目、文章等。默认情况下，Vue 使数组中每个对象的每个第一级属性都具有响应性。对于大量对象而言，这代价可能会很大。有时我们只想显示对象时就不需要去修改它们。

所以在这种情况下，如果我们阻止 Vue 使列表具有响应性，那么就可以获得一些性能。我们可以通过使用列表中的 Object.freeze 来做到这一点，例如使其一直不变。

```
export async function get(url: string): Promise<User[]> {   
  const response = await Object.freeze(axios.get<User[]>(url));   
  return response.data; 
}
```

#### 评估运行时性能

我们已经讨论了许多改进 Vue SPA 的方法，但是不知道我们实际获得了多少性能。可以通过使用浏览器中开发者工具的 Performance 标签来实现。

为了获得准确的数据，我们必须在 Vue 应用中激活性能模式。让我们在 main.ts 文件中用开发模式激活它

```
Vue.config.performance = process.env.NODE_ENV !== "production";
```

这将激活 Vue 内部使用的 User Timing API。

打开浏览器，然后按 F12 键打开开发者控制台。切换到 Performance 选项卡，然后单击 Start Profiling。在 Chrome 中，“ Timings” 行显示重要标记，例如 “First Contentful Paint” 和 “First Meanfulful Paint” 时间。你应该尝试减少它们，以便你的用户可以尽快使用该网站。

#### 总结

在本文中，我们了解了如何对路由和组件使用延迟加载以将 SPA 分成多个块，功能组件如何提高性能以及如何衡量这些改进。

End

> 本文首次发布于 [Joey Blog](http://qiaoyu113.github.io), 作者 [@乔宇(Joey)](http://github.com/qiaoyu113) ,转载请保留原文链接..
---
layout:     post
title:      TypeScript 是怎样工作的
subtitle:   TypeScript的工作原理
date:       2019-12-11
author:     Joey
header-img: img/type.jpg
tags:
    - Web
    - TypeScript
    - 前端
---

## 前言

TypeScript 的工作原理：典型的 TypeScript 项目的结构是什么？什么被编译以及怎样编译？我们如何使用 IDE 编写 TypeScript？

#### TypeScript项目的结构

以下是 TypeScript 项目的一种可能的文件结构：

```
typescript-project/
  dist/
  ts/
    src/
      main.ts
      util.ts
    test/
      util_test.ts
  tsconfig.json
```

说明：

目录 ts/ 包含 TypeScript 文件：

子目录 ts/src/ 包含实际代码。
子目录 ts/test/ 包含代码测试。
目录 dist/ 是编译器的输出位置。
TypeScript 编译器将诸如 ts/src/main.ts 之类的 TypeScript 文件编译为 JavaScript 文件 dist/src/main.js （可能还有其他文件）。
tsconfig.json 用于配置 TypeScript 编译器。

#### tsconfig.json

`tsconfig.json` tsconfig.json的内容如下：

```
{
  "compilerOptions": {
    "rootDir": "ts",
    "outDir": "dist",
    "module": "commonjs",
    ···
  }
}
```

我们已指定：

- TypeScript 代码的根目录是 ts/。
- TypeScript 编译器保存其输出的目录为 dist/。
- 输出文件的模块格式为 CommonJS。

#### 通过集成开发环境（IDE）编程 TypeScript

`Visual Studio Code` 是用于编写 TypeScript 代码的最受欢迎的 IDE 之一。为了更好地使用它，我们需要了解 TypeScript 源代码是以两种独立的方式处理的：

1. 检查打开的编辑器是否存在错误：这是通过所谓的 language server 完成的。它们是与编辑器无关的方法，可为编辑器提供与语言相关的服务（检测错误、重构、自动完成等）。编辑器（例如IDE）通过特殊协议（JSON-RPC，即基于JSON的远程过程调用）与语言服务器进行通信。这样一来，几乎可以用任何编程语言编写此类服务器。
- 要记住：language server 仅列出当前打开的编辑器的错误，且不编译 TypeScript，而是仅仅静态分析它。

2. Building（将 TypeScript 文件编译为 JavaScript 文件）：在这里，我们有两个选择。

- 我们可以通过命令行运行构建工具。例如，TypeScript 编译器 tsc 有 --watch 模式，该模式可以监视输入文件，并在更改文件时将其编译为输出文件。这样，每当我们在 IDE 中保存 TypeScript 文件时，都会立即获得相应的输出文件。
- 我们可以在 Visual Studio Code 中运行 tsc。为此，必须将其安装在我们当前正在开发的项目内部或进行全局安装（通过 Node.js 包管理器 npm）。

>通过构建，我们可以获得完整的错误列表。有关在 Visual Studio Code 中编译 TypeScript 的更多信息，请参见[该 IDE 的官方文档](https://code.visualstudio.com/docs/typescript/typescript-compiling)

#### TypeScript 编译器生成的其他文件

给定 TypeScript 文件 `main.ts`，TypeScript 编译器可以产生几种工件。最常见的是：

- JavaScript文件：`main.js`
- 声明文件：`main.d.ts`（包含类型信息）
- 源码映射文件：`main.js.map`

TypeScript 通常不是通过 `.ts` 文件提供的，而是通过 `.js` 文件和 `.d.ts` 文件提供：

- JavaScript 代码包含实际的功能，可以通过普通 JavaScript 使用。
- 声明文件可帮助编程编辑者实现自动补全和类似的服务。此信息使普通 JavaScript 可以通过 TypeScript 使用。但是如果使用纯 JavaScript，我们甚至会从中受益，因为它可以提供更好的自动完成以及更多功能。

源码映射为 `main.js` 中输出代码的每一部分指定在 `main.ts` 中的输入代码的哪一部分生成了它。除其他外，此信息使运行时环境能够执行 JavaScript 代码，同时在错误信息中显示 TypeScript 代码的行号。

#### 为了使用 TypeScript 中的 npm 包，我们需要类型信息

npm 注册表是一个巨大的 JavaScript 代码库。如果要使用 TypeScript 中的 JavaScript包，则需要类型信息：

- 软件包本身可能包含 `.d.ts` 文件，甚至完整的 TypeScript 代码。
- 如果没有，我们仍然可以使用它：`DefinitelyTyped`是人们为普通 JavaScript 包编写的声明文件的库。

DefinitelyTyped 的声明文件位于 `@types` 命名空间中。所以如果我们需要像 `lodash` 这样的包的声明文件，则必须安装 @types/lodash 包。

#### 将 TypeScript 编译器用于纯 JavaScript 文件

TypeScript 编译器还可以处理普通的 JavaScript 文件：

- 使用选项 `--allowJs`，TypeScript 编译器将输入目录中的 JavaScript 文件复制到输出目录中。好处：当从 JavaScript 迁移到 TypeScript 时，我们可以先使 JavaScript 和 TypeScript 文件混合存在，然后再慢慢把更多 JavaScript 文件转换为 TypeScript 。
- 使用选项 `--checkJs`，编译器还会对 JavaScript 文件进行类型检查（必须启用 `--allowJs` 才能使该选项起作用）。鉴于可用信息有限，它会尽其所能。
- 如果 JavaScript 文件包含注释 `//@ts-nocheck`，则不会对其进行类型检查。

- 如果没有 `--checkJs`，注释 `//@ts-check` 可用于对单个 JavaScript 文件进行类型检查。
- TypeScript 编译器使用通过 JSDoc 注释指定的静态类型信息（请参见下面的例子）。如果可以的话，我们可以完全静态类型化纯 JavaScript 文件，甚至可以派生它们的声明文件。
- 使用选项 --noEmit，编译器不会产生任何输出，它只会对文件进行类型检查。

This is an example of a JSDoc comment that provides static type information for a function add():
这是一个 JSDoc 注释的例子，它为函数 `add()` 提供静态类型信息：


```
/**
 * @param {number} x - A number param.
 * @param {number} y - A number param.
 * @returns {number} This is the result
 */
function add(x, y) {
  return x + y;
}
```

>详细信息：《 TypeScript手册》中的 [Type-Checking JavaScript Files](https://www.typescriptlang.org/docs/handbook/type-checking-javascript-files.html)



End

> 本文首次发布于 [Joey Blog](http://qiaoyu113.github.io), 作者 [@乔宇(Joey)](http://github.com/qiaoyu113) ,转载请保留原文链接..
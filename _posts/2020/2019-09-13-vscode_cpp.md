---
layout:     post
title:      vscode设置c/c++环境
date:       2019-09-13
author:     Yukun SHANG
catalog: 	 true
tags:
    - Tools

---

# vscode设置c/c++环境

In order to run CPP files in vscode, we need some configure files.

![vscode_cpp](https://github.com/Yukun4119/Yukun4119.github.io/blob/master/img/vscode_cpp.png?raw=true)



Here are files in my .vscode

### c_cpp_properties.json

```json
    {
        "configurations": [
            {
                "name": "Mac",
                "defines": [],
                "macFrameworkPath": [
                    "/System/Library/Frameworks",
                    "/Library/Frameworks",
                    "${workspaceFolder}/**"
                ],
                "compilerPath": "/usr/bin/g++",
                "cStandard": "c11",
                "cppStandard": "c++17",
                "intelliSenseMode": "clang-x64",
                "browse": {
                    "path": [
                        "${workspaceFolder}"
                    ],
                    "limitSymbolsToIncludedHeaders": true,
                    "databaseFilename": ""
                }
            }
        ],
        "version": 4
    }


```



### launch.json

```json
{
    // Use IntelliSense to learn about possible attributes.
    // Hover to view descriptions of existing attributes.
    // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
    "version": "0.2.0",
    "configurations": [
        {
            "preLaunchTask": "build c++",
            "name": "Launch C++",
            "type": "cppdbg",
            "request": "launch",
            "program": "${workspaceFolder}/a.out",
            "args": [],
            "stopAtEntry": false,
            "cwd": "${workspaceFolder}",
            "environment": [],
            "externalConsole": true, // 在终端调试
            "MIMode": "lldb",
        },
        {
            "name": "Python",
            "type": "python",
            "request": "launch",
            "stopOnEntry": false,
            "pythonPath": "${config:python.pythonPath}",
            "program": "${file}",
            "cwd": "${workspaceRoot}",
            "env": {
                "PYTHONPATH": "${workspaceRoot}"
            },
            "envFile": "${workspaceRoot}/.env"
        }
    ]
}


```



### settings.json

```json
{
    "files.associations": {
        "vector": "cpp",
        "iosfwd": "cpp",
        "iterator": "cpp",
        "__hash_table": "cpp",
        "__tree": "cpp",
        "deque": "cpp",
        "forward_list": "cpp",
        "list": "cpp",
        "map": "cpp",
        "set": "cpp",
        "string": "cpp",
        "unordered_map": "cpp",
        "unordered_set": "cpp",
        "*.tcc": "cpp",
        "__bit_reference": "cpp",
        "__split_buffer": "cpp",
        "array": "cpp",
        "filesystem": "cpp",
        "initializer_list": "cpp",
        "regex": "cpp",
        "string_view": "cpp",
        "valarray": "cpp",
        "ranges": "cpp",
        "bitset": "cpp",
        "queue": "cpp",
        "random": "cpp",
        "stack": "cpp",
        "utility": "cpp",
        "ostream": "cpp"
    }
}
```



### tasks.json

```json
{
    // See https://go.microsoft.com/fwlink/?LinkId=733558
    // for the documentation about the tasks.json format
    "version": "2.0.0",
    "tasks": [
        {
            "label": "build c++",
            "type": "shell",
            "command": "g++",
            "args": [
                "${file}",
                "-std=c++17",
                "-o",
                "${workspaceFolder}/a.out",
                "-g"
            ],
            "group": "build",
            "presentation": {
                "echo": true,
                "focus": false,
                "panel":"shared",
                "showReuseMessage": true,
                "clear": false,
                "reveal": "silent"
            },
},
    ]
    
}
```





## How to run 

As for me, I prefer `ctl + opt + n` to run cpp files, since it is faster then `ctl + F5`



## How to Debug

`F5`: debug

`ctl + F5`:run without debug


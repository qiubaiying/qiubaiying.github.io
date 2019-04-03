---
layout:     post
title:      Xcode 控制台输出中文
subtitle:   在 Xcode 控制台输出中文的方法
date:       2017-03-01
author:     BY
header-img: img/post-bg-cook.jpg
catalog: true
tags:
    - iOS
    - Xcode
    - macOS
---

> 重写 NSArray、NSSet、NSDictionary 的输出方法，在Xcode实现中文（Unicode）字符在控制台的输出

## 原理
 Xcode 控制台中在输出 NSArray、NSSet、NSDictionary 时，其中的中文字符会变成Unicode编码 如`"\U67cf\U8367"`.
 
我们通过分类重写这些类的输出方法即可实现在控制台输出中文：
 
	 - (NSString *)descriptionWithLocale:(id)locale indent:(NSUInteger)level

## 效果
先看看效果：

创建一个字典并输出:

    NSData *strData = [@"str -> data格式的字符串" dataUsingEncoding:NSUTF8StringEncoding];
    
    NSData *dicData = [NSJSONSerialization dataWithJSONObject:@{@"key0": @"字典 -> data 的数据",}
                                                          options:NSJSONWritingPrettyPrinted
                                                            error:nil];
    
    NSMutableSet *set = [NSMutableSet setWithArray:@[@"set0",
                                                     strData,
                                                     dicData]];
    NSDictionary *dic = @{@"name"  : @"BY",
                           @"My bolg" : @"http://qiubaiying.top",
                           @"count" : @(11),
                           @"strData" : strData,
                           @"dicData" : dicData,
                           @"set"     : set,
                           @"Unicode" : @"😀😁🤣😂😄",
                           @"contact" : @[@"BY Blog:http://qiubaiying.top",
                                          @"GitHub:https://github.com/qiubaiying",
                                          @"简书:https://http://www.jianshu.com/u/e71990ada2fd"]};
    NSLog(@"%@", dic);
   
输出结果：
	
	2017-03-01 10:36:45.709 BYFoundationLog_Demo[1657:53604] {
	    "My bolg" = "http://qiubaiying.top";
	    Unicode = "\Ud83d\Ude00\Ud83d\Ude01\Ud83e\Udd23\Ud83d\Ude02\Ud83d\Ude04";
	    contact =     (
	        "BY Blog:http://qiubaiying.top",
	        "GitHub:https://github.com/qiubaiying",
	        "\U7b80\U4e66:https://http://www.jianshu.com/u/e71990ada2fd"
	    );
	    count = 11;
	    dicData = <7b0a2020 226b6579 3022203a 2022e5ad 97e585b8 202d3e20 64617461 20e79a84 e695b0e6 8dae220a 7d>;
	    name = BY;
	    set = "{(\n    <73747220 2d3e2064 617461e6 a0bce5bc 8fe79a84 e5ad97e7 aca6e4b8 b2>,\n    set0,\n    <7b0a2020 226b6579 3022203a 2022e5ad 97e585b8 202d3e20 64617461 20e79a84 e695b0e6 8dae220a 7d>\n)}";
	    strData = <73747220 2d3e2064 617461e6 a0bce5bc 8fe79a84 e5ad97e7 aca6e4b8 b2>;
	}
	
将`BYFoundationLog.m`拖入项目，再次运行

	2017-03-01 10:35:52.545 BYFoundationLog_Demo[1635:52772] 	{
		set = 	{(
			"str -> data格式的字符串",
			"set0",
				{
				key0 = "字典 -> data 的数据",
			},
		)},
		Unicode = "😀😁🤣😂😄",
		strData = "str -> data格式的字符串",
		count = 11,
		dicData = 	{
			key0 = "字典 -> data 的数据",
		},
		contact = 	(
			"BY Blog:http://qiubaiying.top",
			"GitHub:https://github.com/qiubaiying",
			"简书:https://http://www.jianshu.com/u/e71990ada2fd",
		),
		name = "BY",
		My bolg = "http://qiubaiying.top",
	}


## 实现方法

以 `NSArray` 为例：

创建一个 `NSArray` 的分类，重写输出方法

```
@implementation NSArray (Log)

- (NSString *)descriptionWithLocale:(id)locale indent:(NSUInteger)level {
    NSMutableString *desc = [NSMutableString string];
    
    NSMutableString *tabString = [[NSMutableString alloc] initWithCapacity:level];
    for (NSUInteger i = 0; i < level; ++i) {
        [tabString appendString:@"\t"];
    }
    
    NSString *tab = @"";
    if (level > 0) {
        tab = tabString;
    }
    [desc appendString:@"\t(\n"];
    
    for (id obj in self) {
        if ([obj isKindOfClass:[NSDictionary class]]
            || [obj isKindOfClass:[NSArray class]]
            || [obj isKindOfClass:[NSSet class]]) {
            NSString *str = [((NSDictionary *)obj) descriptionWithLocale:locale indent:level + 1];
            [desc appendFormat:@"%@\t%@,\n", tab, str];
        } else if ([obj isKindOfClass:[NSString class]]) {
            [desc appendFormat:@"%@\t\"%@\",\n", tab, obj];
        } else if ([obj isKindOfClass:[NSData class]]) {
            
            NSError *error = nil;
            NSObject *result =  [NSJSONSerialization JSONObjectWithData:obj
                                                                options:NSJSONReadingMutableContainers
                                                                  error:&error];
            
            if (error == nil && result != nil) {
                if ([result isKindOfClass:[NSDictionary class]]
                    || [result isKindOfClass:[NSArray class]]
                    || [result isKindOfClass:[NSSet class]]) {
                    NSString *str = [((NSDictionary *)result) descriptionWithLocale:locale indent:level + 1];
                    [desc appendFormat:@"%@\t%@,\n", tab, str];
                } else if ([obj isKindOfClass:[NSString class]]) {
                    [desc appendFormat:@"%@\t\"%@\",\n", tab, result];
                }
            } else {
                @try {
                    NSString *str = [[NSString alloc] initWithData:obj encoding:NSUTF8StringEncoding];
                    if (str != nil) {
                        [desc appendFormat:@"%@\t\"%@\",\n", tab, str];
                    } else {
                        [desc appendFormat:@"%@\t%@,\n", tab, obj];
                    }
                }
                @catch (NSException *exception) {
                    [desc appendFormat:@"%@\t%@,\n", tab, obj];
                }
            }
        } else {
            [desc appendFormat:@"%@\t%@,\n", tab, obj];
        }
    }
    
    [desc appendFormat:@"%@)", tab];
    
    return desc;
}

@end

```

NSSet、NSDictionary 与 NSArray 实现方法类似

## 代码下载

代码及Demo地址：[GitHub](https://github.com/qiubaiying/BYFoundationLog)

## 使用方法

直接将 `BYFoundationLog.m` 文件拖入项目中就能使用



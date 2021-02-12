## typedef&#define



# Typedef declaration

The *typedef declaration* provides a way to declare an identifier as a type alias, to be used to replace a possibly complex [type name](dfile:///Users/y.k.shang/Library/Application Support/Dash/DocSets/C/C.docset/Contents/Resources/Documents/en.cppreference.com/w/c/language/type.html#Type_names)

The keyword typedef is used in a [declaration](dfile:///Users/y.k.shang/Library/Application Support/Dash/DocSets/C/C.docset/Contents/Resources/Documents/en.cppreference.com/w/c/language/declarations.html), in the grammatical position of a [storage-class specifier](dfile:///Users/y.k.shang/Library/Application Support/Dash/DocSets/C/C.docset/Contents/Resources/Documents/en.cppreference.com/w/c/language/storage_duration.html), except that it does not affect storage or linkage:

```c
typedef int int_t; // declares int_t to be an alias for the type int
typedef char char_t, *char_p, (*fp)(void); // declares char_t to be an alias for char
                                           // char_p to be an alias for char*
                                           // fp to be an alias for char(*)(void)
```



## #define

用 #define 定义标识符的一般形式为：

\#define 标识符 常量  //注意, 最后没有分号

\#define 和 #include 一样，也是以“#”开头的。凡是以“#”开头的均为预处理指令，#define也不例外。

```c
# define NUM 5
```

可以理解为一个等号



---
layout:     post
title:      自定义原生组件
subtitle:   RN 原生组件
date:       2018-12-30
header-img: img/react-native-custom-bg.jpg
catalog: true
tags:
    - React Native
---


> 前言

之前一直做Android原生开发，最近因公司发展需要使用 React Native 开发应用。
由于 RN 的原理是使用 JS 去调用原生组件，从而达到跨平台的目的，所以势必性能会差些。

开发过程中，也确实感受到了 RN 的性能相对于原生差距还是弱
太多了，所以在想：有没有办法让 RN 直接使用原生控件呢？

**Title 和圆的半径都通过JS来控制，你可以让颜色也通过JS来设定**
![效果图](https://raw.githubusercontent.com/tanliner/ImageHolder/master/img/201812030-react-native-custom.jpg)

> 开始动手

## Native Module

[//]:<>(##### Custom Native View)
### Android 端
#### 自定义View: MyTextView

```Java
public class MyTextView extends TextView {
    private Paint mPaint;
    private int mRadius;

    public MyTextView(Context context) {
        super(context);
        initPaint();
    }

    public MyTextView(Context context, @Nullable AttributeSet attrs) {
        super(context, attrs);
        initPaint();
    }

    public MyTextView(Context context, @Nullable AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        initPaint();
    }

    private void initPaint() {
        mPaint = new Paint();
        mPaint.setDither(true);
        mPaint.setAntiAlias(true);
        mPaint.setColor(Color.RED);
        mPaint.setStrokeWidth(2);
    }

    @Override
    protected void onSizeChanged(int w, int h, int oldw, int oldh) {
        super.onSizeChanged(w, h, oldw, oldh);
        if(h > 0) {
            mRadius = h / 2;
        }
    }

    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        // 在 TextView 上画圆
        canvas.drawCircle(getWidth() / 2, getHeight() / 2, mRadius, mPaint);
    }

    public void setRadius(int r) {
        mRadius = r;
        postInvalidate();
    }
}
```

#### 需要让 RN 知道你自定义的View，通过 ViewManager 来实现 JS 和 Native 通信
```Java
public class MyTextManager extends SimpleViewManager<MyTextView> {
    // 注意这个名字，必须与 JS 端 require 的对应
    public static final String REACT_CLASS = "RCTMyText";
    private Context context;

    public MyTextManager(ReactApplicationContext context) {
        this.context = context;
    }
    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    protected MyTextView createViewInstance(ThemedReactContext reactContext) {
        return new MyTextView(reactContext);
    }

    @Override
    public void onDropViewInstance(MyTextView textView) {
        textView = null;
    }

    /**
    * 第二个参数来自JS端，改变这个参数，TextView上的圆将会变化
    */
    @ReactProp(name = "radius")
    public void setRadius(MyTextView textView, int radius) {
        textView.setRadius(radius);
    }

    @ReactProp(name = "text")
    public void setText(MyTextView textView, String text) {
        textView.setText(text);
    }

    @ReactProp(name = "gravity")
    public void setAlignType(MyTextView textView, String gravity) {
        // String type = gravity.split("\\|")[0];
        if("centerVertical".equals(gravity)) {
            textView.setGravity(Gravity.CENTER_VERTICAL);
        }
    }

    @ReactProp(name = "fontSize")
    public void setTextSize(MyTextView textView, int size) {
        textView.setTextSize(TypedValue.COMPLEX_UNIT_SP, size);
    }
}
```

#### 每个Native 组件都需要一个Package，这个package可以包含View组件也可以包含普通 Module 组件
```Java
public class MyTextPackage implements ReactPackage {
    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        // 如果有自定义的组件也可以返回组件
        return Collections.emptyList();
    }

    // Deprecated in RN 0.47
    public List<Class<? extends JavaScriptModule>> createJSModules() {
        return Collections.emptyList();
    }

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        List<ViewManager> modules = new ArrayList<>();
        modules.add(new MyTextManager(reactContext));
        return modules;
    }
}
```

#### 将这个 Native Package注册到应用中
```Java
private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
            return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
            return Arrays.<ReactPackage>asList(
                new MainReactPackage(),
                new MyTextPackage() // 这行就是需要添加的
            );
        }

        @Override
        protected String getJSMainModuleName() {
            return "index";
        }
    };
```

### JS 端

#### index.js
```
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
```
#### App.js
```
import React from 'react';
import {Button, Platform, StyleSheet, NativeModules} from "react-native";

import RCTTextView from "./src/MyText";


export default class App extends React.Component {

    _buttonOnClick = () => {
        console.log('log message');
    };

    constructor() {
        super();
        this.state = {
            index: 0,
            mytitle: 'The Title',
        }
    }
    render() {
        return (
          <View style={ styles.container }>
            <RCTTextView
              style={styles.myText}
              text={this.state.mytitle}
              gravity={'centerVertical'}
              marginTop={20}>
            </RCTTextView>
          </View>
        );
    }
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    myText: {
        width: 300,
        height: 100,
        fontSize: 26,
    },
    });
```

#### src/MyText.js
```
import React, {Component} from 'react';
import { requireNativeComponent } from 'react-native';

const RCTMyTextView = requireNativeComponent('RCTMyText', RCTTextView);

class RCTTextView extends Component {

    render() {
        return <RCTMyTextView {...this.props}/>
    }
}

module.exports = RCTTextView;
```

#### 总结
1. 需要特别注意，在 import 的时候，当前文件夹的的js文件需要使用 `./xxx`, 否则
执行引引擎将会从node_module中去查找，导致运行时报错，module找不到

2. 必须为text指定宽高 `style={styles.myText}`，否则，native端测量到的宽高始终为零，
文字一直显示不出来，只能绘制一个红色的圆

---
layout:     post
title:      [JavaScript] 2장. 알고있으면 유용한 자바스크립트 문법
subtitle:   기초 문법
date:       2021-09-23
author:     CY
header-img: 
catalog: true
tags:
    - JavaScript
---


참고 블로그 : 벨로퍼트와 함께하는 모던 자바 스크립트 

[링크]: https://learnjs.vlpt.us/



### 삼항 연산자

※ ES6 문법은 아니다.

​	형식

​	`조건 ? true일 경우 : false일 경우`

​	문장이 길어지면 나눠써도 된다.

```javascript
let text = array.length === 0
	? 'Empty Array'
	: 'Not Empth';
```



### Truthy and Falsy

NaN : Not A Number



### 단축 평가 (short-circuit evaluation) 논리 계산법

1. &&로 단축

   특정 값이 유효할때에만 어떤 값을 조회하는 작업을 해야 할 때 매우 유용

   A && B 일 때, A가 truthy한 값을 가질 때 B가 결과를 좌우

   `console.log(1 && 1); // 1`

   `console.log(1 && 0); // 0`

2. ||로 단축

   사용 할 값을 지정해줄 때 매우 유용하게 사용

   A || B 일 때, A가 truthy한 값을 가질 때 A가 결과

   `console.log(1 || 1); // 1`

   `console.log(1 || 0); // 1`



### 함수의 기본 파라미터

파라미터가 주어지지 않았을 때 기본값 적용 가능하도록

```javascript
function plus1 (num){
    const n_num = num + 1 || 1;
    return n_num;
}

const a = plus1();
console.log(a);
```

ES6 기능

```javascript
function plus1 (num = 0){
    const n_num = num + 1;
    return n_num;
}

const a = plus1();
console.log(a);
```

화살표 함수로 사용

```javascript
const plus1 = (num = 0) => num+1;
```



### 조건문 더 스마트하게 쓰기

비교할 값이 많아졌을 때 배열 사용하기

```javascript
const isAnimal = name => ['고양이', '개', '거북이', '너구리'].includes(name);

console.log(isAnimal('개')); // true
console.log(isAnimal('노트북')); // false
```

많은 if문과 switch문 보다 깔끔하게 작성하기

```javascript
function getSound(animal) {
  const sounds = {
    개: '멍멍!',
    고양이: '야옹~',
    참새: '짹짹',
    비둘기: '구구 구 구'
  };
  return sounds[animal] || '...?';
}

console.log(getSound('개')); // 멍멍!
console.log(getSound('비둘기')); // 구구 구 구
```



### spread와 rest

1. spread 연산자 ...

   ```javascript
   const student = {
   	name : 'kim'
   };
   
   const studentAge = {
       name : 'kim',
       age : 20
   };
   
   const studentInfo = {
       name : 'kim',
       age : 20,
       major : 'cs'
   };
   ```

   속성을 추가할 경우 spread 연산자를 사용하자

   ```javascript
   const student = {
   	name : 'kim'
   };
   
   const studentAge = {
       ...student,
       age : 20
   };
   
   const studentInfo = {
       ...studentAge,
       major : 'cs'
   };
   ```

   배열에도 사용 할 수 있다.

   ```javascript
   const num = [1, 2, 3];
   const n_num = [...num, 4];
   const add_num = [...num, 4, ...num];
   ```

   

2. rest

   rest는 객체, 배열, 그리고 함수의 파라미터에서 사용이 가능하다.

   ```javascript
   const studentInfo = {
       name : 'kim',
       age : 20,
       major : 'cs'
   };
   
   const { major, ...studentAge } = studentInfo;
   console.log(major); // cs
   console.log(studentInfo); // name:'kim', age:20
   
   const { age, ...student} = studentAge;
   console.log(age); // 20
   console.log(stuent); // name:'kim'
   ```

   배열에서 rest

   ```javascript
   const num = [1,2,3];
   const [one, ...rest] = numbers;
   
   console.log(one); // 1
   console.log(rest); // [2,3]
   ```

   `const[ ...rest, last] = numbers;` 이런식으로 마지막을 빼는건 불가능하다.



### scope

1. **Global (전역) Scope**: 코드의 모든 범위에서 사용이 가능
2. **Function (함수) Scope**: 함수 안에서만 사용이 가능
3. **Block (블록) Scope**: if, for, switch 등 특정 블록 내부에서만 사용이 가능

```javascript
const value = 'hello!'; // 전역

function myFunction() { // 함수
  const value = 'bye!';
  if (true) { // 블록
    const value = 'world';
    console.log('block scope: ');
    console.log(value);
  }
  console.log('function scope: ');
  console.log(value);
}

myFunction();
console.log('global scope: ');
console.log(value);

/*
출력
block scope:
world
function scope:
bye!
global scope:
hello!
*/
```


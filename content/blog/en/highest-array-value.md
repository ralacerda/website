---
title: "Returning the highest value in an Array"
slug: "highest-array-value"
publishDate: 2023-04-18
draft: false
tags: ["javascript", "array"]
description: 'Four distinct approaches to the same interview question: "Write a function that returns the highest value among the elements in an Array"'
lang: "en"
---

Looking for exercises to practice Javascript, I found the following inteview question: "Write a function that returns the highest value among the elements in an Array". It's a simple task, but it can involve different aspects of Javascript. In this article, I will present some different solutions that I found for the problem, using four distinct approaches.

As an example, we will use the array below. The goal is for the function to return 57, the largest value among the elements.

```javascript
const numbers = [4, 5, 4, 9, 13, 41, 43, 57, 30];
```

## Using `sort()`

You can try solving the problem doing the following:

1. Sort the array in increasing order
2. Return the last element

Let's start with a simple version. You know array has the `sort()` method and you know that using `at(-1)` you can access the last element in that array[^1]. One possible solution would be:

```javascript
function getLargestNumber(numbersArray) {
  return numbersArray.sort().at(-1);
}

getLargestNumber(numbers); // 9
```

Something went wrong. The expected result was `57`, but the function returned `9`. Are we using the right method? Could it be a bug in Javascript? Did we make a mistake with `at(-1)`?

Let's check the returned value of `sort()` to better understand what is going on:

```javascript
numbers.sort(); // [ 13, 30, 4, 4, 41, 43, 5, 57, 9 ]
```

The array is being ordered as if the values were strings. Since the string `"9"` is higher than `"57"`, the function is returning `9`.
This is a weird but expected behavior for the `sort()` method. Accoding to [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort):

> The default sort order is ascending, built upon converting the elements into strings, then comparing their sequences of UTF-16 code units values.

To avoid this behavior, it is necessary to provide a comparison function as an argument. This function receives two arguments (that we can call `a` and `b`) and the returned value establish the position of these elements in the sorted array: if the function returns a positive value, `b` comes before `a`, if the function returns a negative value, `a` comes before `b`.

Since we are trying to sort numbers in ascending order, we can use the subtraction of `a` and `b` to determine their order[^4]:

[^4]: For example, given the values `a = 4`, `b = 9`, we have that `a - b = -5`, and therefore `a` should come before `b`. In the case of `a = 30`, `b = 5`, `a - b = 25`, and therefore `b` should come before `a`.

```javascript
numbers.sort((a, b) => a - b); // [ 4, 4, 5, 9, 13, 30, 41, 43, 57 ]
```

Now that we have the expected behavior, we can refactor our function:

```javascript
function getLargestNumber(numbersArray) {
  return numbersArray.sort((a, b) => a - b).at(-1);
}

getLargestNumber(numbers); // 57
```

The function now works as expected. However, there is an important behavior that we cannot forget: `sort()` mutates the original array.

Note that the fact that `numbers` is a `const` does not prevent the values ​​within the array from being modified or reordered.

```javascript
numbers.sort((a, b) => a - b); // [ 4, 4, 5, 9, 13, 30, 41, 43, 57 ]
numbers; // [ 4, 4, 5, 9, 13, 30, 41, 43, 57 ]
```

Mutating the array in this way can lead to unexpected bugs. It's important to avoid this type of "side effect" in our code.

One solution is to use the `sort()` method on a copy of the original array[^2]. The simplest way to do this is by using the [spread syntax](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Operators/Spread_syntax):

[^2]: There is already an accepted proposal for a method called `toSorted()` that returns a copy of the sorted array. You can check browser support on [can I use](https://caniuse.com/mdn-javascript_builtins_array_tosorted).

```javascript
function getLargestNumber(numbersArray) {
  return [...numbersArray].sort((a, b) => a - b).at(-1);
}

getLargestNumber(numbers); // 57
numbers; // [4, 5, 4, 9, 13, 41, 43, 57, 30]
```

## Looping

Another possible solution to the problem would follow these steps:

1. Create a variable to store the highest value found
2. For each element in the array, if it is greater than the current value of the variable, change the value of the variable to be the value of the element.
3. Return the variable

We can implement like the following:

```javascript
function getLargestNumber(numbersArray) {
  let largestNumber = 0;
  for (let i = 0; i < numbersArray.length; i++) {
    if (numbersArray[i] > largestNumber) {
      largestNumber = numbersArray[i];
    }
  }
  return largestNumber;
}

getLargestNumber(numbers); // 57
```

Although the function works for the array we are using as an example, it doesn't if the array has only negative values.

```javascript
getLargestNumber([-10, -1, -30, -45]); // 0
```

Since we initialize the variable with the value of `0` and no element within the array is greater than zero, the function mistakenly returns `0`.

Not defining an initial value for `largestNumber` does not work, since the comparison `numbersArray[i] > largestNumber` will always return `false`. Defining `largestNumber` as `null` also does not solve our problem[^3]:

[^3]: To better understand the behavior of null when compared to a number, check out this article: [Javascript : The Curious Case of Null >= 0](https://blog.campvanilla.com/javascript-the-curious-case-of-null-0-7b131644e274)

```javascript
let largestNumber;

2 > largestNumber; // false
-2 > largestNumber; // false

largestNumber = null;

2 > largestNumber; // true
-2 > largestNumber; // false
```

The solution then is to use the first element of the Array as the initial value of `largestNumber` and start our loop from index 1.

```javascript
function getLargestNumber(numbersArray) {
  let largestNumber = numbersArray[0];
  for (let i = 1; i < numbersArray.length; i++) {
    if (numbersArray[i] > largestNumber) {
      largestNumber = numbersArray[i];
    }
  }
  return largestNumber;
}

getLargestNumber(numbers); // 57

const negativeNumbers = [-4, -5, -4, -9, -1, -3];
getLargestNumber(negativeNumbers); // -1
```

The function now works correctly for both types of arrays, but I personally prefer to use `for...of` for loops. This format helps to avoid errors and makes the code cleaner and easier to understand:

```javascript
function getLargestNumber(numbersArray) {
  let largestNumber = numbersArray[0];
  for (const number of numbersArray) {
    if (number > largestNumber) {
      largestNumber = number;
    }
  }
  return largestNumber;
}
```

## Using `reduce()`

However, another way to apply a similar strategy is by using the `reduce()` method. The `reduce()` iterates over the array, applying a function that receives at least two values, an accumulator and the current element, and the return of this function will be the new value of the accumulator. If you omit the initial value of the accumulator, the first element of the array is used.

With `reduce()` we can write the function as follows:

```javascript
function getLargestNumber(numbersArray) {
  return numbersArray.reduce((accumulator, number) => {
    if (number > accumulator) {
      return number;
    } else return accumulator;
  });
}

getLargestNumber(numbers); // 57

const negativeNumbers = [-4, -5, -4, -9, -1, -3];
getLargestNumber(negativeNumbers); // -1
```

The first element of the array becomes the accumulator and is compared to the next element (`number`). If the element is greater than the accumulator, we return the element, if not, we return the accumulator. The returned value becomes the new accumulator that will be compared to the next element, and so on.

Using the [Ternary Conditional Operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_operator), we can further simplify the body of the function:

```javascript
function getLargestNumber(numbersArray) {
  return numbersArray.reduce((accumulator, number) => {
    return number > accumulator ? number : accumulator;
  });
}
```

## Using `Math.max()`

In my opinion, this is the easiest and fastest way to solve the problem.

The global object `Math` has the `max()` method that returns the largest value among the arguments passed.

To pass an array as a list of arguments, we use the `apply()` method.

We can write the function as follows:

[^5]: Javascript functions are [objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function) and have their own methods.

```javascript
function getLargestNumber(numbersArray) {
  return Math.max.apply(null, numbersArray);
}

getLargestNumber(numbers); // 57
```

Here we can also opt for the spread syntax:

```javascript
function getLargestNumber(numbersArray) {
  return Math.max(...numbersArray);
}

getLargestNumber(numbers); // 57
```

## Conclusions

We found four way to write our function

```javascript
function getLargestNumberBySort(numbersArray) {
  return [...numbersArray].sort((a, b) => a - b).at(-1);
}

function getLargestNumberByFor(numbersArray) {
  let largestNumber = numbersArray[0];
  for (const number of numbersArray) {
    if (number > largestNumber) {
      largestNumber = number;
    }
  }
  return largestNumber;
}

function getLargestNumberByReduce(numbersArray) {
  return numbersArray.reduce((accumulator, number) => {
    return number > accumulator ? number : accumulator;
  });
}

function getLargestNumberByMax(numbersArray) {
  return Math.max(...numbersArray);
}
```

What is the most correct way? I believe that readability should be taken into account before considering performance, memory usage, or lines of code. For me, the version that uses `Math.max()` is the simplest and fastest to understand.

Of course, these functions are not perfect either, and each one handles edge cases differently. The context will determine what changes to the function are necessary to better handle these cases.

```javascript
getLargestNumberBySort([]); // undefined
getLargestNumberByFor([]); //  undefined
getLargestNumberByReduce([]); // ERRO: Reduce of empty array with no initial value
getLargestNumberByMax([]); // -Infinity

getLargestNumberBySort(["string", 4, 6]); // 6
getLargestNumberByFor(["string", 4, 6]); // string
getLargestNumberByReduce(["string", 4, 6]); // string
getLargestNumberByMax(["string", 4, 6]); // NaN
```

Even if you already know how to solve a problem, I still think it's worth exploring other solutions when you're studying. In addition to helping you review some fundamental concepts, you can practice using certain functions, and these different approaches can help you with ideas in other scenarios and situations.

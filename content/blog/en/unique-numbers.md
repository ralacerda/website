---
title: "Sum of unique numbers"
slug: "unique-numbers"
publishDate: 2024-04-26
draft: false
tags: ["javascript"]
description: "Filtering and summing unique numbers using filter, set and reduce"
lang: "en"
---

[Cassidy Williams](https://cassidoo.co/) has an awesome newsletter that includes, among other things, interview questions. Here is a interesting one:

> Given an array of numbers, add all of the values together but only if the number doesn't repeat a digit.

Example:

```typescript
uniqueSum([1, 2, 3]); // 6
uniqueSum([11, 22, 33]); // 0
uniqueSum([101, 2, 3]); // 5
```

When solving this type of questions, my first thought is always to think about each step individually. I need to first **remove** from the array all the numbers that repeat an number, and then sum the rest. So an `.filter` followed by an `.reduce` is the perfect match for what we need.

```typescript
function uniqueSum(array: number[]) {
	return array.filter(hasNoRepeatingDigit).reduce((a, b) => a + b))
}
```

Now we need to create a function that can check if the number has any repeating number. My first instinct is to transform the number into an array and then use `split` to get an array.

```typescript
String(12345).split(""); // [ '1', '2', '3', '4', '5' ]
```

You can iterate over that array to check if any number repeats, but you can also check if all the values are unique but transforming into an Set and checking if the lenght stays the same.

```typescript
new Set(String(112).split("")).size == String(112).split("").size; // false
new Set(String(123).split("")).size == String(123).split("").size; // true
```

So the function can be written as:

```typescript
function hasNoRepeatingDigit(number) {
  const arrayOfNumber = String(number).split("");
  // Note that we use `size` for Set and `length` for arrays
  return new Set(arrayOfNumber).size == arrayOfNumber.length;
}
```

You can check the full code in the [stackblitz](https://stackblitz.com/edit/stackblitz-starters-y3zwbb?file=index.ts) bellow, which also includes some testing using vitest:

<iframe src="https://stackblitz.com/edit/stackblitz-starters-y3zwbb?embed=1&file=index.ts&view=editor" width="100%" height="400px">

</iframe>

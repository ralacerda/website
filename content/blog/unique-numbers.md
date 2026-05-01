---
title_en: "Sum of unique numbers"
title_pt: "Soma de números únicos"
slug: "unique-numbers"
publishDate: 2024-04-26
draft: false
tags: ["javascript"]
description_en: "Filtering and summing unique numbers using filter, set and reduce"
description_pt: "Filtrando e somando números únicos usando filter, set e reduce"
---

::lang-block{lang="en"}
[Cassidy Williams](https://cassidoo.co/) has an awesome newsletter that includes, among other things, interview questions. Here is a interesting one:
::

::lang-block{lang="pt"}
[Cassidy Williams](https://cassidoo.co/) tem uma newsletter incrível que inclui, entre outras coisas, perguntas de entrevista. Na última edição, ela incluiu a seguinte pergunta:
::

::lang-quote
#en
Given an array of numbers, add all of the values together but only if the number doesn't repeat a digit.
#pt
Dado um array de números, some todos os valores, mas apenas se o número não repete um dígito.
::

::lang-block{lang="en"}
Example:
::

::lang-block{lang="pt"}
Exemplo:
::

```typescript
uniqueSum([1, 2, 3]); // 6
uniqueSum([11, 22, 33]); // 0
uniqueSum([101, 2, 3]); // 5
```

::lang-block{lang="en"}
When solving this type of questions, my first thought is always to think about each step individually. I need to first **remove** from the array all the numbers that repeat an number, and then sum the rest. So an `.filter` followed by an `.reduce` is the perfect match for what we need.
::

::lang-block{lang="pt"}
Ao resolver esse tipo de questão, a primeira coisa que eu faço é pensar em cada etapa individualmente. É preciso primeiro **remover** do array todos os números que repetem um dígito e, em seguida, **somar** o restante. Portanto, um `.filter` seguido de um `.reduce` é a combinação perfeita para o que precisamos.
::

```typescript
function uniqueSum(array: number[]) {
	return array.filter(hasNoRepeatingDigit).reduce((a, b) => a + b))
}
```

::lang-block{lang="en"}
Now we need to create a function that can check if the number has any repeating number. My first instinct is to transform the number into an array and then use `split` to get an array.
::

::lang-block{lang="pt"}
Agora precisamos criar uma função que possa verificar se o número tem algum dígito repetido. Meu primeiro instinto é transformar o número em um array e, em seguida, usar `split` para obter um array.
::

```typescript
String(12345).split(""); // [ '1', '2', '3', '4', '5' ]
```

::lang-block{lang="en"}
You can iterate over that array to check if any number repeats, but you can also check if all the values are unique but transforming into an Set and checking if the lenght stays the same.
::

::lang-block{lang="pt"}
Você pode iterar sobre esse array para verificar se algum número se repete, mas também pode verificar se todos os valores são únicos, transformando em um Set e verificando se o tamanho permanece o mesmo.
::

```typescript
new Set(String(112).split("")).size == String(112).split("").size; // false
new Set(String(123).split("")).size == String(123).split("").size; // true
```

::lang-block{lang="en"}
So the function can be written as:
::

::lang-block{lang="pt"}
Portanto, a função pode ser escrita como:
::

```typescript
function hasNoRepeatingDigit(number) {
  const arrayOfNumber = String(number).split("");
  // Note that we use `size` for Set and `length` for arrays
  return new Set(arrayOfNumber).size == arrayOfNumber.length;
}
```

::lang-block{lang="en"}
You can check the full code in the [stackblitz](https://stackblitz.com/edit/stackblitz-starters-y3zwbb?file=index.ts) bellow, which also includes some testing using vitest:
::

::lang-block{lang="pt"}
Você pode verificar o código completo no [stackblitz](https://stackblitz.com/edit/stackblitz-starters-y3zwbb?file=index.ts) abaixo, que também inclui alguns testes usando vitest:
::

:stackblitz-iframe{:src="https://stackblitz.com/edit/stackblitz-starters-y3zwbb?embed=1&file=index.ts&view=editor"}

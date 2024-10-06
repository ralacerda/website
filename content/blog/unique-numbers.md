---
title: "Soma de números únicos"
publishDate: 2024-04-26
draft: false
tags: ["javascript"]
description: "Filtrando e somando números únicos usando filter, set e reduce"
lang: "pt"
---

[Cassidy Williams](https://cassidoo.co/) tem uma newsletter incrível que inclui, entre outras coisas, perguntas de entrevista. Na última edição, ele inclui a seguinte pergunta:

> Dado um array de números, some todos os valores, mas apenas se o número não repete um dígito.

Exemplo:

```ts
uniqueSum([1, 2, 3]); // 6
uniqueSum([11, 22, 33]); // 0
uniqueSum([101, 2, 3]); // 5
```

Ao resolver esse tipo de questão, a primeira coisa que eu faço é pensar em cada etapa individualmente. É preciso primeiro **remover** do array todos os números que repetem um dígito e, em seguida, **somar** o restante. Portanto, um `.filter` seguido de um `.reduce` é a combinação perfeita para o que precisamos.

```ts
function uniqueSum(array: number[]) {
  return array.filter(hasNoRepeatingDigit).reduce((a, b) => a + b))
}
```

Agora precisamos criar uma função que possa verificar se o número tem algum dígito repetido. Meu primeiro instinto é transformar o número em um array e, em seguida, usar `split` para obter um array.

```ts
String(12345).split(""); // [ '1', '2', '3', '4', '5' ]
```

Você pode iterar sobre esse array para verificar se algum número se repete, mas também pode verificar se todos os valores são únicos, transformando em um Set e verificando se o tamanho permanece o mesmo.

```ts
new Set(String(112).split("")).size == String(112).split("").size; // false
new Set(String(123).split("")).size == String(123).split("").size; // true
```

Portanto, a função pode ser escrita como:

```ts
function hasNoRepeatingDigit(number) {
  const arrayOfNumber = String(number).split("");
  // Observe que usamos `size` para Set e `length` para arrays
  return new Set(arrayOfNumber).size == arrayOfNumber.length;
}
```

Você pode verificar o código completo no [stackblitz](https://stackblitz.com/edit/stackblitz-starters-y3zwbb?file=index.ts) abaixo, que também inclui alguns testes usando vitest:

<iframe src="https://stackblitz.com/edit/stackblitz-starters-y3zwbb?embed=1&file=index.ts&view=editor" width="100%" height="400px">

</iframe>

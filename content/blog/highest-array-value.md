---
title: "Retornando o maior valor de um array"
publishDate: 2023-04-18
draft: false
tags: ["javascript", "array"]
description: 'Quatro abordagens para a mesma pergunta de entrevista: "Escreva uma função que retorne o maior valor de um Array"'
lang: "pt"
---

Procurando exercícios para praticar Javascript, encontrei a seguinte questão de entrevista: "Escreva uma função que retorne o maior valor entre os elementos de um Array". É uma tarefa simples, mas pode envolver diferentes aspectos do Javascript. Neste artigo, apresentarei algumas soluções diferentes que encontrei para o problema, utilizando quatro abordagens distintas.

Como exemplo, usaremos o array abaixo. O objetivo é que a função retorne 57, o maior valor entre os elementos.

```javascript
const numbers = [4, 5, 4, 9, 13, 41, 43, 57, 30];
```

## Usando `sort()`

Você pode resolver o problema da seguinte forma:

1. Ordene o Array de menor para maior
2. Retorne o último elemento

Vamos começar com uma versão simples. Você sabe que um array possui o método `sort()` e que usando `at(-1)` você pode acessar o último elemento desse array[^1]. Uma possível solução seria:

```javascript
function getLargestNumber(numbersArray) {
  return numbersArray.sort().at(-1);
}

getLargestNumber(numbers); // 9
```

Algo deu errado. O resultado esperado era `57`, mas a função retornou `9`. Estamos usando o método correto? Poderia ser um bug no Javascript? Será que cometemos um erro com `at(-1)`?

Vamos verificar o valor retornado por `sort()` para entender melhor o que está acontecendo:

```javascript
numbers.sort(); // [ 13, 30, 4, 4, 41, 43, 5, 57, 9 ]
```

O array está sendo ordenado como se os valores fossem strings. Como a string `"9"` é maior do que `"57"`, a função está retornando `9`.
Esse é um comportamento estranho, mas esperado para o método `sort()`. De acordo com a [MDN](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Array/sort):

> A ordem de classificação padrão é ascendente, baseada na conversão dos elementos em strings e, em seguida, na comparação de suas sequências de valores de unidades de código UTF-16.

Para evitar esse comportamento, é necessário fornecer uma função de comparação como argumento. Essa função recebe dois argumentos (que podemos chamar de `a` e `b`) e o valor retornado estabelece a posição desses elementos no array ordenado: se a função retornar um valor positivo, `b` vem antes de `a`; se a função retornar um valor negativo, `a` vem antes de `b`.

Como estamos tentando ordenar números em ordem crescente, podemos usar a subtração de `a` e `b` para determinar a ordem deles[^4]:

[^4]: Por exemplo, dados os valores `a = 4` e `b = 9`, temos que `a - b = -5` e, portanto, `a` deve vir antes de `b`. No caso de `a = 30` e `b = 5`, `a - b = 25` e, portanto, `b` deve vir antes de `a`.

```javascript
numbers.sort((a, b) => a - b); // [ 4, 4, 5, 9, 13, 30, 41, 43, 57 ]
```

Agora que sabemos disso, podemos refatorar a função da seguinte forma:

```javascript
function getLargestNumber(numbersArray) {
  return numbersArray.sort((a, b) => a - b).at(-1);
}

getLargestNumber(numbers); // 57
```

A função agora funciona como esperado. No entanto, há um comportamento importante que não podemos esquecer: `sort()` altera o array original.

Observe que o fato de `numbers` ser uma `const` não impede que os valores dentro do array sejam modificados ou reordenados.

```javascript
numbers.sort((a, b) => a - b); // [ 4, 4, 5, 9, 13, 30, 41, 43, 57 ]
numbers; // [ 4, 4, 5, 9, 13, 30, 41, 43, 57 ]
```

Modificar o array dessa forma pode levar a bugs inesperados. É importante evitar esse tipo de "efeito colateral" em nosso código.

Uma solução é usar o método `sort()` em uma cópia do array original[^2]. A forma mais simples de fazer isso é usando a [sintaxe de espalhamento](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Operators/Spread_syntax):

[^2]: Já existe uma proposta aceita para um método chamado `toSorted()` que retorna uma cópia do array ordenado. Você pode verificar a compatibilidade com os navegadores em [can I use](https://caniuse.com/mdn-javascript_builtins_array_tosorted).

```javascript
function getLargestNumber(numbersArray) {
  return [...numbersArray].sort((a, b) => a - b).at(-1);
}

getLargestNumber(numbers); // 57
numbers; // [4, 5, 4, 9, 13, 41, 43, 57, 30]
```

## Looping

Outra possível solução para o problema seria:

1. Criar uma variável para armazenar o maior valor encontrado
2. Para cada elemento no array, se ele for maior que o valor atual da variável, alterar o valor da variável para ser o valor do elemento
3. Retornar a variável

Podemos implementar esse solução da seguinte forma:

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

Embora a função funcione para o array que estamos usando como exemplo, ela não funciona se o array tiver apenas valores negativos.

```javascript
getLargestNumber([-10, -1, -30, -45]); // 0
```

Uma vez que inicializamos a variável com o valor `0` e nenhum elemento dentro do array é maior que zero, a função retorna erroneamente `0`.

Deixar `largestNumber` sem um valor inicial não funciona, já que a comparação `numbersArray[i] > largestNumber` sempre retornará `false`. Definir `largestNumber` como `null` também não resolve nosso problema[^3]:

[^3]: Para entender melhor o comportamento de `null` quando comparado a um número, confira este artigo: [Javascript: O Curioso Caso de Null >= 0](https://blog.campvanilla.com/javascript-the-curious-case-of-null-0-7b131644e274)

```javascript
let largestNumber;

2 > largestNumber; // false
-2 > largestNumber; // false

largestNumber = null;

2 > largestNumber; // true
-2 > largestNumber; // false
```

A solução então é usar o primeiro elemento do Array como o valor inicial de `largestNumber` e começar nosso loop a partir do índice 1.

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

A função agora funciona corretamente para ambos os tipos de arrays, mas pessoalmente prefiro usar `for...of` para loops. Esse formato ajuda a evitar erros e torna o código mais limpo e fácil de entender:

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

## Usando `reduce()`

No entanto, outra maneira de aplicar uma estratégia semelhante é usando o método `reduce()`. O `reduce()` itera sobre o array, aplicando uma função que recebe pelo menos dois valores, um acumulador e o elemento atual, e o retorno dessa função será o novo valor do acumulador. Se você omitir o valor inicial do acumulador, o primeiro elemento do array será usado.

Com `reduce()`, podemos escrever a função da seguinte forma:

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

O primeiro elemento do array se torna o acumulador e é comparado com o próximo elemento (`number`). Se o elemento for maior que o acumulador, retornamos o elemento, caso contrário, retornamos o acumulador. O valor retornado se torna o novo acumulador que será comparado com o próximo elemento, e assim por diante.

Usando o [Operador Condicional Ternário](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Operators/Conditional_operator), podemos simplificar ainda mais o corpo da função:

```javascript
function getLargestNumber(numbersArray) {
  return numbersArray.reduce((accumulator, number) => {
    return number > accumulator ? number : accumulator;
  });
}
```

## Usando `Math.max()`

Na minha opinião, esta é a maneira mais fácil e rápida de resolver o problema.

O objeto global `Math` possui o método `max()` que retorna o maior valor entre os argumentos passados.

Para passar um array como uma lista de argumentos, usamos o método `apply()`.

Podemos escrever a função da seguinte forma:

[^5]: Funções em JavaScript são [objetos](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Function) e possuem seus próprios métodos.

```javascript
function getLargestNumber(numbersArray) {
  return Math.max.apply(null, numbersArray);
}

getLargestNumber(numbers); // 57
```

Aqui também podemos optar pela sintaxe de espalhamento (spread):

```javascript
function getLargestNumber(numbersArray) {
  return Math.max(...numbersArray);
}

getLargestNumber(numbers); // 57
```

## Conclusions

Nesse artigoi, vimos 4 abordagens diferentes:

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

Qual é a maneira mais correta? Acredito que a legibilidade deve ser levada em consideração antes de considerar o desempenho, uso de memória ou número de linhas de código. Para mim, a versão que usa `Math.max()` é a mais simples e rápida de entender.

É claro que essas funções também não são perfeitas, e cada uma lida com casos específicos de forma diferente. O contexto determinará quais alterações na função são necessárias para lidar melhor com esses casos.

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

Mesmo que você já saiba como resolver um problema, eu ainda acho que vale a pena explorar outras soluções quando você está estudando. Além de ajudar a revisar alguns conceitos fundamentais, você pode praticar o uso de certas funções, e essas abordagens diferentes podem ajudar com ideias em outros cenários e situações.

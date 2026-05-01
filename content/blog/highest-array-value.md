---
title_pt: "Retornando o maior valor de um array"
title_en: "Returning the highest value in an Array"
slug: "highest-array-value"
publishDate: 2023-04-18
draft: false
tags: ["javascript", "array"]
description_pt: 'Quatro abordagens para a mesma pergunta de entrevista: "Escreva uma função que retorne o maior valor de um Array"'
description_en: 'Four distinct approaches to the same interview question: "Write a function that returns the highest value among the elements in an Array"'
---

::lang-block{lang="pt"}
Procurando exercícios para praticar Javascript, encontrei a seguinte questão de entrevista: "Escreva uma função que retorne o maior valor entre os elementos de um Array". É uma tarefa simples, mas pode envolver diferentes aspectos do Javascript. Neste artigo, apresentarei algumas soluções diferentes que encontrei para o problema, utilizando quatro abordagens distintas.

Como exemplo, usaremos o array abaixo. O objetivo é que a função retorne 57, o maior valor entre os elementos.
::

::lang-block{lang="en"}
Looking for exercises to practice Javascript, I found the following inteview question: "Write a function that returns the highest value among the elements in an Array". It's a simple task, but it can involve different aspects of Javascript. In this article, I will present some different solutions that I found for the problem, using four distinct approaches.

As an example, we will use the array below. The goal is for the function to return 57, the largest value among the elements.
::

```javascript
const numbers = [4, 5, 4, 9, 13, 41, 43, 57, 30];
```

::lang-block{lang="pt"}
## Usando `sort()`

Você pode resolver o problema da seguinte forma:

1. Ordene o Array de menor para maior
2. Retorne o último elemento

Vamos começar com uma versão simples. Você sabe que um array possui o método `sort()` e que usando `at(-1)` você pode acessar o último elemento desse array. Uma possível solução seria:
::

::lang-block{lang="en"}
## Using `sort()`

You can try solving the problem doing the following:

1. Sort the array in increasing order
2. Return the last element

Let's start with a simple version. You know array has the `sort()` method and you know that using `at(-1)` you can access the last element in that array. One possible solution would be:
::

```javascript
function getLargestNumber(numbersArray) {
  return numbersArray.sort().at(-1);
}

getLargestNumber(numbers); // 9
```

::lang-block{lang="pt"}
Algo deu errado. O resultado esperado era `57`, mas a função retornou `9`. Estamos usando o método correto? Poderia ser um bug no Javascript? Será que cometemos um erro com `at(-1)`?

Vamos verificar o valor retornado por `sort()` para entender melhor o que está acontecendo:
::

::lang-block{lang="en"}
Something went wrong. The expected result was `57`, but the function returned `9`. Are we using the right method? Could it be a bug in Javascript? Did we make a mistake with `at(-1)`?

Let's check the returned value of `sort()` to better understand what is going on:
::

```javascript
numbers.sort(); // [ 13, 30, 4, 4, 41, 43, 5, 57, 9 ]
```

::lang-block{lang="pt"}
O array está sendo ordenado como se os valores fossem strings. Como a string `"9"` é maior do que `"57"`, a função está retornando `9`.
Esse é um comportamento estranho, mas esperado para o método `sort()`. De acordo com a [MDN](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Array/sort):

> A ordem de classificação padrão é ascendente, baseada na conversão dos elementos em strings e, em seguida, na comparação de suas sequências de valores de unidades de código UTF-16.

Para evitar esse comportamento, é necessário fornecer uma função de comparação como argumento. Essa função recebe dois argumentos (que podemos chamar de `a` e `b`) e o valor retornado estabelece a posição desses elementos no array ordenado: se a função retornar um valor positivo, `b` vem antes de `a`; se a função retornar um valor negativo, `a` vem antes de `b`.

Como estamos tentando ordenar números em ordem crescente, podemos usar a subtração de `a` e `b` para determinar a ordem deles:

::note
Por exemplo, dados os valores `a = 4` e `b = 9`, temos que `a - b = -5` e, portanto, `a` deve vir antes de `b`. No caso de `a = 30` e `b = 5`, `a - b = 25` e, portanto, `b` deve vir antes de `a`.
::
::

::lang-block{lang="en"}
The array is being ordered as if the values were strings. Since the string `"9"` is higher than `"57"`, the function is returning `9`.
This is a weird but expected behavior for the `sort()` method. Accoding to [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort):

> The default sort order is ascending, built upon converting the elements into strings, then comparing their sequences of UTF-16 code units values.

To avoid this behavior, it is necessary to provide a comparison function as an argument. This function receives two arguments (that we can call `a` and `b`) and the returned value establish the position of these elements in the sorted array: if the function returns a positive value, `b` comes before `a`, if the function returns a negative value, `a` comes before `b`.

Since we are trying to sort numbers in ascending order, we can use the subtraction of `a` and `b` to determine their order:

::note
For example, given the values `a = 4`, `b = 9`, we have that `a - b = -5`, and therefore `a` should come before `b`. In the case of `a = 30`, `b = 5`, `a - b = 25`, and therefore `b` should come before `a`.
::
::

```javascript
numbers.sort((a, b) => a - b); // [ 4, 4, 5, 9, 13, 30, 41, 43, 57 ]
```

::lang-block{lang="pt"}
Agora que sabemos disso, podemos refatorar a função da seguinte forma:
::

::lang-block{lang="en"}
Now that we have the expected behavior, we can refactor our function:
::

```javascript
function getLargestNumber(numbersArray) {
  return numbersArray.sort((a, b) => a - b).at(-1);
}

getLargestNumber(numbers); // 57
```

::lang-block{lang="pt"}
A função agora funciona como esperado. No entanto, há um comportamento importante que não podemos esquecer: `sort()` altera o array original.

Observe que o fato de `numbers` ser uma `const` não impede que os valores dentro do array sejam modificados ou reordenados.
::

::lang-block{lang="en"}
The function now works as expected. However, there is an important behavior that we cannot forget: `sort()` mutates the original array.

Note that the fact that `numbers` is a `const` does not prevent the values ​​within the array from being modified or reordered.
::

```javascript
numbers.sort((a, b) => a - b); // [ 4, 4, 5, 9, 13, 30, 41, 43, 57 ]
numbers; // [ 4, 4, 5, 9, 13, 30, 41, 43, 57 ]
```

::lang-block{lang="pt"}
Modificar o array dessa forma pode levar a bugs inesperados. É importante evitar esse tipo de "efeito colateral" em nosso código.

Uma solução é usar o método `sort()` em uma cópia do array original. A forma mais simples de fazer isso é usando a [sintaxe de espalhamento](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Operators/Spread_syntax):

::note
Já existe uma proposta aceita para um método chamado `toSorted()` que retorna uma cópia do array ordenado. Você pode verificar a compatibilidade com os navegadores em [can I use](https://caniuse.com/mdn-javascript_builtins_array_tosorted).
::
::

::lang-block{lang="en"}
Mutating the array in this way can lead to unexpected bugs. It's important to avoid this type of "side effect" in our code.

One solution is to use the `sort()` method on a copy of the original array. The simplest way to do this is by using the [spread syntax](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Operators/Spread_syntax):

::note
There is already an accepted proposal for a method called `toSorted()` that returns a copy of the sorted array. You can check browser support on [can I use](https://caniuse.com/mdn-javascript_builtins_array_tosorted).
::
::

```javascript
function getLargestNumber(numbersArray) {
  return [...numbersArray].sort((a, b) => a - b).at(-1);
}

getLargestNumber(numbers); // 57
numbers; // [4, 5, 4, 9, 13, 41, 43, 57, 30]
```

::lang-block{lang="pt"}
## Looping

Outra possível solução para o problema seria:

1. Criar uma variável para armazenar o maior valor encontrado
2. Para cada elemento no array, se ele for maior que o valor atual da variável, alterar o valor da variável para ser o valor do elemento
3. Retornar a variável

Podemos implementar esse solução da seguinte forma:
::

::lang-block{lang="en"}
## Looping

Another possible solution to the problem would follow these steps:

1. Create a variable to store the highest value found
2. For each element in the array, if it is greater than the current value of the variable, change the value of the variable to be the value of the element.
3. Return the variable

We can implement like the following:
::

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

::lang-block{lang="pt"}
Embora a função funcione para o array que estamos usando como exemplo, ela não funciona se o array tiver apenas valores negativos.
::

::lang-block{lang="en"}
Although the function works for the array we are using as an example, it doesn't if the array has only negative values.
::

```javascript
getLargestNumber([-10, -1, -30, -45]); // 0
```

::lang-block{lang="pt"}
Uma vez que inicializamos a variável com o valor `0` e nenhum elemento dentro do array é maior que zero, a função retorna erroneamente `0`.

Deixar `largestNumber` sem um valor inicial não funciona, já que a comparação `numbersArray[i] > largestNumber` sempre retornará `false`. Definir `largestNumber` como `null` também não resolve nosso problema:

::note
Para entender melhor o comportamento de `null` quando comparado a um número, confira este artigo: :lang-link{href="/blog/null-greater-than-zero" pt="Javascript: O Curioso Caso de Null >= 0" en="Javascript: The Curious Case of Null >= 0"}
::
::

::lang-block{lang="en"}
Since we initialize the variable with the value of `0` and no element within the array is greater than zero, the function mistakenly returns `0`.

Not defining an initial value for `largestNumber` does not work, since the comparison `numbersArray[i] > largestNumber` will always return `false`. Defining `largestNumber` as `null` also does not solve our problem:

::note
To better understand the behavior of null when compared to a number, check out this article: :lang-link{href="/blog/null-greater-than-zero" pt="Javascript: O Curioso Caso de Null >= 0" en="Javascript: The Curious Case of Null >= 0"}
::
::

```javascript
let largestNumber;

2 > largestNumber; // false
-2 > largestNumber; // false

largestNumber = null;

2 > largestNumber; // true
-2 > largestNumber; // false
```

::lang-block{lang="pt"}
A solução então é usar o primeiro elemento do Array como o valor inicial de `largestNumber` e começar nosso loop a partir do índice 1.
::

::lang-block{lang="en"}
The solution then is to use the first element of the Array as the initial value of `largestNumber` and start our loop from index 1.
::

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

::lang-block{lang="pt"}
A função agora funciona corretamente para ambos os tipos de arrays, mas pessoalmente prefiro usar `for...of` para loops. Esse formato ajuda a evitar erros e torna o código mais limpo e fácil de entender:
::

::lang-block{lang="en"}
The function now works correctly for both types of arrays, but I personally prefer to use `for...of` for loops. This format helps to avoid errors and makes the code cleaner and easier to understand:
::

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

::lang-block{lang="pt"}
## Usando `reduce()`

No entanto, outra maneira de aplicar uma estratégia semelhante é usando o método `reduce()`. O `reduce()` itera sobre o array, aplicando uma função que recebe pelo menos dois valores, um acumulador e o elemento atual, e o retorno dessa função será o novo valor do acumulador. Se você omitir o valor inicial do acumulador, o primeiro elemento do array será usado.

Com `reduce()`, podemos escrever a função da seguinte forma:
::

::lang-block{lang="en"}
## Using `reduce()`

However, another way to apply a similar strategy is by using the `reduce()` method. The `reduce()` iterates over the array, applying a function that receives at least two values, an accumulator and the current element, and the return of this function will be the new value of the accumulator. If you omit the initial value of the accumulator, the first element of the array is used.

With `reduce()` we can write the function as follows:
::

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

::lang-block{lang="pt"}
O primeiro elemento do array se torna o acumulador e é comparado com o próximo elemento (`number`). Se o elemento for maior que o acumulador, retornamos o elemento, caso contrário, retornamos o acumulador. O valor retornado se torna o novo acumulador que será comparado com o próximo elemento, e assim por diante.

Usando o [Operador Condicional Ternário](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Operators/Conditional_operator), podemos simplificar ainda mais o corpo da função:
::

::lang-block{lang="en"}
The first element of the array becomes the accumulator and is compared to the next element (`number`). If the element is greater than the accumulator, we return the element, if not, we return the accumulator. The returned value becomes the new accumulator that will be compared to the next element, and so on.

Using the [Ternary Conditional Operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_operator), we can further simplify the body of the function:
::

```javascript
function getLargestNumber(numbersArray) {
  return numbersArray.reduce((accumulator, number) => {
    return number > accumulator ? number : accumulator;
  });
}
```

::lang-block{lang="pt"}
## Usando `Math.max()`

Na minha opinião, esta é a maneira mais fácil e rápida de resolver o problema.

O objeto global `Math` possui o método `max()` que retorna o maior valor entre os argumentos passados.

Para passar um array como uma lista de argumentos, usamos o método `apply()`[^5].
::

::lang-block{lang="en"}
## Using `Math.max()`

In my opinion, this is the easiest and fastest way to solve the problem.

The global object `Math` has the `max()` method that returns the largest value among the arguments passed.

Para passar um array como uma lista de argumentos, usamos o método `apply()`.
::

::lang-block{lang="pt"}
Funções em JavaScript são [objetos](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Function) e possuem seus próprios métodos.

Podemos escrever a função da seguinte forma:
::

::lang-block{lang="en"}
Javascript functions are [objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function) and have their own methods.

We can write the function as follows:
::

```javascript
function getLargestNumber(numbersArray) {
  return Math.max.apply(null, numbersArray);
}

getLargestNumber(numbers); // 57
```

::lang-block{lang="pt"}
Aqui também podemos optar pela sintaxe de espalhamento (spread):
::

::lang-block{lang="en"}
Here we can also opt for the spread syntax:
::

```javascript
function getLargestNumber(numbersArray) {
  return Math.max(...numbersArray);
}

getLargestNumber(numbers); // 57
```

::lang-block{lang="pt"}
## Conclusões

Nesse artigo, vimos 4 abordagens diferentes:
::

::lang-block{lang="en"}
## Conclusions

We found four way to write our function:
::

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

::lang-block{lang="pt"}
Qual é a maneira mais correta? Acredito que a legibilidade deve ser levada em consideração antes de considerar o desempenho, uso de memória ou número de linhas de código. Para mim, a versão que usa `Math.max()` é a mais simples e rápida de entender.

É claro que essas funções também não são perfeitas, e cada uma lida com casos específicos de forma diferente. O contexto determinará quais alterações na função são necessárias para lidar melhor com esses casos.
::

::lang-block{lang="en"}
What is the most correct way? I believe that readability should be taken into account before considering performance, memory usage, or lines of code. For me, the version that uses `Math.max()` is the simplest and fastest to understand.

Of course, these functions are not perfect either, and each one handles edge cases differently. The context will determine what changes to the function are necessary to better handle these cases.
::

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

::lang-block{lang="pt"}
Mesmo que você já saiba como resolver um problema, eu ainda acho que vale a pena explorar outras soluções quando você está estudando. Além de ajudar a revisar alguns conceitos fundamentais, você pode praticar o uso de certas funções, e essas abordagens diferentes podem ajudar com ideias em outros cenários e situações.
::

::lang-block{lang="en"}
Even if you already know how to solve a problem, I still think it's worth exploring other solutions when you're studying. In addition to helping you review some fundamental concepts, you can practice using certain functions, and these different approaches can help you with ideas in other scenarios and situations.
::

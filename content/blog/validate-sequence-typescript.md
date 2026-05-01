---
title_en: "Validating Sequences with TypeScript"
title_pt: "Validando sequências com Typescript"
slug: "validating-sequence-with-typescript"
publishDate: 2025-06-10
draft: false
tags: ["javascript", "typescript"]
description_en: "Exploring TypeScript capabilities"
description_pt: "Explorando as capacidades do typescript"
---

::lang-block{lang="en"}
Cassidy Williams has an excellent [newsletter](https://cassidoo.co/newsletter), which always includes an “Interview Question of the Week”. This week's question was:
::

::lang-block{lang="pt"}
A Cassidy Williams tem uma excelente [newsletter](https://cassidoo.co/newsletter), que sempre inclui uma “Pergunta de entrevista da semana”. A pergunta dessa semana era:
::

> ::lang-block{lang="en"}Given an array of strings representing a sequence of traffic light states ("red" for stop, "green" for go, "yellow" for slow), write a function that returns true if the sequence could represent a valid state machine for a standard traffic light. The only valid transitions are: red to green, green to yellow, and yellow to red.:: ::lang-block{lang="pt"}Dado um array de strings que representa uma sequência de estados de semáforo, escreva uma função que verifique se a sequência pode representar estados válidos para um semáforo padrão. As únicas transições válidas são: de vermelho para verde, de verde para amarelo e de amarelo para vermelho.::

::lang-block{lang="en"}
To make it clear, here are some examples:
::

::lang-block{lang="pt"}
Para deixar claro, alguns exemplos:
::

```ts
> isValidTrafficSequence(["red", "green", "yellow", "red", "green"])
> true

> isValidTrafficSequence(["red", "yellow", "green"]);
> false
> // Invalid because "yellow" can't come after "red", or "green" after "yellow"

> isValidTrafficSequence([])
> true
```

::lang-block{lang="en"}
It seems like an interesting challenge, but I had crazy idea: “Would it be possible to do this validation using TypeScript only?” And I'm not talking about runtime code, I'm talking about checking if a sequence is valid at compilation time using only the type system.

After racking my brain a bit, I came up with the following solution:
::

::lang-block{lang="pt"}
Parece um desafio interessante, mas eu tive uma ideia meio maluca, “Será que é possível fazer essa validação utilizando Typescript?”. E eu não estou falando de código runtime, eu estou falando de verificar, utilizando somente o sistema de types, se é uma sequência válida durante o processo de compilação.

Depois de bater um pouco a cabeça, eu cheguei na seguinte solução:
::

```ts
type Color = "red" | "yellow" | "green";

type ValidPairs = ["red", "green"] | ["green", "yellow"] | ["yellow", "red"];

type ValidSequence<T extends readonly Color[]> =
  T extends readonly [] ? true :
  T extends readonly [Color] ? true :
  T extends readonly [infer First, ...infer Rest] ?
    [First, Rest[0]] extends ValidPairs ?
      Rest extends readonly Color[] ?
        ValidSequence<Rest>
        : false
      : false
    : false;

type Test1 = ValidSequence<["red", "green", "yellow", "red"]>;
//^? type Test1 = true

type Test2 = ValidSequence<["red", "yellow", "green"]>;
//^? type Test2 = false

type Test3 = ValidSequence<[]>;
//^? type Test3 = true
```

::lang-block{lang="en"}
[Link to the solution and tests in the Playground](https://www.typescriptlang.org/play/?#code/C4TwDgpgBAwg9gGzgJygXigImRAJpqAHyxAgSQHcDjMBzHCAO0wG4AoN0SKANQEMEAS1wAFPoOQBndFADa2PJgA0WehCaYAukTl0GzFZlLk4VbcXnHKyrDnyb2ncNH5DcAZQgBHAK5MAxhAAPAAqUBAAHsBMuNI4fLhwjAggsIgospoAfDJhkdGMsVDxicmpmVAA-FDAyH5QAFxsUC1QeVExcRAJSSly8EjI2tXNrbX1DW3hHYVdPWVygowAZhCoAGISksAqAHT7S6uoAEoQ28OjrbKbUjtQp9uyAAya2vmdvALCYltVl60PYDTApFEq9VIDDIXVow1zCTy+ALBQE5SbLASSaBojFYqDohCYjhObgAUQikH8wFCwI+4wgOQwIQ4XGgITOwAAjDIyRSqXCPN4-IxAkF5HYtFkssTWeyAEzc8kQSlBfkIoUi+RqDSGKymCVSlltdkAZgVvJVXwFiOFwTFih1ZGs2RyAHoXVAAJKMABuAEO3HAVHwALZ8HBIKC4CBgOCCaRRqDetbBsgACzg0qN2wALGalXzLWqkaKFPhDFqDLZFM6oG7PT7-cJA4nk2m4JHo7H49Ak8go5m2dsAKx55WqwXFu1l1T6GxGR1650D9kANlHBbcRZtJd1VEM4vLs-31cltfdXr9AZUvZTCHTHZjcY7Lb7EGX2wA7OuLZuJ9vNUeM7qJWejAfqZ71peTbXmsCZRo+3Yvv2hqDsAAAc37jtaGqlnOFZzruc4HkBGhLih7IAJyYYWf4akuQA)
::

::lang-block{lang="pt"}
[Link para a solução e testes no Playground](https://www.typescriptlang.org/play/?#code/C4TwDgpgBAwg9gGzgJygXigImRAJpqAHyxAgSQHcDjMBzHCAO0wG4AoN0SKANQEMEAS1wAFPoOQBndFADa2PJgA0WehCaYAukTl0GzFZlLk4VbcXnHKyrDnyb2ncNH5DcAZQgBHAK5MAxhAAPAAqUBAAHsBMuNI4fLhwjAggsIgospoAfDJhkdGMsVDxicmpmVAA-FDAyH5QAFxsUC1QeVExcRAJSSly8EjI2tXNrbX1DW3hHYVdPWVygowAZhCoAGISksAqAHT7S6uoAEoQ28OjrbKbUjtQp9uyAAya2vmdvALCYltVl60PYDTApFEq9VIDDIXVow1zCTy+ALBQE5SbLASSaBojFYqDohCYjhObgAUQikH8wFCwI+4wgOQwIQ4XGgITOwAAjDIyRSqXCPN4-IxAkF5HYtFkssTWeyAEzc8kQSlBfkIoUi+RqDSGKymCVSlltdkAZgVvJVXwFiOFwTFih1ZGs2RyAHoXVAAJKMABuAEO3HAVHwALZ8HBIKC4CBgOCCaRRqDetbBsgACzg0qN2wALGalXzLWqkaKFPhDFqDLZFM6oG7PT7-cJA4nk2m4JHo7H49Ak8go5m2dsAKx55WqwXFu1l1T6GxGR1650D9kANlHBbcRZtJd1VEM4vLs-31cltfdXr9AZUvZTCHTHZjcY7Lb7EGX2wA7OuLZuJ9vNUeM7qJWejAfqZ71peTbXmsCZRo+3Yvv2hqDsAAAc37jtaGqlnOFZzruc4HkBGhLih7IAJyYYWf4akuQA)
::

::lang-block{lang="en"}
The logic is relatively simple, once you understand the TypeScript syntax.

The `extends` keyword before the assignment (the `=` symbol) corresponds to a constraint on the generic. In our case, it means that `ValidSequence` receives a parameter `T` that *must* be of type `readonly Color[]`. But the `extends` after assignment allows for a check with a ternary operator. For example, we can do:
::

::lang-block{lang="pt"}
A lógica é relativamente simples, depois que você entende a sintaxe do Typescript.

A keyword `extends` antes da atribuição (simbolo de `=`) corresponde a uma restrição do genérico. No nosso caso, significa que `ValidSequence` recebe um parametro `T` que *precisa* ser do tipo `readonly Color[]`. Mas o `extends` depois de atribuição permite uma verificação com um operador ternário. Por exemplo, podemos fazer:
::

```ts
type IsString<T> = T extends string ? true : false;
type Name = IsString<"Renato">
   //^? type Name = true
type Age = IsString<33>
   //^? type Age = false
```

::lang-block{lang="en"}
The cool thing is that within this operator, we have access to the `infer` keyword, which allows us to create a temporary variable that corresponds to the checked value. In other words, `infer` says: “If the type matches this format, save it in this variable.”
::

::lang-block{lang="pt"}
O legal é que dentro desse operador temos acesso à keyword `infer`, que permite criar uma variável temporária que corresponde ao valor verificado. Em outras palavras, `infer` diz: “Se o tipo corresponder a esse formato, capture ele nesta variável”.
::

```ts
type ColorString<T> = T extends `${infer Color}-color` ? Color : never;

type JustColor = ColorString<"red-color">
    // ^? JustColor = "red"
```

::lang-block{lang="en"}
In this example, if `T` is a string that has the format `something-color`, it will extract that `something` into a variable called `Color`.

In our solution, we use `infer First` to extract the first element and `...infer Rest` to extract the rest of the list, using the [*spread syntax*](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax).

Now we can better understand the logic of the challenge solution:
::

::lang-block{lang="pt"}
Nesse exemplo, se `T` é um string que tem o formato `cor-algo`, ele vai extrair esse `algo` em uma variável chamada `Cor` .

Na nossa solução, usamos `infer First` para extrair o primeiro elemento e `...infer Rest` para extrair o restante da lista, utilizando a sintaxe de [*espalhamento ("spread")*](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax).

Agora podemos entender melhor a lógica da solução do desafio:
::

```ts
type ValidSequence<T extends readonly Color[]> = 
  // Is it an empty list?
  T extends readonly [] ? true : 
  // Is it a list with only one color?
  T extends readonly [Color] ? true : 
  // Save the first element in `First` and the rest in `Rest`
  T extends readonly [infer First, ...infer Rest] ? 
    // Is it a valid pair?
    [First, Rest[0]] extends ValidPairs ?
      // Is the rest of the list in the expected format? (here it always is, but TypeScript doesn't know)
      Rest extends readonly Color[] ? 
      // Recursively, do the same validation for the rest of the list
      ValidSequence<Rest> 
      :  false 
    : false
  : false
```

::lang-block{lang="en"}
The runtime equivalent would be:
::

::lang-block{lang="pt"}
O equivalente em `runtime` seria:
::

```ts
function isValidSequence(list) {
  return list.length === 0 ? true : 
	  list.length === 1 && isColor(list[0]) ? true :
		  // this const here isn't valid, but imagine it was possible
		  const [first, ...rest] = list;
		  isValidPair(first, rest[0]) ? 
			  isValidSequence(rest) :
				  false
				false
			false
}

// Or, in a more readable way
function isValidSequence(list) {
  if (list.length === 0) return true;
  if (list.length === 1 && isColor(list[0])) return true;

	const [first, ...rest] = list;

	if (isValidPair(first, rest[0])) {
    isValidSequence(rest)
  }

  return false;
}
```

::lang-block{lang="en"}
You might have noticed that it was necessary to use `readonly` in several places. This happens because arrays are mutable in JavaScript, so TypeScript wouldn't be sure that the elements would stay in the same order. To make it clear to TypeScript that the array won't be mutated, you can add an `as const`.
::

::lang-block{lang="pt"}
Você deve ter notado que foi precisa utilizar o `readonly` em vários pontos. Isso acontece porque arrays são mutaveis no Javascript, então o Typescript não teria certeza que os elementos iriam se manter na mesma ordem. Para deixar claro para o Typescript que aquele array não vai ser mutato, você pode adicionar um `as const`.
::

```ts
const mutableSequence = ["red", "green", "yellow"];
      //^? string[]

const immutableSequence = ["red", "green", "yellow"] as const;
      //^? readonly ["red", "green", "yellow"]
```

::lang-block{lang="en"}
This exercise demonstrates the capability of the TypeScript type system. Of course, it's not always worth writing these complex types, especially because the generated errors are very difficult to understand and the code has very low readability, but it's interesting to see how far we can go using just the type system.
::

::lang-block{lang="pt"}
Esse exercício demonstra a capacidade do sistema de tipos do Typescript. Lógico que nem sempre vale a pena escrever esses tipos complexos, principalmente porque os erros gerados são muito difíceis de entender e o código tem uma legibilidade muito baixa, mas é interessante ver até onde conseguimos chegar apenas com o sistema de tipos.
::

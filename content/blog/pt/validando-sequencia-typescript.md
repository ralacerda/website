---
title: "Validando sequências com Typescript"
slug: "validating-sequence-with-typescript"
publishDate: 2025-06-10
draft: false
tags: ["javascript", "typescript"]
description: "Explorando as capacidades do typescript"
lang: "pt"
---

A Cassidy Williams tem uma excelente [newsletter](https://cassidoo.co/newsletter), que sempre inclui uma “Pergunta de entrevista da semana”. A pergunta dessa semana era:

> Dado um array de strings que representa uma sequência de estados de semáforo, escreva uma função que verifique se a sequência pode representar estados válidos para um semáforo padrão. As únicas transições válidas são: de vermelho para verde, de verde para amarelo e de amarelo para vermelho.

Para deixar claro, alguns exemplos:

```ts
> isValidTrafficSequence(["red", "green", "yellow", "red", "green"])
> true

> isValidTrafficSequence(["red", "yellow", "green"]);
> false

> isValidTrafficSequence([])
> true
```

Parece um desafio interessante, mas eu tive uma ideia meio maluca, “Será que é possível fazer essa validação utilizando Typescript?”. E eu não estou falando de código runtime, eu estou falando de verificar, utilizando somente o sistema de types, se é uma sequência válida durante o processo de compilação.

Depois de bater um pouco a cabeça, eu cheguei na seguinte solução:

```ts
type Color = "red" | "yellow" | "green";

type ValidPairs = ["red", "green"] | ["green", "yellow"] | ["yellow", "red"];

type ValidSequence<T extends readonly Color[]> = T extends readonly [] ? true :
    T extends readonly [Color] ? 
    true : T extends readonly [infer First, ...infer Rest] ?
     [First, Rest[0]] extends ValidPairs ?
      Rest extends readonly Color[] ?
       ValidSequence<Rest> : false : false : false

type Test1 = ValidSequence<["red", "green", "yellow", "red"]>;
//^? type Test1 = true

type Test2 = ValidSequence<["red", "yellow", "green"]>;
//^? type Test2 = false

type Test3 = ValidSequence<[]>;
//^? type Test3 = true
```

[Link para a solução e testes no Playground](https://www.typescriptlang.org/play/?#code/C4TwDgpgBAwg9gGzgJygXigImRAJpqAHyxAgSQHcDjMBzHCAO0wG4AoN0SKANQEMEAS1wAFPoOQBndFADa2PJgA0WehCaYAukTl0GzFZlLk4VbcXnHKyrDnyb2ncNH5DcAZQgBHAK5MAxhAAPAAqUBAAHsBMuNI4fLhwjAggsIgospoAfDJhkdGMsVDxicmpmVAA-FDAyH5QAFxsUC1QeVExcRAJSSly8EjI2tXNrbX1DW3hHYVdPWVygowAZhCoAGISksAqAHT7S6uoAEoQ28OjrbKbUjtQp9uyAAya2vmdvALCYltVl60PYDTApFEq9VIDDIXVow1zCTy+ALBQE5SbLASSaBojFYqDohCYjhObgAUQikH8wFCwI+4wgOQwIQ4XGgITOwAAjDIyRSqXCPN4-IxAkF5HYtFkssTWeyAEzc8kQSlBfkIoUi+RqDSGKymCVSlltdkAZgVvJVXwFiOFwTFih1ZGs2RyAHoXVAAJKMABuAEO3HBpUbtgAWM1KvmWtVI0UKfCGLUGWyKZ1QN2en3+4SBw1s7YAVnDytVgpjdvjqn0NiMjr1zqDeeAADYi5G3NGbbHdVRDOKE1XeynJWn3V6-QGG+yAOyti3t0udzUDyvqJN6Vf6kcZ8fZyfbAAcs5L1o1cerier3erfZXGnrufZAE4j1GFxr60A)

A lógica é relativamente simples, depois que você entende a syntaxe do Typescript.

A keyword `extends` antes de atribuição (simbolo de `=`) corresponde a uma restrição do genérico. No nosso caso, significa que `ValidSequence` recebe um parametro `T` que *precisa* ser do tipo `readonly Color[]`. Mas o `extends` depois de atribuição permite uma verificação com um operador ternário. Por exemplo, podemos fazer:

```ts
type IsString<T> = T extends string ? true : false;
type Name = IsString<"Renato">
   //^? type Name = true
type Age = IsString<33>
   //^? type Age = false
```

Mas dentro desse operador, a gente ganha acesso a uma nova keyword: `infer`. Ela quer dizer: “Se tem essa formato, salve nessa variável”. 

```ts
type ColorString<T> = T extends `cor-${infer Cor}` ? Cor : never;

type JustColor = ColorString<"cor-vermelha">
    //^? JustColor = "vermelha"
```

Nesse exemplo, se `T` é um string que tem o formato `cor-algo`, ele vai extrair esse `algo` em uma variável chamada `Cor` .

Na nossa solução, usamos `infer First` para extrair o primeiro elemento e `...infer Rest` para extrair o restante da lista, utilizando a sintaxe de [*espalhamento ("spread")*](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax).

Agora podemos entender melhor a lógica da solução do desafio:

```ts
type ValidSequence<T extends readonly Color[]> = 
    // É uma lista vazia?
    T extends readonly [] ? true : 
      // É uma lista com somente uma cor?
      T extends readonly [Color] ? true : 
        // Salva o primeiro elemento em `First` e o resto em `Rest`
        T extends readonly [infer First, ...infer Rest] ? 
         // É um par válido?
          [First, Rest[0]] extends ValidPairs ?
            // O resto da lista é o formato esperado (aqui sempre é, mas o typescript não sabe)
            Rest extends readonly Color[] ? 
              // Recursivamente, faça a mesma validação para o resto da lista 
              ValidSequence<Rest> :
            false :
          false :
        false
```

O equivalente em `runtime` seria:

```ts
function isValidSequence(list) {
  return list.length === 0 ? true : 
	  list.length === 1 && isColor(list[0]) ? true :
		  // esse const aqui não é válido, mas imagina que fosse possível
		  const [first, ...rest] = list;
		  isValidPair(first, rest[0]) ? 
			  isValidSequence(rest) :
				  false
				false
			false
}

// Ou, de formas mais legível:
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

Você deve ter notado que foi precisa utilizar o `readonly` em vários pontos. Isso acontece porque arrays são mutaveis no Javascript, então o Typescript não teria certeza que os elementos iriam se manter na mesma ordem. Para deixar claro para o Typescript que aquele array não vai ser mutato, você pode adicionar um `as const`.

```ts
const mutableSequence = ["red", "green", "yellow"];
// tipo inferido: string[]

const immutableSequence = ["red", "green", "yellow"] as const;
// tipo inferido: readonly ["red", "green", "yellow"]
```

Esse exercício demonstra a capacidade do sistema de tipos do Typescript. Lógico que nem sempre vale a pena escrever esses tipos complexos, principalmente porque os erros gerados são muito difíceis de entender e o código tem uma legibilidade muito baixa, mas é interessante ver até onde conseguimos chegar apenas com o sistema de tipos.
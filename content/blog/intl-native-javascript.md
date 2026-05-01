---
title_pt: "Intl: Soluções Nativas para Formatação em JavaScript"
title_en: "Intl: Native Solutions for Formatting in JavaScript"
slug: "intl-native-javascript"
publishDate: 2025-05-01
draft: false
tags: ["javascript", "intl"]
description_pt: "Convertendo valores de Javascript em texto, sem a necessidade de uma biblioteca externa"
description_en: "Converting JavaScript values to text, without needing an external library"
---

::lang-block{lang="pt"}
O `Intl` é uma API do Javascript que fornece funcionalidades para criação de textos internacionalizados. Entretanto, ela pode ser usada em qualquer caso que você precise formatar informações de Javascript em textos, removendo a necessidade de bibliotecas externas.

Uma das funcionalidades mais conhecidas é o `Intl.DateTimeFormat`, que está disponível desde 2017. Ele é usado para formatar datas e horas:
::

::lang-block{lang="en"}
`Intl` is a JavaScript API that provides functionality for creating internationalized text. However, it can be used in any case where you need to format JavaScript information into text, removing the need for external libraries.

One of the most well-known features is `Intl.DateTimeFormat`, which has been available since 2017. It's used to format dates and times:
::

```ts
const portugueseFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "full",
  timeStyle: "short",
});

const englishFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "full",
  timeStyle: "short",
});

const date = new Date("2025-05-01T12:00:00Z");
console.log(portugueseFormatter.format(date)); // Thursday, May 1, 2025 at 9:00 AM (in PT)
console.log(englishFormatter.format(date)); // Thursday, May 1, 2025 at 9:00 AM
```

::lang-block{lang="pt"}
Entretanto, existem outras APIs menos conhecidas (mas muito úteis) que também estão disponíveis através do `Intl`.

## Intl.NumberFormat

O `NumberFormat` é muito útil para aplicativos em português, já que utilizamos vírgula para representar casas decimais.
::

::lang-block{lang="en"}
However, there are other less known (but very useful) APIs that are also available through `Intl`.

## Intl.NumberFormat

`NumberFormat` is very useful for applications in Portuguese, since we use commas to represent decimal places.
::

```ts
const conversionRate = 3.7;
const portugueseNumberFormatter = Intl.NumberFormat("pt-BR");

console.log(portugueseNumberFormatter.format(conversionRate)); // 3,7
```

::lang-block{lang="pt"}
Também é possível definir um valor mínimo ou máximo de dígitos depois da vírgula (com a possibilidade de definir a estratégia de arredondamento):
::

::lang-block{lang="en"}
It's also possible to define a minimum or maximum number of digits after the comma (with the possibility of defining the rounding strategy):
::

```ts
const winningRate = 1.2345653;
const zero = 0;

const portugueseNumberFormatter = Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 3,
  minimumFractionDigits: 3,
});

console.log(portugueseNumberFormatter.format(winningRate)); // 1,235
console.log(portugueseNumberFormatter.format(zero)); // 0,000
```

::lang-block{lang="pt"}
E se você pensou que essa é a solução para manter preços sempre dentro do estilo necessário, existe algo melhor, uma opção específica para formatar preços e moedas:
::

::lang-block{lang="en"}
And if you thought this is the solution to keep prices always in the necessary style, there's something better, a specific option to format prices and currencies:
::

```ts
const ticketPrice = 5.9;

const realFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});
console.log(realFormatter.format(ticketPrice)); // R$ 5,90
```

::lang-block{lang="pt"}
E até unidades podem ser utilizadas:
::

::lang-block{lang="en"}
And even units can be used:
::

```ts
const distanceKilometers = 90;
const timeInHours = 0.4;

const velocity = distanceKilometers / timeInHours;

const velocityFormatter = new Intl.NumberFormat("pt-BR", {
  style: "unit",
  unit: "kilometer-per-hour",
});

console.log(velocityFormatter.format(velocity)); // 225 km/h
```

::lang-block{lang="pt"}
Outras opções e exemplos estão disponíveis no [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat).

## Intl.PluralRules

> 1 usuário online

É muito fácil de esquecer de incluir regras de plural. E verificar manualmente pode ser repetitivo.
::

::lang-block{lang="en"}
Other options and examples are available on [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat).

## Intl.PluralRules

> 1 users online

It's very easy to forget to include plural rules. And checking manually can be repetitive.
::

<!-- prettier-ignore-start -->
```ts
`${userCount} ${ userCount > 1 ? "users" : "user" } online`;
```
<!-- prettier-ignore-end -->

::lang-block{lang="pt"}
O `Intl.PluralRules` fornece ajuda retornando a categoria cardinal baseado no número:
::

::lang-block{lang="en"}
`Intl.PluralRules` provides help by returning the cardinal category based on the number:
::

```ts
const enCardinalRules = new Intl.PluralRules("en-US");
const enNumberFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  compactDisplay: "long",
});

function userCountText(userCount: number) {
  const category = enCardinalRules.select(userCount);
  const userCountDisplay = enNumberFormatter.format(userCount);

  if (category === "one") {
    return `${userCountDisplay} user online`;
  }

  if (category === "other") {
    return `${userCountDisplay} users online`;
  }

  // Would you remember this case?
  if (category === "many") {
    return `${userCountDisplay} of users online`;
  }
}

console.log(userCountText(1)); // 1 user online
console.log(userCountText(2)); // 2 users online
console.log(userCountText(2000000)); // 2 million users online
```

::lang-block{lang="pt"}
Entretanto, algo estranho acontece quando usamos o zero:
::

::lang-block{lang="en"}
However, something strange happens when we use zero:
::

```ts
console.log(userCountText(0)); // 0 users online
```

::lang-block{lang="pt"}
A realidade é que a especificação do `CLDR` sobre [regras de plurais](https://www.unicode.org/cldr/charts/43/supplemental/language_plural_rules.html), em que o `Intl.PluralRules` se baseia, considera que `0` está dentro de `one` para o locale `pt` (como `pt-BR` está ausente na lista, os navegadores utilizam `pt` de "fallback").

Existe uma discussão na língua portuguesa a respeito do [uso do plural com o 0](https://ciberduvidas.iscte-iul.pt/artigos/rubricas/idioma/zero-com-ou-sem-plural/2837), mas ela está fora do escopo desse artigo. Para fazer o `0` ser parte da categoria `other`, você pode utilizar o locale `pt-PT`.
::

::lang-block{lang="en"}
The reality is that the CLDR specification on [plural rules](https://www.unicode.org/cldr/charts/43/supplemental/language_plural_rules.html), which `Intl.PluralRules` is based on, considers that `0` is within `other` for the `en` locale.

There's a discussion in Portuguese about the [use of plurals with 0](https://ciberduvidas.iscte-iul.pt/artigos/rubricas/idioma/zero-com-ou-sem-plural/2837), but it's outside the scope of this article. To make `0` part of the `other` category, you can use the `pt-PT` locale for Portuguese.
::

```ts
const ptBRplural = new Intl.PluralRules("pt-BR");
const ptPTplural = new Intl.PluralRules("pt-PT");

console.log(ptBRplural.select(0)); // one
console.log(ptPTplural.select(0)); // other
```

::lang-block{lang="pt"}
## Intl.ListFormat

Formata uma lista, seguindo as regras da língua.
::

::lang-block{lang="en"}
## Intl.ListFormat

Formats a list, following the rules of the language.
::

```ts
const formatter = new Intl.ListFormat("en", {
  type: "conjunction",
});

const users = ["John"];
console.log(formatter.format(users)); // John

users.push("Lennon");
console.log(formatter.format(users)); // John and Lennon

users.push("Ringo");
users.push("George");
console.log(formatter.format(users)); // John, Lennon, Ringo, and George
```

::lang-block{lang="pt"}
Para utilizar "ou", utilizamos `type: "disjunction"`:
::

::lang-block{lang="en"}
To use "or", we use `type: "disjunction"`:
::

```ts
const formatter = new Intl.ListFormat("en", {
  type: "disjunction",
});

const meansOfTransport = ["Car", "Bicycle", "Bus"];
console.log(formatter.format(meansOfTransport)); // Car, Bicycle, or Bus
```

::lang-block{lang="pt"}
## Intl.RelativeTimeFormat

O `RelativeTimeFormat` permite converter uma unidade em tempo relativo.
::

::lang-block{lang="en"}
## Intl.RelativeTimeFormat

`RelativeTimeFormat` allows converting a unit into relative time.
::

```ts
const relativeTime = new Intl.RelativeTimeFormat("en");

console.log(relativeTime.format(2, "day")); // in 2 days
console.log(relativeTime.format(12, "years")); // in 12 years
console.log(relativeTime.format(-1, "week")); // 1 week ago
```

::lang-block{lang="pt"}
As unidades possíveis são:
`year`, `quarter`, `month`, `week`, `day`, `hour`, `minute` ou `second`.

Por padrão, o resultado é sempre númerico, mas você pode permitir o uso de frases idiomáticas:
::

::lang-block{lang="en"}
The possible units are:
`year`, `quarter`, `month`, `week`, `day`, `hour`, `minute`, or `second`.

By default, the result is always numeric, but you can allow the use of idiomatic phrases:
::

```ts
const relativeTime = new Intl.RelativeTimeFormat("en", {
  numeric: "auto",
});

console.log(relativeTime.format(2, "day")); // day after tomorrow
console.log(relativeTime.format(0, "years")); // this year
console.log(relativeTime.format(1, "week")); // next week
console.log(relativeTime.format(0, "second")); // now
```

::lang-block{lang="pt"}
Entretanto, eu acho a API do `RelativeTimeFormat` pequena em relação à quantidade de possibilidades. Eu acho sempre muito difícil trabalhar com Tempo e Duração no Javascript com bibliotecas externas. Novas APIs estão por vir para facilitar essas tarefas, mas isso é assunto para outro post.
::

::lang-block{lang="en"}
However, I find the `RelativeTimeFormat` API small compared to the number of possibilities. I always find it very difficult to work with Time and Duration in JavaScript with external libraries. New APIs are coming to facilitate these tasks, but that's a topic for another post.
::

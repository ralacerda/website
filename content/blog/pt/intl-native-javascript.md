---
title: "Intl: Soluções Nativas para Formatação em JavaScript"
slug: "intl"
publishDate: 2025-05-01
draft: false
tags: ["javascript", "intl"]
description: "Convertendo valores de Javascript em texto, sem a necessidade de uma biblioteca externa"
lang: "pt"
---

O `Intl` é uma API do Javascript que fornece funcionalidades para criação de textos internacionalizados. Entretanto, ela pode ser usada em qualquer caso que você precise formatar informações de Javascript em textos, removendo a necessidade de bibliotecas externas.

Uma das funcionalidades mais conhecidas é o `Intl.DateTimeFormat`, que está disponível desde 2017. Ele é usado para formatar datas e horas:

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
console.log(portugueseFormatter.format(date)); // quinta-feira, 1 de maio de 2025 às 09:00
console.log(englishFormatter.format(date)); // Thursday, May 1, 2025 at 9:00 AM
```

Entretanto, existem outras APIs menos conhecidas (mas muito úteis) que também estão disponíveis através do `Intl`.

## Intl.NumberFormat

O `NumberFormat` é muito útil para aplicativos em português, já que utilizamos vírgula para representar casas decimais.

```ts
const conversionRate = 3.7;
const portugueseNumberFormatter = Intl.NumberFormat("pt-BR");

console.log(portugueseNumberFormatter.format(conversionRate)); // 3,7
```

Também é possível definir um valor mínimo ou máximo de dígitos depois da vírgula (com a possibilidade de definir a estratégia de arredondamento):

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

E se você pensou que essa é a solução para manter preços sempre dentro do estilo necessário, existe algo melhor, uma opção específica para formatar preços e moedas:

```ts
const ticketPrice = 5.9;

const realFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});
console.log(realFormatter.format(ticketPrice)); // R$ 5,90
```

E até unidades podem ser utilizadas:

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

Outras opções e exemplos estão disponíveis no [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat).

## Intl.PluralRules

> 1 usuários online

É muito fácil de esquecer de incluir regras de plural. E verificar manualmente pode ser repetitivo.

<!-- prettier-ignore-start -->
```ts
`${hoursWithoutBug} ${ hoursWithoutBug > 1 ? "usuários" : "usuário" } online`;
```
<!-- prettier-ignore-end -->

O `Intl.PluralRules` fornece ajuda retornando a categoria cardinal baseado no número:

```ts
const ptCardinalRules = new Intl.PluralRules("pt-BR");
const ptNumberFormatter = new Intl.NumberFormat("pt-BR", {
  notation: "compact",
  compactDisplay: "long",
});

function userCountText(userCount: number) {
  const category = ptCardinalRules.select(userCount);
  const userCountDisplay = ptNumberFormatter.format(userCount);

  if (category === "one") {
    return `${userCountDisplay} usuário online`;
  }

  if (category === "other") {
    return `${userCountDisplay} usuários online`;
  }

  // Você lembraria desse caso?
  if (category === "many") {
    return `${userCountDisplay} de usuários online`;
  }
}

console.log(userCountText(1)); // 1 usuário online
console.log(userCountText(2)); // 2 usuários online
console.log(userCountText(2000000)); // 2 milhões de usuários online
```

Entretanto, algo estranho acontece quando usamos o zero:

```ts
console.log(userCountText(0)); // 0 usuário online
```

A realidade é que a especificação do `CLDR` sobre [regras de plurais](https://www.unicode.org/cldr/charts/43/supplemental/language_plural_rules.html), em que o `Intl.PluralRules` se baseia, considera que `0` está dentro de `one` para o locale `pt` (como `pt-BR` está ausente na lista, os navegadores utilizam `pt` de "fallback").

Existe uma discussão na língua portuguesa a respeito do [uso do plural com o 0](https://ciberduvidas.iscte-iul.pt/artigos/rubricas/idioma/zero-com-ou-sem-plural/2837), mas ela está fora do escopo desse artigo. Para fazer o `0` ser parte da categoria `other`, você pode utilizar o locale `pt-PT`.

```ts
const ptBRplural = new Intl.PluralRules("pt-BR");
const ptPTplural = new Intl.PluralRules("pt-PT");

console.log(ptBRplural.select(0)); // one
console.log(ptPTplural.select(0)); // other
```

## Intl.ListFormat

Formata uma lista, seguindo as regras da língua.

```ts
const formatter = new Intl.ListFormat("pt", {
  type: "conjunction",
});

const users = ["John"];
console.log(formatter.format(users)); // John

users.push("Lennon");
console.log(formatter.format(users)); // John e Lennon

users.push("Ringo");
users.push("George");
console.log(formatter.format(users)); // John, Lennon, Ringo e George
```

Para utilizar "ou", utilizamos `type: "disjunction"`:

```ts
const formatter = new Intl.ListFormat("pt", {
  type: "disjunction",
});

const meansOfTransport = ["Carro", "Bicicleta", "Ônibus"];
console.log(formatter.format(meansOfTransport)); // Carro, Bicicleta ou Ônibus
```

## Intl.RelativeTimeFormat

O `RelativeTimeFormat` permite converter uma unidade em tempo relativo.

```ts
const relativeTime = new Intl.RelativeTimeFormat("pt");

console.log(relativeTime.format(2, "day")); // em 2 dias
console.log(relativeTime.format(12, "years")); // em 12 anos
console.log(relativeTime.format(-1, "week")); // há 1 semana
```

As unidades possíveis são:
`year`, `quarter`, `month`, `week`, `day`, `hour`, `minute` ou `second`.

Por padrão, o resultado é sempre númerico, mas você pode permitir o uso de frases idiomáticas:

```ts
const relativeTime = new Intl.RelativeTimeFormat("pt", {
  numeric: "auto",
});

console.log(relativeTime.format(2, "day")); // depois de amanhã
console.log(relativeTime.format(0, "years")); // este ano
console.log(relativeTime.format(1, "week")); // próxima semana
console.log(relativeTime.format(0, "second")); // agora
```

Entretanto, eu acho a API do `RelativeTimeFormat` pequena em relação à quantidade de possibilidades. Eu acho sempre muito difícil trabalhar com Tempo e Duração no Javascript com bibliotecas externas. Novas APIs estão por vir para facilitar essas tarefas, mas isso é assunto para outro post.

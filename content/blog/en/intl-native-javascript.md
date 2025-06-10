---
title: "Intl: Native Solutions for Formatting in JavaScript"
slug: "intl-native-javascript"
publishDate: 2025-05-01
draft: true
tags: ["javascript", "intl"]
description: "Converting JavaScript values to text, without needing an external library"
lang: "en"
---

`Intl` is a JavaScript API that provides functionality for creating internationalized text. However, it can be used in any case where you need to format JavaScript information into text, removing the need for external libraries.

One of the most well-known features is `Intl.DateTimeFormat`, which has been available since 2017. It's used to format dates and times:

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

However, there are other less known (but very useful) APIs that are also available through `Intl`.

## Intl.NumberFormat

`NumberFormat` is very useful for applications in Portuguese, since we use commas to represent decimal places.

```ts
const conversionRate = 3.7;
const portugueseNumberFormatter = Intl.NumberFormat("pt-BR");

console.log(portugueseNumberFormatter.format(conversionRate)); // 3,7
```

It's also possible to define a minimum or maximum number of digits after the comma (with the possibility of defining the rounding strategy):

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

And if you thought this is the solution to keep prices always in the necessary style, there's something better, a specific option to format prices and currencies:

```ts
const ticketPrice = 5.9;

const realFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});
console.log(realFormatter.format(ticketPrice)); // R$ 5,90
```

And even units can be used:

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

Other options and examples are available on [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat).

## Intl.PluralRules

> 1 users online

It's very easy to forget to include plural rules. And checking manually can be repetitive.

<!-- prettier-ignore-start -->
```ts
`${userCount} ${ userCount > 1 ? "users" : "user" } online`;
```
<!-- prettier-ignore-end -->

`Intl.PluralRules` provides help by returning the cardinal category based on the number:

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

However, something strange happens when we use zero:

```ts
console.log(userCountText(0)); // 0 users online
```

The reality is that the CLDR specification on [plural rules](https://www.unicode.org/cldr/charts/43/supplemental/language_plural_rules.html), which `Intl.PluralRules` is based on, considers that `0` is within `other` for the `en` locale.

There's a discussion in Portuguese about the [use of plurals with 0](https://ciberduvidas.iscte-iul.pt/artigos/rubricas/idioma/zero-com-ou-sem-plural/2837), but it's outside the scope of this article. To make `0` part of the `other` category, you can use the `pt-PT` locale for Portuguese.

```ts
const ptBRplural = new Intl.PluralRules("pt-BR");
const ptPTplural = new Intl.PluralRules("pt-PT");

console.log(ptBRplural.select(0)); // one
console.log(ptPTplural.select(0)); // other
```

## Intl.ListFormat

Formats a list, following the rules of the language.

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

To use "or", we use `type: "disjunction"`:

```ts
const formatter = new Intl.ListFormat("en", {
  type: "disjunction",
});

const meansOfTransport = ["Car", "Bicycle", "Bus"];
console.log(formatter.format(meansOfTransport)); // Car, Bicycle, or Bus
```

## Intl.RelativeTimeFormat

`RelativeTimeFormat` allows converting a unit into relative time.

```ts
const relativeTime = new Intl.RelativeTimeFormat("en");

console.log(relativeTime.format(2, "day")); // in 2 days
console.log(relativeTime.format(12, "years")); // in 12 years
console.log(relativeTime.format(-1, "week")); // 1 week ago
```

The possible units are:
`year`, `quarter`, `month`, `week`, `day`, `hour`, `minute`, or `second`.

By default, the result is always numeric, but you can allow the use of idiomatic phrases:

```ts
const relativeTime = new Intl.RelativeTimeFormat("en", {
  numeric: "auto",
});

console.log(relativeTime.format(2, "day")); // day after tomorrow
console.log(relativeTime.format(0, "years")); // this year
console.log(relativeTime.format(1, "week")); // next week
console.log(relativeTime.format(0, "second")); // now
```

However, I find the `RelativeTimeFormat` API small compared to the number of possibilities. I always find it very difficult to work with Time and Duration in JavaScript with external libraries. New APIs are coming to facilitate these tasks, but that's a topic for another post.

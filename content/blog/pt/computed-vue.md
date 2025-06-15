---
title: "Computed e Avaliação Sob Demanda"
slug: "lazy-computed"
publishDate: 2025-06-16
draft: true
tags: ["javascript", "vue"]
description: "Reagindo só quando é necessário"
lang: "pt"
---

No meu último post, falei sobre como o Vue executa funções de template e `watch` [em lote](/batch-effects-vue). Porém, existe outra forma de reatividade no Vue: as propriedades computadas, usando o `computed`. O `computed` serve para estados derivados, aplicando operações sobre uma ou mais `refs`.

O `computed` também é um efeito, assim como `watch` e funções de template, mas possui sua própria regra de execução: ele só é reavaliado sob demanda.

```vue
<script setup>
import { ref, computed } from "vue";

const msg = ref("Hello World!");
const showTitle = ref(false);

const upper = computed(() => {
  console.log("computed");
  return msg.value.toUpperCase();
});
</script>

<template>
  <div>
    <button @click="showTitle = !showTitle">Toggle Title</button>
  </div>

  <input v-model="msg" />
  <h1 v-if="showTitle">{{ upper }}</h1>
</template>
```

[Link para playground](https://play.vuejs.org/#eNp9Uk1P4zAQ/SuDL02lbiK0e2LTaheEBBwAQREXX0IySQ2ObfkjVIry3xknpPSAuM3Mex6/NzM9+29M2gVkZyx3pRXGg0MfzIYr0RptPfRgsV5BqVsTPFYwQG11Cwt6tOCKq1Ir56F1DawjM1lcoZQanrWV1cli+XdmuJ1+3wov8ZNXF9JhhGdCMAYtgfNPSbKE9Qb6yACqKqclplI3CWczh7NlBC1JtiqKSLtCBky9fordLgqHCTGG+E+eTQbJGiUeWyMLj5QB5JXoxoDCl+C9VvCvlKJ8W3N2rPvkkHC22eqmoeqY5tn0bOqWTe3GWCgSCt2vVlcoqR1p5Ayyibg7JUTUx79Q477/nMUw5NnulKh5diSXrZh3NI5aNOmr04pWRzMCmKYiJNo74wWNi7OzOL3oirOClvJ+M9a8Dbia6+UOy7dv6q9uH2uc3Vt0aDsSdsB8YRv0E3z5eIt7ig8gGQ3Rxg/gA9IqQ9Q40c6Dqkj2EW9Uez0eoFDN1l3uPSo3m4pCI3MY+ZzRKV78YP1L7u/0z/iOLoINH4o4AKE=)

Note no exemplo que a função de template lê o valor de `upper` apenas se `showTitle` for `true`.
Experimente esconder o título e modificar o texto: o `computed` só será executado (e apenas uma vez)
quando você mostrar o título novamente.

E como já sabemos que o Vue reexecuta a função de template em lote, mesmo que `upper` dependa de `msg`,
ele só será recalculado quando a função de template for executada.

```vue
<script setup>
import { ref, computed } from "vue";

const msg = ref("Hello World!");

function newWords() {
  msg.value += " ";
  msg.value += "Hello";
  msg.value += " ";
  msg.value += "World";
  msg.value += "!";
}

const upper = computed(() => {
  console.log("computed");
  return msg.value.toUpperCase();
});
</script>

<template>
  <input v-model="msg" />
  <button @click="newWords">More words</button>
  <h1>{{ upper }}</h1>
</template>
```

[Link para playground](https://play.vuejs.org/#eNp9UttO4zAQ/ZXBL0213VSr3Sc2rXZBSIDERVzEi19CMg0Bx7Z8aStF+XfGNqFIFKQ8xHPOjM8545791zpfe2SHrLCVabUDi87rJZdtp5Vx0IPB1Qwq1WnvsIYBVkZ1MKGmCZdcVkpaB51tYBGY2eQUhVDwoIyoDybTv4Gz8rJyrZIgcUNAbbMp9FxCaMvXpfAIPxbAGX3E/1SOE/dDX3TE2/dDB7E87KR7rdGQ+NFhRuIWy6QvMJTAXKgm42xkcDYNoKGgjNzNz526D7OOS4sZMYZgvpinWClQOjjstCgd0gmgaCWNg/XPTtUoFpzRJHI0T+Cjd44S+1eJtnohcIyOs+WFMgibcCjmiZZann4t+/7NzzAUczoHAR8uZTPmLJlatU3+bJWktUefyVsr0FzpsCi65TAlELCS4t+cx5ozHmdjvXrC6mVP/dluQ42za4MWzRo5e8dcaRp0CT65vcQt/b+DFIQXxP4GvEFaiA8aE+3Iy5pkf+BFtWfx8bayubMnW4fSjqaC0MAcIp8zesbH31jfyf2d/4l9tFc2vALVzRFa)

Note que nesse caso **não é** o `upper` que está sendo executado em lote, e sim a função de template.
Se você acessar o valor de `upper` dentro da função `newWords`, a função do `computed` será reexecutada a cada acesso.

```ts
function newWords() {
  msg.value += " ";
  console.log(upper.value); // upper será executado
  msg.value += "Hello";
  console.log(upper.value); // upper será executado
  msg.value += " ";
  console.log(upper.value); // upper será executado
  msg.value += "World";
  console.log(upper.value); // upper será executado
  msg.value += "!";
  console.log(upper.value); // upper será executado
}
```

No entanto, o Vue também inclui outra otimização: cache. Se as dependências do `computed` não mudaram,
a função não será reexecutada, independentemente da quantidade de acessos.

```vue
<script setup>
import { ref, computed } from "vue";

const msg = ref("Hello World!");
const savedUpperMsg = ref([]);

function saveMsg() {
  savedUpperMsg.value.push(upper.value);
  console.log("adding to the list:", upper.value);
}

const upper = computed(() => {
  console.log("computed");
  return msg.value.toUpperCase();
});
</script>

<template>
  <input v-model="msg" />
  <button @click="saveMsg">Save Msg</button>
  <div v-for="msg in savedUpperMsg">
    {{ msg }}
  </div>
</template>
```

[Link para o playground](https://play.vuejs.org/#eNp9Uk2P0zAQ/SuDL02lkh7gVNIKWK0ESHyIBXHAHEIySb3r2JY/QqUo/52xvelupdXe7HlvZt68mYm9M6YcA7Idq1xjhfHg0Adz4EoMRlsPE1jsNtDowQSPLczQWT3AipJWXHHVaOU8DK6HfWQWqw8opYZf2sr2xWr9ZmG4esT2pzFoP5+5v/9EnKsuqMYLrRKJ4GINE1dwmVOOtQxYmuCORYixHFhHYmyhJZZS9wVnddsK1YPX4I8IUji/42wDl0nzg/gEkKRlxoL67w9ZwmXlhcFZamvJKqvi8PfivE5qr2qHRewRx6u22ViylD4eByNrj/QDqISicjC+HHSLcs8ZVeIMthn8G7wnT942UjR3BN6bw9nhhl5Az2qbOZnfipFKddrmQiCyn2cDKTHyAKYp7WsmCyhtS3kEVNtH0tiGeUejd6Ivb51WdB7JjeyAkGi/mrgwx9ku+xSxmhb/71OKeRtws8SbIzZ3T8Rv3SnGOPtm0aEdkba0YL62PfoMX998wRO9zyDZFSSxnwG/I60tRI2Z9j6olmQ/4iW1H9OR07X8cNcnj8otQ0WhkTknPmd07lfPjP4g91X5OuXR9tn8H+PZJTI=)

Note que, mesmo acessando o valor de `upper` várias vezes, se o valor de `msg` não mudou,
a função do `computed` não é executada novamente.

## Conclusão

O Vue oferece otimizações automáticas para propriedades `computed` que garantem eficiência ao evitar
execuções desnecessárias. Isso permite que você foque na lógica da sua aplicação sem se preocupar
com performance.

Para aproveitar ao máximo esses benefícios:

- Mantenha seus `computed` sempre **puros** (sem efeitos colaterais)
- Evite operações custosas ou assíncronas dentro de `computed`
- Use `computed` para dados derivados, em vez de múltiplas `refs` e `watch`

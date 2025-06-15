---
title: "Computed and On-Demand Evaluation"
slug: "lazy-computed"
publishDate: 2025-06-16
draft: true
tags: ["javascript", "vue"]
description: "Reacting only when necessary"
lang: "en"
---

In my last post, I talked about how Vue batches template functions and `watch` [effects](/en/blog/batched-effects-vue). However, there's another form of reactivity in Vue: computed properties, using `computed`. The `computed` function is used for derived state, applying operations over one or more `refs`.

`computed` is also an effect, just like `watch` and template functions, but it has its own execution rule: it is only re-evaluated on demand.

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

[Playground link](https://play.vuejs.org/#eNp9Uk1P4zAQ/SuDL02lbiK0e2LTaheEBBwAQREXX0IySQ2ObfkjVIry3xknpPSAuM3Mex6/NzM9+29M2gVkZyx3pRXGg0MfzIYr0RptPfRgsV5BqVsTPFYwQG11Cwt6tOCKq1Ir56F1DawjM1lcoZQanrWV1cli+XdmuJ1+3wov8ZNXF9JhhGdCMAYtgfNPSbKE9Qb6yACqKqclplI3CWczh7NlBC1JtiqKSLtCBky9fordLgqHCTGG+E+eTQbJGiUeWyMLj5QB5JXoxoDCl+C9VvCvlKJ8W3N2rPvkkHC22eqmoeqY5tn0bOqWTe3GWCgSCt2vVlcoqR1p5Ayyibg7JUTUx79Q477/nMUw5NnulKh5diSXrZh3NI5aNOmr04pWRzMCmKYiJNo74wWNi7OzOL3oirOClvJ+M9a8Dbia6+UOy7dv6q9uH2uc3Vt0aDsSdsB8YRv0E3z5eIt7ig8gGQ3Rxg/gA9IqQ9Q40c6Dqkj2EW9Uez0eoFDN1l3uPSo3m4pCI3MY+ZzRKV78YP1L7u/0z/iOLoINH4o4AKE=)

Notice in the example that the template function only reads the value of `upper` if `showTitle` is `true`.
Try hiding the title and modifying the text: the `computed` will only execute (and only once)
when you show the title again.

And as we already know that Vue batches template function executions, even though `upper` depends on `msg`,
it will only be recalculated when the template function is executed.

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

[Playground link](https://play.vuejs.org/#eNp9UttO4zAQ/ZXBL0213VSr3Sc2rXZBSIDERVzEi19CMg0Bx7Z8aStF+XfGNqFIFKQ8xHPOjM8545791zpfe2SHrLCVabUDi87rJZdtp5Vx0IPB1Qwq1WnvsIYBVkZ1MKGmCZdcVkpaB51tYBGY2eQUhVDwoIyoDybTv4Gz8rJyrZIgcUNAbbMp9FxCaMvXpfAIPxbAGX3E/1SOE/dDX3TE2/dDB7E87KR7rdGQ+NFhRuIWy6QvMJTAXKgm42xkcDYNoKGgjNzNz526D7OOS4sZMYZgvpinWClQOjjstCgd0gmgaCWNg/XPTtUoFpzRJHI0T+Cjd44S+1eJtnohcIyOs+WFMgibcCjmiZZann4t+/7NzzAUczoHAR8uZTPmLJlatU3+bJWktUefyVsr0FzpsCi65TAlELCS4t+cx5ozHmdjvXrC6mVP/dluQ42za4MWzRo5e8dcaRp0CT65vcQt/b+DFIQXxP4GvEFaiA8aE+3Iy5pkf+BFtWfx8bayubMnW4fSjqaC0MAcIp8zesbH31jfyf2d/4l9tFc2vALVzRFa)

Notice that in this case, it is **not** `upper` that is being batched, but the template function.
If you access the value of `upper` inside the `newWords` function, the `computed` function will be re-executed on every access.

```ts
function newWords() {
  msg.value += " ";
  console.log(upper.value); // upper will be executed
  msg.value += "Hello";
  console.log(upper.value); // upper will be executed
  msg.value += " ";
  console.log(upper.value); // upper will be executed
  msg.value += "World";
  console.log(upper.value); // upper will be executed
  msg.value += "!";
  console.log(upper.value); // upper will be executed
}
```

However, Vue also includes another optimization: caching. If the dependencies of the `computed` haven't changed,
the function won't be re-executed, regardless of how many times it is accessed.

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

[Playground link](https://play.vuejs.org/#eNp9Uk2P0zAQ/SuDL02lkh7gVNIKWK0ESHyIBXHAHEIySb3r2JY/QqUo/52xvelupdXe7HlvZt68mYm9M6YcA7Idq1xjhfHg0Adz4EoMRlsPE1jsNtDowQSPLczQWT3AipJWXHHVaOU8DK6HfWQWqw8opYZf2sr2xWr9ZmG4esT2pzFoP5+5v/9EnKsuqMYLrRKJ4GINE1dwmVOOtQxYmuCORYixHFhHYmyhJZZS9wVnddsK1YPX4I8IUji/42wDl0nzg/gEkKRlxoL67w9ZwmXlhcFZamvJKqvi8PfivE5qr2qHRewRx6u22ViylD4eByNrj/QDqISicjC+HHSLcs8ZVeIMthn8G7wnT942UjR3BN6bw9nhhl5Az2qbOZnfipFKddrmQiCyn2cDKTHyAKYp7WsmCyhtS3kEVNtH0tiGeUejd6Ivb51WdB7JjeyAkGi/mrgwx9ku+xSxmhb/71OKeRtws8SbIzZ3T8Rv3SnGOPtm0aEdkba0YL62PfoMX998wRO9zyDZFSSxnwG/I60tRI2Z9j6olmQ/4iW1H9OR07X8cNcnj8otQ0WhkTknPmd07lfPjP4g91X5OuXR9tn8H+PZJTI=)

Notice that, even when accessing the value of `upper` multiple times, if the value of `msg` hasn't changed,
the `computed` function is not executed again.

## Conclusion

Vue provides automatic optimizations for `computed` properties that ensure efficiency by avoiding
unnecessary executions. This allows you to focus on your application's logic without worrying
about performance.

To make the most of these benefits:

- Keep your `computed` properties **pure** (no side effects)
- Avoid expensive or asynchronous operations inside `computed`
- Use `computed` for derived data, instead of multiple `refs` and `watch`

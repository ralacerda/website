---
title: "Vue and Batched Effects"
slug: "batched-effects-vue"
publishDate: 2025-06-13
draft: true
tags: ["javascript", "vue"]
description: "Understanding when your effects take effect in Vue.js"
lang: "en"
---

Vue's reactivity is based on "subscriptions". When an effect reads a `ref`,
Vue registers that this effect depends on that value. When the value is updated, 
Vue executes that effect again.

When you write a `<template>` block in a `.vue` file, the build process
transforms it into a render function (similar to what happens
with JSX). That is, if you use a `ref` in your template, when that `ref` changes, 
your template function will be executed again. 

Another way to create effects is with `watchEffect`. Similarly, if your `watchEffect` callback
reads some `ref`, and that `ref` changes, the callback will be called again. 

```vue
<script setup>
import { ref, watchEffect } from 'vue';

const count = ref(0);

function increaseCount() {
  count.value++
}

watchEffect(async () => {
  console.log("count increased", count.value)
})
</script>

<template>
  <p>Counter is {{ count }}</p>
  <button @click="increaseCount">Inc</button>
</template>
```

[Playground link](https://play.vuejs.org/#eNp9kstOwzAQRX/F8oZWVCkSrCCteKgLWAAClt4Ed9K6dcaWH21RlH9nnBAICHURKZ57Z3LuxDW/sTbbReCXXGDupVM2MA8h2rlAVVnjAqvZvghyvShLkIE1rHSmYifUdHI18Dgo/2oCpUEfmDQRA5sly+hs3AplRBmUQaZQOig83CXPaMxqgaxryHaFjnB6KrBJHQOGUeE/UDJyz+Z9A3qjIdNmNRK8+14/WfDJcOCY5tGTT7uwFJMOASqriwB0Yiy385YGHFOe1fUXf9Pk07QVMrzHEIj9WmoltzPBf4UQfH6PMp92JmrIp4PxfMKDJ9xSrbKNN0iLbxMk6soqDe7JpsV4wS+7bEkrtDb7h7YWXIRJX5drkNt/6ht/SDXBnx14cLu0hF4LhVsBUSZ58foIB3r/FiuzjJrcR8QXoFXHxNjZbiMuCXvga2nv24uhcPXmF4cA6PtQCTQ5m9YvOF2WuyPRf3DPs4u2j34gbz4Bh+btZg==)

In this example, every time `increaseCount` is called, we change the value of `count`, which makes
the `<template>` function execute again, resulting in DOM updates.
Since we have a `watchEffect` that reads `count`, we also display a log message in the console.

But what happens if we modify `count` more than once in the same function?

```ts
function increaseCount() {
  count.value++
  count.value++
  count.value++
  count.value++
}
```

Fortunately, Vue already has an optimization for this, executing both effects only once, even though we
modified `count` 4 times. Try modifying the function in the playground above.

Vue uses a simple strategy of "scheduling" that these effects need to be re-executed,
and then executes these effects in batches. Besides improving performance, avoiding that the same `watchEffect`
executes multiple times or that the DOM is modified multiple times unnecessarily, Vue also
manages to organize the order in which these effects are executed (effects in parent components should happen
before effects in child components).

However, Vue provides ways to "escape" this behavior when necessary.

## Acting after DOM updates

You've probably encountered the following behavior in Vue: you can't 
access a DOM element in the same function that changed its visibility.

```vue
<script setup>
import { ref } from 'vue';

const showInput = ref(false);

function toggleInput() {
  showInput.value = !showInput.value;

  if (showInput.value) {
    const input = document.getElementById('input');
    input?.focus()
  }
}

</script>

<template>
  <button @click="toggleInput">Mostrar input</button>
  <input id="input" v-if="showInput" >
</template>
```

[Playground link](https://play.vuejs.org/#eNp9kk9P4zAQxb/KrC9NJTY97J7YwO6y6qEr8UfA0ZfgTILBsS17XIqqfnfGDi0IIaQcPG9+47xneyv+el+vE4pj0UQVtCeISMmfSqtH7wLBFgL2sIM+uBFmjM5+SSutcjYye++eVtYngpOMVX1rIs4L0CerSDsL5IbBYKGqOWylhbexet2ahDz87YNUtgDQPVQfOq9bAEwO9OvfO6fSiJbqAWlpMC/PnlddNSvALHvKQ6X6XfdMx2qetZ20/EnbLKb8nJwLwtGblpArgOYuEXGSP8po9XgixbtIUpyeu0ihDdPezWKCp8HJne54piylgPV33XN5SMUSs83i8EdxJChyuF4P9UN0lq+mJJZCudFrg+HS54ONUhzvz0KK1hj39L9oFBIe7XV1j+rxE/0hbrImxVXAiGGNUhx61AY+xam9vLnADa8PzdF1yTD9RfMaozMpe5yws2Q7tv2OK25X5YFpO9zG5YbQxn2obLRcTeGl4Ef374vob3Z/1D/3Vyp2L9R7+Qc=)

When `toggleInput` modifies the value of `showInput`, Vue schedules the template function
to be re-executed. However, when we try to select the element,
the `input` is not yet in the DOM.

In this case, we need to use `nextTick()`, where the "tick" is the execution of template functions
that will update the DOM. You can either pass a callback that will be executed right after, or await
the Promise it returns.

```ts
function toggleInput() {
  showInput.value = !showInput.value;

  if (showInput.value) {
    nextTick(() => {
      const input = document.getElementById('input');
      input?.focus()
    })
  }
}

// OR

async function toggleInput() {
  showInput.value = !showInput.value;

  if (showInput.value) {
    await nextTick()
    const input = document.getElementById('input');
    input?.focus()
  }
}
```

## Effect order

The order of these executions is also important. A `watch` or `watchEffect` always happens before
the DOM is updated. Therefore, even using `nextTick` inside a `watchEffect`, 
you don't have access to the updated version of the DOM.

```vue
<script setup>
import { nextTick } from 'vue';
import { ref, watchEffect } from 'vue';

const showInput = ref(false);

async function toggleInput() {
  showInput.value = !showInput.value;
}

watchEffect(async () => {
  if (showInput.value) {
    const input = document.getElementById('input');
    await nextTick();
    // Não vai funcionar
    input?.focus();
  }
})
</script>

<template>
  <button @click="toggleInput">Mostrar input</button>
  <input v-if="showInput" id="input">
</template>
```

[Playground Link](https://play.vuejs.org/#eNp9Uk2P2jAQ/SuuLwSJZg/tiQJtt+JApX6o3aMvqRkH7zp2ZI+BFeK/d2wTNkKrvSVv3rx588Yn/rXv630EPueLIL3ukQXA2K+E1V3vPLITs3DEBy2f2Jkp7zo2If7k04jgQc3YoUG5WysFEm+JwkpnAynv3GFj+4hsmXoq1ZgA00xowrOVTEUrUTvL0LWtgcytpuwkLHtprveNiUAS724gEjonrZGTquiSxnKVZJKQVqy66byMYKz41BePWydjBxbrFnBtIH3eP2+21SQTJsl5amoOjcZrStUAZ9LnWpFIuIBk7zwrs5SJYTdngvcuoOBUmAq7uCs3oPTpB6HrTYNAf4wt/kVESuaLNDRkKfgoIsFXP0jFN74MXdwVcmks2+zfa0Vd18UFZ3pLQK6SQBo+GshnHAOloXRbPwZn6X1k24JL1/XagP/Vp0sFwedDeII3xrjD94yhjzAbcLkD+fQK/hiOCRP8t4cAfg+CX2vYeIq9lNd/f1K6o2LnttEQ+43iHwjOxOSx0O6j3ZLtES+73eRHrG37ENZHBBuGpZLRfLPMF5ze8rc3Vn+x+6H+ONyan/8DvJwm9A==)

Vue provides two ways to work around this problem. You can pass the `flush: 'post'` option or use `watchPostEffect`, which is a "pre-configured" version of `watchEffect` with this option already set.

```ts
watchEffect(() => {
  if (showInput.value) {
    const input = document.getElementById('input');
    input?.focus();
  }
}, {
  flush: "post"
})

// or

watchPostEffect(() => {
  if (showInput.value) {
    const input = document.getElementById('input');
    input?.focus();
  }
})
```

## Synchronous effects

Another possibility that Vue offers is to execute watchers immediately, using the `flush: 'sync'` option or `watchSyncEffect`.
Going back to the previous example:

```ts
watchEffect(async () => {
  console.log("count increased", count.value)
}, {
  flush: "sync"
})

// or

watchSyncEffect(async () => {
  console.log("count increased", count.value)
})
```

Now we'll have a log for each time the state is modified.
Of course, **great** care is needed, synchronous effects can cause performance issues and infinite loops if not used correctly.

## Conclusion

Except in cases where you need to access or modify the DOM, you rarely need to worry 
about the order of effects or when these changes will happen. Vue has many
abstractions and optimizations, and it's important not to try to optimize before you actually have a problem.
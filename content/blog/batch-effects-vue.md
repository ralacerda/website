---
title_pt: "Vue e Efeitos Processados em Lote"
title_en: "Vue and Batched Effects"
slug: "batched-effects-vue"
publishDate: 2025-06-13
draft: false
tags: ["javascript", "vue"]
description_pt: "Entendendo quando seus efeitos fazem efeito no Vue.js"
description_en: "Understanding when your effects take effect in Vue.js"
---

::lang-block{lang="pt"}
A reatividade do Vue é baseada em "inscrições". Quando um efeito lê uma `ref`,
o Vue registra que esse efeito depende desse valor. Quando o valor é atualizado,
o Vue executa novamente esse efeito.

Quando você escreve um bloco `<template>` em um arquivo `.vue`, o processo de build
transforma aquilo em uma função de renderização (semelhante ao que acontece
com o JSX). Ou seja, se você utiliza uma `ref` no seu template, quando essa `ref` mudar,
a sua função de template será executada novamente.

Outra forma de criar efeitos é com um `watchEffect`. Da mesma forma, se o callback do seu `watchEffect`
ler alguma `ref`, e essa `ref` mudar, o callback será chamado novamente.
::

::lang-block{lang="en"}
Vue's reactivity is based on "subscriptions". When an effect reads a `ref`,
Vue registers that this effect depends on that value. When the value is updated,
Vue executes that effect again.

When you write a `<template>` block in a `.vue` file, the build process
transforms it into a render function (similar to what happens
with JSX). That is, if you use a `ref` in your template, when that `ref` changes,
your template function will be executed again.

Another way to create effects is with `watchEffect`. Similarly, if your `watchEffect` callback
reads some `ref`, and that `ref` changes, the callback will be called again.
::

```vue
<script setup>
import { ref, watchEffect } from "vue";

const count = ref(0);

function increaseCount() {
  count.value++;
}

watchEffect(() => {
  console.log("count increased", count.value)
})
</script>

<template>
  <p>Counter is {{ count }}</p>
  <button @click="increaseCount">Inc</button>
</template>
```

:lang-link{href="https://play.vuejs.org/#eNp9ks1OwzAQhF/F8qWtWqVIcCppBFQ9lAMg4OhLcDepW8e2/NNWivLurBMCAaEeIsU7s5tvNq7pvTHJMQBdUKZSx60wnjjwwWRMicpo60lNTrnnu3VRAPekIYXVFRlh0+h24LFQ/NWY4lo5T7gOypNltIyvJq1QBMW90IoIxS3kDlbRM56QminSNSTHXAaYTplqYseAYYy+ZdZbldMSEqnLMaPdl/qZjM6GoyY4CZ903sXEgHjwUBmZe8ATIanJWg6wRDhS11/kTZPO4z7Q8BG8R+o7LgU/LBn9hc9otlE8nXcmbEjng/F0Rr1D3EKUyd5phStvE0TqyggJ9tnElThGF122qOVS6tNjW/M2wKyv8x3wwz/1vTvHGqMvFhzYY1xCr/ncloCUUV6/PcEZ37/FSm+DRPcF8RVw1SEydraHoLaIPfC1tJv2SghVvrv12YNyfagIGp1N62cUr8nqQvQf3Ovkpu3DH0ibT3+96yg=" pt="Link para o playground" en="Playground link"}

::lang-block{lang="pt"}
Nesse exemplo, cada vez que `increaseCount` é chamado, alteramos o valor de `count`, o que faz
a função `<template>` ser executada novamente, resultando na atualização do DOM.
Como temos um `watchEffect` que lê `count`, também exibimos uma mensagem de log no console.

Mas o que acontece se modificarmos `count` mais de uma vez na mesma função?
::

::lang-block{lang="en"}
In this example, every time `increaseCount` is called, we change the value of `count`, which makes
the `<template>` function execute again, resulting in DOM updates.
Since we have a `watchEffect` that reads `count`, we also display a log message in the console.

But what happens if we mutate `count` more than once in the same function?
::

```ts
function increaseCount() {
  count.value++;
  count.value++;
  count.value++;
  count.value++;
}
```

::lang-block{lang="pt"}
Felizmente, o Vue já possui uma otimização para isso, executando ambos os efeitos apenas uma vez, mesmo tendo
modificado `count` 4 vezes. Experimente modificar a função no playground acima.

O Vue usa uma estratégia simples de "agendar" que esses efeitos precisam ser re-executados,
e depois executa esses efeitos em lote. Além de melhorar a performance, evitando que um mesmo `watchEffect`
execute várias vezes ou que o DOM seja modificado múltiplas vezes desnecessariamente, o Vue também
consegue organizar a ordem em que esses efeitos são executados (efeitos em componentes pais devem acontecer
antes de efeitos em componentes filhos).

Entretanto, o Vue fornece formas de "escapar" desse comportamento quando necessário.

## Atuando depois de atualizar o DOM

Você provavelmente já encontrou o seguinte comportamento no Vue: você não consegue
acessar um elemento DOM na mesma função que alterou a visibilidade dele.
::

::lang-block{lang="en"}
Fortunately, Vue already has an optimization for this, executing both effects only once, even though we
mutated `count` 4 times. Try modifying the function in the playground above.

Vue uses a simple strategy of "scheduling" that these effects need to be re-executed,
and then executes these effects in batches. Besides improving performance, avoiding that the same `watchEffect`
executes multiple times or that the DOM is mutated multiple times unnecessarily, Vue also
manages to organize the order in which these effects are executed (effects in parent components should happen
before effects in child components).

However, Vue provides ways to "escape" this behavior when necessary.

## Acting after DOM updates

You've probably encountered the following behavior in Vue: you can't
access a DOM element in the same function that changed its visibility.
::

```vue
<script setup>
import { ref } from "vue";

const showInput = ref(false);

function toggleInput() {
  showInput.value = !showInput.value;

  if (showInput.value) {
    const input = document.getElementById("input");
    input?.focus();
  }
}
</script>

<template>
  <button @click="toggleInput">Show input</button>
  <input id="input" v-if="showInput" />
</template>
```

::lang-block{lang="pt"}
[Link para playground](https://play.vuejs.org/#eNp9kk9P4zAQxb/KrC9NJTY97J7YwO6y6qEr8UfA0ZfgTILBsS17XIqqfnfGDi0IIaQcPG9+47xneyv+el+vE4pj0UQVtCeISMmfSqtH7wLBFgL2sIM+uBFmjM5+SSutcjYye++eVtYngpOMVX1rIs4L0CerSDsL5IbBYKGqOWylhbexet2ahDz87YNUtgDQPVQfOq9bAEwO9OvfO6fSiJbqAWlpMC/PnlddNSvALHvKQ6X6XfdMx2qetZ20/EnbLKb8nJwLwtGblpArgOYuEXGSP8po9XgixbtIUpyeu0ihDdPezWKCp8HJne54piylgPV33XN5SMUSs83i8EdxJChyuF4P9UN0lq+mJJZCudFrg+HS54ONUhzvz0KK1hj39L9oFBIe7XV1j+rxE/0hbrImxVXAiGGNUhx61AY+xam9vLnADa8PzdF1yTD9RfMaozMpe5yws2Q7tv2OK25X5YFpO9zG5YbQxn2obLRcTeGl4Ef374vob3Z/1D/3Vyp2L9R7+Qc=)

Quando `toggleInput` modifica o valor de `showInput`, o Vue agenda a função de template
para ser re-executada. Entretanto, quando tentamos selecionar o elemento,
o `input` ainda não está no DOM.

Nesse caso, precisamos utilizar `nextTick()`, onde o "tick" é a execução das funções de template
que vão atualizar o DOM. Você pode tanto passar um callback que será executado logo após, quanto aguardar
a Promise que ele retorna.
::

::lang-block{lang="en"}
[Playground link](https://play.vuejs.org/#eNp9kk9P4zAQxb/KrC9NJTY97J7YwO6y6qEr8UfA0ZfgTILBsS17XIqqfnfGDi0IIaQcPG9+47xneyv+el+vE4pj0UQVtCeISMmfSqtH7wLBFgL2sIM+uBFmjM5+SSutcjYye++eVtYngpOMVX1rIs4L0CerSDsL5IbBYKGqOWylhbexet2ahDz87YNUtgDQPVQfOq9bAEwO9OvfO6fSiJbqAWlpMC/PnlddNSvALHvKQ6X6XfdMx2qetZ20/EnbLKb8nJwLwtGblpArgOYuEXGSP8po9XgixbtIUpyeu0ihDdPezWKCp8HJne54piylgPV33XN5SMUSs83i8EdxJChyuF4P9UN0lq+mJJZCudFrg+HS54ONUhzvz0KK1hj39L9oFBIe7XV1j+rxE/0hbrImxVXAiGGNUhx61AY+xam9vLnADa8PzdF1yTD9RfMaozMpe5yws2Q7tv2OK25X5YFpO9zG5YbQxn2obLRcTeGl4Ef374vob3Z/1D/3Vyp2L9R7+Qc=)

When `toggleInput` mutates the value of `showInput`, Vue schedules the template function
to be re-executed. However, when we try to select the element,
the `input` is not yet in the DOM.

In this case, we need to use `nextTick()`, where the "tick" is the execution of template functions
that will update the DOM. You can either pass a callback that will be executed right after, or await
the Promise it returns.
::

```ts
function toggleInput() {
  showInput.value = !showInput.value;

  if (showInput.value) {
    nextTick(() => {
      const input = document.getElementById("input");
      input?.focus();
    });
  }
}

// OU / OR

async function toggleInput() {
  showInput.value = !showInput.value;

  if (showInput.value) {
    await nextTick();
    const input = document.getElementById("input");
    input?.focus();
  }
}
```

::lang-block{lang="pt"}
## Ordem dos efeitos

A ordem dessas execuções também é importante. Um `watch` ou `watchEffect` acontece sempre antes
do DOM ser atualizado. Portanto, mesmo utilizando `nextTick` dentro de um `watchEffect`,
você não tem acesso à versão atualizada do DOM.
::

::lang-block{lang="en"}
## Effect order

The order of these executions is also important. A `watch` or `watchEffect` always happens before
the DOM is updated. Therefore, even using `nextTick` inside a `watchEffect`,
you don't have access to the updated version of the DOM.
::

```vue
<script setup>
import { nextTick } from "vue";
import { ref, watchEffect } from "vue";

const showInput = ref(false);

async function toggleInput() {
  showInput.value = !showInput.value;
}

watchEffect(async () => {
  if (showInput.value) {
    const input = document.getElementById("input");
    await nextTick();
    // This won't work
    input?.focus();
  }
});
</script>

<template>
  <button @click="toggleInput">Toggle Input</button>
  <input v-if="showInput" id="input" />
</template>
```

::lang-block{lang="pt"}
[Link do Playground](https://play.vuejs.org/#eNp9Uk2P2jAQ/SuuLwSJZg/tiQJtt+JApX6o3aMvqRkH7zp2ZI+BFeK/d2wTNkKrvSVv3rx588Yn/rXv630EPueLIL3ukQXA2K+E1V3vPLITs3DEBy2f2Jkp7zo2If7k04jgQc3YoUG5WysFEm+JwkpnAynv3GFj+4hsmXoq1ZgA00xowrOVTEUrUTvL0LWtgcytpuwkLHtprveNiUAS724gEjonrZGTquiSxnKVZJKQVqy66byMYKz41BePWydjBxbrFnBtIH3eP2+21SQTJsl5amoOjcZrStUAZ9LnWpFIuIBk7zwrs5SJYTdngvcuoOBUmAq7uCs3oPTpB6HrTYNAf4wt/kVESuaLNDRkKfgoIsFXP0jFN74MXdwVcmks2+zfa0Vd18UFZ3pLQK6SQBo+GshnHAOloXRbPwZn6X1k24JL1/XagP/Vp0sFwedDeII3xrjD94yhjzAbcLkD+fQK/hiOCRP8t4cAfg+CX2vYeIq9lNd/f1K6o2LnttEQ+43iHwjOxOSx0O6j3ZLtES+73eRHrG37ENZHBBuGpZLRfLPMF5ze8rc3Vn+x+6H+ONyan/8DvJwm9A==)

O Vue fornece duas formas de contornar esse problema. Você pode passar a opção `flush: 'post'` ou utilizar `watchPostEffect`, que é uma versão "pré-configurada" do `watchEffect` com essa opção já definida.
::

::lang-block{lang="en"}
[Playground Link](https://play.vuejs.org/#eNp9Uk2P2jAQ/SuuLwSJZg/tiQJtt+JApX6o3aMvqRkH7zp2ZI+BFeK/d2wTNkKrvSVv3rx588Yn/rXv630EPueLIL3ukQXA2K+E1V3vPLITs3DEBy2f2Jkp7zo2If7k04jgQc3YoUG5WysFEm+JwkpnAynv3GFj+4hsmXoq1ZgA00xowrOVTEUrUTvL0LWtgcytpuwkLHtprveNiUAS724gEjonrZGTquiSxnKVZJKQVqy66byMYKz41BePWydjBxbrFnBtIH3eP2+21SQTJsl5amoOjcZrStUAZ9LnWpFIuIBk7zwrs5SJYTdngvcuoOBUmAq7uCs3oPTpB6HrTYNAf4wt/kVESuaLNDRkKfgoIsFXP0jFN74MXdwVcmks2+zfa0Vd18UFZ3pLQK6SQBo+GshnHAOloXRbPwZn6X1k24JL1/XagP/Vp0sFwedDeII3xrjD94yhjzAbcLkD+fQK/hiOCRP8t4cAfg+CX2vYeIq9lNd/f1K6o2LnttEQ+43iHwjOxOSx0O6j3ZLtES+73eRHrG37ENZHBBuGpZLRfLPMF5ze8rc3Vn+x+6H+ONyan/8DvJwm9A==)

Vue provides two ways to work around this problem. You can pass the `flush: 'post'` option or use `watchPostEffect`, which is a "pre-configured" version of `watchEffect` with this option already set.
::

```ts
watchEffect(
  () => {
    if (showInput.value) {
      const input = document.getElementById("input");
      input?.focus();
    }
  },
  {
    flush: "post",
  }
);

// or

watchPostEffect(() => {
  if (showInput.value) {
    const input = document.getElementById("input");
    input?.focus();
  }
});
```

::lang-block{lang="pt"}
## Efeitos síncronos

Outra possibilidade que o Vue oferece é executar os watchers imediatamente, utilizando a opção `flush: 'sync'` ou `watchSyncEffect`.
Voltando ao exemplo anterior:
::

::lang-block{lang="en"}
## Synchronous effects

Another possibility that Vue offers is to execute watchers immediately, using the `flush: 'sync'` option or `watchSyncEffect`.
Going back to the previous example:
::

```ts
watchEffect(
  async () => {
    console.log("count increased", count.value);
  },
  {
    flush: "sync",
  }
);

// or

watchSyncEffect(async () => {
  console.log("count increased", count.value);
});
```

::lang-block{lang="pt"}
Agora teremos um log para cada vez que o estado for modificado.
É claro que é preciso **muito** cuidado, efeitos síncronos podem causar problemas de performance e loops infinitos se não usados corretamente.

## Conclusão

Exceto nos casos em que você precisa acessar ou modificar o DOM, raramente precisa se preocupar
com a ordem de efeitos ou quando essas mudanças vão acontecer. O Vue possui muitas
abstrações e otimizações, e é importante não tentar otimizar antes de realmente ter um problema.
::

::lang-block{lang="en"}
Now we'll have a log for each time the state is mutated.
Of course, **great** care is needed, synchronous effects can cause performance issues and infinite loops if not used correctly.

## Conclusion

Except in cases where you need to access or mutate the DOM, you rarely need to worry
about the order of effects or when these changes will happen. Vue has many
abstractions and optimizations, and it's important not to try to optimize before you actually have a problem.
::

---
title: "Vue e Efeitos Processados em Lote"
slug: "batched-effects-vue"
publishDate: 2025-06-12
draft: true
tags: ["javascript", "vue"]
description: "Entendendo quando seus efeitos fazem efeito no Vue.js"
lang: "pt"
---

A reatividade do Vue é baseada em "inscrições". Quando um efeito lê uma `ref`,
o Vue registra que esse efeito depende desse valor. Quando o valor é atualizado, 
o Vue executa novamente esse efeito.

Quando você escreve um bloco `<template>` em um arquivo `.vue`, o processo de build
transforma aquilo em uma função de renderização (semelhante ao que acontece
com o JSX). Ou seja, se você utiliza uma `ref` no seu template, quando essa `ref` mudar, 
a sua função de template será executada novamente. 

Outra forma de criar efeitos é com um `watchEffect`. Da mesma forma, se o callback do seu `watchEffect`
ler alguma `ref`, e essa `ref` mudar, o callback será chamado novamente. 

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

[Link para o playground](https://play.vuejs.org/#eNp9kstOwzAQRX/F8oZWVCkSrCCteKgLWAAClt4Ed9K6dcaWH21RlH9nnBAICHURKZ57Z3LuxDW/sTbbReCXXGDupVM2MA8h2rlAVVnjAqvZvghyvShLkIE1rHSmYifUdHI18Dgo/2oCpUEfmDQRA5sly+hs3AplRBmUQaZQOig83CXPaMxqgaxryHaFjnB6KrBJHQOGUeE/UDJyz+Z9A3qjIdNmNRK8+14/WfDJcOCY5tGTT7uwFJMOASqriwB0Yiy385YGHFOe1fUXf9Pk07QVMrzHEIj9WmoltzPBf4UQfH6PMp92JmrIp4PxfMKDJ9xSrbKNN0iLbxMk6soqDe7JpsV4wS+7bEkrtDb7h7YWXIRJX5drkNt/6ht/SDXBnx14cLu0hF4LhVsBUSZ58foIB3r/FiuzjJrcR8QXoFXHxNjZbiMuCXvga2nv24uhcPXmF4cA6PtQCTQ5m9YvOF2WuyPRf3DPs4u2j34gbz4Bh+btZg==)

Nesse exemplo, cada vez que `increaseCount` é chamado, alteramos o valor de `count`, o que faz
a função `<template>` ser executada novamente, resultando na atualização do DOM.
Como temos um `watchEffect` que lê `count`, também exibimos uma mensagem de log no console.

Mas o que acontece se modificarmos `count` mais de uma vez na mesma função?

```ts
function increaseCount() {
  count.value++
  count.value++
  count.value++
  count.value++
}
```

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

[Link para playground](https://play.vuejs.org/#eNp9kk9P4zAQxb/KrC9NJTY97J7YwO6y6qEr8UfA0ZfgTILBsS17XIqqfnfGDi0IIaQcPG9+47xneyv+el+vE4pj0UQVtCeISMmfSqtH7wLBFgL2sIM+uBFmjM5+SSutcjYye++eVtYngpOMVX1rIs4L0CerSDsL5IbBYKGqOWylhbexet2ahDz87YNUtgDQPVQfOq9bAEwO9OvfO6fSiJbqAWlpMC/PnlddNSvALHvKQ6X6XfdMx2qetZ20/EnbLKb8nJwLwtGblpArgOYuEXGSP8po9XgixbtIUpyeu0ihDdPezWKCp8HJne54piylgPV33XN5SMUSs83i8EdxJChyuF4P9UN0lq+mJJZCudFrg+HS54ONUhzvz0KK1hj39L9oFBIe7XV1j+rxE/0hbrImxVXAiGGNUhx61AY+xam9vLnADa8PzdF1yTD9RfMaozMpe5yws2Q7tv2OK25X5YFpO9zG5YbQxn2obLRcTeGl4Ef374vob3Z/1D/3Vyp2L9R7+Qc=)

Quando `toggleInput` modifica o valor de `showInput`, o Vue agenda a função de template
para ser re-executada. Entretanto, quando tentamos selecionar o elemento,
o `input` ainda não está no DOM.

Nesse caso, precisamos utilizar `nextTick()`, onde o "tick" é a execução das funções de template
que vão atualizar o DOM. Você pode tanto passar um callback que será executado logo após, quanto aguardar
a Promise que ele retorna.

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

// OU

async function toggleInput() {
  showInput.value = !showInput.value;

  if (showInput.value) {
    await nextTick()
    const input = document.getElementById('input');
    input?.focus()
  }
}
```

## Ordem dos efeitos

A ordem dessas execuções também é importante. Um `watch` ou `watchEffect` acontece sempre antes
do DOM ser atualizado. Portanto, mesmo utilizando `nextTick` dentro de um `watchEffect`, 
você não tem acesso à versão atualizada do DOM.

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

[Link do Playground](https://play.vuejs.org/#eNp9Uk2P2jAQ/SuuLwSJZg/tiQJtt+JApX6o3aMvqRkH7zp2ZI+BFeK/d2wTNkKrvSVv3rx588Yn/rXv630EPueLIL3ukQXA2K+E1V3vPLITs3DEBy2f2Jkp7zo2If7k04jgQc3YoUG5WysFEm+JwkpnAynv3GFj+4hsmXoq1ZgA00xowrOVTEUrUTvL0LWtgcytpuwkLHtprveNiUAS724gEjonrZGTquiSxnKVZJKQVqy66byMYKz41BePWydjBxbrFnBtIH3eP2+21SQTJsl5amoOjcZrStUAZ9LnWpFIuIBk7zwrs5SJYTdngvcuoOBUmAq7uCs3oPTpB6HrTYNAf4wt/kVESuaLNDRkKfgoIsFXP0jFN74MXdwVcmks2+zfa0Vd18UFZ3pLQK6SQBo+GshnHAOloXRbPwZn6X1k24JL1/XagP/Vp0sFwedDeII3xrjD94yhjzAbcLkD+fQK/hiOCRP8t4cAfg+CX2vYeIq9lNd/f1K6o2LnttEQ+43iHwjOxOSx0O6j3ZLtES+73eRHrG37ENZHBBuGpZLRfLPMF5ze8rc3Vn+x+6H+ONyan/8DvJwm9A==)

O Vue fornece duas formas de contornar esse problema. Você pode passar a opção `flush: 'post'` ou utilizar `watchPostEffect`, que é uma versão "pré-configurada" do `watchEffect` com essa opção já definida.

```ts
watchEffect(() => {
  if (showInput.value) {
    const input = document.getElementById('input');
    input?.focus();
  }
}, {
  flush: "post"
})

// ou

watchPostEffect(() => {
  if (showInput.value) {
    const input = document.getElementById('input');
    input?.focus();
  }
})
```

## Efeitos síncronos

Outra possibilidade que o Vue oferece é executar os watchers imediatamente, utilizando a opção `flush: 'sync'` ou `watchSyncEffect`.
Voltando ao exemplo anterior:

```ts
watchEffect(async () => {
  console.log("count increased", count.value)
}, {
  flush: "sync"
})

// ou

watchSyncEffect(async () => {
  console.log("count increased", count.value)
})
```

Agora teremos um log para cada vez que o estado for modificado.
É claro que é preciso **muito** cuidado, efeitos síncronos podem causar problemas de performance e loops infinitos se não usados corretamente.

## Conclusão

Exceto nos casos em que você precisa acessar ou modificar o DOM, raramente precisa se preocupar 
com a ordem de efeitos ou quando essas mudanças vão acontecer. O Vue possui muitas
abstrações e otimizações, e é importante não tentar otimizar antes de realmente ter um problema.
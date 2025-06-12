---
title: "Vue e Efeitos Processados em Lote"
slug: "batched-effects-vue"
publishDate: 2025-06-12
draft: true
tags: ["javascript", "vue"]
description: "Entendendo quando seus efeitos fazem efeito"
lang: "pt"
---

A reatividade do Vue é baseado em “inscrições”. Quando um efeito lê uma `ref`,
o Vue guarda que esse efeito depende desse valor, quando valor é atualiza, 
o Vue roda novamente esse efeito.

Quando você escreve um bloco `<template>` em um arquivo `.vue`, o processo de build
vai fazer transformar aquilo em uma função de renderização (semelhante ao que acontece
com o JSX). Ou seja, se você utiliza uma `ref` no seu template, quando essa `ref` mudar, 
a sua função de template irá rodar novamente. 

Outra forma de fazer efeito é com um `watchEffect`. Dá mesma forma, se o callback do seu `watchEffect`
ler alguma `ref`, e esse `ref` muda, o callback será chamado novamente.

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

Nesse exemplo, cada vez que o `increaseCount` é chamado, alteramos o valor de `count`, o que faz
a função `<template>` ser executada novamente, o que resulta no DOM sendo atualizado.
Como temos um `watchEffect` que lê `count`, também mostramos uma mensagem de `log` no `console`.

Mas o que acontece se modificarmos o `count` mais de uma vez na mesma função?

```ts
function increaseCount() {
  count.value++
  count.value++
  count.value++
  count.value++
}
```

Felizmente, o Vue já tem uma otimização para isso, rodando ambos os efeitos apenas uma vez, mesmo a gente tendo
modificado o `count` 4 vezes. Experimente modificar a função no playground acima.

O Vue usa uma simples estratégia de “registrar” que esses efeitos precisam ser re-executados,
e depois executar esses efeitos em lote. Além de ajudar com perfomance, evitando que um mesmo `watchEffect`
rode várias vezes, ou que o DOM seja modificado multiplas vezes de forma desnecessária, o Vue também
consegue organizar a ordem em que esses efeitos são executados (efeitos em componentes pais devem acontecer
antes de efeitos em componentes filhos).

Entretanto, o Vue fornece formas de "escapar" desse comportamento.

## Atuando depois de atualiza o DOM

Você já deve ter encontrado o seguinte comportamento no Vue: Você não consegue 
acessar um elemento DOM na mesma função que alterou a visibilidade dele.

```vue
<script setup>
import { useTemplateRef, ref, nextTick } from 'vue';

const inputRef = useTemplateRef('input');
const showInput = ref(false);

function toggleInput() {
  showInput.value = !showInput.value;

  if (showInput.value && inputRef.value) {
    inputRef.value.focus();
  }
}

</script>

<template>
  <button @click="toggleInput">Mostrar input</button>
  <input v-if="showInput" ref="input">
</template>
```

Quando `toggleInput` modifica o valor de `showInput`, o Vue marca a função de template
para ser re-executada. Entretanto, quando a função tenta acessar `inputRef.value`,
o `input` ainda não está no DOM.

Nesse caso, precisamos utilizar o `nextTick()`, onde o `tick` é a execução das funções de templates
que vão atualizar o DOM. Você pode tanto passar um callback que será executado logo após, ou esperar
a promesa que ele retorna.

```ts
function toggleInput() {
  showInput.value = !showInput.value;

  nextTick(() => {
  if (showInput.value && inputRef.value) {
    inputRef.value.focus();
    }
  }) 
}

// OU

async function toggleInput() {
  showInput.value = !showInput.value;

  await nextTick();
  if (showInput.value && inputRef.value) {
    inputRef.value.focus();
  }
}
```
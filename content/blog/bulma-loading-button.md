---
title: "Botão de carregamento sem alterar o tamanho"
publishDate: 2024-10-10
draft: false
tags: ["javascript", "css"]
description: "Uma estratégia para mostrar um ícone de carregamento em um botão sem modificar o seu tamanho"
lang: "pt"
---

Todo projeto vai ter aquele botão que dispara uma ação que leva um tempo para ser completada. Geralmente, enquanto essa ação está sendo realizada, é preciso evitar o usuário clique novamente no botão, e também dar um feedback que a ação está sendo executado. É comum nesses casos mostrar um ícone de carregamento no próprio botão. No entanto, ao adicionar o ícone de carregamento, o tamanho do botão é alterado, o que nem sempre é desejado.

Entretando, recentemente eu estava utilizando o framework CSS [Bulma](https://bulma.io/) e notei que eles possuem uma implementação de botão com ícone de carregamento que não altera o tamanho do botão. Aqui está uma versão simplificada dessa implementação:

```css
button.loading {
  color: transparent;
}

button.loading::after {
  content: "";
  position: absolute;
  inset: 0;
  margin: auto;
  display: block;

  height: 1em;
  width: 1em;

  border-radius: 999999px;

  border-bottom: 2px solid white;
  border-left: 2px solid white;
  border-right: 2px solid transparent;
  border-top: 2px solid transparent;

  animation: rotate 0.4s linear infinite;
}
```

Praticamente, quando o botão tem a classe `loading`, o texto do botão é escondido e um ícone de carregamento é adicionado, como o texto ainda está presente (mas invisível), o tamanho do botão não é alterado. O mais legal é que o ícone de carregamento é feito apenas com CSS: se você tem um elemento redondo (`border-radius: 999999px;`) e somente duas bordas visíveis, você tem um semi-círculo. Se você rotacionar esse círculo com uma animação simples, você tem um ícone de carregamento.

:stack-blitz{:src="https://stackblitz.com/edit/sb1-l26m7v?ctl=1&embed=1&file=src%2FApp.vue"}

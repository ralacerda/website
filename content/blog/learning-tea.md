---
title_en: "Learning and understanding The Elm Architecture"
title_pt: "Aprendendo e entendendo a Elm Architecture"
slug: "learning-tea"
publishDate: 2026-05-01
draft: false
tags: ["javascript", "typescript", "elm", "functional programming"]
description_en: "Learn the core ideas of The Elm Architecture in TypeScript with lit-html: model, view, update, messages, and commands."
description_pt: "Aprenda as ideias centrais da Elm Architecture em TypeScript com lit-html: model, view, update, messages e commands."
---

::lang-block{lang="en"}
This is the first part of a series of articles about writing a TEA-based framework in TypeScript.

The Elm Architecture is used in many places: Lustre in Gleam, Bubble Tea in Go, and Iced in Rust.

So let’s learn by creating a small project using The Elm Architecture, which we can later migrate to our own TypeScript framework. After all, there are not enough JavaScript frameworks for the web.

You don’t need prior Elm knowledge, but you should have a basic understanding of TypeScript and DOM events.

We can start with a simple Vite project, using the Vanilla template and TypeScript:
::

::lang-block{lang="pt"}
Esta é a primeira parte de uma série de artigos sobre como escrever um framework baseado em TEA (The Elm Architecture) em TypeScript.

A Elm Architecture é utilizada em muitos lugares: Lustre em Gleam, Bubble Tea em Go e Iced em Rust.

Então vamos aprender criando um pequeno projeto usando a Elm Architecture, que poderemos migrar posteriormente para o nosso próprio framework TypeScript. Afinal, nunca existem frameworks JavaScript suficientes para a web.

Você não precisa de conhecimento prévio de Elm, mas deve ter um entendimento básico de TypeScript e eventos do DOM.

Podemos começar com um projeto Vite simples, usando o template Vanilla e TypeScript:
::

```sh
❯ pnpm create vite
│
◇  Project name:
│  tea
│
◇  Select a framework:
│  Vanilla
│
◇  Select a variant:
│  TypeScript
│
◇  Install with pnpm and start now?
│  Yes
```

::lang-block{lang="en"}
For this article we are going to use `lit-html` so we don’t have to implement two key features ourselves: HTML generation and efficient rendering.

We can create templates with JavaScript interpolation by using the `html` tag (for example, `${...}` inside the template), and we can bind DOM events with `@event` syntax, similar to Vue, and conceptually similar to `onEvent` props in React.
::

::lang-block{lang="pt"}
Para este artigo, vamos usar `lit-html` para não termos que implementar duas funcionalidades principais nós mesmos: geração de HTML e renderização eficiente.

Podemos criar templates com interpolação JavaScript usando a tag `html` (por exemplo, `${...}` dentro do template), e podemos vincular eventos do DOM com a sintaxe `@event`, semelhante ao Vue, e conceitualmente parecida com as props `onEvent` no React.
::

::more-info{title_en="Tip" title_pt="Dica"}
#en
If you want syntax highlighting inside `html` template literals, install the VS Code plugin for Lit.
#pt
Se você quiser realce de sintaxe dentro de literais de template `html`, instale o plugin do VS Code para Lit.
::

```sh
pnpm add lit-html
```

::lang-block{lang="en"}
We remove everything in `main.ts` and write a basic `view` for our app:
::

::lang-block{lang="pt"}
Removemos tudo no `main.ts` e escrevemos uma `view` básica para o nosso app:
::

```ts
import { html, render } from "lit-html";

const view = html`
  <h1>Hello, World</h1>
  <p>Counter is at 0</p>
  <button>Click me</button>
`;

const root = document.getElementById("app")!;
render(view, root);
```

::lang-block{lang="en"}
We render into `#app` using `lit-html`. Next, let’s make this dynamic using interpolation:
::

::lang-block{lang="pt"}
Renderizamos no `#app` usando `lit-html`. Em seguida, vamos tornar isso dinâmico usando interpolação:
::

```ts
import { html, render } from "lit-html";

let counter = 0;
const title = "Hello, World";

const view = html`
  <h1>${title}</h1>
  <p>Counter is at ${counter}</p>
  <button>Click me</button>
`;

const root = document.getElementById("app")!;
render(view, root);
```

::lang-block{lang="en"}
Now, let’s make a function that increases the counter and bind it to the button:
::

::lang-block{lang="pt"}
Agora, vamos criar uma função que aumenta o contador e vinculá-la ao botão:
::

```ts
import { html, render } from "lit-html";

let counter = 0;
const title = "Hello, World";

const view = html`
  <h1>${title}</h1>
  <p>Counter is at ${counter}</p>
  <button @click=${increaseCounter}>Click me</button>
`;

const root = document.getElementById("app")!;
render(view, root);

function increaseCounter() {
  counter++;
}
```

::lang-block{lang="en"}
But this won’t work. Why?

When `increaseCounter` runs, the `view` was already created and rendered. We update `counter`, but we don’t create a new `view` or render again.

Let’s fix that by making `view` a function that receives state, and re-rendering after each update:
::

::lang-block{lang="pt"}
Mas isso não vai funcionar. Por quê?

Quando o `increaseCounter` é executado, a `view` já foi criada e renderizada. Atualizamos o `counter`, mas não criamos uma nova `view` nem renderizamos novamente.

Vamos corrigir isso tornando a `view` uma função que recebe o estado e renderizando novamente após cada atualização:
::

```ts
import { html, render } from "lit-html";

let counter = 0;
const title = "Hello, World";

function view(counterAmount: number) {
  return html`
    <h1>${title}</h1>
    <p>Counter is at ${counterAmount}</p>
    <button @click=${increaseCounter}>Click me</button>
  `;
}

const root = document.getElementById("app")!;
render(view(counter), root);

function increaseCounter() {
  counter++;
  render(view(counter), root);
}
```

::lang-block{lang="en"}
Now clicking the button updates the UI again.

At a high level, this idea appears in many frameworks: UI as a function of state. The details differ (Virtual DOM, fine-grained reactivity, compile-time optimizations), but the core loop is familiar.

Now we’ll apply the core ideas from The Elm Architecture but encapsulated in a class, similar to how the `iced` library works in Rust.

## The `Counter` Application

Instead of loose functions and variables, we’ll encapsulate our application logic in a class. This class will hold our application state and define how to update and view it.

First, let's define our state and messages:
::

::lang-block{lang="pt"}
Agora, clicar no botão atualiza a UI novamente.

Em um nível macro, essa ideia aparece em muitos frameworks: a UI como uma função do estado. Os detalhes diferem (Virtual DOM, reatividade granular, otimizações em tempo de compilação), mas o loop principal é familiar.

Agora vamos aplicar as ideias centrais da Elm Architecture, mas encapsuladas em uma classe, semelhante a como a biblioteca `iced` funciona em Rust.

## A Aplicação `Counter`

Em vez de funções e variáveis soltas, vamos encapsular a lógica da nossa aplicação em uma classe. Essa classe manterá o estado da nossa aplicação e definirá como atualizá-lo e visualizá-lo.

Primeiro, vamos definir nosso estado e mensagens:
::

```ts
type State = {
  value: number;
};

type Message = "Increment" | "Decrement";
```

::lang-block{lang="en"}
Now, let's create the `Counter` class:
::

::lang-block{lang="pt"}
Agora, vamos criar a classe `Counter`:
::

```ts
import { html, render } from "lit-html";

class Counter {
  // We use an internal state object
  state: State = {
    value: 0,
  };

  // The update method describes how state changes in response to messages
  update(message: Message) {
    // We capture a snapshot of the current state before the update logic starts.
    let state = this.state;

    switch (message) {
      case "Increment":
        this.state = { ...state, value: state.value + 1 };
        break;
      case "Decrement":
        this.state = { ...state, value: state.value - 1 };
        break;
    }
  }

  // The view method describes how the UI should look based on the current state
  view() {
    return html`
      <h1>Counter App</h1>
      <p>Count: ${this.state.value}</p>
      <button @click=${() => this.dispatch("Increment")}>+</button>
      <button @click=${() => this.dispatch("Decrement")}>-</button>
    `;
  }

  // The runtime logic
  private root = document.getElementById("app")!;

  dispatch(message: Message) {
    this.update(message);
    this.render();
  }

  render() {
    render(this.view(), this.root);
  }
}

const app = new Counter();
app.render();
```

::lang-block{lang="en"}

## Why avoid mutation?

In the `update` method, notice we didn't do `this.state.value++`. Instead, we created a whole new object: `this.state = { ...state, value: state.value + 1 }`.

By reassigning the `state` instead of mutating its properties, we preserve the previous state in memory (as long as something holds a reference to it). This is the foundation for features like **Time Traveling**.

## Time Traveling

Because our `update` logic is based on transition from one immutable state to another, we can easily keep track of every state our application has ever been in.

Imagine adding a history array to our class:
::

::lang-block{lang="pt"}

## Por que evitar mutação?

No método `update`, observe que não fizemos `this.state.value++`. Em vez disso, criamos um objeto totalmente novo: `this.state = { ...state, value: state.value + 1 }`.

Ao reatribuir o `state` em vez de mutar suas propriedades, preservamos o estado anterior na memória (desde que algo mantenha uma referência a ele). Esta é a base para funcionalidades como **Time Traveling** (Viagem no Tempo).

## Time Traveling

Como nossa lógica de `update` é baseada na transição de um estado imutável para outro, podemos facilmente rastrear todos os estados em que nossa aplicação já esteve.

Imagine adicionar um array de histórico à nossa classe:
::

```ts
class Counter {
  state: State = { value: 0 };
  history: State[] = [];

  dispatch(message: Message) {
    // Save current state to history before updating
    this.history.push(this.state);

    this.update(message);
    this.render();
  }

  undo() {
    const previousState = this.history.pop();
    if (previousState) {
      this.state = previousState;
      this.render();
    }
  }
}
```

::lang-block{lang="en"}
With this pattern, implementing "Undo" or a full "Time Travel Debugger" becomes trivial. You can just store an array of states and jump between them.

## Recap

At this point, we have a single class as the source of truth for app state and logic. We apply changes by reassigning an immutable state object, and `dispatch` acts as the central loop.

This should give you a practical overview of how The Elm Architecture works in a more structured, object-oriented way.

In the next article, we’ll build on this with more realistic examples (form input, async data, and composition patterns).
::

::lang-block{lang="pt"}
Com esse padrão, implementar "Desfazer" (Undo) ou um "Depurador de Viagem no Tempo" completo torna-se trivial. Você pode apenas armazenar um array de estados e saltar entre eles.

## Recapitulação

Neste ponto, temos uma única classe como fonte da verdade para o estado e a lógica do app. Aplicamos mudanças reatribuindo um objeto de estado imutável, e o `dispatch` atua como o loop central.

Isso deve te dar uma visão prática de como a Elm Architecture funciona de uma maneira mais estruturada e orientada a objetos.

No próximo artigo, construiremos sobre isso com exemplos mais realistas (input de formulário, dados assíncronos e padrões de composição).
::

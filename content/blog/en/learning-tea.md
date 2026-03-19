---
title: "Learning and understanding The Elm Architecture"
slug: "learning-tea"
publishDate: 2026-09-03
draft: true
tags: ["javascript", "typescript", "elm", "functional programming"]
description: ""
lang: "en"
---

This is the first part of a series of article about writing a TEA based framework in Typescript.

The Elm Arquitecture...
It's being used in Lustre for Gleam, Bubbletea in Go and Iced in Rust.

So let's learn by creating a project using The Elm Arquitecture, that we can later migrate
to our own typescript framework. After all, there are not enough Javascript frameworks for web.

We can start with a simple vite project, using the Vanilla template and Typescript:

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

For this article we are going to be using `lit-html` so we don't have to implement two key features ourselves: html generation and efficient rendering.
But don't worry, all you need to know is that when using `html` you can provide html as a javascript string. This means you can include javascript expression inside it using `${}`. And you bind functions to dom events by using `@eventname`. This is similar to how Vue works, and the equivalent of `onEventName` in React.

> TIP
> If you want syntax highligithing inside the html tag string, you can
> install the vs code plugin for lit.

```sh
pnpm add lit-html
```

We remove everything in `main.ts` and write a basic `view` for our app:

```ts
import { html, render } from "lit-html";

// We create our representation of the UI as a template literal using the `html` function from lit-html.
const view = html`
  <h1>Hello, World</h1>
  <p>Counter is at 0</p>
  <button>Click me</button>
`;

// We render the view into the DOM. The `render` function takes the view and a DOM element to render into.
const root = document.getElementById("app")!;
render(view, root);
```

We are finding the `#app` element and changing it's internal HTML. While this works, we are going to
swap for `lit-html` to get some better performance and more features for out HTML template.

Let's use some interpolation and extract some of that content:

```ts
import { html, render } from "lit-html";

let counter = 0;
const title = "Hello, World";

// We create our representation of the UI as a template literal using the `html` function from lit-html.
const view = html`
  <h1>${title}</h1>
  <p>Counter is at ${counter}</p>
  <button>Click me</button>
`;

// We render the view into the DOM. The `render` function takes the view and a DOM element to render into.
const root = document.getElementById("app")!;
render(view, root);
```

Now, let's make a function that increases the counter and bind that to the button:

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

But this won't work. Why? Because when the call the `increaseCounter` the `view` was already created and rendered. We are updating the `counter` but we are not changing the value for `view` nor rendering it again. Let's fix that by making our `view` a function that takes the counter value as an argument, and by creating a new function that updates the counter, calculate the new `view` and render it again:

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

If you check your browser, it should be working again. We have the same static content, but now when you click the button, it'll
increase it's count and udpate it's value.

I hope you see can that there is nothing new here, this is the basis for every framework. React and Solid uses JSX instead of `html`, while Vue and Svelte uses Single File Componets with `<template>` tags. React and Vue use a Virtual DOM to efficienly patch the rendered content, while Solid and Svelte tracks signals or mutations to make direct updates to the DOM.

> The DOM (Document Object Model) is a tree-like representation of your HTML page that the browser maintains in memory. Each element, attribute, and piece of text is a node in this tree, and JavaScript can read or modify it to make pages interactive. The problem is that directly manipulating the DOM can be slow — especially when many changes happen at once, since the browser may need to recalculate layouts and repaint the screen.
>
> A Virtual DOM is a lightweight copy of that tree kept in JavaScript memory. Instead of touching the real DOM immediately, a framework first applies changes to this virtual copy, then compares it with the previous snapshot (a process called "diffing"), and finally applies only the minimal set of real DOM updates needed. This batching and diffing strategy is what makes frameworks like React and Vue fast despite frequent state changes.

However, we are going tio apply two ideias that separate The Elm Architecture from others: a single state that flow downstream, and state changes expressed as messages. This is what unlocks some powerful capabilities we will take a look at.

First, let's start by making a type called `Model` that represents the whole state of the app:

```ts
import { html, render } from "lit-html";

type Model = {
  counter: number;
  title: string;
};

const model: Model = {
  counter: 0,
  title: "Hello, World",
};

function view(model: Model) {
  return html`
    <h1>${model.title}</h1>
    <p>Counter is at ${model.counter}</p>
    <button @click=${increaseCounter}>Click me</button>
  `;
}

const root = document.getElementById("app")!;
render(view(model), root);

function increaseCounter() {
  model.counter++;
  render(view(model), root);
}
```

If we want our title to have a little bit more logic, we can just write a function:

```ts
import { html, render } from "lit-html";

type Model = {
  counter: number;
  title: string;
};

const model: Model = {
  counter: 0,
  title: "Hello, World",
};

function Title(text: string, count: number) {
  return html`<h1>${text}${"!".repeat(count)}</h1>`;
}

function view(model: Model) {
  return html`
    ${Title(model.title, model.counter)}
    <p>Counter is at ${model.counter}</p>
    <button @click=${increaseCounter}>Click me</button>
  `;
}

function increaseCounter() {
  model.counter++;
  render(view(model), root);
}

const root = document.getElementById("app")!;
render(view(model), root);
```

`Title` is now a very basic component with some custom logic. Notice that it does not have any state of it's own.

Now we need to work with messages instead of mutating our model. We will create two functions, `update` takes a `Model` and an `Event` and returns a new `Model`. `dispatch` takes an `Event`, calls `update`, replace the old model with the new model, and re-renders the view. We are also defining the `Event` type and implementing a way to reset the counter:

```ts
import { html, render } from "lit-html";

type Model = {
  counter: number;
  title: string;
};

type Event = { type: "SET_COUNTER"; value: number };

const model: Model = {
  counter: 0,
  title: "Hello, World",
};

function Title(text: string, count: number) {
  return html`<h1>${text}${"!".repeat(count)}</h1>`;
}

function view(model: Model) {
  return html`
    ${Title(model.title, model.counter)}
    <p>Counter is at ${model.counter}</p>
    <button
      @click=${() =>
        dispatch({ type: "SET_COUNTER", value: model.counter + 1 })}
    >
      Click me
    </button>
    <button @click=${() => dispatch({ type: "SET_COUNTER", value: 0 })}>
      Reset
    </button>
  `;
}

function update(model: Model, event: Event): Model {
  switch (event.type) {
    case "SET_COUNTER":
      return { ...model, counter: event.value };
    default:
      return model;
  }
}

function dispatch(event: Event) {
  const newModel = update(model, event);
  Object.assign(model, newModel);
  render(view(newModel), root);
}

const root = document.getElementById("app")!;
render(view(model), root);
```

> NOTE
> Does the `distach` and `update` look familiar? If you've used Redux you might recognize the pattern.
> This not a coincidence, Redux was inspired by The Elm Architecture.
> useReducer is also ... (check history for it)

This works, but we are forced to handle events in a syncronous way. Let's learn a new concept: Commands. In TEA, commands are just
functions that return an Event. Based on the `event` and a `model`, `update` can now return the new model and possibily a command. `dispatch` is responsible for running the command and calling itself after it resolves:

```ts
import { html, render } from "lit-html";

type Model = {
  counter: number;
  title: string;
};

type Event = { type: "SET_COUNTER"; value: number } | { type: "RESET_COUNTER" };

const model: Model = {
  counter: 0,
  title: "Hello, World",
};

function Title(text: string, count: number) {
  return html`<h1>${text}${"!".repeat(count)}</h1>`;
}

function view(model: Model) {
  return html`
    ${Title(model.title, model.counter)}
    <p>Counter is at ${model.counter}</p>
    <button
      @click=${() =>
        dispatch({ type: "SET_COUNTER", value: model.counter + 1 })}
    >
      Click me
    </button>
    <button @click=${() => dispatch({ type: "RESET_COUNTER" })}>Reset</button>
  `;
}

type Command = () => Promise<Event>;

function update(model: Model, event: Event): [Model, Command?] {
  switch (event.type) {
    case "SET_COUNTER":
      return [{ ...model, counter: event.value }];
    case "RESET_COUNTER":
      return [model, resetCounter];
    default:
      return [model];
  }
}

async function resetCounter(): Promise<Event> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { type: "SET_COUNTER", value: 0 };
}

function dispatch(event: Event) {
  const [newModel, command] = update(model, event);
  Object.assign(model, newModel);
  render(view(newModel), root);
  if (command) {
    command().then((event) => dispatch(event));
  }
}

const root = document.getElementById("app")!;
render(view(model), root);
```

This should give you an overview of how the The Elm Architecture works.
With those building blocks we can create some really complex applications.
And that is what I hope to show in the next article.

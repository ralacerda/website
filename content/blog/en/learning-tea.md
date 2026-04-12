---
title: "Learning and understanding The Elm Architecture"
slug: "learning-tea"
publishDate: 2026-09-03
draft: true
tags: ["javascript", "typescript", "elm", "functional programming"]
description: "Learn the core ideas of The Elm Architecture in TypeScript with lit-html: model, view, update, messages, and commands."
lang: "en"
---

This is the first part of a series of articles about writing a TEA-based framework in TypeScript.

The Elm Architecture is used in many places: Lustre in Gleam, Bubble Tea in Go, and Iced in Rust.

So let’s learn by creating a small project using The Elm Architecture, which we can later migrate to our own TypeScript framework. After all, there are not enough JavaScript frameworks for the web.

You don’t need prior Elm knowledge, but you should have a basic understanding of TypeScript and DOM events.

We can start with a simple Vite project, using the Vanilla template and TypeScript:

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

For this article we are going to use `lit-html` so we don’t have to implement two key features ourselves: HTML generation and efficient rendering.

We can create templates with JavaScript interpolation by using the `html` tag (for example, `${...}` inside the template), and we can bind DOM events with `@event` syntax, similar to Vue, and conceptually similar to `onEvent` props in React.

> TIP
> If you want syntax highlighting inside `html` template literals, install the VS Code plugin for Lit.

```sh
pnpm add lit-html
```

We remove everything in `main.ts` and write a basic `view` for our app:

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

We render into `#app` using `lit-html`. Next, let’s make this dynamic using interpolation:

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

Now, let’s make a function that increases the counter and bind it to the button:

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

But this won’t work. Why?

When `increaseCounter` runs, the `view` was already created and rendered. We update `counter`, but we don’t create a new `view` or render again.

Let’s fix that by making `view` a function that receives state, and re-rendering after each update:

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

Now clicking the button updates the UI again.

At a high level, this idea appears in many frameworks: UI as a function of state. The details differ (Virtual DOM, fine-grained reactivity, compile-time optimizations), but the core loop is familiar.

Now we’ll apply two core ideas from The Elm Architecture: a single state that flows downstream, and state changes expressed as messages.

## Step 1: one `Model`

First, let’s define a `Model` that represents all app state. We’ll mutate it in this step for simplicity, then switch to immutable updates in the next step:

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

If we want the title to have extra logic, we can extract a function:

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

`Title` is now a small component-like function with no internal state.

## Step 2: messages + `update`

Now we switch from direct mutation in handlers to message-driven updates.

In Elm terminology this is usually `Msg`, but in this article we’ll use the more explicit name `Message`.

```ts
import { html, render } from "lit-html";

type Model = {
  counter: number;
  title: string;
};

type Message = { type: "SET_COUNTER"; value: number };

let model: Model = {
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

function update(model: Model, message: Message): Model {
  switch (message.type) {
    case "SET_COUNTER":
      return { ...model, counter: message.value };
    default:
      return model;
  }
}

function dispatch(message: Message) {
  model = update(model, message);
  render(view(model), root);
}

const root = document.getElementById("app")!;
render(view(model), root);
```

> NOTE
> Does `dispatch` + `update` look familiar? If you’ve used Redux, this pattern may look very similar.
> That is not a coincidence: Redux was heavily inspired by The Elm Architecture.

## Step 3: commands for async work

So far, updates are synchronous.

Now let’s add commands. In TEA terms, commands represent effects that eventually produce a new message. In real applications, commands can also fail, and you can model that by returning error messages (for example, `RESET_FAILED`).

`update` now returns the next `model` and, optionally, a `command` to run.

`dispatch` applies the model, renders, runs the command, and dispatches the resulting message.

```ts
import { html, render } from "lit-html";

type Model = {
  counter: number;
  title: string;
};

type Message =
  | { type: "SET_COUNTER"; value: number }
  | { type: "RESET_COUNTER" };

type Command = () => Promise<Message>;

let model: Model = {
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

function update(model: Model, message: Message): [Model, Command?] {
  switch (message.type) {
    case "SET_COUNTER":
      return [{ ...model, counter: message.value }];
    case "RESET_COUNTER":
      return [model, resetCounter];
    default:
      return [model];
  }
}

async function resetCounter(): Promise<Message> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { type: "SET_COUNTER", value: 0 };
}

function dispatch(message: Message) {
  const [newModel, command] = update(model, message);
  model = newModel;
  render(view(model), root);

  if (command) {
    command().then(dispatch);
  }
}

const root = document.getElementById("app")!;
render(view(model), root);
```

## Recap

At this point, we have a single `Model` as the source of truth for app state, and a `view(model)` function that describes the UI from that state. We apply changes with a pure `update(model, message)` function, and `dispatch` acts as the central loop that updates the model, re-renders, and runs commands when needed.

This should give you a practical overview of how The Elm Architecture works.

In the next article, we’ll build on this with more realistic examples (form input, async data, and composition patterns).

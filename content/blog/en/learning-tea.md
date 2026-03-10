---
title: "Learning and understanding The Elm Architecture"
slug: "learning-tea"
publishDate: 2026-09-03
draft: true
tags: ["javascript", "typescript", "elm", "functional programming"]
description: ""
lang: "en"
---

For this article we are going to be using `lit-html` so we don't have to implement two key features ourselves: html generation and efficient rendering.
But don't worry, all you need to know is that when using `html` you can provide html as a javascript string. This means you can include javascript expression inside it using `${}`. And you bind functions to dom events by using `@evetname`. This is similar to how Vue works, and the equivalent of `onEventname` in React:

```ts
import { html } from "lit-html";

const text = "Click me";
const view = html` <button @click=${() => alert("I was clicked")}>
  ${text}
</button>`;
```

Now, once we create this string that represents the DOM, we need to render it. We can do it using the \_ named function `render`, provinding a mounting point. We can modify our content and call `render` again, and it'll try to efficiently update only the changed values.

```ts
import { render } from "lit-html";

render(view, document.querySelector<HTMLElement>("#app")!);
```

Let's recreate our Vite basic app using `lit-html`:

```ts

```

Okay, you should start your server and check if everything looks the same.
The problem is that now are lost the button behaviour. It would update the text inside the button everytime it was clicked.

Let's implement that. Instead of having our view being static, let's start by making it a function that takes a number:

```ts

```

Create, now let's create a variable to keep track of the current value for this number, we'll call it a `counter`

```ts

```

Now, we can create a function that increases the value of the counter and renders the new view:

```ts

```

Now all we need to do is bind this `increaseCounter` function to our button:

```ts

```

If you check your browser, it should be working again. We have the same static content, but now when you click the button, it'll
increase it's count and udpate it's value.

I hope you can there is nothing new here, this is the basis for every framework. React and Solid uses JSX instead of `html`, while Vue and Svelte uses Single File Componets with `<template>` tags. React and Vue use a Virtual DOM to efficienly patch the rendered content, while Solid and Svelte tracks signals or mutations to make direct updates to the DOM.

> What is the DOM? And what is a Virtual DOM?

> The next step is really what separates The Elm Architecture from others: every state change is expressed as a message declarative value describing what should happen. This is what unlocks some powerful capabilities — which we'll get to shortly.

> Declarative vs Imperative
> But let's remember that this is a scale, while React is more declarative then JQuery, messaging is more declarative then React.

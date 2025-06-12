---
title: "Loading button without changing the size"
slug: "bulma-loading-button"
publishDate: 2024-10-10
draft: false
tags: ["javascript", "css"]
description: "A strategy to show a loading icon on a button without modifying its size"
lang: "en"
---

Every project will have that button that triggers an action that takes time to complete. Generally, while this action is being executed, you need to prevent the user from clicking the button again, and also provide feedback that the action is being executed. It's common in these cases to display a loading icon on the button itself. However, when adding the loading icon, the size of the button changes, which is not always desirable.

Recently, I was using the CSS framework [Bulma](https://bulma.io/) and noticed that they have an implementation of a button with a loading icon that doesn't change the button size. Here's a simplified version of this implementation:

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

Practically, when the button has the `loading` class, the button text is hidden and a loading icon is added. As the text is still present (but invisible), the size of the button doesn't change. The coolest part is that the loading icon is made just with CSS: if you have a round element (`border-radius: 999999px;`) and only two visible borders, you have a semicircle. If you rotate this circle with a simple animation, you have a loading icon.

:stackblitz-iframe{:src="https://stackblitz.com/edit/sb1-l26m7v?ctl=1&embed=1&file=src%2FApp.vue"}

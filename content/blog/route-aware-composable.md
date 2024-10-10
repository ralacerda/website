---
title: "Composables que se adaptam à rota"
publishDate: 2024-10-09
draft: true
tags: ["javascript", "vue"]
description: "Como criar composables que se adaptam à rota utilizando Vue 3 e Vue Router"
lang: "pt"
---

Uma das vantagens de usar `composables` em `vue` é que você consegue justamente “compor” novos composables a partir de outros já existentes. Por exemplo, você pode criar um composable que fornece informações diferentes baseado na rota atual.

Vamos imaginar um cenário em que você tem um `floating button` no seu site. Esse é um botão que está sempre presente no canto inferior direito da sua página, entretanto, o seu ícone e comportamento precisam ser diferentes dependendo da página que o usuário está.

Uma solução seria criar o seguinte composable:

```ts
import { computed } from "vue";
import { useRoute } from "vue-router";

export default function useFloatingButton() {
  const route = useRoute();
  const mode = computed<"contact" | "newPage">(() => {
    const contactPages = ["/about-us", "/contact-us"];
    return contactPages.includes(route.path) ? "contact" : "newPage";
  });

  const buttonText = computed(() =>
    mode.value === "contact" ? "Contact Us" : "New Page"
  );

  const handleClick = () => {
    if (mode.value === "contact") {
      console.log("Contact action triggered");
    } else {
      console.log("New page action triggered");
    }
  };

  return {
    mode,
    buttonText,
    handleClick,
  };
}
```

[Stackblitz](https://stackblitz.com/edit/route-aware-initial?file=src%2Fcomposables%2FuseFloatingButton.ts)

Problema resolvido, mas ainda podemos melhorar. O que aconteceria se você precisasse criar uma nova página que também usasse o modo `contact`? Você teria que se lembrar de adicionar a nova rota ao array `contactPages`, o que não é ideal. Para mim, o ideal seria que a própria rota soubesse qual é o seu modo. Para isso, podemos usar `meta` do `vue-router`.

```ts
const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: { floatingButtonMode: "newPage" },
  },
  {
    path: "/about-us",
    name: "AboutUs",
    component: AboutUs,
    meta: { floatingButtonMode: "contact" },
  },
  {
    path: "/contact-us",
    name: "ContactUs",
    component: ContactUs,
    meta: { floatingButtonMode: "contact" },
  },
];
```

Se você está usando TypeScript, pode adicionar um tipo para o meta das rotas:

```ts
declare module "vue-router" {
  interface RouteMeta {
    floatingButtonMode?: "newPage" | "contact";
  }
}
```

Nesse caso, não se esqueça de adicionar o `as const` na definição das rotas, senão o `TypeScript` irá inferir o tipo como `string`.

Agora podemos modificar nosso composable para usar o `meta` da rota:

```ts
import { computed } from "vue";
import { useRoute } from "vue-router";

export default function useFloatingButton() {
  const route = useRoute();

  const mode = computed<"contact" | "newPage">(() => {
    return route.meta.floatingButtonMode || "newPage";
  });

  const buttonText = computed(() =>
    mode.value === "contact" ? "Contact Us" : "New Page"
  );

  const handleClick = () => {
    if (mode.value === "contact") {
      console.log("Contact us action triggered");
    } else {
      console.log("New page action triggered");
    }
  };

  return {
    mode,
    buttonText,
    handleClick,
  };
}
```

:stack-blitz{:src="https://stackblitz.com/edit/route-aware-initial-q2nryw?embed=1&file=src%2Fcomposables%2FuseFloatingButton.ts"}

<!-- Se temos parâmetros com ID, seria importante fazer um watch porque o componente é o mesmo -->
<!-- Falar sobre como esse componente pode ser adaptado para o Nuxt, que usa outro paradigma -->

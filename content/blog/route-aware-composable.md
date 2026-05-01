---
title_pt: "Composables que se adaptam à rota"
title_en: "Route-aware composables"
slug: "route-aware-composable"
publishDate: 2024-10-09
draft: false
tags: ["javascript", "vue"]
description_pt: "Como criar composables que se adaptam à rota utilizando Vue 3 e Vue Router"
description_en: "How to create composables that adapt to the route using Vue 3 and Vue Router"
---

::lang-block{lang="pt"}
Uma das vantagens de usar `composables` em `vue` é que você consegue justamente “compor” novos composables a partir de outros já existentes. Por exemplo, você pode criar um composable que fornece informações diferentes baseado na rota atual.

Vamos imaginar um cenário em que você tem um `floating button` no seu site. Esse é um botão que está sempre presente no canto inferior direito da sua página, entretanto, o seu texto e comportamento precisam ser diferentes dependendo da página que o usuário está.

Uma solução seria criar o seguinte composable:
::

::lang-block{lang="en"}
One of the advantages of using `composables` in `vue` is that you can compose new composables from existing ones. For example, you can create a composable that provides different information based on the current route.

Let's imagine a scenario where you have a `floating button` on your website. This is a button that is always present in the bottom right corner of your page, however, its text and behavior need to be different depending on the page the user is on.

One solution would be to create the following composable:
::

```typescript
import { computed } from "vue";
import { useRoute } from "vue-router";

export default function useFloatingButton() {
  const route = useRoute();
  const contactPages = ["/about-us", "/contact-us"];
  const mode = computed<"contact" | "login">(() => {
    return contactPages.includes(route.path) ? "contact" : "login";
  });

  const buttonText = computed(() =>
    mode.value === "contact" ? "Contact Us" : "Login"
  );

  const handleClick = () => {
    if (mode.value === "contact") {
      console.log("Contact action triggered");
    } else {
      console.log("Login action triggered");
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

::lang-block{lang="pt"}
Problema resolvido, mas ainda podemos melhorar. O que aconteceria se você precisasse criar uma nova página que também usasse o modo `contact`? Você teria que se lembrar de adicionar a nova rota ao array `contactPages`, o que não é ideal. Para mim, o ideal seria que a própria rota soubesse qual é o seu modo. Para isso, podemos usar `meta` do `vue-router`.
::

::lang-block{lang="en"}
Problem solved, but we can still improve. What would happen if you needed to create a new page that also used the `contact` mode? You would have to remember to add the new route to the `contactPages` array, which is not ideal. For me, the ideal would be for the route itself to know what its mode is. For this, we can use `meta` from `vue-router`.
::

```typescript
const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: { floatingButtonMode: "login" },
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

::lang-block{lang="pt"}
Se você está usando TypeScript, pode adicionar um tipo para o meta das rotas:
::

::lang-block{lang="en"}
If you're using TypeScript, you can add a type for the route meta:
::

```typescript
declare module "vue-router" {
  interface RouteMeta {
    floatingButtonMode?: "login" | "contact";
  }
}
```

::lang-block{lang="pt"}
Nesse caso, não se esqueça de adicionar o `as const` na definição das rotas, senão o `TypeScript` irá inferir o tipo como `string`.

Agora podemos modificar nosso composable para usar o `meta` da rota:
::

::lang-block{lang="en"}
In this case, don't forget to add `as const` in the route definition, otherwise TypeScript will infer the type as `string`.

Now we can modify our composable to use the route's `meta`:
::

```typescript
import { computed } from "vue";
import { useRoute } from "vue-router";

export default function useFloatingButton() {
  const route = useRoute();

  const mode = computed<"contact" | "login">(() => {
    return route.meta.floatingButtonMode || "login";
  });

  const buttonText = computed(() =>
    mode.value === "contact" ? "Contact Us" : "Login"
  );

  const handleClick = () => {
    if (mode.value === "contact") {
      console.log("Contact us action triggered");
    } else {
      console.log("Login action triggered");
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

::lang-block{lang="pt"}
## Nuxt

Utilizando Nuxt é ainda mais fácil implementar esse tipo de comportamento. O Nuxt disponibiliza um macro chamado `definePageMeta` que permite definir metadados diretamente na página.
::

::lang-block{lang="en"}
## Nuxt

Using Nuxt makes it even easier to implement this type of behavior. Nuxt provides a macro called `definePageMeta` that allows defining metadata directly on the page.
::

```vue
<script setup lang="ts">
definePageMeta({
  floatingButtonMode: "contact",
});
</script>
```

::lang-block{lang="pt"}
Você pode adicionar tipagem para o `meta` de forma similar ao `vue-router`:
::

::lang-block{lang="en"}
You can add typing for the `meta` similar to `vue-router`:
::

```typescript
declare module "#app" {
  interface PageMeta {
    floatingButtonMode: "contact" | "login";
  }
}
```

:stackblitz-iframe{:src="https://stackblitz.com/edit/sb1-ck24zd?ctl=1&embed=1&file=composables%2FuseFloatingButton.ts"}

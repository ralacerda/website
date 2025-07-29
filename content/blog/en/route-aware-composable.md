---
title: "Route-aware composables"
slug: "route-aware-composable"
publishDate: 2024-10-09
draft: false
tags: ["javascript", "vue"]
description: "How to create composables that adapt to the route using Vue 3 and Vue Router"
lang: "en"
---

One of the advantages of using `composables` in `vue` is that you can compose new composables from existing ones. For example, you can create a composable that provides different information based on the current route.

Let's imagine a scenario where you have a `floating button` on your website. This is a button that is always present in the bottom right corner of your page, however, its text and behavior need to be different depending on the page the user is on.

One solution would be to create the following composable:

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

Problem solved, but we can still improve. What would happen if you needed to create a new page that also used the `contact` mode? You would have to remember to add the new route to the `contactPages` array, which is not ideal. For me, the ideal would be for the route itself to know what its mode is. For this, we can use `meta` from `vue-router`.

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

If you're using TypeScript, you can add a type for the route meta:

```typescript
declare module "vue-router" {
  interface RouteMeta {
    floatingButtonMode?: "login" | "contact";
  }
}
```

In this case, don't forget to add `as const` in the route definition, otherwise TypeScript will infer the type as `string`.

Now we can modify our composable to use the route's `meta`:

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

## Nuxt

Using Nuxt makes it even easier to implement this type of behavior. Nuxt provides a macro called `definePageMeta` that allows defining metadata directly on the page.

```vue
<script setup lang="ts">
definePageMeta({
  floatingButtonMode: "contact",
});
</script>
```

You can add typing for the `meta` similar to `vue-router`:

```typescript
declare module "#app" {
  interface PageMeta {
    floatingButtonMode: "contact" | "login";
  }
}
```

:stackblitz-iframe{:src="https://stackblitz.com/edit/sb1-ck24zd?ctl=1&embed=1&file=composables%2FuseFloatingButton.ts"}

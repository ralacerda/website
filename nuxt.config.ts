// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxt/eslint", "@nuxtjs/color-mode", "@nuxt/icon", "@nuxt/image"],
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },

  future: {
    compatibilityVersion: 4,
  },

  css: ["~/styles/index.scss"],

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData:
            '@use "~/styles/_variables.scss" as *; @use "~/styles/_mixins.scss" as *;',
        },
      },
    },
  },

  icon: {
    customCollections: [
      {
        dir: "./app/assets/logos",
        prefix: "logos",
      },
    ],
  },
});

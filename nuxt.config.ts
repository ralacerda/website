// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxt/eslint",
    "@nuxtjs/color-mode",
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxt/content",
    "@nuxtjs/seo",
  ],

  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },

  future: {
    compatibilityVersion: 4,
  },

  css: ["~/styles/index.scss"],

  icon: {
    customCollections: [
      {
        dir: "./app/assets/logos",
        prefix: "logos",
      },
    ],
    provider: "iconify",
    serverBundle: false,
  },

  content: {
    contentHead: false,
  },

  site: {
    url: "https://renatolacerda.com",
    name: "Renato Lacerda",
    description:
      "Desenvolvedor Web com conhecimento de VueJS, Nuxt e Typescript",
    defaultLocale: "pt",
  },

  image: {
    provider: "ipx",
  },
});

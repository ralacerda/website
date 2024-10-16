// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxt/eslint",
    "@nuxtjs/color-mode",
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxt/content",
    "@nuxtjs/seo",
    "@nuxt/fonts",
    "nuxt-time",
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
  },

  content: {
    contentHead: false,
    highlight: {
      theme: {
        default: "github-dark",
        dark: "github-dark",
        light: "github-light",
      },
    },
    markdown: {
      anchorLinks: false,
    },
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

  nitro: {
    compressPublicAssets: true,
    preset: "netlify",
  },

  routeRules: {
    "/**": { prerender: true },
  },
});

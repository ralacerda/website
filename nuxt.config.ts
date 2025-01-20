// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxtjs/seo",
    "@nuxt/eslint",
    "@nuxtjs/color-mode",
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxt/content",
    "@nuxt/fonts",
    "nuxt-time",
    "nuxt-i18n-micro",
  ],

  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },

  future: {
    compatibilityVersion: 4,
  },

  css: ["~/styles/index.scss"],

  icon: {
    mode: "svg",
    customCollections: [
      {
        dir: "./app/assets/logos",
        prefix: "logos",
      },
    ],
  },

  content: {
    build: {
      markdown: {
        highlight: {
          theme: {
            default: "github-dark",
            dark: "github-dark",
            light: "github-light",
          },
        },
      },
    },
    renderer: {
      anchorLinks: false,
    },
  },

  site: {
    url: "https://renatolacerda.com",
    name: "Renato Lacerda",
    description:
      "Desenvolvedor Web com conhecimento de VueJS, Nuxt e Typescript",
  },

  app: {
    head: {
      titleTemplate: "%s | Renato Lacerda",
    },
  },

  image: {
    provider: "ipx",
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler",
        },
      },
    },
  },

  i18n: {
    locales: [
      { code: "pt", iso: "pt-BR", dir: "ltr" },
      { code: "en", iso: "en-US", dir: "ltr" },
    ],
    defaultLocale: "en",
    translationDir: "locales",
    meta: true,
    strategy: "prefix",
    disablePageLocales: true,
  },

  nitro: {
    preset: "netlify-static",
  },
});

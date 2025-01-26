// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxtjs/seo",
    "@nuxt/eslint",
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxt/content",
    "@nuxt/fonts",
    "nuxt-time",
    "@nuxtjs/i18n",
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

  i18n: {
    baseUrl: "https://renatolacerda.com",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_redirected",
      redirectOn: "root", // recommended
    },
    defaultLocale: "pt",
    strategy: "prefix_except_default",
    locales: [
      {
        code: "en",
        file: "en.json",
        language: "en",
      },
      {
        code: "pt",
        file: "pt.json",
        language: "pt",
      },
    ],
  },
});

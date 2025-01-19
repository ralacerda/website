// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxt/eslint",
    "@nuxtjs/color-mode",
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxt/content",
    "@nuxt/fonts",
    "nuxt-time",
    "nuxt-og-image",
    "nuxt-schema-org",
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

  experimental: {
    componentIslands: true,
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

  nitro: {
    preset: "netlify-static",
  },
});

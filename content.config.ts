import { defineCollection, defineContentConfig, z } from "@nuxt/content";

export default defineContentConfig({
  collections: {
    blog: defineCollection({
      source: "blog/*/*.md",
      type: "page",
      schema: z.object({
        title: z.string(),
        publishDate: z.string(),
        draft: z.boolean(),
        tags: z.array(z.string()),
        description: z.string(),
        lang: z.string(),
        slug: z.string(),
      }),
    }),
    project: defineCollection({
      source: "projects/*.json",
      type: "data",
      schema: z.object({
        title: z.string().or(z.object({ en: z.string(), pt: z.string() })),
        slug: z.string(),
        weight: z.number(),
        tech: z.array(z.string()),
        link: z.string().url(),
        screenshots: z.array(z.string()),
        repoLink: z.string().url(),
      }),
    }),
    projectDescription: defineCollection({
      source: "projects/descriptions/**/*.md",
      type: "page",
    }),
    pages: defineCollection({
      source: "pages/*/*.md",
      type: "page",
    }),
  },
});

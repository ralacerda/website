import { defineCollection, defineContentConfig } from "@nuxt/content";
import { z } from "zod";

const blogSchema = z.object({
  title_pt: z.string(),
  title_en: z.string().optional(),
  publishDate: z.string(),
  draft: z.boolean(),
  tags: z.array(z.string()),
  description_pt: z.string(),
  description_en: z.string().optional(),
  slug: z.string(),
});

export type BlogPost = z.infer<typeof blogSchema>;

const projectSchema = z.object({
  title: z.string().or(z.object({ en: z.string(), pt: z.string() })),
  slug: z.string(),
  weight: z.number(),
  tech: z.array(z.string()),
  link: z.url(),
  screenshots: z.array(z.string()),
  repoLink: z.url(),
});

export type Project = z.infer<typeof projectSchema>;

export default defineContentConfig({
  collections: {
    blog: defineCollection({
      source: "blog/*.md",
      type: "page",
      schema: blogSchema,
    }),
    project: defineCollection({
      source: "projects/*.json",
      type: "data",
      schema: projectSchema,
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

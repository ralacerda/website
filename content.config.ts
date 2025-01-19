// import { defineCollection, defineContentConfig, z } from "@nuxt/content";

// export default defineContentConfig({
//   collections: {
//     blog: defineCollection({
//       source: "blog/*.md",
//       type: "page",
//       schema: z.object({
//         title: z.string(),
//         publishDate: z.date(),
//         draft: z.boolean(),
//         tags: z.array(z.string()),
//         description: z.string(),
//         lang: z.string(),
//       }),
//     }),
//     projects: defineCollection({
//       source: "projects/*.md",
//       type: "page",
//       schema: z.object({
//         title: z.string(),
//         slug: z.string(),
//         weight: z.number(),
//         tech: z.array(z.string()),
//         link: z.string().url(),
//         screenshots: z.array(z.string()),
//         repoLink: z.string().url(),
//       }),
//     }),
//   },
// });

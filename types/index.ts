import type { MarkdownParsedContent } from "@nuxt/content";

export interface Project extends MarkdownParsedContent {
  title: string;
  weight: number;
  screenshots: string[];
  tech: string[];
  slug: string;
  headings: { depth: number; slug: string; text: string }[];
  link: string;
  repoLink: string;
}

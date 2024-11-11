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

export interface BlogPost extends MarkdownParsedContent {
  title: string;
  publishDate: string;
  draft: boolean;
  tags: string[];
  description: string;
  lang: "pt | en";
}

export type BlogPostMeta = Pick<
  BlogPost,
  "title" | "description" | "publishDate" | "_path"
>;

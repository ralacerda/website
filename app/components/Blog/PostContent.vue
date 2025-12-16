<script setup lang="ts">
import type { MarkdownRoot } from "@nuxt/content";

type BlogPost = {
  title: string;
  publishDate: string;
  body: MarkdownRoot;
};

defineProps<{
  post: BlogPost;
}>();
</script>

<template>
  <article>
    <div class="article-info">
      <h2>
        {{ post.title }}
      </h2>
      <div>
        <BlogPostDate :datetime="post.publishDate" />
      </div>
    </div>
    <ContentRenderer :value="post" class="article-content" />
  </article>
</template>

<style lang="scss" scoped>
h2 {
  font-size: var(--step-3);
  margin-inline: auto;
  line-height: 1.2;
  max-width: 60ch;
  text-wrap: pretty;
}

.article-info {
  grid-column: content;
}

article {
  display: grid;
  grid-template-columns:
    [grid-start] 1fr
    [breakout-start] 0
    [content-start] minmax(min(100%, 70ch), 1fr)
    [content-end] 4vw
    [breakout-end] 1fr
    [grid-end];
}

.date {
  display: block;
  font-size: var(--step-1);
  color: var(--fg-details);
  margin-top: var(--space-s);
}

:deep(.article-content) {
  display: grid;
  grid-column: grid;
  grid-template-columns: subgrid;
  margin-top: var(--space-l);

  * {
    grid-column: content;
  }

  .breakout {
    grid-column: breakout;
  }

  h2 {
    font-size: var(--step-2);
    max-width: 45ch;
  }

  h2,
  h3 {
    margin-top: var(--space-xl);
    margin-bottom: var(--space-s);
  }

  p {
    font-size: var(--step-0);
    margin-top: var(--space-xs);
    line-height: 1.7;
  }

  details {
    grid-column: breakout;
  }

  pre {
    grid-column: breakout;
    background-color: var(--neutral-900);
    margin-block: var(--space-m);
    padding: 1rem 1.5rem;
    border-radius: 0.4rem;
    overflow-x: auto;
    font-size: var(--step--1);
  }

  :not(pre) > code {
    display: inline-block;
    padding-inline: 0.2rem;
    background-color: var(--neutral-900);
    color: var(--neutral-300);
    font-size: inherit;
    line-height: 1.4;
    border-radius: 0.2rem;
  }

  :where(li + li) {
    margin-top: 0.2em;
  }

  ul li {
    list-style-type: "- ";
  }

  :where(ul, ol) {
    margin-top: 0.4em;
    padding-left: 0;
    list-style-position: inside;
  }

  blockquote {
    grid-column: breakout;
    margin-block: var(--space-m);

    p {
      font-size: var(--step-2);
      color: var(--fg-details);
      font-family: Optima;
      font-style: italic;
      line-height: 1.4;

      &::before {
        content: "“";
      }
      &::after {
        content: "”";
      }
    }
  }
  sup a {
    margin-inline: 0.1em;
  }

  .footnotes ol {
    margin-top: var(--space-s);

    li {
      margin-top: var(--space-xs);
    }
  }

  .code-iframe {
    grid-column: grid;
    margin-top: var(--space-l);
  }
}
</style>

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
        <BlogPostTime class="date" :datetime="post.publishDate" />
      </div>
    </div>
    <ContentRenderer :value="post" class="article-content" />
  </article>
</template>

<style lang="scss" scoped>
h2 {
  font-size: var(--step-3);
  text-align: center;
}

.date {
  text-align: center;
  display: block;
  font-size: var(--step-1);
  color: var(--fg-details);
}

:deep(.article-content) {
  display: grid;
  grid-template-columns:
    [grid-start] 1fr
    [breakout-start] 0
    [content-start] minmax(min(100%, 70ch), 1fr)
    [content-end] 4vw
    [breakout-end] 1fr
    [grid-end];
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
    margin-top: var(--space-l);
  }

  p {
    margin-top: var(--space-xs);
    line-height: 1.7;
  }

  pre {
    grid-column: breakout;
    background-color: var(--neutral-900);
    margin-block: var(--space-s);
    padding: 0.5rem 1rem;
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

  blockquote {
    grid-column: breakout;

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

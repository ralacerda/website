<script setup lang="ts">
import type { BlogPost } from "~~/types";

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
    [content-start] minmax(min(100%, 70ch), 1fr)
    [content-end] 1fr
    [grid-end];
  margin-top: var(--space-l);

  pre {
    background-color: var(--bg-secondary);
    margin-top: var(--space-s);
    padding: 0.5rem 1rem;
    border-radius: 0.4rem;
    overflow-x: auto;
  }

  * {
    grid-column: grid;
  }

  p {
    margin-top: var(--space-xs);
    line-height: 1.6;
    grid-column: content;
  }
}
</style>

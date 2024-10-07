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
:deep(.article-content) {
  margin-top: var(--space-xl);

  pre {
    background-color: var(--bg-secondary);
    padding: 0.5rem 1rem;
    border-radius: 0.4rem;
    font-size: var(--step-1);
    overflow-x: auto;
  }
}
</style>

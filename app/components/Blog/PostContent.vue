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

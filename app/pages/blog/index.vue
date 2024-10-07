<script setup lang="ts">
import type { BlogPost } from "~~/types";

definePageMeta({
  layout: "blog",
});

const query = await queryContent<BlogPost>("blog")
  .sort({
    publishDate: -1,
  })
  .find();
</script>

<template>
  <main>
    <div class="card">
      <h2>Blog</h2>
      <BlogPostList :post-list="query" />
    </div>
  </main>
</template>

<style lang="scss" scoped>
h2 {
  font-size: var(--step-3);
  margin-bottom: var(--space-s);
}
</style>

<script setup lang="ts">
import type { BlogPost } from "~~/types";

definePageMeta({
  layout: "blog",
});

// const query = await queryContent<BlogPost>("blog")
//   .sort({
//     publishDate: -1,
//   })
//   .find();
</script>

<template>
  <div class="content">
    <h2>Blog</h2>
    <!-- <BlogPostList :post-list="query" /> -->
  </div>
</template>

<style lang="scss" scoped>
.content {
  max-width: 70ch;
}

h2 {
  text-align: center;
  font-size: var(--step-3);
  margin-bottom: var(--space-s);
}
</style>

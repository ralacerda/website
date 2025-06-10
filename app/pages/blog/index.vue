<script setup lang="ts">
definePageMeta({
  layout: "blog",
});

const { locale } = useI18n();

const { data: query } = await useAsyncData(`blog-index-${locale.value}`, () => {
  return queryCollection("blog")
    .where("lang", "=", locale.value)
    .where("draft", "=", false)
    .select("title", "description", "publishDate", "slug")
    .order("publishDate", "DESC")
    .all();
});
</script>

<template>
  <div class="content">
    <h2>Blog</h2>
    <BlogPostList v-if="query" :post-list="query" />
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

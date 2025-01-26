<script setup lang="ts">
const route = useRoute();
const slug = route.params.slug;

const { locale } = useI18n();

const { data: post } = await useAsyncData(
  `post-${slug}-${locale.value}`,
  () => {
    return queryCollection("blog")
      .select("title", "publishDate", "description", "body")
      .where("slug", "=", slug)
      .where("lang", "=", locale.value)
      .first();
  }
);

if (!post.value) {
  throw new Error("Post not found");
}

useSeoMeta({
  title: post.value.title,
  description: post.value.description,
  ogType: "article",
});
</script>

<template>
  <BlogPostContent v-if="post" :post="post" />
</template>

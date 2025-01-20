<script setup lang="ts">
const route = useRoute();
const slug = route.params.slug;

const { data: post } = await useAsyncData(`post-${slug}`, () => {
  return queryCollection("blog")
    .select("title", "publishDate", "description", "path", "body")
    .path("/blog/" + slug)
    .first();
});

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

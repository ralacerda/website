<script setup lang="ts">
// import type { BlogPost } from "~~/types";
// const route = useRoute();
// const slug = route.params.slug;

// const { data: post } = await useAsyncData(`post-${slug}`, () => {
//   return queryContent<BlogPost>(`/blog/${slug}`).findOne();
// });

// if (!post.value) {
//   throw new Error("Post not found");
// }

// useSeoMeta({
//   title: post.value.title,
//   description: post.value.description,
//   ogType: "article",
// });
</script>

<template>
  <p>Post</p>
  <!-- <BlogPostContent v-if="post" :post="post" /> -->
</template>

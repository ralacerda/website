<script setup lang="ts">
const route = useRoute();
const slug = route.params.slug;

const { locale } = useI18n();

const { data: post } = await useAsyncData(
  `post-${slug}`,
  () => {
    return queryCollection("blog")
      .where("slug", "=", slug)
      .first();
  },
);

if (!post.value) {
  throw new Error("Post not found");
}

const postTitle = computed(() => locale.value === "en" && post.value?.title_en ? post.value.title_en : post.value?.title_pt);
const postDescription = computed(() => locale.value === "en" && post.value?.description_en ? post.value.description_en : post.value?.description_pt);

useSeoMeta({
  title: postTitle,
  description: postDescription,
  ogType: "article",
});

defineOgImageComponent("BlogPost", {
  title: postTitle.value,
  description: postDescription.value,
});
</script>

<template>
  <BlogPostContent v-if="post" :post="post" />
</template>

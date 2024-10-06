<script setup lang="ts">
import type { BlogPost } from "~~/types";

defineProps<{
  postList: BlogPost[];
}>();
</script>

<template>
  <ul class="post-list" role="list">
    <li v-for="post in postList" :key="post._path">
      <h3>
        <NuxtLink :to="post._path">{{ post.title }} </NuxtLink>
      </h3>
      <BlogPostTime class="date" :datetime="post.publishDate" />
      <p>{{ post.description }}</p>
    </li>
  </ul>
</template>

<style lang="scss" scoped>
time {
  display: block;
  margin-bottom: var(--space-xs);
  color: var(--fg-details);
}

li {
  margin-top: var(--space-l);
}

h3 a {
  font-size: var(--step-2);
  text-decoration: none;
  transition: color 0.2s;

  &:hover {
    color: hsl(from var(--red) h calc(s * 1.4) calc(l * 1.3));
  }
}

p {
  color: var(--fg-secondary);
}
</style>

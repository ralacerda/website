<script setup lang="ts">
defineProps<{ pr: PullRequest }>();
</script>

<template>
  <div class="card">
    <NuxtLink class="title" :to="pr.url"
      >{{ pr.title }} <span class="number">#{{ pr.number }}</span></NuxtLink
    >
  </div>
</template>

<style lang="scss" scoped>
.title {
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }

  .number {
    color: var(--fg-details);
  }
}
</style>

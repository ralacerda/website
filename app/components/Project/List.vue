<script setup lang="ts">
const { $getLocale } = useI18n();

const { data: metas } = await useAsyncData(
  `projects-${$getLocale()}`,
  () => queryCollection("project").order("weight", "DESC").all(),
  {
    watch: [$getLocale],
  }
);
</script>

<template>
  <div>
    <ProjectCard v-for="meta in metas" :key="meta.slug" :meta="meta!" />
  </div>
</template>

<script setup lang="ts">
const { locale } = useI18n();

const { data: metas } = await useAsyncData(`projects-${locale.value}`, () =>
  queryCollection("project").order("weight", "DESC").all(),
);
</script>

<template>
  <div>
    <ProjectCard v-for="meta in metas" :key="meta.slug" :meta="meta!" />
  </div>
</template>

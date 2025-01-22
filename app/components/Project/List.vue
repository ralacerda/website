<script setup lang="ts">
const { data: metas } = await useAsyncData("projects", () =>
  queryCollection("project").order("weight", "DESC").all()
);
</script>

<template>
  <div>
    <ProjectCard v-for="meta in metas" :key="meta.slug" :meta="meta!" />
  </div>
</template>

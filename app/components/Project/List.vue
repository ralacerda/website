<script setup lang="ts">
const { data: projects } = await useAsyncData("projects", () =>
  queryCollection("project").order("weight", "DESC").all()
);
</script>

<template>
  <div>
    <ProjectCard
      v-for="project in projects"
      :key="project.slug"
      :project="project"
    />
  </div>
</template>

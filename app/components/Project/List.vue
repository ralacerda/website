<script setup lang="ts">
import type { Project } from "~~/types";

// const { data: projects } = useAsyncData("projects", () =>
//   return queryCollection('projects').all()
// );
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

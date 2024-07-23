<script setup lang="ts">
import type { Project } from "~~/types";

const { data: projects } = useAsyncData("projects", () =>
  queryContent<Project>("/projects").sort({ weight: -1 }).find()
);
</script>

<template>
  <ProjectCard
    v-for="project in projects"
    :key="project.slug"
    :project="project"
  />
</template>

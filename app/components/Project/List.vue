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

  <button id="showMore">Mostrar mais projetos</button>
</template>

<style lang="scss" scoped>
button {
  margin-top: var(--space-l);
  @include border-button;
}
</style>

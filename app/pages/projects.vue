<script setup lang="ts">
const { $t } = useI18n();

useHead({
  title: $t("pages.projects")!,
});
</script>

<template>
  <div class="projects">
    <h2>Projetos</h2>
    <ProjectList />
  </div>
</template>

<style lang="scss" scoped>
.projects {
  position: relative;
}

h2 {
  font-size: var(--step-3);
  margin-bottom: var(--space-m);
}
</style>

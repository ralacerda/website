<template>
  <main>
    <div class="projects">
      <h2>Projetos</h2>
      <ProjectList />
    </div>
  </main>
</template>

<style lang="scss" scoped>
.projects {
  @include card;
  position: relative;
}

h2 {
  font-size: var(--step-3);
  margin-bottom: var(--space-m);
}

.project__button {
  display: block;
  width: fit-content;
  font-size: var(--step-1);
  margin-top: var(--space-xl);
  @include border-button;
}
</style>

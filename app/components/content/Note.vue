<template>
  <div class="note breakout">
    <slot />
  </div>
</template>

<style scoped lang="scss">
.note {
  padding: var(--space-s);
  background-color: var(--bg-secondary);
  margin-top: var(--space-l);
  border-radius: 4px;

  :deep(p) {
    font-size: var(--step-0);
    margin-top: var(--space-xs);

    &:first-of-type {
      margin-top: 0;
    }
  }
}
</style>

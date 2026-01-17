<template>
  <div class="note breakout">
    <strong v-if="$slots.title"><slot name="title" /></strong>
    <slot />
    <slot name="content" />
  </div>
</template>

<style scoped lang="scss">
.note {
  padding: var(--space-s);
  background-color: var(--bg-secondary);
  margin-top: var(--space-l);
  border-radius: 4px;

  strong {
    font-size: var(--step-0);
    display: block;
    font-weight: bold;
    margin-bottom: var(--space-xs);
  }

  :deep(p) {
    font-size: var(--step-0);
    margin-top: var(--space-xs);

    &:first-of-type {
      margin-top: 0;
    }
  }
}
</style>

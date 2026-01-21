<script setup lang="ts">
const { title = undefined } = defineProps<{
  title?: string;
}>();
</script>

<template>
  <details class="more-info">
    <summary>
      <slot name="title" mdc-unwrap="p" />
      {{ title }}
    </summary>
    <slot name="content" />
    <slot />
  </details>
</template>

<style scoped>
.more-info {
  margin: 1em 0;
  padding: 1em;
  border-radius: 4px;
  background-color: var(--bg-secondary);
}

.more-info summary {
  font-weight: bold;
  cursor: pointer;
}
</style>

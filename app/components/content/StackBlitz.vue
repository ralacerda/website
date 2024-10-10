<script setup lang="ts">
defineProps<{
  src: string;
}>();
</script>

<template>
  <div class="stackblitz">
    <iframe :src width="100%" height="800px" />
  </div>
</template>

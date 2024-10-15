<script setup lang="ts">
defineProps<{
  src: string;
}>();
</script>

<template>
  <div class="code-iframe">
    <iframe :src width="100%" height="800px" loading="lazy" />
  </div>
</template>

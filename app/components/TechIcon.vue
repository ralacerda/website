<script setup lang="ts">
defineProps<{
  name: string;
}>();
</script>

<template>
  <Icon :name="`simple-icons:${name}`" size="1.1em" />
</template>

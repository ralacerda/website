<script setup lang="ts">
defineProps<{
  name: string;
}>();
</script>

<template>
  <Icon :name="`simple-icons:${name.toLocaleLowerCase()}`" size="1.2em" />
</template>

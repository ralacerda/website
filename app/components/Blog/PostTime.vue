<script setup lang="ts">
defineProps<{
  datetime: string | number | Date;
}>();
</script>

<template>
  <NuxtTime
    :datetime
    month="long"
    day="numeric"
    year="numeric"
    locale="pt-BR"
  />
</template>

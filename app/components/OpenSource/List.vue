<script setup lang="ts">
const { data: prs } = await useFetch("/api/contributions");
</script>

<template>
  <div>
    <OpenSourceCard v-for="pr in prs" :key="() => pr.number + pr.repo" :pr />
  </div>
</template>

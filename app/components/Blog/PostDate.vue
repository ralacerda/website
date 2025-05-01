<script setup lang="ts">
defineProps<{
  datetime: string;
}>();
</script>

<template>
  <NuxtTime
    class="date"
    :datetime
    month="long"
    day="numeric"
    year="numeric"
    time-zone="UTC"
    :locale="$i18n.locale"
  />
</template>

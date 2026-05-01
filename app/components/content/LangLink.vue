<script setup lang="ts">
defineProps<{
  href: string;
  pt?: string;
  en?: string;
}>();

const { locale } = useI18n();
</script>

<template>
  <NuxtLink :to="href">
    <template v-if="locale === 'en'">
      {{ en ?? pt }}
    </template>
    <template v-else>
      {{ pt ?? en }}
    </template>
  </NuxtLink>
</template>

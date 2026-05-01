<script setup lang="ts">
const props = defineProps<{
  pt?: string;
  en?: string;
}>();

const { locale } = useI18n();
</script>

<template>
  <span v-if="locale === 'en' && (en || pt)">
    {{ en || pt }}
  </span>
  <span v-else-if="locale === 'pt' && (pt || en)">
    {{ pt || en }}
  </span>
</template>

<script setup lang="ts">
defineProps<{
  lang: string;
}>();
const { locale } = useI18n();
</script>

<template>
  <div v-if="locale === lang" class="lang-block">
    <slot />
  </div>
</template>

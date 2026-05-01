<script setup lang="ts">
const { locale } = useI18n();
</script>

<template>
  <blockquote>
    <p v-if="locale === 'en' && $slots.en">
      <slot name="en" mdc-unwrap="p" />
    </p>
    <p v-else-if="locale === 'pt' && $slots.pt">
      <slot name="pt" mdc-unwrap="p" />
    </p>
    <p v-else>
      <slot mdc-unwrap="p" />
    </p>
  </blockquote>
</template>

<script setup lang="ts">
const { $t } = useI18n();

useHead({
  title: $t("pages.contact")!,
});
</script>

<template>
  <ContactForm />
</template>

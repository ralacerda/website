<script setup lang="ts">
const { $t } = useI18n();

useHead({
  title: $t("pages.about-me")!,
});
</script>

<template>
  <div>
    <AboutBio />
    <AboutSkills />
  </div>
</template>

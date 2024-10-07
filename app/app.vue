<script setup lang="ts">
defineOgImage({
  url: "/meta.png",
});
</script>

<template>
  <TheNavbar />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <TheFooter />
  <NoiseFilter />
</template>

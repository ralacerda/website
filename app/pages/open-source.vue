<script setup lang="ts">
const { locale } = useI18n();

const { data: page } = useAsyncData(`opensource-${locale.value}`, () =>
  queryCollection("pages").path(`/pages/${locale.value}/opensource`).first()
);
</script>

<template>
  <div id="opensource" class="opensource">
    <div class="content">
      <h2>Open Source</h2>
      <div class="text">
        <ContentRenderer v-if="page" :value="page" />
      </div>
    </div>
    <OpenSourceList />
  </div>
</template>

<style lang="scss" scoped>
h2 {
  font-size: var(--step-3);
}

.content {
  flex-grow: 1;
  max-width: 60ch;
}

.text {
  margin-top: var(--space-m);
}

.opensource {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(480px, 100%), 1fr));
  justify-items: start;
  gap: var(--space-xl);
}
</style>

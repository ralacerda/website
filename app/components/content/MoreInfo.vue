<script setup lang="ts">
const props = defineProps<{
  title?: string;
  titlePt?: string;
  titleEn?: string;
}>();

const { locale } = useI18n();

const displayTitle = computed(() => {
  if (locale.value === "en") {
    return props.titleEn || props.title || props.titlePt;
  }
  return props.titlePt || props.title || props.titleEn;
});
</script>

<template>
  <details class="more-info">
    <summary>
      <slot name="title" mdc-unwrap="p" />
      <slot v-if="locale === 'pt'" name="title_pt" mdc-unwrap="p" />
      <slot v-else-if="locale === 'en'" name="title_en" mdc-unwrap="p" />
      <template v-if="!$slots.title && !$slots.title_pt && !$slots.title_en">
        {{ displayTitle }}
      </template>
    </summary>

    <div class="more-info-content">
      <slot v-if="$slots[locale]" :name="locale" />
      <slot v-else />
    </div>
  </details>
</template>

<style scoped>
.more-info {
  margin: 1em 0;
  padding: 1em;
  border-radius: 4px;
  background-color: var(--bg-secondary);
}

.more-info summary {
  font-weight: bold;
  cursor: pointer;
}

.more-info-content {
  margin-top: 1em;
}
</style>

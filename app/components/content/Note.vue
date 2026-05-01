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
  <div class="note breakout">
    <strong
      v-if="displayTitle || $slots.title || $slots.title_pt || $slots.title_en"
    >
      <slot name="title" mdc-unwrap="p" />
      <slot v-if="locale === 'pt'" name="title_pt" mdc-unwrap="p" />
      <slot v-else-if="locale === 'en'" name="title_en" mdc-unwrap="p" />
      <template v-if="!$slots.title && !$slots.title_pt && !$slots.title_en">
        {{ displayTitle }}
      </template>
    </strong>

    <slot v-if="$slots[locale]" :name="locale" />
    <slot v-else />
  </div>
</template>

<style scoped lang="scss">
.note {
  padding: var(--space-s);
  background-color: var(--bg-secondary);
  margin-top: var(--space-l);
  border-radius: 4px;

  strong {
    font-size: var(--step-0);
    display: block;
    font-weight: bold;
    margin-bottom: var(--space-xs);
  }

  :deep(p) {
    font-size: var(--step-0);
    margin-top: var(--space-xs);

    &:first-of-type {
      margin-top: 0;
    }
  }
}
</style>

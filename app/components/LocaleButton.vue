<script setup lang="ts">
import { offset, useFloating, flip, autoUpdate } from "@floating-ui/vue";
import { onClickOutside } from "@vueuse/core";

const languageButton = ref<HTMLElement>();
const languageSelect = ref<HTMLElement>();
const showLanguageSelect = ref(false);
const { $switchLocale } = useI18n();

const { floatingStyles } = useFloating(languageButton, languageSelect, {
  placement: "bottom-start",
  middleware: [offset(5), flip()],
  whileElementsMounted: autoUpdate,
});

function switchLocale(locale: string) {
  showLanguageSelect.value = false;
  $switchLocale(locale);
}

onClickOutside(
  languageSelect,
  () => {
    if (!showLanguageSelect.value) return;
    showLanguageSelect.value = false;
  },
  {
    ignore: [languageButton],
  }
);
</script>

<template>
  <button
    ref="languageButton"
    class="language-button"
    aria-label="Change Language"
    @click="showLanguageSelect = !showLanguageSelect"
  >
    <Icon name="ph:translate" size="20px" />
  </button>
  <div
    v-show="showLanguageSelect"
    ref="languageSelect"
    :style="floatingStyles"
    class="language-select"
  >
    {{ $switchLocalePath("pt") }}
    <button class="language-option" @click="switchLocale('pt')">
      <Icon class="language-flag" name="flag:br-4x3" />Português
    </button>
    <button class="language-option" @click="switchLocale('en')">
      <Icon class="language-flag" name="flag:us-4x3" />English
    </button>
  </div>
</template>

<style lang="scss" scoped>
.language-select {
  background-color: var(--bg-secondary);
  border-radius: 8px;
}

.language-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;

  @media (hover: hover) {
    .language-flag {
      filter: grayscale(1);
      transition: filter 0.2s;
    }

    &:hover {
      .language-flag {
        filter: grayscale(0);
      }
    }
  }
}

.language-button {
  display: grid;
  place-items: center;
}
</style>

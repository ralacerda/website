<script setup lang="ts">
import { offset, useFloating, flip, autoUpdate } from "@floating-ui/vue";
import { onClickOutside } from "@vueuse/core";

const emit = defineEmits<{
  languageSwitch: [];
}>();

const languageButton = ref<HTMLElement>();
const languageSelect = ref<HTMLElement>();
const showLanguageSelect = ref(false);
const { setLocale, locale } = useI18n();

const { floatingStyles } = useFloating(languageButton, languageSelect, {
  placement: "bottom-start",
  middleware: [offset(5), flip()],
  whileElementsMounted: autoUpdate,
});

function switchLocale(locale: "pt" | "en") {
  showLanguageSelect.value = false;
  emit("languageSwitch");
  setLocale(locale);
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
    <Icon name="ph:translate" size="1.25em" />
  </button>
  <div
    v-show="showLanguageSelect"
    ref="languageSelect"
    :style="floatingStyles"
    class="language-select"
  >
    <button
      class="language-option"
      :data-active="locale == 'pt'"
      @click="switchLocale('pt')"
    >
      <Icon
        class="language-flag"
        name="flag:br-4x3"
        font-size="1.25em"
      />Português
    </button>
    <button
      class="language-option"
      :data-active="locale == 'en'"
      @click="switchLocale('en')"
    >
      <Icon
        class="language-flag"
        name="flag:us-4x3"
        font-size="1.25em"
      />English
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
    & {
      color: var(--fg-details);
      .language-flag {
        filter: grayscale(1);
        transition: filter 0.2s;
      }
    }

    &:hover {
      color: inherit;
      .language-flag {
        filter: grayscale(0);
      }
    }
  }

  @media not (hover: hover) {
    &[data-active="false"] {
      color: var(--fg-details);
      .language-flag {
        filter: grayscale(1);
      }
    }
  }
}

.language-button {
  display: grid;
  place-items: center;
}
</style>

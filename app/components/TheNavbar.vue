<script setup lang="ts">
import { useScroll, useWindowSize, useMounted } from "@vueuse/core";

const { y } = useScroll(window);
const { width } = useWindowSize();

const open = ref(false);

const isMounted = useMounted();
const { t } = useI18n();

const links = computed(() => {
  return new Map([
    [t("pages.about-me"), "/about-me"],
    [t("pages.projects"), "/projects"],
    ["Blog", "/blog"],
    ["Open Source", "/open-source"],
  ]);
});
</script>

<template>
  <nav class="navbar" :class="{ sticky: y > 0 }">
    <div class="container" data-allow-mismatch="children">
      <header class="title">
        <div>
          <NuxtLinkLocale to="/">Renato Lacerda</NuxtLinkLocale>
        </div>
        <button
          id="navbar-button"
          class="button"
          aria-label="Toggle navigation menu"
          @click="open = !open"
        >
          <Icon v-show="open" name="mdi:close" size="1.25em" />
          <Icon v-show="!open" name="bx:menu" size="1.25em" />
        </button>
      </header>
      <Transition name="fade" :duration="800">
        <div
          v-if="open || (width ?? true) > 960"
          class="right"
          :data-active="open || null"
          :class="{
            'mobile-hidden': !open && (width ?? true) > 960 && !isMounted,
          }"
        >
          <ul role="list" class="navigation">
            <li
              v-for="([label, link], index) in links"
              :key="link"
              :style="{ '--index': index }"
            >
              <NuxtLinkLocale v-slot="{ href, navigate }" custom :to="link"
                ><a
                  :href="href"
                  @click="
                    async (e: Event) => {
                      await navigate(e);
                      open = false;
                    }
                  "
                >
                  {{ label }}
                </a></NuxtLinkLocale
              >
            </li>
          </ul>
          <div class="buttons" :style="{ '--index': links.size }">
            <LocaleButton @language-switch="open = false" />
          </div>
        </div>
      </Transition>
    </div>
  </nav>
</template>

<style scoped lang="scss">
.navbar {
  position: sticky;
  z-index: 999;
  top: 0;
  transition: background-color 300ms, box-shadow 300ms;

  & a {
    color: var(--fg);
    text-decoration: none;
  }
}

.navbar.sticky {
  box-shadow: var(--shadow-soft);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  background-color: var(--bg-transparent);
}

.container {
  width: var(--content-size);
  margin-inline: auto;
  padding: 1.2rem 0.6rem;
  display: flex;
  justify-content: space-between;
}

.title {
  font-size: var(--step-1);
  font-weight: 600;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.right {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.buttons {
  display: flex;
  gap: 1rem;
}

.navigation {
  display: flex;
  gap: 0rem 2rem;
  align-items: center;
}

.link {
  background: linear-gradient(var(--red) 0 0) calc(100% - var(--p, 0%)) 90% /
    var(--p, 0%) 2px no-repeat;
  transition: background 150ms, background-position 0s;

  &:hover,
  &:focus-visible {
    --p: 100%;
  }
}

.button {
  display: none;
  background: none;
  color: var(--fg);
  cursor: pointer;
  border: none;
}

.theme-button-placeholder {
  width: 1.25em;
  height: 1.25em;
}

@media (max-width: 960px) {
  .button {
    display: unset;
  }

  .container {
    flex-direction: column;
  }

  .mobile-hidden {
    display: none;
  }

  .right[data-active] {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    translate: 0;

    width: 100%;
    font-size: var(--step-5);
    position: fixed;
    top: 71px;
    height: calc(100dvh - 71px);
    left: 0;

    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    background-color: var(--bg-transparent);
    overscroll-behavior: contain;

    &.fade-enter-active,
    &.fade-leave-active {
      transition: opacity 0.2s;

      li,
      .buttons {
        transition: transform 0.5s calc(var(--index) * 0.05s),
          opacity 0.5s calc(var(--index) * 0.05s);
        transition-timing-function: cubic-bezier(0.34, 0.79, 0.35, 1.01);
      }
    }

    &.fade-enter-from,
    &.fade-leave-to {
      opacity: 0;

      li,
      .buttons {
        transform: translateX(-1rem);
        opacity: 0;
      }
    }
  }

  .navigation {
    flex-direction: column;
    align-items: flex-start;
    li {
      width: calc(var(--content-size) - 1.2rem);
      margin-inline: auto;
      padding-top: 3rem;
    }
  }
}

.buttons {
  min-width: 20px;

  @media (max-width: 960px) {
    margin-top: var(--space-xl);
    align-self: flex-start;
    padding-left: calc(((100vw - var(--content-size)) / 2) + 0.6rem);
  }
}
</style>

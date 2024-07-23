<script setup lang="ts">
import { useScroll } from "@vueuse/core";

const { y } = useScroll(window);
const colorMode = useColorMode();
const open = ref(false);

function toggleColorMode() {
  colorMode.preference = colorMode.value === "light" ? "dark" : "light";
}

const links = new Map([
  ["Sobre mim", "/sobre-mim"],
  ["Projetos", "/projetos"],
  ["Open Source", "/opensource"],
  ["Contato", "/contato"],
]);
</script>

<template>
  <nav class="navbar" :class="{ sticky: y > 0 }">
    <div class="navbar__container">
      <header class="navbar__title">
        <div><NuxtLink href="/">Renato Lacerda</NuxtLink></div>
        <button
          id="navbar-button"
          class="navbar__button"
          aria-label="Toggle navigation menu"
        >
          <Icon
            :name="open ? 'ic:baseline-close' : 'bx:menu'"
            size="1.25em"
            @click="open = !open"
          />
        </button>
      </header>
      <div class="navbar__right" :data-active="open || null">
        <ul role="list" class="navbar__navigation">
          <li v-for="[label, link] in links" :key="link">
            <NuxtLink :to="link" class="navbar__link"> {{ label }} </NuxtLink>
          </li>
        </ul>
        <button class="navbar__theme-button">
          <Transition name="fade" mode="out-in">
            <Icon
              v-if="!$colorMode.unknown"
              :key="$colorMode.value"
              size="1.25em"
              :name="$colorMode.value === 'light' ? 'bx:moon' : 'bx:sun'"
              @click="toggleColorMode"
            />
          </Transition>
        </button>
      </div>
    </div>
  </nav>
</template>

<style lang="scss">
.navbar {
  position: sticky;
  z-index: 999;
  top: 0;
  transition: background-color 300ms;
  overflow: hidden;

  & a {
    color: var(--fg);
    text-decoration: none;
  }
}

.navbar.sticky {
  @include shadow;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  background-color: var(--bg-transparent);
}

.navbar__container {
  @include centered-content;
  padding: 1.2rem 0.6rem;
  display: flex;
  justify-content: space-between;
}

.navbar__title {
  font-size: var(--step-1);
  font-weight: 600;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navbar__right {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.navbar__navigation {
  display: flex;
  gap: 0rem 2rem;
  align-items: center;
}

.navbar__link {
  background: linear-gradient(var(--danger) 0 0) calc(100% - var(--p, 0%)) 90% /
    var(--p, 0%) 2px no-repeat;
  transition: 150ms, background-position 0s;

  &:hover,
  &:focus-visible {
    --p: 100%;
  }
}

.navbar__button {
  display: none;
  background: none;
  color: var(--fg);
  cursor: pointer;
  border: none;
}

@media (max-width: 960px) {
  .navbar__button {
    display: unset;
  }

  .navbar__right {
    display: none;
  }

  .navbar__container {
    flex-direction: column;
  }

  .navbar__right[data-active] {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .navbar__navigation {
    flex-direction: column;
    align-items: flex-start;
    li {
      padding-top: 1rem;
    }
  }
}

.navbar__theme-button {
  min-width: 20px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

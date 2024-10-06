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
    <div class="container">
      <header class="title">
        <div><NuxtLink href="/">Renato Lacerda</NuxtLink></div>
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
      <div class="right" :data-active="open || null">
        <ul role="list" class="navigation">
          <li v-for="[label, link] in links" :key="link">
            <NuxtLink :to="link" class="link"> {{ label }} </NuxtLink>
          </li>
        </ul>
        <button
          class="theme-button"
          title="Mudar tema"
          @click="toggleColorMode"
        >
          <Icon
            v-if="!$colorMode.unknown"
            v-show="$colorMode.value === 'light'"
            size="1.25em"
            name="bx:moon"
          />
          <Icon
            v-if="!$colorMode.unknown"
            v-show="$colorMode.value === 'dark'"
            size="1.25em"
            name="bx:sun"
          />
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
  transition: background-color 300ms, box-shadow 300ms;
  overflow: hidden;

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

.navigation {
  display: flex;
  gap: 0rem 2rem;
  align-items: center;
}

.link {
  background: linear-gradient(var(--red) 0 0) calc(100% - var(--p, 0%)) 90% /
    var(--p, 0%) 2px no-repeat;
  transition: 150ms, background-position 0s;

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

@media (max-width: 960px) {
  .button {
    display: unset;
  }

  .right {
    display: none;
  }

  .container {
    flex-direction: column;
  }

  .right[data-active] {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .navigation {
    flex-direction: column;
    align-items: flex-start;
    li {
      padding-top: 1rem;
    }
  }
}

.theme-button {
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

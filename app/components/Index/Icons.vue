<script setup lang="ts">
const icons = [
  ["Bash", "gnubash"],
  ["Git", "git"],
  ["GitHub", "github"],
  ["Javascript", "javascript"],
  ["Typescript", "typescript"],
  ["React", "react"],
  ["Vue", "vuedotjs"],
  ["Nuxt", "nuxtdotjs"],
  ["Vitest", "vitest"],
  ["Cypress", "cypress"],
  ["Storybook", "storybook"],
] as const;
</script>

<template>
  <ul class="icon-list" role="list">
    <li
      v-for="([label, icon], index) in icons"
      :key="icon"
      :data-tooltip="label"
      :style="{ '--index': index }"
    >
      <TechIcon :name="icon" />
    </li>
  </ul>
</template>

<style lang="scss" scoped>
.icon-list {
  margin-top: var(--space-2xl);
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: var(--space-l-xl);
  font-size: var(--step-4);
  color: var(--gray);
}

li {
  opacity: 0;

  animation: slide-in 1s 0.7s forwards;
  animation-timing-function: cubic-bezier(0.39, 0.53, 0.17, 0.99);
  animation-delay: calc(var(--index) * 0.05s);
  --slide-in-color: hsl(from var(--red) h calc(s * 1.5) l);

  :root.dark-mode & {
    --slide-in-color: hsl(from var(--red) h calc(s * 1.3) calc(l * 0.7));
  }

  & .iconify {
    transition: color 0.2s;
  }

  &::after {
    content: attr(data-tooltip);
    display: block;
    position: absolute;
    bottom: 100%;
    left: 50%;
    font-size: 1.3rem;
    padding: 0.15rem 0.4rem;
    background-color: var(--bg-secondary);
    color: var(--fg);
    transform: translate(-50%, 0rem);
    border-radius: 6px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.4s, transform 0.4s;
  }

  &:hover,
  &:focus-visible {
    & .iconify {
      color: var(--red);
    }

    &::after {
      opacity: 1;
      transform: translate(-50%, -0.3rem);
    }
  }
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateY(80px);
    color: var(--slide-in-color);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

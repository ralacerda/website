<script setup lang="ts">
import { animate, stagger, spring } from "motion";
const icons = [
  ["Git", "git"],
  ["GitHub", "github"],
  ["HTML5", "html5"],
  ["CSS3", "css3"],
  ["SASS", "sass"],
  ["Javascript", "javascript"],
  ["Typescript", "typescript"],
  ["Vue", "vuedotjs"],
  ["Nuxt", "nuxtdotjs"],
  ["Astro", "astro"],
];

onMounted(() => {
  animate(
    ".icon-list li",
    {
      opacity: [0, 1],
      y: [80, 0],
    },
    {
      delay: stagger(0.05),
      easing: spring({ stiffness: 200, damping: 30 }),
    }
  );
});
</script>

<template>
  <ul class="icon-list content" role="list">
    <li v-for="[label, icon] in icons" :key="icon" :data-tooltip="label">
      <TechIcon :name="icon" />
    </li>
  </ul>
</template>

<style lang="scss" scoped>
.icon-list {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: var(--space-l-xl);
  font-size: var(--step-4);
  color: var(--gray);
}

li {
  opacity: 0;

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
    color: var(--danger);

    &::after {
      opacity: 1;
      transform: translate(-50%, -0.3rem);
    }
  }
}
</style>

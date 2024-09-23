<script setup lang="ts">
defineProps<{
  name: string;
  location: string;
  date: string;
  icon: string;
}>();
</script>

<template>
  <div class="bubble">
    <h3 class="title">{{ name }}</h3>
    <div class="location">{{ location }}</div>
    <div class="logo">
      <Icon :name="icon" mode="svg" />
    </div>
    <div class="date">{{ date }}</div>
  </div>
</template>

<style lang="scss" scoped>
.logo {
  color: var(--bg-details);
  width: var(--space-xl-2xl);
  height: var(--space-xl-2xl);
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: 0.5rem;

  svg {
    fill: currentColor;
    height: var(--space-xl-2xl);
    width: 100%;
    opacity: 0.5;
  }
}

.title {
  font-size: var(--step-1);
  padding-right: calc(var(--space-xl-2xl) + 0.5rem);
}

.bubble {
  box-shadow: var(--shadow-soft);
  line-height: 1.5;
  margin-bottom: var(--space-xl);
  background-color: var(--bg-secondary);
  border-radius: 10px;
  padding: 0.5rem 1rem;
  margin-left: calc(var(--left-margin) * 2);
  position: relative;
}

.bubble::before {
  content: "";
  width: var(--circle-size);
  height: var(--circle-size);
  left: calc((var(--left-margin) * -1) - (var(--circle-size) / 2));
  top: calc((var(--step-0) * 0.75) + 0.5rem - (var(--circle-size) / 4));
  border-radius: 100%;
  background-color: var(--bg);
  border: solid 3px var(--red);
  position: absolute;
}

.bubble::after {
  content: "";
  z-index: -5;
  height: var(--line-width);
  width: calc(var(--left-margin) * 1.3);
  top: calc((var(--step-0) * 0.75) + 0.5rem + (var(--line-width) / 4));
  position: absolute;
  left: calc((var(--left-margin) * -1) - (var(--circle-size) / 4));
  background-color: var(--red);
}
</style>

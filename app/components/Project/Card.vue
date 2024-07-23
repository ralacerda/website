<script setup lang="ts">
import type { Project } from "~~/types";

defineProps<{
  project: Project;
}>();
</script>

<template>
  <div class="project">
    <div class="project__flex">
      <div class="project__text">
        <h3 class="project__title">{{ project.title }}</h3>
        <a :href="project.link" target="_blank" class="project__link">{{
          project.link
        }}</a>
        <div class="project__description">
          <ContentDoc :path="project._path" />
        </div>
        <a href="{project.repoLink}" target="_blank"> Repositório do projeto</a>
        <ul class="project__icons" role="list">
          <li v-for="icon in project.tech" :key="icon" :data-tooltip="icon">
            <TechIcon :name="icon" />
          </li>
        </ul>
      </div>
      <div class="project__screenshot-background">
        <a :href="project.link" target="_blank">
          <NuxtImg
            class="project__screenshot"
            :src="project.screenshots[0]"
            alt=""
            width="600"
            height="400"
            format="webp"
            aspect-ratio="3:2"
          />
        </a>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.project + .project {
  margin-top: var(--space-xl-2xl);
}

.project__flex {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  row-gap: var(--space-m);
  column-gap: var(--space-l);
}

.project__description {
  padding-block: var(--space-s);
}

.project__title {
  font-size: var(--step-2);
}

.project__icons {
  display: flex;
  column-gap: var(--space-m);
  font-size: var(--step-3);
  color: var(--gray);
  opacity: 0.6;
  margin-top: var(--space-m);
}

.project__link {
  display: inline-block;
  margin-top: 0.2rem;
}

.project__text {
  flex: 1 1 400px;
  // max-width: 70ch;
}

.project__screenshot {
  height: auto;
  transition: box-shadow 200ms, transform 200ms;
  border-radius: 3px;
  background-color: var(--bg-secondary);

  @include shadow;

  &:hover {
    transform: translate(-0.5rem, -0.5rem);
  }
}

.project__screenshot-background {
  border-radius: 4px;
  background-color: var(--danger);
}
</style>

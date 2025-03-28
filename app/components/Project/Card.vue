<script setup lang="ts">
type ProjectMeta = {
  title: string | { en: string; pt: string };
  link: string;
  repoLink: string;
  tech: string[];
  screenshots: string[];
  slug: string;
};

const { locale } = useI18n();

const { meta } = defineProps<{
  meta: ProjectMeta;
}>();

const { data: content } = await useAsyncData(
  `project-description-${meta.slug}-${locale.value}`,
  () =>
    queryCollection("projectDescription")
      .path(`/projects/descriptions/${locale.value}/${meta.slug}`)
      .first()
);
</script>

<template>
  <div class="project">
    <div class="flex">
      <div class="text">
        <h3 v-if="typeof meta.title == 'string'" class="title">
          {{ meta.title }}
        </h3>
        <h3 v-else class="title">
          {{ meta.title[locale] }}
        </h3>
        <a :href="meta.link" target="_blank" class="link">{{ meta.link }}</a>
        <div class="description">
          <ContentRenderer v-if="content" :value="content" />
        </div>
        <a :href="meta.repoLink" target="_blank"> {{ $t("projects.repo") }}</a>
        <ul class="icons" role="list">
          <li v-for="icon in meta.tech" :key="icon" :data-tooltip="icon">
            <TechIcon :name="icon" />
          </li>
        </ul>
      </div>
      <div class="screenshot-background">
        <a :href="meta.link" target="_blank">
          <NuxtImg
            class="screenshot"
            :src="meta.screenshots[0]"
            alt=""
            width="600"
            height="400"
            format="webp"
            quality="85"
            aspect-ratio="3:2"
            lazy
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

.flex {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  row-gap: var(--space-m);
  column-gap: var(--space-l);
}

.description {
  padding-block: var(--space-s);
}

.title {
  font-size: var(--step-2);
}

.icons {
  display: flex;
  column-gap: var(--space-m);
  font-size: var(--step-3);
  color: var(--gray);
  opacity: 0.6;
  margin-top: var(--space-m);
}

.link {
  display: inline-block;
  margin-top: 0.2rem;
}

.text {
  flex: 1 1 400px;
  // max-width: 70ch;
}

.screenshot {
  height: auto;
  transition: box-shadow 200ms, transform 200ms;
  border-radius: 3px;
  background-color: var(--bg-secondary);

  box-shadow: var(--shadow-soft);

  &:hover {
    transform: translate(-0.5rem, -0.5rem);
  }
}

.screenshot-background {
  border-radius: 4px;
  background-color: var(--red);
}
</style>

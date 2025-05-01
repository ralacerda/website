<script setup lang="ts">
const { repo, pullrequest, mergeDate } = defineProps<{
  repo: {
    name: string;
    url: string;
  };
  pullrequest: {
    title: string;
    url: string;
  };
  mergeDate: Date;
}>();

const { locale } = useI18n();
</script>

<template>
  <div class="contribution">
    <Icon name="mdi:source-merge" size="2em" style="color: var(--red)" />
    <div class="info">
      <div>
        <a class="repo" :href="repo.url" target="_blank">{{ repo.name }}:</a>
        <a class="pullrequest" :href="pullrequest.url" target="_blank">
          {{ pullrequest.title }}
        </a>
      </div>
      <div class="merge-date">
        <NuxtTime
          :datetime="mergeDate"
          :locale
          day="2-digit"
          month="long"
          year="numeric"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.contribution {
  display: flex;
  align-items: center;
  gap: var(--space-s);
  margin-bottom: var(--space-s);
}

.repo,
.pullrequest {
  text-decoration: none;
  transition: color 0.1s ease-in-out;

  &:hover {
    color: hsl(from var(--red) h calc(s * 1.4) calc(l * 1.3));
  }
}

.repo {
  margin-right: 0.25em;
  color: var(--fg-details);
}

.pullrequest {
  color: var(--fg-primary);
}

.merge-date {
  color: var(--fg-details);
  margin-top: var(--space-3xs);
  font-size: var(--step--1);
}
</style>

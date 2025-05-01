<script setup lang="ts">
const { locale } = useI18n();

const contributions = [
  {
    repo: {
      name: "vueuse/vueuse",
      url: "https://github.com/vueuse/vueuse",
    },
    pullrequest: {
      title: "fix(useCountdown): start() should accept a custom initial value",
      url: "https://github.com/vueuse/vueuse/pull/4554",
    },
    mergeDate: new Date("2025-02-01"),
  },
  {
    repo: {
      name: "antfu-collective/taze",
      url: "https://github.com/antfu-collective/taze",
    },
    pullrequest: {
      title: "chore: detect package manager to show in message after writing",
      url: "https://github.com/antfu-collective/taze/pull/152",
    },
    mergeDate: new Date("2025-01-18"),
  },
  {
    repo: {
      name: "nuxt/nuxt.com",
      url: "https://github.com/nuxt/nuxt.com/",
    },
    pullrequest: {
      title: "docs: info about env vars with firebase hosting",
      url: "https://github.com/nuxt/nuxt.com/pull/1664",
    },
    mergeDate: new Date("2024-10-01"),
  },
  {
    repo: {
      name: "vuejs/vuefire",
      url: "https://github.com/vuejs/vuefire/",
    },
    pullrequest: {
      title: "fix: bindFirestoreRef not reacting to getter",
      url: "https://github.com/vuejs/vuefire/pull/1496",
    },
    mergeDate: new Date("2024-02-23"),
  },
  {
    repo: {
      name: "dicebear/dicebear",
      url: "https://github.com/dicebear/dicebear/",
    },
    pullrequest: {
      title: "Fix: Always return false when likelihood is zero",
      url: "https://github.com/dicebear/dicebear/pull/315",
    },
    mergeDate: new Date("2023-05-14"),
  },
  {
    repo: {
      name: "withastro/docs",
      url: "https://github.com/withastro",
    },
    pullrequest: {
      title: "Improve deploy/gitlab.md documentation",
      url: "https://github.com/withastro/docs/pull/1693",
    },
    mergeDate: new Date("2022-10-03"),
  },
  {
    repo: {
      name: "Cqsi/lichs",
      url: "https://github.com/Cqsi/lichs",
    },
    pullrequest: {
      title: "Use Path to load and write token as OS-neutral",
      url: "https://github.com/Cqsi/lichs/pull/4",
    },
    mergeDate: new Date("2020-05-24"),
  },
];

const { data: page } = useAsyncData(`opensource-${locale.value}`, () =>
  queryCollection("pages").path(`/pages/${locale.value}/opensource`).first()
);
</script>

<template>
  <div id="opensource" class="opensource">
    <div class="content">
      <h2>Open Source</h2>
      <div class="text">
        <ContentRenderer v-if="page" :value="page" />
      </div>
    </div>

    <div class="contributions">
      <OpenSourceContribution
        v-for="contribution in contributions"
        :key="contribution.pullrequest.url"
        :repo="contribution.repo"
        :pullrequest="contribution.pullrequest"
        :merge-date="contribution.mergeDate"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
h2 {
  font-size: var(--step-3);
}

.content {
  flex-grow: 1;
  max-width: 60ch;
}

.text {
  margin-top: var(--space-m);
}

.opensource {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(480px, 100%), 1fr));
  justify-items: start;
  gap: var(--space-xl);
}

.contributions > * + * {
  margin-top: var(--space-m);
}
</style>

<script setup lang="ts">
const pullrequestsInfo = [
  {
    alt: "Pull request contributing to lichs",
    url: "https://github.com/Cqsi/lichs/pull/4",
  },
  {
    alt: "Pull request contributing to Astro",
    url: "https://github.com/withastro/docs/pull/1693",
  },
  {
    alt: "Pull request contributing to Astro",
    url: "https://github.com/withastro/docs/pull/1727",
  },
  {
    alt: "Pull request contributing to Astro",
    url: "https://github.com/withastro/docs/pull/1951",
  },
  {
    alt: "Pull request contributing to Astro",
    url: "https://github.com/withastro/astro/pull/5894",
  },
  {
    alt: "Pull request contributing to nitro",
    url: "https://github.com/unjs/nitro/pull/903",
  },
  {
    alt: "Pull request contributing to DiceBear",
    url: "https://github.com/dicebear/dicebear/pull/315",
  },
];

const { locale } = useI18n();

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

    <div class="gallery">
      <div v-for="(pr, index) in pullrequestsInfo" :key="pr.url" class="image">
        <a :href="pr.url" target="_blank">
          <NuxtImg
            :src="`/images/pullrequests/pullrequest${index}.png`"
            alt=""
            height="106"
            width="610"
          />
        </a>
      </div>
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
.gallery:hover .image:not(:hover) {
  filter: saturate(0.1);
}

.gallery {
  --overlap: var(--space-xl);
}

.gallery .image {
  display: block;
  flex-grow: 0;
  isolation: isolate;
  transition: 200ms;
  border: 1px solid #00000060;
  position: relative;

  img {
    height: auto;
  }
}

.gallery .image + .image {
  margin-top: calc(var(--overlap) * -1);
}

.gallery .image:hover:not(:last-child) {
  transform: translateY(calc(var(--overlap) * -1 * 0.6));
}

@media (max-width: 660px) {
  .gallery {
    --overlap: 0;
  }
}

.opensource {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(480px, 100%), 1fr));
  justify-items: start;
  gap: var(--space-xl);
}
</style>

<script setup lang="ts">
const { $getLocale } = useI18n();

const { data: page } = useAsyncData(
  `about-me-${$getLocale()}`,
  () =>
    queryCollection("pages").path(`/pages/${$getLocale()}/about-me`).first(),
  {
    watch: [$getLocale],
  }
);
</script>

<template>
  <div id="sobre-mim" class="grid">
    <div class="content">
      <h2>{{ $t("about-me.title") }}</h2>
      <div class="text">
        <ContentRenderer v-if="page" :value="page" />
      </div>
    </div>
    <div class="about">
      <AboutBioCard
        :name="$t('about-me.cards.MBA.name') as string"
        :location="$t('about-me.cards.MBA.location') as string"
        icon="logos:usp"
        start-date="2024"
      />
      <AboutBioCard
        :name="$t('about-me.cards.skylar.name') as string"
        :location="$t('about-me.cards.skylar.location') as string"
        icon="logos:skylar"
        start-date="2024"
      />
      <AboutBioCard
        :name="$t('about-me.cards.desenvolve.name') as string"
        :location="$t('about-me.cards.desenvolve.location') as string"
        icon="logos:desenvolva"
        start-date="2023"
        end-date="2023"
      />
      <AboutBioCard
        :name="$t('about-me.cards.csf.name') as string"
        :location="$t('about-me.cards.csf.location') as string"
        icon="logos:southampton"
        start-date="2013"
        end-date="2014"
      />
      <AboutBioCard
        :name="$t('about-me.cards.graduation.name') as string"
        :location="$t('about-me.cards.graduation.location') as string"
        icon="logos:usp"
        start-date="2010"
        end-date="2015"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(420px, 100%), 1fr));
  row-gap: var(--space-2xl);
}

.content {
  align-self: start;
  h2 {
    font-size: var(--step-3);
  }
}

.text {
  margin-top: var(--space-m);
}

.about {
  display: flex;
  flex-direction: column;
  align-items: start;
  position: relative;

  --line-width: calc(var(--step--2) / 2);
  --left-margin: var(--space-l-xl);
  --circle-size: var(--step-0);
  --distance: var(--space-2xl);

  &::after {
    position: absolute;
    background-color: var(--red);
    width: var(--line-width);
    // height: calc(100% + (var(--distance) * 2));
    height: calc(100% + (var(--distance)));
    top: var(--step-0);
    left: calc(var(--left-margin) - (var(--line-width) / 2));
    content: "";
    z-index: -10;
  }
}
</style>

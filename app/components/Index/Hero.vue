<template>
  <div class="hero">
    <div class="flex">
      <NuxtImg
        alt=""
        src="/images/hero-image.jpg"
        height="747"
        width="748"
        sizes="260px lg:400px"
        preload
        format="webp"
        quality="85"
        class="image"
      />
      <div class="text">
        <h1 class="name">{{ $t("index.intro") }}</h1>
        <div class="position">
          {{ $t("index.position") }}
        </div>
        <div class="links">
          <NuxtLinkLocale class="border-button" to="/projects">{{
            $t("pages.projects")
          }}</NuxtLinkLocale>
          <NuxtLinkLocale class="border-button outlined" to="/blog">
            Blog
          </NuxtLinkLocale>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.flex {
  display: flex;
  flex-direction: row;
  column-gap: var(--space-xl);
  row-gap: var(--space-l);
  padding-inline: 1rem;
  justify-content: center;
  align-items: center;

  @media (max-width: 960px) {
    flex-direction: column;
    text-align: center;
  }
}

.image {
  max-height: 350px;
  max-width: 350px;
  border-radius: 100%;
  aspect-ratio: 1 / 1;

  box-shadow: 4px 4px 10px 2px hsl(from var(--red) h s calc(l * 0.6) / 0.2);
  :root.dark-mode & {
    box-shadow: 2px 2px 10px 2px hsl(from var(--red) h s calc(l * 0.2) / 0.6);
  }

  @media (max-width: 960px) {
    max-height: 260px;
    max-width: 260px;
  }
}

.text {
  display: grid;
  align-content: center;
  line-height: 1.2;
}

.name {
  font-size: var(--step-4);
}

.position {
  max-width: 40rem;
  font-size: var(--step-1);
  margin-top: var(--space-xs);
  margin-bottom: var(--space-l);
  text-wrap: balance;
  color: var(--fg-details);
}

.links {
  display: flex;
  gap: 1rem;

  .border-button {
    display: flex;
    align-items: center;
    gap: 0.4rem;

    .iconify {
      transition: translate 0.2s;
    }

    &:hover {
      .iconify {
        translate: 5px;
      }
    }
  }

  @media (max-width: 960px) {
    flex-direction: column;
    align-items: center;
  }
}
</style>

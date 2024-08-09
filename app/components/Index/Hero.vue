<template>
  <div class="hero">
    <div class="grid">
      <div class="text">
        <h1 class="name">Olá, eu sou o Renato</h1>
        <div class="position">Desenvolvedor Web</div>
        <NuxtLink class="cta border-button" to="/projetos">
          Meus projetos</NuxtLink
        >
      </div>
      <NuxtImg
        alt="Foto de Renato"
        src="/images/hero-image.jpeg"
        height="747"
        width="748"
        sizes="260px lg:400px"
        preload
        format="webp"
        quality="85"
        class="image"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.grid {
  display: grid;
  grid-template-areas: "text image";
  column-gap: var(--space-xl);
  row-gap: var(--space-l);
  padding-inline: 1rem;

  @media (width <= 960px) {
    grid-template-areas:
      "image"
      "text";
  }
}

.image {
  grid-area: image;
  max-height: 400px;
  max-width: 400px;
  box-shadow: 2px -4px 0 4px var(--red);
  background-color: var(--red);
  border-radius: 100%;
  aspect-ratio: 1 / 1;
  justify-self: center;

  @media (max-width: 960px) {
    & {
      max-height: 260px;
      max-width: 260px;
    }
  }
}

.text {
  grid-area: text;
  display: grid;
  align-content: center;
  line-height: 1.2;

  @media (width <= 960px) {
    text-align: center;
  }
}

.name {
  font-size: var(--step-4);
  margin-bottom: var(--space-xs);
}

.position {
  font-size: var(--step-3);
  margin-bottom: var(--space-l);
}

.cta {
  font-size: var(--step-2);

  @media (width <= 960px) {
    margin-inline: auto;
  }
}
</style>

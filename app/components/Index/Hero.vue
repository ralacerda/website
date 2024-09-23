<template>
  <div class="hero">
    <div class="flex">
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
      <div class="text">
        <h1 class="name">Olá, eu sou Renato</h1>
        <div class="position">
          Desenvolvedor web entusiasta de código aberto e focado em soluções
          simples e eficiente.
        </div>
        <NuxtLink class="cta border-button" to="/projetos">
          Veja meus projetos</NuxtLink
        >
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
    & {
      flex-direction: column;
    }
  }
}

.image {
  max-height: 350px;
  max-width: 350px;
  box-shadow: 2px -4px 0 4px var(--red);
  background-color: var(--red);
  border-radius: 100%;
  aspect-ratio: 1 / 1;

  @media (max-width: 960px) {
    & {
      max-height: 260px;
      max-width: 260px;
    }
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
  margin-bottom: var(--space-m);
  text-wrap: balance;
  color: var(--fg-details);
}

.cta {
  font-size: var(--step-1);
}
</style>

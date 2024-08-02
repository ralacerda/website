<template>
  <div class="hero">
    <div class="flex">
      <NuxtImg
        alt="Foto de Renato"
        src="/images/hero-image.png"
        aspect-ratio="1:1"
        height="600"
        width="600"
        preload
        format="webp"
        quality="100"
        class="image"
      />
      <div class="text">
        <h1 class="name">Olá, eu sou o Renato</h1>
        <div class="position">Desenvolvedor Front End</div>
        <NuxtLink class="cta border-button" to="/projetos">
          Meus projetos</NuxtLink
        >
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.flex {
  display: flex;
  flex-direction: row;
  column-gap: var(--space-l);
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
  max-height: 400px;
  max-width: 400px;
  box-shadow: 2px -4px 0 4px var(--danger);
  background-color: var(--danger);
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
  text-align: center;
  display: grid;
  align-content: center;
  line-height: 1.2;
}

.name {
  font-size: var(--step-4);
}

.position {
  font-size: var(--step-3);
  margin-top: var(--space-xs);
  margin-bottom: var(--space-m);
}

.cta {
  margin-inline: auto;
  font-size: var(--step-2);
}
</style>

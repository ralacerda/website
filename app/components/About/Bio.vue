<template>
  <div id="sobre-mim" class="grid">
    <div class="content">
      <h2>Sobre mim</h2>
      <div class="text">
        <!-- <ContentDoc path="aboutme" /> -->
      </div>
    </div>
    <div class="about">
      <AboutBioCard
        name="MBA - Engenharia de Software"
        location="Universidade de São Paulo"
        icon="logos:usp"
        date="2024 - Atual"
      />
      <AboutBioCard
        name="Desenvolvedor Front End"
        location="Skylar"
        icon="logos:skylar"
        date="2023 - Atual"
      />
      <AboutBioCard
        name="Programa Desenvolve Fullstack"
        location="Grupo Boticário - Alura"
        icon="logos:desenvolva"
        date="2023"
      />
      <AboutBioCard
        name="Ciências Sem Fronteiras"
        location="University of Southampton"
        icon="logos:southampton"
        date="2013 - 2014"
      />
      <AboutBioCard
        name="Graduação em Ciências Biológicas"
        location="Universidade de São Paulo"
        icon="logos:usp"
        date="2010 - 2015"
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

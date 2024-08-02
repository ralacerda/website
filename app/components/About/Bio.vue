<template>
  <div id="sobre-mim" class="grid">
    <div class="content card">
      <h2>Sobre mim</h2>
      <div class="text">
        <ContentDoc path="aboutme" />
      </div>
    </div>
    <div class="about">
      <div class="bubble">
        <h3 class="title">Programa Desenvolve Fullstack</h3>
        <div class="location">Grupo Boticário - Alura</div>
        <div class="logo">
          <Icon name="logos:desenvolva" mode="svg" />
        </div>
        <div class="date">2023</div>
      </div>
      <div class="bubble">
        <h3 class="title">Mestrado em Ecologia</h3>
        <div class="location">Universidade de Campinas</div>
        <div class="logo">
          <Icon name="logos:unicamp" mode="svg" />
        </div>
        <div class="date">2019 - 2023</div>
      </div>
      <div class="bubble">
        <h3 class="title">Ciências Sem Fronteiras</h3>
        <div class="location">University of Southampton</div>
        <div class="logo">
          <Icon name="logos:southampton" mode="svg" />
        </div>
        <div class="date">2013 - 2014</div>
      </div>
      <div class="bubble">
        <h3 class="title">Graduação em Ciências Biológicas</h3>
        <div class="location">Universidade de São Paulo</div>
        <div class="logo">
          <Icon name="logos:usp" mode="svg" />
        </div>
        <div class="date">2010 - 2015</div>
      </div>
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

.logo {
  color: var(--bg-details);
  width: var(--space-xl-2xl);
  height: var(--space-xl-2xl);
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;

  svg {
    fill: currentColor;
    height: var(--space-xl-2xl);
    width: 100%;
    opacity: 0.5;
  }
}

.title {
  font-size: var(--step-1);
  padding-right: calc(var(--space-xl-2xl) + 0.5rem);
}

.bubble {
  box-shadow: var(--shadow-soft);
  line-height: 1.5;
  margin-bottom: var(--space-xl);
  background-color: var(--bg-secondary);
  border-radius: 10px;
  padding: 0.5rem 1rem;
  margin-left: calc(var(--left-margin) * 2);
  position: relative;
}

.bubble::before {
  content: "";
  width: var(--circle-size);
  height: var(--circle-size);
  left: calc((var(--left-margin) * -1) - (var(--circle-size) / 2));
  top: calc((var(--step-0) * 0.75) + 0.5rem - (var(--circle-size) / 4));
  border-radius: 100%;
  background-color: var(--bg);
  border: solid 3px var(--red);
  position: absolute;
}

.bubble::after {
  content: "";
  z-index: -5;
  height: var(--line-width);
  width: calc(var(--left-margin) * 1.3);
  top: calc((var(--step-0) * 0.75) + 0.5rem + (var(--line-width) / 4));
  position: absolute;
  left: calc((var(--left-margin) * -1) - (var(--circle-size) / 4));
  background-color: var(--red);
}
</style>

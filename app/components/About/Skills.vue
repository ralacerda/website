<template>
  <div id="habilidades" class="skills">
    <div class="block card">
      <Icon name="mdi:lightbulb-variant-outline" class="icon" />
      <h2>Fluência em Línguas Estrangeiras</h2>
      <p>
        Durante um ano, vivi e estudei na Inglaterra, o que me possibilitou
        alcançar fluência no idioma Inglês.
      </p>
    </div>

    <div class="block card">
      <Icon name="mdi:console-line" class="icon" />
      <h2>Linux e Linha de Comando</h2>
      <p>
        Utilizo GNU/Linux como sistema operacional, o que me forneceu
        familiariedade com Linha de Comando, Bash e Docker.
      </p>
    </div>

    <div class="block card">
      <Icon name="mdi:airplane" class="icon" />
      <h2>Aprendizado Contínuo</h2>
      <p>
        Gosto de estar sempre atualizado e aprender novas tecnologias e
        habilidades. Por isso, sempre procuro fazer cursos online para expandir
        meus conhecimentos.
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
h2 {
  margin-bottom: var(--step--1);
  font-size: var(--step-1);
  line-height: 1.2;
}

.icon {
  margin-inline: auto;
  font-size: var(--step-3);
  color: var(--bg-details);
  margin-bottom: var(--space-s);
}

.skills {
  margin-top: 0;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xl);
  justify-content: space-around;
  text-align: center;
}

.block {
  flex: 1 0 200px;
  box-sizing: content-box;
}
</style>

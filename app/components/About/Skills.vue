<template>
  <div id="habilidades" class="skills">
    <div class="block card">
      <Icon name="mdi:lightbulb-variant-outline" class="icon" />
      <h2>{{ $t("skills.language.title") }}</h2>
      <p>{{ $t("skills.language.content") }}</p>
    </div>

    <div class="block card">
      <Icon name="mdi:console-line" class="icon" />
      <h2>{{ $t("skills.linux.title") }}</h2>
      <p>{{ $t("skills.linux.content") }}</p>
    </div>

    <div class="block card">
      <Icon name="mdi:airplane" class="icon" />
      <h2>{{ $t("skills.learning.title") }}</h2>
      <p>{{ $t("skills.learning.content") }}</p>
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

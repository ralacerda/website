<template>
  <div id="habilidades" class="skills">
    <div class="block card">
      <Icon name="mdi:teach" class="icon" />
      <h2>{{ $t("skills.teaching.title") }}</h2>
      <p>{{ $t("skills.teaching.content") }}</p>
    </div>

    <div class="block card">
      <Icon name="mdi:forum-outline" class="icon" />
      <h2>{{ $t("skills.communication.title") }}</h2>
      <p>{{ $t("skills.communication.content") }}</p>
    </div>

    <div class="block card">
      <Icon name="mdi:robot-outline" class="icon" />
      <h2>{{ $t("skills.ai.title") }}</h2>
      <p>{{ $t("skills.ai.content") }}</p>
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

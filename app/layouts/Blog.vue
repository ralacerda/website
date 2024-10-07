<template>
  <main>
    <slot />
  </main>
</template>

<style lang="scss" scoped>
main {
  margin-top: var(--space-xl-2xl);
}

main > * {
  width: var(--content-size);
  margin-inline: auto;
  scroll-margin-top: 4rem;
}
</style>

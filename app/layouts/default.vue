<template>
  <main>
    <slot />
  </main>
</template>

<style lang="scss" scoped>
main {
  align-self: center;
  margin-top: var(--space-xl-2xl);
}

:deep(p, li) {
  max-width: 80ch;
}

:deep(p + p) {
  margin-top: var(--space-s);
}

main > * {
  width: var(--content-size);
  margin-inline: auto;
  scroll-margin-top: 4rem;
}
</style>

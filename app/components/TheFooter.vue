<template>
  <footer>
    Renato Lacerda · 2024
    <ul class="social" role="list">
      <li>
        <a target="_blank" href="https://www.linkedin.com/in/renato-ac-lacerda/"
          >Linkedin</a
        >
      </li>
      <li><a target="_blank" href="https://github.com/ralacerda">GitHub</a></li>
      <li>
        <a target="_blank" href="https://codepen.io/ralacerda">CodePen</a>
      </li>
      <li>
        <a target="_blank" href="https://hachyderm.io/@renato">Mastodon</a>
      </li>
      <li>
        <a target="_blank" href="https://twitter.com/renatoaclacerda"
          >Twitter</a
        >
      </li>
    </ul>
  </footer>
</template>

<style lang="scss" scoped>
.social {
  display: flex;
  justify-content: center;
  gap: var(--space-xs-s);
  margin-top: var(--space-2xs);
}

footer {
  font-size: var(--step--1);
  text-align: center;
  margin-top: var(--space-l-xl);
  padding-block: var(--space-m);
}
</style>

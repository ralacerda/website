<template>
  <footer>
    Renato Lacerda · 2025
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
        <a target="_blank" href="https://bsky.app/profile/ralacerda.dev"
          >Bluesky</a
        >
      </li>
    </ul>
  </footer>
</template>

<style lang="scss" scoped>
footer {
  font-size: var(--step--1);
  text-align: center;
  margin-top: var(--space-l-xl);
  padding-block: var(--space-xs);
  color: var(--fg-details);
}

.social {
  display: flex;
  justify-content: center;
  gap: var(--space-xs-s);
}
</style>

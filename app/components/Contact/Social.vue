<template>
  <div class="social">
    <ul role="list">
      <li>
        <a href="https://www.linkedin.com/in/renato-ac-lacerda/" target="_blank"
          ><Icon name="simple-icons:linkedin" size="1.2em" />Linkedin</a
        >
      </li>
      <li>
        <a href="https://github.com/ralacerda" target="_blank"
          ><Icon name="simple-icons:github" size="1.2em" />GitHub</a
        >
      </li>
      <li>
        <a href="https://codepen.io/ralacerda" target="_blank"
          ><Icon name="simple-icons:codepen" size="1.2em" />CodePen</a
        >
      </li>
      <li>
        <a href="https://hachyderm.io/@renato" target="_blank"
          ><Icon name="simple-icons:mastodon" size="1.2em" />Mastodon</a
        >
      </li>
      <li>
        <a
          href="https://bsky.app/profile/renatolacerda.bsky.social"
          target="_blank"
          ><Icon name="simple-icons:bluesky" size="1.2em" />Bluesky</a
        >
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
.social {
  flex: 1 1 180px;
  margin-top: 0.2rem;
}

.social a {
  color: var(--gray);
  display: flex;
  align-items: center;
  gap: var(--space-s);
  width: fit-content;
  position: relative;
  padding: var(--space-s);
  font-size: var(--step-1);
  font-weight: 600;
  text-decoration: none;

  --hover-color: hsl(from var(--red) h calc(s * 1.2) calc(l * 0.9));

  :root.dark-mode & {
    --hover-color: hsl(from var(--red) h calc(s * 1.1) calc(l * 1.15));
  }

  &:hover {
    color: var(--hover-color);

    &::before {
      background-color: var(--hover-color);
      transform: scaleX(300%);
      transition: transform 150ms, color 100ms;
    }
  }

  &::before {
    transition: transform 100ms, color 100ms;
    transform-origin: left;

    position: absolute;
    content: "";
    left: 0;
    top: 0;
    width: 0.2rem;
    height: 100%;
    background-color: var(--gray);
  }
}
</style>

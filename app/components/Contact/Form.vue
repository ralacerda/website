<script setup lang="ts">
onMounted(() => {
  const inputs = document.querySelectorAll("input, textarea");

  inputs.forEach((input) => {
    input.addEventListener(
      "invalid",
      () => {
        input.classList.add("error");
      },
      false
    );
  });
});
</script>

<template>
  <div id="contato" class="contact">
    <h2>Contato</h2>
    <div class="contact__text">
      <ContactMeText />
    </div>
    <div class="contact__grid">
      <div class="contact__email">
        <form
          name="contact"
          method="POST"
          data-netlify="true"
          netlify-honeypot="bot-field"
          action="/success"
        >
          <div class="contact__info">
            <label class="honey-pot" aria-hidden="true">
              Don't fill this out if you're human:
              <input
                name="bot-field"
                tabindex="-1"
                class="honey-pot"
                aria-hidden="true"
              />
            </label>
            <label>Nome: <input type="text" name="name" required /></label>
            <label
              >Email:&nbsp;<input type="email" name="email" required
            /></label>
          </div>
          <div class="contact__body">
            <textarea
              class="text"
              rows="20"
              name="body"
              aria-label="Mensagem"
            />
          </div>
          <button type="submit" class="border-button">Enviar mensagem</button>
        </form>
      </div>
      <div class="contact__social">
        <ContactSocial />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.contact__grid {
  display: flex;
  gap: var(--space-m);
  flex-wrap: wrap;
  margin-top: var(--space-m);
}

p {
  max-width: --card-max-width;
  width: 100%;
}

h2 {
  font-size: var(--step-3);
}

ul {
  padding: 0;
}

.contact__text {
  max-width: 90ch;
  line-height: 1.6;
  margin-top: var(--space-m);
}

label {
  display: flex;
  align-items: center;
  column-gap: 0.4rem;
  max-width: --card-max-width;
}

input,
textarea {
  flex: 1 1 30ch;
  max-width: --card-max-width;
  width: 100%;
  border: 1px solid var(--bg-secondary);
  border-radius: 4px;
  background-color: var(--form-background);
  outline: none;
  color: var(--form-fg);
  padding: 0.2rem 0.5rem;

  &:is(:active, :focus) {
    border: 1px solid var(--form-hl);
    box-shadow: 0 0 2px 1px var(--form-hl-shadows);
  }

  &.error {
    background-color: var(--form-background);
    box-shadow: 0 0 2px 1px var(--form-hl-shadows);
    border: 1px solid var(--red);

    &:is(:active, :focus) {
      border: 1px solid var(--red);
    }
  }
}

textarea {
  resize: none;
}

.contact__email {
  flex: 1 1 600px;

  button {
    margin-top: var(--space-s);
  }
}

.contact__body {
  margin-top: var(--space-s);
}

.contact__info {
  display: flex;
  column-gap: 2rem;
  flex-wrap: wrap;

  & > * {
    flex-grow: 1;
  }
}

.honey-pot {
  clip-path: circle(0);
  height: 1px;
  width: 1px;
  position: absolute;
  top: 0;
  left: 0;
}
</style>

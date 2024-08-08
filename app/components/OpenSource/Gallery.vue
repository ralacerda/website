<script setup lang="ts">
const pullrequestsInfo = [
  {
    alt: "Pull request contributing to lichs",
    url: "https://github.com/Cqsi/lichs/pull/4",
  },
  {
    alt: "Pull request contributing to Astro",
    url: "https://github.com/withastro/docs/pull/1693",
  },
  {
    alt: "Pull request contributing to Astro",
    url: "https://github.com/withastro/docs/pull/1727",
  },
  {
    alt: "Pull request contributing to Astro",
    url: "https://github.com/withastro/docs/pull/1951",
  },
  {
    alt: "Pull request contributing to Astro",
    url: "https://github.com/withastro/astro/pull/5894",
  },
  {
    alt: "Pull request contributing to nitro",
    url: "https://github.com/unjs/nitro/pull/903",
  },
  {
    alt: "Pull request contributing to DiceBear",
    url: "https://github.com/dicebear/dicebear/pull/315",
  },
];
</script>

<template>
  <div id="opensource" class="opensource card">
    <div class="content">
      <h2>Open Source</h2>
      <div class="text">
        <p>
          Sou entusiasta da cultura de Open Source e acredito no poder da
          colaboração e compartilhamento de conhecimento. Ao longo dos anos,
          tive a oportunidade de contribuir para diversos projetos de código
          aberto, tanto em termos de desenvolvimento de código quanto de
          documentação.
        </p>
        <p>
          Um dos projetos em que tive a oportunidade de contribuir ativamente
          foi o Astro. Contribui em multiplas ocasiões para melhorar e traduzir
          a documentação desse projeto. Colaborar com a equipe do Astro foi uma
          experiência gratificante, e essa contribuição me permitiu aprender não
          apenas sobre o projeto em si, mas também sobre boas práticas de
          documentação e comunicação eficaz em projetos de código aberto.
        </p>
        <p>
          Além disso, tenho meus próprios projetos hospedados no GitHub sob a
          licença MIT, o que significa que estou aberto a contribuições externas
          e encorajo a comunidade a fazer forks e aprender com meus
          repositórios.
        </p>
      </div>
    </div>

    <div class="gallery">
      <div v-for="(pr, index) in pullrequestsInfo" :key="pr.url" class="image">
        <a :href="pr.url" target="_blank">
          <NuxtImg
            :src="`/images/pullrequests/pullrequest${index}.png`"
            alt=""
            height="106"
            width="610"
          />
        </a>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
h2 {
  font-size: var(--step-3);
}

.content {
  flex-grow: 1;
  max-width: 60ch;
}

.text {
  margin-top: var(--space-m);
}
.gallery:hover .image:not(:hover) {
  filter: saturate(0.1);
}

.gallery {
  --overlap: var(--space-xl);
}

.gallery .image {
  display: block;
  flex-grow: 0;
  isolation: isolate;
  transition: 200ms;
  border: 1px solid #00000060;
  position: relative;

  img {
    height: auto;
  }
}

.gallery .image + .image {
  margin-top: calc(var(--overlap) * -1);
}

.gallery .image:hover:not(:last-child) {
  transform: translateY(calc(var(--overlap) * -1 * 0.6));
}

@media (max-width: 660px) {
  .gallery {
    --overlap: 0;
  }
}

.opensource {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(480px, 100%), 1fr));
  justify-items: start;
  gap: var(--space-xl);
}
</style>

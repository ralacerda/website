---
title: "Por que parei de usar autoimports"
slug: "autoimports"
publishDate: 2025-11-11
draft: false
tags: ["javascript", "typescript"]
description: "Por que as desvantagens de utilizar autoimport em projetos superam as vantagens"
lang: "pt"
---

O Nuxt 3 inclui autoimports por padrão. Inicialmente, essa era uma das minhas features favoritas.
Por padrão, todos os componentes e funções do Nuxt, Nitro e Vue são importados automaticamente. Além disso, componentes
dentro da pasta "components", e exports dentro das pastas composables e utils. Eu achava essa feature tão boa
que também comecei a usar em projetos Vite, com os plugins `unplugin-auto-import` e `unplugin-vue-components`.

Eu sempre vi duas grandes vantagens: arquivos sem um grande bloco de imports e velocidade para escrever.
Agora, em vez de ter que parar para lidar com erros de importação, eu podia simplesmente escrever como se
todos os símbolos estivessem disponíveis globalmente. O uso do autoimport virou um padrão em meus projetos.

Entretanto, depois que meu time começou a utilizar esse padrão em um projeto no trabalho, aos poucos, 
eu comecei a notar algumas desvantagens, e hoje eu considero que as vantagens não superam os problemas
que podem causar.

## O combustível para a mágica

Eu acho importante entender como os auto-imports funcionam para ficar mais clara a origem de algumas desvantagens.

De forma simplificada, o autoimport funciona da seguinte maneira: um processo lê seus arquivos de 
código e gera automaticamente um arquivo `.d.ts` (arquivo de definições TypeScript). 
Esse arquivo mapeia cada símbolo (funções, componentes, etc.) ao seu arquivo de origem, 
disponibilizando-os como se fossem globais através de uma interface TypeScript.

No meu projeto deste blog, aqui está um pedaço do arquivo `component.d.ts`:
```ts
interface _GlobalComponents {
    'AboutBio': typeof import("../app/components/About/Bio.vue")['default']
    'AboutBioCard': typeof import("../app/components/About/BioCard.vue")['default']
    'AboutSkills': typeof import("../app/components/About/Skills.vue")['default']
    'BlogPostContent': typeof import("../app/components/Blog/PostContent.vue")['default']
    'BlogPostDate': typeof import("../app/components/Blog/PostDate.vue")['default']
    'BlogPostList': typeof import("../app/components/Blog/PostList.vue")['default']
    /// ....
}
```

Entretanto, para isso acontecer enquanto você está editando, esse processo precisa estar rodando. 
Geralmente esse processo está atrelado ao servidor dev, que também monitora os arquivos para 
"regenerar" as definições quando eles mudam.

Isso já me resultou em vários problemas diferentes. Por exemplo, o processo que está monitorando não vê um arquivo
que foi criado. Outro possível problema é que quando um arquivo é apagado, a sua definição nem sempre sai
da listagem, o que pode causar um problema se algum arquivo está importando definições desse arquivo, pois
para o TypeScript, aquele símbolo ainda existe e está disponível.

Eu entendo que esses são bugs, e provavelmente não é o comportamento esperado. Entretanto, agora temos
uma nova "camada" da qual dependemos. Mesmo se esses bugs sejam resolvidos, ainda temos a possibilidade
de outros bugs aparecerem, e de uma forma ou de outra, ainda é outra complexidade que o time precisa aprender
a lidar.

## Origem desconhecida

O autoimport vai transformar o mapeamento explícito dos statements de `import` para um arquivo `.d.ts`,
deixando a relação totalmente implícita. E isso começa a gerar vários tipos de problemas diferentes.

Todo projeto depende de diferentes pacotes, e todo projeto possui diferentes tipos de código, e o entendimento
de como esses códigos interagem é fundamental para você conseguir entender e contribuir com o projeto. Entretanto, o
autoimport borra completamente a linha entre pacotes, dependências e domínios.

Quando você olha para um componente ou função sendo utilizada, não há mais nenhuma pista visual de onde aquilo vem.
Essa função pode ser do `Vue`, do `Nuxt`, do `Nitro`, pode ser de um outro pacote que tem autoimports (no caso
de um módulo do `Nuxt`), pode estar na pasta `composables`, pode estar na pasta `utils`. Mesmo que você demore
só 5 segundos para procurar pelo nome da função e achar onde ela está sendo definida, você já dificultou
o entendimento do código. 

Até para o VSCode isso vira um problema. Quando você tenta renomear um símbolo, ou clica para navegar até o arquivo
de origem, muitas vezes o editor não consegue resolver corretamente devido à natureza implícita dos autoimports.
Existe até extensão que arruma o problema de navegar para o arquivo em que o símbolo é definido, 
mas aí, mais uma vez, estamos adicionando outra camada de complexidade
para resolver problemas criados pelo autoimport.

Eu geralmente não gosto muito de focar em experiência de IA em vez de experiência de desenvolvedor, mas esse é um
caso em que os dois são afetados. Ferramentas de IA dependem muito do contexto visível
no arquivo. Sem os imports explícitos, elas perdem informação importante sobre as dependências e o domínio do código,
resultando em sugestões menos precisas ou que simplesmente não funcionam.

Outro possível problema são regras de eslint para símbolos específicos de um pacote. Por exemplo,
a regra `vue/no-ref-as-operand` evita um erro comum no Vue, difícil de detectar:
```ts
const isOpen = ref(false);

if (isOpen) {
  // do something
}
```

O problema é que `isOpen` é um `Ref`, e portanto sempre `truthy`. O que nós realmente queremos
verificar é o `value`.
```ts
const isOpen = ref(false);

if (isOpen.value) {
  // do something
}
```

Entretanto, se o `ref` for autoimported, o eslint não consegue perceber que esse `ref` vem do Vue, e que
portanto, deveria aplicar a regra.

Isso pode ser contornado utilizando type-aware linting, que faz o ESLint consultar o TypeScript para entender
as dependências. Mas é difícil de configurar corretamente, e como depende do TypeScript, aumenta o tempo de linting[^1].

[^1]: Mas eu tenho esperanças de que com `Oxlint` e o `tsgo` esse processo será muito mais rápido e fácil de configurar: https://github.com/oxc-project/tsgolint

## Padrões de arquivos e pastas 

Eu gosto muito do conceito do "Pit of Success" (Poço do Sucesso), que em resumo, é a ideia
de que sua ferramenta deve facilitar para o usuário fazer a coisa certa. A analogia é que
é mais fácil você manter uma pedra dentro de um poço do que no topo de uma colina.
Utilizar autoimport muitas vezes é equilibrar uma pedra no topo de uma colina.

Quando todos os exports de um arquivo estão disponíveis globalmente, é muito fácil
criar funções com nomes duplicados, principalmente dentro da pasta `utils`. 

Além do risco de nomes duplicados, é muito fácil você acabar criando um arquivo para
cada função, gerando uma pasta de `utils` gigante e confusa, em vez de uma pasta com arquivos
que definem claramente o domínio de cada função. Sem a necessidade de pensar em imports, não há
nenhum incentivo para organizar as coisas de forma coerente.

Por exemplo, é comum ver uma estrutura assim:
```
utils/
├── formatDate.ts
├── parseDate.ts
├── isWeekend.ts
├── addDays.ts
├── formatCurrency.ts
├── parseCurrency.ts
├── validateEmail.ts
├── validatePhone.ts
└── ... (mais 50 arquivos)
```

Quando o ideal seria algo como:
```
utils/
├── datetime.ts       // formatDate, parseDate, isWeekend, addDays
├── currency.ts       // formatCurrency, parseCurrency
└── validation.ts     // validateEmail, validatePhone
```

Para composables, o padrão recomendado é exportar somente o composable com o mesmo nome do arquivo.
Algo fácil de seguir em teoria, mas também fácil de errar na prática.

Além disso, é muito fácil você acabar importando coisas que não seria necessário. Isso pode acontecer
por vários motivos: o desenvolvedor não sabia que aquela função ou componente está disponível globalmente,
o processo de geração do mapeamento dos imports não está rodando e o desenvolvedor escreveu o import manualmente
para evitar erros de TypeScript, ou porque o editor de texto ou IA automaticamente adicionaram o import.
O resultado são arquivos em que algumas coisas são importadas automaticamente, e outras de forma explícita,
sem um padrão claro. É uma inconsistência que se espalha pelo projeto inteiro.

Você ter que constantemente verificar esses padrões e lutar contra as ferramentas significa
que existe sempre um custo adicional em manter o seu código dentro dos padrões desejados. Em vez de
a ferramenta trabalhar a seu favor, ela está criando mais trabalho.

## E as vantagens?

Eu agora acredito que as vantagens nem são tão boas quanto eu pensava inicialmente.

A principal vantagem que me atraiu no começo era a velocidade de escrita, 
mas hoje em dia, os auto-imports dos editores estão tão bons que essa vantagem praticamente desapareceu.
Os editores conseguem adicionar os imports automaticamente depois de um autocomplete, e com as `code actions`
é fácil adicionar um import sem precisar sair da região que você está editando. 

A outra vantagem era ter arquivos "mais limpos", sem um grande bloco de imports no topo. Mas com o tempo,
eu mudei completamente de opinião sobre isso. Agora eu prefiro ver o que está sendo importado no arquivo,
porque ficam claras as relações de dependências e as responsabilidades dentro daquele arquivo. 
E sinceramente, você começa a ignorar o bloco de imports depois de um tempo.

## Conclusão

Em projetos pequenos, eu continuaria com o uso de autoimports de componentes, MAS utilizando um padrão
bem específico de pastas. Devido à forma como componentes são definidos, é bem fácil entender de onde
eles estão vindo.

Em todos os outros casos, eu não acredito que as desvantagens e novas camadas de complexidade justificam
as vantagens. 

Essa conclusão não é só minha. Depois de [discussões](https://github.com/nuxt/nuxt/issues/29923) sobre o assunto,
projetos como Nitro estão [dependendo menos de autoimports](https://github.com/nitrojs/nitro/issues/2232).
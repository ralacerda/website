---
title_en: "Why I Stopped Using Auto-imports"
title_pt: "Por que parei de usar autoimports"
slug: "autoimports"
publishDate: 2025-11-11
draft: false
tags: ["javascript", "typescript"]
description_en: "Why the disadvantages of using auto-imports in projects outweigh the advantages"
description_pt: "Por que as desvantagens de utilizar autoimport em projetos superam as vantagens"
---

::lang-block{lang="en"}
Nuxt 3 includes auto-imports by default. Initially, this was one of my favorite features. By default, all Nuxt, Nitro, and Vue components and functions are automatically imported. Additionally, components inside the `components` folder, and exports inside the composables and utils folders. I found this feature so good that I also started using it in Vite projects, with the `unplugin-auto-import` and `unplugin-vue-components` plugins.

I always saw two major advantages: files without a large block of imports and speed of development. Now, instead of having to stop to deal with import errors, I could simply write as if all symbols were globally available. Using auto-import became a standard in my projects.

However, after my team started using this pattern in a work project, I started to notice some disadvantages, and today I consider that these outweigh the possible gains.
::

::lang-block{lang="pt"}
O Nuxt 3 inclui autoimports por padrão. Inicialmente, essa era uma das minhas features favoritas. Por padrão, todos os componentes e funções do Nuxt, Nitro e Vue são importados automaticamente. Além disso, componentes dentro da pasta "components", e exports dentro das pastas composables e utils. Eu achava essa feature tão boa que também comecei a usar em projetos Vite, com os plugins `unplugin-auto-import` e `unplugin-vue-components`.

Eu sempre vi duas grandes vantagens: arquivos sem um grande bloco de imports e velocidade para escrever. Agora, em vez de ter que parar para lidar com erros de importação, eu podia simplesmente escrever como se todos os símbolos estivessem disponíveis globalmente. O uso do autoimport virou um padrão em meus projetos.

Entretanto, depois que meu time começou a utilizar esse padrão em um projeto no trabalho, aos poucos, eu comecei a notar algumas desvantagens, e hoje eu considero que as vantagens não superam os problemas que podem causar.
::

## ::lang-block{lang="en"}The fuel for the magic:: ::lang-block{lang="pt"}O combustível para a mágica::

::lang-block{lang="en"}
I think it's important to understand how auto-imports work to make the source of some disadvantages clearer.

In simplified terms, auto-import works as follows: a process reads your code files and automatically generates a `.d.ts` file (Typescript definitions file). This file maps each symbol (functions, components, etc.) to its source file, making them available as if they were global through a Typescript interface.

In my blog project, here's a chunk of the `component.d.ts` file:
::

::lang-block{lang="pt"}
Eu acho importante entender como os auto-imports funcionam para ficar mais clara a origem de algumas desvantagens.

De forma simplificada, o autoimport funciona da seguinte maneira: um processo lê seus arquivos de código e gera automaticamente um arquivo `.d.ts` (arquivo de definições TypeScript). Esse arquivo mapeia cada símbolo (funções, componentes, etc.) ao seu arquivo de origem, disponibilizando-os como se fossem globais através de uma interface TypeScript.

No meu projeto deste blog, aqui está um pedaço do arquivo `component.d.ts`:
::

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

::lang-block{lang="en"}
However, for this to happen while you're editing, this process needs to be running. Usually this process is tied to the dev server, which also monitors the files to update the definitions when they change.

This was a source of a ton of problem for me. For example, when the watching process doesn't track a file that was created. Another possible problem is that when a file is deleted, its definition doesn't always leave the definition file, which can cause a problem if any file is using a definition from that file, because for Typescript, that symbol still exists and is available.

I understand these are bugs, and it's probably not the expected behavior. However, now we have a new "layer" we depend on. Even if these bugs are fixed, we still have the possibility of other bugs appearing, and one way or another, it's still another complexity the team needs to learn to deal with.
::

::lang-block{lang="pt"}
Entretanto, para isso acontecer enquanto você está editando, esse processo precisa estar rodando. Geralmente esse processo está atrelado ao servidor dev, que também monitora os arquivos para "regenerar" as definições quando eles mudam.

Isso já me resultou em vários problemas diferentes. Por exemplo, o processo que está monitorando não vê um arquivo que foi criado. Outro possível problema é que quando um arquivo é apagado, a sua definição nem sempre sai da listagem, o que pode causar um problema se algum arquivo está importando definições desse arquivo, pois para o TypeScript, aquele símbolo ainda existe e está disponível.

Eu entendo que esses são bugs, e provavelmente não é o comportamento esperado. Entretanto, agora temos uma nova "camada" da qual dependemos. Mesmo se esses bugs sejam resolvidos, ainda temos a possibilidade de outros bugs aparecerem, e de uma forma ou de outra, ainda é outra complexidade que o time precisa aprender a lidar.
::

## ::lang-block{lang="en"}Unknown origin:: ::lang-block{lang="pt"}Origem desconhecida::

::lang-block{lang="en"}
Auto-import transforms the explicit mapping of `import` statements into a `.d.ts` file, making the relationship completely implicit. This generate several different types of problems.

Every project depends on different packages, and every project has different types of code, and understanding how these codes interact is fundamental for you to understand and contribute to the project. However, auto-import completely blurs the line between packages, dependencies, and domains.

When you look at a component or function being used, there's no longer any visual clue of where it comes from. This function could be from `Vue`, from `Nuxt`, from `Nitro`, it could be from another package that has auto-imports (in case of a `Nuxt` module), it could be in the `composables` folder, it could be in the `utils` folder. Even if it only takes 5 seconds to search for the function name and find where it's defined, you've already made understanding the code more difficult.

Even for VSCode this becomes a problem. When you try to rename a symbol, or click to navigate to the source file, often the editor can't resolve correctly due to the implicit nature of auto-imports. There's even an extension that fixes the problem of navigating to the file where the symbol is defined, but again, we're adding another layer of complexity to solve problems created by auto-import.

I generally don't like to focus much on AI experience instead of developer experience, but this is a case where both are affected. AI tools depend heavily on the visible context in the file. Without explicit imports, they lose important information about dependencies and the code domain, resulting in less accurate suggestions or ones that simply don't work.
::

::lang-block{lang="pt"}
O autoimport vai transformar o mapeamento explícito dos statements de `import` para um arquivo `.d.ts`, deixando a relação totalmente implícita. E isso começa a gerar vários tipos de problemas diferentes.

Todo projeto depende de diferentes pacotes, e todo projeto possui diferentes tipos de código, e o entendimento de como esses códigos interagem é fundamental para você conseguir entender e contribuir com o projeto. Entretanto, o autoimport borra completamente a linha entre pacotes, dependências e domínios.

Quando você olha para um componente ou função sendo utilizada, não há mais nenhuma pista visual de onde aquilo vem. Essa função pode ser do `Vue`, do `Nuxt`, do `Nitro`, pode ser de um outro pacote que tem autoimports (no caso de um módulo do `Nuxt`), pode estar na pasta `composables`, pode estar na pasta `utils`. Mesmo que você demore só 5 segundos para procurar pelo nome da função e achar onde ela está sendo definida, você já dificultou o entendimento do código.

Até para o VSCode isso vira um problema. Quando você tenta renomear um símbolo, ou clica para navegar até o arquivo de origem, muitas vezes o editor não consegue resolver corretamente devido à natureza implícita dos autoimports. Existe até extensão que arruma o problema de navegar para o arquivo em que o símbolo é definido, mas aí, mais uma vez, estamos adicionando outra camada de complexidade para resolver problemas criados pelo autoimport.

Eu geralmente não gosto muito de focar em experiência de IA em vez de experiência de desenvolvedor, mas esse é um caso em que os dois são afetados. Ferramentas de IA dependem muito do contexto visível no arquivo. Sem os imports explícitos, elas perdem informação importante sobre as dependências e o domínio do código, resultando em sugestões menos precisas ou que simplesmente não funcionam.
::

::lang-block{lang="en"}
Another possible problem is eslint rules for specific symbols from a package. For example, the `vue/no-ref-as-operand` rule prevents a common Vue error that's hard to detect:
::

::lang-block{lang="pt"}
Outro possível problema são regras de eslint para símbolos específicos de um pacote. For exemplo, a regra `vue/no-ref-as-operand` evita um erro comum no Vue, difícil de detectar:
::

```ts
const isOpen = ref(false);

if (isOpen) {
  // do something
}
```

::lang-block{lang="en"}
The problem is that `isOpen` is a `Ref`, and therefore always `truthy`. What we really want to check is the `value`.
::

::lang-block{lang="pt"}
O problema é que `isOpen` é um `Ref`, e portanto sempre `truthy`. O que nós realmente queremos verificar é o `value`.
::

```ts
const isOpen = ref(false);

if (isOpen.value) {
  // do something
}
```

::lang-block{lang="en"}
However, if `ref` is auto-imported, eslint can't realize that this `ref` comes from Vue, and that therefore, it should apply the rule.

This can be worked around using type-aware linting, which makes ESLint consult Typescript to understand dependencies. But it's hard to configure correctly, and since it depends on Typescript, it increases linting time.

But I have hopes that with `Oxlint` and `tsgo` this process will be much faster and easier to configure: https://github.com/oxc-project/tsgolint
::

::lang-block{lang="pt"}
Entretanto, se o `ref` for autoimported, o eslint não consegue perceber que esse `ref` vem do Vue, e que portanto, deveria aplicar a regra.

Isso pode ser contornado utilizando type-aware linting, que faz o ESLint consultar o TypeScript para entender as dependências. Mas é difícil de configurar corretamente, e como depende do TypeScript, aumenta o tempo de linting.

Mas eu tenho esperanças de que com `Oxlint` e o `tsgo` esse processo será muito mais rápido e fácil de configurar: https://github.com/oxc-project/tsgolint
::

## ::lang-block{lang="en"}File and folder patterns:: ::lang-block{lang="pt"}Padrões de arquivos e pastas::

::lang-block{lang="en"}
I really like the concept of "Pit of Success", which in summary, is the idea that your tool should make it easy for the user to do the right thing. The analogy is that it's easier to keep a stone inside a pit than on top of a hill. Using auto-import is often balancing a stone on top of a hill.

When all exports from a file are globally available, it's very easy to create functions with duplicate names, especially inside the `utils` folder.

Besides the risk of duplicate names, it's very easy to end up creating a file for each function, generating a giant and confusing `utils` folder, instead of a folder with files that clearly define the domain of each function. Without the need to think about imports, there's no incentive to organize things coherently.

For example, it's common to see a structure like this:
::

::lang-block{lang="pt"}
Eu gosto muito do conceito do "Pit of Success" (Poço do Sucesso), que em resumo, é a ideia de que sua ferramenta deve facilitar para o usuário fazer a coisa certa. A analogia é que é mais fácil você manter uma pedra dentro de um poço do que no topo de uma colina. Utilizar autoimport muitas vezes é equilibrar uma pedra no topo de uma colina.

Quando todos os exports de um arquivo estão disponíveis globalmente, é muito fácil criar funções com nomes duplicados, principalmente dentro da pasta `utils`.

Além do risco de nomes duplicados, é muito fácil você acabar criando um arquivo para cada função, gerando uma pasta de `utils` gigante e confusa, em vez de uma pasta com arquivos que definem claramente o domínio de cada função. Sem a necessidade de pensar em imports, não há nenhum incentivo para organizar as coisas de forma coerente.

Por exemplo, é comum ver uma estrutura assim:
::

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
└── ... ::lang-block{lang="en"}(50+ more files)::::lang-block{lang="pt"}(mais 50 arquivos)::
```

::lang-block{lang="en"}
When ideally it would be something like:
::

::lang-block{lang="pt"}
Quando o ideal seria algo como:
::

```
utils/
├── datetime.ts       // formatDate, parseDate, isWeekend, addDays
├── currency.ts       // formatCurrency, parseCurrency
└── validation.ts     // validateEmail, validatePhone
```

::lang-block{lang="en"}
For composables, the recommended pattern is to export only the composable with the same name as the file. Something easy to follow in theory, but also easy to get wrong in practice.

Additionally, it's very easy to end up importing things that wouldn't be necessary. This can happen for several reasons: the developer didn't know that function or component is globally available, the process of generating the import mapping isn't running and the developer wrote the import manually to avoid Typescript errors, or because the text editor or AI automatically added the import. The result is files where some things are imported automatically, and others explicitly, without a clear pattern. It's an inconsistency that spreads throughout the entire project.

Having to constantly check these patterns and fight against the tools means there's always an additional cost in keeping your code within the desired standards. Instead of the tool working in your favor, it's creating more work.
::

::lang-block{lang="pt"}
Para composables, o padrão recomendado é exportar somente o composable com o mesmo nome do arquivo. Algo fácil de seguir em teoria, mas também fácil de errar na prática.

Além disso, é muito fácil você acabar importando coisas que não seria necessário. Isso pode acontecer por vários motivos: o desenvolvedor não sabia que aquela função ou componente está disponível globalmente, o processo de geração do mapeamento dos imports não está rodando e o desenvolvedor escreveu o import manualmente para evitar erros de TypeScript, ou porque o editor de texto ou IA automaticamente adicionaram o import. O resultado são arquivos em que algumas coisas são importadas automaticamente, e outras de forma explícita, sem um padrão claro. É uma inconsistência que se espalha pelo projeto inteiro.

Você ter que constantemente verificar esses padrões e lutar contra as ferramentas significa que existe sempre um custo adicional em manter o seu código dentro dos padrões desejados. Em vez de a ferramenta trabalhar a seu favor, ela está criando mais trabalho.
::

## ::lang-block{lang="en"}And the advantages?:: ::lang-block{lang="pt"}E as vantagens?::

::lang-block{lang="en"}
I now believe the advantages aren't even as good as I initially thought.

The main advantage that attracted me at the beginning was writing speed, but nowadays, editor auto-imports are so good that this advantage has practically disappeared. Editors can add imports automatically after an autocomplete, and with `code actions` it's easy to add an import without having to leave the region you're editing.

Another advantage was having "cleaner" files, without a large block of imports at the top. But over time, I've completely changed my opinion about this. Now I prefer to see what's being imported in the file, because the dependency relationships and responsibilities within that file become clear. And honestly, you start to ignore the import block after a while.
::

::lang-block{lang="pt"}
Eu agora acredito que as vantagens nem são tão boas quanto eu pensava inicialmente.

A principal vantagem que me atraiu no começo era a velocidade de escrita, mas hoje em dia, os auto-imports dos editores estão tão bons que essa vantagem praticamente desapareceu. Os editores conseguem adicionar os imports automaticamente depois de um autocomplete, e com as `code actions` é fácil adicionar um import sem precisar sair da região que você está editando.

A outra vantagem era ter arquivos "mais limpos", sem um grande bloco de imports no topo. Mas com o tempo, eu mudei completamente de opinião sobre isso. Agora eu prefiro ver o que está sendo importado no arquivo, porque ficam claras as relações de dependências e as responsabilidades dentro daquele arquivo. E sinceramente, você começa a ignorar o bloco de imports depois de um tempo.
::

## ::lang-block{lang="en"}Conclusion:: ::lang-block{lang="pt"}Conclusão::

::lang-block{lang="en"}
In small projects, I would continue using auto-imports for components, but with a very specific folder pattern. Due to how components are defined, it's quite easy to understand where they're coming from.

In all other cases, I don't believe the disadvantages and the new layers of complexity justify the advantages.

This conclusion isn't just mine. After [discussions](https://github.com/nuxt/nuxt/issues/29923) about it, projects like Nitro are [relying less on auto-imports](https://github.com/nitrojs/nitro/issues/2232).
::

::lang-block{lang="pt"}
Em projetos pequenos, eu continuaria com o uso de autoimports de componentes, MAS utilizando um padrão bem específico de pastas. Devido à forma como componentes são definidos, é bem fácil entender de onde eles estão vindo.

Em todos os outros casos, eu não acredito que as desvantagens e novas camadas de complexidade justificam as vantagens.

Essa conclusão não é só minha. Depois de [discussões](https://github.com/nuxt/nuxt/issues/29923) sobre o assunto, projetos como Nitro estão [dependendo menos de autoimports](https://github.com/nitrojs/nitro/issues/2232).
::

---
title_pt: "Rodando TypeScript Nativamente no Node"
title_en: "Running TypeScript Natively in Node"
slug: "typescript-native-node"
publishDate: 2026-01-12
draft: false
tags: ["javascript", "typescript", "node"]
description_pt: "Como executar arquivos TypeScript sem precisar compilar"
description_en: "How to execute TypeScript files without needing to compile"
---

::lang-block{lang="pt"}
Desde a versão 22.18, o Node possui suporte nativo para TypeScript, o que permite você executar arquivos `.ts` diretamente sem a necessidade de uma etapa de compilação inicial. Isso torna o desenvolvimento com TypeScript mais rápido e simples.

No entanto, existem alguns detalhes de configuração e sintaxe que precisam ser considerados.
::

::lang-block{lang="en"}
Since version 22.18, Node has native TypeScript support, which allows you to run `.ts` files directly without the need for an initial compilation step. This makes TypeScript development faster and simpler.

However, there are some configuration and syntax details that need to be considered.
::

::lang-block{lang="pt"}
## Gerenciando a versão do Node

Antes de tudo, é necessário estar utilizando uma versão recente do Node (22.18 ou maior). Para evitar problemas com outros projetos que rodam versões mais antigas do Node, eu recomendo utilizar um gerenciador de versões. O projeto [`nvm`](https://github.com/nvm-sh/nvm) é um dos mais populares, mas recentemente eu tenho utilizado o [`fnm`](https://github.com/Schniz/fnm) e gostado muito da experiência.

Instale uma versão recente do Node. Eu recomendo instalar a versão LTS. No momento em que escrevo esse artigo, a versão 24 é a LTS.
::

::lang-block{lang="en"}
## Managing Node version

First of all, you need to be using a recent version of Node (22.18 or higher). To avoid problems with other projects running older Node versions, I recommend using a version manager. The [`nvm`](https://github.com/nvm-sh/nvm) project is one of the most popular, but recently I've been using [`fnm`](https://github.com/Schniz/fnm) and really enjoying the experience.

Install a recent version of Node. I recommend installing the LTS version. At the time of writing this article, version 24 is the LTS.
::

```sh
fnm install 24
# or
nvm install 24
```

::more-info{title_pt="O que é a versão LTS?" title_en="What is the LTS version?"}
#pt
LTS significa "Long Term Support" (Suporte de Longo Prazo). É uma versão do Node que recebe atualizações de segurança e correções de bugs por um período prolongado (geralmente 30 meses). As versões LTS são recomendadas para projetos em produção porque oferecem estabilidade e previsibilidade, evitando mudanças significativas que podem quebrar seu código.

#en
LTS stands for "Long Term Support". It's a version of Node that receives security updates and bug fixes for an extended period (typically 30 months). LTS versions are recommended for production projects because they offer stability and predictability, avoiding significant changes that could break your code.
::

::lang-block{lang="pt"}
## Iniciando um novo projeto e dependências

Comece iniciando um novo projeto utilizando um gerenciador de dependências. No meu caso, eu utilizo o `pnpm`. Se você não tem ele instalado (se você está utilizando um version manager, você talvez precise instalá-lo para cada versão), você pode ativá-lo da seguinte forma:
::

::lang-block{lang="en"}
## Starting a new project and dependencies

Start by initializing a new project using a package manager. In my case, I use `pnpm`. If you don't have it installed (if you're using a version manager, you might need to install it for each version), you can enable it as follows:
::

```bash
corepack enable
```

::lang-block{lang="pt"}
Crie uma nova pasta e inicie seu projeto:
::

::lang-block{lang="en"}
Create a new folder and initialize your project:
::

```bash
pnpm init
```

::lang-block{lang="pt"}
Muitas ferramentas e projetos utilizam o arquivo `.nvmrc` para definir a versão Node do projeto. Conseguimos criar ele da seguinte forma:
::

::lang-block{lang="en"}
Many tools and projects use the `.nvmrc` file to define the Node version of the project. We can create it as follows:
::

```bash
fnm current > .nvmrc
# Or
nvm current > .nvmrc
```

::lang-block{lang="pt"}
Instale o TypeScript e os tipos do Node:
::

::lang-block{lang="en"}
Install TypeScript and Node types:
::

```bash
pnpm i -D typescript @types/node@24
```

::lang-block{lang="pt"}
Como não temos mais a necessidade de compilar o código, não é obrigatório instalar o TypeScript. No entanto, eu acredito que seja uma boa prática ter uma versão explicitamente instalada, principalmente para que o seu editor de texto utilize a versão correta.

Note que eu instalei especificamente a versão 24 do `@types/node`. Isso porque esses tipos representam os tipos da versão do Node que o projeto está rodando. Se você está utilizando outra versão do Node, não se esqueça de modificar essa versão.
::

::lang-block{lang="en"}
Since we no longer need to compile the code, installing TypeScript is not mandatory. However, I believe it's a good practice to have a version explicitly installed, mainly so your text editor uses the correct version.

Note that I specifically installed version 24 of `@types/node`. This is because these types represent the types of the Node version the project is running. If you're using a different Node version, don't forget to change this version.
::

::lang-block{lang="pt"}
## Executando arquivos TypeScript

Você já pode criar um arquivo `.ts` e executá-lo diretamente:
::

::lang-block{lang="en"}
## Running TypeScript files

You can now create a `.ts` file and run it directly:
::

```ts
// index.ts
console.log("Hello World");
```

```bash
node ./index.ts
# Hello World
```

::lang-block{lang="pt"}
## Como a execução nativa de Typescript funciona

É importante notar que a execução nativa do TypeScript pelo Node funciona substituindo a sintaxe específica de TypeScript por espaços em branco. Isso significa que algumas sintaxes do TypeScript não vão estar disponíveis.

Entre as mais importantes estão o uso de `Enum`, código de runtime dentro de `namespace` (mas namespace somente com tipos ainda pode ser utilizado) e `parameter properties`. Além disso, é necessário adicionar a keyword `type` quando você estiver importando tipos de outros arquivos.
::

::lang-block{lang="en"}
## How native TypeScript execution works

It's important to note that Node's native TypeScript execution works by replacing TypeScript-specific syntax with whitespace. This means that some TypeScript syntaxes won't be available.

Among the most important are the use of `Enum`, runtime code inside `namespace` (but namespaces with only types can still be used), and `parameter properties`. Additionally, you need to add the `type` keyword when importing types from other files.
::

```ts
// 🚫 Won't work
enum Direction {
  Up = 1,
  Down,
  Left,
  Right,
}

// 🚫 Won't work
class User {
  constructor(private name: string) {}
}

// 🚫 Won't work
namespace Project {
  export const maxSize = 5;
}

// 🚫 Won't work
// assuming Project is a type
import { Project } from "./project.ts";

// ✅ Works
namespace Project {
  export type Status = "todo" | "done";
}

// ✅ Works
import { type Project } from "./project.ts";
```

::more-info{title_pt="Por que não apagar?" title_en="Why not just delete it?"}
#pt
O Node substitui a sintaxe de TypeScript por espaços em branco ao invés de simplesmente removê-la para manter as linhas de código na mesma posição. Isso permite que os source maps funcionem corretamente. Um source map é um arquivo que mapeia o código executado de volta ao código original, permitindo que você depure seu código TypeScript diretamente no navegador ou debugger, mesmo que o código em execução seja diferente. Ao preservar as linhas, erros e breakpoints aparecem nos locais corretos do seu arquivo `.ts` original.

#en
Node replaces TypeScript syntax with whitespace instead of simply removing it to keep code lines in the same position. This allows source maps to work correctly. A source map is a file that maps the executed code back to the original code, allowing you to debug your TypeScript code directly in the browser or debugger, even if the running code is different. By preserving the lines, errors and breakpoints appear in the correct locations of your original `.ts` file.
::

::lang-block{lang="pt"}
## Configurando o Typescript

O Node roda o código TypeScript utilizando configurações específicas. Para garantir que o Language Server do TypeScript use as mesmas configurações e evitar inconsistências entre verificação estática e runtime, é importante adicionar um arquivo de configuração.

Crie um arquivo chamado `tsconfig.json` com o seguinte conteúdo:
::

::lang-block{lang="en"}
## Configuring TypeScript

Node runs TypeScript code using specific configurations. To ensure that the TypeScript Language Server uses the same configurations and avoid inconsistencies between static checking and runtime, it's important to add a configuration file.

Create a file called `tsconfig.json` with the following content:
::

```json
{
  "compilerOptions": {
    "noEmit": true,
    "target": "esnext",
    "module": "nodenext",
    "rewriteRelativeImportExtensions": true,
    "erasableSyntaxOnly": true,
    "verbatimModuleSyntax": true
  }
}
```

::lang-block{lang="pt"}
Eu acho importante chamar atenção para duas configurações importantes: `rewriteRelativeImportExtensions` e `erasableSyntaxOnly`.

A configuração `rewriteRelativeImportExtensions` permite que você importe arquivos diretamente com a extensão `.ts`. Sem ela, é necessário utilizar a extensão `.js`.

Já `erasableSyntaxOnly` adiciona alertas se você tentar utilizar syntax de Typescript não é apagável (como explicado no tópico anterior).

## Próximas etapas

Para finalizar seu projeto, eu recomendo também adicionar as seguintes opções para aproveitar ao máximo a checagem do TypeScript:
::

::lang-block{lang="en"}
I think it's important to highlight two important configurations: `rewriteRelativeImportExtensions` and `erasableSyntaxOnly`.

The `rewriteRelativeImportExtensions` configuration allows you to import files directly with the `.ts` extension. Without it, you need to use the `.js` extension.

`erasableSyntaxOnly` adds warnings if you try to use TypeScript syntax that cannot be erased (as explained in the previous topic).

## Next steps

To finalize your project, I also recommend adding the following options to make the most of TypeScript checking:
::

```json
{
  "compilerOptions": {
    "resolveJsonModule": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true

    // ...
    // previous configurations
  }
}
```

::lang-block{lang="pt"}
Agora você pode adicionar outras configurações do projeto, como linter e formatter. Depois disso, você pode criar um repositório com esse código e utilizar o [`giget`](https://github.com/unjs/giget) para criar uma cópia dele sempre que você precisar de um novo projeto.

Se você quiser, pode acessar [o meu template no meu GitHub](https://github.com/ralacerda/typescript-playground-template).
::

::lang-block{lang="en"}
Now you can add other project configurations, such as linter and formatter. After that, you can create a repository with this code and use [`giget`](https://github.com/unjs/giget) to create a copy of it whenever you need a new project.

If you want, you can access [my template on my GitHub](https://github.com/ralacerda/typescript-playground-template).
::

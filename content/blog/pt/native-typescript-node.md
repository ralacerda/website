---
title: "Rodando TypeScript Nativamente no Node"
slug: "typescript-native-node"
publishDate: 2026-01-12
draft: false
tags: ["javascript", "typescript", "node"]
description: "Como executar arquivos TypeScript sem precisar compilar"
lang: "pt"
---

Desde a versão 22.18, o Node possui suporte nativo para TypeScript, o que permite você executar arquivos `.ts` diretamente sem a necessidade de uma etapa de compilação inicial. Isso torna o desenvolvimento com TypeScript mais rápido e simples.

No entanto, existem alguns detalhes de configuração e sintaxe que precisam ser considerados.

## Gerenciando a versão do Node

Antes de tudo, é necessário estar utilizando uma versão recente do Node (22.18 ou maior). Para evitar problemas com outros projetos que rodam versões mais antigas do Node, eu recomendo utilizar um gerenciador de versões. O projeto [`nvm`](https://github.com/nvm-sh/nvm) é um dos mais populares, mas recentemente eu tenho utilizado o [`fnm`](https://github.com/Schniz/fnm) e gostado muito da experiência.

Instale uma versão recente do Node. Eu recomendo instalar a versão LTS. No momento em que escrevo esse artigo, a versão 24 é a LTS.

```sh
fnm install 24
# ou
nvm install 24
```

::more-info{title="O que é a versão LTS?"}
LTS significa "Long Term Support" (Suporte de Longo Prazo). É uma versão do Node que recebe atualizações de segurança e correções de bugs por um período prolongado (geralmente 30 meses). As versões LTS são recomendadas para projetos em produção porque oferecem estabilidade e previsibilidade, evitando mudanças significativas que podem quebrar seu código.
::

## Iniciando um novo projeto e dependências

Comece iniciando um novo projeto utilizando um gerenciador de dependências. No meu caso, eu utilizo o `pnpm`. Se você não tem ele instalado (se você está utilizando um version manager, você talvez precise instalá-lo para cada versão), você pode ativá-lo da seguinte forma:

```bash
corepack enable
```

Crie uma nova pasta e inicie seu projeto:

```bash
pnpm init
```

Muitas ferramentas e projetos utilizam o arquivo `.nvmrc` para definir a versão Node do projeto. Conseguimos criar ele da seguinte forma:

```bash
fnm current > .nvmrc
# Ou
nvm current > .nvmrc
```

Instale o TypeScript e os tipos do Node:

```bash
pnpm i -D typescript @types/node@24
```

Como não temos mais a necessidade de compilar o código, não é obrigatório instalar o TypeScript. No entanto, eu acredito que seja uma boa prática ter uma versão explicitamente instalada, principalmente para que o seu editor de texto utilize a versão correta.

Note que eu instalei especificamente a versão 24 do `@types/node`. Isso porque esses tipos representam os tipos da versão do Node que o projeto está rodando. Se você está utilizando outra versão do Node, não se esqueça de modificar essa versão.

## Executando arquivos TypeScript

Você já pode criar um arquivo `.ts` e executá-lo diretamente:

```ts
// index.ts
console.log("Hello World");
```

```bash
node ./index.ts
# Hello World
```

## Como a execução nativa de Typescript funciona

É importante notar que a execução nativa do TypeScript pelo Node funciona substituindo a sintaxe específica de TypeScript por espaços em branco. Isso significa que algumas sintaxes do TypeScript não vão estar disponíveis.

Entre as mais importantes estão o uso de `Enum`, código de runtime dentro de `namespace` (mas namespace somente com tipos ainda pode ser utilizado) e `parameter properties`. Além disso, é necessário adicionar a keyword `type` quando você estiver importando tipos de outros arquivos.

```ts
// 🚫 Não vai funcionar
enum Direction {
  Up = 1,
  Down,
  Left,
  Right,
}

// 🚫 Não vai funcionar
class User {
  constructor(private name: string) {}
}

// 🚫 Não vai funcionar
namespace Project {
  export const maxSize = 5;
}

// 🚫 Não vai funcionar
// considerando que Project é um tipo
import { Project } from "./project.ts";

// ✅ Funciona
namespace Project {
  export type Status = "todo" | "done";
}

// ✅ Funciona
import { type Project } from "./project.ts";
```

::more-info{title="Por que não apagar?"}
O Node substitui a sintaxe de TypeScript por espaços em branco ao invés de simplesmente removê-la para manter as linhas de código na mesma posição. Isso permite que os source maps funcionem corretamente. Um source map é um arquivo que mapeia o código executado de volta ao código original, permitindo que você depure seu código TypeScript diretamente no navegador ou debugger, mesmo que o código em execução seja diferente. Ao preservar as linhas, erros e breakpoints aparecem nos locais corretos do seu arquivo `.ts` original.
::

## Configurando o Typescript

O Node roda o código TypeScript utilizando configurações específicas. Para garantir que o Language Server do TypeScript use as mesmas configurações e evitar inconsistências entre verificação estática e runtime, é importante adicionar um arquivo de configuração.

Crie um arquivo chamado `tsconfig.json` com o seguinte conteúdo:

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

Eu acho importante chamar atenção para duas configurações importantes: `rewriteRelativeImportExtensions` e `erasableSyntaxOnly`.

A configuração `rewriteRelativeImportExtensions` permite que você importe arquivos diretamente com a extensão `.ts`. Sem ela, é necessário utilizar a extensão `.js`.

Já `erasableSyntaxOnly` adiciona alertas se você tentar utilizar syntax de Typescript não é apagável (como explicado no tópico anterior).

## Próximas etapas

Para finalizar seu projeto, eu recomendo também adicionar as seguintes opções para aproveitar ao máximo a checagem do TypeScript:

```json
{
  "compilerOptions": {
    "resolveJsonModule": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true

    // ...
    // configurações anteriores
  }
}
```

Agora você pode adicionar outras configurações do projeto, como linter e formatter. Depois disso, você pode criar um repositório com esse código e utilizar o [`giget`](https://github.com/unjs/giget) para criar uma cópia dele sempre que você precisar de um novo projeto.

Se você quiser, pode acessar [o meu template no meu GitHub](https://github.com/ralacerda/typescript-playground-template).

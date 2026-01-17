---
title: "Zod e Regras de Negócio"
slug: "zod-and-rules"
publishDate: 2025-01-20
draft: true
tags: ["javascript", "typescript", "zod"]
description: ""
lang: "pt"
---

Domain Driven Design é um tópico amplo, que possui várias ideias interessante. Dentre elas, existe um conceito que eu, e acredito que outros desenvolvedores, consideram o mais importante: **o código deve refletir o domínio**. Para isso, as regras de negócio e o código
devem agir da mesma forma. 

Muitos desenvolvedores já utilizam o Zod para validar dados externos, entretanto, ele também possui três features que ajudam
a alinhar o nosso código com o domínio.

::note
Se você ainda não conhece o Zod, eu escrevi um artigo explicando seu papel e uso mais comum: "Zod: Por quê? Como? Quando?"
::

## União Discriminada

União discriminadas servem para evitar estados impossíveis de serem representados.
Vamos considerar a situação de um projeto que pode estar em diferentes "status":

```ts
type Project = {
  name: string;
  status: "started" | "done";
  startedDate: Date;
  doneDate?: Date;
}
```

O problema desse tipo, é que podemos representar estados inválidos

```ts
// Projeto terminado sem a data em que foi terminado
const newProject = {
  name: "Projeto Novo";
  status: "done";
}

// Projeto iniciado com data de quando foi terminado
const oldProject = {
  name: "Projeto Antigo";
  status: "started";
  doneDate: new Date("2025-12-25T10:00:00");
}
```

Para resolver esse problemas, podemos escrever um tipo da seguinte forma:

```ts
type Project = 
  | { name: string; status: "started"; startedDate: Date; }
  | { name: string; status: "done"; startedDate: Date; doneDate: Date; }

// Ou se preferir definir um tipo para cada estado
type StartedProject = { name: string; status: "started"; startedDate: Date; }
type DoneProject = { name: string; status: "done"; startedDate: Date; doneDate: Date; }
type Project = StartedProject | DoneProject;
```

A nossa vantagem é que agora o Typescript consegue garantir que não teremos estados inválidos, e
também refletas as nossas regras de negócio:

```ts
function completeProject(project: StartedProject, doneDate: Date): DoneProject {
  return {
    ...project,
    status: "done",
    doneDate,
  };
}

const doneProject = {
  name: "Projeto Finalizado",
  status: "done",
  startedDate: new Date("2025-01-01T10:00:00"),
  doneDate: new Date("2025-12-01T10:00:00"),
}

// Aqui o Typescript avisa que o tipo está errado,
// você não pode finalizar um projeto que já está finalizado
completeProject(doneProject, new Date());

function getLastStatusDate(project: Project): Date {
  if (project.status === "started") {
    // Typescript sabe que doneDate não existe aqui
    // evitando você de acessar project.doneDate sem querer 
    return project.startedDate;
  } else {
     // Typescript sabe que doneDate existe aqui
     // Você não precisa fazer checagens extras
    return project.doneDate;
  }
}
```

No Zod, podemos representar esse mesmo conceito utilizando a função `discriminatedUnion`:

```ts
import * as z from "zod";

const StartedProject = z.object({
  name: z.string(),
  status: z.literal("started"),
  startedDate: z.date(),
});

const DoneProject = z.object({
  name: z.string(),
  status: z.literal("done"),
  startedDate: z.date(),
  doneDate: z.date(),
});

const ProjectSchema = z.discriminatedUnion("status", [
  StartedProject,
  DoneProject,
]);

const invalidProject = {
  name: "Projeto Inválido",
  status: "done",
  startedDate: new Date("2025-01-01T10:00:00"),
  // doneDate está faltando
};

const result = ProjectSchema.safeParse(invalidProject);
console.log(result.success); // false
```

Note que precisamos informar qual campo será utilizado como discriminador, no nosso caso, utilizamos o campo `status`.

::note
Você pode utilizar a função `z.union` para criar uniões simples, mas nesse caso o Zod não consegue otimizar a validação utilizando o campo discriminador.
::

## Branding

Typescript possui uma validação estrutural, ou seja, os tipos são verificados baseados em suas estruturas, e não em nomes ou origem.
Entretanto, no contexto de um domínio, valores com a mesma estrutura, tem usos e significados completamente diferentes:

```ts
type Project = {
  name: string;
  id: string;
};

type User = {
  name: string;
  id: string;
}

function deleteUser(user: User) {
  ///
}

function createProject(name: string): Project {
  ///
}

// project1 é do tipo ProjectId
const project1 = createProject("New Project");

// Typescript não vai reclamar, porque Project e User possuem
// a mesma estrutura
deleteUser(project1);
```

Branding é a uma estratégia para simular verificação nominal:

```ts
declare const __brand: unique symbol;

type Brand<B, T> = T & { [__brand]: B };

type Project = Brand<"Project", {
  name: string;
  id: string;
}>;

type User = Brand<"User", {
  name: string;
  id: string;
}>
```

::more-info{title="Explicação da sintaxe de Brand e __brand"}
```ts
declare const __brand: unique symbol;
export type Brand<B, T> = T & { [__brand]: B };
```

Essa sintaxe pode parecer estranha à primeira vista. Vamos quebrá-la em 3 partes:

**` T & { ... }`**:
   O operador `&` cria um tipo de interseção. Isso diz ao TypeScript que o resultado é tudo que `T` é, **E** mais o que estiver dentro das chaves. Em runtime (javascript), o valor continua sendo apenas `T`. 

**`[__brand]`**:
   Em JavaScript, chaves de objetos geralmente são strings, mas também podem ser Símbolos (`Symbol`). Usar colchetes `[]` nos permite definir uma propriedade onde o nome da chave é uma variável. Aqui, estamos dizendo que o objeto tem uma propriedade identificada pelo símbolo único `__brand`.
    Como `__brand` não vai ser exportado, isso significa que você não consegue acessar o valor de `__brand` em runtime.

**`unique symbol`**:
   O tipo `unique symbol` é um subtipo especial de `symbol`. Cada declaração de um `unique symbol` cria uma identidade única vinculada a uma variável específica.

Ou seja, juntamos um valor `T` com um "phantom type", um tipo que existe somente para ser utilizado na verificação de tipos,
sem uma definição runtime.
::

Agora, se tentamos utilizar um `Project` onde é esperado um `User`:

```ts

function deleteUser(user: User) {
  ///
}

function createProject(name: string): Project {
  ///
}

// project1 é do tipo ProjectId
const project1 = createProject("New Project");

deleteUser(project1); // [!code error]
// Argument of type 'Project' is not assignable to parameter of type 'User'.
//   Type 'Project' is not assignable to type '{ [__brand]: "User"; }'.
//     Types of property '[__brand]' are incompatible.
//       Type '"Project"' is not assignable to type '"User"'.
```

::note
#title
Por que não utilizar o `.brand` do Zod?

#content
Se você ainda não conhece o Zod, eu escrevi um artigo explicando seu papel e uso mais comum: "Zod: Por quê? Como? Quando?"
::

- Branding
- CODECs para criar uma camada de anti-corrupção



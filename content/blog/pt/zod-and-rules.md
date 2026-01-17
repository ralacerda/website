---
title: "Zod e Regras de Negócio"
slug: "zod-and-rules"
publishDate: 2025-17-20
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
Entretanto, para alguns casos, 

```ts
type ProjectId: string;
type UserId: string;

function deleteUser(userId: UserId) {
  ///
}

function createProject(name: string): ProjectId {
  ///
}

// project1 é do tipo ProjectId
const project1 = createProject("New Project");

// Typescript não vai reclamar, porque ProjectId e UserId possuem
// a mesma estrutura
deleteUser(project1);
```





- Branding
- CODECs para criar uma camada de anti-corrupção

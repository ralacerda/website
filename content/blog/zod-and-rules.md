---
title_pt: "Zod e Regras de Negócio"
title_en: "Zod and Business Rules"
slug: "zod-and-rules"
publishDate: 2025-01-14
draft: true
tags: ["javascript", "typescript", "zod"]
description_pt: "Como utilizar o Zod para refletir regras de domínio e evitar estados inválidos"
description_en: "How to use Zod to reflect domain rules and avoid invalid states"
---

::lang-block{lang="pt"}
Domain Driven Design é um tópico amplo, que possui várias ideias interessante. Dentre elas, existe um conceito que eu, e acredito que outros desenvolvedores, consideram o mais importante: **o código deve refletir o domínio**. Para isso, as regras de negócio e o código
devem agir da mesma forma. 

Muitos desenvolvedores já utilizam o Zod para validar dados externos, entretanto, ele também possui três features que ajudam
a alinhar o nosso código com o domínio.
::

::note
#pt
Se você ainda não conhece o Zod, eu escrevi um artigo explicando seu papel e uso mais comum: "Zod: Por quê? Como? Quando?"

#en
If you don't know Zod yet, I wrote an article explaining its role and most common use: "Zod: Why? How? When?"
::

::lang-block{lang="pt"}
## União Discriminada

União discriminadas servem para evitar estados impossíveis de serem representados.
Vamos considerar a situação de um projeto que pode estar em diferentes "status":
::

```ts
type Project = {
  name: string;
  status: "started" | "done";
  startedDate: Date;
  doneDate?: Date;
}
```

::lang-block{lang="pt"}
O problema desse tipo, é que podemos representar estados inválidos
::

```ts
// Project completed without the date it was completed
const newProject = {
  name: "New Project";
  status: "done";
}

// Project started with the date of when it was completed
const oldProject = {
  name: "Old Project";
  status: "started";
  doneDate: new Date("2025-12-25T10:00:00");
}
```

::lang-block{lang="pt"}
Para resolver esse problemas, podemos escrever um tipo da seguinte forma:
::

```ts
type Project = 
  | { name: string; status: "started"; startedDate: Date; }
  | { name: string; status: "done"; startedDate: Date; doneDate: Date; }

// Or if you prefer to define a type for each state
type StartedProject = { name: string; status: "started"; startedDate: Date; }
type DoneProject = { name: string; status: "done"; startedDate: Date; doneDate: Date; }
type Project = StartedProject | DoneProject;
```

::lang-block{lang="pt"}
A nossa vantagem é que agora o Typescript consegue garantir que não teremos estados inválidos, e
também refletas as nossas regras de negócio:
::

```ts
function completeProject(project: StartedProject, doneDate: Date): DoneProject {
  return {
    ...project,
    status: "done",
    doneDate,
  };
}

const doneProject = {
  name: "Finished Project",
  status: "done",
  startedDate: new Date("2025-01-01T10:00:00"),
  doneDate: new Date("2025-12-01T10:00:00"),
}

// Here Typescript warns that the type is wrong,
// you cannot complete a project that is already completed
completeProject(doneProject, new Date());

function getLastStatusDate(project: Project): Date {
  if (project.status === "started") {
    // Typescript knows that doneDate does not exist here
    // preventing you from accidentally accessing project.doneDate
    return project.startedDate;
  } else {
     // Typescript knows that doneDate exists here
     // You don't need to do extra checks
    return project.doneDate;
  }
}
```

::lang-block{lang="pt"}
No Zod, podemos representar esse mesmo conceito utilizando a função `discriminatedUnion`:
::

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
  name: "Invalid Project",
  status: "done",
  startedDate: new Date("2025-01-01T10:00:00"),
  // doneDate is missing
};

const result = ProjectSchema.safeParse(invalidProject);
console.log(result.success); // false
```

::lang-block{lang="pt"}
Note que precisamos informar qual campo será utilizado como discriminador, no nosso caso, utilizamos o campo `status`.
::

::note
#pt
Você pode utilizar a função `z.union` para criar uniões simples, mas nesse caso o Zod não consegue otimizar a validação utilizando o campo discriminador.

#en
You can use the `z.union` function to create simple unions, but in this case Zod cannot optimize the validation using the discriminator field.
::

::lang-block{lang="pt"}
## Branding

Typescript possui uma validação estrutural, ou seja, os tipos são verificados baseados em suas estruturas, e não em nomes ou origem.
Entretanto, no contexto de um domínio, valores com a mesma estrutura, tem usos e significados completamente diferentes:
::

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

// project1 is of type Project
const project1 = createProject("New Project");

// Typescript won't complain because Project and User have
// the same structure
deleteUser(project1);
```

::lang-block{lang="pt"}
Branding é a uma estratégia para simular verificação nominal:
::

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

::more-info{title_pt="Explicação da sintaxe de Brand e __brand" title_en="Explanation of Brand and __brand syntax"}
#pt
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

#en
```ts
declare const __brand: unique symbol;
export type Brand<B, T> = T & { [__brand]: B };
```

This syntax might look strange at first. Let's break it down into 3 parts:

**` T & { ... }`**:
   The `&` operator creates an intersection type. This tells TypeScript that the result is everything `T` is, **AND** whatever is inside the curly braces. At runtime (JavaScript), the value remains just `T`.

**`[__brand]`**:
   In JavaScript, object keys are usually strings, but they can also be Symbols. Using brackets `[]` allows us to define a property where the key name is a variable. Here, we are saying the object has a property identified by the unique symbol `__brand`.
   Since `__brand` is not exported, it means you cannot access its value at runtime.

**`unique symbol`**:
   The `unique symbol` type is a special subtype of `symbol`. Each declaration of a `unique symbol` creates a unique identity tied to a specific variable.

In other words, we combine a value `T` with a "phantom type" — a type that exists only for type checking, without a runtime definition.
::

::lang-block{lang="pt"}
Agora, se tentamos utilizar um `Project` onde é esperado um `User`:
::

```ts
function deleteUser(user: User) {
  ///
}

function createProject(name: string): Project {
  ///
}

// project1 is of type Project
const project1 = createProject("New Project");

deleteUser(project1); // [!code error]
// Argument of type 'Project' is not assignable to parameter of type 'User'.
//   Type 'Project' is not assignable to type '{ [__brand]: "User"; }'.
//     Types of property '[__brand]' are incompatible.
//       Type '"Project"' is not assignable to type '"User"'.
```

::note{title_pt="Por que não utilizar o .brand do Zod?" title_en="Why not use Zod's .brand?"}
#pt
O `.brand` do Zod cria um tipo que é ligeiramente diferente do padrão de Branding manual apresentado acima. Embora seja muito prático, o Branding manual com `unique symbol` oferece um controle mais preciso e evita dependência direta do Zod em todos os lugares onde o tipo é utilizado.

#en
Zod's `.brand` creates a type that is slightly different from the manual Branding pattern shown above. While very practical, manual Branding with `unique symbol` offers more precise control and avoids direct dependency on Zod everywhere the type is used.
::

::lang-block{lang="pt"}
- Branding
- CODECs para criar uma camada de anti-corrupção
::

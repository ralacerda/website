---
title_en: "How Typescript Checks Your Types"
title_pt: "Como o Typescript verifica seus tipos"
slug: "typescript-checking"
publishDate: 2025-11-17
draft: false
tags: ["javascript", "typescript", "types"]
description_en: "Understanding the difference between nominal and structural typing"
description_pt: "Entendendo a diferença entre tipagem nominal e estrutural"
---

::lang-block{lang="en"}
One of the most important aspects of Typescript is type checking. However, there are two different ways to verify if a type is correct: nominal typing and structural typing. Understanding each of them is fundamental to avoid some Typescript pitfalls and make the most of its type system.

Nominal typing is based on identity and explicit type declaration. In it, two types are considered compatible only if they have the same name or are part of the same inheritance hierarchy. Structural typing, on the other hand, focuses on structure or shape, regardless of name or inheritance.
::

::lang-block{lang="pt"}
Um dos aspectos mais importantes do Typescript é a verificação dos tipos. Entretanto, existem duas formas diferentes de verificar se um tipo está correto: a tipagem nominal e tipagem estrutural. Entender cada uma delas é fundamental para evitar algumas armadilhas de Typescript e tirar o máximo de proveito do seu sistema de tipos.

A tipagem nominal baseia-se na identidade e na declaração explícita do tipo. Nela, dois tipos são considerados compatíveis apenas se tiverem o mesmo nome ou fizerem parte da mesma hierarquia de herança. Já a tipagem estrutural foca na estrutura ou formato, independente de seu nome ou herença.
::

## ::lang-block{lang="en"}Structural typing with primitives:: ::lang-block{lang="pt"}Tipagem estrutural em primitivos::

::lang-block{lang="en"}
Let's consider the following example:
::

::lang-block{lang="pt"}
Vamos considerar o seguinte exemplo:
::

```ts
type UserId = string

function notifyUser(user: UserId, message: string): void {
 // ...
}

notifyUser("1dxDf", "Your project is ready");
```

::lang-block{lang="en"}
During nominal checking, our call would be wrong, after all, even though `UserId` is a type of `string`, what the function expects is specifically a `UserId`. However, Typescript works exclusively with structural typing, meaning for Typescript, this call is completely valid.

And even if you try to indicate that something is of another "type", Typescript will still only check the structure:
::

::lang-block{lang="pt"}
Durante verificação nominal, nossa chamada estaria errada, afinal, mesmo que `UserID` seja um tipo de `string`, o que a função espera é especificamente um `UserId`. Entretanto, o Typescript trabalha exclusivamente com tipagem estrutural, ou seja, para o Typescript, essa chamada é completamente válida.

E mesmo se você tentar indicar que algo é de outro "tipo", o Typescript ainda vai verificar somente a estrutura:
::

```ts
type ProjectId = string;
const id: ProjectId = "uRg-1";

notifyUser(id, "Your project is ready")
```

::lang-block{lang="en"}
Again, since Typescript only checks the structure, and `ProjectId` is also a `string`, it's accepted.
::

::lang-block{lang="pt"}
Novamente, como o Typescript verifica somente a estrutura, e `ProjectId` também é um `string`, ele é aceito.
::

## ::lang-block{lang="en"}Structural typing with objects and classes:: ::lang-block{lang="pt"}Tipagem estrutural em objetos e classes::

::lang-block{lang="en"}
You might think this only happens with primitives, but the principle is the same with objects, even when they represent completely different concepts:
::

::lang-block{lang="pt"}
Você pode achar que isso somente acontece com primitivos, mas o princípio é o mesmo com objetos, mesmo quando eles representam conceitos completamente diferentes:
::

```ts
type User = {
  name: string;
  id: string;
  createdAt: Date;
}

type Project = {
  name: string;
  id: string;
}

function saveProject(project: Project) {
 // ...
}

const user: User = {
  name: "Renato",
  id: "3mc3k1m",
  createdAt: new Date(),
}

saveProject(user)
```

::lang-block{lang="en"}
Typescript also doesn't care about the fact that `User` has more properties than `Project`. Since `User` structurally satisfies the requirements of `Project`, it can be used without any issues.

And in fact, not even with classes can you avoid this problem:
::

::lang-block{lang="pt"}
O TypeScript também não se importa com o fato de `User` ter mais propriedades do que `Project`. Como `User` estruturalmente satisfaz os requisitos de `Project`, ele pode ser usado tranquilamente.

E de fato, nem com classes você consegue evitar esse problema:
::

```ts
class Project {
  name: string;
  id: string;

  constructor(name: string, id: string) {
    if (!id.startsWith('proj-')) {
      throw new Error('Invalid project ID! Must start with "proj-"');
    }
    this.id = id;
    this.name = name;
  }
}

saveProject({name: "New project", id: "New project"})
```

::lang-block{lang="en"}
After all, a class instance is just a regular object, and Typescript only checks the structure of that object, completely ignoring how it was constructed or what validations it went through.
::

::lang-block{lang="pt"}
Afinal, uma instância de classe é só um objeto comum, e o Typescript verifica apenas a estrutura desse objeto, ignorando completamente como ele foi construído ou por quais validações ele passou.
::

## ::lang-block{lang="en"}The advantages of structural typing:: ::lang-block{lang="pt"}As vantagens da tipagem estrutural::

::lang-block{lang="en"}
However, structural typing also has its advantages, for example, it's easier to work with composition:
::

::lang-block{lang="pt"}
Entretanto, a tipagem estrutural também tem suas vantagens, por exemplo, é mais fácil trabalhar com composição:
::

```ts
interface User {
  id: string;
  email: string;
}

interface Author {
  name: string;
  bio: string;
}

interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
}

function sendEmail(user: User) {
  console.log(`Sending email to ${user.email}`);
}

function displayAuthorCard(author: Author) {
  console.log(`${author.name}: ${author.bio}`);
}

function trackActivity(entity: Timestamped) {
  console.log(`Created at: ${entity.createdAt}`);
}

const blogAuthor = {
  id: "user-123",
  email: "renato@example.com",
  name: "Renato",
  bio: "Typescript Developer",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-11-14")
};

sendEmail(blogAuthor);
displayAuthorCard(blogAuthor);
trackActivity(blogAuthor);
```

::lang-block{lang="en"}
It's not necessary to define a hierarchy relationship between types.

This also allows you to use interfaces and types to organize your code, without requiring stricter usage.
::

::lang-block{lang="pt"}
Não é necessário definir uma relação de hierarquia entre os tipos.

Isso também permite que você utilize interfaces e tipos para organizar seu código, sem exigir um uso mais estrito.
::

```ts
interface Position {
  x: number;
  y: number;
};

function getObjectAtPosition(position: Position) {
  // ...
};

// No need to create a Position instance
getObjectAtPosition({ x: 45, y: 30});
```

::lang-block{lang="en"}
It also makes it easier to create mocks and other interface implementations.
::

::lang-block{lang="pt"}
Também facilita a criação de mocks e outras implementações de interfaces.
::

```ts
interface UserRepository {
  findById(id: string): Promise<User>;
  save(user: User): Promise<void>;
}

const mockRepo = {
  findById: async (id: string) => ({ id, name: "Test User" }),
  save: async (user: User) => {}
};

function someFunction(repo: UserRepository) {
  // ...
}

someFunction(mockRepo);
```

## ::lang-block{lang="en"}Simulating nominal typing:: ::lang-block{lang="pt"}Simulando tipagem nominal::

::lang-block{lang="en"}
However, you might want nominal typing, especially when dealing with primitives. To do this, you can simulate nominal typing, for example using a "wrapper" object storing your value and the name of your type, usually using a `_tag` or `_type` property. There's nothing special about the name of these properties, but they follow the conventions that variables starting with `_` are "private" and shouldn't be accessed or changed directly.
::

::lang-block{lang="pt"}
Entretanto, você pode precisar de uma tipagem nominal, principalmente quando você está lidando com primitivos. Para isso, você precisa simular uma tipagem nomimal, por exemplo utilizando um objeto "wrapper" guardando seu valor e o nome do seu tipo, geralmente em uma propriedade `_tag` ou `_type`. Não existe nada especial sobre o nome dessas propriedades, mas elas seguem as convenções que variáveis que começam com `_` são "privadas" e não devem ser acessadas diretamente.
::

```ts
type UserId = {
  value: string;
  _tag: "UserId"
}

type ProjectId = {
  value: string;
  _tag: "ProjectId"
}

function getUserEmail(userId: UserId) {
  const id = userId.value
  // ...
}

const projectId: ProjectId = {
  value: "proj-123",
  _tag: "ProjectId"
}

getUserEmail(projectId)
            //^ Argument of type 'ProjectId' is not assignable to parameter of type 'UserId'.
```

::lang-block{lang="en"}
This technique works because now each type has a different structure, forcing Typescript to differentiate them. However, this creates a small overhead because we're working with an object, and it can increase project complexity.

There are other more advanced techniques for simulating nominal typing like "branding" or "opaque types", which allow you to add this distinction without the overhead of creating additional objects. However, since it's a more complex topic, it deserves its own article.
::

::lang-block{lang="pt"}
Essa técnica funciona porque agora cada tipo tem uma estrutura diferente, forçando o Typescript a diferenciá-los. Entretanto, isso gera um pequeno overhead por estarmos trabalhando com um objeto, e acaba aumentando a complexidade do projeto.

Existem outras técnicas mais avançadas para simular tipagem nominal como "branding" ou "tipos opacos", que permitem adicionar essa distinção sem o overhead de criar objetos adicionais. Entretanto, por ser um tópico de maior complexidade, ele merece um artigo próprio.
::

## ::lang-block{lang="en"}Conclusion:: ::lang-block{lang="pt"}Conclusão::

::lang-block{lang="en"}
Typescript's structural typing has its advantages and disadvantages. On one hand, it facilitates code composition, allows you to create flexible abstractions, and simplifies working with interfaces. On the other hand, it can let errors slip through that would be caught in languages with nominal typing, especially when different types have the same structure. The most important thing is to understand how Typescript works so you can leverage its advantages and avoid its pitfalls.
::

::lang-block{lang="pt"}
A tipagem estrutural do Typescript tem suas vantagens e desvantagens. Por um lado, ela facilita a composição de código, permite criar abstrações flexíveis e simplifica o trabalho com interfaces. Por outro lado, ela pode deixar passar erros que seriam capturados em linguagens com tipagem nominal, especialmente quando tipos diferentes têm a mesma estrutura. O mais importante é entender como o Typescript funciona para poder aproveitar suas vantagens e evitar suas armadilhas.
::

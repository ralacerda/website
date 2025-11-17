---
title: "Como o Typescript verifica seus tipos"
slug: "typescript-checking"
publishDate: 2025-11-17
draft: false
tags: ["javascript", "typescript", "types"]
description: "Entendendo a diferença entre tipagem nominal e estrutural"
lang: "pt"
---

Um dos aspectos mais importantes do Typescript é a verificação dos tipos. Entretanto, existem duas formas diferentes de verificar se um tipo está correto: a tipagem nominal e tipagem estrutural. Entender cada uma delas é fundamental para evitar algumas armadilhas de Typescript e tirar o máximo de proveito do seu sistema de tipos.

A tipagem nominal baseia-se na identidade e na declaração explícita do tipo. Nela, dois tipos são considerados compatíveis apenas se tiverem o mesmo nome ou fizerem parte da mesma hierarquia de herança. Já a tipagem estrutural foca na estrutura ou formato, independente de seu nome ou herença.

## Tipagem estrutural em primitivos

Vamos considerar o seguinte exemplo:

```typescript
type UserId = string

function notifyUser(user: UserId, message: string): void {
 // ...
}

notifyUser("1dxDf", "Seu projeto está pronto");
```

Durante verificação nominal, nossa chamada estaria errada, afinal, mesmo que `UserID` seja um tipo de `string`, o que a função espera é especificamente um `UserId`. Entretanto, o Typescript trabalha exclusivamente com tipagem estrutural, ou seja, para o Typescript, essa chamada é completamente válida.

E mesmo se você tentar indicar que algo é de outro "tipo", o Typescript ainda vai verificar somente a estrutura:

```typescript
type ProjectId = string;
const id: ProjectId = "uRg-1";

notifyUser(id, "Seu projeto está pronto")
```

Novamente, como o Typescript verifica somente a estrutura, e `ProjectId` também é um `string`, ele é aceito.

## Tipagem estrutural em objetos e classes

Você pode achar que isso somente acontece com primitivos, mas o princípio é mesmo com objetos, mesmo quando eles representam conceitos completamente diferentes:

```typescript
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

O TypeScript também não se importa com o fato de `User` ter mais propriedades do que `Project`. Como `User` estruturalmente satisfaz os requisitos de `Project`, ele pode ser usado tranquilamente.

E de fato, nem com classes você consegue evitar esse problema:

```typescript
class Project {
  name: string;
  id: string;

  constructor(name: string, id: string) {
    if (!id.startsWith('proj-')) {
      throw new Error('ID de projeto inválido! Deve começar com "proj-"');
    }
    this.id = id;
    this.name = name;
  }
}

saveProject({name: "Novo projeto", id: "Novo projeto"})
```

Afinal, uma instância de classe é só um objeto comum, e o Typescript verifica apenas a estrutura desse objeto, ignorando completamente como ele foi construído ou por quais validações ele passou.

## As vantagens da tipagem estrutural

Entretanto, a tipagem estrutural também tem suas vantagens, por exemplo, é mais fácil trabalhar 
com composição:

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
  console.log(`Enviando email para ${user.email}`);
}

function displayAuthorCard(author: Author) {
  console.log(`${author.name}: ${author.bio}`);
}

function trackActivity(entity: Timestamped) {
  console.log(`Criado em: ${entity.createdAt}`);
}

const blogAuthor = {
  id: "user-123",
  email: "renato@example.com",
  name: "Renato",
  bio: "Desenvolvedor TypeScript",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-11-14")
};

sendEmail(blogAuthor);
displayAuthorCard(blogAuthor);
trackActivity(blogAuthor);
```

Não é necessário definir uma relação de hierarquia entre os tipos. 

Isso também permite que você utilize interfaces e tipos para organizar seu código, sem
exigir um uso mais estrito.

```typescript
interface Position {
  x: number;
  y: number;
};

function getObjectAtPosition(position: Position) {
  // ...
};

// Não é necessário criar uma instância de Position
getObjectAtPosition({ x: 45, y: 30});
```

Também facilita a criação de mocks e outras implementações de interfaces.

```typescript
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

## Simulando tipagem nominal

Entretanto, você pode precisar de uma tipagem nominal, principalmente quando você está lidando com primitivos.
Para isso, você precisa simular uma tipagem nomimal, por exemplo utilizando
um objeto "wrapper" guardando seu valor e o nome do seu tipo, geralmente em uma propriedade `_tag` ou `_type`.
Não existe nada especial sobre o nome dessas propriedades, mas elas seguem as convenções que variáveis
que começam com `_` são "privadas" e não devem ser acessadas diretamente.

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

Essa técnica funciona porque agora cada tipo tem uma estrutura diferente, forçando o Typescript a diferenciá-los. Entretanto, isso
gera um pequeno overhead por estarmos trabalhando com um objeto, e acaba aumentando a complexidade do projeto. 

Existem outras técnicas mais avançadas para simular tipagem nominal como "branding" ou "tipos opacos", que permitem adicionar essa distinção sem o overhead de criar objetos adicionais. Entretanto, por ser um tópico de maior complexidade, ele merece um artigo próprio.

## Conclusão

A tipagem estrutural do Typescript tem suas vantagens e desvantagens. Por um lado, ela facilita a composição de código, permite criar abstrações flexíveis e simplifica o trabalho com interfaces. Por outro lado, ela pode deixar passar erros que seriam capturados em linguagens com tipagem nominal, especialmente quando tipos diferentes têm a mesma estrutura. O mais importante é entender como o Typescript funciona para poder aproveitar suas vantagens e evitar suas armadilhas.
---
title: "How Typescript Checks Your Types"
slug: "Typescript-checking"
publishDate: 2025-11-17
draft: false
tags: ["javascript", "Typescript", "types"]
description: "Understanding the difference between nominal and structural typing"
lang: "en"
---

One of the most important aspects of Typescript is type checking. However, there are two different ways to verify if a type is correct: nominal typing and structural typing. Understanding each of them is fundamental to avoid some Typescript pitfalls and make the most of its type system.

Nominal typing is based on identity and explicit type declaration. In it, two types are considered compatible only if they have the same name or are part of the same inheritance hierarchy. Structural typing, on the other hand, focuses on structure or shape, regardless of name or inheritance.

## Structural typing with primitives

Let's consider the following example:

```Typescript
type UserId = string

function notifyUser(user: UserId, message: string): void {
 // ...
}

notifyUser("1dxDf", "Your project is ready");
```

During nominal checking, our call would be wrong, after all, even though `UserId` is a type of `string`, what the function expects is specifically a `UserId`. However, Typescript works exclusively with structural typing, meaning for Typescript, this call is completely valid.

And even if you try to indicate that something is of another "type", Typescript will still only check the structure:

```Typescript
type ProjectId = string;
const id: ProjectId = "uRg-1";

notifyUser(id, "Your project is ready")
```

Again, since Typescript only checks the structure, and `ProjectId` is also a `string`, it's accepted.

## Structural typing with objects and classes

You might think this only happens with primitives, but the principle is the same with objects, even when they represent completely different concepts:

```Typescript
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

Typescript also doesn't care about the fact that `User` has more properties than `Project`. Since `User` structurally satisfies the requirements of `Project`, it can be used without any issues.

And in fact, not even with classes can you avoid this problem:

```Typescript
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

After all, a class instance is just a regular object, and Typescript only checks the structure of that object, completely ignoring how it was constructed or what validations it went through.

## The advantages of structural typing

However, structural typing also has its advantages, for example, it's easier to work
with composition:

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

It's not necessary to define a hierarchy relationship between types.

This also allows you to use interfaces and types to organize your code, without
requiring stricter usage.

```Typescript
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

It also makes it easier to create mocks and other interface implementations.

```Typescript
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

## Simulating nominal typing

However, you might want nominal typing, especially when dealing with primitives.
To do this, you can simulate nominal typing, for example using
a "wrapper" object storing your value and the name of your type, usually using a `_tag` or `_type` property.
There's nothing special about the name of these properties, but they follow the conventions that variables
starting with `_` are "private" and shouldn't be accessed or changed directly.

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

This technique works because now each type has a different structure, forcing Typescript to differentiate them. However, this
creates a small overhead because we're working with an object, and it can increase project complexity.

There are other more advanced techniques for simulating nominal typing like "branding" or "opaque types", which allow you to add this distinction without the overhead of creating additional objects. However, since it's a more complex topic, it deserves its own article.

## Conclusion

Typescript's structural typing has its advantages and disadvantages. On one hand, it facilitates code composition, allows you to create flexible abstractions, and simplifies working with interfaces. On the other hand, it can let errors slip through that would be caught in languages with nominal typing, especially when different types have the same structure. The most important thing is to understand how Typescript works so you can leverage its advantages and avoid its pitfalls.

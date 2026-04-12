---
title: "Zod: Why? How? When?"
slug: "zod-why-how-when"
publishDate: 2025-12-17
draft: false
tags: ["javascript", "typescript", "zod"]
description: "How to create robust schemas and types"
lang: "en"
---

Something that can confuse developers who are starting with TypeScript/JavaScript is type checking: types are checked **only** during TypeScript compilation.

```ts
type Post = {
  userId: number,
  id: number,
  title: string,
  body: string,
}

async function getPost(id: number): Promise<Post> {
  const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`);
  const json = await response.json();

  return json as Post;
}

const post = await getPost(1);

// If the API returns "postTitle" instead of "title"
const title = post.title // undefined
// For TypeScript, title is still `string`, because we said it would be.
```

There is a difference between type checking and runtime validation.
Whenever you are working with data you do not control, but expect in a specific shape,
it is important to parse all that data to avoid runtime errors, or at least define behavior when
actual input does not match the expected format.

::more-info{title="Parsing vs Validation"}
There is a subtle difference between these terms. Validation means using a function that checks whether data is valid. Parsing means using a function that validates **and transforms** data into the expected format, checking for possible errors.
::

Zod is a parsing library. Its biggest advantages are flexibility, transformation APIs, and TypeScript integration.
The idea is to define schemas using functions and extract TypeScript definitions from them, centralizing all information
in one place.

::note
In this article, we use Zod v4.
The API may differ from previous versions, but concepts are the same.
For more information, check the [project documentation](https://zod.dev/v4/changelog).
::

```ts
import * as z from "zod";

const Post = z.object({
  userId: z.number(),
  id: z.number(),
  title: z.string(),
  body: z.string(),
});

type Post = z.infer<typeof Post>;

async function getPost(id: number): Promise<Post> {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/posts/${id}`,
  );
  const json = await response.json();
  const post = Post.parse(json);
  return post;
}

const post = await getPost(1);

// Safe to access
post.title
```

::more-info{title="type Post vs const Post"}
You might have noticed that we have a type called `Post` and a constant called `Post`. That is valid because types are erased after compilation to JavaScript. Based on syntax, TypeScript knows whether you are referring to the type or the constant.

If you find that confusing, a common alternative is always using the `Schema` suffix.
::

And what happens if input shape is not what we expect?

```ts
const wrongPost = {
  userId: "not-a-number",
  id: 1,
  body: "This is a test post.",
};

Post.parse(wrongPost);
```

You end up with an error like:

```
ZodError: [
  {
    "expected": "number",
    "code": "invalid_type",
    "path": [
      "userId"
    ],
    "message": "Invalid input: expected number, received string"
  },
  {
    "expected": "string",
    "code": "invalid_type",
    "path": [
      "title"
    ],
    "message": "Invalid input: expected string, received undefined"
  }
]
```

Notice how the error contains complete information and accumulated issues, instead of stopping at the first one.

I personally do not love the `try/catch` style, so I prefer `safeParse`, which returns a [discriminated union](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions) indicating success + parsed value, or failure + errors:

```ts
if (result.success) {
  // Since `success` is true, `data` is guaranteed
  console.log(result.data.title);
} else {
  // Validation failed
  console.error("Validation failed:", result.error);
}
```

Zod provides helpers to improve errors. One of the most useful is `prettifyError()`:

```ts
// Continuing from the previous example
console.error(prettifyError(result.error));

// Output:
// ✖ Invalid input: expected number, received string
//  → at userId
// ✖ Invalid input: expected string, received undefined
//  → at title
```

Zod includes functions not only for primitives, but also for validating and transforming many input types.
It is worth exploring the [documentation](https://zod.dev/api). Some relevant examples:

```ts
import * as z from "zod";

// Object
const User = z.object({
  // Converts any input to number
  // (`true` -> 1, `false` -> 0)
  id: z.coerce.number(),
  // String length validation
  name: z.string().min(2).max(100),
  // Transform to lowercase + trim
  // Don't confuse with lowercase(), which only validates
  displayName: z.string().trim().toLowerCase(),
  // Email format
  email: z.email(),
  // ISO 8601 datetime -> Date object
  createdAt: z.iso.datetime().transform((value) => new Date(value)),
  // Positive number
  age: z.number().positive(),
  // Optional with default
  isActive: z.boolean().default(true),
  // One of two string values
  role: z.enum(["admin", "user"]),
  // Custom validation
  password: z
    .string()
    .min(8)
    .refine((value) => /[A-Z]/.test(value), {
      message: "Password must contain at least one uppercase letter",
    }),
  // Custom transformation
  team: z.enum(["red", "blue", "team red", "team blue"]).transform((value) => {
    if (value === "team red") return "red";
    if (value === "team blue") return "blue";
    return value;
  }),
});

// Array of objects
const Users = z.array(User);

type Users = z.infer<typeof Users>;

// Zod generated this Users definition:
// type Users = {
//     id: number;
//     name: string;
//     displayName: string;
//     email: string;
//     createdAt: Date;
//     age: number;
//     isActive: boolean;
//     role: "admin" | "user";
//     password: string;
//     team: "red" | "blue";
// }[]

const result = Users.parse([
  {
    id: "123",
    name: "Alice",
    displayName: " Alice ",
    email: "alice@test.com",
    createdAt: "2023-10-01T12:00:00Z",
    age: 30,
    role: "admin",
    password: "Password1",
    team: "team red",
    userRole: "admin", // Extra field, ignored by default
  },
]);

console.log(result);

// Expected output:
// [
//   {
//     id: 123,
//     name: 'Alice',
//     displayName: 'alice',
//     email: 'alice@test.com',
//     createdAt: 2023-10-01T12:00:00.000Z,
//     age: 30,
//     isActive: true,
//     role: 'admin',
//     password: 'Password1',
//     team: 'red'
//   }
// ]
```

::more-info{title="Extra Keys"}
In this example, Zod removed `userRole`, which is not part of the schema. That is default behavior for `z.object`.

If you need validation to fail on extra properties, use `z.strictObject`.
If you want to preserve them, use `z.looseObject`.
::

And since we are using TypeScript, we can compose schemas:

```ts
import * as z from "zod";

// Reusable schema
const DatabaseDates = z.object({
  created_at: z.date(),
  updated_at: z.date(),
});

const UserSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string().min(1).max(100),
  // `.shape` returns inner object schema
  ...DatabaseDates.shape,
});

// Or use .extend()
const UserSchemaExtended = z
  .object({
    id: z.uuid(),
    email: z.email(),
    name: z.string().min(1).max(100),
  })
  .extend(DatabaseDates.shape);

// You can also build schema factories
function createTeamsSchema(names: string[]) {
  return z.object({
    id: z.uuid(),
    name: z.enum(names),
    ...DatabaseDates.shape,
  });
}

const ColorTeams = createTeamsSchema(["Red Team", "Blue Team", "Green Team"]);
```

Zod lets us build complex validation and transformation flows, extract types, and centralize everything in a single component. Beyond built-in helpers, we can define custom rules and transformations. One of its best advantages is clear error messages showing expected vs received values.

In this article I focused on the most common use case: validating input. But you can also use Zod to build an [Anti-Corruption Layer](https://learn.microsoft.com/en-us/azure/architecture/patterns/anti-corruption-layer) between services and databases, and in more critical contexts, even validate business rules themselves.

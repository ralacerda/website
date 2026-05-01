---
title_en: "Zod: Why? How? When?"
title_pt: "Zod: Por quê? Como? Quando?"
slug: "zod-why-how-when"
publishDate: 2025-12-17
draft: false
tags: ["javascript", "typescript", "zod"]
description_en: "How to create robust schemas and types"
description_pt: "Como criar schemas e tipos robustos"
---

::lang-block{lang="en"}
Something that can confuse developers who are starting with TypeScript/JavaScript is type checking: types are checked **only** during TypeScript compilation.
::

::lang-block{lang="pt"}
Algo que pode confundir desenvolvedores que estão começando a estudar Typescript/Javascript é a verificação de tipos: eles são verificados **somente** durante a compilação de Typescript para Javascript:
::

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

// If the API returns "postTitle" instead of "title":
const title = post.title // undefined
// For TypeScript, title is still `string`, because we said it would be.
```

::lang-block{lang="en"}
There is a difference between type checking and runtime validation. Whenever you are working with data you do not control, but expect in a specific shape, it is important to parse all that data to avoid runtime errors, or at least define behavior when actual input does not match the expected format.
::

::lang-block{lang="pt"}
Existe uma diferença entre verificação de tipos e verificação em runtime. Sempre que você está trabalhando com dados que você não controla, mas que você espera um formato específico, é importante você parsear todos esse dados, para evitar possíveis erros, ou permitir que você defina o comportamento quando o formato esperado não bate com o formato que você recebeu.
::

::more-info{title_en="Parsing vs Validation" title_pt="Parsing vs Validação"}
#en
There is a subtle difference between these terms. Validation means using a function that checks whether data is valid. Parsing means using a function that validates **and transforms** data into the expected format, checking for possible errors.

#pt
Existe uma diferença sútil entre esses dois termos. Validar significa utilizar uma função que verifica se os dados são válidos. Parsear significa utilizar uma função que valida E transforma os dados no formato esperado, verificando possíveis erros.
::

::lang-block{lang="en"}
Zod is a parsing library. Its biggest advantages are flexibility, transformation APIs, and TypeScript integration. The idea is to define schemas using functions and extract TypeScript definitions from them, centralizing all information in one place.
::

::lang-block{lang="pt"}
O Zod é uma biblioteca de parsing, que a maior vantagem é sua flexibilidade, API de transformação e integração com Typescript. A ideia é você definir "schemas", utilizando funções, com a possibilidade de extrair definições de Typescript, centralizando todas informações em um só lugar.
::

::note
#en
In this article, we use Zod v4. The API may differ from previous versions, but concepts are the same. For more information, check the [project documentation](https://zod.dev/v4/changelog).

#pt
Nesse artigo, iremos utilizar a versão 4 do Zod. A API pode ser diferente, mas os conceitos permanecem os mesmos. Para mais informações, acesse a [documentação do projeto.](https://zod.dev/v4/changelog)
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

::more-info{title_en="type Post vs const Post" title_pt="type Post vs const Post"}
#en
You might have noticed that we have a type called `Post` and a constant called `Post`. That is valid because types are erased after compilation to JavaScript. Based on syntax, TypeScript knows whether you are referring to the type or the constant.

If you find that confusing, a common alternative is always using the `Schema` suffix.

#pt
Você pode ter notado que temos um tipo chamado `Post` e uma constante chamado `Post`. Isso é valido pois o tipo é apagado do código depois da compilação para Javascript. Baseado na syntax, o Typescript sabe se você está utilizando o tipo ou a constante.

Caso você acha isso confuso, uma alternativa é utilizar sempre o sufixo `Schema`, para diferenciar melhor os dois.
::


::lang-block{lang="en"}
And what happens if input shape is not what we expect?
::

::lang-block{lang="pt"}
E o que acontece se o formato não é o esperado?
::

```ts
const wrongPost = {
  userId: "not-a-number",
  id: 1,
  body: "This is a test post.",
};

Post.parse(wrongPost);
```

::lang-block{lang="en"}
You end up with an error like:
::

::lang-block{lang="pt"}
Nós vamos acabar com o seguinte erro:
::

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

::lang-block{lang="en"}
Notice how the error contains complete information and accumulated issues, instead of stopping at the first one.

I personally do not love the `try/catch` style, so I prefer `safeParse`, which returns a [discriminated union](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions) indicating success + parsed value, or failure + errors:
::

::lang-block{lang="pt"}
Note que o nosso erro contem todas as informações e os erros acumuladas, ao invés de incluir somente o primeiro erro encontrado.

Eu particularmente não gosto do padrão de `try/catch`, por isso prefiro utilizar o `safeParse` que retorna uma "[união discriminada](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions)", indicando o resultado do parsing, o valor parseado ou os erros:
::

```ts
if (result.success) {
  // Since `success` is true, `data` is guaranteed
  console.log(result.data.title);
} else {
  // Validation failed
  console.error("Validation failed:", result.error);
}
```

::lang-block{lang="en"}
Zod provides helpers to improve errors. One of the most useful is `prettifyError()`:
::

::lang-block{lang="pt"}
O Zed fornece algumas funções para modificar esse erro. A mais útil é a `prettifyError()`, que deixa um pouco mais fácil de entender o erro:
::

```ts
// Continuing from the previous example
console.error(prettifyError(result.error));

// Output:
// ✖ Invalid input: expected number, received string
//  → at userId
// ✖ Invalid input: expected string, received undefined
//  → at title
```

::lang-block{lang="en"}
Zod includes functions not only for primitives, but also for validating and transforming many input types. It is worth exploring the [documentation](https://zod.dev/api). Some relevant examples:
::

::lang-block{lang="pt"}
O Zod não tem funções somente para primitivos, como também funções para validar e transformar vários tipos de input. Vale a pena dar uma lida na [documentação](https://zod.dev/api) para você ter uma ideia das possibilidades. Alguns exemplos mais relevantes:
::

```ts
import * as z from "zod";

// Object
const User = z.object({
  // Converts any input to number (`true` -> 1, `false` -> 0)
  id: z.coerce.number(),
  // String length validation
  name: z.string().min(2).max(100),
  // Transform to lowercase + trim. Don't confuse with lowercase(), which only validates
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

// Example usage
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

::more-info{title_en="Extra Keys" title_pt="Extra Keys"}
#en
In this example, Zod removed `userRole`, which is not part of the schema. That is default behavior for `z.object`.

If you need validation to fail on extra properties, use `z.strictObject`. If you want to preserve them, use `z.looseObject`.

#pt
Note que no nosso exemplo, o Zod removeu a propriedade `userRole`, que não estava definido no schema. Esse é o comportamento padrão para `z.object`

Se você precisa que a validação falha quando encontrar uma propriedade extra, você pode utilizar `z.strictObject`. Se você deseja manter esses valores, você pode utilizar `z.looseObject`
::

::lang-block{lang="en"}
And since we are using TypeScript, we can compose schemas:
::

::lang-block{lang="pt"}
E como estamos utilizando Typescript, também é possível fazer composições:
::

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

::lang-block{lang="en"}
Zod lets us build complex validation and transformation flows, extract types, and centralize everything in a single component. Beyond built-in helpers, we can define custom rules and transformations. One of its best advantages is clear error messages showing expected vs received values.

In this article I focused on the most common use case: validating input. But you can also use Zod to build an [Anti-Corruption Layer](https://learn.microsoft.com/en-us/azure/architecture/patterns/anti-corruption-layer) between services and databases, and in more critical contexts, even validate business rules themselves.
::

::lang-block{lang="pt"}
O Zod permite a gente criar validações e transformações complexas, nos dando a opção de extrair os tipos, centralizando tudo em um só componente. Além das muitas funções de validação e transformação disponíveis, temos possibilidade de criar nossas própris funções. Uma das maiores vantagens são as mensagens claras, indicando os valores esperados e os valores recebidos.

Nos meus exemplos, eu mostrei o uso mais comum, validar inputs, mas também é possível explorar o Zod para criar uma [Camada Anticorrupção](https://learn.microsoft.com/pt-br/azure/architecture/patterns/anti-corruption-layer) entre serviços e banco de dados, e em caso muito críticos, podemos utilizar para validar as próprias regras de negócio.
::

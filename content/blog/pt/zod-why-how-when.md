---
title: "Zod: Por quê? Como? Quando?"
slug: "zod-why-how-when"
publishDate: 2025-17-20
draft: false
tags: ["javascript", "typescript", "zod"]
description: ""
lang: "pt"
---

Algo que pode confundir desenvolvedores que estão começando a estudar Typescript/Javascript é
a verificação de tipos: eles são verificados **somente** durante a compilação de Typescript para Javascript:

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

// Quebra nosso código se a resposta da API mudar
post.title
```

Existe uma diferença entre verificação de tipos e verificação em runtime.
Sempre que você está trabalhando com dados que você não controla, mas que você espera um formato específico,
é importante você parsear todos esse dados, para evitar possíveis erros, ou permitir que você
defina o comportamento quando o formato esperado não bate com o formato que você recebeu.

::more-info{title="Parsing vs Validação"}
Existe uma diferença sútil entre esses dois termos. Validar significa utilizar uma função que
verifica se os dados são válidos. Parsear significa utilizar uma função que valida E transforma os dados no formato esperado, verificando possíveis erros.
::

O Zod é uma biblioteca de parsing, que a maior vantagem é sua flexibilidade, API de transformação e integração com Typescript.
A ideia é você definir "schemas", utilizando funções, com a possibilidade de extrair definições de Typescript, centralizando todas informações
em um só lugar.

::note
Nesse artigo, iremos utilizar a versão 4 do Zod.
A API pode ser diferente, mas os conceitos permanecem os mesmos.
Para mais informações, acesse a [documentação do projeto.](https://zod.dev/v4/changelog)
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

// Se a API retornar "postTitle" no lugar de "title"
const title = post.title // undefined
// Para o typescript, title ainda é `string`, porque a gente falou que seria.
```

::more-info{title="type Post vs const Post"}
Você pode ter notado que temos um tipo chamado `Post` e uma constante chamada `Post`. Isso é valido
pois o tipo é apagado do código depois da compilação para Javascript. Baseado na syntax, o Typescript
sabe se você está utilizando o tipo ou a constante. 

Caso você acha isso confuso, uma alternativa é utilizar sempre o sufixo `Schema`, para diferenciar melhor os dois.
::

E o que acontece se o formato não é o esperado?

```ts
const wrongPost = {
  userId: "not-a-number",
  id: 1,
  body: "This is a test post.",
};

Post.parse(wrongPost);
```

Nós vamos acabar com o seguinte erro:

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

Note que o nosso erro contem todas as informações e os erros acumuladas, ao invés de incluir somente o primeiro erro encontrado.

Eu particularmente não gosto do padrão de `try/catch`, por isso prefiro utilizar o `safeParse` que retorna
uma "[união discriminada](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions)", 
indicando o resultado do parsing, o valor parseado ou os erros:

```ts
if (result.success) {
  // Como `success` é true, `data` está garantido
  // É seguro acessar esses valores
  console.log(result.data.title);
} else {
  // Se `success` é false, existe um erro de validação
  console.error("Validation failed:", result.error);
}
```

O Zed fornece algumas funções para modificar esse erro. A mais útil é a `prettifyError()`, que deixa
um pouco mais fácil de entender o erro:

```ts
// Continuando do último exemplo
console.error(prettifyError(result.error));

// Output:
// ✖ Invalid input: expected number, received string
//  → at userId
// ✖ Invalid input: expected string, received undefined
//  → at title
```

O Zod não tem funções somente para primitivos, como também funções para validar e transformar vários tipos de input.
Vale a pena dar uma lida na [documentação](https://zod.dev/api) para você ter uma ideia das possibilidades.
Alguns exemplos mais relevantes:

```ts
import * as z from "zod";

// Objeto
const User = z.object({
  // Transforma qualquer input em número
  // (cuidado que `true` vira 1, `false` vira 0)
  id: z.coerce.number(),
  // Valida o tamanho da string
  name: z.string().min(2).max(100),
  // Transforma a string para minúsculas e remove espaços em branco
  // Não confundir com lowercase(), que valida se a string já está em minúsculas
  displayName: z.string().trim().toLowerCase(),
  // Valida formato de email
  email: z.email(),
  // Valida data no formato ISO 8601, transformando para objeto Date
  createdAt: z.iso.datetime().transform((value) => new Date(value)),
  // Valida número positivo
  age: z.number().positive(),
  // Campo opcional, com um valor padrão
  isActive: z.boolean().default(true),
  // Somente dois valores de strings permitidos (Um ou outro)
  role: z.enum(["admin", "user"]),
  // Você pode criar uma validação customizada
  password: z
    .string()
    .min(8)
    .refine((value) => /[A-Z]/.test(value), {
      message: "Password must contain at least one uppercase letter",
    }),
  // Ou uma função de transformação customizada
  team: z.enum(["red", "blue", "team red", "team blue"]).transform((value) => {
    if (value === "team red") return "red";
    if (value === "team blue") return "blue";
    return value;
  }),
});

// Array de objetos
const Users = z.array(User);

type Users = z.infer<typeof Users>;

// O Zod gerou a seguinte definição do tipo Users:
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

// Exemplo de uso
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
    userRole: "admin", // Campo extra que será ignorado
  },
]);

console.log(result);

// Output esperado:
// [
//   {
//     id: 123, // String convertido para número
//     name: 'Alice',
//     displayName: 'alice',
//     email: 'alice@test.com',
//     createdAt: 2023-10-01T12:00:00.000Z, // String ISO convertido para Date
//     age: 30,
//     isActive: true, // Valor padrão aplicado
//     role: 'admin',
//     password: 'Password1',
//     team: 'red' // 'team red' foi transformado em 'red'
//   }
// ]

```

::more-info{title="Extra Keys"}
Note que no nosso exemplo, o Zod removeu a propriedade `userRole`, que não estava definido no schema. 
Esse é o comportamento padrão para `z.object`

Se você precisa que a validação falha quando encontrar uma propriedade extra, você pode utilizar `z.strictObject`.
Se você deseja manter esses valores, você pode utilizar `z.looseObject`
::

E como estamos utilizando Typescript, também é possível fazer composições:

```ts
import * as z from "zod";

// Schema que pode ser reutilizado em múltiplos schemas
const DatabaseDates = z.object({
  created_at: z.date(),
  updated_at: z.date(),
});

const UserSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string().min(1).max(100),
  // `.shape` retorna o objeto interno do schema
  ...DatabaseDates.shape,
});

// Você também pode utilizar a função .extend() do Zod para adicionar os campos de data
const UserSchemaExtended = z
  .object({
    id: z.uuid(),
    email: z.email(),
    name: z.string().min(1).max(100),
  })
  .extend(DatabaseDates.shape);

// Você pode criar uma função que retorna um schema
function createTeamsSchema(names: string[]) {
  return z.object({
    id: z.uuid(),
    name: z.enum(names),
    ...DatabaseDates.shape,
  });
}

const ColorTeams = createTeamsSchema(["Red Team", "Blue Team", "Green Team"]);
```

O Zod permite a gente criar validações e transformações complexas, nos dando a opção de extrair
os tipos, centralizando tudo em um só componente. Além das muitas funções de validação e transformação disponíveis,
temos possibilidade de criar nossas própris funções. Uma das maiores vantagens são as mensagens claras, indicando
os valores esperados e os valores recebidos. 

Nos meus exemplos, eu mostrei o uso mais comum, validar inputs, mas também é possível explorar o Zod para
criar uma [Camada Anticorrupção](https://learn.microsoft.com/pt-br/azure/architecture/patterns/anti-corruption-layer) entre serviços e banco de dados, e em caso muito críticos, podemos utilizar para validar as próprias regras de negócio.

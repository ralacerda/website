---
title_pt: "Utilizando o padrão Result para lidar com erros"
title_en: "Using the Result pattern to handle errors"
slug: "err-handling"
publishDate: 2026-01-18
draft: false
tags: ["javascript", "typescript", "error-handling"]
description_pt: "Como substituir o uso de blocos try/catch"
description_en: "How to reduce and replace large try/catch blocks"
---

::lang-block{lang="pt"}
O uso de `try/catch` é o padrão mais comum para lidar com erros no Javascript.
Entretanto, essa abordagem possui algumas desvantagens. Não existe uma forma de verificar
se uma função possivelmente faz um `throw`. Também não é possível verificar
quais os erros que o `catch` vai receber. Isso tudo favorece um código que geralmente
inclui grandes blocos de `try/catch`, onde múltiplos erros são tratados de forma igual, e muitas informações são perdidas.

Além disso, o uso de `throw` prejudica o entendimento do código porque muda o fluxo do código. Nesse caso, para entender qual código vai ser executado depois do erro ser lançado, é necessário navegar por todo o código em busca do `catch` mais próximo, o que pode ser difícil e confuso.
::

::lang-block{lang="en"}
Using `try/catch` is the most common way to handle errors in JavaScript.
However, this approach has some drawbacks. There is no built-in way to verify
whether a function might `throw`. You also cannot statically know which errors
`catch` will receive. This usually leads to large `try/catch` blocks where
multiple errors are handled the same way and useful information gets lost.

On top of that, `throw` makes control flow harder to understand because it jumps execution.
To know what runs after an error is thrown, you often need to navigate through the codebase
until you find the nearest `catch`, which can be confusing.
::

```ts
async function getUser(id: string) {
  try {
    const response = await fetch(`/api/users/${id}`);

    if (!response.ok) {
      // Error 1: HTTP failure (404, 500, ...)
      throw new Error(`Request failed: ${response.status}`);
    }

    // Error 2: response body is not valid JSON
    const data = await response.json();
    return data;
  } catch (error) {
    // Error 3: network error (DNS failed, offline, ...)

    // `error` mixes all scenarios above.
    // It is hard to react to each case without extra checks.
    console.error("Failed to fetch user", error);
  }
}
```

::more-info{title_pt="Por que o erro do catch é sempre unknown?" title_en="Why is the catch error always unknown?"}
#pt
No JavaScript, o `throw` permite lançar qualquer tipo de valor, não apenas `Error`. É perfeitamente válido escrever `throw "deu ruim"`, `throw 404`, ou até mesmo `throw null`.

Devido a essa flexibilidade, o TypeScript adota uma postura segura e tipa a variável de erro no bloco `catch` como `unknown`. Isso força o desenvolvedor a verificar o tipo do erro (usando `typeof` ou `instanceof`) antes de tentar acessar propriedades como `.message` ou `.stack`, garantindo que o valor existe e é do tipo esperado.

#en
In JavaScript, `throw` can throw any value, not only `Error`.
`throw "oops"`, `throw 404`, or even `throw null` are all valid.

Because of this flexibility, TypeScript safely types the `catch` variable as `unknown`.
That forces you to narrow it (`typeof`, `instanceof`, etc.) before reading properties like
`.message` or `.stack`.
::

::lang-block{lang="pt"}
Uma alternativa possível é o padrão de utilizar Erro como valor. Essa abordagem
é utilizada em algumas linguagens como Go, Rust e recentemente Kotlin. A ideia é
que as funções retornem os erros como valores, deixando claro para o consumidor daquela função
quais são os possíveis erros.

Esse padrão pode ser simulado no typescript com o tipo Result:
::

::lang-block{lang="en"}
A common alternative is treating errors as values. This approach exists in languages like
Go, Rust, and more recently Kotlin. The idea is that functions return errors as values,
so callers can clearly see possible failures.

You can model this in TypeScript with a `Result` type:
::

```ts
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
```

::lang-block{lang="pt"}
O tipo Result representa a resposta de uma função sobre dois genéricos, o `T`, que representa
os dados retornados, e `E` que representa um erro. Além disso, possui uma propriedade discriminatória `ok`, que
indica de que se trata de um erro ou de um sucesso.
::

::lang-block{lang="en"}
`Result` represents an operation with two generics: `T` (success value) and `E` (error type).
It also includes a discriminant field, `ok`.
::

```ts
// Possible errors
type NetworkError = { _tag: "NetworkError"; message: string };
type NotFoundError = { _tag: "NotFoundError"; userId: string };
type ParseError = { _tag: "ParseError"; message: string };

type FetchUserError = NetworkError | NotFoundError | ParseError;

async function fetchUser(id: string): Promise<Result<User, FetchUserError>> {
  try {
    const response = await fetch(`/api/users/${id}`);

    if (response.status === 404) {
      return { ok: false, error: { _tag: "NotFoundError", userId: id } };
    }

    if (!response.ok) {
      return {
        ok: false,
        error: {
          _tag: "NetworkError",
          message: `HTTP ${response.status}`,
        },
      };
    }

    const data = await response.json();
    return { ok: true, value: data };
  } catch {
    return {
      ok: false,
      error: {
        _tag: "ParseError",
        message: "Failed to parse response",
      },
    };
  }
}

const userResult = await fetchUser("123");

if (userResult.ok) {
  console.log("User found:", userResult.value);
} else {
  switch (userResult.error._tag) {
    case "NotFoundError":
      console.error(`User ${userResult.error.userId} not found`);
      break;
    case "NetworkError":
      console.error(`Network error: ${userResult.error.message}`);
      break;
    case "ParseError":
      console.error(`Parse error: ${userResult.error.message}`);
      break;
  }
}
```

::lang-block{lang="pt"}
O objetivo não é eliminar completamente o uso do `throw/catch`,
mas sim reservá-lo para situações de falha extrema, situações
em que a execução deve ser parada imediatamente.
Por exemplo, quando uma variável de ambiente obrigatória não está presente na inicialização,
ou quando a conexão com o banco de dados falha irremediavelmente durante o boot.

Assim, temos uma separação entre erros esperados
(usuário não encontrado, saldo insuficiente, falha de validação) e erros não esperados
(estouro de memória, erros de sintaxe SQL).
Além disso, podemos adicionar metadados aos erros esperados, que facilitam debugação e observabilidade do sistema.

Embora seja possível definir seu próprio tipo `Result` e funções auxiliares manualmente, para aplicações reais é recomendado utilizar uma solução com mais recursos. A partir daqui, utilizaremos a biblioteca [`typescript-result`](https://www.typescript-result.dev/).

A seguir, discutiremos três padrões distintos para tratar melhor os erros nas suas aplicações.

## Criando um Result

Antes de poder consumir um Result, nós precisamos adaptar nossas funções para gerar um Result.
O `typescript-result` expõe algumas APIs para isso.

`Result.ok` e `Result.error` geram, respectivamente, um resultado de uma operação bem sucedida e um resultado de um erro.
::

::lang-block{lang="en"}
The goal is not to eliminate `throw/catch` entirely.
Use it for critical failures where execution should stop immediately,
like a missing required environment variable at startup,
or an unrecoverable DB connection failure during boot.

That gives us a clear split between expected errors
(user not found, insufficient balance, validation failure)
and unexpected errors (OOM, fatal runtime failures, etc.).
It also lets us attach richer metadata to expected errors.

Although you can define your own `Result` manually, for real applications
it is usually better to use a richer library. From here on, we'll use
[`typescript-result`](https://www.typescript-result.dev/).

## Creating a Result

Before consuming `Result`, we need to return it from functions.
`typescript-result` provides APIs for this.

`Result.ok` and `Result.error` create success and failure results:
::

```ts
import { Result } from "typescript-result";

type DiscountError =
  | { _tag: "NegativeAmount"; amount: number }
  | { _tag: "ExceedsMaximum"; amount: number; max: number };

function calculateDiscountPercentage(
  amount: number,
): Result<number, DiscountError> {
  if (amount <= 0) {
    return Result.error({ _tag: "NegativeAmount", amount });
  }
  if (amount > 100) {
    return Result.error({ _tag: "ExceedsMaximum", amount, max: 100 });
  }

  const finalValue = amount * 0.9;
  return Result.ok(finalValue);
}

const result = calculateDiscountPercentage(30);
```

::note
#pt
Você pode explicitamente definir o retorno como `Result<number, DomainError>`, por exemplo.
Apesar do TypeScript inferir os tipos automaticamente, definir o retorno explicitamente é considerado uma boa prática se você está criando uma função pública (biblioteca ou API), pois garante que o contrato da função seja respeitado e evita que tipos internos "vazem" acidentalmente.

#en
You can explicitly declare the return type as `Result<number, DomainError>`.
Even if TypeScript infers it, explicit public signatures (APIs/libraries)
are a good practice to keep contracts stable.
::

::lang-block{lang="pt"}
Para facilitar a geração de Results a partir de funções que podem fazer um `throw`,
você pode utilizar o `try` ou `wrap`.
::

::lang-block{lang="en"}
To adapt functions that might throw, use `try` or `wrap`:
::

```ts
import { Result } from "typescript-result";

function divide(a: number, b: number) {
  if (b === 0) throw new Error("Cannot divide by zero");
  return a / b;
}

// Executes immediately and captures exceptions
const immediateResult = Result.try(() => divide(10, 0));

// Optional error mapping
const taggedResult = Result.try(
  () => divide(10, 0),
  (error) => ({ _tag: "MathError", message: String(error) }),
);

// Returns a new function that always returns Result
const safeDivide = Result.wrap(divide);
const result = safeDivide(10, 0);
```

::more-info{title_pt="Por que os erros possuem a propriedade \_tag?" title_en="Why do errors use a \_tag field?"}
#pt
Typescript possui verificação estrutural, o que significa que, para fins de verificação,
os seguintes erros são os mesmos:

```ts
class ValidationError {
  constructor(public message: string) {}
}

class DatabaseError {
  constructor(public message: string) {}
}
```

Em alguns casos, o Typescript pode "colapsar" os tipos em um só, quando na verdade eles
possuem significados semânticos diferentes.

A literal `_tag` facilita a distinção dos erros em runtime,
evitando o uso de `instanceof`. Em aplicações modernas (grandes monorepos, micro-frontends, etc), o `instanceof` pode falhar. Isso acontece porque a classe instanciada pode vir de um contexto ou bundle diferente da classe que você está usando para a comparação, mesmo que elas tenham o mesmo nome e código. Uma string literal (`_tag`) é imune a esse problema.

Você pode ler mais sobre a verificação estrutural do
typescript no meu artigo: :lang-link{href="/blog/typescript-checking" pt="Entendendo Structural Typing no TypeScript" en="Understanding Structural Typing in TypeScript"}.

#en
TypeScript uses structural typing. For type checking, the following classes can be compatible:

```ts
class ValidationError {
  constructor(public message: string) {}
}

class DatabaseError {
  constructor(public message: string) {}
}
```

In some cases, TypeScript may collapse semantically different error types.
A literal `_tag` makes runtime and type-level distinction explicit.
It also avoids fragile `instanceof` checks in large apps (multiple bundles/contexts),
where class identity can fail.
::

::lang-block{lang="pt"}
Essas funções utilitárias são fundamentais quando precisamos interagir com bibliotecas externas ou código legado que não utilizam o padrão Result. Elas funcionam como uma barreira de proteção nas bordas da sua aplicação, encapsulando exceções imprevisíveis e trazendo-as para dentro do fluxo controlado e tipado do Result.

Até agora, vimos exemplos que retornam `Promise<Result<T, E>>`. Entretanto, a biblioteca `typescript-result` fornece um tipo especializado chamado `AsyncResult<T, E>`, que é essencialmente um alias para `Promise<Result<T, E>>`.
::

::lang-block{lang="en"}
These helpers are useful when integrating external libraries or legacy code
that still throws exceptions.

So far, examples returned `Promise<Result<T, E>>`. The library also exposes
`AsyncResult<T, E>` (an alias):
::

```ts
async function fetchUser(id: string): AsyncResult<User, FetchUserError> {
  // ...
}
```

::lang-block{lang="pt"}

## Verificação Manual de Erros

Agora, quando utilizamos uma função que retorna um erro, precisamos
verificar se não temos um erro. Podemos tomar uma decisão com o
que fazer com aquele erro, ou repassar ele para cima:
::

::lang-block{lang="en"}

## Manual error checking

When a function returns `Result`, you check it explicitly and either handle
or propagate errors:
::

```ts
type ValidationError = { _tag: "ValidationError"; field: string };
type DatabaseError = { _tag: "DatabaseError"; message: string };
type NotFoundError = { _tag: "NotFoundError"; id: string };

async function processOrder(
  orderId: string,
): AsyncResult<Order, ValidationError | DatabaseError | NotFoundError> {
  const orderResult = await fetchOrder(orderId);
  if (!orderResult.ok) return orderResult;

  const order = orderResult.value;

  const validationResult = validateOrder(order);
  if (!validationResult.ok) {
    if (validationResult.error._tag === "ValidationError") {
      console.error(`Validation failed: ${validationResult.error.field}`);
    }
    return validationResult;
  }

  const saveResult = await saveToDatabase(order);
  if (!saveResult.ok) return saveResult;

  return Result.ok(saveResult.value);
}
```

::lang-block{lang="pt"}
Esse padrão é muito semelhante ao padrão utilizado em Go,
onde funções, por convenção, retornam sempre um possível resultado
e um possível erro. Em Go, em vez de usar `throw/catch`, as funções retornam
múltiplos valores: o resultado esperado e um erro (se houver). É como se JavaScript tivesse:
`[resultado, erro] = await minhaFuncao()` em cada chamada.
::

::lang-block{lang="en"}
This pattern is close to idiomatic Go (return result + error and check at each step).
Its strength is explicitness. The downside is verbosity.
::

```go
func processOrder(orderId string) (*Order, error) {
    // In Go, the function returns two values: order and err
    // If err is different to nil, it means there was an error
    order, err := fetchOrder(orderId)
    if err != nil {
        return nil, err
    }

    // Validate the order
    err = validateOrder(order)
    if err != nil {
        log.Printf("Validation failed: %v", err)
        return nil, err
    }

    // Save to database
    savedOrder, err := saveToDatabase(order)
    if err != nil {
        return nil, err
    }

    return savedOrder, nil
}
```

::lang-block{lang="pt"}
Uma das vantagens dessa abordagem é que ela é extremamente simples
de entender, mesmo se alguém não estiver familiarizado com essa biblioteca ou padrão. Ele
deixa explícito os pontos de tomada de decisão.

Entretanto, um problema é a verbosidade. Por exemplo, um erro precisa se propagar (_bubble up_) até atingir a camada adequada que vai lidar com ele.

## Encadeando operações (Chaining)

E se, em vez de verificar o conteúdo de um Result, a gente tivesse um método que aplicasse
uma função no Result somente se ele fosse um sucesso, retornando o result imediatamente se
ele na verdade for um erro?

Toda instância de `Result` possui alguns métodos que permitem trabalhar com o conteúdo de um Result,
sem a necessidade de verificar seu conteúdo.

O `.map()` aplica uma função somente se o resultado corresponder com um sucesso (que pode retornar um valor, ou até mesmo um outro Result), enquanto que o `.mapError()` aplica a função somente se o resultado for um erro. Note que essas funções retornam outro `Result`,
o que possibilita encadear multiplas chamadas.
::

::lang-block{lang="en"}

## Chaining operations

Instead of manually checking every `Result`, you can transform only success values
and leave failures untouched.

`Result` instances provide methods for this:

- `.map()` runs only on success
- `.mapError()` runs only on failure
- both return new `Result`, so they can be chained
  ::

```ts
async function getUserEmail(
  userId: string,
): AsyncResult<string, FetchUserError> {
  return fetchUser(userId)
    .map((user) => user.email)
    .map((email) => email.toLowerCase());
}

async function processUserData(userId: string): AsyncResult<User, AppError> {
  return fetchUser(userId).mapError((error) => {
    switch (error._tag) {
      case "NetworkError":
        return { _tag: "AppError" as const, message: "Service unavailable" };
      case "NotFoundError":
        return { _tag: "AppError" as const, message: "User not found" };
      case "ParseError":
        return { _tag: "AppError" as const, message: "Invalid data" };
    }
  });
}
```

::lang-block{lang="pt"}
Se você deseja observar o valor sem modificá-lo (efeitos colaterais), pode utilizar os métodos `onSuccess` ou `onFailure`.
Um uso comum é para adicionar observabilidade e logs:
::

::lang-block{lang="en"}
If you only want side effects (logging/metrics), use `onSuccess` / `onFailure`:
::

```ts
async function loginUser(
  email: string,
  password: string,
): AsyncResult<User, LoginError> {
  return authenticateUser(email, password)
    .onSuccess((user) => {
      console.log(`Login successful for ${user.email}`);
      analytics.track("user_login", { userId: user.id, timestamp: Date.now() });
    })
    .onFailure((error) => {
      console.error(`Login failed: ${error._tag}`);
    });
}
```

::lang-block{lang="pt"}
Esse padrão também é conhecido como **Railway Oriented Programming (ROP)**, porque temos duas "trilhas", a de sucesso e de falha, e aplicamos funções em trilhas diferentes. O caminho comum é focar na trilha do sucesso (happy path), direcionando para a outra trilha quando encontramos um erro.

Entretanto, em alguns casos, você pode
querer fazer o caminho inverso, uma função que, baseada em um erro, tenta "voltar" para a trilha de sucessos. Para esse
caso, temos a função `.recover()`
::

::lang-block{lang="en"}
This style is often called **Railway Oriented Programming (ROP)**:
one track for success, another for failure.

You can also move from failure back to success with `.recover()` (fallbacks):
::

```ts
type ApiError = { _tag: "PrimaryApiDown" } | { _tag: "SecondaryApiDown" };

async function fetchDataWithFallback(id: string): AsyncResult<Data, ApiError> {
  return fetchFromPrimaryApi(id).recover(() => fetchFromSecondaryApi(id));
}
```

::lang-block{lang="pt"}
Esse padrão de encadeamento (chaining) é muito comum na programação funcional, tratando o Result como um `monad`.
Esse padrão é semelhante ao uso de `pipelines`, e deixa explícita as etapas. Em Rust, existe um padrão muito semelhante:
::

::lang-block{lang="en"}
This pattern is very common in functional programming, treating Result as a monad. This pattern is similar to the use of pipelines. In Rust, there is a very similar pattern:
::

```rust
fn process_user_data(id: &str) -> Result<String, AppError> {
    fetch_user(id)
        .map(|user| user.email)
        .map(|email| email.to_lowercase())
        .map_err(|err| AppError::from(err))
}
```

::lang-block{lang="pt"}
Entretanto,
ele pode fugir do formato típico de funções do Javascript/Typescript. Ele também pode
causar problemas de legibilidade quando todas as lógicas precisam estar implementadas em funções.

## Usando Generators

O `Result` também fornece uma outra forma de gerar um Result, com um generator:
::

::lang-block{lang="en"}
However, it may deviate from the typical JavaScript/TypeScript function format. It can also cause readability issues when all logic needs to be implemented in functions.

## Using generators

`Result` also supports generator-based flows with `Result.gen()`:
::

```ts
function calculateTotal(items: Item[]): Result<number, ValidationError> {
  return Result.gen(function* () {
    const validatedItems = yield* validateItems(items);
    const subtotal = yield* calculateSubtotal(validatedItems);
    const discount = yield* applyDiscount(subtotal);

    return subtotal - discount;
  });
}
```

::lang-block{lang="pt"}
Generators permitem uma forma de inversão de controle (IoC). O `Result.gen()` recebe o generator que você escreveu e o executa. Para cada `yield*`, ele verifica o Result: se houver um erro, a execução para imediatamente e retorna o erro. Caso contrário, ele extrai o valor de sucesso e passa esse valor de volta para o generator, permitindo que a execução continue. Essa sintaxe é muito semelhante ao `async/await`, onde "esperamos" a execução de uma função e recebemos o seu resultado.
::

::lang-block{lang="en"}
`Result.gen()` executes your generator and, at each `yield*`, it:

- returns immediately if that `Result` is an error
- unwraps the success value and continues otherwise

This feels similar to `async/await`.
::

::note
#pt
Note o asterisco necessário no fim de `yield*`.

#en
Remember the asterisk: `yield*`.
::

::lang-block{lang="pt"}
Uma vantagem interessante do `Result.gen()` é que o TypeScript consegue inferir automaticamente todos os tipos de erro possíveis. Se `validateItems` pode retornar um `InvalidItemError`, `calculateSubtotal` pode retornar um `CalculationError`, e `applyDiscount` pode retornar um `DiscountError`, o TypeScript automaticamente deduz que a função retorna `Result<number, InvalidItemError | CalculationError | DiscountError>`, sem você precisar declarar explicitamente essa união de tipos.
::

::lang-block{lang="en"}
A nice benefit: TypeScript can infer the full union of possible errors from all yielded operations.
::

::more-info{title_pt="Entendendo generators e yield* em detalhes" title_en="Understanding generators and yield* in detail"}
#pt
Generators permitem uma forma de inversão de controle, onde o fluxo de uma função é controlado de forma externa. Eles são geralmente utilizados para criar iteradores personalizados de forma preguiçosa ("lazy") ou para implementar máquinas de estado complexas.

O `yield` pausa a execução da função, envia um valor para fora e aguarda um comando para continuar. No momento que um generator é consumido, também é possível injetar valores de volta para dentro da função.

O `yield*` permite que generators **deleguem** toda a iteração para outros generators internos. Isso é exatamente o que acontece com `Result.gen()` e `yield*` - quando você faz `yield* fetchOrder(orderId)`, você está delegando para aquela operação, e o `Result.gen()` extrai o resultado automaticamente.

#en
Generators allow a form of inversion of control, where the flow of a function is externally controlled. They are generally used to create custom lazy iterators or to implement complex state machines.

`yield` pauses function execution, sends a value out, and waits for a command to continue. When a generator is consumed, it's also possible to inject values back into the function.

`yield*` allows generators to delegate all iteration to other internal generators. This is exactly what happens with `Result.gen()` and `yield*` — when you do `yield* fetchOrder(orderId)`, you are delegating to that operation, and `Result.gen()` extracts the result automatically.
::

```ts
// Using generators with Result.gen()
async function processOrder(
  orderId: string,
): AsyncResult<Order, ValidationError | DatabaseError | NotFoundError> {
  return Result.gen(function* () {
    // yield* "extracts" the Result value or returns the error immediately
    const order = yield* fetchOrder(orderId);

    // If we got here, order is of type Order (not Result<Order, ...>)
    const validatedOrder = yield* validateOrder(order);

    // Continues extracting values smoothly
    const savedOrder = yield* saveToDatabase(validatedOrder);

    // Returns the final value
    return savedOrder;
  });
}
```

::lang-block{lang="pt"}
Esse padrão se aproxima do operador `?` do Rust, que atua de forma semelhante, "extraindo" o valor
do Result ou retornando a função imediatamente com um erro:
::

::lang-block{lang="en"}
This pattern is close to Rust's `?` operator, which acts similarly, "extracting" the value from Result or immediately returning the function with an error:
::

```rust
fn process_order(order_id: &str) -> Result<Order, OrderError> {
    let order = fetch_order(order_id)?;
    let validated_order = validate_order(order)?;
    let saved_order = save_to_database(validated_order)?;
    Ok(saved_order)
}
```

::lang-block{lang="pt"}

## Chegando ao um resultado final

Independente se você vai verificar cada Result individualmente, utilizar chains com `.map()` ou utilizar `.gen()`,
você geralmente vai chegar em um ponto onde o seu Result vai alcançar uma última camada, onde um valor deve ser gerado
ou um erro deve ser retornado.

O Result possui alguns métodos "getters" para quando você precisa gerar um valor, independendo do erro:

Os principais são `getOrDefault()`, que retorna um valor default no caso de um erro e `getOrElse()`, que executa
uma função de callback para adquirir o valor que deve ser retornado no caso de um erro.
::

::lang-block{lang="en"}

## Producing the final value

At some boundary (HTTP handler/UI/etc.), you usually need a final value no matter what.
`Result` provides helpers like:

- `getOrDefault()`
- `getOrElse()`
  ::

```ts
async function getUserName(userId: string): Promise<string> {
  const result = await fetchUser(userId);
  return result.getOrDefault("Unknown User");
}

async function getUserEmail(userId: string): Promise<string> {
  const result = await fetchUser(userId);
  return result.getOrElse((error) => {
    console.error("Could not fetch user:", error);
    return `user-${userId}@placeholder.com`;
  });
}
```

::lang-block{lang="pt"}
Entretanto, em alguns casos, precisamos lidar com cada erro de forma diferente. Para isso, Results que são falhas
possuem um método chamado `.match()`.
::

::lang-block{lang="en"}
When each error requires a different reaction, use `.match()`:
::

```ts
type PaymentError =
  | { _tag: "InsufficientFunds"; required: number; available: number }
  | { _tag: "InvalidCard"; reason: string }
  | { _tag: "NetworkError"; message: string }
  | { _tag: "SessionExpired" };

async function processPayment(amount: number): Promise<string> {
  const result = await attemptPayment(amount);

  if (!result.ok) {
    return result
      .match()
      .when(
        "InsufficientFunds",
        (err) =>
          `Insufficient funds. Required: $${err.required}, available: $${err.available}`,
      )
      .when("InvalidCard", (err) => `Invalid card: ${err.reason}`)
      .when("NetworkError", (err) => `Network error: ${err.message}`)
      .when(
        "SessionExpired",
        () => `Your session expired. Please log in again.`,
      )
      .run();
  }

  return `Payment of $${amount} was processed successfully.`;
}
```

::lang-block{lang="pt"}
Além disso, você pode utilizar o `.else()` para lidar com todos os outros erros da mesma forma.
::

::lang-block{lang="en"}
You can also use `.else()` as a catch-all:
::

::note
#pt
O `.match()` funciona somente em falhas, é necessário verificar o valor de `.ok` antes.

#en
`.match()` works on failures, so check `result.ok` first.
::

```ts
return result
  .match()
  .when("NotFound", (err) => `Resource "${err.resource}" not found.`)
  .when("Unauthorized", () => `You are not allowed to access this resource.`)
  .else((err) => `Unexpected error: ${err._tag}. Try again later.`)
  .run();
```

::lang-block{lang="pt"}

## Conclusão

Mesmo que você não utilize especificamente a biblioteca `typescript-result` ou o padrão Result,
eu acredito que é importante você estar ciente dessas formas de tratar erros, e parar para pensar
em como você está lidando com erros na sua aplicação.

Se você tem interesse, eu recomendo ler a documentação do `typescript-result`, que possui
outros métodos e informações de como melhor utilizar a biblioteca.

Além disso, você pode explorar outras bibliotecas `neverthrow` e `fp-ts`. A biblioteca `Effect` vai além,
gerando um framework e ecossistemas em volta do conceito de `Effect`, uma função que recebe um contexto e retorna
um `Result`.
::

::lang-block{lang="en"}

## Conclusion

Even if you do not adopt `typescript-result` specifically,
it is worth understanding these error-handling styles and evaluating
how your application treats failures.

If you are interested, read the `typescript-result` docs for more patterns.
You can also explore alternatives like `neverthrow`, `fp-ts`, and `Effect`.
::

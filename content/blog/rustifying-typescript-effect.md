---
title_pt: "Rustificando o TypeScript com Effect.ts"
title_en: "Rustifying TypeScript with Effect.ts"
slug: "rustifying-typescript-effect"
publishDate: 2026-05-14
draft: true
tags: ["typescript", "rust", "effect", "functional-programming"]
description_pt: "Como trazer os melhores recursos do Rust para o seu ecossistema TypeScript utilizando a biblioteca Effect."
description_en: "How to bring the best features of Rust to your TypeScript ecosystem using the Effect library."
---

::lang-block{lang="en"}
Rust has set a high bar for modern software engineering. Features like exhaustive pattern matching, explicit error handling, and high-performance concurrency are no longer just "nice-to-haves"—they are becoming expectations.

But rewriting everything in Rust isn't always feasible or even desirable. The TypeScript ecosystem is massive, and the development velocity of a garbage-collected language is hard to beat.

What if we could bring the best of Rust—the robustness, the type safety, and the explicit control—to TypeScript? That is exactly what [Effect](https://effect.website/) allows us to do.

## Data Classes and Free Serialization

In Rust, we often use `serde` to derive serialization and deserialization for our structs. In standard TypeScript, we usually resort to manual validation or libraries like Zod.

Effect provides `Schema`, which goes a step further. It defines your data model and provides "free" bidirectional parsing and serialization.

```ts
import { Schema } from "@effect/schema"

class User extends Schema.Class<User>("User")({
  id: Schema.Number,
  name: Schema.String,
  email: Schema.trim(Schema.String),
  createdAt: Schema.DateFromString,
}) {}

// Deserialization (Decoding)
const decode = Schema.decodeUnknownSync(User)
const user = decode({ 
  id: 1, 
  name: "Renato", 
  email: " mail@example.com ", 
  createdAt: "2024-01-01" 
})

console.log(user.email) // "mail@example.com" (trimmed automatically)
```

With `Schema.Class`, you get a data class that is also a schema. You can decode from unknown inputs (like API responses) and be guaranteed that your types are correct at runtime.

## Option and Result (Either)

One of Rust's most loved features is the lack of `null` and the explicit `Result` type. In Effect, we have `Option` and `Either`.

```ts
import { Either, Option } from "effect"

const getUserId = (name: string): Option.Option<number> => 
  name === "Renato" ? Option.some(1) : Option.none()

const divide = (a: number, b: number): Either.Either<number, string> =>
  b === 0 ? Either.left("Cannot divide by zero") : Either.right(a / b)
```

By using these types, you force the consumer to handle the "empty" or "error" cases. No more "Uncaught TypeError: cannot read property of undefined."

## Algebraic Data Types (Enums)

In Rust, Enums are more than just a list of strings—they are Algebraic Data Types (ADTs) that can hold data. TypeScript's "Discriminated Unions" are the closest equivalent, but they can be verbose to define and match.

Effect's `Data` module simplifies this, providing a pattern that feels remarkably like Rust's `enum`.

```ts
import { Data } from "effect"

type RemoteData = Data.TaggedEnum<{
  Loading: {}
  Success: { readonly data: string }
  Failure: { readonly reason: string }
}>

const { $is, $match, Loading, Success, Failure } = Data.taggedEnum<RemoteData>()

// Use `$is` to create a type guard, just like a "match" or "if let" in Rust
const isLoading = $is("Loading")

// Use `$match` for exhaustive pattern matching on the TaggedEnum
const render = $match({
  Loading: () => "Fetching data...",
  Success: ({ data }) => `Data: ${data}`,
  Failure: ({ reason }) => `Error: ${reason}`
})
```

For more generic pattern matching across any TypeScript type (not just your own ADTs), Effect provides the `Match` module. It acts as a powerful replacement for `switch` or complex `if/else` chains, ensuring exhaustivity at the type level.

```ts
import { Match } from "effect"

const input: string | number = "some input"

const result = Match.value(input).pipe(
  Match.when(Match.number, (n) => `number: ${n}`),
  Match.when(Match.string, (s) => `string: ${s}`),
  Match.exhaustive
)

console.log(result) // "string: some input"
```

This gives you exhaustive pattern matching and a clean way to define complex state machines, just like you would in Rust.

## Simulating the `?` Operator with Generators

Rust’s `?` operator is a masterclass in ergonomics. It allows you to propagate errors upward without nesting `if` checks or `match` blocks.

In TypeScript, we usually have to chain `.then()` or use `try/catch`. However, Effect uses **Generators** to simulate this exact behavior. Best of all, it tracks the **union of all possible errors**, just like Rust.

```ts
import { Effect } from "effect"

// fetchUser can fail with FetchError
// getPerms can fail with AuthError
const program: Effect.Effect<boolean, FetchError | AuthError> = Effect.gen(function* () {
  const user = yield* fetchUser(1)       // If this fails, exits early with FetchError
  const permissions = yield* getPerms(user) // If this fails, exits early with AuthError
  
  return permissions.isAdmin
})
```

The `yield*` acts exactly like Rust's `?`. If the operation on the right returns a failure, the generator exits early and returns that failure. This keeps your code flat and readable while maintaining full type safety for your errors.

::more-info{title_pt="Por que Generators e não Async/Await?" title_en="Why Generators instead of Async/Await?"}
#pt
Embora o `async/await` seja o padrão no JavaScript para asincronicidade, ele é limitado a tratar apenas Promises. O Effect utiliza Generators porque eles permitem que a biblioteca controle a execução do código passo a passo. Isso possibilita recursos como cancelamento nativo, rastreamento de erros tipados (que se perdem no `try/catch`) e injeção de dependência automática, tudo isso mantendo uma sintaxe que parece código síncrono.

#en
While `async/await` is the JavaScript standard for async code, it is limited to handling Promises. Effect uses Generators because they allow the library to control code execution step-by-step. This enables features like native cancellation, typed error tracking (which get lost in `try/catch`), and automatic dependency injection, all while keeping a syntax that feels like synchronous code.
::

## Effects are Lazy (Just like Rust Futures)

In JavaScript, a `Promise` is eager—the moment you create it, it starts executing. In Rust, a `Future` is lazy; nothing happens until it is polled.

Effect follows the Rust philosophy. An `Effect` is just a **blueprint** (a data structure) describing an operation. This laziness allows for powerful composition, like adding retries or timeouts without modifying the original task.

```ts
import { Effect, Schedule } from "effect"

const task = Effect.log("Attempting to connect...")

// We can wrap the task with a retry schedule
const taskWithRetry = task.pipe(
  Effect.retry(
    Schedule.exponential("100 millis").pipe(Schedule.recurs(5))
  )
)

// Only now the action happens
Effect.runSync(taskWithRetry)
```

## Coordination and Concurrency

Effect introduces "Fibers"—lightweight threads similar to Rust's async tasks or Go's goroutines. It provides primitives for shared state (`Ref`) and synchronization (`Deferred`) that prevent typical race conditions.

```ts
import { Effect, Ref, Fiber } from "effect"

const program = Effect.gen(function* () {
  const counter = yield* Ref.make(0)
  
  // High-level concurrency with automatic management
  const fiberA = yield* Effect.fork(Ref.update(counter, n => n + 1))
  const fiberB = yield* Effect.fork(Ref.update(counter, n => n + 1))
  
  // Join handlers: wait for fibers to complete
  yield* Fiber.joinAll([fiberA, fiberB])
  
  return yield* Ref.get(counter)
})
```

Because Effects are managed by a runtime, features like **Cancellation** are built-in. If you time out an operation, Effect doesn't just stop listening; it actively interrupts the fiber and cleans up resources (like closing sockets or clearing timers), preventing leaks.

## But... why not just use Rust?

If we want all these features, why not just write Rust?

1.  **No Borrow Checker:** Rust is powerful, but the borrow checker is a significant mental tax. Sometimes you just want to build a feature without fighting the compiler over memory ownership.
2.  **Maturity of the Ecosystem:** TypeScript has a package for everything. Need to connect to an obscure 20-year-old SOAP API? There's a TS library for that.
3.  **Unified Stack:** Using the same language for your frontend and backend is a massive productivity boost.

## Where Effect is actually ahead of Rust

It might sound bold, but in some areas, the Effect ecosystem offers better ergonomics than idiomatic Rust:

*   **Dependency Injection (Context/Layer):** In Rust, passing state or "services" down a call stack usually involves manual "prop drilling". Effect has a built-in `Context` and `Layer` system that handles DI automatically and type-safely.
*   **Built-in Observability:** Effect is "Observable by Default." It has native integration with OpenTelemetry and **OTLP**. You get tracing and metrics across your entire application without adding a single line of instrumentation code.
*   **Native Cancellation:** Cancellation in Rust futures can be tricky (dropping the future). In Effect, interruption is a first-class citizen with defined cleanup semantics.

## Conclusion

Effect is a paradigm shift. It transforms TypeScript from a "better JavaScript" into a robust, industrial-grade language that rivals the safety and expressiveness of Rust.

If you find yourself missing the `?` operator, typed errors, or the composability of lazy futures, you owe it to yourself to check out Effect.
::

::lang-block{lang="pt"}
*Em breve: tradução em português.*
::

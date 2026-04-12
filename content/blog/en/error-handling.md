---
title: "Using the Result pattern to handle errors"
slug: "err-handling"
publishDate: 2026-01-18
draft: false
tags: ["javascript", "typescript", "error-handling"]
description: "How to reduce and replace large try/catch blocks"
lang: "en"
---

Using `try/catch` is the most common way to handle errors in JavaScript.
However, this approach has some drawbacks. There is no built-in way to verify
whether a function might `throw`. You also cannot statically know which errors
`catch` will receive. This usually leads to large `try/catch` blocks where
multiple errors are handled the same way and useful information gets lost.

On top of that, `throw` makes control flow harder to understand because it jumps execution.
To know what runs after an error is thrown, you often need to navigate through the codebase
until you find the nearest `catch`, which can be confusing.

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

::more-info
#title
Why is the catch error always `unknown`?

#content
In JavaScript, `throw` can throw any value, not only `Error`.
`throw "oops"`, `throw 404`, or even `throw null` are all valid.

Because of this flexibility, TypeScript safely types the `catch` variable as `unknown`.
That forces you to narrow it (`typeof`, `instanceof`, etc.) before reading properties like
`.message` or `.stack`.
::

A common alternative is treating errors as values. This approach exists in languages like
Go, Rust, and more recently Kotlin. The idea is that functions return errors as values,
so callers can clearly see possible failures.

You can model this in TypeScript with a `Result` type:

```ts
type Result<T, E> =
  | {
      ok: true;
      value: T;
    }
  | {
      ok: false;
      error: E;
    };
```

`Result` represents an operation with two generics: `T` (success value) and `E` (error type).
It also includes a discriminant field, `ok`.

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
You can explicitly declare the return type as `Result<number, DomainError>`.
Even if TypeScript infers it, explicit public signatures (APIs/libraries)
are a good practice to keep contracts stable.
::

To adapt functions that might throw, use `try` or `wrap`:

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

::more-info
#title
Why do errors use a `_tag` field?

#content
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

These helpers are useful when integrating external libraries or legacy code
that still throws exceptions.

So far, examples returned `Promise<Result<T, E>>`. The library also exposes
`AsyncResult<T, E>` (an alias):

```ts
async function fetchUser(id: string): AsyncResult<User, FetchUserError> {
  // ...
}
```

## Manual error checking

When a function returns `Result`, you check it explicitly and either handle
or propagate errors:

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

This pattern is close to idiomatic Go (return result + error and check at each step).
Its strength is explicitness. The downside is verbosity.

## Chaining operations

Instead of manually checking every `Result`, you can transform only success values
and leave failures untouched.

`Result` instances provide methods for this:

- `.map()` runs only on success
- `.mapError()` runs only on failure
- both return new `Result`, so they can be chained

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

If you only want side effects (logging/metrics), use `onSuccess` / `onFailure`:

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

This style is often called **Railway Oriented Programming (ROP)**:
one track for success, another for failure.

You can also move from failure back to success with `.recover()` (fallbacks):

```ts
type ApiError = { _tag: "PrimaryApiDown" } | { _tag: "SecondaryApiDown" };

async function fetchDataWithFallback(id: string): AsyncResult<Data, ApiError> {
  return fetchFromPrimaryApi(id).recover(() => fetchFromSecondaryApi(id));
}
```

## Using generators

`Result` also supports generator-based flows with `Result.gen()`:

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

`Result.gen()` executes your generator and, at each `yield*`, it:

- returns immediately if that `Result` is an error
- unwraps the success value and continues otherwise

This feels similar to `async/await`.

::note
Remember the asterisk: `yield*`.
::

A nice benefit: TypeScript can infer the full union of possible errors from all yielded operations.

## Producing the final value

At some boundary (HTTP handler/UI/etc.), you usually need a final value no matter what.
`Result` provides helpers like:

- `getOrDefault()`
- `getOrElse()`

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

When each error requires a different reaction, use `.match()`:

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

You can also use `.else()` as a catch-all:

```ts
return result
  .match()
  .when("NotFound", (err) => `Resource "${err.resource}" not found.`)
  .when("Unauthorized", () => `You are not allowed to access this resource.`)
  .else((err) => `Unexpected error: ${err._tag}. Try again later.`)
  .run();
```

::note
`.match()` works on failures, so check `result.ok` first.
::

## Conclusion

Even if you do not adopt `typescript-result` specifically,
it is worth understanding these error-handling styles and evaluating
how your application treats failures.

If you are interested, read the `typescript-result` docs for more patterns.
You can also explore alternatives like `neverthrow`, `fp-ts`, and `Effect`.

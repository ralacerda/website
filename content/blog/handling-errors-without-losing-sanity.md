---
title_en: "Handling errors without losing sanity"
slug: "handling-errors-without-losing-sanity"
publishDate: 2026-05-17
draft: false
tags: ["javascript", "typescript", "error-handling"]
description_en: "How to improve error handling in a codebase full of try/catch blocks without alienating your team."
---

You've read the articles. You've seen how languages like Go and Rust handle errors as values. You've learned about the `Result` pattern, discriminated unions, and maybe even Monads. You are inspired to write robust, error-proof code.

Then, you open your company's codebase.

It's a jungle of nested `try/catch` blocks. Functions throw generic `Error`s unpredictably. Some errors are swallowed silently, while others are caught just to be logged before being thrown again.

Your first instinct might be to introduce a library like `neverthrow` or enforce a strict `Result<T, E>` pattern everywhere. But introducing heavy functional programming concepts to a team that isn't used to them can lead to pushback, friction, and ultimately, a loss of your own sanity.

So, how do we improve error handling incrementally without forcing your team to learn a completely new paradigm?

## The Rust Philosophy: Handle it Now or Never

One of the best mental models we can steal from Rust isn't the `Result` type itself, but the philosophy behind the `?` operator. In Rust, you either handle an error immediately, or you bubble it up for the caller to handle.

In JavaScript and TypeScript, the equivalent is knowing when to use `try/catch` and when to let the exception bubble up to an error boundary.

**The Golden Rule: If you don't know how to recover from an error, don't catch it.**

Often, we see code like this:

```ts
async function fetchUserProfile(userId: string) {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch user profile", error);
    throw error;
  }
}
```

Don't catch just to log it. If you aren't doing anything useful with the error (like returning a fallback value or retrying), catching it just adds noise. Let the framework's global error handler or your API's middleware deal with the logging.

If you absolutely must catch an error to add more context before bubbling it up, use the `cause` property introduced in modern JavaScript:

```ts
async function fetchUserProfile(userId: string) {
  try {
    return await api.get(`/users/${userId}`);
  } catch (error) {
    // We add context, but preserve the original stack trace via `cause`
    throw new Error(`Failed to load profile for user ${userId}`, { cause: error });
  }
}
```

## Opaque Errors vs. Specific Errors

When we learn about advanced error handling, we are tempted to create elaborate error class hierarchies or discriminated unions for every possible failure.

But context matters: **Application code is different from library code.**

When you are writing application code (e.g., a specific screen in your UI or a specific business workflow), you often don't care *what* specifically went wrong at the network layer. Whether it was a DNS failure, a 500 internal server error, or a timeout, the outcome is the same: you show a generic error message to the user. In these cases, **opaque errors are fine**. You don't need to over-engineer error types.

However, if you are writing shared *library* code (like an internal API client or a complex utility), your consumers *do* care. They might need to branch their logic: if the error is a 404, do X; if it's a 401, redirect to login. Here, specific error types and clear contracts are crucial.

## Making Code Easier to Use (Without `Result<T, E>`)

The ultimate goal of error handling is to make your code easier to use for the caller. They shouldn't have to guess if a function will explode.

You don't need a strict `Result` Monad to achieve this. You can incrementally introduce safer patterns that feel native to JavaScript and are easy for any teammate to understand.

### 1. Return `null` or `undefined` for expected absences

If an operation can legitimately fail to find something, that's not an exception. It's an expected outcome.

```ts
// Bad: Throws if user is not found. Caller has to guess and try/catch.
function getUser(id: string): User { ... }

// Good: Clearly communicates that the user might not exist.
function getUser(id: string): User | null { ... }
```

### 2. Simple Discriminated Unions

If an operation can fail in a few distinct, expected ways, you can use a lightweight discriminated union instead of throwing errors. It gives you the benefits of the `Result` pattern without adding external dependencies or scary generic types.

```ts
type UpdateEmailResult = 
  | { success: true }
  | { success: false, reason: "email_taken" | "invalid_format" };

async function updateEmail(userId: string, newEmail: string): Promise<UpdateEmailResult> {
  if (!isValid(newEmail)) return { success: false, reason: "invalid_format" };
  
  const isTaken = await checkEmailInUse(newEmail);
  if (isTaken) return { success: false, reason: "email_taken" };

  await db.updateEmail(userId, newEmail);
  return { success: true };
}
```

When a teammate uses this function, TypeScript forces them to check the `success` property before assuming the operation worked. There are no hidden `throw` statements, no need for `try/catch`, and no new paradigms to learn.

### 3. The Risk of Default Values

When a function fails, a common temptation is to return a default or fallback value so the application doesn't crash. While this can be useful, **ensure the default value makes sense for ALL use cases**.

Never return a generic user-facing string (like `"Error"` or `"Unknown"`) as a default from a lower-level function. If you do, that string will inevitably leak into the UI in unexpected places, confusing users and making the bug harder to track down. If there is no safe default for the domain, it's better to return `null` or let it fail.

### 4. Smart Retries, Not Blind Retries

If an operation is flaky (like a network request), retrying is a great way to handle the error invisibly. However, **retry at the leaves, not at the top level.**

If you implement a generic retry mechanism at a high-level orchestration function, you risk retrying operations that shouldn't be repeated (like non-idempotent POST requests or database writes). Instead, implement retries at the lowest possible level—like right inside the specific API client call—and only when it makes sense for that specific operation.

## When to Actually Throw

By avoiding `throw`, you give the consumer the power to decide what to do. But sometimes, you *want* to make that decision for them. 

If your application relies on a fundamental service (like a database connection string on boot, or a core auth provider being up) and it's missing or down, **just throw**. There is no way to recover gracefully. Crashing early and loudly is much better than limping along in an invalid state. 

## Conclusion

At the end of the day, error handling is not just about your code. It's about your fellow developers, the domain, and most importantly, the business. 

Sometimes, the right way to handle an error isn't a technical decision at all. You won't always have the answer in the codebase. You have to talk to your UX/UI designers and business partners: *What should the user see if the payment fails? Can they retry? Should we send them an email?*

Improving error handling in an existing codebase doesn't mean you have to rewrite everything in a functional style or prepare for every possible scenario. **Don't try to hug the world.** You can't prepare for every possible unexpected error, because by definition, they are unexpected. Focus your energy on handling the *expected* failures gracefully, and rely on global error boundaries and good monitoring to catch the rest.

By applying the Rust philosophy of "handle it now or never," stopping the practice of catching just to log, using native TypeScript features, and knowing when to strategically throw or default, you can drastically improve the predictability of your application. You get all the benefits of robust error handling, keep your codebase readable, and most importantly, you keep your sanity.

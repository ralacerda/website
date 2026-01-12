---
title: "Running TypeScript Natively in Node"
slug: "typescript-native-node"
publishDate: 2026-01-12
draft: false
tags: ["javascript", "typescript", "node"]
description: "How to execute TypeScript files without needing to compile"
lang: "en"
---

Since version 22.18, Node has native TypeScript support, which allows you to run `.ts` files directly without the need for an initial compilation step. This makes TypeScript development faster and simpler.

However, there are some configuration and syntax details that need to be considered.

## Managing Node version

First of all, you need to be using a recent version of Node (22.18 or higher). To avoid problems with other projects running older Node versions, I recommend using a version manager. The [`nvm`](https://github.com/nvm-sh/nvm) project is one of the most popular, but recently I've been using [`fnm`](https://github.com/Schniz/fnm) and really enjoying the experience.

Install a recent version of Node. I recommend installing the LTS version. At the time of writing this article, version 24 is the LTS.

```sh
fnm install 24
# or
nvm install 24
```

::more-info{title="What is the LTS version?"}
LTS stands for "Long Term Support". It's a version of Node that receives security updates and bug fixes for an extended period (typically 30 months). LTS versions are recommended for production projects because they offer stability and predictability, avoiding significant changes that could break your code.
::

## Starting a new project and dependencies

Start by initializing a new project using a package manager. In my case, I use `pnpm`. If you don't have it installed (if you're using a version manager, you might need to install it for each version), you can enable it as follows:

```bash
corepack enable
```

Create a new folder and initialize your project:

```bash
pnpm init
```

Many tools and projects use the `.nvmrc` file to define the Node version of the project. We can create it as follows:

```bash
fnm current > .nvmrc
# Or
nvm current > .nvmrc
```

Install TypeScript and Node types:

```bash
pnpm i -D typescript @types/node@24
```

Since we no longer need to compile the code, installing TypeScript is not mandatory. However, I believe it's a good practice to have a version explicitly installed, mainly so your text editor uses the correct version.

Note that I specifically installed version 24 of `@types/node`. This is because these types represent the types of the Node version the project is running. If you're using a different Node version, don't forget to change this version.

## Running TypeScript files

You can now create a `.ts` file and run it directly:

```ts
// index.ts
console.log("Hello World");
```

```bash
node ./index.ts
# Hello World
```

## How native TypeScript execution works

It's important to note that Node's native TypeScript execution works by replacing TypeScript-specific syntax with whitespace. This means that some TypeScript syntaxes won't be available.

Among the most important are the use of `Enum`, runtime code inside `namespace` (but namespaces with only types can still be used), and `parameter properties`. Additionally, you need to add the `type` keyword when importing types from other files.

```ts
// 🚫 Won't work
enum Direction {
  Up = 1,
  Down,
  Left,
  Right,
}

// 🚫 Won't work
class User {
  constructor(private name: string) {}
}

// 🚫 Won't work
namespace Project {
  export const maxSize = 5;
}

// 🚫 Won't work
// assuming Project is a type
import { Project } from "./project.ts";

// ✅ Works
namespace Project {
  export type Status = "todo" | "done";
}

// ✅ Works
import { type Project } from "./project.ts";
```

::more-info{title="Why not just delete it?"}
Node replaces TypeScript syntax with whitespace instead of simply removing it to keep code lines in the same position. This allows source maps to work correctly. A source map is a file that maps the executed code back to the original code, allowing you to debug your TypeScript code directly in the browser or debugger, even if the running code is different. By preserving the lines, errors and breakpoints appear in the correct locations of your original `.ts` file.
::

## Configuring TypeScript

Node runs TypeScript code using specific configurations. To ensure that the TypeScript Language Server uses the same configurations and avoid inconsistencies between static checking and runtime, it's important to add a configuration file.

Create a file called `tsconfig.json` with the following content:

```json
{
  "compilerOptions": {
    "noEmit": true,
    "target": "esnext",
    "module": "nodenext",
    "rewriteRelativeImportExtensions": true,
    "erasableSyntaxOnly": true,
    "verbatimModuleSyntax": true
  }
}
```

I think it's important to highlight two important configurations: `rewriteRelativeImportExtensions` and `erasableSyntaxOnly`.

The `rewriteRelativeImportExtensions` configuration allows you to import files directly with the `.ts` extension. Without it, you need to use the `.js` extension.

`erasableSyntaxOnly` adds warnings if you try to use TypeScript syntax that cannot be erased (as explained in the previous topic).

## Next steps

To finalize your project, I also recommend adding the following options to make the most of TypeScript checking:

```json
{
  "compilerOptions": {
    "resolveJsonModule": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true

    // ...
    // previous configurations
  }
}
```

Now you can add other project configurations, such as linter and formatter. After that, you can create a repository with this code and use [`giget`](https://github.com/unjs/giget) to create a copy of it whenever you need a new project.

If you want, you can access [my template on my GitHub](https://github.com/ralacerda/typescript-playground-template).

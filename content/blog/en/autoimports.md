---
title: "Why I Stopped Using Auto-imports"
slug: "autoimports"
publishDate: 2025-11-11
draft: false
tags: ["javascript", "Typescript"]
description: "Why the disadvantages of using auto-imports in projects outweigh the advantages"
lang: "en"
---

Nuxt 3 includes auto-imports by default. Initially, this was one of my favorite features.
By default, all Nuxt, Nitro, and Vue components and functions are automatically imported. Additionally, components
inside the `components` folder, and exports inside the composables and utils folders. I found this feature so good
that I also started using it in Vite projects, with the `unplugin-auto-import` and `unplugin-vue-components` plugins.

I always saw two major advantages: files without a large block of imports and speed of development.
Now, instead of having to stop to deal with import errors, I could simply write as if
all symbols were globally available. Using auto-import became a standard in my projects.

However, after my team started using this pattern in a work project,
I started to notice some disadvantages, and today I consider that these outweigh the possible gains.

## The fuel for the magic

I think it's important to understand how auto-imports work to make the source of some disadvantages clearer.

In simplified terms, auto-import works as follows: a process reads your
code files and automatically generates a `.d.ts` file (Typescript definitions file).
This file maps each symbol (functions, components, etc.) to its source file,
making them available as if they were global through a Typescript interface.

In my blog project, here's a chunk of the `component.d.ts` file:
```ts
interface _GlobalComponents {
    'AboutBio': typeof import("../app/components/About/Bio.vue")['default']
    'AboutBioCard': typeof import("../app/components/About/BioCard.vue")['default']
    'AboutSkills': typeof import("../app/components/About/Skills.vue")['default']
    'BlogPostContent': typeof import("../app/components/Blog/PostContent.vue")['default']
    'BlogPostDate': typeof import("../app/components/Blog/PostDate.vue")['default']
    'BlogPostList': typeof import("../app/components/Blog/PostList.vue")['default']
    /// ....
}
```

However, for this to happen while you're editing, this process needs to be running.
Usually this process is tied to the dev server, which also monitors the files to
update the definitions when they change.

This was a source of a ton of problem for me. For example, when the watching process doesn't track a file
that was created. Another possible problem is that when a file is deleted, its definition doesn't always leave
the definition file, which can cause a problem if any file is using a definition from that file, because
for Typescript, that symbol still exists and is available.

I understand these are bugs, and it's probably not the expected behavior. However, now we have
a new "layer" we depend on. Even if these bugs are fixed, we still have the possibility
of other bugs appearing, and one way or another, it's still another complexity the team needs to learn
to deal with.

## Unknown origin

Auto-import transforms the explicit mapping of `import` statements into a `.d.ts` file,
making the relationship completely implicit. This generate several different types of problems.

Every project depends on different packages, and every project has different types of code, and understanding
how these codes interact is fundamental for you to understand and contribute to the project. However,
auto-import completely blurs the line between packages, dependencies, and domains.

When you look at a component or function being used, there's no longer any visual clue of where it comes from.
This function could be from `Vue`, from `Nuxt`, from `Nitro`, it could be from another package that has auto-imports (in case
of a `Nuxt` module), it could be in the `composables` folder, it could be in the `utils` folder. Even if it only takes
5 seconds to search for the function name and find where it's defined, you've already made
understanding the code more difficult.

Even for VSCode this becomes a problem. When you try to rename a symbol, or click to navigate to the source
file, often the editor can't resolve correctly due to the implicit nature of auto-imports.
There's even an extension that fixes the problem of navigating to the file where the symbol is defined,
but again, we're adding another layer of complexity
to solve problems created by auto-import.

I generally don't like to focus much on AI experience instead of developer experience, but this is a
case where both are affected. AI tools depend heavily on the visible context
in the file. Without explicit imports, they lose important information about dependencies and the code domain,
resulting in less accurate suggestions or ones that simply don't work.

Another possible problem is eslint rules for specific symbols from a package. For example,
the `vue/no-ref-as-operand` rule prevents a common Vue error that's hard to detect:
```ts
const isOpen = ref(false);

if (isOpen) {
  // do something
}
```

The problem is that `isOpen` is a `Ref`, and therefore always `truthy`. What we really want
to check is the `value`.
```ts
const isOpen = ref(false);

if (isOpen.value) {
  // do something
}
```

However, if `ref` is auto-imported, eslint can't realize that this `ref` comes from Vue, and that
therefore, it should apply the rule.

This can be worked around using type-aware linting, which makes ESLint consult Typescript to understand
dependencies. But it's hard to configure correctly, and since it depends on Typescript, it increases linting time[^1].

[^1]: But I have hopes that with `Oxlint` and `tsgo` this process will be much faster and easier to configure: https://github.com/oxc-project/tsgolint

## File and folder patterns

I really like the concept of "Pit of Success", which in summary, is the idea
that your tool should make it easy for the user to do the right thing. The analogy is that
it's easier to keep a stone inside a pit than on top of a hill.
Using auto-import is often balancing a stone on top of a hill.

When all exports from a file are globally available, it's very easy
to create functions with duplicate names, especially inside the `utils` folder.

Besides the risk of duplicate names, it's very easy to end up creating a file for
each function, generating a giant and confusing `utils` folder, instead of a folder with files
that clearly define the domain of each function. Without the need to think about imports, there's
no incentive to organize things coherently.

For example, it's common to see a structure like this:
```
utils/
├── formatDate.ts
├── parseDate.ts
├── isWeekend.ts
├── addDays.ts
├── formatCurrency.ts
├── parseCurrency.ts
├── validateEmail.ts
├── validatePhone.ts
└── ... (50+ more files)
```

When ideally it would be something like:
```
utils/
├── datetime.ts       // formatDate, parseDate, isWeekend, addDays
├── currency.ts       // formatCurrency, parseCurrency
└── validation.ts     // validateEmail, validatePhone
```

For composables, the recommended pattern is to export only the composable with the same name as the file.
Something easy to follow in theory, but also easy to get wrong in practice.

Additionally, it's very easy to end up importing things that wouldn't be necessary. This can happen
for several reasons: the developer didn't know that function or component is globally available,
the process of generating the import mapping isn't running and the developer wrote the import manually
to avoid Typescript errors, or because the text editor or AI automatically added the import.
The result is files where some things are imported automatically, and others explicitly,
without a clear pattern. It's an inconsistency that spreads throughout the entire project.

Having to constantly check these patterns and fight against the tools means
there's always an additional cost in keeping your code within the desired standards. Instead of
the tool working in your favor, it's creating more work.

## And the advantages?

I now believe the advantages aren't even as good as I initially thought.

The main advantage that attracted me at the beginning was writing speed,
but nowadays, editor auto-imports are so good that this advantage has practically disappeared.
Editors can add imports automatically after an autocomplete, and with `code actions`
it's easy to add an import without having to leave the region you're editing.

Another advantage was having "cleaner" files, without a large block of imports at the top. But over time,
I've completely changed my opinion about this. Now I prefer to see what's being imported in the file,
because the dependency relationships and responsibilities within that file become clear.
And honestly, you start to ignore the import block after a while.

## Conclusion

In small projects, I would continue using auto-imports for components, but with a very
specific folder pattern. Due to how components are defined, it's quite easy to understand where
they're coming from.

In all other cases, I don't believe the disadvantages and the new layers of complexity justify
the advantages.

This conclusion isn't just mine. After [discussions](https://github.com/nuxt/nuxt/issues/29923) about it,
projects like Nitro are [relying less on auto-imports](https://github.com/nitrojs/nitro/issues/2232).

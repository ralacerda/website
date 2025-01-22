It's common to completely forget which books you've read when someone asks for reading suggestions. To solve this problem, I started a website project featuring books I recommend, have read, or am currently reading. To host information about each book, such as title, authors' names, publisher, release year, and cover image, I used **Contentful**, a content management system (CMS).

To keep the site always up to date, I used **Next.js** 13, a **React** framework. With Server Side Rendering strategy, the site is built on the server at each visit, resulting in an always updated website.

Since the site deals with external information, I used **Zod** to validate API call results and **TypeScript** to ensure the content model matched the code. This allowed me to be confident when I needed to modify the content model or refactor my code.

The result is a fast, always up-to-date, and easy-to-maintain website. To add a new book, I just need to use the **CMS**, without having to edit code or build the site locally. With this approach, the project becomes robust and reliable for future updates.

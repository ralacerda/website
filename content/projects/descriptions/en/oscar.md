This project aimed to create an easy way to display Oscar-nominated and winning films for each year. In addition to an overview of all nominated films in a given year, there is also a dedicated page for each award category.

The first challenge of the project was collecting information about each nominated film. I wrote a **NodeJS** script to organize the films from a list of nominees, access a **REST API** and a database (**MongoDB**) and cross-reference each film's information.

With **Astro** and **Typescript**, it was possible to overcome the next challenge: creating a page for each category of each year. With the same tools, it was possible to handle another challenge: the cards with information about each film. The result was a component that adapts to the context, showing the name of the nominated film or person, a trophy icon for winners, and a list of other nominations.

The site design was implemented using **Sass** and **PicoCSS**. On smaller screens, the text size is adapted and the cards change layout to better use the space.

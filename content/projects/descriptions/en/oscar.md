This project aimed to create an easy way to showcase the Oscar nominated and winning films from each year.

In addition to an overview of all nominated films for a given year and dedicated pages for each award category, it's possible to access information about each film, including the main cast, director and screenwriter information, and a list of streaming services where the film is available in Brazil.

The project uses a backend created with **Nuxt** to consume the **TMDb** API. The collected data is saved in a **SQLite** database, which is queried using **Drizzle**.
The site features responsive design that adapts to screens of different sizes, using modern **HTML** and **CSS**, and **Vue** as the framework.

The site is hosted on a virtual machine, running a **Docker** container. The entire deployment process is automated using **GitHub Actions**.
Este projeto buscou criar uma forma fácil de mostrar os filmes indicados e vencedores do Oscar de cada ano. 

Além de uma visão geral de todos os filmes indicados naquele determinado ano e da página dedicada para cada categoria de premiação, é possível acessar as informações de cada filme, com o elenco principal, informações de diretos e roteristas, e uma lista de serviços de streaming em que o filme está disponível no Brasil.

O projeto utiliza um backend criado pelo **Nuxt** para consumir a API do **TMDb**. Os dados coletados são salvos em um banco de dados **SQLite**,
que é consultado utilizando o **Drizzle**. 
O site possui design responsível, que se adapta a telas de diferentes tamanhos, utilizando **HTML** e **CSS** moderno, e **Vue** como framework. 

O site está hospeadado em uma máquina virtual, rodando um container **Docker**. Todo o processo de deploy é automatizado utilizando **Github Actions**. 
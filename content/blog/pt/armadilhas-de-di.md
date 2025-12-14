Armadilhas:

- Não significa que não vai ter decisões a serem tomadas. Por exemplo, runtime vs env time
- Abstração demais:
  Exemplo do email. Por exemplo, para cada template, você vai ter dados. Você precisa reproduzir isso
  Existe alguns tricks para lidar com isso e facilitar sua vida, por exemplo, utilizando aquele serviço como
  default e pegando o tipo "baseado" na implementação padrão. A vantagem de trocar pode ganhar a vantagem
  de mentar multiplas implementações ao mesmo tempo.
- Muitos serviços dependende de outro, gerando o problema do "Quero a banana vem toda a floresta junto"
  Utilize serviços padrões
  Tente outras estratégias, como "injeção de parâmetro" ou "hollywoord pattern"
- DI é um pouco "infectante". A partir do momento que você injeta algo, se tem uma lógica
  para fazer esse algo, é melhor você já injetar. Isso significa que você vai fazer o mais tarde possível
- Se você tiver um main com MUITA COISA, você talvez precise começar a utilizar uma biblioteca,
  para conseguir criar esse contexto grande
- As vezes é muito difícil replicar um serviço, por exemplo, algo como o Drizzle, nesse caso,
  faz mais serviço você criar uma outra implementação do serviço que consome o drizzle, do que
  fazer uma implementação teste do Drizzle

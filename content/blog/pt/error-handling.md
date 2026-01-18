---
title: "Utilizando o padrão Result para lidar com erros"
slug: "err-as-values"
publishDate: 2026-01-18
draft: true
tags: ["javascript", "typescript", "error-handling"]
description: ""
lang: "pt"
---

O uso de `try/catch` é o padrão mais comum para lidar com erros no Javascript.
Entretanto, essa abordagem possuí algumas disvantagens. Não existe uma forma de verificar
se uma função possívelmente faz um `throw`. Também não é possível verificar
quais os erros que o `catch` vai receber. Isso tudo favorece um código que geralmente
inclui grandes blocos de `try/catch`, onde multiplos erros são tratados de forma igual,
e muitas informações são perdidas.

```ts

// Exemplo com Fetch mostrando que geralmente fazemos um grande try/catch
// mas três erros diferentes podem acontecer:
// Um throw DO FETCH
// Um throw de um resultado NOT OKAY
// Um throw do parse do body
// Muito é perdido.
```

::more-info={title="Porque o erro do catch é sempre `unknown`"}
::

Uma alternativa possível é o padrão de utilizar Erro como valor. Essa abordagem
é utilizada em algumas linguagens como Go, Rust e recentemente Kotlin. A ideia é
funções retornam os erros como valores, deixando claro para o consumidor daquela função
quais são os possíveis erros.

Esse padrão pode ser simulado no typescript com o tipo Result:

```ts
type Result<T, E> = {
  ok: true,
  value: T
} | {
  ok: false,
  error: E
}
```

O tipo Result representa a resposta de uma função sobre dois genêricos, o `T`, que representa 
os dados retornados, e `E` que representa um erro. Além disso, possui uma propriedade discrmininatórioa `ok`, que
indica de que se trata de um erro ou de um sucesso.

```ts
// Exemplo de uma função de fetch que retorna um `Result`
// Depois exemplo de alguem utilizando essa função
```

O objetivo não é eliminar completamente o uso do `throw/catch`, mas sim reservalo para situações de falha extrema, situações
em que a execução deve ser parada imediatamente. Por exemplo ..., ..., ... Em outras linguagens, esse comportamento 
é realizado através do `panic`.

Exemplos de outras linguagens utilizando Panic e Result.

Assim, temos uma separação entre erros esperados (..., ..., ...) e erros não esperados (crashes, ..., ..., ...).
Além disso, podemos adicionar metadados aos erros esperados, que facilitam debugação e observabilidade do sistema.

Nesse artigo, eu gostaria de mostrar uma abordagem de error handling utilizando a biblioteca `Typescript Result`,
e discutir três padrões distintos para melhorar tratar erros nas suas aplicações.

::more-info{title="porque os erros possuem a propriedade `_tag`?"}

Typescript possue verificação estrutural, o que significa que, para fins de verificação, 
os seguintes erros são os mesmos:

```ts
// class A
// ....
// class B
// ....
```

Em alguns casos, o Typescript pode "colapsar" os tipos em um só, quando na verdade eles
possuem significados semânticos diferentes. Você pode ler mais sobre a verificaçõa estrutural do
typescript no meu artigo: ....

Além disso, ter uma propriedade como `_tag` facilita a distinção dos erros em runtime,
evitando o uso de `instanceof`, que pode gerar problemas de ....
::

## Criando um Result

Antes de poder consumir um Result, nos precisamos adaptar nossas funções para gerar um Result.
O `Typescript Result` expõe algumas APIs para isso.

`Result.ok` e `Result.error` geram, respectivamente, um resultado de uma operação bem sucedida e um resultado que um erro.

```ts
// Dois erros: Porcentagem maior que zero,
// porcentagem negativa 

function calculateDiscountPercentage(amount: number) {
  if (amount <= 0) {
    return Result.error()
  }
  if (amount > 100) {
   return Result.error() 
  }
  const finalValue = ...
  return Result.ok(finalValue)
}

const result = calculateDiscountPercentage(30);
     //^? 
```

::note
Você pode explicitamente definir o returno como Result<>,
... (explicar como fazer isso, e que não é estritamente necessário),
mas é boas práticas se você está fazendo uma função
que vai ser usados por outros.
::

Para facilitar a geração de Results a partir de funções que podem fazer um `throw`,
você pode utilizar o `try` ou `wrap`.

```ts
// Exemplo de `try`, que executa a função na hora e retorna um Result
// E o `wrap` que devolve uma função que retorna um result

// Ambas podem receber um segundo argumento que transforma o erro
// Bom para mapear para nossos erros com _tag
```

## Tratando erros como Go

Agora, quando utilizamos uma função que retorna um erro, precisamos
verificar se não temos um erro. Podemos tomar uma decisão com o 
que fazer com aquele erro, ou repassar ele para cima:

```ts
// Exemplo de uma função que retorna um Result
// e faz várias operações
// Para a maioria dos erros, ele transforma em um outro erro
// e "joga" pra cima
```

Esse padrão é muito semelhante ao padrão utilizado em Go,
onde funções, por convenção, retornam sempre um possível resultado
e um possível erro:

```go
// exemplo de codigo em go que verifica sempre se err é nil
```

Uma das vantagens dessa abordagem é que ela é extremamente simples
de entender, mesmo se alguém nao estiver familhiarizado com essa biblioteca ou padrão. Ele
deixa explícito os pontos de tomada de decisão.

Entretanto, um problema é a verbosidade. Por exemplo, um erro precisa `bubble up` (pensar em tradução
para esse termo) até atingir a camada adequada que vai lidar com ele. 

## Tratando erros como Haskell

E se, em vez de verificar o conteúdo de um Result, a gente tivesse um método que aplicasse
uma função no Result somente se ele fosse um sucesso, retornando o result imediamente se
ele na verdade for um erro?

Toda instância de `Result` possui alguns métodos que permitem trabalhar com o conteúdo de um Result

O `map()` aplica uma função somente se o resultado corresponder com um sucesso (que pode retornar um valor, ou até mesmo um outro Result),
enquanto que o `mapError()` aplica a função somente se o resultado for um erro:

```ts
// Exemplo utilizando .map()
```

Se você deseja observar o valor sem modificá-lo (efeitos colaterais), pode utilizar os métodos `onSuccess` ou `onFailure`.
Um uso comum é para adicionar observabilidade e logs:

```ts
// EXEMPLOS 
// mostrando um login
// e dai um erro se o login não deu certo
// e um debug se deu certo, registrando o momento
```


Esse padrão também é chamado de Rails Development, porque temos duas "trilhas", a de sucesso e de falha,
e aplicamos funções em trilhas diferentes. O caminho comum é seguir tratando as trilhas separadamente,
escrevendo funções que direcionam para a trilha de erro. 

<!-- Imagem ou ilustração mostrando Rails Development -->

Entretanto, em alguns casos, você pode
querer fazer o caminho inverso, uma função que, baseada em um erro, tenta retornar um sucesso. Para esse
caso, temos a função `.recover`

```ts
// Exemplo que mostra o .recover,
// por exemplo, em uma falha de API,
// podemos nos recuperar e utilizar outra
```

Esse é um padrão utilizado na programação funcional, tratando o Result como um `monad`.
Esse padrão é semelhante ao uso de `pipelines`, e deixa explícita as etapas. Entretanto,
ele foge do formato típico de funções do Javascript/Typescript. Ele também pode
causar problemas de readabilidade. Praticamente todas as lógicas precisam
estar implemetadas em funções.

```haskell
// Código em Haskell que utiliza Result como Monad
```

## Tratando erros como Rust

O `Result` também fornece uma outra forma de gerar um Result, com um generator:

```ts
// Exemplo de Generator
```

::more-info{title="Entendendo generators e yield*"}

Generators permitem uma forma de inversão de controle, onde o fluxo de uma função é controlado
de forma externa. 

Eles são geralmente utilizados para ...

No momento que um o `generator` é consumido, também é póssível retornar um valor.
Dessa forma o `yield` ....

O `yield*` permite que generators passem o controle para outros generators internos.
::

Generators é um conceito complexo, mas você não precisa entender em detalhes como
essas funções funcionam. O importante é que, dentro do corpo de um generator,
 quando fazemos um `yield*` de um Result, é verificado o resultado. Em caso de um erro, a execução
 para imediatamente, e `gen()` retorna o erro. Em caso de sucesso, a execução continua, recebendo
 o valor como Resultado (note que não recebemos um Result de volta, mas já recebemos um valor direto)

Inicialmente, pode parecer confuso e difícil de entender essa syntaxe, mas ele é bem
semelhante ao padrão de `async/await`, onde "esperamos" a execução de uma função
e recebemos o seu resultado.

```ts
// Exemplo de código utilizando generator
// Exemplo de código utilizando asyn/await e como eles são semelhantes
```

Esse padrão se aproxima com o uso do `?` no Rust, que atua de forma semelhante, "extraindo" o valor
do Result ou retornando a função imeditamente com um erro.

## Chegando ao um resultado final

Independente se você vai verificar cada Result individualmente, utilizar chains com `.map()` ou utilizar `.gen()`,
você geralmente vai chegar em um ponto onde o seu Result vai alcançar uma última camada, onde um valor deve ser gerado
ou um erro deve ser retornado.

O Result possui algums métodos "getters" para quando você precisa gerar um valor, independendo do erro:

Os principais são `getOrDefault()`, que retorna um valor default no caso de um erro e `getOrElse()`, que executa
uma função de callback para adquirir o valor que deve ser retornado no caso de um erro.

```ts
// Exemplos mostrando o uso de cada
```

Entretanto, em alguns casos, precisamos lidar com cada erro de forma diferente. Para isso, Results que são falhas
possuem um método chamado `.match()`.

```ts
// Exemplo do uso do .match
```

Graças ao Typescript, o `.match()` permite verificar que todos os erros são tratados, o que
resultaria em erros de Typescript no caso de você fazer uma modifica que adiciona um novo tipo de erro,
mas que não foi tratado.

Além disso, você pode utilizar o `.else()` para lidar com todos os outros erros da mesma forma.

```ts
// Outros tipos de erros
```

::note
O `.match()` funciona somente em falhas, é necessário verificar o valor de `.ok` antes. 
::

## Conclusão

Mesmo que você não utilize especificamente a biblioteca `Typescript Result` ou o padrão Result,
eu acredito que é importante você estar ciente dessas formas de tratar erros, e parar para pensar
em como você está lidando com erros na sua aplicação.

Se você tem interesse, eu recomendo ler a documentação do `Typescript Result`, que possue
outros métodos e informações de como melhor utilizar a bibliteca.

Além disso, você pode explorar outras bibliotecas `neverthrow` e `fp-ts`. A biblioteca `Effect` vai além, 
gerando um framework e ecosistemas em volta do conceito de `Effect`, uma função que recebe um contexto e retorna
um `Result`.



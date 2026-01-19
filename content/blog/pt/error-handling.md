---
title: "Utilizando o padrão Result para lidar com erros"
slug: "err-handling"
publishDate: 2026-01-18
draft: true
tags: ["javascript", "typescript", "error-handling"]
description: "Como substituir o uso de blocos try/catch"
lang: "pt"
---

O uso de `try/catch` é o padrão mais comum para lidar com erros no Javascript.
Entretanto, essa abordagem possui algumas desvantagens. Não existe uma forma de verificar
se uma função possivelmente faz um `throw`. Também não é possível verificar
quais os erros que o `catch` vai receber. Isso tudo favorece um código que geralmente
inclui grandes blocos de `try/catch`, onde multiplos erros são tratados de forma igual,
e muitas informações são perdidas.

```ts
async function getUser(id: string) {
  try {
    const response = await fetch(`/api/users/${id}`);

    if (!response.ok) {
      // Erro 1: A resposta HTTP indica falha (ex: 404, 500)
      throw new Error(`Request failed: ${response.status}`);
    }

    // Erro 2: O corpo da resposta não é um JSON válido
    const data = await response.json();
    return data;
  } catch (error) {
    // Erro 3: Erro de rede (ex: DNS falhou, sem internet)

    // Aqui, 'error' mistura os três cenários acima.
    // É difícil saber programaticamente qual falha ocorreu e como reagir
    // especificamente a cada uma delas sem muita verificação de tipos.
    console.error("Failed to fetch user", error);
  }
}
```

::more-info
#title
Por que o erro do catch é sempre `unknown`?

#content
No JavaScript, o `throw` permite lançar qualquer tipo de valor, não apenas `Error`. É perfeitamente válido escrever `throw "deu ruim"`, `throw 404`, ou até mesmo `throw null`.

Devido a essa flexibilidade, o TypeScript adota uma postura segura e tipa a variável de erro no bloco `catch` como `unknown`. Isso força o desenvolvedor a verificar o tipo do erro (usando `typeof` ou `instanceof`) antes de tentar acessar propriedades como `.message` ou `.stack`, garantindo que o valor existe e é do tipo esperado.
::

Uma alternativa possível é o padrão de utilizar Erro como valor. Essa abordagem
é utilizada em algumas linguagens como Go, Rust e recentemente Kotlin. A ideia é
que as funções retornem os erros como valores, deixando claro para o consumidor daquela função
quais são os possíveis erros.

Esse padrão pode ser simulado no typescript com o tipo Result:

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

O tipo Result representa a resposta de uma função sobre dois genéricos, o `T`, que representa
os dados retornados, e `E` que representa um erro. Além disso, possui uma propriedade discriminatória `ok`, que
indica de que se trata de um erro ou de um sucesso.

```ts
// Definindo os possíveis erros
type NetworkError = { _tag: "NetworkError"; message: string };
type NotFoundError = { _tag: "NotFoundError"; userId: string };
type ParseError = { _tag: "ParseError"; message: string };

type FetchUserError = NetworkError | NotFoundError | ParseError;

// Função que retorna Result
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
  } catch (error) {
    return {
      ok: false,
      error: {
        _tag: "ParseError",
        message: "Failed to parse response",
      },
    };
  }
}

// Consumindo a função
const userResult = await fetchUser("123");

if (userResult.ok) {
  console.log("User found:", userResult.value);
  // TypeScript sabe que userResult.value é do tipo User
} else {
  // TypeScript sabe que userResult.error é FetchUserError
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

O objetivo não é eliminar completamente o uso do `throw/catch`,
mas sim reservá-lo para situações de falha extrema, situações
em que a execução deve ser parada imediatamente.
Por exemplo, quando uma variável de ambiente obrigatória não está presente na inicialização,
ou quando a conexão com o banco de dados falha irremediavelmente durante o boot.

Assim, temos uma separação entre erros esperados
(usuário não encontrado, saldo insuficiente, falha de validação) e erros não esperados
(estouro de memória, erros de sintaxe SQL).
Além disso, podemos adicionar metadados aos erros esperados, que facilitam debugação e observabilidade do sistema.

Nesse artigo, eu gostaria de mostrar uma abordagem de error handling utilizando a biblioteca [`typescript-result`](https://www.typescript-result.dev/),
e discutir três padrões distintos para tratar melhor os erros nas suas aplicações.

::more-info
#title
Por que os erros possuem a propriedade `_tag`?

#content
Typescript possui verificação estrutural, o que significa que, para fins de verificação,
os seguintes erros são os mesmos:

```ts
class ValidationError {
  constructor(public message: string) {}
}

class DatabaseError {
  constructor(public message: string) {}
}

// TypeScript considera esses tipos compatíveis!
const error1: ValidationError = new DatabaseError("Connection failed");
const error2: DatabaseError = new ValidationError("Invalid input");
```

Em alguns casos, o Typescript pode "colapsar" os tipos em um só, quando na verdade eles
possuem significados semânticos diferentes. Você pode ler mais sobre a verificação estrutural do
typescript no meu artigo: [Entendendo Structural Typing no TypeScript](/blog/typescript-checking).

Além disso, ter uma propriedade como `_tag` facilita a distinção dos erros em runtime,
evitando o uso de `instanceof`. Em aplicações modernas (grandes monorepos, micro-frontends ou quando há dependências npm duplicadas), o `instanceof` pode falhar. Isso acontece porque a classe `Error` instanciada pode vir de um contexto ou bundle diferente da classe que você está usando para a comparação (`CatchError !== ThrowError`), mesmo que elas tenham o mesmo nome e código. Uma string literal (`_tag`) é imune a esse problema.
::

## Criando um Result

Antes de poder consumir um Result, nós precisamos adaptar nossas funções para gerar um Result.
O `typescript-result` expõe algumas APIs para isso.

`Result.ok` e `Result.error` geram, respectivamente, um resultado de uma operação bem sucedida e um resultado de um erro.

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

  const finalValue = amount * 0.9; // 10% de desconto
  return Result.ok(finalValue);
}

const result = calculateDiscountPercentage(30);
// result: Result<number, DiscountError>
```

::note
Você pode explicitamente definir o retorno como `Result<number, DomainError>`, por exemplo.
Apesar do TypeScript inferir os tipos automaticamente, definir o retorno explicitamente é considerado uma boa prática se você está criando uma função pública (biblioteca ou API), pois garante que o contrato da função seja respeitado e evita que tipos internos "vazem" acidentalmente.
::

Para facilitar a geração de Results a partir de funções que podem fazer um `throw`,
você pode utilizar o `try` ou `wrap`.

```ts
import { Result } from "typescript-result";

// Result.try executa a função imediatamente e captura exceções
const parseResult = Result.try(() => JSON.parse(jsonString));
// parseResult: Result<any, Error>

// Com transformação de erro
const parseWithTag = Result.try(
  () => JSON.parse(jsonString),
  (error) => ({ _tag: "ParseError" as const, message: String(error) }),
);
// parseWithTag: Result<any, { _tag: "ParseError", message: string }>

// Result.wrap retorna uma nova função que sempre retorna Result
const safeJSONParse = Result.wrap(JSON.parse);
const result1 = safeJSONParse('{"valid": true}');
const result2 = safeJSONParse("invalid json");
// Ambos: Result<any, Error>

// wrap com transformação de erro customizada
const safeFetch = Result.wrap(fetch, (error) => ({
  _tag: "NetworkError" as const,
  message: String(error),
}));
// Agora fetch sempre retorna Result com erro tipado
```

Essas funções utilitárias são fundamentais quando precisamos interagir com bibliotecas externas ou código legado que não utilizam o padrão Result. Elas funcionam como uma barreira de proteção nas bordas da sua aplicação, encapsulando exceções imprevisíveis e trazendo-as para dentro do fluxo controlado e tipado do Result.

Até agora, vimos exemplos que retornam `Promise<Result<T, E>>`. Entretanto, a biblioteca `typescript-result` fornece um tipo especializado chamado `AsyncResult<T, E>`, que é essencialmente um alias para `Promise<Result<T, E>>`.

```ts
// Ao invés de Promise<Result<T, E>>
async function fetchUser(id: string): AsyncResult<User, FetchUserError> {
  // Mesma implementação
}
```

## Verificação Manual de Erros

Agora, quando utilizamos uma função que retorna um erro, precisamos
verificar se não temos um erro. Podemos tomar uma decisão com o
que fazer com aquele erro, ou repassar ele para cima:

```ts
type ValidationError = { _tag: "ValidationError"; field: string };
type DatabaseError = { _tag: "DatabaseError"; message: string };
type NotFoundError = { _tag: "NotFoundError"; id: string };

async function processOrder(
  orderId: string,
): AsyncResult<Order, ValidationError | DatabaseError | NotFoundError> {
  // Buscar o pedido
  const orderResult = await fetchOrder(orderId);
  if (!orderResult.ok) {
    // Propaga o erro para cima
    return orderResult;
  }
  const order = orderResult.value;

  // Validar o pedido
  const validationResult = validateOrder(order);
  if (!validationResult.ok) {
    // Trata erro específico ou propaga
    if (validationResult.error._tag === "ValidationError") {
      console.error(`Validation failed: ${validationResult.error.field}`);
    }
    return validationResult;
  }

  // Salvar no banco
  const saveResult = await saveToDatabase(order);
  if (!saveResult.ok) {
    // Propaga erro de banco de dados
    return saveResult;
  }

  // Sucesso! Retorna o pedido processado
  return Result.ok(saveResult.value);
}
```

Esse padrão é muito semelhante ao padrão utilizado em Go,
onde funções, por convenção, retornam sempre um possível resultado
e um possível erro:

```go
func processOrder(orderId string) (*Order, error) {
    // Buscar o pedido
    order, err := fetchOrder(orderId)
    if err != nil {
        // Propaga o erro para cima
        return nil, err
    }

    // Validar o pedido
    err = validateOrder(order)
    if err != nil {
        // Trata erro específico ou propaga
        log.Printf("Validation failed: %v", err)
        return nil, err
    }

    // Salvar no banco
    savedOrder, err := saveToDatabase(order)
    if err != nil {
        // Propaga erro de banco de dados
        return nil, err
    }

    // Sucesso! Retorna o pedido processado
    return savedOrder, nil
}
```

Uma das vantagens dessa abordagem é que ela é extremamente simples
de entender, mesmo se alguém não estiver familiarizado com essa biblioteca ou padrão. Ele
deixa explícito os pontos de tomada de decisão.

Entretanto, um problema é a verbosidade. Por exemplo, um erro precisa se propagar (_bubble up_) até atingir a camada adequada que vai lidar com ele.

## Encadeando operações (Chaining)

E se, em vez de verificar o conteúdo de um Result, a gente tivesse um método que aplicasse
uma função no Result somente se ele fosse um sucesso, retornando o result imediatamente se
ele na verdade for um erro?

Toda instância de `Result` possui alguns métodos que permitem trabalhar com o conteúdo de um Result,
sem a necessidade de verificar seu conteúdo.

O `.map()` aplica uma função somente se o resultado corresponder com um sucesso (que pode retornar um valor, ou até mesmo um outro Result), enquanto que o `.mapError()` aplica a função somente se o resultado for um erro. Note que essas funções retornam outro `Result`,
o que possibilita encadear multiplas chamadas.

```ts
async function getUserEmail(
  userId: string,
): AsyncResult<string, FetchUserError> {
  return fetchUser(userId)
    .map((user) => user.email) // Só executa se fetchUser retornar sucesso
    .map((email) => email.toLowerCase()); // Encadeia transformações
}

// Exemplo com mapError - normalizando erros
async function processUserData(userId: string): AsyncResult<User, AppError> {
  return fetchUser(userId).mapError((error) => {
    // Transforma erros específicos em erro genérico da aplicação
    switch (error._tag) {
      case "NetworkError":
        return { _tag: "AppError" as const, message: "Serviço indisponível" };
      case "NotFoundError":
        return { _tag: "AppError" as const, message: "Usuário não encontrado" };
      case "ParseError":
        return { _tag: "AppError" as const, message: "Dados inválidos" };
    }
  });
}

// Ambos podem ser encadeados
const result = await fetchUser("123")
  .map((user) => ({ ...user, isActive: true }))
  .mapError((error) => ({ ...error, timestamp: Date.now() }));
```

Se você deseja observar o valor sem modificá-lo (efeitos colaterais), pode utilizar os métodos `onSuccess` ou `onFailure`.
Um uso comum é para adicionar observabilidade e logs:

```ts
type LoginError =
  | { _tag: "InvalidCredentials" }
  | { _tag: "AccountLocked"; reason: string }
  | { _tag: "NetworkError"; message: string };

async function loginUser(
  email: string,
  password: string,
): AsyncResult<User, LoginError> {
  return authenticateUser(email, password)
    .onSuccess((user) => {
      // Side-effect: Log de sucesso
      console.log(
        `Login bem-sucedido para ${user.email} às ${new Date().toISOString()}`,
      );
      // Poderia enviar para serviço de analytics
      analytics.track("user_login", { userId: user.id, timestamp: Date.now() });
    })
    .onFailure((error) => {
      // Side-effect: Log de erro
      console.error(`Falha no login: ${error._tag}`);

      if (error._tag === "InvalidCredentials") {
        console.warn(`Tentativa de login com credenciais inválidas`);
      } else if (error._tag === "AccountLocked") {
        console.error(`Conta bloqueada: ${error.reason}`);
      }
    });
}

// O valor original do Result não é alterado, apenas observado
const result = await loginUser("user@example.com", "password");
// result continua sendo Result<User, LoginError>
```

Esse padrão também é conhecido como **Railway Oriented Programming (ROP)**, porque temos duas "trilhas", a de sucesso e de falha, e aplicamos funções em trilhas diferentes. O caminho comum é focar na trilha do sucesso (happy path), direcionando para a outra trilha quando encontramos um erro.

Entretanto, em alguns casos, você pode
querer fazer o caminho inverso, uma função que, baseada em um erro, tenta "voltar" para a trilha de sucessos. Para esse
caso, temos a função `.recover()`

```ts
type ApiError = { _tag: "PrimaryApiDown" } | { _tag: "SecondaryApiDown" };

// Funções que fazem requisições para diferentes APIs
async function fetchFromPrimaryApi(id: string): AsyncResult<Data, ApiError> {
  // ...
}

async function fetchFromSecondaryApi(id: string): AsyncResult<Data, ApiError> {
  // ...
}

// Usando .recover para fallback entre APIs
async function fetchDataWithFallback(id: string): AsyncResult<Data, ApiError> {
  return fetchFromPrimaryApi(id).recover(() => fetchFromSecondaryApi(id));
}
```

Esse padrão de encadeamento (chaining) é muito comum na programação funcional, tratando o Result como um `monad`.
Esse padrão é semelhante ao uso de `pipelines`, e deixa explícita as etapas. Em Rust, existe um padrão muito semelhante:

```rust
fn process_user_data(id: &str) -> Result<String, AppError> {
    fetch_user(id)
        .map(|user| user.email)
        .map(|email| email.to_lowercase())
        .map_err(|err| AppError::from(err))
}
```

Entretanto,
ele pode fugir do formato típico de funções do Javascript/Typescript. Ele também pode
causar problemas de readabilidade quando todas as lógicas precisam estar implementadas em funções.

## Usando Generators

O `Result` também fornece uma outra forma de gerar um Result, com um generator:

```ts
// Exemplo simples com Result.gen()
function calculateTotal(items: Item[]): Result<number, ValidationError> {
  return Result.gen(function* () {
    // Valida cada item e extrai seu valor
    const validatedItems = yield* validateItems(items);
    const subtotal = yield* calculateSubtotal(validatedItems);
    const discount = yield* applyDiscount(subtotal);

    return subtotal - discount;
  });
}
```

Uma vantagem interessante do `Result.gen()` é que o TypeScript consegue inferir automaticamente todos os tipos de erro possíveis. Se `validateItems` pode retornar um `InvalidItemError`, `calculateSubtotal` pode retornar um `CalculationError`, e `applyDiscount` pode retornar um `DiscountError`, o TypeScript automaticamente deduz que a função retorna `Result<number, InvalidItemError | CalculationError | DiscountError>`, sem você precisar declarar explicitamente essa união de tipos. Isso torna o código mais conciso e reduz a chance de esquecer de documentar um tipo de erro.

::more-info
#title
Entendendo generators e `yield*`

#content
Generators permitem uma forma de inversão de controle, onde o fluxo de uma função é controlado
de forma externa.

Eles são geralmente utilizados para criar iteradores personalizados de forma preguiçosa ("lazy") ou para implementar máquinas de estado complexas.

No momento que um o `generator` é consumido, também é possível injetar valores de volta para dentro da função.
Dessa forma o `yield` pausa a execução da função, envia um valor para fora e aguarda um comando para continuar.

O `yield*` permite que generators passem o controle para outros generators internos, delegando a iteração.
::

Generators é um conceito complexo, mas você não precisa entender em detalhes como
essas funções funcionam. O importante é que, dentro do corpo de um generator,
quando fazemos um `yield*` de um Result, é verificado o resultado. Em caso de um erro, a execução
para imediatamente, e `gen()` retorna o erro. Em caso de sucesso, a execução continua, recebendo
o valor (note que não recebemos um Result de volta, mas já recebemos um valor direto)

Inicialmente, pode parecer confuso e difícil de entender essa sintaxe, mas ele é bem
semelhante ao padrão de `async/await`, onde "esperamos" a execução de uma função
e recebemos o seu resultado.

```ts
// Usando generators com Result.gen()
async function processOrder(
  orderId: string,
): AsyncResult<Order, ValidationError | DatabaseError | NotFoundError> {
  return Result.gen(function* () {
    // yield* "extrai" o valor do Result ou retorna o erro imediatamente
    const order = yield* fetchOrder(orderId);

    // Se chegou aqui, order é do tipo Order (não Result<Order, ...>)
    const validatedOrder = yield* validateOrder(order);

    // Continua extraindo valores de forma fluida
    const savedOrder = yield* saveToDatabase(validatedOrder);

    // Retorna o valor final
    return savedOrder;
  });
}

// Comparando com async/await (sintaxe muito similar)
async function fetchUserData(userId: string): Promise<UserData> {
  // await "extrai" o valor da Promise
  const user = await fetchUser(userId);

  // Se chegou aqui, user é do tipo User (não Promise<User>)
  const profile = await fetchProfile(user.id);

  // Continua extraindo valores de forma fluida
  const preferences = await fetchPreferences(user.id);

  // Retorna o valor final
  return { user, profile, preferences };
}
```

Esse padrão se aproxima do operador `?` do Rust, que atua de forma semelhante, "extraindo" o valor
do Result ou retornando a função imediatamente com um erro:

```rust
// Operador ? em Rust funciona exatamente como yield* em generators
fn process_order(order_id: &str) -> Result<Order, OrderError> {
    // ? extrai o valor ou retorna o erro imediatamente
    let order = fetch_order(order_id)?;

    // Se chegou aqui, order é do tipo Order (não Result<Order, ...>)
    let validated_order = validate_order(order)?;

    // Continua extraindo valores
    let saved_order = save_to_database(validated_order)?;

    // Retorna o valor final
    Ok(saved_order)
}
```

## Chegando ao um resultado final

Independente se você vai verificar cada Result individualmente, utilizar chains com `.map()` ou utilizar `.gen()`,
você geralmente vai chegar em um ponto onde o seu Result vai alcançar uma última camada, onde um valor deve ser gerado
ou um erro deve ser retornado.

O Result possui alguns métodos "getters" para quando você precisa gerar um valor, independendo do erro:

Os principais são `getOrDefault()`, que retorna um valor default no caso de um erro e `getOrElse()`, que executa
uma função de callback para adquirir o valor que deve ser retornado no caso de um erro.

```ts
// getOrDefault - retorna um valor padrão em caso de erro
async function getUserName(userId: string): Promise<string> {
  const result = await fetchUser(userId);
  // Se houver erro, retorna "Usuário Desconhecido"
  return result.getOrDefault("Usuário Desconhecido");
}

// getOrElse - executa função para computar valor de fallback
async function getUserEmail(userId: string): Promise<string> {
  const result = await fetchUser(userId);
  // Se houver erro, computa um valor baseado no erro
  return result.getOrElse((error) => {
    console.error("Erro ao buscar usuário:", error);
    return `user-${userId}@placeholder.com`;
  });
}

// Exemplo prático: carregar configurações com fallback
async function loadConfig(): Promise<Config> {
  return fetchRemoteConfig().getOrElse((error) => {
    console.warn("Config remota indisponível, usando local:", error);
    return loadLocalConfig();
  });
}
```

Entretanto, em alguns casos, precisamos lidar com cada erro de forma diferente. Para isso, Results que são falhas
possuem um método chamado `.match()`.

```ts
type PaymentError =
  | { _tag: "InsufficientFunds"; required: number; available: number }
  | { _tag: "InvalidCard"; reason: string }
  | { _tag: "NetworkError"; message: string }
  | { _tag: "SessionExpired" };

async function processPayment(amount: number): Promise<string> {
  const result = await attemptPayment(amount);

  if (!result.ok) {
    // .match() exige tratamento para cada tipo de erro
    return result.error.match({
      InsufficientFunds: (err) =>
        `Saldo insuficiente. Necessário: R$${err.required}, Disponível: R$${err.available}`,

      InvalidCard: (err) =>
        `Cartão inválido: ${err.reason}. Por favor, verifique os dados.`,

      NetworkError: (err) =>
        `Erro de conexão: ${err.message}. Tente novamente.`,

      SessionExpired: () => `Sua sessão expirou. Faça login novamente.`,
    });
  }

  return `Pagamento de R$${amount} processado com sucesso!`;
}
```

Graças ao Typescript, o `.match()` permite verificar que todos os erros são tratados, o que
resultaria em erros de Typescript no caso de você fazer uma modificação que adiciona um novo tipo de erro,
mas que não foi tratado.

Além disso, você pode utilizar o `.else()` para lidar com todos os outros erros da mesma forma.

```ts
type ApiError =
  | { _tag: "NotFound"; resource: string }
  | { _tag: "Unauthorized" }
  | { _tag: "RateLimited"; retryAfter: number }
  | { _tag: "ServerError"; message: string }
  | { _tag: "NetworkError"; message: string };

async function fetchResource(id: string): Promise<string> {
  const result = await getResource(id);

  if (!result.ok) {
    // Trata alguns erros especificamente, outros genericamente com .else()
    return result.error.match({
      NotFound: (err) => `Recurso "${err.resource}" não encontrado.`,

      Unauthorized: () => `Você não tem permissão para acessar este recurso.`,

      RateLimited: (err) =>
        `Muitas requisições. Tente novamente em ${err.retryAfter} segundos.`,

      // .else() captura todos os outros erros (ServerError, NetworkError, etc)
      else: (err) =>
        `Erro inesperado: ${err._tag}. Tente novamente mais tarde.`,
    });
  }

  return result.value;
}
```

Utilizar o combinador `.match()` é ideal para lógicas de domínio onde cada erro exige uma reação específica (ex: erro de saldo -> mostrar modal; erro de sessão -> redirecionar login). Já o uso de `.else()` ou o tratamento genérico serve bem como um _catch-all_, garantindo que erros inesperados não quebrem a aplicação, mas tratando-os de forma unificada (ex: mostrar um "tente novamente mais tarde").

::note
O `.match()` funciona somente em falhas, é necessário verificar o valor de `.ok` antes.
::

## Conclusão

Mesmo que você não utilize especificamente a biblioteca `typescript-result` ou o padrão Result,
eu acredito que é importante você estar ciente dessas formas de tratar erros, e parar para pensar
em como você está lidando com erros na sua aplicação.

Se você tem interesse, eu recomendo ler a documentação do `typescript-result`, que possui
outros métodos e informações de como melhor utilizar a biblioteca.

Além disso, você pode explorar outras bibliotecas `neverthrow` e `fp-ts`. A biblioteca `Effect` vai além,
gerando um framework e ecossistemas em volta do conceito de `Effect`, uma função que recebe um contexto e retorna
um `Result`.

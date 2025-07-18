---
title: "Lidando com errors, falhas e exceções"
slug: "lazy-computed"
publishDate: 2025-07-17
draft: true
tags: ["javascript", "typescript", "error-handling"]
description: ""
lang: "pt"
---

PARTE 1: Descrição do problema e uma solução básica

- Mensagens genéricas de erros são ruins para debuggar, mas pior ainda para o usuário
  Como saber se aquela ação realmente acontece, de quem é a culpa, minha ou do servidor? Eu fiz algo errado
  O servidor salvou algo que eu fiz? Tentar mais tarde? Mas quando?

- Durante a queda do Firebase, o meu sistema dava um erro de "Usário ou senha não encontrado".
  Em um outro sistema, eu tenho um log de erro 500 quando um usuário tenta fazer login com a senha errada.

- Um dos principais problemas, é como o padrão de try e catch funciona com javascript e typescript.
  Não é possível saber qual função vai dar throw
  Não é possível saber quais errors vão ser lançados, muito menos que um erro será lançado

- Isso permite que desenvolvedores escrevam muito código que focam somente no "happy path",
  e um grande bloco de `throw/catch`. Entretanto, isso resulta no padrãod e "algum erro aconteceu".

Mostrar código de fetch, que faz várias ações que podem dar throw, mas somente um catch.

- Não é só isso, se eu não sei qual erro eu tive, eu também não consigo saber o que especificamente
  fazer depois desse erro. Eu devo tentar? Eu devo avisar um desenvolvedor?

- Algumas bibliotecas/sistemas indicam com um código o tipo de erro, mas isso gera problemas de i18n,
  isso temos ferramentas adequadas para verificar mudanças, etc.

- Tratar erro como valores é uma das formas de lidar com esses problemas.
  Linguagens como Go e Rust tem utilizados esse padrão, e outras como Kotlin
  tem abordado possibilidade semelhantes.

- Como fica nosso código se a gente tratar erros como valores?

  // function fetchUserData(): User | 'NetworkError' | 'NotAuth' | 'UserNotFound'

  Funciona, mas a verificação fica um pouco difícil
  Vamos fazer um `descriminition union`

  // function fetchUserData(): { ok: true, value: User } | { ok: false, error: 'NetworkError' | 'NotAuth' | 'UserNotFound'}

  Agora você tem todas as ferramentas para lidar com o error:

  - Devo mostrar essa mensagem para o usuário ou só tentar novamente automaticamente?
  - Se o usuário fez algo de errado, como eu posso deixar isso claro para ele?
  - Qual a gravidade desse problema? Eu devo passar para meu sistema de monitoramento de erro?
  - Criação de "grupos" de erros, permitindo melhor análise de logs
  - Eu tenho segurança nas chamadas. Eu sei quais os possíveis erros, e eu posso utiliar
    o typescript para me avisar se eu estou deixando passar um erro

  E esse é só o começo de uma jornada para criar aplicativos mais robustos.

- O que é um erro, o que é uma falha e o que é uma exceção?
  Mesmo que Go e Rust não tenham `throw/catch` ainda existe o `panic`.
  Nesse caso temos uma **falha**.

  --// Ler mais sobre isso e revisar o parágrafo abaixo //--
  Isso acontece quando um erro não recuperável acontece. Por exemplo,
  se seu servidor depende de uma chave disponível no `.env`, e esse valor
  não é encontrado, você encontrou uma falha que não é possível se recuperar.
  O melhor é realmente matar o processo, dando esse feedback que algo está errado.

  Entretanto, se o seu sistema precisa conversar com uma API, que está temporariamente
  offline, não faz sentido você dar um `panic` e matar o processo. Da mesma forma
  que um navegador incompatível com algo vital para o seu sistema funcionar, que
  impediria por exemplo, de você mostrar alguma coisa na tela.
  -- /////////////////// --

  Entretanto, agora que a gente sabe, a gente pode até "expandir" nosso conceito de "Erro"
  Já viu algum código assim:

  // getUserFirstEvent(user?: User, event: Events) {
  if (!user) {
  return
  }

  return event[user][0];
  }

  // NOTA: Typescript tem uma opção que faz acessos em array sempre retornarem `| undefined`.
  // eu recomendo muito para evitar erros em runtime.
  // // Verificar se com `const` isso acontece...

  Legal, mas como eu diferencio o fato de não ter usuário com o usuário não ter nenhum evento?
  Agora eu posso tratar os dois casos como erros.
  O mais legal é que agora você deixa livre para quem chama a função para lidar com esse erro.
  Eu posso jogar ele pra cima? Eu vou lidar com um mas não com o outro? Ou só ignoro.

  Isso me permitiu COMPOSIÇÃO. Algo que é muito mais difícil utilizando `try/catch` ou simplesmente retornando "undefined".

PARTE 2: Explorando o Padrão `Result` e o ecossistema: `neverthrow` e as três formas de lidar com erros

Generalizando nossa solução anterior
Erros no estilo Go

PARTE 3: Explorando o `Result` como Monad.

Erros no estilo funcional com Monads
Erros no estilo Rust
Erros com Pipe

Eu particularmente gosto da opçao #2, mas eu acho que esse padrão de `Result<T, E>` pode ser
utilizado em vários lugares.

PARTE 3: Uma discussão mais filosófica, como transmitir um erro pelo cabo? (Backend -> Frontend)

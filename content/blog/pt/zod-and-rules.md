---
title: "Zod e Regras de Negócio"
slug: "zod-and-rules"
publishDate: 2025-17-20
draft: true
tags: ["javascript", "typescript", "zod"]
description: ""
lang: "pt"
---

Eu gosto de DDD, mas também é muita coisa. Entretanto, existe um conceito central que eu acho que muitas pessoas vão
concordar, que para mim, faz muito sentido: O seu código deve refletir o seu domínio. E uma das formas de você
fazer isso é certificando-se que seu código reflete as regras de negócio.

```ts
function payUser(n: number) {
  // user.account - n
}

let discount = 30;

const amountToPay = 12 - discount;
payUser(amountToPay);
```



Features que são avançadas, mas que possui muita aplicação
e provavelmente pode ser útil no seu projeto.

- União Discriminada
- Branding
- CODECs

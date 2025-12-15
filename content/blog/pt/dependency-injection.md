---
title: "Introdução a Injeção de Dependência"
slug: "dependency-injection"
publishDate: 2025-12-15
draft: false
tags: ["javascript", "typescript", "padrões de código"]
description: "As vantagens de depender de abstrações"
lang: "pt"
---

Injeção de dependência (Dependency Injection) é um desses termos que parece mais complexo do que realmente é. 
A ideia é simples: em vez de um componente criar suas próprias dependências, elas são fornecidas de fora.

Existem alguns frameworks de injeção de dependência, mas é algo muito fácil de fazer "na mão", sem precisar
de truques:

```ts
// Criamos uma classe abstrata, ela define como será o "Serviço" de enviar email
abstract class EmailService {
    abstract sendEmail(to: string, template: string): Promise<unknown>;
}

class SendGridEmailService extends EmailService {
    private apiKey: string;

    constructor(apiKey: string) {
      this.apiKey = apiKey;
    }

    async sendEmail(to: string, template: string) {
        // Implementação real que chama API do SendGrid
    }
}

class PaymentService {
    private emailService: EmailService;

    // Quando criamos o PaymentService, precisamos injetar um serviço de e-mail
    constructor(emailService: EmailService) {
        this.emailService = emailService
    }

    async processPayment(employee: Employee) {
        // ...
        this.emailService.sendEmail(employee.email, 'new-payment')
        // ...
    }
}

const emailService = new SendGridEmailService(process.env.SENDGRID_API_KEY!);
// Aqui o serviço é "injetado"
const paymentService = new PaymentService(emailService);
```

> NOTE: O que são classes abstratas?
> Classes abstrata definem formatos a serem seguidos, mas por si só não podem ser instânciadas
> No nosso caso, utilizamos para definir o "contrato" da abstração que vamos injetar,
> sem preferir gerar uma implementação.

Vale notar que Injeção de Dependência não é exclusiva da Orientação a Objetos.
Também é muito popular na programação funcional:

```ts
type Logger = {
  info: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string) => void;
}
 
// Podemos passar a dependência como parâmetro
const createUser = (logger: Logger, username: string) => {
  const user = { id: 1, username };

  // Uso da dependência
  logger.info(`Usuário criado: ${username}`);

  return user;
};

const consoleLogger = {
  info: console.log,
  warn: console.warn,
  error: console.error,
}

// Injetamos o logger na chamada da função
createUser(consoleLogger, 'Renato')
```

Uma das vantagens mais óbvias é a possibilidade de facilmente escrever testes
injetando versões mocks (implementações falsas criadas apenas para testes):

```ts

class TestEmailService extends EmailService {
  async sendEmail() {}
}


// Podemos escrever vários testes, sem medo de enviar um email em produção sem querer
const paymentServiceTest = new PaymentService(new TestEmailService());

// Podemos até testar o uso correto
class InMemoryInbox extends EmailService {
  public sentEmails: [string, string][] = [];
  
  async sendEmail(to: string, template: string) {
    this.sentEmails.push([to, template])
  }
}

const inbox = new InMemoryInbox();
const paymentService = new PaymentService(inbox);

const fakeEmployee = {
  id: 1,
  email: "test@company.com"
}

await paymentService.processPayment(fakeEmployee)
expect(inbox.sentEmails).toEqual([
  ['test@company.com', 'new-payment']
]);
```

Isso por si só já faz a Injeção de Dependência valer a pena, principalmente
quando você está utilizando serviços externos, que podem dificultar os testes.

Entretanto, as maiores vantagens vem da ideia de que agora estamos dependendo de uma
abstração, não mais de uma única implementação concreta.

Vamos dizer que você está trabalhando em um projeto que precisa
exportar uma lista de pagamentos:

```ts
class PaymentManager {

  exportToCSV(paymentRoll: PaymentRoll) {
    // Implementação
  }

  // outros métodos
}
```

Não tem nada de errado com esse código. Entretanto, agora precisamos fazer uma pequena mudança:
dar a opção de escolher qual é o caracter de separação. 
Uma solução mais simples seria incluir isso como um parâmetro do método:

```ts
class PaymentManager {
  exportToCSV(paymentRoll: PaymentRoll, separator: string) {
    // Implementação
  }
}
```

Mas vamos considerar um cenário mais complexo, onde o usuário define suas preferências para serem usadas.
Uma boa prática é evitar que alguém "esqueça" de utilizar essa preferência:

```ts
// Utiliza corretamente a preferência do usuário
paymentManager.exportToCsv(payment, savedSeparator);

// Em outra parte do código, a gente esquece de utilizar essa preferência
paymentManager.exportToCsv(payment, ",");
```

Podemos então incluir essas preferências no PaymentManager:

```ts
class PaymentManager {
  private separator: string;

  constructor(separator: string) {
    this.separator = separator;
  }

  exportToCSV(paymentRoll: PaymentRoll) {
    // Implementação
    // Aqui vamos utilizar this.separator
  }

}

const paymentManager = new PaymentManager(savedSeparator);
```

Agora nós começamos a ter um possível problema de acoplamento. Precisamos mudar a definição da classe `PaymentManager`
por causa do método `exportToCSV`. E se agora precisamos incluir mais opções?

```ts
class PaymentManager {
  private separator: string;
  private dateFormat: string;

  constructor(separator: string, dateFormat: string) {
    this.separator = separator;
    this.dateFormat = dateFormat;
  }

  exportToCSV(paymentRoll: PaymentRoll) {
    // Implementação, utilizamos this.separator e this.dataFormat
  }

}

const paymentManager = new PaymentManager(savedSeparator, savedDateFormat);
```

O código funciona, mas agora estamos cada vez mais acoplando um comportamento com essa classe.

Podemos melhorar esse código utilizando Injeção de Dependência:

```ts
class CSVPaymentExporter {
  private separator: string;
  private dateFormat: string;

  constructor(separator: string, dateFormat: string) {
    this.separator = separator;
    this.dateFormat: dateFormat;
  }

  export(paymentRoll: PaymentRoll) {
    // Implementação, utilizamos this.separator e this.dataFormat
  }
}

class PaymentManager {
  private CSVExporter: CSVPaymentExporter

  exportToCSV(paymentRoll: PaymentRoll) {
    this.CSVExporter.export(paymentRoll)
  }
}

const csvExporter = new CSVPaymentExporter(savedSeparator, savedDateFormat)
const paymentManager = new PaymentManager(csvExporter);
```

Agora, podemos livremente modificar a classe `CSVPaymentExporter`, sem se preocupar em modificar
o `PaymentManager`. Podemos até abstrair essa classe, permitindo outras formas de exportar:

```ts
abstract class PaymentExporter {
  abstract export(paymentRoll: PaymentRoll): void;
}

class CSVPaymentExporter extends PaymentExporter {
  private separator: string;
  private dateFormat: string;

  constructor(separator: string, dateFormat: string) {
    this.separator = separator;
    this.dateFormat = dateFormat;
  }

  export(paymentRoll: PaymentRoll): void {
    // Implementação que monta CSV com this.separator e this.dateFormat
  }
}

class PaymentManager {
  private exporter: PaymentExporter;

  constructor(exporter: PaymentExporter) {
    this.exporter = exporter;
  }

  export(paymentRoll: PaymentRoll): void {
    this.exporter.export(paymentRoll);
  }
}

const csvExporter = new CSVPaymentExporter(savedSeparator, savedDateFormat);
const paymentManager = new PaymentManager(csvExporter);

// Podemos facilmente criar outro exporter com suas próprias configurações
class JSONPaymentExporter extends PaymentExporter {
  export(paymentRoll: PaymentRoll): void {
    // Implementação JSON
  }
}
```

Note a vantagem: podemos modificar `CSVPaymentExporter` sem afetar outro código, e implementar novos exportadores facilmente.

Mas Injeção de Dependência não resolve todos os problemas. Nesse caso,
precisamos definir o `exporter` assim que criamos uma instância de `PaymentManager`. Mas precisamos
pensar na possibilidade que um mesmo usuário vai querer exportar como CSV e como JSON.

Uma alternativa seria criar um método `updateExporter(exporter: PaymentExporter)` para mudar a estratégia.
Porém, isso introduz estado mutável, o que complica testes e raciocínio sobre o código.

Aqui podemos lembrar que Injeção de Dependência não é algo exclusivo de classes. Podemos passar um `exporter` no método:

```ts
class PaymentManager {
  export(exporter: PaymentExporter, paymentRoll: PaymentRoll) {
    exporter.export(paymentRoll)
  }
}
```

Esse padrão funciona muito bem com o padrão de estratégia ("Strategy Pattern"):

```ts
function getExporter(format: 'csv' | 'json', prefs: UserPreference): PaymentExporter {
  switch (format) {
    case 'csv':
      return new CSVPaymentExporter(prefs.separator, prefs.dateFormat);
      
    case 'json':
      return new JSONPaymentExporter(prefs.jsonIndentation, prefs.dateFormat);
      
    default:
      throw new Error("Formato desconhecido");
  }
}

// O usuário clica em "Baixar CSV"
const csvStrategy = getExporter('csv', userPreferences);
paymentManager.export(csvStrategy, paymentRoll);

// O mesmo usuário, na mesma sessão, clica em "Baixar JSON"
const jsonStrategy = getExporter('json', userPreferences);
paymentManager.export(jsonStrategy, paymentRoll);
```

Com essas ideias, agora também é fácil ver uma forma de modificar o comportamento
do nosso código baseado no ambiente. Por exemplo, se precisamos de uma API para externa
para conseguir algumas informações, podemos criar um serviço abstrato:

```ts
abstract class TaxInfoService {
  abstract async getTaxPercentage(salary: number): Promise<number>;
}

// Em produção, chamamos uma API real
class TaxInfoAPI extends TaxInfoService {
  async getTaxPercentage(salary: number) {
    // fetch(...) 
  }
}

// Em testes, usamos um valor fixo para evitar chamadas reais
class TaxInfoTestImpl extends TaxInfoService {
  async getTaxPercentage() {
    return 0.2;
  }
}

const taxInfoService = isTesting() ? new TaxInfoTestImpl() : new TaxInfoAPI();
```

Mas não precisamos ficar presos em escolher qual classe vamos utilizar, podemos também
definir qual instância injetar, modificando configurações.

```ts
class TaxInfoAPI extends TaxInfoService {
  // TTL = Time to Live
  // Utilizamos para definir por quanto tempo um valor vai ficar em cache
  private cacheTTL: number;

  constructor(cacheTTL: number) {
    this.cacheTTL = cacheTTL;
  }

  async getTaxPercentage(salary: number) {
    // Verifica cache, verificando se ainda é valido baseado no this.cacheTTL
    // fetch(...) 
  }
}

const taxInfoServiceTest = new TaxInfoTestImpl()

// Cache mais agressivo em dev, mais conservador em produção
const taxInfoServiceLive = isDev() ? new TaxInfoAPI(36000) : new TaxInfoAPI(300);
```

Outra vantagem: ao depender de abstrações, você pode desenvolver serviços sem implementar cada detalhe.
Se você já tem `TaxInfoService`, pode continuar desenvolvendo sem se preocupar ainda como ele vai ser implementado.

O interessante é que você consegue fazer um desenvolvimento "de dentro pra fora". Fica fácil seguir padrões
como Arquitetura Hexagonal/Clean Architecture, onde camadas externas dependem somente de camadas internas, mas nunca o contrário.

```ts
// Código de domínio puro. Esse código só vai mudar se o próprio domínio mudar
function getBonusValue(employee: Employee, bonusPolicy: BonusPolicy, bonusDate: Date) {
  // Verifica se o funcionário pode receber o bônus
  const isEligible = bonusPolicy.isEligible(employee, bonusDate);

  if (isEligible) {
    return bonusPolicy.calculateBonus(employee);
  }
  return 0;
}

// Abstrações para políticas de bônus
abstract class BonusPolicy {
  abstract isEligible(employee: Employee, bonusDate: Date): boolean;
  abstract calculateBonus(employee: Employee): number;
}

abstract class PaymentProcessor {
  abstract process(employeeId: number, amount: number): Promise<PaymentResult>;
}

class PaymentService {
  // Injetamos dependências, sem precisar de banco de dados ou APIs externas
  constructor(
    private bonusPolicy: BonusPolicy,
    private paymentProcessor: PaymentProcessor
  ) {}

  async processPayment(employee: Employee, paymentDate: Date) {
    const bonusAmount = getBonusValue(employee, this.bonusPolicy, paymentDate);
    const paymentAmount = bonusAmount + employee.baseSalary;
    const paymentResult = await this.paymentProcessor.process(employee.id, paymentAmount);
    return paymentResult;
  }
}

```

Note que mesmo sem implementar `BonusPolicy`, já podemos escrever testes.

```ts
// Mock simples para testes - sempre retorna 10% do salário
class AlwaysEligibleBonus extends BonusPolicy {
  isEligible(): boolean {
    return true;
  }

  calculateBonus(employee: Employee): number {
    return employee.baseSalary * 0.1;
  }
}

// Mock simples para testes
class NeverEligibleBonus extends BonusPolicy {
  isEligible(): boolean {
    return false;
  }

  calculateBonus(): number {
    return 0;
  }
}

class MockPaymentProcessor extends PaymentProcessor {
  async process(employeeId: number, amount: number): Promise<PaymentResult> {
    console.log(`Processando pagamento de $${amount} para o funcionário ${employeeId}`);
    return { success: true, transactionId: 'mock-123' };
  }
}

// Testando nosso design
const bonusPolicy = new AlwaysEligibleBonus();
const paymentProcessor = new MockPaymentProcessor();
const paymentService = new PaymentService(bonusPolicy, paymentProcessor);

const employee = {
  id: 1,
  name: 'John',
  baseSalary: 5000,
  hireDate: new Date('2020-01-15')
};

paymentService.processPayment(employee, new Date('2025-01-15'));
// Output: Processando pagamento de $5500 para o funcionário 1
```

Não só isso, agora podemos começar a pensar em questões importantes de design:
- Estamos retornando todas as informações necessárias?
- Devemos registrar por que um funcionário não recebeu bônus?
- Como a política afeta o cálculo?
- Tratamos corretamente falhas no sistema de pagamento?

Podemos escrever e iterar em código de produção real, sem nem precisar saber qual banco de dados vamos usar.

## Considerações finais

Não é necessário um framework de Injeção de Dependência para vocẽ conseguir utilizar esse padrão, 
mas é importante manter em mente suas vantagens e desvantagens:

**Vantagens:**
- Código mais testável e desacoplado
- Fácil trocar implementações sem modificar classes dependentes
- Arquitetura mais limpa e organizada
- Desenvolvimento mais iterativo (abstrações primeiro)

**Desvantagens:**
- Complexidade aumenta, especialmente com muitas dependências
- Novo desenvolvedor precisa "caçar" implementações concretas
- Abstrações ruins complicam mais que ajudam
- Pode levar a over-engineering em projetos simples

Portanto, eu não usaria esse padrão em projetos pequenos ou em protótipos. Para mim, os cenários em que a Injeção de Dependência traz as maiores vantagens são:

- Código com dependências externas (APIs, bancos de dados)
- Sistemas com múltiplas implementações possíveis
- Projetos que precisam ser facilmente testáveis
- Aplicações de médio a grande porte com múltiplos desenvolvedores 
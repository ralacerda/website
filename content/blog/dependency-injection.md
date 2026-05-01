---
title_pt: "Introdução a Injeção de Dependência"
title_en: "Introduction to Dependency Injection"
slug: "dependency-injection"
publishDate: 2025-12-15
draft: false
tags: ["javascript", "typescript", "padrões de código"]
description_pt: "As vantagens de depender de abstrações"
description_en: "The advantages of depending on abstractions"
---

::lang-block{lang="pt"}
Injeção de dependência (Dependency Injection) é um desses termos que parece mais complexo do que realmente é. 
A ideia é simples: em vez de um componente criar suas próprias dependências, elas são fornecidas de fora.

Existem alguns frameworks de injeção de dependência, mas é algo muito fácil de fazer "na mão", sem precisar
de truques:
::

::lang-block{lang="en"}
Dependency Injection is one of those terms that sounds more complex than it actually is.
The idea is simple: instead of a component creating its own dependencies, they are provided from the outside.

There are some dependency injection frameworks, but it is something very easy to do "by hand", without any tricks:
::

```ts
// We create an interface that defines the shape of the EmailService
interface EmailService {
    sendEmail(to: string, template: string): Promise<unknown>;
}

class SendGridEmailService implements EmailService {
    private apiKey: string;

    constructor(apiKey: string) {
      this.apiKey = apiKey;
    }

    async sendEmail(to: string, template: string) {
        // Real implementation that calls SendGrid API
    }
}

class PaymentService {
    private emailService: EmailService;

    // When we create PaymentService, we need to inject an email service
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
// Here the service is "injected"
const paymentService = new PaymentService(emailService);
```

::more-info{title_pt="O que são interfaces?" title_en="What are interfaces?"}
#pt
Interfaces definem um "contrato" que especifica quais métodos e propriedades uma classe deve ter,
sem fornecer a implementação. No TypeScript, usamos interfaces para definir a forma que um objeto deve ter.

Para criar uma classe que segue esse contrato, utilizamos o `implements`. Quando uma classe implementa uma interface,
ela precisa fornecer implementações para todos os métodos definidos na interface.
Isso garante que diferentes implementações tenham a mesma "forma".

#en
Interfaces define a "contract" that specifies which methods and properties a class must have,
without providing the implementation. In TypeScript, we use interfaces to define the shape an object should have.

To create a class that follows this contract, we use `implements`. When a class implements an interface,
it must provide implementations for all methods defined in the interface.
This ensures that different implementations have the same "shape".
::
::lang-block{lang="pt"}
Vale notar que Injeção de Dependência não é exclusiva da Orientação a Objetos.
Também é muito popular na programação funcional:
::

::lang-block{lang="en"}
It is worth noting that Dependency Injection is not exclusive to Object Oriented Programming.
It is also very popular in functional programming:
::

```ts
type Logger = {
  info: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string) => void;
}
 
// We can pass the dependency as a parameter
const createUser = (logger: Logger, username: string) => {
  const user = { id: 1, username };

  // Usage of the dependency
  logger.info(`User created: ${username}`);

  return user;
};

const consoleLogger = {
  info: console.log,
  warn: console.warn,
  error: console.error,
}

// We inject the logger in the function call
createUser(consoleLogger, 'Renato')
```

::lang-block{lang="pt"}
Agora vamos ver um exemplo que não utiliza Injeção de dependência, para entendermos a diferença. 
Considere um cenário em que você está trabalhando em um projeto que possui um serviço de pagamento.
Esse serviço é responsável, entre outras coisas, por exportar uma versão de CSV de relatórios de pagamento.
::

::lang-block{lang="en"}
Now let's look at an example that doesn't use Dependency Injection, to understand the difference.
Consider a scenario where you are working on a project that has a payment service.
This service is responsible, among other things, for exporting a CSV version of payment reports.
::

```ts
class PaymentManager {
  exportToCSV(paymentRoll: PaymentRoll) {
    // Implementation
  }

  // other methods
}
```
::more-info{title_pt="Tipos utilizados nos exemplos" title_en="Types used in the examples"}
#pt
Ao longo do artigo, vou utilizar alguns tipos para representar entidades do domínio.
Eles não são o foco desse artigo, mas se você quiser ter uma ideia, eles poderiam
ser representados da seguinte forma:

#en
Throughout this article, we will use some types to represent domain entities:
::

```ts
// Represents an employee
interface Employee {
  id: number;
  name: string;
  email: string;
  baseSalary: number;
  hireDate: Date;
}

// Represents a payroll
interface PaymentRoll {
  employees: Employee[];
  period: { start: Date; end: Date };
  totalAmount: number;
}

// User preferences for export
interface UserPreference {
  separator: string;
  dateFormat: string;
  jsonIndentation: number;
}

// Result of a payment operation
interface PaymentResult {
  success: boolean;
  transactionId: string;
}
```
::

::lang-block{lang="pt"}
Não tem nada de errado com esse código. Entretanto, agora precisamos fazer uma pequena mudança:
dar a opção de escolher qual é o caracter de separação. 
Uma solução mais simples seria incluir isso como um parâmetro do método:
::

::lang-block{lang="en"}
There is nothing wrong with this code. However, let's say we need to make a small change: give the option to choose which is the separator character. A simpler solution would be to include this as a method parameter:
::

```ts
class PaymentManager {
  exportToCSV(paymentRoll: PaymentRoll, separator: string) {
    // Implementation
  }
}
```

::lang-block{lang="pt"}
Mas vamos considerar um cenário mais complexo, onde o usuário define suas preferências para serem usadas.
Uma boa prática é evitar que alguém "esqueça" de utilizar essa preferência:
::

::lang-block{lang="en"}
But let's consider a more complex scenario, where the user defines their preferences to be used.
A good practice is to avoid a case when we can forget to use this preference:
::

```ts
// Correctly uses the user preference
paymentManager.exportToCsv(payment, savedSeparator);

// Elsewhere in the code, we forget to use this preference
paymentManager.exportToCsv(payment, ",");
```

::lang-block{lang="pt"}
Podemos então incluir essas preferências no PaymentManager:
::

::lang-block{lang="en"}
We can then include these preferences in the PaymentManager:
::

```ts
class PaymentManager {
  private separator: string;

  constructor(separator: string) {
    this.separator = separator;
  }

  exportToCSV(paymentRoll: PaymentRoll) {
    // Implementation
    // Here we will use this.separator
  }

}

const paymentManager = new PaymentManager(savedSeparator);
```

::lang-block{lang="pt"}
Agora começamos a ter um problema de acoplamento. Estamos misturando responsabilidades: `PaymentManager` é responsável pela lógica de pagamentos,
mas agora também precisa saber sobre regras de formatação CSV. Isso cria vários problemas:

**Princípio da Responsabilidade Única**: Por que `PaymentManager` deveria se preocupar com separadores CSV? Isso é uma preocupação de formatação, não de pagamento.

**Impossível Testar Isoladamente**: Você não consegue testar a lógica de formatação CSV sem envolver todo o `PaymentManager`.

**Amplificação de Mudanças**: Quando temos uma nova feature, como: "Deveríamos ter uma opção para escolher formato de data," modificamos `PaymentManager` mesmo que a lógica de pagamento não tenha mudado.
::

::lang-block{lang="en"}
Now we start to have a coupling problem. We're mixing concerns: `PaymentManager` is responsible for payment logic,
but now it also needs to know about CSV formatting rules. This creates several issues:

**Single Responsibility Principle**: Why should `PaymentManager` care about CSV separators? That's a formatting concern, not a payment concern.

**Can't Test in Isolation**: You can't unit test the CSV formatting logic without involving the entire `PaymentManager`.

**Change Amplification**: When product decides "We should have an option to pick date format," we modify `PaymentManager` even though payment logic hasn't changed.
::

::lang-block{lang="pt"}
Podemos melhorar esse código utilizando Injeção de Dependência:
::

::lang-block{lang="en"}
We can improve this code using Dependency Injection:
::

```ts
class CSVPaymentExporter {
  private separator: string;
  private dateFormat: string;

  constructor(separator: string, dateFormat: string) {
    this.separator = separator;
    this.dateFormat = dateFormat;
  }

  export(paymentRoll: PaymentRoll) {
    // Implementation, we use this.separator and this.dateFormat
  }
}

class PaymentManager {
  private csvExporter: CSVPaymentExporter

  constructor(csvExporter: CSVPaymentExporter) {
    this.csvExporter = csvExporter;
  }

  export(paymentRoll: PaymentRoll) {
    this.csvExporter.export(paymentRoll)
  }
}

const csvExporter = new CSVPaymentExporter(savedSeparator, savedDateFormat)
const paymentManager = new PaymentManager(csvExporter);
```

::lang-block{lang="pt"}
Agora, podemos livremente modificar a classe `CSVPaymentExporter`, sem se preocupar em modificar
o `PaymentManager`. Podemos até abstrair essa classe, permitindo outras formas de exportar:
::

::lang-block{lang="en"}
Now, we can freely modify the `CSVPaymentExporter` class, without worrying about modifying `PaymentManager`. We can even abstract this class, allowing other ways to export:
::

```ts
interface PaymentExporter {
  export(paymentRoll: PaymentRoll): void;
}

class CSVPaymentExporter implements PaymentExporter {
  private separator: string;
  private dateFormat: string;

  constructor(separator: string, dateFormat: string) {
    this.separator = separator;
    this.dateFormat = dateFormat;
  }

  export(paymentRoll: PaymentRoll): void {
    // Implementation that builds CSV with this.separator and this.dateFormat
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

// We can easily create another exporter with its own settings
class JSONPaymentExporter implements PaymentExporter {
  export(paymentRoll: PaymentRoll): void {
    // JSON Implementation
  }
}
```

::lang-block{lang="pt"}
Agora conseguimos criar novos exportadores sem afetar `PaymentManager` ou `CSVPaymentExporter`. 
Outra vantagem é que agora fica mais fácil escrever testes
injetando versões mocks (implementações falsas criadas apenas para testes):
::

::lang-block{lang="en"}
Now we can create new exporters without affecting `PaymentManager` or `CSVPaymentExporter`.
Another advantage is that it's now easier to write tests
injecting mock versions (fake implementations created only for tests):
::

```ts
class TestPaymentExporter implements PaymentExporter {
  public exportedRolls: PaymentRoll[] = [];

  export(paymentRoll: PaymentRoll): void {
    this.exportedRolls.push(paymentRoll);
  }
}

const testExporter = new TestPaymentExporter();
const paymentManager = new PaymentManager(testExporter);

paymentManager.export(myPaymentRoll);

// We can verify that export was called with the correct data
expect(testExporter.exportedRolls).toHaveLength(1);
expect(testExporter.exportedRolls[0]).toBe(myPaymentRoll);
```

::lang-block{lang="pt"}
Mas Injeção de Dependência não resolve todos nossos problemas. Nesse caso,
precisamos definir o `exporter` assim que criamos uma instância de `PaymentManager`. Mas precisamos
pensar na possibilidade que um mesmo usuário vai querer exportar como CSV e como JSON.

Uma alternativa seria criar um método `updateExporter(exporter: PaymentExporter)` para mudar a estratégia.
Porém, isso introduz estado mutável, o que complica testes e raciocínio sobre o código.

Aqui podemos lembrar que Injeção de Dependência não é algo exclusivo de classes. Podemos passar um `exporter` no método:
::

::lang-block{lang="en"}
But Dependency Injection does not solve all problems. In this case, we need to define the `exporter` as soon as we create an instance of `PaymentManager`. But we need to think about the possibility that the same user will want to export as CSV and as JSON.

An alternative would be to create a method `updateExporter(exporter: PaymentExporter)` to change the strategy.
However, this introduces mutable state, which complicates tests and reasoning about the code.

Here we can remember that Dependency Injection is not something exclusive to classes. We can pass an `exporter` to method:
::

```ts
class PaymentManager {
  export(exporter: PaymentExporter, paymentRoll: PaymentRoll) {
    exporter.export(paymentRoll)
  }
}
```

::lang-block{lang="pt"}
Esse padrão funciona muito bem com o padrão de estratégia ("Strategy Pattern"):
::

::lang-block{lang="en"}
This pattern works very well with the Strategy Pattern:
::

```ts
function getExporter(format: 'csv' | 'json', prefs: typeof userPreferences): PaymentExporter {
  switch (format) {
    case 'csv':
      return new CSVPaymentExporter(prefs.separator, prefs.dateFormat);
      
    case 'json':
      return new JSONPaymentExporter(prefs.jsonIndentation, prefs.dateFormat);
      
    default:
      throw new Error("Unknown format");
  }
}

// User clicks "Download CSV"
const csvStrategy = getExporter('csv', userPreferences);
paymentManager.export(csvStrategy, paymentRoll);

// The same user, in the same session, clicks "Download JSON"
const jsonStrategy = getExporter('json', userPreferences);
paymentManager.export(jsonStrategy, paymentRoll);
```

::lang-block{lang="pt"}
Com essas ideias, agora também é fácil ver uma forma de modificar o comportamento
do nosso código baseado no ambiente. Por exemplo, se precisamos de uma API externa
para obter algumas informações, podemos começar criando uma abstração com uma interface:
::

::lang-block{lang="en"}
With these ideas, now it is also easy to see a way to modify the behavior of our code based on the environment. For example, if we need an external API to get some information, we can create an abstract service:
::

```ts
interface TaxInfoService {
  getTaxPercentage(salary: number): Promise<number>;
}

// In production, we call a real API
class TaxInfoAPI implements TaxInfoService {
  async getTaxPercentage(salary: number) {
    // fetch(...) 
  }
}

// In tests, we use a fixed value to avoid real calls
class TaxInfoTestImpl implements TaxInfoService {
  async getTaxPercentage() {
    return 0.2;
  }
}

const taxInfoService = isTesting() ? new TaxInfoTestImpl() : new TaxInfoAPI();
```

::lang-block{lang="pt"}
Mas não precisamos ficar presos em escolher qual classe vamos utilizar, podemos também
definir qual instância injetar, modificando configurações.
::

::lang-block{lang="en"}
But we don't need to be stuck in choosing which class we will use, we can also define which instance to inject, modifying configurations.
::

```ts
class TaxInfoAPI implements TaxInfoService {
  // TTL = Time to Live
  // Used to define how long a value will stay in cache
  private cacheTTL: number;

  constructor(cacheTTL: number) {
    this.cacheTTL = cacheTTL;
  }

  async getTaxPercentage(salary: number) {
    // Check cache, verifying if it is still valid based on this.cacheTTL
    // fetch(...) 
  }
}

const taxInfoServiceTest = new TaxInfoTestImpl()

// More aggressive cache in dev, more conservative in production
const taxInfoServiceLive = isDev() ? new TaxInfoAPI(36000) : new TaxInfoAPI(300);
```

::lang-block{lang="pt"}
Outra vantagem: ao depender de abstrações, você pode desenvolver serviços sem implementar cada detalhe.
Se você já tem `TaxInfoService`, pode continuar desenvolvendo sem se preocupar ainda como ele vai ser implementado.

O interessante é que você consegue fazer um desenvolvimento "de dentro pra fora". Fica fácil seguir padrões
como Arquitetura Hexagonal/Clean Architecture, onde camadas externas dependem somente de camadas internas, mas nunca o contrário.
::

::lang-block{lang="en"}
Another advantage: by depending on abstractions, you can develop services without implementing every detail.
If you already have `TaxInfoService`, you can continue developing without worrying yet how it will be implemented.

The interesting thing is that you can do "inside-out" development. It becomes easy to follow patterns like Hexagonal/Clean Architecture, where outer layers depend only on inner layers, but never the opposite.
::

```ts

// Domain pure code. This code will likely never change, unless the domain itself changes
function getBonusValue(employee: Employee, bonusPolicy: BonusPolicy, bonusDate: Date) {
  // Checks if the employee can receive the bonus
  const isEligible = bonusPolicy.isEligible(employee, bonusDate);

  if (isEligible) {
    return bonusPolicy.calculateBonus(employee);
  }
  return 0;
}

// Abstractions for bonus policies
interface BonusPolicy {
  isEligible(employee: Employee, bonusDate: Date): boolean;
  calculateBonus(employee: Employee): number;
}

interface PaymentProcessor {
  process(employeeId: number, amount: number): Promise<PaymentResult>;
}

class PaymentService {
  // We inject dependencies, without needing a database or external APIs
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

::lang-block{lang="pt"}
Note que mesmo sem implementar `BonusPolicy`, já podemos escrever testes.
::

::lang-block{lang="en"}
Note: even without implementing `BonusPolicy`, we can already write tests.
::

```ts
// Simple mock for tests - always returns 10% of salary
class AlwaysEligibleBonus implements BonusPolicy {
  isEligible(): boolean {
    return true;
  }

  calculateBonus(employee: Employee): number {
    return employee.baseSalary * 0.1;
  }
}

// Simple mock for tests
class NeverEligibleBonus implements BonusPolicy {
  isEligible(): boolean {
    return false;
  }

  calculateBonus(): number {
    return 0;
  }
}

class MockPaymentProcessor implements PaymentProcessor {
  async process(employeeId: number, amount: number): Promise<PaymentResult> {
    console.log(`Processing payment of $${amount} for employee ${employeeId}`);
    return { success: true, transactionId: 'mock-123' };
  }
}

// Testing our design
const bonusPolicy = new AlwaysEligibleBonus();
const paymentProcessor = new MockPaymentProcessor();
const paymentService = new PaymentService(bonusPolicy, paymentProcessor);

const employee = {
  id: 1,
  name: 'John',
  email: 'john@example.com',
  baseSalary: 5000,
  hireDate: new Date('2020-01-15')
};

paymentService.processPayment(employee, new Date('2025-01-15'));
// Output: Processing payment of $5500 for employee 1
```

::lang-block{lang="pt"}
Não só isso, agora podemos começar a pensar em questões importantes de design:
- Estamos retornando todas as informações necessárias?
- Devemos registrar por que um funcionário não recebeu bônus?
- Como a política afeta o cálculo?
- Tratamos corretamente falhas no sistema de pagamento?

Podemos escrever e iterar em código de produção real, sem nem precisar saber qual banco de dados vamos usar.

## Considerações finais

O uso de Injeção de dependência permite a inversão de controle. Agora o serviço só é responsável
por chamar as funções e métodos necessários, sem se preocupar como algo é feito. 

Entretanto, tudo na programação tem seus prós e contras, e para Injeção de Dependência não é diferente:

Vantagens:
- Código mais testável e desacoplado
- Fácil trocar implementações sem modificar classes dependentes
- Arquitetura mais limpa e organizada
- Desenvolvimento mais iterativo (abstrações primeiro)

Desvantagens:
- Complexidade aumenta, especialmente com muitas dependências
- Novo desenvolvedor precisa "caçar" implementações concretas
- Abstrações ruins complicam mais que ajudam
- Pode levar a over-engineering em projetos simples

Portanto, eu não usaria esse padrão em projetos pequenos ou em protótipos. Para mim, os cenários em que a Injeção de Dependência traz as maiores vantagens são:

- Código com dependências externas (APIs, bancos de dados)
- Sistemas com múltiplas implementações possíveis
- Projetos que precisam ser facilmente testáveis
- Aplicações de médio a grande porte com múltiplos desenvolvedores 
::

::lang-block{lang="en"}
Not only that, now we can start thinking about important design questions:
- Are we returning all necessary information?
- Should we register why an employee did not receive a bonus?
- How does the policy affect the calculation?
- Do we correctly handle failures in the payment system?

We can write and iterate on real production code, without even needing to know which database we are going to use. 

## Final considerations

The use of Dependency Injection enables inversion of control. Now the service is only responsible
for calling the necessary functions and methods, without worrying about how something is done.

However, everything in programming has its pros and cons, and Dependency Injection is no different:

Advantages:
- More testable and decoupled code
- Easy to swap implementations without modifying dependent classes
- Cleaner and more organized architecture
- More iterative development (abstractions first)

Disadvantages:
- Complexity increases, especially with many dependencies
- New developer needs to "hunt" for concrete implementations
- Bad abstractions complicate more than they help
- Can lead to over-engineering in simple projects

Therefore, I would not use this pattern in small projects or prototypes. For me, the scenarios where Dependency Injection brings the biggest advantages are:

- Code with external dependencies (APIs, databases)
- Systems with multiple possible implementations
- Projects that need to be easily testable
- Medium to large applications with multiple developers
::

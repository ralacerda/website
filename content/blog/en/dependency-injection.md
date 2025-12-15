---
title: "Introduction to Dependency Injection"
slug: "dependency-injection"
publishDate: 2025-12-15
draft: false
tags: ["javascript", "typescript", "code patterns"]
description: "The advantages of depending on abstractions"
lang: "en"
---

Dependency Injection is one of those terms that sounds more complex than it actually is.
The idea is simple: instead of a component creating its own dependencies, they are provided from the outside.

There are some dependency injection frameworks, but it is something very easy to do "by hand", without any tricks:

```ts
// We create an abstract class, it defines the shape of the EmailService
abstract class EmailService {
    abstract sendEmail(to: string, template: string): Promise<unknown>;
}

class SendGridEmailService extends EmailService {
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

    async processPayment(employee: string) {
        // ...
        this.emailService.sendEmail(ownerEmail, 'new-payment')
        // ...
    }
}

const emailService = new SendGridEmailService(process.env.SENDGRID_API_KEY!);
// Here the service is "injected"
const paymentService = new PaymentService(emailService);
```

It is worth noting that Dependency Injection is not exclusive to Object Oriented Programming.
It is also very popular in functional programming:

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

One of the most obvious advantages is the possibility to easily write tests injecting mock versions:

```ts

class TestEmailService extends EmailService {
  async sendEmail() {}
}


// We can write several tests, without fear of sending an email in production by mistake
const paymentServiceTest = new PaymentService(new TestEmailService());

// We can even test the correct usage
let testInbox: [string, string][] = [];
class InMemoryInbox extends EmailService {
  async sendEmail(to: string, template: string) {
    testInbox.push([to, template])
  }
}

const inMemoryInbox = new InMemoryInbox();
const paymentServiceInMemoryInbox = new PaymentService(inMemoryInbox);

paymentServiceInMemoryInbox.processPayment('test')
expect(testInbox).toEqual([
  ['test@test.com', 'new-payment']
]);
```

This alone makes Dependency Injection worth it, especially when you are using external services, which can make testing difficult.

However, the biggest advantages come from the idea that now we are depending on an abstraction, no longer on a single concrete implementation.

Let's say you are working on a project that needs to export a list of payments:

```ts
class PaymentManager {
  exportToCSV(paymentRoll: PaymentRoll) {
    // Implementation
  }
}
```

There is nothing wrong with this code. However, let's say we need to make a small change: give the option to choose which is the separator character. A simpler solution would be to include this as a method parameter:

```ts
class PaymentManager {
  exportToCSV(paymentRoll: PaymentRoll, separator: string) {
    // Implementation
  }
}
```

But let's consider a more complex scenario, where the user defines their preferences to be used.
A good practice is to avoid a case when we can forget to use this preference:

```ts
// Correctly uses the user preference
paymentManager.exportToCsv(payment, savedSeparator);

// Elsewhere in the code, we forget to use this preference
paymentManager.exportToCsv(payment, ",");
```

We can then include these preferences in the PaymentManager:

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

Now we start to have a possible coupling problem. We need to change the `PaymentManager` class definition because of the `exportToCSV` method. And what if we need to include more options?

```ts
class PaymentManager {
  private separator: string;
  private dateFormat: string;

  constructor(separator: string, dateFormat: string) {
    this.separator = separator;
    this.dateFormat = dateFormat;
  }

  exportToCSV(paymentRoll: PaymentRoll) {
    // Implementation, we use this.separator and this.dataFormat
  }

}

const paymentManager = new PaymentManager(savedSeparator, savedDateFormat);
```

The code works, but now we are increasingly coupling a behavior with this class.

We can improve this code using Dependency Injection:

```ts
class CSVPaymentExporter {
  private separator: string;
  private dateFormat: string;

  constructor(separator: string, dateFormat: string) {
    this.separator = separator;
    this.dateFormat: dateFormat;
  }

  export(paymentRoll: PaymentRoll) {
    // Implementation, we use this.separator and this.dataFormat
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

Now, we can freely modify the `CSVPaymentExporter` class, without worrying about modifying `PaymentManager`. We can even abstract this class, allowing other ways to export:

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

// We can easily create another exporter with its own configurations
class JSONPaymentExporter extends PaymentExporter {
  export(paymentRoll: PaymentRoll): void {
    // JSON Implementation
  }
}
```

Note the advantage: we can modify `CSVPaymentExporter` without affecting other code, and implement new exporters easily.

But Dependency Injection does not solve all problems. In this case, we need to define the `exporter` as soon as we create an instance of `PaymentManager`. But we need to think about the possibility that the same user will want to export as CSV and as JSON.

An alternative would be to create a method `updateExporter(exporter: PaymentExporter)` to change the strategy.
However, this introduces mutable state, which complicates tests and reasoning about the code.

Here we can remember that Dependency Injection is not something exclusive to classes. We can pass an `exporter` to method:

```ts
class PaymentManager {
  export(exporter: PaymentExporter, paymentRoll: PaymentRoll) {
    exporter.export(paymentRoll)
  }
}
```

This pattern works very well with the Strategy Pattern:

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

// The user clicks on "Download CSV"
const csvStrategy = getExporter('csv', userPreferences);
paymentManager.export(csvStrategy, paymentRoll);

// The same user, in the same session, clicks on "Download JSON"
const jsonStrategy = getExporter('json', userPreferences);
paymentManager.export(jsonStrategy, paymentRoll);
```

With these ideas, now it is also easy to see a way to modify the behavior of our code based on the environment. For example, if we need an external API to get some information, we can create an abstract service:

```ts
abstract class TaxInfoService {
  abstract async getTaxPercentage(salary: number): Promise<number>;
}

// In production, we call a real API
class TaxInfoAPI extends TaxInfoService {
  async getTaxPercentage(salary: number) {
    // fetch(...) 
  }
}

// In tests, we use a fixed value to avoid real calls
class TaxInfoTestImpl extends TaxInfoService {
  async getTaxPercentage() {
    return 0.2;
  }
}

const taxInfoService = isTesting() ? new TaxInfoTestImpl() : new TaxInfoAPI();
```

But we don't need to be stuck in choosing which class we will use, we can also define which instance to inject, modifying configurations.

```ts
class TaxInfoAPI extends TaxInfoService {
  // TTL = Time to Live
  // We use it to define how long a value will stay in cache
  private cacheTTL: number;

  constructor(cacheTTL: number) {
    this.cacheTTL = cacheTTL;
  }

  async getTaxPercentage(salary: number) {
    // Checks cache, verifying if it is still valid based on this.cacheTTL
    // fetch(...) 
  }
}

const taxInfoServiceTest = new TaxInfoTest()

// More aggressive cache in dev, more conservative in production
const taxInfoServiceLive = isDev() ? new TaxInfoAPI(36000) : new TaxInfoAPI(300);
```

Another advantage: by depending on abstractions, you can develop services without implementing every detail.
If you already have `TaxInfoService`, you can continue developing without worrying yet how it will be implemented.
The interesting thing is that you can do "inside-out" development. It becomes easy to follow common architecture patterns, where outer layers depend only on inner layers, but never the opposite.

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
abstract class BonusPolicy {
  abstract isEligible(employee: Employee, bonusDate: Date): boolean;
  abstract calculateBonus(employee: Employee): number;
}

abstract class PaymentProcessor {
  abstract process(employeeId: number, amount: number): Promise<PaymentResult>;
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

Note: even without implementing `BonusPolicy`, we can already write tests.

```ts
class AlwaysEligibleBonus extends BonusPolicy {
  isEligible(): boolean {
    return true;
  }

  calculateBonus(employee: Employee): number {
    return employee.baseSalary * 0.1;
  }
}

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
  baseSalary: 5000,
  hireDate: new Date('2020-01-15')
};

paymentService.processPayment(employee, new Date('2025-01-15'));
// Output: Processing payment of $5500 for employee 1
```

Not only that, now we can start thinking about important design questions:
- Are we returning all necessary information?
- Should we register why an employee did not receive a bonus?
- How does the policy affect the calculation?
- Do we correctly handle failures in the payment system?

We can write and iterate on real production code, without even needing to know which database we are going to use. 

## Final considerations

You don't need a Dependency Injection framework to be able to use this pattern, but it is important to keep in mind its advantages and disadvantages:

**Advantages:**
- More testable and decoupled code
- Easy to swap implementations without modifying dependent classes
- Cleaner and more organized architecture
- More iterative development (abstractions first)

**Disadvantages:**
- Complexity increases, especially with many dependencies
- New developer needs to "hunt" for concrete implementations
- Bad abstractions complicate more than they help
- Can lead to over-engineering in simple projects

For me, the scenarios where Dependency Injection brings the biggest advantages are in code with external dependencies, with multiple implementations, or that needs to be easily testable.

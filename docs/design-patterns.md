# Design Patterns

## Overview of Patterns Used

| Pattern | Where applied | Problem it solves |
|---------|--------------|-------------------|
| Page Object Model (POM) | `src/pages/` | Decouples locators from test logic |
| Component Object | `src/pages/components/` | Reuses repeated UI fragments |
| Workflow (Façade) | `src/workflows/` | Hides wizard complexity from tests |
| Builder | `src/builders/*.builder.ts` | Constructs complex test data objects |
| Factory | `src/builders/*.factory.ts` | Provides named preset objects |
| Fixture (Dependency Injection) | `src/fixtures/` | Injects dependencies into tests |
| Singleton | `src/services/utils/logger.ts` | Single logger instance across all classes |
| Template Method | `src/services/soap/base-soap.service.ts` | Shared SOAP client lifecycle |

---

## Page Object Model

Every screen or logical section of a Guidewire application has a corresponding page class. Page classes are the only place that contain locators and raw Playwright interactions.

```
Test
 └─► Workflow method  (e.g., fillPolicyholderInfo)
       └─► Page method  (e.g., PolicyholderPage.fillPersonDetails)
             └─► page.locator(...)  ← locator lives here and nowhere else
```

### Rules for page classes

1. **No assertions** — pages never call `expect()`. That belongs in tests.
2. **No business logic** — pages don't decide what to fill, they just fill it.
3. **Return `void` or specific values** — methods either perform an action or return a value read from the UI (e.g., a policy number).
4. **Accept domain types** — methods accept `Policy`, `Vehicle`, `Person`, not raw strings like `"Toyota"`.

---

## Component Object Pattern

Guidewire reuses the same UI fragments across all three applications. Rather than duplicating code in every page class, reusable fragments are extracted as **components**.

```
PolicyholderPage
  ├── WizardStep component       ← shared across all wizard pages
  └── AddressForm component      ← shared across PC, CC, BC

ClaimantDetailsPage
  ├── WizardStep component       ← same component, different page
  └── AddressForm component      ← scoped to claimant address panel
```

### Available components

| Component | File | Responsibility |
|-----------|------|---------------|
| `WizardStep` | `wizard-step.component.ts` | Next, Back, Finish, Save, Cancel, jump to step |
| `AddressForm` | `address-form.component.ts` | Fills/reads any address panel; accepts optional scope selector |
| `SearchModal` | `search-modal.component.ts` | Handles Guidewire popup search/select widgets |
| `DataGrid` | `data-grid.component.ts` | Reads rows, clicks actions in Guidewire LV grids |

### Scoping a component

`AddressForm` accepts a scope selector to distinguish multiple address panels on the same page:

```typescript
// Scoped to the policyholder panel only
readonly address = new AddressForm(this.page, '.gw-PolicyholderPanelSet');

// Scoped to loss location panel
readonly lossLocation = new AddressForm(this.page, '.gw-LossLocationPanelSet');
```

---

## Workflow Pattern (Façade / Step Orchestration)

Workflows orchestrate sequences of page interactions into named business steps. Each public method is one independently-awaitable step that corresponds to one wizard screen or one logical action.

### Why step methods instead of one big method?

**Problem with a single `submitPolicy(policy)` method:**
- You cannot assert intermediate state (e.g., check the premium on the quote screen before binding)
- Stack traces on failure don't tell you which step failed
- Tests cannot skip or customize individual steps

**Step methods solve this:**

```typescript
// Test can assert between steps
await policyWorkflow.startNewSubmission(policy);
await policyWorkflow.fillPolicyholderInfo(policy);
await policyWorkflow.addVehicles(policy);

// Assert premium before committing
const premium = await quotePage.getPremium();
expect(Number(premium)).toBeLessThan(2000);

await policyWorkflow.bindPolicy();
```

**For test setup** (when the submission itself isn't what's being tested), a convenience method is provided:

```typescript
// Runs all steps end-to-end — use only in beforeAll/beforeEach for setup
const policyNumber = await policyWorkflow.submitAndBindPolicy(policy);
```

### Workflow class anatomy

```typescript
export class PolicyWorkflow {
  // Page objects are private implementation details
  private readonly quotePage: QuotePage;
  private readonly d365Service = new D365PolicyService();

  // Each public method = one business step
  async startNewSubmission(policy: Policy): Promise<void> { ... }
  async fillPolicyholderInfo(policy: Policy): Promise<void> { ... }
  async addVehicles(policy: Policy): Promise<void> { ... }
  async configureCoverages(policy: Policy): Promise<void> { ... }
  async bindPolicy(): Promise<string> { ... }

  // Cross-system verification
  async verifyD365Sync(policyNumber: string): Promise<boolean> { ... }

  // Navigation utility
  async openPolicy(policyNumber: string): Promise<PolicySummaryPage> { ... }
}
```

---

## Builder Pattern

Test data objects (policy, claim, billing account) can be complex and deeply nested. The builder pattern avoids:
- Long constructor argument lists
- Partial objects with undefined fields causing type errors
- Duplicated object literals spread across test files

### PolicyBuilder example

```typescript
const policy = new PolicyBuilder()
  .withType(PolicyType.PersonalAuto)
  .withHolder(PersonFactory.standard())
  .withVehicle(VehicleBuilder.standard())
  .withVehicle(VehicleBuilder.highValue())   // add a second vehicle
  .withDriver(DriverBuilder.primaryDriver())
  .withCoverage({ type: 'BI', limit: 100000, deductible: 500 })
  .build();
```

### Builder rules

1. **`.build()` always returns a complete, valid object** — fields not explicitly set receive sensible defaults.
2. **Each `with*` method returns `this`** — enabling chaining.
3. **Builders are stateless between tests** — a new builder is created per test (injected via fixtures).
4. **Builders do not call any external service or browser** — they only construct plain data objects.

---

## Factory Pattern

Factories provide named presets for common test roles, so tests don't need to know the specific values that define a "young driver" or a "standard person":

```typescript
PersonFactory.standard()       // adult, 25–60, realistic US address
PersonFactory.youngDriver()    // 18–24 — triggers high-risk pricing
PersonFactory.seniorDriver()   // 65–85 — triggers senior discount
PersonFactory.minimal()        // only required fields, fixed values
```

```typescript
VehicleBuilder.standard()      // recent mid-range car, commute use
VehicleBuilder.highValue()     // current year luxury car, pleasure use

DriverBuilder.primaryDriver()  // insured relation, 10 years licensed

PaymentInstrumentFactory.creditCard()    // Luhn-valid test number
PaymentInstrumentFactory.bankAccount()   // Chase test routing number
PaymentInstrumentFactory.check()
```

```typescript
ClaimBuilder.autoCollision(policyNumber)  // front-end damage, $8,500 estimate
ClaimBuilder.propertyDamage(policyNumber) // water damage, $15,000 estimate
```

---

## Fixture Pattern (Dependency Injection)

Playwright fixtures are the framework's dependency injection mechanism. Instead of constructing page objects and workflows inside each test, the fixture system builds and injects them.

### Three fixture layers

```typescript
// Layer 1 — Auth: provides an authenticated page context
export const authFixtures = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    await use(page); // storage state is pre-loaded by playwright.config.ts
  },
});

// Layer 2 — Workflows: injects typed workflow objects
export const workflowFixtures = base.extend<WorkflowFixtures>({
  policyWorkflow: async ({ page }, use) => {
    await use(new PolicyWorkflow(page));
  },
  // ...
});

// Layer 3 — Data: injects builders and factories
export const dataFixtures = base.extend<DataFixtures>({
  policyBuilder: async ({}, use) => {
    await use(new PolicyBuilder());
  },
  // ...
});
```

### Composed test object

All three layers are merged into a single `test` export:

```typescript
// src/fixtures/index.ts
export const test = mergeTests(authFixtures, workflowFixtures, dataFixtures);
```

Every spec file imports from `src/fixtures/index.ts` — never directly from `@playwright/test`:

```typescript
// ✅ Correct
import { test, expect } from '../../fixtures';

// ❌ Wrong — misses injected fixtures
import { test, expect } from '@playwright/test';
```

---

## Singleton Pattern — Logger

`Logger` is a singleton that wraps `winston`. It ensures a single, consistently-configured logger instance is shared across all services and workflows.

```typescript
// Any class — get the same instance
const logger = Logger.getInstance();
logger.info('Starting new submission', { type: policy.type });
logger.debug('SOAP GetPolicy request', request);
logger.error('D365 sync failed', { policyNumber, error });
```

Log level is controlled by the `LOG_LEVEL` environment variable (default: `info`). Set `LOG_LEVEL=debug` to see SOAP request/response payloads during debugging.

---

## Template Method Pattern — BaseSoapService

All SOAP service classes inherit from `BaseSoapService`, which handles the shared client lifecycle and error wrapper. Subclasses only specify the WSDL path:

```typescript
// BaseSoapService provides:
//   - getClient(): creates and caches the soap.Client
//   - call<TReq, TRes>(): logs, invokes, and returns typed result
//   - WS-Security setup from env config

// Subclass only provides:
export class D365PolicyService extends BaseSoapService {
  protected get wsdlPath(): string {
    return path.resolve(__dirname, '../wsdl/d365-policy.wsdl');
  }

  async getPolicy(request: GetPolicyRequest): Promise<GetPolicyResponse> {
    return this.call('GetPolicy', request); // all boilerplate handled in base
  }
}
```

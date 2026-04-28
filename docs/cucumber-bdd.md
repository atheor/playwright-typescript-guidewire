# Cucumber / BDD Tests

This framework supports two complementary test styles running side-by-side:

| Style | Entry point | Runner config | Audience |
|-------|-------------|---------------|----------|
| **Playwright spec** | `src/tests/**/*.spec.ts` | `playwright.config.ts` | Developers |
| **Cucumber / BDD** | `src/cucumber/features/**/*.feature` | `playwright.cucumber.config.ts` | Developers + stakeholders |

Both styles share the same workflows, page objects, builders, and D365 services — BDD adds a Gherkin readable layer on top.

---

## How It Works

This framework uses [playwright-bdd](https://vitalets.github.io/playwright-bdd/) which integrates Cucumber's Gherkin syntax directly with the Playwright test runner. There is no separate Cucumber runner — Playwright executes everything.

```
Feature file (.feature)
      │
      ▼  bddgen (code generation step)
Generated spec (.features-gen/**/*.spec.js)
      │
      ▼  npx playwright test --config playwright.cucumber.config.ts
Step definitions (.steps.ts) ──► Workflows ──► Page Objects ──► Browser
```

1. **`bddgen`** reads `.feature` files and generates Playwright-compatible spec files into `.features-gen/`
2. **Playwright** runs those generated files exactly like any other spec
3. Step implementations call the same workflow methods as the Playwright specs

---

## Directory Structure

```
src/cucumber/
│
├── fixtures.ts                   ← Extended test instance + ScenarioState
│
├── features/
│   ├── policy/
│   │   └── personal-auto-submission.feature
│   ├── claims/
│   │   └── claim-filing.feature
│   └── billing/
│       └── billing-payment.feature
│
└── steps/
    ├── common.steps.ts           ← Shared steps used by multiple features
    ├── policy.steps.ts           ← Policy-specific step definitions
    ├── claim.steps.ts            ← Claim-specific step definitions
    └── billing.steps.ts          ← Billing-specific step definitions

.features-gen/                    ← Auto-generated; do NOT edit manually
    ├── PolicyCenter-BDD/
    ├── ClaimCenter-BDD/
    └── BillingCenter-BDD/
```

---

## Running BDD Tests

### Prerequisites

No extra installs are needed — `playwright-bdd` is already installed as a dev dependency.

### Generate then run (all BDD tests)

```bash
npm run test:cucumber
```

This runs `bddgen` (code generation) and then `playwright test` in one command.

### Per Guidewire module

```bash
npm run test:cucumber:policy    # PolicyCenter features only
npm run test:cucumber:claims    # ClaimCenter features only
npm run test:cucumber:billing   # BillingCenter features only
```

### Smoke scenarios only

```bash
npm run test:cucumber:smoke
```

### Open HTML report

```bash
npm run report:cucumber
# Opens cucumber-report/index.html
```

### Manual two-step execution

```bash
# Step 1 — generate spec files from features
npx bddgen --config playwright.cucumber.config.ts

# Step 2 — run the generated specs
npx playwright test --config playwright.cucumber.config.ts
```

### Running a single feature file

```bash
npx bddgen --config playwright.cucumber.config.ts
npx playwright test --config playwright.cucumber.config.ts \
  --grep "Personal Auto Policy Submission"
```

---

## Tagging

BDD scenarios use the same tag conventions as Playwright specs.

| Tag | Meaning |
|-----|---------|
| `@smoke` | Fast, high-confidence sanity checks |
| `@regression` | Full regression coverage |
| `@policy` | PolicyCenter scenarios |
| `@claims` | ClaimCenter scenarios |
| `@billing` | BillingCenter scenarios |

Tags appear both on the `Feature:` line (applied to every scenario) and on individual `Scenario:` blocks.

```gherkin
@policy
Feature: Personal Auto Policy Submission

  @smoke
  Scenario: Submit and bind a personal auto policy
    ...

  @regression
  Scenario: Bind a high-value vehicle policy
    ...
```

Filter by tag at the command line:

```bash
npx playwright test --config playwright.cucumber.config.ts --grep @smoke
npx playwright test --config playwright.cucumber.config.ts --grep "@policy and @regression"
```

---

## Scenario State

Steps within a scenario share a mutable `state` object — the `ScenarioState` fixture. This avoids module-level variables and keeps data flow explicit.

```typescript
// ScenarioState type (src/cucumber/fixtures.ts)
export type ScenarioState = {
  policy?: Policy;          // built by Given steps, consumed by When steps
  policyNumber?: string;    // set by When, asserted by Then
  claimNumber?: string;
  accountNumber?: string;
  priorBalance?: number;    // captured before a payment for delta assertions
};
```

The `state` object is reset automatically for every scenario (it is a `test`-scoped Playwright fixture). No manual teardown is required.

---

## Fixtures

`src/cucumber/fixtures.ts` defines a single extended `test` instance that provides every fixture step definitions need:

```typescript
export const test = bddBase.extend<{
  state: ScenarioState;
  policyWorkflow: PolicyWorkflow;
  claimWorkflow: ClaimWorkflow;
  billingWorkflow: BillingWorkflow;
}>({ ... });

export const { Given, When, Then } = createBdd(test);
```

Step definition files import `Given`, `When`, and `Then` from this module (not from `playwright-bdd` directly):

```typescript
// src/cucumber/steps/policy.steps.ts
import { Given, When, Then } from '../fixtures';
```

---

## Step Definitions

### Registering a step

```typescript
import { Given, When, Then } from '../fixtures';

Given('I have a standard personal auto policy with a standard vehicle', async ({ state }) => {
  state.policy = new PolicyBuilder()
    .withType(PolicyType.PersonalAuto)
    .withHolder(PersonFactory.standard())
    .withVehicle(VehicleBuilder.standard())
    .build();
});

When('I submit and bind the policy', async ({ policyWorkflow, state }) => {
  state.policyNumber = await policyWorkflow.submitAndBindPolicy(state.policy!);
});

Then('the policy number should match {string}', async ({ state }, pattern: string) => {
  expect(state.policyNumber).toMatch(new RegExp(pattern));
});
```

### Captured parameters

Use Cucumber Expression parameter types in step text. The most common built-in types are:

| Syntax | TypeScript type | Example |
|--------|----------------|---------|
| `{string}` | `string` | `"Bound"`, `"PC-\d+"` |
| `{int}` | `number` | `500` |
| `{float}` | `number` | `1.5` |
| `{word}` | `string` (no spaces) | `CreditCard` |

### Where to put steps

| Step topic | File |
|------------|------|
| Background setup steps shared by claims + billing | `common.steps.ts` |
| Policy Given / When / Then | `policy.steps.ts` |
| Claim When / Then | `claim.steps.ts` |
| Billing Given / When / Then | `billing.steps.ts` |
| New cross-cutting step | `common.steps.ts` |

---

## Adding a New BDD Scenario

### To an existing feature

1. Open the `.feature` file under `src/cucumber/features/`
2. Add a `Scenario:` block with the appropriate tags
3. Reuse existing step texts where possible
4. If a new step is needed, add it to the relevant `*.steps.ts` file
5. Run `npm run test:cucumber` to verify

```gherkin
@regression
Scenario: Bind a commercial auto policy
  Given I have a commercial auto policy with a fleet vehicle
  When I submit and bind the policy
  Then the policy number should be issued
```

Then implement the missing step:

```typescript
// src/cucumber/steps/policy.steps.ts
Given('I have a commercial auto policy with a fleet vehicle', async ({ state }) => {
  state.policy = new PolicyBuilder()
    .withType(PolicyType.CommercialAuto)
    .withHolder(PersonFactory.standard())
    .withVehicle(VehicleBuilder.standard())
    .build();
});
```

### New feature file + project

1. Create `src/cucumber/features/{module}/{feature-name}.feature`
2. Add step definitions in `src/cucumber/steps/{module}.steps.ts` (or the closest existing file)
3. Add the feature path to the matching `defineBddProject` call in `playwright.cucumber.config.ts`

```typescript
// playwright.cucumber.config.ts
const policyBddProject = defineBddProject({
  name: 'PolicyCenter-BDD',
  features: [
    'src/cucumber/features/policy/**/*.feature',
    'src/cucumber/features/endorsement/**/*.feature', // ← add here
  ],
  steps: [
    'src/cucumber/fixtures.ts',
    'src/cucumber/steps/policy.steps.ts',
    'src/cucumber/steps/endorsement.steps.ts',  // ← and here
  ],
});
```

---

## Playwright Projects

`playwright.cucumber.config.ts` defines three BDD projects, mirroring the main config:

| Project | Features | Base URL | Auth state |
|---------|----------|----------|------------|
| `PolicyCenter-BDD` | `features/policy/**` | `policyCenterUrl` | `.auth/policy-center.json` |
| `ClaimCenter-BDD` | `features/claims/**` | `claimCenterUrl` | `.auth/claim-center.json` |
| `BillingCenter-BDD` | `features/billing/**` | `billingCenterUrl` | `.auth/billing-center.json` |

All three depend on the shared `setup` project (same `auth.setup.ts` as the main suite), so authentication runs once before BDD tests begin.

---

## Background Steps

Gherkin `Background:` blocks run before every scenario in the feature. `bddgen` generates them as `test.beforeEach` calls:

```gherkin
Feature: Claim Filing

  Background:
    Given a bound personal auto policy exists

  Scenario: File an auto collision claim
    When I file an auto collision claim against the policy
    Then a claim number matching "CC-\d+" should be issued
```

The `Background` step (`a bound personal auto policy exists`) is defined in `common.steps.ts` and shared by both the Claims and Billing features.

---

## Configuration Reference

`playwright.cucumber.config.ts` key settings:

```typescript
defineBddProject({
  name: 'PolicyCenter-BDD',

  // Gherkin feature files to parse
  features: 'src/cucumber/features/policy/**/*.feature',

  // Step definition files AND fixtures file (must include fixtures.ts)
  steps: [
    'src/cucumber/fixtures.ts',
    'src/cucumber/steps/policy.steps.ts',
  ],
})
```

`bddgen` writes generated spec files to `.features-gen/` (configured by `outputDir` default). This directory is gitignored.

---

## Choosing Between Playwright Spec and BDD

| Criterion | Prefer Playwright spec | Prefer BDD scenario |
|-----------|----------------------|---------------------|
| Primary audience | Developers | Developers + business stakeholders |
| Scenario complexity | Complex multi-branch logic | Linear happy-path flows |
| Reusability of steps | Not required | High step reuse expected |
| Speed to write | Faster | Slightly more setup |

Both styles are valid and can coexist in the same CI pipeline. They share all infrastructure and produce reports in the same Playwright HTML report format.

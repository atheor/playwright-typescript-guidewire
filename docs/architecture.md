# Architecture

## System Context

This framework tests three Guidewire insurance platform applications — **PolicyCenter**, **ClaimCenter**, and **BillingCenter** — alongside their integration with **Microsoft Dynamics 365 (D365)** via SOAP web services.

```
┌─────────────────────────────────────────────────────────────────┐
│                     Test Automation Framework                   │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Layer 1a — Playwright Specs  (src/tests/)                 │ │
│  │  Declarative TypeScript test scenarios                     │ │
│  └────────────────────────┬───────────────────────────────────┘ │
│                           │                                     │
│  ┌────────────────────────┴───────────────────────────────────┐ │
│  │  Layer 1b — Cucumber / BDD  (src/cucumber/)                │ │
│  │  Gherkin feature files  →  bddgen  →  step definitions     │ │
│  └────────────────────────┬───────────────────────────────────┘ │
│                           │ calls                               │
│  ┌────────────────────────▼───────────────────────────────────┐ │
│  │  Layer 2 — Workflows                                       │ │
│  │  Orchestrates multi-step business processes                │ │
│  │  One method per wizard step                                │ │
│  └──────────────┬──────────────────────────┬──────────────────┘ │
│                 │ UI steps                  │ API verification   │
│  ┌──────────────▼──────────┐  ┌────────────▼──────────────────┐ │
│  │  Layer 3a — Pages       │  │  Layer 3b — Services          │ │
│  │  Page Objects           │  │  SOAP clients for D365        │ │
│  │  + Reusable Components  │  │  (Policy, Claim, Billing)     │ │
│  └─────────────────────────┘  └───────────────────────────────┘ │
│                                                                 │
│  ─────────────── Cross-cutting concerns ────────────────────── │
│  Fixtures  │  Builders / Factories  │  Types  │  Config        │
└─────────────────────────────────────────────────────────────────┘
         │                                         │
         ▼                                         ▼
┌─────────────────────┐               ┌────────────────────────┐
│  Guidewire Platform │               │  Microsoft D365        │
│  PolicyCenter  :8080│               │  SOAP Endpoint         │
│  ClaimCenter   :8080│◄─────────────►│  d365-policy.wsdl      │
│  BillingCenter :8080│  integration  │  d365-claim.wsdl       │
└─────────────────────┘               │  d365-billing.wsdl     │
                                      └────────────────────────┘
```

## Three-Layer Architecture

### Layer 1a — Playwright Specs

Test files live in `src/tests/` organized by module. Their only responsibilities are:

- **Arrange** test data using builders and factories
- **Act** by calling workflow step methods
- **Assert** outcomes using Playwright `expect`

Tests contain zero raw `page.locator()` calls and zero business logic. They read like plain-language requirements.

### Layer 1b — Cucumber / BDD

Gherkin feature files live in `src/cucumber/features/`. They describe business scenarios in natural language that non-developers can read and verify. Step definitions in `src/cucumber/steps/` translate each Gherkin line into calls to the same workflow methods used by the Playwright specs.

```
Feature file (.feature)          ← business-readable
      │  bddgen
      ▼
Generated spec (.features-gen/)  ← auto-generated; not committed
      │  playwright test
      ▼
Step definitions (.steps.ts)     ← TypeScript
      │
      ▼
Workflows, Pages, Services       ← shared with Layer 1a
```

Both styles share all infrastructure below Layer 1. Adding a BDD scenario does not require duplicating any workflow logic.

### Layer 1 shared — Fixtures

Playwright fixtures (`src/fixtures/`) inject workflow objects and test data into specs. The BDD layer has its own fixture file (`src/cucumber/fixtures.ts`) that extends `playwright-bdd`'s `test` with the same workflow objects plus a per-scenario `ScenarioState` bag.

```typescript
// Good — reads like a requirement
const policy = new PolicyBuilder()
  .withType(PolicyType.PersonalAuto)
  .withHolder(PersonFactory.standard())
  .withVehicle(VehicleBuilder.standard())
  .build();

await policyWorkflow.startNewSubmission(policy);
await policyWorkflow.fillPolicyholderInfo(policy);
await policyWorkflow.addVehicles(policy);
const policyNumber = await policyWorkflow.bindPolicy();

expect(policyNumber).toMatch(/^PC-\d+/);
```

### Layer 2 — Workflows

Workflow classes live in `src/workflows/`. Each class represents one business domain (policy, claim, billing) and exposes discrete, independently-awaitable step methods. They:

- Coordinate page object interactions in the correct sequence
- Accept strongly-typed domain objects (not raw strings)
- Include D365 SOAP verification steps for cross-system assertions
- Log every step for debugging

Each public method maps to one meaningful business action — not a UI click. This is the separation of concern boundary between "what to do" (tests) and "how to do it" (workflows and pages).

### Layer 3a — Pages

Page objects and components live in `src/pages/`. They are responsible exclusively for browser interactions. Key design decisions:

- **`BasePage`** — shared utilities for Guidewire-specific patterns (dismissing warning dialogs, list item selection, waiting for `networkidle`)
- **Components** — fine-grained, reusable UI fragments (wizard navigation, address forms, search modals, data grids) composed into pages
- **Page-per-wizard-step** — Guidewire's wizard pattern maps to one class per step, not one monolithic class per screen

### Layer 3b — Services

SOAP service classes live in `src/services/soap/`. They handle:

- WSDL-based client creation via `node-soap`
- WS-Security authentication headers
- Strongly-typed request/response objects matching `src/types/soap.types.ts`
- D365-specific operations (get, create, verify sync)

## Data Flow for a Policy Submission Test

```
spec file
  │
  ├─► PolicyBuilder.build()  ──►  Policy (typed domain object)
  │
  └─► policyWorkflow.startNewSubmission(policy)
          │
          └─► NewSubmissionPage.goto()
          └─► NewSubmissionPage.selectProduct(policy.type)
          └─► NewSubmissionPage.selectState(state)
          └─► WizardStep.next()
              │
  └─► policyWorkflow.fillPolicyholderInfo(policy)
          └─► PolicyholderPage.fillPersonDetails(policy.holder)
          └─► AddressForm.fill(address)
          └─► WizardStep.next()
              │
  └─► policyWorkflow.addVehicles(policy)
          └─► VehiclesPage.addVehicle(vehicle) × n
          └─► WizardStep.next()
              │
  └─► policyWorkflow.bindPolicy()
          └─► QuotePage.bindPolicy()
          └─► returns policyNumber: string
              │
  └─► policyWorkflow.verifyD365Sync(policyNumber)
          └─► D365PolicyService.getPolicy({ policyNumber })
              (SOAP call to D365 endpoint)
          └─► returns boolean
```

## Fixture Composition

Playwright fixtures are composed in three independent layers that get merged into a single `test` object:

```
AuthFixtures          WorkflowFixtures         DataFixtures
─────────────         ────────────────         ────────────
authenticatedPage     policyWorkflow           policyBuilder
                      claimWorkflow            claimBuilder
                      billingWorkflow          billingAccountBuilder
                                               personFactory
                              │
                              ▼
                    mergeTests(auth, workflow, data)
                              │
                              ▼
                    export { test, expect }
                    (imported in all specs)
```

## Authentication Strategy

Each Guidewire center requires its own authenticated session. The `auth.setup.ts` file logs into all three centers before any tests run and saves browser storage state (cookies + localStorage) to `.auth/`:

```
.auth/
  policy-center.json
  claim-center.json
  billing-center.json
```

Each Playwright project loads the corresponding storage state, so every test starts fully authenticated with zero login overhead.

## Parallelism Model

`fullyParallel: false` is set at the top level because Guidewire applications maintain shared server-side state (policy numbering sequences, user session locks) that can cause test interference when run fully in parallel. The safe model is:

- **Between modules** — parallel (PolicyCenter, ClaimCenter, BillingCenter run as separate projects)
- **Within a module** — sequential by default (1 worker per project)
- **CI** — 2 workers, allowing limited parallelism with retry protection

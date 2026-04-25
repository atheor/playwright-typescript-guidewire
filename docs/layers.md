# Layer Guide

A deep-dive into each layer: what it contains, how to extend it, and what to avoid.

---

## Pages Layer (`src/pages/`)

### BasePage

All page classes extend `BasePage`, which provides Guidewire-specific utilities:

| Method | Purpose |
|--------|---------|
| `waitForPageLoad()` | Waits for `networkidle` — Guidewire's heavy AJAX activity makes this critical |
| `selectListItem(locator, value)` | Clicks a GW dropdown then selects from the options popup |
| `typeAndConfirm(locator, value)` | Fills a field and presses Tab to trigger GW validation |
| `clickAndWait(locator)` | Clicks and waits for `networkidle` in parallel |
| `dismissWarningIfPresent()` | Dismisses GW's OK-to-proceed dialogs if present (non-fatal) |
| `getFieldValue(label)` | Reads a read-only field value by its label |

### WizardStep Component

Guidewire's submission wizards (PolicyCenter, ClaimCenter) share a consistent navigation bar. All wizard pages compose this component rather than re-declaring button locators.

```typescript
// In any wizard page class:
readonly wizard = new WizardStep(this.page);

// Usage in workflow:
await this.coveragesPage.wizard.next();
await this.quotePage.wizard.finish();
await this.quotePage.wizard.jumpToStep('Coverages'); // breadcrumb navigation
```

The component exposes: `next()`, `back()`, `finish()`, `save()`, `cancel()`, `isNextEnabled()`, `jumpToStep(name)`.

### AddressForm Component

Used wherever Guidewire renders an address entry panel. Accepts an optional scope selector to disambiguate multiple address forms on one page.

```typescript
// Unscoped — targets the first address form found
readonly address = new AddressForm(this.page);

// Scoped — targets address panel inside the policyholder section only
readonly address = new AddressForm(this.page, '.gw-PolicyholderPanelSet');
```

Populates: Address Line 1, Line 2 (optional), City, State (dropdown), Postal Code, Country (if present).

### SearchModal Component

Guidewire uses popup modals for lookup/select operations (picking a policy, account, or contact). This component wraps the consistent modal pattern:

```typescript
const modal = new SearchModal(this.page);
// Modal opens when a lookup field's search icon is clicked
await modal.searchBy('PolicyNumber', 'PC-00001234');
await modal.selectFirstResult();
// or
await modal.selectResultByText('PC-00001234');
```

### DataGrid Component

Guidewire's List View (LV) grids appear on summary screens. The component abstracts row access and action menus:

```typescript
// Scoped to a specific grid (recommended when multiple grids exist)
readonly activitiesGrid = new DataGrid(this.page, '[id*="activitiesLV"]');

// Interactions
await activitiesGrid.clickRow('Underwriting question');
await activitiesGrid.doubleClickRow('Note');
await activitiesGrid.rowAction('Claim Note', 'Edit');
const count = await activitiesGrid.getRowCount();
const value = await activitiesGrid.getCellValue('Row text', 2); // column index
```

### Adding a New Page

1. Create the file at `src/pages/{module}/{screen-name}.page.ts`
2. Extend `BasePage`
3. Declare locators as private `readonly` fields
4. Compose components (`WizardStep`, `AddressForm`, etc.) as public `readonly` fields
5. Expose only methods that correspond to user actions — no raw locators in the public API

```typescript
import { Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { WizardStep } from '../components/wizard-step.component';

export class MyNewPage extends BasePage {
  readonly wizard = new WizardStep(this.page);

  private readonly someField = this.page.locator('[id*="SomeField"]');

  constructor(page: Page) {
    super(page);
  }

  async fillSomeField(value: string): Promise<void> {
    await this.typeAndConfirm(this.someField, value);
  }
}
```

---

## Workflows Layer (`src/workflows/`)

### PolicyWorkflow

| Method | Step | Returns |
|--------|------|---------|
| `startNewSubmission(policy)` | Step 1: select product and state | `void` |
| `fillPolicyholderInfo(policy)` | Step 2: fill personal details and address | `void` |
| `addVehicles(policy)` | Step 3: add vehicles (auto only; skips if no vehicles) | `void` |
| `configureCoverages(policy)` | Step 4: set coverage limits/deductibles | `void` |
| `bindPolicy()` | Step 5: bind and capture policy number | `string` (policyNumber) |
| `submitAndBindPolicy(policy)` | Full happy path in one call | `string` (policyNumber) |
| `verifyD365Sync(policyNumber)` | SOAP call to D365 to confirm sync | `boolean` |
| `openPolicy(policyNumber)` | Navigates to an existing policy | `PolicySummaryPage` |

### ClaimWorkflow

| Method | Step | Returns |
|--------|------|---------|
| `startNewClaim(policyNumber)` | Step 1: search and select the policy | `void` |
| `fillLossDetails(claim)` | Step 2: loss date, type, description, location | `void` |
| `addClaimant(claim)` | Step 3: claimant details (skips if no claimant) | `void` |
| `finishClaim()` | Finish wizard, capture claim number | `string` (claimNumber) |
| `fileNewClaim(claim)` | Full happy path | `string` (claimNumber) |
| `verifyD365Sync(claimNumber)` | SOAP verification | `boolean` |
| `openClaim(claimNumber)` | Navigates to an existing claim | `ClaimSummaryPage` |

### BillingWorkflow

| Method | Purpose | Returns |
|--------|---------|---------|
| `openAccount(accountNumber)` | Navigates to billing account page | `BillingAccountPage` |
| `makePayment(accountNumber, amount, method)` | Full payment flow | `void` |
| `getD365Balance(accountNumber)` | Reads balance from D365 | `number` |
| `verifyD365Balance(accountNumber, expectedBalance)` | Asserts balance matches | `boolean` |

### Adding a New Workflow

1. Create `src/workflows/{domain}.workflow.ts`
2. Inject the page objects in the constructor — all private
3. Expose one public `async` method per business step
4. Add the workflow to `WorkflowFixtures` in `src/fixtures/workflow.fixtures.ts`

```typescript
// src/workflows/endorsement.workflow.ts
export class EndorsementWorkflow {
  private readonly endorsementPage: EndorsementPage;

  constructor(private readonly page: Page) {
    this.endorsementPage = new EndorsementPage(page);
  }

  async startEndorsement(policyNumber: string): Promise<void> { ... }
  async changeVehicle(oldVin: string, newVehicle: Vehicle): Promise<void> { ... }
  async finalizeEndorsement(): Promise<string> { ... }
}
```

---

## Tests Layer (`src/tests/`)

### Test file anatomy

```typescript
import { test, expect } from '../../fixtures';      // always from fixtures
import { PolicyBuilder } from '../../builders/policy.builder';
import { PersonFactory } from '../../builders/person.factory';
import { PolicyType } from '../../types/domain.types';

test.describe('Feature name', () => {

  // Use beforeAll only for test setup data (not assertions)
  test.beforeAll(async ({ policyWorkflow }) => {
    // Create prerequisite data once for the describe block
  });

  test('should do something @smoke @policy', async ({ policyWorkflow, policyBuilder }) => {
    // Arrange
    const policy = policyBuilder.withType(PolicyType.PersonalAuto).build();

    // Act — one workflow step per line
    await policyWorkflow.startNewSubmission(policy);
    await policyWorkflow.fillPolicyholderInfo(policy);
    const policyNumber = await policyWorkflow.bindPolicy();

    // Assert
    expect(policyNumber).toMatch(/^PC-\d+/);
  });
});
```

### Test tags

Tags are embedded in the test name string with the `@` prefix and used with `--grep`:

| Tag | Meaning |
|-----|---------|
| `@smoke` | Fast critical-path tests; run on every deployment |
| `@regression` | Full regression suite; run nightly |
| `@policy` | PolicyCenter tests |
| `@claims` | ClaimCenter tests |
| `@billing` | BillingCenter tests |

```bash
npx playwright test --grep "@smoke"                     # smoke only
npx playwright test --grep "@regression"                # full regression
npx playwright test --grep "@policy and @smoke"         # policy smoke tests
npx playwright test --grep-invert "@billing"            # exclude billing
```

### Auth setup (`auth.setup.ts`)

This file is matched by `testMatch: '**/*.setup.ts'` in the `setup` project. It runs once before all other projects and writes browser storage state (cookies + localStorage) to `.auth/`. All Playwright projects load the corresponding file, giving tests a fully authenticated browser with no login step.

The setup file must not be put in `src/tests/policy/`, `src/tests/claims/`, or `src/tests/billing/` — those directories are consumed by their respective projects only.

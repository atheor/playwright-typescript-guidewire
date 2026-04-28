# Adding New Tests

A step-by-step guide for the most common extension scenarios.

Both test styles — **Playwright spec** and **Cucumber / BDD** — are covered here. For a full BDD reference see [Cucumber / BDD Tests](./cucumber-bdd.md).

---

## Adding a Test to an Existing Feature

1. Open the relevant spec file (e.g., `src/tests/policy/personal-auto-submission.spec.ts`)
2. Add a `test()` block inside the appropriate `describe` block
3. Build test data, call workflow step methods, assert

```typescript
test('should create policy with multiple drivers @regression @policy', async ({ policyWorkflow }) => {
  const policy = new PolicyBuilder()
    .withType(PolicyType.PersonalAuto)
    .withHolder(PersonFactory.standard())
    .withVehicle(VehicleBuilder.standard())
    .withDriver(DriverBuilder.primaryDriver())
    .withDriver(
      new DriverBuilder()
        .withPerson(PersonFactory.youngDriver())
        .withRelation(DriverRelation.Child)
        .withYearsLicensed(2)
        .build()
    )
    .build();

  const policyNumber = await policyWorkflow.submitAndBindPolicy(policy);
  expect(policyNumber).toBeTruthy();
});
```

---

## Adding a New Test File

1. Create the file at `src/tests/{module}/{feature-name}.spec.ts`
2. Import `test` and `expect` from `../../fixtures` (not from `@playwright/test`)
3. Group related tests in a `describe` block
4. Tag each test with at least one module tag and one scope tag

```typescript
// src/tests/policy/homeowners-submission.spec.ts
import { test, expect } from '../../fixtures';
import { PolicyBuilder } from '../../builders/policy.builder';
import { PersonFactory } from '../../builders/person.factory';
import { PolicyType } from '../../types/domain.types';

test.describe('Homeowners Policy Submission', () => {

  test('should create and bind a homeowners policy @smoke @policy', async ({ policyWorkflow }) => {
    const policy = new PolicyBuilder()
      .withType(PolicyType.Homeowners)
      .withHolder(PersonFactory.standard())
      .build();

    const policyNumber = await policyWorkflow.submitAndBindPolicy(policy);
    expect(policyNumber).toMatch(/^PC-\d+/);
  });

});
```

---

## Adding a New Workflow Step

When a test needs to perform a business action that no existing workflow method covers:

1. Open the appropriate workflow file (e.g., `src/workflows/policy.workflow.ts`)
2. Add a page object field in the constructor if a new page is needed
3. Add the public async method

```typescript
// In PolicyWorkflow class
async startEndorsement(policyNumber: string): Promise<void> {
  this.logger.info('Starting endorsement', { policyNumber });
  const summaryPage = await this.openPolicy(policyNumber);
  await summaryPage.startEndorsement();
}
```

---

## Adding a New Page

1. Create `src/pages/{module}/{screen-name}.page.ts`
2. Extend `BasePage`
3. Use component objects for repeated UI patterns
4. Add the page to the relevant workflow's constructor

```typescript
// src/pages/policy/endorsement.page.ts
import { Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { WizardStep } from '../components/wizard-step.component';

export class EndorsementPage extends BasePage {
  readonly wizard = new WizardStep(this.page);

  private readonly effectiveDateInput = this.page.locator('[id*="EffectiveDate"]');
  private readonly reasonSelect = this.page.locator('[id*="ChangeReason"]');

  constructor(page: Page) {
    super(page);
  }

  async fillEndorsementDetails(effectiveDate: string, reason: string): Promise<void> {
    await this.typeAndConfirm(this.effectiveDateInput, effectiveDate);
    await this.reasonSelect.selectOption(reason);
  }
}
```

---

## Adding a New Component

When the same UI pattern appears in multiple pages and no existing component covers it:

1. Create `src/pages/components/{name}.component.ts`
2. Accept `Page` and an optional scope selector in the constructor
3. Expose methods that correspond to user interactions

```typescript
// src/pages/components/notes-panel.component.ts
import { Page } from '@playwright/test';

export class NotesPanel {
  private readonly addNoteBtn = this.scope.getByRole('button', { name: 'Add Note' });

  constructor(
    private readonly page: Page,
    private readonly scopeSelector: string = '.gw-NotePanelSet',
  ) {}

  private get scope() {
    return this.page.locator(this.scopeSelector);
  }

  async addNote(subject: string, body: string): Promise<void> {
    await this.addNoteBtn.click();
    await this.page.locator('[id*="Subject"]').fill(subject);
    await this.page.locator('[id*="NoteBody"]').fill(body);
    await this.page.getByRole('button', { name: 'Update' }).click();
    await this.page.waitForLoadState('networkidle');
  }
}
```

---

## Adding a New Builder / Factory

When tests need a new domain object type:

### New builder

```typescript
// src/builders/renewal.builder.ts
import { faker } from '@faker-js/faker';

export interface RenewalData {
  policyNumber: string;
  renewalDate: string;
  notes?: string;
}

export class RenewalBuilder {
  private data: Partial<RenewalData> = {};

  withPolicyNumber(policyNumber: string): this {
    this.data.policyNumber = policyNumber;
    return this;
  }

  withRenewalDate(date: string): this {
    this.data.renewalDate = date;
    return this;
  }

  withNotes(notes: string): this {
    this.data.notes = notes;
    return this;
  }

  build(): RenewalData {
    return {
      policyNumber: this.data.policyNumber ?? 'PC-000000',
      renewalDate: this.data.renewalDate ?? '2027-01-01',
      notes: this.data.notes,
    };
  }
}
```

Then inject it via the data fixtures (`src/fixtures/data.fixtures.ts`) if tests need it via fixture injection.

---

## Adding a New SOAP Operation

When a new D365 operation needs to be called from tests:

1. Add the request/response interfaces to `src/types/soap.types.ts`

```typescript
export interface GetContactRequest {
  contactId: string;
}

export interface GetContactResponse {
  contactId: string;
  fullName: string;
  email: string;
  errorCode?: string;
  errorMessage?: string;
}
```

2. Add the method to the appropriate service (or create a new service extending `BaseSoapService`)

```typescript
// In D365PolicyService (or a new D365ContactService)
async getContact(request: GetContactRequest): Promise<GetContactResponse> {
  return this.call<GetContactRequest, GetContactResponse>('GetContact', request);
}
```

3. Expose it through a workflow method so tests don't import services directly

```typescript
// In PolicyWorkflow
async verifyContactSynced(contactId: string): Promise<boolean> {
  const response = await this.d365Service.getContact({ contactId });
  return !response.errorCode;
}
```

---

## Checklist for Any New Test

### Playwright spec

- [ ] Imports `test` and `expect` from `../../fixtures`, not `@playwright/test`
- [ ] Uses a builder or factory for test data — no hardcoded strings in arrange step
- [ ] Calls workflow methods — no direct page object or locator usage
- [ ] Tagged with at least `@smoke` or `@regression` and a module tag (`@policy`, `@claims`, `@billing`)
- [ ] Each test is independent — no shared mutable state with other tests
- [ ] D365 integration is verified via `verifyD365Sync()` for cross-system tests
- [ ] `test.setTimeout()` added if the test is expected to exceed 60 seconds

### Cucumber / BDD scenario

- [ ] Step texts are written from the user's perspective, not in technical terms
- [ ] Steps reuse existing step definitions where text matches exactly
- [ ] New step definitions import `Given`/`When`/`Then` from `src/cucumber/fixtures.ts`
- [ ] Data flows between steps via `state` (not module-level variables)
- [ ] Feature file carries a module tag (`@policy`, `@claims`, `@billing`)
- [ ] Scenario carries `@smoke` or `@regression`
- [ ] Background steps are used for prerequisite setup shared across all scenarios in the feature
- [ ] Run `npm run test:cucumber` after adding to confirm `bddgen` succeeds with no unmatched steps

---

## Adding a BDD Scenario to an Existing Feature

1. Open the `.feature` file in `src/cucumber/features/{module}/`
2. Add a `Scenario:` block with tags
3. Reuse existing step texts verbatim where possible
4. Implement any missing steps in the matching `*.steps.ts` file
5. Run `npm run test:cucumber` to verify

```gherkin
@regression
Scenario: Bind a commercial auto policy
  Given I have a commercial auto policy with a fleet vehicle
  When I submit and bind the policy
  Then the policy number should be issued
```

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

## Adding a New BDD Feature File

1. Create `src/cucumber/features/{module}/{feature-name}.feature`
2. Add step definitions in `src/cucumber/steps/{module}.steps.ts`
3. Add the feature path to the matching `defineBddProject` in `playwright.cucumber.config.ts`

```typescript
// playwright.cucumber.config.ts
const policyBddProject = defineBddProject({
  name: 'PolicyCenter-BDD',
  features: [
    'src/cucumber/features/policy/**/*.feature',
    'src/cucumber/features/endorsement/**/*.feature', // ← new
  ],
  steps: [
    'src/cucumber/fixtures.ts',
    'src/cucumber/steps/policy.steps.ts',
    'src/cucumber/steps/endorsement.steps.ts',        // ← new
  ],
});
```

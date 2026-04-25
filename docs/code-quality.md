# Code Quality

## TypeScript Strict Mode

All strict TypeScript checks are enabled. The key ones that matter most for test automation:

### `noUnusedLocals` and `noUnusedParameters`

Catches copy-paste leftovers — a declared variable that is never used often indicates the test is not actually asserting what it should.

```typescript
// ❌ Compile error — policyNumber declared but never used
const policyNumber = await policyWorkflow.submitAndBindPolicy(policy);
expect(true).toBe(true); // assertion not using policyNumber

// ✅ Use what you declare
const policyNumber = await policyWorkflow.submitAndBindPolicy(policy);
expect(policyNumber).toMatch(/^PC-\d+/);
```

### `noImplicitReturns`

All code paths in a function must return. Prevents page methods that sometimes return `undefined` unexpectedly.

```typescript
// ❌ Compile error — one branch has no return
async getPolicyNumber(): Promise<string> {
  const el = this.page.locator('#policyNumber');
  if (await el.isVisible()) {
    return await el.textContent() ?? '';
  }
  // missing return here
}

// ✅ Explicit return on all paths
async getPolicyNumber(): Promise<string> {
  const el = this.page.locator('#policyNumber');
  if (await el.isVisible()) {
    return await el.textContent() ?? '';
  }
  return '';
}
```

---

## ESLint Rules

### `no-floating-promises` (error)

The single most important rule for async test code. A forgotten `await` causes the test to pass even when the action failed.

```typescript
// ❌ Will pass even if fillLossDetails throws — ESLint error
claimWorkflow.fillLossDetails(claim);
expect(await claimWorkflow.finishClaim()).toBeTruthy();

// ✅ Always await async calls
await claimWorkflow.fillLossDetails(claim);
expect(await claimWorkflow.finishClaim()).toBeTruthy();
```

### `no-explicit-any` (error)

Forces proper typing. `any` defeats TypeScript's protection against SOAP response shape mismatches.

```typescript
// ❌ Using any — ESLint error
const response: any = await d365Service.getPolicy(request);
console.log(response.whateverField); // no protection

// ✅ Use the typed response interface
const response: GetPolicyResponse = await d365Service.getPolicy(request);
console.log(response.policyNumber); // compiler verifies the field exists
```

### `playwright/no-wait-for-timeout` (warn)

`page.waitForTimeout()` is a fixed sleep — it makes tests slow and fragile (too short = flaky, too long = slow suite).

```typescript
// ❌ Fixed sleep
await page.waitForTimeout(3000);
await page.locator('#policyNumber').click();

// ✅ Wait for a condition
await page.waitForLoadState('networkidle');
await page.locator('#policyNumber').click();

// ✅ Or wait for an element to be visible
await page.locator('#policyNumber').waitFor({ state: 'visible' });
```

### `playwright/no-force-option` (warn)

`{ force: true }` bypasses Playwright's actionability checks (visible, enabled, stable). It almost always hides a real problem.

```typescript
// ❌ Hiding the real issue
await page.locator('#submitBtn').click({ force: true });

// ✅ Fix the locator or wait until the element is interactable
await page.locator('#submitBtn').waitFor({ state: 'enabled' });
await page.locator('#submitBtn').click();
```

---

## Anti-patterns

### Locators in Tests

Tests should not contain `page.locator()` calls. Locators belong in page objects.

```typescript
// ❌ Locator in test
test('should bind policy', async ({ page }) => {
  await page.locator('#submitBtn').click();
  const policyNum = await page.locator('.gw-PolicyNumber').textContent();
  expect(policyNum).toBeTruthy();
});

// ✅ Locator in page object, workflow method in test
test('should bind policy', async ({ policyWorkflow }) => {
  const policy = new PolicyBuilder().build();
  const policyNumber = await policyWorkflow.submitAndBindPolicy(policy);
  expect(policyNumber).toBeTruthy();
});
```

### Assertions in Page Objects

Page objects model the UI structure, not test outcomes. Assertions in page objects make them unusable for negative testing.

```typescript
// ❌ Assertion inside page method
async getPolicyNumber(): Promise<string> {
  const num = await this.policyNumberLocator.textContent() ?? '';
  expect(num).toMatch(/PC-\d+/); // ❌ assertion in page = fragile
  return num;
}

// ✅ Return the value, let the test assert
async getPolicyNumber(): Promise<string> {
  return await this.policyNumberLocator.textContent() ?? '';
}
```

### Business Logic in Page Objects

Decisions like "if vehicle is high value, select commercial plan" belong in workflows, not pages.

```typescript
// ❌ Business decision in page
async fillCoverages(policy: Policy): Promise<void> {
  if (policy.vehicles?.[0].value > 50000) { // ❌ logic in page
    await this.selectPlan('Commercial');
  }
}

// ✅ Decision made in workflow, page receives the resolved value
// workflow.ts:
const plan = policy.vehicles?.[0].value > 50000 ? 'Commercial' : 'Personal';
await this.coveragesPage.selectPlan(plan);
```

### Hardcoded Waits

See the `no-wait-for-timeout` section above. A hardcoded wait is always wrong — use Playwright's built-in wait utilities.

### Shared Mutable State Between Tests

```typescript
// ❌ Mutated across tests — order-dependent, flaky
let policyNumber: string;

test('create policy', async ({ policyWorkflow }) => {
  policyNumber = await policyWorkflow.submitAndBindPolicy(policy);
});

test('use policy', async ({ policyWorkflow }) => {
  await policyWorkflow.openPolicy(policyNumber); // depends on previous test
});

// ✅ Use beforeAll for shared setup, never mutation from a test body
let policyNumber: string;

test.beforeAll(async ({ policyWorkflow }) => {
  const policy = new PolicyBuilder().build();
  policyNumber = await policyWorkflow.submitAndBindPolicy(policy);
});
```

---

## Running Quality Checks

```bash
# Type check only (no emit)
npm run typecheck

# Lint (report issues)
npm run lint

# Lint + auto-fix
npm run lint:fix

# Format with Prettier
npm run format
```

Run all three before creating a pull request:

```bash
npm run typecheck && npm run lint && npm run format
```

---

## Pre-commit Hook (Recommended)

Install `husky` and `lint-staged` to automatically enforce quality on commit:

```bash
npm install --save-dev husky lint-staged
npx husky init
```

Add to `package.json`:

```json
"lint-staged": {
  "*.{ts}": ["eslint --fix", "prettier --write"],
  "*.{json,md}": ["prettier --write"]
}
```

Add to `.husky/pre-commit`:

```sh
npx lint-staged
```

This prevents committing code that fails lint or formatting checks.

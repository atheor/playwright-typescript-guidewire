# Running Tests

## Quick Reference

```bash
# All tests (all modules)
npm test

# By module
npm run test:pc          # PolicyCenter only
npm run test:cc          # ClaimCenter only
npm run test:bc          # BillingCenter only

# By tag
npm run test:smoke       # @smoke tagged tests
npm run test:regression  # @regression tagged tests

# Headed mode (see the browser)
npm run test:headed

# Reports
npm run report           # open HTML report
npm run report:allure    # generate + open Allure report
```

---

## Running Specific Tests

```bash
# Single file
npx playwright test src/tests/policy/personal-auto-submission.spec.ts

# Single test by name (partial match)
npx playwright test --grep "should create and bind"

# Tag combination
npx playwright test --grep "@smoke" --project PolicyCenter

# Exclude a tag
npx playwright test --grep-invert "@billing"

# Run with visible browser and slow-motion (useful for debugging)
npx playwright test --headed --slow-mo 500

# Debug mode — opens Playwright inspector
npx playwright test --debug

# UI mode — interactive test runner
npx playwright test --ui
```

---

## Test Execution Order

```
1. setup project
   └─► auth.setup.ts
         ├─► Authenticate PolicyCenter  → .auth/policy-center.json
         ├─► Authenticate ClaimCenter   → .auth/claim-center.json
         └─► Authenticate BillingCenter → .auth/billing-center.json

2. (in parallel, once setup completes)
   ├─► PolicyCenter project  → src/tests/policy/**
   ├─► ClaimCenter project   → src/tests/claims/**
   └─► BillingCenter project → src/tests/billing/**
```

Within each project, tests in the same `describe` block run sequentially. Different `describe` blocks in different files may run in parallel (limited to `workers` count).

---

## Reporters

### HTML Reporter

Generated automatically after every run:

```bash
npm run report
# Opens playwright-report/index.html in the browser
```

The HTML report shows:
- Pass/fail status per test
- Step-by-step timeline with durations
- Screenshots, videos, and traces on failure
- Retry history

### Allure Reporter

Requires [Allure CLI](https://allurereport.org/docs/install/) to be installed:

```bash
# Install Allure CLI (once)
brew install allure     # macOS
# or: npm i -g allure-commandline

# Generate and open after a test run
npm run report:allure
```

Allure provides:
- Test history and trends across runs
- Custom categories for failures
- Environment information panel
- Suite/feature/story grouping

---

## Filtering by Project

Each Playwright project corresponds to a Guidewire module:

```bash
npx playwright test --project PolicyCenter    # only PC tests
npx playwright test --project ClaimCenter     # only CC tests
npx playwright test --project BillingCenter   # only BC tests

# Multiple projects
npx playwright test --project PolicyCenter --project ClaimCenter
```

---

## Worker Configuration

```bash
# Override workers at runtime
npx playwright test --workers 4

# Single-threaded (safest for shared GW environments)
npx playwright test --workers 1
```

The default in `playwright.config.ts` is:
- **CI**: 2 workers
- **Local**: 1 worker

Increase workers cautiously — Guidewire policy numbering sequences and user session locks can cause interference at high parallelism.

---

## Timeouts

Override the default 60-second timeout for tests with known long operations:

```typescript
test('should process a batch renewal @regression @policy', async ({ policyWorkflow }) => {
  test.setTimeout(180_000); // 3 minutes for this test only
  // ...
});
```

Override globally in `playwright.config.ts` for an environment-wide change.

---

## Debugging a Failing Test

### Step 1: Check the HTML report

```bash
npm run report
```

Click the failing test → expand the step timeline → look for which step failed and the error message.

### Step 2: Open the trace

Click "Trace" in the report to open the Playwright trace viewer. It shows:
- Every action with a before/after screenshot
- Network requests (including SOAP calls)
- Console errors

### Step 3: Run in headed debug mode

```bash
# Opens Playwright Inspector — step through actions one by one
npx playwright test --debug src/tests/policy/personal-auto-submission.spec.ts
```

### Step 4: Enable SOAP debug logging

```bash
LOG_LEVEL=debug npx playwright test src/tests/policy/personal-auto-submission.spec.ts
```

This prints full SOAP request and response payloads to the console.

### Step 5: Use Playwright codegen to find updated locators

If the test fails because a locator no longer matches (Guidewire UI was updated):

```bash
npm run codegen
# Playwright opens a browser — interact with the page — copy the generated locators
```

---

## Common Run Scenarios

| Goal | Command |
|------|---------|
| Verify nothing broke after deployment | `npm run test:smoke` |
| Full nightly regression | `npm run test:regression` |
| PolicyCenter feature work | `npm run test:pc -- --grep "@my-feature"` |
| Investigate a single failing test | `npx playwright test --debug --grep "test name"` |
| Check SOAP integration | `npm run test:regression -- --grep "@d365"` |
| Generate fresh auth state | `npx playwright test --project setup` |

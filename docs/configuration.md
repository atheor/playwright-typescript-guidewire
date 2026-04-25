# Configuration

## Environment Configuration (`src/config/env.config.ts`)

All runtime configuration is centralised in a single `EnvConfig` object. Tests and services import from here — no `process.env` access outside this file.

### Config shape

```typescript
interface EnvConfig {
  baseUrl: string;           // default project URL (PolicyCenter)
  policyCenterUrl: string;   // PolicyCenter base URL
  claimCenterUrl: string;    // ClaimCenter base URL
  billingCenterUrl: string;  // BillingCenter base URL
  credentials: {
    username: string;        // Guidewire login username
    password: string;        // Guidewire login password
  };
  d365: {
    soapUrl: string;         // D365 SOAP endpoint
    username: string;        // WS-Security username
    password: string;        // WS-Security password
    timeout: number;         // per-request timeout in ms
  };
}
```

### Switching environments

Set `TEST_ENV=staging` (or any key defined in the `configs` map) before running tests:

```bash
TEST_ENV=staging npm run test:smoke
```

To add a new environment, add an entry to the `configs` map in `env.config.ts`:

```typescript
const configs: Record<string, EnvConfig> = {
  dev: { ... },
  staging: { ... },
  prod: {                           // new entry
    baseUrl: process.env.POLICY_CENTER_URL ?? 'https://prod.pc.example.com',
    // ...
  },
};
```

---

## Playwright Configuration (`playwright.config.ts`)

### Projects

Each Guidewire module runs as a separate Playwright project. This means:

- Projects run in sequence after the `setup` project completes
- Each project loads its own authenticated storage state
- Tests for a project can be run independently with `--project`

```typescript
projects: [
  { name: 'setup', testMatch: '**/*.setup.ts' },

  {
    name: 'PolicyCenter',
    testDir: './src/tests/policy',
    use: { baseURL: envConfig.policyCenterUrl, storageState: '.auth/policy-center.json' },
    dependencies: ['setup'],
  },
  // ClaimCenter, BillingCenter follow same pattern
]
```

### Timeouts

| Setting | Value | When to change |
|---------|-------|---------------|
| `timeout` | 60s | Increase if Guidewire pages are slow to load |
| `expect.timeout` | 15s | Increase if assertions time out on slow assertions |
| `actionTimeout` | 30s | Increase if individual clicks/fills time out |
| `navigationTimeout` | 30s | Increase for slow page navigations |

Override per-test with `test.setTimeout(120_000)` when a test has a known long operation (e.g., batch renewal).

### Retries

```typescript
retries: process.env.CI ? 2 : 0
```

Retries are only enabled in CI to handle flakiness from shared Guidewire environments. Never suppress genuine failures with retries during local development. When CI retries persist, investigate the root cause.

### Tracing and artifacts

On first retry Playwright captures:
- **Trace** — full timeline of actions, screenshots, network requests (open with `npx playwright show-trace trace.zip`)
- **Video** — screen recording of the test run
- **Screenshot** — final browser state on failure

These are uploaded to the test report and accessible via the HTML reporter.

---

## TypeScript Configuration (`tsconfig.json`)

### Strict mode flags enabled

| Flag | Effect |
|------|--------|
| `strict: true` | Enables all strict checks |
| `noUnusedLocals` | Error on declared-but-unused variables |
| `noUnusedParameters` | Error on declared-but-unused function parameters |
| `noImplicitReturns` | All code paths must return a value |
| `noFallthroughCasesInSwitch` | Switch cases must break or return |

These flags prevent common mistakes that cause test flakiness (unused variables from copy-paste, implicit returns causing `undefined` assertions).

### Path aliases

Defined in `compilerOptions.paths`. Must be matched in any bundler or module resolver used (not applicable here since Playwright uses `ts-node` under the hood with `tsconfig-paths`).

---

## ESLint Configuration (`.eslintrc.js`)

Key rules beyond TypeScript recommended:

| Rule | Level | Reason |
|------|-------|--------|
| `@typescript-eslint/no-floating-promises` | error | Forgotten `await` in async tests is a top cause of false positives |
| `@typescript-eslint/no-explicit-any` | error | Forces proper typing, preventing unsafe SOAP response access |
| `@typescript-eslint/explicit-function-return-type` | warn | Makes return types visible — especially important in page/workflow public APIs |
| `playwright/no-wait-for-timeout` | warn | Discourages `page.waitForTimeout()` (sleep) — use proper wait conditions |
| `playwright/no-force-option` | warn | Flags `{ force: true }` — usually a sign of a locator or timing problem |
| `no-console` (with exceptions) | warn | Directs output through the Logger singleton instead of raw console |

---

## Prettier Configuration (`.prettierrc`)

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always"
}
```

Run `npm run format` before committing to ensure consistent formatting. Consider adding a pre-commit hook via `husky` + `lint-staged` for automation.

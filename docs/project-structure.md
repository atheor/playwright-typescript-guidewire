# Project Structure

## Directory Tree

```
playwright-typescript-guidewire/
│
├── docs/                               ← this documentation
│
├── scripts/
│   └── generate-soap-types.js          ← generates TS types from WSDL files
│
├── src/
│   ├── config/
│   │   └── env.config.ts               ← environment-aware configuration
│   │
│   ├── types/
│   │   ├── domain.types.ts             ← shared domain model (Policy, Claim, etc.)
│   │   ├── soap.types.ts               ← D365 SOAP request/response interfaces
│   │   └── index.ts                    ← barrel export
│   │
│   ├── fixtures/
│   │   ├── auth.fixtures.ts            ← authenticated page fixture
│   │   ├── workflow.fixtures.ts        ← workflow object injection
│   │   ├── data.fixtures.ts            ← builder/factory injection
│   │   └── index.ts                    ← composed test + expect export
│   │
│   ├── pages/
│   │   ├── base.page.ts                ← shared BasePage utilities
│   │   ├── components/
│   │   │   ├── wizard-step.component.ts     ← Next/Back/Finish/Save navigation
│   │   │   ├── address-form.component.ts    ← scoped address entry
│   │   │   ├── search-modal.component.ts    ← popup search/select
│   │   │   └── data-grid.component.ts       ← LV grid rows and actions
│   │   ├── shared/
│   │   │   └── login.page.ts                ← shared login page
│   │   ├── policy/
│   │   │   ├── submission.page.ts           ← 5 wizard step classes
│   │   │   └── policy-summary.page.ts
│   │   ├── claims/
│   │   │   └── claim-entry.page.ts          ← 4 wizard step classes
│   │   └── billing/
│   │       └── billing-account.page.ts
│   │
│   ├── workflows/
│   │   ├── policy.workflow.ts          ← PolicyCenter orchestration
│   │   ├── claim.workflow.ts           ← ClaimCenter orchestration
│   │   └── billing.workflow.ts         ← BillingCenter orchestration
│   │
│   ├── builders/
│   │   ├── person.factory.ts           ← PersonFactory (standard/youngDriver/seniorDriver)
│   │   ├── policy.builder.ts           ← PolicyBuilder, VehicleBuilder, DriverBuilder
│   │   ├── claim.builder.ts            ← ClaimBuilder + static presets
│   │   └── billing-account.builder.ts  ← BillingAccountBuilder, PaymentInstrumentFactory
│   │
│   ├── services/
│   │   ├── soap/
│   │   │   ├── base-soap.service.ts    ← SOAP client lifecycle + WS-Security
│   │   │   ├── d365-policy.service.ts  ← Policy SOAP operations
│   │   │   ├── d365-claim.service.ts   ← Claim SOAP operations
│   │   │   └── d365-billing.service.ts ← Billing/payment SOAP operations
│   │   ├── wsdl/                       ← WSDL files (replace placeholders with real files)
│   │   │   ├── d365-policy.wsdl
│   │   │   ├── d365-claim.wsdl
│   │   │   └── d365-billing.wsdl
│   │   └── utils/
│   │       └── logger.ts               ← Winston singleton logger
│   │
│   └── tests/
│       ├── auth.setup.ts               ← pre-test auth state generation
│       ├── policy/
│       │   └── personal-auto-submission.spec.ts
│       ├── claims/
│       │   └── claim-filing.spec.ts
│       └── billing/
│           └── billing-payment.spec.ts
│
├── .auth/                              ← generated auth state (gitignored)
├── playwright-report/                  ← HTML test report (gitignored)
├── allure-results/                     ← Allure raw results (gitignored)
│
├── playwright.config.ts                ← Playwright configuration + projects
├── tsconfig.json                       ← TypeScript compiler options + path aliases
├── .eslintrc.js                        ← ESLint rules
├── .prettierrc                         ← Prettier formatting rules
├── .env.example                        ← environment variable template
└── package.json                        ← dependencies and npm scripts
```

## Module Boundaries

| Folder | May import from | Must NOT import from |
|--------|----------------|----------------------|
| `tests/` | `fixtures/`, `builders/`, `types/` | `pages/`, `services/` directly |
| `workflows/` | `pages/`, `services/`, `types/`, `config/` | `fixtures/`, `builders/`, `tests/` |
| `pages/` | `types/`, `config/` | `workflows/`, `services/`, `builders/` |
| `services/` | `types/`, `config/` | `pages/`, `workflows/`, `builders/` |
| `builders/` | `types/` | `pages/`, `workflows/`, `services/` |
| `fixtures/` | `workflows/`, `builders/`, `types/` | `pages/`, `services/` directly |

These boundaries enforce separation of concerns. Violating them (e.g., a page importing a service) would couple layers that should remain independent.

## TypeScript Path Aliases

The `tsconfig.json` defines path aliases so imports stay clean and refactor-safe:

```typescript
// Instead of:
import { PolicyWorkflow } from '../../../workflows/policy.workflow';

// Use:
import { PolicyWorkflow } from '@workflows/policy.workflow';
```

| Alias | Resolves to |
|-------|-------------|
| `@pages/*` | `src/pages/*` |
| `@components/*` | `src/pages/components/*` |
| `@workflows/*` | `src/workflows/*` |
| `@services/*` | `src/services/*` |
| `@builders/*` | `src/builders/*` |
| `@fixtures/*` | `src/fixtures/*` |
| `@types/*` | `src/types/*` |
| `@config/*` | `src/config/*` |
| `@utils/*` | `src/utils/*` |

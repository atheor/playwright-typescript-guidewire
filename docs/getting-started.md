# Getting Started

## Prerequisites

| Tool | Minimum Version | Notes |
|------|----------------|-------|
| Node.js | 20.x | LTS recommended |
| npm | 10.x | Comes with Node 20 |
| Access to Guidewire instances | — | PolicyCenter, ClaimCenter, BillingCenter URLs |
| Access to D365 SOAP endpoint | — | URL + credentials for integration tests |
| Real `.wsdl` files | — | Obtained from D365 admin; place in `src/services/wsdl/` |

## Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd playwright-typescript-guidewire

# 2. Install dependencies
npm install

# 3. Install Playwright browsers
npx playwright install chromium
```

## Environment Configuration

All sensitive configuration is loaded from environment variables. Never commit credentials.

```bash
# Copy the template
cp .env.example .env.local

# Edit .env.local with your actual values
```

```bash
# .env.local — fill in your values

POLICY_CENTER_URL=https://your-pc-instance/pc
CLAIM_CENTER_URL=https://your-cc-instance/cc
BILLING_CENTER_URL=https://your-bc-instance/bc

GW_USERNAME=your_username
GW_PASSWORD=your_password

D365_SOAP_URL=https://your-d365-instance/api/soap
D365_SOAP_USERNAME=d365user
D365_SOAP_PASSWORD=d365pass
D365_SOAP_TIMEOUT=30000

TEST_ENV=dev
```

Load your `.env.local` before running tests:

```bash
# Using dotenv-cli (install once: npm i -g dotenv-cli)
dotenv -e .env.local -- npm test

# Or export manually
export $(cat .env.local | xargs) && npm test
```

## WSDL Setup

Replace the placeholder WSDL files with your real D365 WSDLs:

```bash
# Copy your real WSDLs into place
cp /path/to/real/d365-policy.wsdl src/services/wsdl/
cp /path/to/real/d365-claim.wsdl  src/services/wsdl/
cp /path/to/real/d365-billing.wsdl src/services/wsdl/

# Generate TypeScript types from the WSDLs (one-time + whenever WSDL changes)
npm run generate:soap-types
```

Generated types are written to `src/types/generated/`. Commit them to source control so CI doesn't require WSDL access at test time.

## Verify the Setup

```bash
# Type-check the entire project (no emitting, just validation)
npm run typecheck

# Lint the source
npm run lint

# Run smoke tests to verify end-to-end connectivity
npm run test:smoke
```

## Running Your First Test

```bash
# Run a single test file in headed mode (see the browser)
npx playwright test src/tests/policy/personal-auto-submission.spec.ts --headed

# Run all PolicyCenter tests
npm run test:pc

# Open the HTML report after a run
npm run report
```

## CI/CD Setup

For a CI pipeline (GitHub Actions, Azure DevOps, etc.), the key differences from local are:

```yaml
# Example GitHub Actions excerpt
- name: Install dependencies
  run: npm ci

- name: Install Playwright browsers
  run: npx playwright install --with-deps chromium

- name: Run tests
  env:
    POLICY_CENTER_URL: ${{ secrets.POLICY_CENTER_URL }}
    CLAIM_CENTER_URL: ${{ secrets.CLAIM_CENTER_URL }}
    BILLING_CENTER_URL: ${{ secrets.BILLING_CENTER_URL }}
    GW_USERNAME: ${{ secrets.GW_USERNAME }}
    GW_PASSWORD: ${{ secrets.GW_PASSWORD }}
    D365_SOAP_URL: ${{ secrets.D365_SOAP_URL }}
    D365_SOAP_USERNAME: ${{ secrets.D365_SOAP_USERNAME }}
    D365_SOAP_PASSWORD: ${{ secrets.D365_SOAP_PASSWORD }}
    TEST_ENV: staging
    CI: true
  run: npm test

- name: Upload test report
  uses: actions/upload-artifact@v4
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
```

In CI mode the framework automatically:
- Retries failed tests up to **2 times**
- Runs with **2 workers**
- Forbids `test.only` (the `forbidOnly` flag)
- Captures traces, screenshots, and video on failure

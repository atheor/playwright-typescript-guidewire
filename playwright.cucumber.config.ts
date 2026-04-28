import { defineConfig, devices } from '@playwright/test';
import { defineBddProject } from 'playwright-bdd';
import { config as envConfig } from './src/config/env.config';

/**
 * Playwright config for Cucumber/BDD tests.
 *
 * Uses playwright-bdd to generate Playwright test files from Gherkin feature files.
 *
 * Generate + run:
 *   npx bddgen --config playwright.cucumber.config.ts && npx playwright test --config playwright.cucumber.config.ts
 *
 * Or use the npm scripts:
 *   npm run test:cucumber
 *   npm run test:cucumber:policy
 *   npm run test:cucumber:claims
 *   npm run test:cucumber:billing
 */

/** PolicyCenter BDD project — feature files under features/policy */
const policyBddProject = defineBddProject({
  name: 'PolicyCenter-BDD',
  features: 'src/cucumber/features/policy/**/*.feature',
  steps: [
    'src/cucumber/fixtures.ts',
    'src/cucumber/steps/policy.steps.ts',
    'src/cucumber/steps/quote-and-buy.steps.ts',
  ],
});

/** ClaimCenter BDD project — feature files under features/claims */
const claimBddProject = defineBddProject({
  name: 'ClaimCenter-BDD',
  features: 'src/cucumber/features/claims/**/*.feature',
  steps: [
    'src/cucumber/fixtures.ts',
    'src/cucumber/steps/claim.steps.ts',
    'src/cucumber/steps/common.steps.ts',
  ],
});

/** BillingCenter BDD project — feature files under features/billing */
const billingBddProject = defineBddProject({
  name: 'BillingCenter-BDD',
  features: 'src/cucumber/features/billing/**/*.feature',
  steps: [
    'src/cucumber/fixtures.ts',
    'src/cucumber/steps/billing.steps.ts',
    'src/cucumber/steps/common.steps.ts',
  ],
});

export default defineConfig({
  testDir: '.features-gen',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : 1,
  timeout: 60_000,
  expect: { timeout: 15_000 },

  reporter: [
    ['list'],
    ['html', { outputFolder: 'cucumber-report', open: 'never' }],
  ],

  use: {
    baseURL: envConfig.baseUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    actionTimeout: 30_000,
    navigationTimeout: 30_000,
    headless: true,
  },

  projects: [
    // Shared auth setup — reuses the same setup file as the main test suite
    {
      name: 'setup',
      testDir: './src/tests',
      testMatch: /auth\.setup/,
    },

    // PolicyCenter BDD tests
    {
      ...policyBddProject,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: envConfig.policyCenterUrl,
        storageState: '.auth/policy-center.json',
      },
      dependencies: ['setup'],
    },

    // ClaimCenter BDD tests
    {
      ...claimBddProject,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: envConfig.claimCenterUrl,
        storageState: '.auth/claim-center.json',
      },
      dependencies: ['setup'],
    },

    // BillingCenter BDD tests
    {
      ...billingBddProject,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: envConfig.billingCenterUrl,
        storageState: '.auth/billing-center.json',
      },
      dependencies: ['setup'],
    },
  ],
});

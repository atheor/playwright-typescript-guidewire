import { defineConfig, devices } from '@playwright/test';
import { config as envConfig } from './src/config/env.config';

export default defineConfig({
  testDir: './src/tests',
  fullyParallel: false, // Guidewire often has shared state; per-module parallelism is safer
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : 1,
  timeout: 60_000,
  expect: { timeout: 15_000 },

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['allure-playwright', { outputFolder: 'allure-results' }],
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
    // Setup project: shared auth state
    {
      name: 'setup',
      testMatch: '**/*.setup.ts',
    },

    // PolicyCenter
    {
      name: 'PolicyCenter',
      testDir: './src/tests/policy',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: envConfig.policyCenterUrl,
        storageState: '.auth/policy-center.json',
      },
      dependencies: ['setup'],
    },

    // ClaimCenter
    {
      name: 'ClaimCenter',
      testDir: './src/tests/claims',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: envConfig.claimCenterUrl,
        storageState: '.auth/claim-center.json',
      },
      dependencies: ['setup'],
    },

    // BillingCenter
    {
      name: 'BillingCenter',
      testDir: './src/tests/billing',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: envConfig.billingCenterUrl,
        storageState: '.auth/billing-center.json',
      },
      dependencies: ['setup'],
    },
  ],
});

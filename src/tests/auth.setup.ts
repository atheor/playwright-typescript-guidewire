import { test as setup } from '@playwright/test';
import { LoginPage } from '../pages/shared/login.page';
import { config } from '../config/env.config';
import path from 'path';
import fs from 'fs';

const AUTH_DIR = path.resolve('.auth');

/**
 * Auth setup — runs once before all test projects.
 * Logs into each Guidewire center and saves storage state (cookies + localStorage).
 * Playwright projects load the saved state, so tests skip login entirely.
 */

setup('Authenticate PolicyCenter', async ({ page }) => {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
  const loginPage = new LoginPage(page);
  await loginPage.goto(config.policyCenterUrl);
  await loginPage.login();
  await page.context().storageState({ path: path.join(AUTH_DIR, 'policy-center.json') });
});

setup('Authenticate ClaimCenter', async ({ page }) => {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
  const loginPage = new LoginPage(page);
  await loginPage.goto(config.claimCenterUrl);
  await loginPage.login();
  await page.context().storageState({ path: path.join(AUTH_DIR, 'claim-center.json') });
});

setup('Authenticate BillingCenter', async ({ page }) => {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
  const loginPage = new LoginPage(page);
  await loginPage.goto(config.billingCenterUrl);
  await loginPage.login();
  await page.context().storageState({ path: path.join(AUTH_DIR, 'billing-center.json') });
});

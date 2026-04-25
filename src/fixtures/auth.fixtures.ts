import { test as base, Page } from '@playwright/test';
import { config } from '../config/env.config';

/**
 * Auth fixture: handles login and storage state reuse.
 * Storage state is written by *.setup.ts and loaded per Playwright project.
 */
export type AuthFixtures = {
  authenticatedPage: Page;
};

export const authFixtures = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Storage state is already loaded via playwright.config.ts project settings.
    // This fixture exposes `page` post-auth for convenience.
    await use(page);
  },
});

export { config };

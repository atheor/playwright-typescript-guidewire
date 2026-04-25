import { mergeTests } from '@playwright/test';
import { authFixtures, AuthFixtures } from './auth.fixtures';
import { workflowFixtures, WorkflowFixtures } from './workflow.fixtures';
import { dataFixtures, DataFixtures } from './data.fixtures';

/**
 * Composed test object — import this in all specs instead of @playwright/test directly.
 *
 * Usage:
 *   import { test, expect } from '@fixtures/index';
 */
export const test = mergeTests(authFixtures, workflowFixtures, dataFixtures);
export { expect } from '@playwright/test';

export type AllFixtures = AuthFixtures & WorkflowFixtures & DataFixtures;

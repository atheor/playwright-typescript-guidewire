import { test as bddBase, createBdd } from 'playwright-bdd';
import { PolicyWorkflow } from '../workflows/policy.workflow';
import { ClaimWorkflow } from '../workflows/claim.workflow';
import { BillingWorkflow } from '../workflows/billing.workflow';
import { Policy } from '../types/domain.types';

/**
 * Scenario-scoped state shared between steps within a single Cucumber scenario.
 * Each field is populated by Given/When steps and consumed by Then steps.
 */
export type ScenarioState = {
  policy?: Policy;
  policyNumber?: string;
  claimNumber?: string;
  accountNumber?: string;
  priorBalance?: number;
};

/**
 * Extended Playwright test instance derived from playwright-bdd's test.
 * Includes per-scenario state and all Guidewire workflow helpers.
 */
export const test = bddBase.extend<{
  state: ScenarioState;
  policyWorkflow: PolicyWorkflow;
  claimWorkflow: ClaimWorkflow;
  billingWorkflow: BillingWorkflow;
}>({
  state: async ({}, use) => {
    await use({});
  },
  policyWorkflow: async ({ page }, use) => {
    await use(new PolicyWorkflow(page));
  },
  claimWorkflow: async ({ page }, use) => {
    await use(new ClaimWorkflow(page));
  },
  billingWorkflow: async ({ page }, use) => {
    await use(new BillingWorkflow(page));
  },
});

export const { Given, When, Then } = createBdd(test);

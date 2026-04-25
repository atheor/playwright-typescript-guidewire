import { test as base } from '@playwright/test';
import { PolicyWorkflow } from '../workflows/policy.workflow';
import { ClaimWorkflow } from '../workflows/claim.workflow';
import { BillingWorkflow } from '../workflows/billing.workflow';

export type WorkflowFixtures = {
  policyWorkflow: PolicyWorkflow;
  claimWorkflow: ClaimWorkflow;
  billingWorkflow: BillingWorkflow;
};

export const workflowFixtures = base.extend<WorkflowFixtures>({
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

import { test as bddBase, createBdd } from 'playwright-bdd';
import { PolicyWorkflow } from '../workflows/policy.workflow';
import { ClaimWorkflow } from '../workflows/claim.workflow';
import { BillingWorkflow } from '../workflows/billing.workflow';
import { QuoteAndBuyWorkflow } from '../workflows/quote-and-buy.workflow';
import {
  Policy,
  QuoteResult,
  AustralianVehicle,
  HomeProperty,
  QuoteProductType,
} from '../types/domain.types';
import { Person } from '../types/domain.types';

/**
 * Scenario-scoped state shared between steps within a single Cucumber scenario.
 * Each field is populated by Given/When steps and consumed by Then steps.
 */
export type ScenarioState = {
  // Existing fields
  policy?: Policy;
  policyNumber?: string;
  claimNumber?: string;
  accountNumber?: string;
  priorBalance?: number;

  // Quote & Buy fields (RACQ Australia)
  applicant?: Person;
  vehicle?: AustralianVehicle;
  property?: HomeProperty;
  product?: QuoteProductType;
  quoteResult?: QuoteResult;
  secondaryQuoteResult?: QuoteResult;
  quoteNumber?: string;
  priorPremium?: number;
  annualPremiumForComparison?: number;
  racqMember?: boolean;
  existingPolicies?: number;
  claimsFreeYears?: number;
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
  quoteAndBuyWorkflow: QuoteAndBuyWorkflow;
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
  quoteAndBuyWorkflow: async ({ page }, use) => {
    await use(new QuoteAndBuyWorkflow(page));
  },
});

export const { Given, When, Then } = createBdd(test);

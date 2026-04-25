import { test as base } from '@playwright/test';
import { PolicyBuilder } from '../builders/policy.builder';
import { ClaimBuilder } from '../builders/claim.builder';
import { BillingAccountBuilder } from '../builders/billing-account.builder';
import { PersonFactory } from '../builders/person.factory';

export type DataFixtures = {
  policyBuilder: PolicyBuilder;
  claimBuilder: ClaimBuilder;
  billingAccountBuilder: BillingAccountBuilder;
  personFactory: typeof PersonFactory;
};

export const dataFixtures = base.extend<DataFixtures>({
  policyBuilder: async ({}, use) => {
    await use(new PolicyBuilder());
  },
  claimBuilder: async ({}, use) => {
    await use(new ClaimBuilder());
  },
  billingAccountBuilder: async ({}, use) => {
    await use(new BillingAccountBuilder());
  },
  personFactory: async ({}, use) => {
    await use(PersonFactory);
  },
});

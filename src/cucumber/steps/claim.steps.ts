import { expect } from '@playwright/test';
import { When, Then } from '../fixtures';
import { ClaimBuilder } from '../../builders/claim.builder';
import { PersonFactory } from '../../builders/person.factory';
import { LossType } from '../../types/domain.types';

When('I file an auto collision claim against the policy', async ({ claimWorkflow, state }) => {
  const claim = ClaimBuilder.autoCollision(state.policyNumber!);
  state.claimNumber = await claimWorkflow.fileNewClaim(claim);
});

When('I file a property damage claim against the policy', async ({ claimWorkflow, state }) => {
  const claim = ClaimBuilder.propertyDamage(state.policyNumber!);
  state.claimNumber = await claimWorkflow.fileNewClaim(claim);
});

When('I file a liability claim with claimant details against the policy', async ({ claimWorkflow, state }) => {
  const claim = new ClaimBuilder()
    .withPolicyNumber(state.policyNumber!)
    .withLossType(LossType.Liability)
    .withLossDescription('Third-party bodily injury')
    .withClaimant({ person: PersonFactory.standard(), relation: 'Other' })
    .build();
  state.claimNumber = await claimWorkflow.fileNewClaim(claim);
});

Then('a claim number matching {string} should be issued', async ({ state }, pattern: string) => {
  expect(state.claimNumber).toMatch(new RegExp(pattern));
});

Then('the claim number should be issued', async ({ state }) => {
  expect(state.claimNumber).toBeTruthy();
});

Then('the claim should be synced to D365', async ({ claimWorkflow, state }) => {
  const synced = await claimWorkflow.verifyD365Sync(state.claimNumber!);
  expect(synced).toBe(true);
});

Then('the claim status should be {string}', async ({ claimWorkflow, state }, statusLabel: string) => {
  const summaryPage = await claimWorkflow.openClaim(state.claimNumber!);
  const status = await summaryPage.getStatus();
  expect(status).toBe(statusLabel);
});

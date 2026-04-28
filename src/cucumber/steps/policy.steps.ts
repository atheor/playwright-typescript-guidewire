import { expect } from '@playwright/test';
import { Given, When, Then } from '../fixtures';
import { PolicyBuilder, VehicleBuilder, DriverBuilder } from '../../builders/policy.builder';
import { PersonFactory } from '../../builders/person.factory';
import { PolicyType } from '../../types/domain.types';

Given('I have a standard personal auto policy with a standard vehicle', async ({ state }) => {
  state.policy = new PolicyBuilder()
    .withType(PolicyType.PersonalAuto)
    .withHolder(PersonFactory.standard())
    .withVehicle(VehicleBuilder.standard())
    .withDriver(DriverBuilder.primaryDriver())
    .build();
});

Given('I have a personal auto policy with a high-value vehicle', async ({ state }) => {
  state.policy = new PolicyBuilder()
    .withType(PolicyType.PersonalAuto)
    .withHolder(PersonFactory.standard())
    .withVehicle(VehicleBuilder.highValue())
    .withDriver(DriverBuilder.primaryDriver())
    .build();
});

Given('I have a personal auto policy for a young driver', async ({ state }) => {
  state.policy = new PolicyBuilder()
    .withType(PolicyType.PersonalAuto)
    .withHolder(PersonFactory.youngDriver())
    .withVehicle(VehicleBuilder.standard())
    .build();
});

When('I submit and bind the policy', async ({ policyWorkflow, state }) => {
  state.policyNumber = await policyWorkflow.submitAndBindPolicy(state.policy!);
});

Then('the policy number should match {string}', async ({ state }, pattern: string) => {
  expect(state.policyNumber).toMatch(new RegExp(pattern));
});

Then('the policy number should be issued', async ({ state }) => {
  expect(state.policyNumber).toBeTruthy();
});

Then('the policy should be synced to D365', async ({ policyWorkflow, state }) => {
  const synced = await policyWorkflow.verifyD365Sync(state.policyNumber!);
  expect(synced).toBe(true);
});

Then('the policy status should be {string}', async ({ policyWorkflow, state }, statusLabel: string) => {
  const summaryPage = await policyWorkflow.openPolicy(state.policyNumber!);
  const status = await summaryPage.getStatus();
  expect(status).toBe(statusLabel);
});

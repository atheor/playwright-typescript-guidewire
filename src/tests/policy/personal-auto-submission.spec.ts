import { test, expect } from '../../fixtures';
import { PolicyBuilder, VehicleBuilder, DriverBuilder } from '../../builders/policy.builder';
import { PersonFactory } from '../../builders/person.factory';
import { PolicyType, PolicyStatus } from '../../types/domain.types';

/**
 * PolicyCenter — Personal Auto submission tests
 *
 * Tags: @smoke, @regression, @policy, @personal-auto
 */

test.describe('Personal Auto Policy Submission', () => {
  test(
    'should create and bind a personal auto policy @smoke @policy',
    async ({ policyWorkflow }) => {
      // Arrange — build test data
      const policy = new PolicyBuilder()
        .withType(PolicyType.PersonalAuto)
        .withHolder(PersonFactory.standard())
        .withVehicle(VehicleBuilder.standard())
        .withDriver(DriverBuilder.primaryDriver())
        .build();

      // Act — run through the wizard step by step
      await policyWorkflow.startNewSubmission(policy);
      await policyWorkflow.fillPolicyholderInfo(policy);
      await policyWorkflow.addVehicles(policy);
      await policyWorkflow.configureCoverages(policy);
      const policyNumber = await policyWorkflow.bindPolicy();

      // Assert
      expect(policyNumber).toMatch(/^PC-\d+/);
    },
  );

  test(
    'should bind policy and verify D365 sync @regression @policy',
    async ({ policyWorkflow }) => {
      const policy = new PolicyBuilder()
        .withType(PolicyType.PersonalAuto)
        .withHolder(PersonFactory.standard())
        .withVehicle(VehicleBuilder.standard())
        .build();

      const policyNumber = await policyWorkflow.submitAndBindPolicy(policy);
      expect(policyNumber).toBeTruthy();

      const synced = await policyWorkflow.verifyD365Sync(policyNumber);
      expect(synced).toBe(true);
    },
  );

  test(
    'should bind a high-value vehicle policy @regression @policy',
    async ({ policyWorkflow }) => {
      const policy = new PolicyBuilder()
        .withType(PolicyType.PersonalAuto)
        .withHolder(PersonFactory.standard())
        .withVehicle(VehicleBuilder.highValue())
        .withDriver(DriverBuilder.primaryDriver())
        .build();

      const policyNumber = await policyWorkflow.submitAndBindPolicy(policy);
      expect(policyNumber).toBeTruthy();

      const summaryPage = await policyWorkflow.openPolicy(policyNumber);
      const status = await summaryPage.getStatus();
      expect(status).toBe(PolicyStatus.Bound);
    },
  );

  test(
    'should create policy for a young driver @regression @policy',
    async ({ policyWorkflow }) => {
      const policy = new PolicyBuilder()
        .withType(PolicyType.PersonalAuto)
        .withHolder(PersonFactory.youngDriver())
        .withVehicle(VehicleBuilder.standard())
        .build();

      // Young drivers may trigger a referral — assert quote page is reached
      await policyWorkflow.startNewSubmission(policy);
      await policyWorkflow.fillPolicyholderInfo(policy);
      await policyWorkflow.addVehicles(policy);
      await policyWorkflow.configureCoverages(policy);
      const policyNumber = await policyWorkflow.bindPolicy();
      expect(policyNumber).toBeTruthy();
    },
  );
});

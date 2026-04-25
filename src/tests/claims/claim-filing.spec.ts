import { test, expect } from '../../fixtures';
import { ClaimBuilder } from '../../builders/claim.builder';
import { PolicyBuilder, VehicleBuilder } from '../../builders/policy.builder';
import { PersonFactory } from '../../builders/person.factory';
import { PolicyType, LossType, ClaimStatus } from '../../types/domain.types';

/**
 * ClaimCenter — claim filing tests
 *
 * Tags: @smoke, @regression, @claims
 */

test.describe('Claim Filing', () => {
  /**
   * A bound policy is needed for all claim tests.
   * We create it once per describe block via beforeAll (fastest approach).
   * For test isolation, override policyNumber per test.
   */
  let boundPolicyNumber: string;

  test.beforeAll(async ({ policyWorkflow }) => {
    const policy = new PolicyBuilder()
      .withType(PolicyType.PersonalAuto)
      .withHolder(PersonFactory.standard())
      .withVehicle(VehicleBuilder.standard())
      .build();
    boundPolicyNumber = await policyWorkflow.submitAndBindPolicy(policy);
  });

  test(
    'should file an auto collision claim @smoke @claims',
    async ({ claimWorkflow }) => {
      // Arrange
      const claim = ClaimBuilder.autoCollision(boundPolicyNumber);

      // Act
      await claimWorkflow.startNewClaim(claim.policyNumber);
      await claimWorkflow.fillLossDetails(claim);
      const claimNumber = await claimWorkflow.finishClaim();

      // Assert
      expect(claimNumber).toMatch(/^CC-\d+/);
    },
  );

  test(
    'should file a claim and verify D365 sync @regression @claims',
    async ({ claimWorkflow }) => {
      const claim = ClaimBuilder.autoCollision(boundPolicyNumber);
      const claimNumber = await claimWorkflow.fileNewClaim(claim);

      expect(claimNumber).toBeTruthy();

      const synced = await claimWorkflow.verifyD365Sync(claimNumber);
      expect(synced).toBe(true);
    },
  );

  test(
    'should file a property damage claim @regression @claims',
    async ({ claimWorkflow }) => {
      const claim = ClaimBuilder.propertyDamage(boundPolicyNumber);
      const claimNumber = await claimWorkflow.fileNewClaim(claim);

      const summaryPage = await claimWorkflow.openClaim(claimNumber);
      const status = await summaryPage.getStatus();
      expect(status).toBe(ClaimStatus.Open);
    },
  );

  test(
    'should file a claim with claimant details @regression @claims',
    async ({ claimWorkflow }) => {
      const claimant = {
        person: PersonFactory.standard(),
        relation: 'Other',
      };

      const claim = new ClaimBuilder()
        .withPolicyNumber(boundPolicyNumber)
        .withLossType(LossType.Liability)
        .withLossDescription('Third-party bodily injury')
        .withClaimant(claimant)
        .build();

      const claimNumber = await claimWorkflow.fileNewClaim(claim);
      expect(claimNumber).toBeTruthy();
    },
  );
});

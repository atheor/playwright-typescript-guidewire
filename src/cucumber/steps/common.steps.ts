import { Given } from '../fixtures';
import { PolicyBuilder, VehicleBuilder } from '../../builders/policy.builder';
import { PersonFactory } from '../../builders/person.factory';
import { PolicyType } from '../../types/domain.types';

/**
 * Shared step definitions used by both Claim Filing and Billing features.
 * Included in both the ClaimCenter-BDD and BillingCenter-BDD projects.
 */

Given('a bound personal auto policy exists', async ({ policyWorkflow, state }) => {
  const policy = new PolicyBuilder()
    .withType(PolicyType.PersonalAuto)
    .withHolder(PersonFactory.standard())
    .withVehicle(VehicleBuilder.standard())
    .build();

  state.policyNumber = await policyWorkflow.submitAndBindPolicy(policy);
  // In Guidewire BC the account number maps 1:1 from the policy number
  state.accountNumber = state.policyNumber;
});

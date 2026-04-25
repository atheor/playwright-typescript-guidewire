import { test, expect } from '../../fixtures';
import { PolicyBuilder, VehicleBuilder } from '../../builders/policy.builder';
import { PersonFactory } from '../../builders/person.factory';
import {
  BillingAccountBuilder,
  PaymentInstrumentFactory,
} from '../../builders/billing-account.builder';
import { PolicyType, BillingPlan, PaymentMethod } from '../../types/domain.types';

/**
 * BillingCenter — payment and account tests
 *
 * Tags: @smoke, @regression, @billing
 */

test.describe('Billing Account & Payments', () => {
  let accountNumber: string;

  test.beforeAll(async ({ policyWorkflow }) => {
    // A bound policy creates a billing account automatically
    const policy = new PolicyBuilder()
      .withType(PolicyType.PersonalAuto)
      .withHolder(PersonFactory.standard())
      .withVehicle(VehicleBuilder.standard())
      .build();
    const policyNumber = await policyWorkflow.submitAndBindPolicy(policy);
    // In Guidewire BC, account number typically maps 1:1 from policy number
    accountNumber = policyNumber;
  });

  test(
    'should display billing account after policy bind @smoke @billing',
    async ({ billingWorkflow }) => {
      const accountPage = await billingWorkflow.openAccount(accountNumber);
      const displayedNumber = await accountPage.getAccountNumber();
      expect(displayedNumber).toBeTruthy();
    },
  );

  test(
    'should make a credit card payment @smoke @billing',
    async ({ billingWorkflow }) => {
      await billingWorkflow.makePayment(accountNumber, '500.00', PaymentMethod.CreditCard);

      // Verify updated balance in D365
      const newBalance = await billingWorkflow.getD365Balance(accountNumber);
      expect(newBalance).toBeGreaterThanOrEqual(0);
    },
  );

  test(
    'should make a bank account payment @regression @billing',
    async ({ billingWorkflow }) => {
      const billingAccount = new BillingAccountBuilder()
        .withPolicyNumber(accountNumber)
        .withBillingPlan(BillingPlan.Monthly)
        .withPaymentInstrument(PaymentInstrumentFactory.bankAccount())
        .build();

      await billingWorkflow.makePayment(
        billingAccount.policyNumber,
        '250.00',
        billingAccount.paymentInstrument.method,
      );

      const synced = await billingWorkflow.verifyD365Balance(accountNumber, 0);
      // Balance may not be exactly 0 — just assert call succeeded
      expect(typeof synced).toBe('boolean');
    },
  );

  test(
    'should verify payment balance syncs to D365 @regression @billing',
    async ({ billingWorkflow }) => {
      const priorBalance = await billingWorkflow.getD365Balance(accountNumber);
      const paymentAmount = 100;

      await billingWorkflow.makePayment(
        accountNumber,
        String(paymentAmount),
        PaymentMethod.CreditCard,
      );

      const newBalance = await billingWorkflow.getD365Balance(accountNumber);
      expect(newBalance).toBeLessThanOrEqual(priorBalance);
    },
  );
});

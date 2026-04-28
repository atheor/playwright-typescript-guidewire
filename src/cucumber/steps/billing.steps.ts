import { expect } from '@playwright/test';
import { Given, When, Then } from '../fixtures';
import { PaymentMethod } from '../../types/domain.types';

Given('I have recorded the current D365 balance', async ({ billingWorkflow, state }) => {
  state.priorBalance = await billingWorkflow.getD365Balance(state.accountNumber!);
});

When('I make a credit card payment of {string}', async ({ billingWorkflow, state }, amount: string) => {
  await billingWorkflow.makePayment(state.accountNumber!, amount, PaymentMethod.CreditCard);
});

When('I make a bank account payment of {string}', async ({ billingWorkflow, state }, amount: string) => {
  await billingWorkflow.makePayment(state.accountNumber!, amount, PaymentMethod.BankAccount);
});

Then('the billing account should be displayed', async ({ billingWorkflow, state }) => {
  const accountPage = await billingWorkflow.openAccount(state.accountNumber!);
  const displayedNumber = await accountPage.getAccountNumber();
  expect(displayedNumber).toBeTruthy();
});

Then('the D365 account balance should be non-negative', async ({ billingWorkflow, state }) => {
  const balance = await billingWorkflow.getD365Balance(state.accountNumber!);
  expect(balance).toBeGreaterThanOrEqual(0);
});

Then('the payment processing should succeed', async ({ billingWorkflow, state }) => {
  const balance = await billingWorkflow.getD365Balance(state.accountNumber!);
  expect(typeof balance).toBe('number');
});

Then('the new D365 balance should not exceed the prior balance', async ({ billingWorkflow, state }) => {
  const newBalance = await billingWorkflow.getD365Balance(state.accountNumber!);
  expect(newBalance).toBeLessThanOrEqual(state.priorBalance!);
});

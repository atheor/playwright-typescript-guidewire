// Generated from: src/cucumber/features/billing/billing-payment.feature
import { test } from "../../../../../../src/cucumber/fixtures.ts";

test.describe('Billing Account Payments', () => {

  test.beforeEach('Background', async ({ Given, policyWorkflow, state }, testInfo) => { if (testInfo.error) return;
    await Given('a bound personal auto policy exists', null, { policyWorkflow, state }); 
  });
  
  test('Display billing account after policy bind', { tag: ['@billing', '@smoke'] }, async ({ Then, billingWorkflow, state }) => { 
    await Then('the billing account should be displayed', null, { billingWorkflow, state }); 
  });

  test('Make a credit card payment', { tag: ['@billing', '@smoke'] }, async ({ When, Then, billingWorkflow, state }) => { 
    await When('I make a credit card payment of "500.00"', null, { billingWorkflow, state }); 
    await Then('the D365 account balance should be non-negative', null, { billingWorkflow, state }); 
  });

  test('Make a bank account payment', { tag: ['@billing', '@regression'] }, async ({ When, Then, billingWorkflow, state }) => { 
    await When('I make a bank account payment of "250.00"', null, { billingWorkflow, state }); 
    await Then('the payment processing should succeed', null, { billingWorkflow, state }); 
  });

  test('Verify payment balance syncs to D365', { tag: ['@billing', '@regression'] }, async ({ Given, When, Then, billingWorkflow, state }) => { 
    await Given('I have recorded the current D365 balance', null, { billingWorkflow, state }); 
    await When('I make a credit card payment of "100.00"', null, { billingWorkflow, state }); 
    await Then('the new D365 balance should not exceed the prior balance', null, { billingWorkflow, state }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('src/cucumber/features/billing/billing-payment.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":10,"pickleLine":8,"tags":["@billing","@smoke"],"steps":[{"pwStepLine":7,"gherkinStepLine":5,"keywordType":"Context","textWithKeyword":"Given a bound personal auto policy exists","isBg":true,"stepMatchArguments":[]},{"pwStepLine":11,"gherkinStepLine":9,"keywordType":"Outcome","textWithKeyword":"Then the billing account should be displayed","stepMatchArguments":[]}]},
  {"pwTestLine":14,"pickleLine":12,"tags":["@billing","@smoke"],"steps":[{"pwStepLine":7,"gherkinStepLine":5,"keywordType":"Context","textWithKeyword":"Given a bound personal auto policy exists","isBg":true,"stepMatchArguments":[]},{"pwStepLine":15,"gherkinStepLine":13,"keywordType":"Action","textWithKeyword":"When I make a credit card payment of \"500.00\"","stepMatchArguments":[{"group":{"start":32,"value":"\"500.00\"","children":[{"start":33,"value":"500.00","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":16,"gherkinStepLine":14,"keywordType":"Outcome","textWithKeyword":"Then the D365 account balance should be non-negative","stepMatchArguments":[]}]},
  {"pwTestLine":19,"pickleLine":17,"tags":["@billing","@regression"],"steps":[{"pwStepLine":7,"gherkinStepLine":5,"keywordType":"Context","textWithKeyword":"Given a bound personal auto policy exists","isBg":true,"stepMatchArguments":[]},{"pwStepLine":20,"gherkinStepLine":18,"keywordType":"Action","textWithKeyword":"When I make a bank account payment of \"250.00\"","stepMatchArguments":[{"group":{"start":33,"value":"\"250.00\"","children":[{"start":34,"value":"250.00","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":21,"gherkinStepLine":19,"keywordType":"Outcome","textWithKeyword":"Then the payment processing should succeed","stepMatchArguments":[]}]},
  {"pwTestLine":24,"pickleLine":22,"tags":["@billing","@regression"],"steps":[{"pwStepLine":7,"gherkinStepLine":5,"keywordType":"Context","textWithKeyword":"Given a bound personal auto policy exists","isBg":true,"stepMatchArguments":[]},{"pwStepLine":25,"gherkinStepLine":23,"keywordType":"Context","textWithKeyword":"Given I have recorded the current D365 balance","stepMatchArguments":[]},{"pwStepLine":26,"gherkinStepLine":24,"keywordType":"Action","textWithKeyword":"When I make a credit card payment of \"100.00\"","stepMatchArguments":[{"group":{"start":32,"value":"\"100.00\"","children":[{"start":33,"value":"100.00","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":27,"gherkinStepLine":25,"keywordType":"Outcome","textWithKeyword":"Then the new D365 balance should not exceed the prior balance","stepMatchArguments":[]}]},
]; // bdd-data-end
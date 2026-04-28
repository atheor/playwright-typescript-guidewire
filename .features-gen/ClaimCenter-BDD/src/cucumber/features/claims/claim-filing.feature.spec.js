// Generated from: src/cucumber/features/claims/claim-filing.feature
import { test } from "../../../../../../src/cucumber/fixtures.ts";

test.describe('Claim Filing', () => {

  test.beforeEach('Background', async ({ Given, policyWorkflow, state }, testInfo) => { if (testInfo.error) return;
    await Given('a bound personal auto policy exists', null, { policyWorkflow, state }); 
  });
  
  test('File an auto collision claim', { tag: ['@claims', '@smoke'] }, async ({ When, Then, claimWorkflow, state }) => { 
    await When('I file an auto collision claim against the policy', null, { claimWorkflow, state }); 
    await Then('a claim number matching "CC-\\d+" should be issued', null, { state }); 
  });

  test('File a claim and verify D365 sync', { tag: ['@claims', '@regression'] }, async ({ When, Then, And, claimWorkflow, state }) => { 
    await When('I file an auto collision claim against the policy', null, { claimWorkflow, state }); 
    await Then('the claim number should be issued', null, { state }); 
    await And('the claim should be synced to D365', null, { claimWorkflow, state }); 
  });

  test('File a property damage claim', { tag: ['@claims', '@regression'] }, async ({ When, Then, claimWorkflow, state }) => { 
    await When('I file a property damage claim against the policy', null, { claimWorkflow, state }); 
    await Then('the claim status should be "Open"', null, { claimWorkflow, state }); 
  });

  test('File a claim with claimant details', { tag: ['@claims', '@regression'] }, async ({ When, Then, claimWorkflow, state }) => { 
    await When('I file a liability claim with claimant details against the policy', null, { claimWorkflow, state }); 
    await Then('the claim number should be issued', null, { state }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('src/cucumber/features/claims/claim-filing.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":10,"pickleLine":8,"tags":["@claims","@smoke"],"steps":[{"pwStepLine":7,"gherkinStepLine":5,"keywordType":"Context","textWithKeyword":"Given a bound personal auto policy exists","isBg":true,"stepMatchArguments":[]},{"pwStepLine":11,"gherkinStepLine":9,"keywordType":"Action","textWithKeyword":"When I file an auto collision claim against the policy","stepMatchArguments":[]},{"pwStepLine":12,"gherkinStepLine":10,"keywordType":"Outcome","textWithKeyword":"Then a claim number matching \"CC-\\d+\" should be issued","stepMatchArguments":[{"group":{"start":24,"value":"\"CC-\\d+\"","children":[{"start":25,"value":"CC-\\d+","children":[{"start":28,"value":"\\d+","children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":15,"pickleLine":13,"tags":["@claims","@regression"],"steps":[{"pwStepLine":7,"gherkinStepLine":5,"keywordType":"Context","textWithKeyword":"Given a bound personal auto policy exists","isBg":true,"stepMatchArguments":[]},{"pwStepLine":16,"gherkinStepLine":14,"keywordType":"Action","textWithKeyword":"When I file an auto collision claim against the policy","stepMatchArguments":[]},{"pwStepLine":17,"gherkinStepLine":15,"keywordType":"Outcome","textWithKeyword":"Then the claim number should be issued","stepMatchArguments":[]},{"pwStepLine":18,"gherkinStepLine":16,"keywordType":"Outcome","textWithKeyword":"And the claim should be synced to D365","stepMatchArguments":[]}]},
  {"pwTestLine":21,"pickleLine":19,"tags":["@claims","@regression"],"steps":[{"pwStepLine":7,"gherkinStepLine":5,"keywordType":"Context","textWithKeyword":"Given a bound personal auto policy exists","isBg":true,"stepMatchArguments":[]},{"pwStepLine":22,"gherkinStepLine":20,"keywordType":"Action","textWithKeyword":"When I file a property damage claim against the policy","stepMatchArguments":[]},{"pwStepLine":23,"gherkinStepLine":21,"keywordType":"Outcome","textWithKeyword":"Then the claim status should be \"Open\"","stepMatchArguments":[{"group":{"start":27,"value":"\"Open\"","children":[{"start":28,"value":"Open","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":26,"pickleLine":24,"tags":["@claims","@regression"],"steps":[{"pwStepLine":7,"gherkinStepLine":5,"keywordType":"Context","textWithKeyword":"Given a bound personal auto policy exists","isBg":true,"stepMatchArguments":[]},{"pwStepLine":27,"gherkinStepLine":25,"keywordType":"Action","textWithKeyword":"When I file a liability claim with claimant details against the policy","stepMatchArguments":[]},{"pwStepLine":28,"gherkinStepLine":26,"keywordType":"Outcome","textWithKeyword":"Then the claim number should be issued","stepMatchArguments":[]}]},
]; // bdd-data-end
// Generated from: src/cucumber/features/policy/personal-auto-submission.feature
import { test } from "../../../../../../src/cucumber/fixtures.ts";

test.describe('Personal Auto Policy Submission', () => {

  test('Submit and bind a personal auto policy', { tag: ['@policy', '@smoke'] }, async ({ Given, When, Then, policyWorkflow, state }) => { 
    await Given('I have a standard personal auto policy with a standard vehicle', null, { state }); 
    await When('I submit and bind the policy', null, { policyWorkflow, state }); 
    await Then('the policy number should match "PC-\\d+"', null, { state }); 
  });

  test('Bind policy and verify D365 sync', { tag: ['@policy', '@regression'] }, async ({ Given, When, Then, And, policyWorkflow, state }) => { 
    await Given('I have a standard personal auto policy with a standard vehicle', null, { state }); 
    await When('I submit and bind the policy', null, { policyWorkflow, state }); 
    await Then('the policy number should be issued', null, { state }); 
    await And('the policy should be synced to D365', null, { policyWorkflow, state }); 
  });

  test('Bind a high-value vehicle policy', { tag: ['@policy', '@regression'] }, async ({ Given, When, Then, And, policyWorkflow, state }) => { 
    await Given('I have a personal auto policy with a high-value vehicle', null, { state }); 
    await When('I submit and bind the policy', null, { policyWorkflow, state }); 
    await Then('the policy number should be issued', null, { state }); 
    await And('the policy status should be "Bound"', null, { policyWorkflow, state }); 
  });

  test('Create policy for a young driver', { tag: ['@policy', '@regression'] }, async ({ Given, When, Then, policyWorkflow, state }) => { 
    await Given('I have a personal auto policy for a young driver', null, { state }); 
    await When('I submit and bind the policy', null, { policyWorkflow, state }); 
    await Then('the policy number should be issued', null, { state }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('src/cucumber/features/policy/personal-auto-submission.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":5,"tags":["@policy","@smoke"],"steps":[{"pwStepLine":7,"gherkinStepLine":6,"keywordType":"Context","textWithKeyword":"Given I have a standard personal auto policy with a standard vehicle","stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":7,"keywordType":"Action","textWithKeyword":"When I submit and bind the policy","stepMatchArguments":[]},{"pwStepLine":9,"gherkinStepLine":8,"keywordType":"Outcome","textWithKeyword":"Then the policy number should match \"PC-\\d+\"","stepMatchArguments":[{"group":{"start":31,"value":"\"PC-\\d+\"","children":[{"start":32,"value":"PC-\\d+","children":[{"start":35,"value":"\\d+","children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":12,"pickleLine":11,"tags":["@policy","@regression"],"steps":[{"pwStepLine":13,"gherkinStepLine":12,"keywordType":"Context","textWithKeyword":"Given I have a standard personal auto policy with a standard vehicle","stepMatchArguments":[]},{"pwStepLine":14,"gherkinStepLine":13,"keywordType":"Action","textWithKeyword":"When I submit and bind the policy","stepMatchArguments":[]},{"pwStepLine":15,"gherkinStepLine":14,"keywordType":"Outcome","textWithKeyword":"Then the policy number should be issued","stepMatchArguments":[]},{"pwStepLine":16,"gherkinStepLine":15,"keywordType":"Outcome","textWithKeyword":"And the policy should be synced to D365","stepMatchArguments":[]}]},
  {"pwTestLine":19,"pickleLine":18,"tags":["@policy","@regression"],"steps":[{"pwStepLine":20,"gherkinStepLine":19,"keywordType":"Context","textWithKeyword":"Given I have a personal auto policy with a high-value vehicle","stepMatchArguments":[]},{"pwStepLine":21,"gherkinStepLine":20,"keywordType":"Action","textWithKeyword":"When I submit and bind the policy","stepMatchArguments":[]},{"pwStepLine":22,"gherkinStepLine":21,"keywordType":"Outcome","textWithKeyword":"Then the policy number should be issued","stepMatchArguments":[]},{"pwStepLine":23,"gherkinStepLine":22,"keywordType":"Outcome","textWithKeyword":"And the policy status should be \"Bound\"","stepMatchArguments":[{"group":{"start":28,"value":"\"Bound\"","children":[{"start":29,"value":"Bound","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":26,"pickleLine":25,"tags":["@policy","@regression"],"steps":[{"pwStepLine":27,"gherkinStepLine":26,"keywordType":"Context","textWithKeyword":"Given I have a personal auto policy for a young driver","stepMatchArguments":[]},{"pwStepLine":28,"gherkinStepLine":27,"keywordType":"Action","textWithKeyword":"When I submit and bind the policy","stepMatchArguments":[]},{"pwStepLine":29,"gherkinStepLine":28,"keywordType":"Outcome","textWithKeyword":"Then the policy number should be issued","stepMatchArguments":[]}]},
]; // bdd-data-end
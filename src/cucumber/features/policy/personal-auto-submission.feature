@policy
Feature: Personal Auto Policy Submission

  @smoke
  Scenario: Submit and bind a personal auto policy
    Given I have a standard personal auto policy with a standard vehicle
    When I submit and bind the policy
    Then the policy number should match "PC-\d+"

  @regression
  Scenario: Bind policy and verify D365 sync
    Given I have a standard personal auto policy with a standard vehicle
    When I submit and bind the policy
    Then the policy number should be issued
    And the policy should be synced to D365

  @regression
  Scenario: Bind a high-value vehicle policy
    Given I have a personal auto policy with a high-value vehicle
    When I submit and bind the policy
    Then the policy number should be issued
    And the policy status should be "Bound"

  @regression
  Scenario: Create policy for a young driver
    Given I have a personal auto policy for a young driver
    When I submit and bind the policy
    Then the policy number should be issued

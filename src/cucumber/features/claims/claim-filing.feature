@claims
Feature: Claim Filing

  Background:
    Given a bound personal auto policy exists

  @smoke
  Scenario: File an auto collision claim
    When I file an auto collision claim against the policy
    Then a claim number matching "CC-\d+" should be issued

  @regression
  Scenario: File a claim and verify D365 sync
    When I file an auto collision claim against the policy
    Then the claim number should be issued
    And the claim should be synced to D365

  @regression
  Scenario: File a property damage claim
    When I file a property damage claim against the policy
    Then the claim status should be "Open"

  @regression
  Scenario: File a claim with claimant details
    When I file a liability claim with claimant details against the policy
    Then the claim number should be issued

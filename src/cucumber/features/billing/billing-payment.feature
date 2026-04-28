@billing
Feature: Billing Account Payments

  Background:
    Given a bound personal auto policy exists

  @smoke
  Scenario: Display billing account after policy bind
    Then the billing account should be displayed

  @smoke
  Scenario: Make a credit card payment
    When I make a credit card payment of "500.00"
    Then the D365 account balance should be non-negative

  @regression
  Scenario: Make a bank account payment
    When I make a bank account payment of "250.00"
    Then the payment processing should succeed

  @regression
  Scenario: Verify payment balance syncs to D365
    Given I have recorded the current D365 balance
    When I make a credit card payment of "100.00"
    Then the new D365 balance should not exceed the prior balance

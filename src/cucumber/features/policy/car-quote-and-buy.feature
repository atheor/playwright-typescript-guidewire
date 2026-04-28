@policy @car-insurance
Feature: RACQ Comprehensive Car Insurance — Quote and Buy

  As a Queensland driver
  I want to get a car insurance quote from RACQ
  So that I can purchase comprehensive cover for my vehicle online

  Background:
    Given I am on the RACQ car insurance quote page

  # ─── Smoke ──────────────────────────────────────────────────────────────────

  @smoke
  Scenario: Brisbane driver gets comprehensive car quote and buys online
    Given I am a 35 year old driver living in "4000" Brisbane
    And I want to insure a 2021 Toyota Corolla sedan
    When I complete the quote with standard coverage options
    Then a premium should be displayed in Australian dollars
    And the quote number should be generated
    When I accept the quote and pay by credit card
    Then a policy number should be issued
    And a confirmation email should be sent

  @smoke
  Scenario: Gold Coast driver gets comprehensive car quote
    Given I am a 42 year old driver living in "4217" Gold Coast
    And I want to insure a 2022 Toyota RAV4 SUV
    When I complete the quote with standard coverage options
    Then a premium should be displayed in Australian dollars
    And the quote number should be generated

  # ─── Demographic pricing ────────────────────────────────────────────────────

  @regression
  Scenario: Young driver (21yo) receives higher premium than standard adult
    Given I am a 21 year old driver living in "4000" Brisbane
    And I want to insure a 2020 Toyota Corolla sedan
    When I complete the quote with standard coverage options
    Then the annual premium should exceed 2000 dollars
    And an age loading notice should be displayed

  @regression
  Scenario: Senior driver (68yo) comprehensive car quote completes successfully
    Given I am a 68 year old driver living in "4066" Toowong
    And I want to insure a 2021 Toyota Corolla sedan
    When I complete the quote with standard coverage options
    Then a premium should be displayed in Australian dollars
    And the quote number should be generated

  # ─── Discounts ──────────────────────────────────────────────────────────────

  @regression
  Scenario: RACQ member discount reduces comprehensive car premium
    Given I am a 40 year old driver living in "4000" Brisbane
    And I want to insure a 2021 Toyota Corolla sedan
    And I am an RACQ member
    When I complete the quote with standard coverage options
    Then the RACQ member discount should be applied to the quote
    And the discounted premium should be lower than the non-member premium

  @regression
  Scenario: Multi-policy discount applied with 3 existing RACQ policies
    Given I am a 40 year old driver living in "4000" Brisbane
    And I want to insure a 2021 Toyota Corolla sedan
    And I have 3 existing RACQ policies
    When I complete the quote with standard coverage options
    Then the multi-policy discount should be applied to the quote

  @regression
  Scenario: Claims-free 5-year discount applied to quote
    Given I am a 40 year old driver living in "4000" Brisbane
    And I want to insure a 2021 Toyota Corolla sedan
    And I have been claims-free for 5 years
    When I complete the quote with standard coverage options
    Then the claims-free discount should be applied to the quote

  @regression
  Scenario Outline: RACQ member discount applied across multiple Brisbane suburbs
    Given I am a 40 year old driver living in "<postcode>" <suburb>
    And I want to insure a <year> <make> <model>
    And I am an RACQ member
    When I complete the quote with standard coverage options
    Then the RACQ member discount should be applied to the quote

    Examples:
      | postcode | suburb     | year | make   | model   |
      | 4000     | Brisbane   | 2021 | Toyota | Corolla |
      | 4101     | South Bank | 2020 | Mazda  | CX-5    |
      | 4032     | Chermside  | 2019 | Hyundai | Tucson |

  # ─── Excess adjustments ─────────────────────────────────────────────────────

  @regression
  Scenario: Increasing excess from $750 to $1500 reduces the annual premium
    Given I am a 35 year old driver living in "4000" Brisbane
    And I want to insure a 2021 Toyota Corolla sedan
    When I complete the quote with a $750 excess
    And I record the current premium amount
    And I change the excess to $1500
    Then the new premium should be lower than the recorded premium

  @regression
  Scenario: Increasing excess from $750 to $2000 gives maximum premium reduction
    Given I am a 35 year old driver living in "4000" Brisbane
    And I want to insure a 2021 Toyota Corolla sedan
    When I complete the quote with a $750 excess
    And I record the current premium amount
    And I change the excess to $2000
    Then the new premium should be lower than the recorded premium

  # ─── Optional covers ────────────────────────────────────────────────────────

  @regression
  Scenario: Adding hire car cover increases the premium
    Given I am a 35 year old driver living in "4000" Brisbane
    And I want to insure a 2021 Toyota Corolla sedan
    When I complete the quote without hire car cover
    And I record the current premium amount
    And I add hire car cover to the policy
    Then the new premium should be higher than the recorded premium

  @regression
  Scenario: Adding windscreen protection increases the premium
    Given I am a 35 year old driver living in "4000" Brisbane
    And I want to insure a 2021 Toyota Corolla sedan
    When I complete the quote without windscreen cover
    And I record the current premium amount
    And I add windscreen protection to the policy
    Then the new premium should be higher than the recorded premium

  # ─── Payment frequency ──────────────────────────────────────────────────────

  @regression
  Scenario: Annual payment is cheaper than 12 monthly instalments
    Given I am a 35 year old driver living in "4000" Brisbane
    And I want to insure a 2021 Toyota Corolla sedan
    When I get a quote with annual payment frequency
    And I record the annual premium amount
    When I get a quote with monthly payment frequency for the same risk
    Then the annual premium should be less than 12 times the monthly premium

  # ─── Vehicle types ───────────────────────────────────────────────────────────

  @regression
  Scenario: High-value Mercedes C-Class quote completes with elevated premium
    Given I am a 45 year old driver living in "4000" Brisbane
    And I want to insure a 2023 Mercedes-Benz C300 sedan
    When I complete the quote with standard coverage options
    Then the annual premium should exceed 1500 dollars
    And the quote number should be generated

  @regression
  Scenario: Financed vehicle — financier noted on the certificate of insurance
    Given I am a 35 year old driver living in "4068" Toowong
    And I want to insure a 2022 Mazda CX-5 SUV
    And the vehicle is financed with "Commonwealth Bank of Australia"
    When I complete the quote with standard coverage options
    Then a premium should be displayed in Australian dollars
    And the financier should be noted in the quote details

  @regression
  Scenario: Classic vehicle (30+ years old) follows agreed value path
    Given I am a 50 year old driver living in "4066" Toowong
    And I want to insure a classic 1993 Ford Falcon sedan
    When I complete the quote with standard coverage options
    Then a premium should be displayed in Australian dollars
    And agreed value options should be available

  # ─── Third party products ────────────────────────────────────────────────────

  @regression
  Scenario: Third party property damage quote for low-value vehicle
    Given I am a 35 year old driver living in "4000" Brisbane
    And I want to insure a 2006 Honda Civic sedan
    When I complete a third party property damage quote
    Then a premium should be displayed in Australian dollars
    And the quote number should be generated

  # ─── Save and retrieve ───────────────────────────────────────────────────────

  @regression
  Scenario: Save a quote for later and retrieve it using the reference number
    Given I am a 35 year old driver living in "4000" Brisbane
    And I want to insure a 2021 Toyota Corolla sedan
    When I complete the quote with standard coverage options
    And I save the quote for later
    Then a quote reference number should be provided
    When I retrieve the saved quote using the reference number
    Then the quote details should match the original submission

  @regression
  Scenario: Expired quote (>30 days) shows expiry warning when retrieved
    Given a quote reference for an expired quote
    When I try to retrieve the expired quote
    Then an expiry warning should be displayed

  # ─── Validation ─────────────────────────────────────────────────────────────

  @regression
  Scenario: Non-QLD postcode shows RACQ service availability message
    Given I am a driver living at a NSW address with postcode "2000"
    When I start a comprehensive car quote
    Then a service availability message should be displayed

@policy @home-insurance
Feature: RACQ Home and Contents Insurance — Quote and Buy

  As a Queensland homeowner or renter
  I want to get a home and contents insurance quote from RACQ
  So that I can protect my property and belongings online

  Background:
    Given I am on the RACQ home insurance quote page

  # ─── Smoke ──────────────────────────────────────────────────────────────────

  @smoke
  Scenario: Owner-occupier gets home and contents quote for Brisbane brick home
    Given I own a 3-bedroom brick home built in 2005 in "4066" Toowong
    And the building is insured for 650000 dollars
    And the contents are insured for 120000 dollars
    When I complete the home and contents quote
    Then a combined home and contents premium should be displayed in Australian dollars
    And the quote number should be generated

  @smoke
  Scenario: Apartment renter gets contents-only quote for South Bank unit
    Given I rent a 2-bedroom apartment in "4101" South Bank
    And the contents are insured for 80000 dollars
    When I complete the contents-only quote
    Then a contents premium should be displayed in Australian dollars
    And the quote number should be generated

  # ─── Pricing factors ────────────────────────────────────────────────────────

  @regression
  Scenario: Combined home and contents quote is higher than contents-only
    Given I own a 3-bedroom brick home built in 2005 in "4066" Toowong
    And the building is insured for 650000 dollars
    And the contents are insured for 120000 dollars
    When I record the home and contents premium
    And I get a contents-only quote for the same property
    Then the home and contents premium should be higher than the contents-only premium

  @regression
  Scenario: Pre-1970 fibro construction home attracts elevated premium
    Given I own a 3-bedroom fibro home built in 1965 in "4305" Ipswich
    And the building is insured for 420000 dollars
    And the contents are insured for 80000 dollars
    When I record the fibro home premium
    And I get a quote for a modern brick equivalent property
    Then the fibro home premium should be higher than the brick home premium

  @regression
  Scenario: High sum insured home ($1.2M building) completes quote successfully
    Given I own a 5-bedroom brick home built in 2018 in "4068" Indooroopilly
    And the building is insured for 1200000 dollars
    And the contents are insured for 250000 dollars
    When I complete the home and contents quote
    Then a premium should be displayed in Australian dollars
    And the quote number should be generated

  @regression
  Scenario: Home with pool included in quote with liability acknowledgement
    Given I own a 4-bedroom brick home built in 2000 in "4109" Sunnybank
    And the property has a swimming pool
    And the building is insured for 680000 dollars
    And the contents are insured for 130000 dollars
    When I complete the home and contents quote
    Then a premium should be displayed in Australian dollars

  # ─── Discounts ──────────────────────────────────────────────────────────────

  @regression
  Scenario: Security alarm discount reduces home insurance premium
    Given I own a 3-bedroom brick home built in 2005 in "4066" Toowong
    And the home has an approved security alarm
    And the building is insured for 650000 dollars
    And the contents are insured for 120000 dollars
    When I complete the home and contents quote
    Then the security alarm discount should be applied to the quote

  @regression
  Scenario: Multi-policy discount applied when existing car policy is held
    Given I own a 3-bedroom brick home built in 2005 in "4066" Toowong
    And the building is insured for 650000 dollars
    And the contents are insured for 120000 dollars
    And I have 1 existing RACQ policy
    When I complete the home and contents quote
    Then the multi-policy discount should be applied to the quote

  @regression
  Scenario: RACQ member discount reduces home insurance premium
    Given I own a 3-bedroom brick home built in 2005 in "4066" Toowong
    And the building is insured for 650000 dollars
    And the contents are insured for 120000 dollars
    And I am an RACQ member
    When I complete the home and contents quote
    Then the RACQ member discount should be applied to the quote

  # ─── Optional covers ────────────────────────────────────────────────────────

  @regression
  Scenario: Portable contents add-on increases the premium
    Given I own a 3-bedroom brick home built in 2005 in "4066" Toowong
    And the contents are insured for 120000 dollars
    When I complete the home and contents quote without portable contents cover
    And I record the current premium amount
    And I add portable contents cover for 5000 dollars
    Then the new premium should be higher than the recorded premium

  @regression
  Scenario: Accidental damage cover add-on increases the premium
    Given I own a 3-bedroom brick home built in 2005 in "4066" Toowong
    And the contents are insured for 120000 dollars
    When I complete the home and contents quote without accidental damage cover
    And I record the current premium amount
    And I add accidental damage cover to the policy
    Then the new premium should be higher than the recorded premium

  # ─── Landlord insurance ─────────────────────────────────────────────────────

  @regression
  Scenario: Landlord insurance quote for investment property in Chermside
    Given I own an investment property — a 3-bedroom home built in 1998 in "4032" Chermside
    And the building is insured for 550000 dollars
    When I complete the landlord insurance quote
    Then a premium should be displayed in Australian dollars
    And the quote number should be generated

  # ─── Buy flow ───────────────────────────────────────────────────────────────

  @smoke
  Scenario: Owner-occupier completes home insurance purchase by credit card
    Given I own a 3-bedroom brick home built in 2005 in "4066" Toowong
    And the building is insured for 650000 dollars
    And the contents are insured for 120000 dollars
    When I complete the home and contents quote
    And I accept the quote and pay by credit card
    Then a policy number should be issued
    And a confirmation email should be sent

  @regression
  Scenario: Home insurance purchased by direct debit (monthly payments)
    Given I own a 3-bedroom brick home built in 2005 in "4066" Toowong
    And the building is insured for 650000 dollars
    And the contents are insured for 120000 dollars
    When I complete the home and contents quote with monthly payment frequency
    And I accept the quote and pay by direct debit
    Then a policy number should be issued

@policy @ctp
Feature: RACQ Queensland CTP (Green Slip) — Quote and Buy

  As a Queensland vehicle owner
  I want to get a CTP green slip quote from RACQ
  So that I can renew or purchase my compulsory third party insurance online

  Background:
    Given I am on the RACQ CTP green slip quote page

  # ─── Smoke ──────────────────────────────────────────────────────────────────

  @smoke
  Scenario: Standard QLD CTP quote for class 1 passenger sedan
    Given I have a 2020 Toyota Corolla sedan registered in Queensland
    And the vehicle registration number is "123ABC"
    When I request a CTP green slip quote
    Then the CTP premium should be displayed in Australian dollars
    And the green slip expiry date should be shown
    And I can proceed to purchase the CTP policy

  @smoke
  Scenario: Standard QLD CTP quote for hatchback
    Given I have a 2021 Mazda Mazda3 hatchback registered in Queensland
    And the vehicle registration number is "456DEF"
    When I request a CTP green slip quote
    Then the CTP premium should be displayed in Australian dollars

  # ─── Vehicle class variations ────────────────────────────────────────────────

  @regression
  Scenario: CTP quote for class 3 light commercial ute (Ford Ranger)
    Given I have a 2020 Ford Ranger ute registered in Queensland
    And the vehicle registration number is "789GHI"
    When I request a CTP green slip quote
    Then the CTP premium should be displayed in Australian dollars
    And the vehicle class should be indicated as commercial

  @regression
  Scenario: CTP quote for SUV (class 1)
    Given I have a 2022 Toyota RAV4 SUV registered in Queensland
    And the vehicle registration number is "321JKL"
    When I request a CTP green slip quote
    Then the CTP premium should be displayed in Australian dollars

  # ─── Demographic variations ──────────────────────────────────────────────────

  @regression
  Scenario: Young driver (21yo) CTP quote — regulated rate applies
    Given I am a 21 year old driver in Queensland
    And I have a 2020 Toyota Corolla sedan registered in Queensland
    And the vehicle registration number is "654MNO"
    When I request a CTP green slip quote
    Then the CTP premium should be displayed in Australian dollars
    And the premium should reflect the regulated CTP rate

  @regression
  Scenario: Senior driver (70yo) CTP quote — regulated rate applies
    Given I am a 70 year old driver in Queensland
    And I have a 2020 Toyota Corolla sedan registered in Queensland
    And the vehicle registration number is "987PQR"
    When I request a CTP green slip quote
    Then the CTP premium should be displayed in Australian dollars

  # ─── Purchase flow ───────────────────────────────────────────────────────────

  @regression
  Scenario: Standard driver purchases CTP green slip online
    Given I have a 2020 Toyota Corolla sedan registered in Queensland
    And the vehicle registration number is "123ABC"
    When I request a CTP green slip quote
    And I accept the CTP quote and pay by credit card
    Then a CTP policy number should be issued
    And a confirmation email should be sent
    And the green slip certificate should be available for download

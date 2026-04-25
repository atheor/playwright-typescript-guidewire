import { Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { Policy } from '../../types/domain.types';
import { WizardStep } from '../components/wizard-step.component';
import { AddressForm } from '../components/address-form.component';

/**
 * New Submission — Step 1: Policy Type selection (PolicyCenter)
 */
export class NewSubmissionPage extends BasePage {
  readonly wizard = new WizardStep(this.page);

  private readonly productSelector = this.page.locator('[id*="ProductCode"], [name*="ProductCode"]');
  private readonly stateSelector = this.page.locator('[id*="BaseState"], [name*="BaseState"]');
  private readonly nextBtn = this.page.getByRole('button', { name: 'Next' });

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.page.getByRole('link', { name: /New Submission/i }).click();
    await this.waitForPageLoad();
  }

  async selectProduct(policyType: string): Promise<void> {
    await this.productSelector.selectOption(policyType);
  }

  async selectState(state: string): Promise<void> {
    await this.stateSelector.selectOption(state);
  }

  async proceed(): Promise<void> {
    await this.wizard.next();
  }
}

/**
 * New Submission — Step 2: Policyholder/Account information
 */
export class PolicyholderPage extends BasePage {
  readonly wizard = new WizardStep(this.page);
  readonly address = new AddressForm(this.page, '.gw-PolicyholderPanelSet');

  private readonly firstNameInput = this.page.locator('[id*="FirstName"], [name*="FirstName"]');
  private readonly lastNameInput = this.page.locator('[id*="LastName"], [name*="LastName"]');
  private readonly dobInput = this.page.locator('[id*="DateOfBirth"], [name*="DateOfBirth"]');
  private readonly genderSelect = this.page.locator('[id*="Gender"], [name*="Gender"]');
  private readonly phoneInput = this.page.locator('[id*="PrimaryPhone"], [name*="PrimaryPhone"]');
  private readonly emailInput = this.page.locator('[id*="EmailAddress"], [name*="EmailAddress"]');

  constructor(page: Page) {
    super(page);
  }

  async fillPersonDetails(person: Policy['holder']): Promise<void> {
    if ('firstName' in person) {
      await this.firstNameInput.fill(person.firstName);
      await this.lastNameInput.fill(person.lastName);
      await this.dobInput.fill(person.dateOfBirth);
      await this.genderSelect.selectOption(person.gender);
      await this.phoneInput.fill(person.phone);
      await this.emailInput.fill(person.email);
      await this.address.fill(person.address);
    }
  }
}

/**
 * New Submission — Step 3: Vehicles (PersonalAuto/CommercialAuto)
 */
export class VehiclesPage extends BasePage {
  readonly wizard = new WizardStep(this.page);

  private readonly addVehicleBtn = this.page.getByRole('button', { name: /Add Vehicle/i });

  constructor(page: Page) {
    super(page);
  }

  async addVehicle(vehicle: Policy['vehicles'] extends Array<infer V> ? V : never): Promise<void> {
    await this.addVehicleBtn.click();
    await this.waitForPageLoad();

    await this.page.locator('[id*="VIN"], [name*="VIN"]').fill(vehicle.vin);
    await this.page.locator('[id*="Year"], [name*="Year"]').fill(String(vehicle.year));
    await this.page.locator('[id*="Make"], [name*="Make"]').fill(vehicle.make);
    await this.page.locator('[id*="Model"], [name*="Model"]').fill(vehicle.model);
    await this.page.locator('[id*="PrimaryUse"], [name*="PrimaryUse"]').selectOption(vehicle.primaryUse);

    const okBtn = this.page.getByRole('button', { name: 'OK' });
    if (await okBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await okBtn.click();
    }
    await this.waitForPageLoad();
  }
}

/**
 * New Submission — Step 4: Coverages
 */
export class CoveragesPage extends BasePage {
  readonly wizard = new WizardStep(this.page);

  constructor(page: Page) {
    super(page);
  }

  async setCoverageLimit(coverageType: string, limit: string): Promise<void> {
    const row = this.page.locator(`tr:has-text("${coverageType}")`);
    await row.locator('[id*="Limit"], [name*="Limit"]').selectOption(limit);
  }

  async setCoverageDeductible(coverageType: string, deductible: string): Promise<void> {
    const row = this.page.locator(`tr:has-text("${coverageType}")`);
    await row.locator('[id*="Deductible"], [name*="Deductible"]').selectOption(deductible);
  }
}

/**
 * Quote summary page — bind or save draft
 */
export class QuotePage extends BasePage {
  readonly wizard = new WizardStep(this.page);

  private readonly bindBtn = this.page.getByRole('button', { name: /Bind|Bind Only/i });
  private readonly premiumDisplay = this.page.locator('[id*="TotalPremium"], .gw-premium-amount');
  private readonly policyNumberDisplay = this.page.locator('[id*="PolicyNumber"]');

  constructor(page: Page) {
    super(page);
  }

  async bindPolicy(): Promise<string> {
    await this.bindBtn.click();
    await this.waitForPageLoad();
    await this.dismissWarningIfPresent();
    return this.getPolicyNumber();
  }

  async getPremium(): Promise<string> {
    return this.premiumDisplay.innerText();
  }

  async getPolicyNumber(): Promise<string> {
    return this.policyNumberDisplay.innerText();
  }
}

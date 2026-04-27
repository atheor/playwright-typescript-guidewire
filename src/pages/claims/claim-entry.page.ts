import { Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { WizardStep } from '../components/wizard-step.component';
import { AddressForm } from '../components/address-form.component';
import { Claim } from '../../types/domain.types';

/**
 * New Claim — Step 1: Basic loss information (ClaimCenter)
 */
export class NewClaimPage extends BasePage {
  readonly wizard = new WizardStep(this.page);

  private readonly policyNumberInput = this.page.locator('[id*="PolicyNumber"], [name*="PolicyNumber"]');
  private readonly searchBtn = this.page.getByRole('button', { name: 'Search' });

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.page.getByRole('link', { name: /New Claim|File a Claim/i }).click();
    await this.waitForPageLoad();
  }

  async searchByPolicyNumber(policyNumber: string): Promise<void> {
    await this.policyNumberInput.fill(policyNumber);
    await this.searchBtn.click();
    await this.waitForPageLoad();
  }

  async selectPolicy(policyNumber: string): Promise<void> {
    await this.page.locator(`tr:has-text("${policyNumber}")`).first().click();
    await this.wizard.next();
  }
}

/**
 * New Claim — Step 2: Loss details
 */
export class LossDetailsPage extends BasePage {
  readonly wizard = new WizardStep(this.page);
  readonly lossLocation = new AddressForm(this.page, '.gw-LossLocationPanelSet');

  private readonly lossCauseSelect = this.page.locator('[id*="LossCause"], [name*="LossCause"]');
  private readonly lossDateInput = this.page.locator('[id*="LossDate"], [name*="LossDate"]');
  private readonly descriptionInput = this.page.locator('[id*="Description"], [name*="Description"]');

  constructor(page: Page) {
    super(page);
  }

  async fillLossDetails(claim: Claim): Promise<void> {
    await this.lossDateInput.fill(claim.lossDate);
    await this.lossCauseSelect.selectOption(claim.lossType);
    await this.descriptionInput.fill(claim.lossDescription);

    if (claim.lossLocation) {
      await this.lossLocation.fill(claim.lossLocation);
    }
  }
}

/**
 * New Claim — Step 3: Claimant/Incident details
 */
export class ClaimantDetailsPage extends BasePage {
  readonly wizard = new WizardStep(this.page);

  private readonly addClaimantBtn = this.page.getByRole('button', { name: /Add Claimant/i });

  constructor(page: Page) {
    super(page);
  }

  async addClaimant(firstName: string, lastName: string): Promise<void> {
    await this.addClaimantBtn.click();
    await this.page.locator('[id*="FirstName"]').fill(firstName);
    await this.page.locator('[id*="LastName"]').fill(lastName);
    await this.page.getByRole('button', { name: 'OK' }).click();
    await this.waitForPageLoad();
  }
}

/**
 * Claim Summary page
 */
export class ClaimSummaryPage extends BasePage {
  readonly wizard = new WizardStep(this.page);

  private readonly claimNumber = this.page.locator('[id*="ClaimNumber"]').first();
  private readonly claimStatus = this.page.locator('[id*="State"], [id*="Status"]').first();
  private readonly assignBtn = this.page.getByRole('button', { name: /Assign/i });

  constructor(page: Page) {
    super(page);
  }

  async getClaimNumber(): Promise<string> {
    return this.claimNumber.innerText();
  }

  async getStatus(): Promise<string> {
    return this.claimStatus.innerText();
  }

  async assignToUser(username: string): Promise<void> {
    await this.assignBtn.click();
    await this.waitForPageLoad();
    await this.page.locator('[id*="AssignTo"]').selectOption(username);
    await this.page.getByRole('button', { name: 'Assign' }).click();
    await this.waitForPageLoad();
  }
}

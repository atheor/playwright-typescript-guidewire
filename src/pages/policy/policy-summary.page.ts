import { Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { DataGrid } from '../components/data-grid.component';

/**
 * Policy Summary page — view and manage an existing policy
 */
export class PolicySummaryPage extends BasePage {
  readonly activitiesGrid = new DataGrid(this.page, '[id*="activitiesLV"]');
  readonly transactionsGrid = new DataGrid(this.page, '[id*="transactionsLV"]');

  private readonly policyNumber = this.page.locator('[id*="PolicyNumber"]').first();
  private readonly policyStatus = this.page.locator('[id*="Status"]').first();
  private readonly cancelBtn = this.page.getByRole('button', { name: /Cancel Policy/i });
  private readonly renewBtn = this.page.getByRole('button', { name: /Renew/i });
  private readonly endorseBtn = this.page.getByRole('button', { name: /Change Policy|Endorse/i });

  constructor(page: Page) {
    super(page);
  }

  async getPolicyNumber(): Promise<string> {
    return this.policyNumber.innerText();
  }

  async getStatus(): Promise<string> {
    return this.policyStatus.innerText();
  }

  async startEndorsement(): Promise<void> {
    await this.endorseBtn.click();
    await this.waitForPageLoad();
  }

  async startCancellation(): Promise<void> {
    await this.cancelBtn.click();
    await this.waitForPageLoad();
  }

  async startRenewal(): Promise<void> {
    await this.renewBtn.click();
    await this.waitForPageLoad();
  }
}

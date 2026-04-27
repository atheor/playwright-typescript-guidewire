import { Page, Locator } from '@playwright/test';

/**
 * WizardStep component — wraps the Guidewire multi-step wizard navigation bar
 * that appears consistently across PolicyCenter and ClaimCenter submissions.
 */
export class WizardStep {
  private readonly nextBtn: Locator;
  private readonly backBtn: Locator;
  private readonly finishBtn: Locator;
  private readonly saveBtn: Locator;
  private readonly cancelBtn: Locator;

  constructor(private readonly page: Page) {
    this.nextBtn = page.getByRole('button', { name: 'Next' });
    this.backBtn = page.getByRole('button', { name: 'Back' });
    this.finishBtn = page.getByRole('button', { name: 'Finish' });
    this.saveBtn = page.getByRole('button', { name: /Save|Update/ });
    this.cancelBtn = page.getByRole('button', { name: 'Cancel' });
  }

  async next(): Promise<void> {
    await this.nextBtn.click();
    await this.page.waitForLoadState('networkidle');
  }

  async back(): Promise<void> {
    await this.backBtn.click();
    await this.page.waitForLoadState('networkidle');
  }

  async finish(): Promise<void> {
    await this.finishBtn.click();
    await this.page.waitForLoadState('networkidle');
  }

  async save(): Promise<void> {
    await this.saveBtn.click();
    await this.page.waitForLoadState('networkidle');
  }

  async cancel(): Promise<void> {
    await this.cancelBtn.click();
  }

  async isNextEnabled(): Promise<boolean> {
    return !(await this.nextBtn.isDisabled());
  }

  /** Jump to a named wizard step via the step breadcrumb */
  async jumpToStep(stepName: string): Promise<void> {
    await this.page.getByRole('link', { name: stepName }).click();
    await this.page.waitForLoadState('networkidle');
  }
}

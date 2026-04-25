import { Page } from '@playwright/test';

/**
 * WizardStep component — wraps the Guidewire multi-step wizard navigation bar
 * that appears consistently across PolicyCenter and ClaimCenter submissions.
 */
export class WizardStep {
  private readonly nextBtn = this.page.getByRole('button', { name: 'Next' });
  private readonly backBtn = this.page.getByRole('button', { name: 'Back' });
  private readonly finishBtn = this.page.getByRole('button', { name: 'Finish' });
  private readonly saveBtn = this.page.getByRole('button', { name: /Save|Update/ });
  private readonly cancelBtn = this.page.getByRole('button', { name: 'Cancel' });

  constructor(private readonly page: Page) {}

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

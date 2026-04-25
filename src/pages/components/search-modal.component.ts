import { Page, Locator } from '@playwright/test';

/**
 * SearchModal component — represents the Guidewire popup search/select widget
 * used when picking policies, contacts, accounts from a lookup field.
 */
export class SearchModal {
  private readonly modal = this.page.locator('.x-window, [role="dialog"]').last();
  private readonly searchBtn = this.modal.getByRole('button', { name: 'Search' });
  private readonly resultsGrid = this.modal.locator('.x-grid-body, [data-ref="normalGrid"]');

  constructor(private readonly page: Page) {}

  async searchBy(field: string, value: string): Promise<void> {
    await this.modal.locator(`[name*="${field}"], [id*="${field}"]`).fill(value);
    await this.searchBtn.click();
    await this.page.waitForLoadState('networkidle');
  }

  async selectFirstResult(): Promise<void> {
    await this.resultsGrid.locator('tr').first().dblclick();
    await this.page.waitForLoadState('networkidle');
  }

  async selectResultByText(text: string): Promise<void> {
    await this.resultsGrid.getByText(text).first().dblclick();
    await this.page.waitForLoadState('networkidle');
  }

  async getResultRows(): Promise<Locator[]> {
    const rows = this.resultsGrid.locator('tr');
    const count = await rows.count();
    return Array.from({ length: count }, (_, i) => rows.nth(i));
  }

  async isVisible(): Promise<boolean> {
    return this.modal.isVisible();
  }

  async close(): Promise<void> {
    await this.modal.getByRole('button', { name: 'Cancel' }).click();
  }
}

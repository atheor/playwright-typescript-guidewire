import { Page, Locator } from '@playwright/test';

/**
 * Base class for all page objects.
 * Provides common navigation, waiting, and interaction utilities.
 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  /** Wait for the page to reach a stable loaded state */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /** Select a value in a Guidewire-style list/dropdown widget */
  async selectListItem(locator: Locator, value: string): Promise<void> {
    await locator.click();
    await this.page.getByRole('option', { name: value }).click();
  }

  /** Type into a Guidewire input and wait for any autocomplete to settle */
  async typeAndConfirm(locator: Locator, value: string): Promise<void> {
    await locator.clear();
    await locator.fill(value);
    await locator.press('Tab');
  }

  /** Click and wait for navigation or network to settle */
  async clickAndWait(locator: Locator): Promise<void> {
    await Promise.all([
      this.page.waitForLoadState('networkidle'),
      locator.click(),
    ]);
  }

  /** Dismiss any Guidewire warning dialog if present */
  async dismissWarningIfPresent(): Promise<void> {
    const warning = this.page.getByRole('button', { name: 'OK' });
    if (await warning.isVisible({ timeout: 2000 }).catch(() => false)) {
      await warning.click();
    }
  }

  /** Get visible text of a field value cell */
  async getFieldValue(label: string): Promise<string> {
    return this.page
      .locator(`[data-qtip="${label}"], td:has-text("${label}") + td`)
      .first()
      .innerText();
  }
}

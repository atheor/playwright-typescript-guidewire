import { Page, Locator } from '@playwright/test';

/**
 * DataGrid component — wraps Guidewire's LV (list view) grids.
 * Supports sorting, filtering, row selection, and inline action menus.
 */
export class DataGrid {
  private readonly grid: Locator;

  constructor(
    private readonly page: Page,
    /** CSS selector or test-id scoping this grid — required when page has multiple grids */
    gridSelector: string = '.x-grid',
  ) {
    this.grid = this.page.locator(gridSelector).first();
  }

  async getRowByText(text: string): Promise<Locator> {
    return this.grid.locator(`tr:has-text("${text}")`).first();
  }

  async clickRow(text: string): Promise<void> {
    await (await this.getRowByText(text)).click();
  }

  async doubleClickRow(text: string): Promise<void> {
    await (await this.getRowByText(text)).dblclick();
    await this.page.waitForLoadState('networkidle');
  }

  async getRowCount(): Promise<number> {
    return this.grid.locator('tr[data-recordid], tr.x-grid-row').count();
  }

  async getCellValue(rowText: string, columnIndex: number): Promise<string> {
    const row = await this.getRowByText(rowText);
    return row.locator('td').nth(columnIndex).innerText();
  }

  /** Click a row's action menu item (e.g., Edit, Delete, View) */
  async rowAction(rowText: string, action: string): Promise<void> {
    const row = await this.getRowByText(rowText);
    await row.locator('[data-ref="actionBtn"], .gw-action-button').click();
    await this.page.getByRole('menuitem', { name: action }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async isEmpty(): Promise<boolean> {
    return (await this.getRowCount()) === 0;
  }
}

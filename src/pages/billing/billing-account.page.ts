import { Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { DataGrid } from '../components/data-grid.component';

/**
 * Billing Account Summary page (BillingCenter)
 */
export class BillingAccountPage extends BasePage {
  readonly invoicesGrid = new DataGrid(this.page, '[id*="invoicesLV"]');
  readonly paymentsGrid = new DataGrid(this.page, '[id*="paymentsLV"]');

  private readonly accountNumber = this.page.locator('[id*="AccountNumber"]').first();
  private readonly balanceDue = this.page.locator('[id*="TotalBalance"], [id*="AmountDue"]').first();
  private readonly makePaymentBtn = this.page.getByRole('button', { name: /Make Payment|Pay/i });

  constructor(page: Page) {
    super(page);
  }

  async getAccountNumber(): Promise<string> {
    return this.accountNumber.innerText();
  }

  async getBalanceDue(): Promise<string> {
    return this.balanceDue.innerText();
  }

  async startPayment(): Promise<void> {
    await this.makePaymentBtn.click();
    await this.waitForPageLoad();
  }
}

/**
 * Make Payment page (BillingCenter)
 */
export class MakePaymentPage extends BasePage {
  private readonly amountInput = this.page.locator('[id*="PaymentAmount"], [name*="Amount"]');
  private readonly methodSelect = this.page.locator('[id*="PaymentMethod"], [name*="PaymentMethod"]');
  private readonly applyBtn = this.page.getByRole('button', { name: /Apply|Submit Payment/i });

  constructor(page: Page) {
    super(page);
  }

  async fillPaymentDetails(amount: string, method: string): Promise<void> {
    await this.amountInput.fill(amount);
    await this.methodSelect.selectOption(method);
  }

  async submitPayment(): Promise<void> {
    await this.applyBtn.click();
    await this.waitForPageLoad();
    await this.dismissWarningIfPresent();
  }
}

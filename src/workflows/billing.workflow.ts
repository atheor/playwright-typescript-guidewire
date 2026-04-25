import { Page } from '@playwright/test';
import { BillingAccount } from '../types/domain.types';
import { BillingAccountPage, MakePaymentPage } from '../pages/billing/billing-account.page';
import { D365BillingService } from '../services/soap/d365-billing.service';
import { Logger } from '../services/utils/logger';

/**
 * BillingWorkflow — orchestrates BillingCenter operations.
 */
export class BillingWorkflow {
  private readonly billingAccountPage: BillingAccountPage;
  private readonly makePaymentPage: MakePaymentPage;
  private readonly d365Service = new D365BillingService();
  private readonly logger = Logger.getInstance();

  constructor(private readonly page: Page) {
    this.billingAccountPage = new BillingAccountPage(page);
    this.makePaymentPage = new MakePaymentPage(page);
  }

  /** Navigate to a billing account */
  async openAccount(accountNumber: string): Promise<BillingAccountPage> {
    this.logger.info('Opening billing account', { accountNumber });
    await this.page.goto(`/bc/BillingAccount.do?accountNumber=${accountNumber}`);
    await this.page.waitForLoadState('networkidle');
    return this.billingAccountPage;
  }

  /** Make a payment on an account */
  async makePayment(accountNumber: string, amount: string, method: string): Promise<void> {
    this.logger.info('Making payment', { accountNumber, amount, method });
    await this.openAccount(accountNumber);
    await this.billingAccountPage.startPayment();
    await this.makePaymentPage.fillPaymentDetails(amount, method);
    await this.makePaymentPage.submitPayment();
  }

  /** Verify D365 account balance matches expected */
  async verifyD365Balance(accountNumber: string, expectedBalance: number): Promise<boolean> {
    this.logger.info('Verifying D365 balance', { accountNumber, expectedBalance });
    const actualBalance = await this.d365Service.getAccountBalance(accountNumber);
    return actualBalance === expectedBalance;
  }

  /** Get the current balance of a billing account from D365 */
  async getD365Balance(accountNumber: string): Promise<number> {
    return this.d365Service.getAccountBalance(accountNumber);
  }
}

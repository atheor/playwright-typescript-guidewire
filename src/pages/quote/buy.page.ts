import { Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { PaymentInstrument, PaymentMethod, PaymentFrequency } from '../../types/domain.types';

/**
 * Purchase / buy page — final step to purchase an accepted quote.
 * Covers coverage confirmation, payment details, T&C acceptance, and policy issuance.
 */
export class PurchasePage extends BasePage {
  private readonly policyNumberDisplay = this.page.locator(
    '[data-testid="policy-number"], [id*="PolicyNumber"], .policy-confirmation-number',
  );
  private readonly confirmationEmailSentMsg = this.page.locator(
    '[data-testid="confirmation-email"], .confirmation-sent, [class*="email-sent"]',
  );
  private readonly purchaseConfirmationHeading = this.page.locator(
    'h1:has-text("Congratulations"), h2:has-text("Your policy"), [data-testid="purchase-confirmed"]',
  );

  // Coverage confirmation section
  private readonly confirmCoverageBtn = this.page.getByRole('button', { name: /confirm|review.*coverage/i });

  // Payment fields — credit card
  private readonly cardNumberField = this.page.locator('[name*="CardNumber"], [id*="CardNumber"], [placeholder*="Card number"]');
  private readonly cardExpiryField = this.page.locator('[name*="CardExpiry"], [id*="Expiry"], [placeholder*="MM/YY"]');
  private readonly cardCvvField = this.page.locator('[name*="CVV"], [id*="CVV"], [placeholder*="CVV"]');
  private readonly cardNameField = this.page.locator('[name*="CardName"], [id*="NameOnCard"]');

  // Payment fields — direct debit / bank account
  private readonly bsbField = this.page.locator('[name*="BSB"], [id*="BSB"], [placeholder*="BSB"]');
  private readonly accountNumberField = this.page.locator('[name*="AccountNumber"], [id*="BankAccount"]');
  private readonly accountNameField = this.page.locator('[name*="AccountName"], [id*="AccountName"]');

  // Payment frequency
  private readonly paymentFrequencyDropdown = this.page.locator('[name*="PaymentFrequency"], [id*="Frequency"]');

  // Terms and Conditions
  private readonly tncCheckbox = this.page.locator('[name*="AgreeTerms"], [id*="AgreeTerms"], [data-testid="tnc-agree"]');
  private readonly privacyCheckbox = this.page.locator('[name*="Privacy"], [id*="Privacy"]');
  private readonly pdsAcknowledge = this.page.locator('[name*="PDS"], [id*="PDS"]');

  // Submit
  private readonly purchaseBtn = this.page.getByRole('button', { name: /purchase|buy.*now|complete.*purchase/i });

  constructor(page: Page) {
    super(page);
  }

  async confirmCoverageDetails(): Promise<void> {
    if (await this.confirmCoverageBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await this.confirmCoverageBtn.click();
      await this.waitForPageLoad();
    }
  }

  async fillPaymentDetails(
    instrument: PaymentInstrument,
    frequency: PaymentFrequency = PaymentFrequency.Annual,
  ): Promise<void> {
    // Select payment frequency
    if (await this.paymentFrequencyDropdown.isVisible({ timeout: 3000 }).catch(() => false)) {
      await this.paymentFrequencyDropdown.selectOption(frequency);
    }

    switch (instrument.method) {
      case PaymentMethod.CreditCard:
        await this.fillCreditCard(instrument);
        break;
      case PaymentMethod.BankAccount:
        await this.fillBankAccount(instrument);
        break;
      default:
        throw new Error(`Payment method ${instrument.method} not supported on purchase page`);
    }
  }

  async fillCreditCard(instrument: PaymentInstrument): Promise<void> {
    await this.cardNameField.fill(instrument.accountName);
    await this.cardNumberField.fill(instrument.accountNumber);
    if (instrument.expiryDate) {
      await this.cardExpiryField.fill(instrument.expiryDate);
    }
    // CVV — use a safe test value
    await this.cardCvvField.fill('123');
  }

  async fillBSBAndAccount(bsb: string, accountNumber: string, accountName?: string): Promise<void> {
    await this.bsbField.fill(bsb);
    await this.accountNumberField.fill(accountNumber);
    if (accountName) {
      await this.accountNameField.fill(accountName);
    }
  }

  async fillBankAccount(instrument: PaymentInstrument): Promise<void> {
    if (instrument.routingNumber) {
      await this.bsbField.fill(instrument.routingNumber); // routingNumber maps to BSB in AU
    }
    await this.accountNumberField.fill(instrument.accountNumber);
    await this.accountNameField.fill(instrument.accountName);
  }

  async acceptTermsAndConditions(): Promise<void> {
    if (await this.tncCheckbox.isVisible({ timeout: 3000 }).catch(() => false)) {
      await this.tncCheckbox.check();
    }
    if (await this.privacyCheckbox.isVisible({ timeout: 3000 }).catch(() => false)) {
      await this.privacyCheckbox.check();
    }
    if (await this.pdsAcknowledge.isVisible({ timeout: 3000 }).catch(() => false)) {
      await this.pdsAcknowledge.check();
    }
  }

  async submitPurchase(): Promise<string> {
    await this.purchaseBtn.click();
    await this.waitForPageLoad();
    await this.dismissWarningIfPresent();
    return this.getPolicyConfirmationNumber();
  }

  async getPolicyConfirmationNumber(): Promise<string> {
    await this.purchaseConfirmationHeading.waitFor({ timeout: 30000 });
    return (await this.policyNumberDisplay.innerText()).trim();
  }

  async getConfirmationEmailSent(): Promise<boolean> {
    return this.confirmationEmailSentMsg.isVisible({ timeout: 5000 }).catch(() => false);
  }

  async isCoverageDetailDisplayed(coverName: string): Promise<boolean> {
    return this.page.locator(`text=${coverName}`).isVisible({ timeout: 3000 }).catch(() => false);
  }
}

import { Page } from '@playwright/test';
import { BasePage } from '../base.page';
import {
  QuoteResult,
  QuoteStatus,
  PaymentFrequency,
  ExcessOption,
  DiscountApplied,
  DiscountType,
} from '../../types/domain.types';

/**
 * Quote results page — displays calculated premium, discounts, and quote summary.
 * Allows adjusting coverage options before proceeding to purchase.
 */
export class QuoteResultsPage extends BasePage {
  private readonly annualPremiumDisplay = this.page.locator(
    '[data-testid="annual-premium"], [id*="AnnualPremium"], .quote-annual-amount',
  );
  private readonly monthlyPremiumDisplay = this.page.locator(
    '[data-testid="monthly-premium"], [id*="MonthlyPremium"], .quote-monthly-amount',
  );
  private readonly fortnightlyPremiumDisplay = this.page.locator(
    '[data-testid="fortnightly-premium"], [id*="FortnightlyPremium"]',
  );
  private readonly quoteNumberDisplay = this.page.locator(
    '[data-testid="quote-number"], [id*="QuoteNumber"], .quote-reference',
  );
  private readonly excessDisplay = this.page.locator(
    '[data-testid="excess-amount"], [id*="ExcessAmount"], .excess-value',
  );
  private readonly discountsContainer = this.page.locator(
    '[data-testid="discounts-applied"], .discounts-list, [id*="Discounts"]',
  );
  private readonly excessDropdown = this.page.locator('[name*="Excess"], [id*="Excess"]');
  private readonly acceptQuoteBtn = this.page.getByRole('button', { name: /buy now|accept|proceed to purchase/i });
  private readonly saveQuoteBtn = this.page.getByRole('button', { name: /save.*quote|save for later/i });
  private readonly emailQuoteBtn = this.page.getByRole('button', { name: /email.*quote|send quote/i });
  private readonly emailInputField = this.page.locator('[name*="EmailAddress"], [placeholder*="email address"]');

  constructor(page: Page) {
    super(page);
  }

  async getPremium(frequency: PaymentFrequency = PaymentFrequency.Annual): Promise<number> {
    let rawText: string;
    switch (frequency) {
      case PaymentFrequency.Monthly:
        rawText = await this.monthlyPremiumDisplay.innerText();
        break;
      case PaymentFrequency.Fortnightly:
        rawText = await this.fortnightlyPremiumDisplay.innerText();
        break;
      default:
        rawText = await this.annualPremiumDisplay.innerText();
    }
    return this.parseAUD(rawText);
  }

  async getQuoteNumber(): Promise<string> {
    return (await this.quoteNumberDisplay.innerText()).trim();
  }

  async getExcess(): Promise<number> {
    return this.parseAUD(await this.excessDisplay.innerText());
  }

  async getDiscounts(): Promise<DiscountApplied[]> {
    const discounts: DiscountApplied[] = [];
    const rows = this.discountsContainer.locator('.discount-row, li');
    const count = await rows.count();

    for (let i = 0; i < count; i++) {
      const text = await rows.nth(i).innerText();
      const type = this.inferDiscountType(text);
      const pctMatch = text.match(/(\d+(?:\.\d+)?)\s*%/);
      const amtMatch = text.match(/\$(\d[\d,]*(?:\.\d{2})?)/);

      discounts.push({
        type,
        percentage: pctMatch ? parseFloat(pctMatch[1]) : 0,
        amountSaved: amtMatch ? this.parseAUD(amtMatch[0]) : 0,
      });
    }

    return discounts;
  }

  async isDiscountApplied(discountType: DiscountType): Promise<boolean> {
    const text = await this.discountsContainer.innerText().catch(() => '');
    const keywordMap: Record<DiscountType, RegExp> = {
      [DiscountType.RACQMember]: /racq.?member/i,
      [DiscountType.MultiPolicy]: /multi.?policy/i,
      [DiscountType.ClaimsFree]: /claims?.?free/i,
      [DiscountType.OnlineDiscount]: /online/i,
      [DiscountType.PayAnnually]: /annual|pay.*annually/i,
      [DiscountType.SecurityAlarm]: /alarm|security/i,
    };
    return keywordMap[discountType].test(text);
  }

  async acceptQuote(): Promise<void> {
    await this.acceptQuoteBtn.click();
    await this.waitForPageLoad();
  }

  async saveQuote(): Promise<string> {
    await this.saveQuoteBtn.click();
    await this.waitForPageLoad();
    return this.getQuoteNumber();
  }

  async emailQuote(email: string): Promise<void> {
    await this.emailQuoteBtn.click();
    await this.emailInputField.fill(email);
    await this.page.getByRole('button', { name: /send/i }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async adjustExcess(excess: ExcessOption): Promise<void> {
    await this.excessDropdown.selectOption(excess);
    await this.page.waitForLoadState('networkidle');
  }

  async getQuoteResult(): Promise<QuoteResult> {
    const [quoteNumber, annual, monthly, excess, discounts] = await Promise.all([
      this.getQuoteNumber(),
      this.getPremium(PaymentFrequency.Annual),
      this.getPremium(PaymentFrequency.Monthly),
      this.getExcess(),
      this.getDiscounts(),
    ]);

    return {
      quoteNumber,
      status: QuoteStatus.Rated,
      annualPremium: annual,
      monthlyPremium: monthly,
      excess,
      discountsApplied: discounts,
      coverageSummary: [],
      expiryDate: new Date(Date.now() + 30 * 86_400_000).toISOString().split('T')[0],
    };
  }

  async isExpiredWarningVisible(): Promise<boolean> {
    const warning = this.page.locator('[data-testid="quote-expired"], .expired-notice, [class*="expired"]');
    return warning.isVisible({ timeout: 3000 }).catch(() => false);
  }

  async isValidationErrorVisible(field: string): Promise<boolean> {
    const error = this.page.locator(`[data-testid="${field}-error"], .field-error:near([name*="${field}"])`);
    return error.isVisible({ timeout: 3000 }).catch(() => false);
  }

  /** Parse AUD amount string like "$1,234.56" → 1234.56 */
  private parseAUD(text: string): number {
    const cleaned = text.replace(/[^0-9.]/g, '');
    return parseFloat(cleaned) || 0;
  }

  private inferDiscountType(text: string): DiscountType {
    if (/racq.?member/i.test(text)) return DiscountType.RACQMember;
    if (/multi.?policy/i.test(text)) return DiscountType.MultiPolicy;
    if (/claims?.?free/i.test(text)) return DiscountType.ClaimsFree;
    if (/annual|pay.*annually/i.test(text)) return DiscountType.PayAnnually;
    if (/alarm|security/i.test(text)) return DiscountType.SecurityAlarm;
    return DiscountType.OnlineDiscount;
  }
}

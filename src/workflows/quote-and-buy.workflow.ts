import { Page } from '@playwright/test';
import { Logger } from '../services/utils/logger';
import {
  QuoteRequest,
  QuoteResult,
  QuoteProductType,
  PaymentFrequency,
  ExcessOption,
  PaymentInstrument,
  Person,
  AustralianVehicle,
  HomeProperty,
  QuoteCoverageOptions,
  DiscountType,
} from '../types/domain.types';
import { QuoteProductSelectionPage } from '../pages/quote/quote-entry.page';
import {
  QuoteApplicantPage,
  QuoteVehiclePage,
  QuotePropertyPage,
  QuoteCoverageOptionsPage,
  QuotePaymentFrequencyPage,
} from '../pages/quote/quote-entry.page';
import { QuoteResultsPage } from '../pages/quote/quote-results.page';
import { PurchasePage } from '../pages/quote/buy.page';

/**
 * QuoteAndBuyWorkflow — orchestrates the end-to-end RACQ Quote & Buy journey.
 *
 * Follows the same three-layer pattern as PolicyWorkflow/ClaimWorkflow.
 * Tests interact with this workflow rather than pages directly.
 *
 * @example
 * const workflow = new QuoteAndBuyWorkflow(page);
 * const quote = await workflow.getQuote(QuoteRequestBuilder.comprehensiveCar(person, vehicle));
 * const policyNumber = await workflow.buyPolicy(request, paymentInstrument);
 */
export class QuoteAndBuyWorkflow {
  private readonly logger = Logger.getInstance();

  private readonly productSelection: QuoteProductSelectionPage;
  private readonly applicantPage: QuoteApplicantPage;
  private readonly vehiclePage: QuoteVehiclePage;
  private readonly propertyPage: QuotePropertyPage;
  private readonly coverageOptionsPage: QuoteCoverageOptionsPage;
  private readonly paymentFrequencyPage: QuotePaymentFrequencyPage;
  private readonly resultsPage: QuoteResultsPage;
  private readonly purchasePage: PurchasePage;

  constructor(private readonly page: Page) {
    this.productSelection = new QuoteProductSelectionPage(page);
    this.applicantPage = new QuoteApplicantPage(page);
    this.vehiclePage = new QuoteVehiclePage(page);
    this.propertyPage = new QuotePropertyPage(page);
    this.coverageOptionsPage = new QuoteCoverageOptionsPage(page);
    this.paymentFrequencyPage = new QuotePaymentFrequencyPage(page);
    this.resultsPage = new QuoteResultsPage(page);
    this.purchasePage = new PurchasePage(page);
  }

  // ─── Individual steps ────────────────────────────────────────────────────────

  async startQuote(product: QuoteProductType): Promise<void> {
    this.logger.info(`QuoteAndBuyWorkflow: starting quote for product=${product}`);
    await this.productSelection.goto();
    await this.productSelection.selectProduct(product);
  }

  async fillApplicantDetails(
    applicant: Person,
    options?: { racqMember?: boolean; existingPolicies?: number; claimsFreeYears?: number },
  ): Promise<void> {
    this.logger.info(`QuoteAndBuyWorkflow: filling applicant details for ${applicant.firstName} ${applicant.lastName}`);
    await this.applicantPage.fillApplicantDetails(applicant);

    if (options?.racqMember) {
      await this.applicantPage.setRACQMembership(true);
    }
    if (options?.existingPolicies !== undefined) {
      await this.applicantPage.setExistingPoliciesCount(options.existingPolicies);
    }
    if (options?.claimsFreeYears !== undefined) {
      await this.applicantPage.setClaimsFreeYears(options.claimsFreeYears);
    }

    await this.applicantPage.wizard.next();
  }

  async fillVehicleDetails(vehicle: AustralianVehicle): Promise<void> {
    this.logger.info(`QuoteAndBuyWorkflow: filling vehicle details rego=${vehicle.registrationNumber}`);
    await this.vehiclePage.fillVehicleDetails(vehicle);
    await this.vehiclePage.wizard.next();
  }

  async fillPropertyDetails(property: HomeProperty): Promise<void> {
    this.logger.info(`QuoteAndBuyWorkflow: filling property details suburb=${property.address.city}`);
    await this.propertyPage.fillPropertyDetails(property);
    await this.propertyPage.wizard.next();
  }

  async selectCoverageOptions(options: QuoteCoverageOptions): Promise<void> {
    this.logger.info('QuoteAndBuyWorkflow: selecting coverage options');
    await this.coverageOptionsPage.setCoverageOptions(options);
    await this.coverageOptionsPage.wizard.next();
  }

  async selectPaymentFrequency(freq: PaymentFrequency): Promise<void> {
    await this.paymentFrequencyPage.selectPaymentFrequency(freq);
    await this.paymentFrequencyPage.wizard.next();
  }

  async calculateQuote(): Promise<QuoteResult> {
    this.logger.info('QuoteAndBuyWorkflow: reading quote result');
    return this.resultsPage.getQuoteResult();
  }

  async adjustExcess(excess: ExcessOption): Promise<QuoteResult> {
    this.logger.info(`QuoteAndBuyWorkflow: adjusting excess to $${excess}`);
    await this.resultsPage.adjustExcess(excess);
    return this.resultsPage.getQuoteResult();
  }

  async addOptionalCover(coverName: string): Promise<QuoteResult> {
    this.logger.info(`QuoteAndBuyWorkflow: adding optional cover: ${coverName}`);
    await this.coverageOptionsPage.addOptionalCover(coverName);
    return this.resultsPage.getQuoteResult();
  }

  // ─── Full flows ──────────────────────────────────────────────────────────────

  /**
   * Complete end-to-end quote flow — returns the QuoteResult for assertion.
   */
  async getQuote(request: QuoteRequest): Promise<QuoteResult> {
    this.logger.info(`QuoteAndBuyWorkflow: running full getQuote flow product=${request.product}`);

    await this.startQuote(request.product);
    await this.fillApplicantDetails(request.applicant, {
      racqMember: request.racqMember,
      existingPolicies: request.existingPolicies,
      claimsFreeYears: request.claimsFreeYears,
    });

    if (request.vehicle) {
      await this.fillVehicleDetails(request.vehicle);
    }

    if (request.property) {
      await this.fillPropertyDetails(request.property);
    }

    if (request.coverageOptions) {
      await this.selectCoverageOptions(request.coverageOptions);
    }

    await this.selectPaymentFrequency(request.paymentFrequency);

    const result = await this.calculateQuote();
    this.logger.info(`QuoteAndBuyWorkflow: quote ${result.quoteNumber} — annual premium $${result.annualPremium}`);
    return result;
  }

  /**
   * Complete quote-and-buy flow — returns the issued policy number.
   */
  async buyPolicy(request: QuoteRequest, payment: PaymentInstrument): Promise<string> {
    this.logger.info('QuoteAndBuyWorkflow: running full buyPolicy flow');

    await this.getQuote(request);
    await this.resultsPage.acceptQuote();
    await this.purchasePage.confirmCoverageDetails();
    await this.purchasePage.fillPaymentDetails(payment, request.paymentFrequency);
    await this.purchasePage.acceptTermsAndConditions();

    const policyNumber = await this.purchasePage.submitPurchase();
    this.logger.info(`QuoteAndBuyWorkflow: policy issued — ${policyNumber}`);
    return policyNumber;
  }

  /**
   * Save a quote for later retrieval — returns the quote reference number.
   */
  async saveQuoteForLater(request: QuoteRequest): Promise<string> {
    this.logger.info('QuoteAndBuyWorkflow: saving quote for later');
    await this.getQuote(request);
    const quoteNumber = await this.resultsPage.saveQuote();
    this.logger.info(`QuoteAndBuyWorkflow: quote saved — ${quoteNumber}`);
    return quoteNumber;
  }

  /**
   * Retrieve a previously saved quote by reference number.
   */
  async retrieveSavedQuote(quoteNumber: string): Promise<QuoteResult> {
    this.logger.info(`QuoteAndBuyWorkflow: retrieving saved quote ${quoteNumber}`);
    await this.page.goto(`/quote/retrieve?ref=${quoteNumber}`);
    await this.page.waitForLoadState('networkidle');
    return this.resultsPage.getQuoteResult();
  }

  // ─── Assertion helpers ───────────────────────────────────────────────────────

  async isDiscountApplied(discountType: DiscountType): Promise<boolean> {
    return this.resultsPage.isDiscountApplied(discountType);
  }

  async getPremium(frequency: PaymentFrequency = PaymentFrequency.Annual): Promise<number> {
    return this.resultsPage.getPremium(frequency);
  }

  async getQuoteNumber(): Promise<string> {
    return this.resultsPage.getQuoteNumber();
  }

  async isExpiredQuoteWarningVisible(): Promise<boolean> {
    return this.resultsPage.isExpiredWarningVisible();
  }

  async isValidationErrorVisible(field: string): Promise<boolean> {
    return this.resultsPage.isValidationErrorVisible(field);
  }

  async getConfirmationEmailSent(): Promise<boolean> {
    return this.purchasePage.getConfirmationEmailSent();
  }
}

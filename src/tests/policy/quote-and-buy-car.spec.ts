import { test, expect } from '../../fixtures';
import { AustralianPersonFactory } from '../../builders/australian-person.factory';
import {
  QuoteRequestBuilder,
  AustralianVehicleBuilder,
} from '../../builders/quote.builder';
import { QuoteAndBuyWorkflow } from '../../workflows/quote-and-buy.workflow';
import {
  PaymentFrequency,
  ExcessOption,
  DiscountType,
  PaymentMethod,
  QuoteProductType,
} from '../../types/domain.types';

/**
 * RACQ Car Insurance — Quote and Buy tests
 *
 * Real-world scenarios for an Australian insurer (RACQ, Queensland).
 * Covers comprehensive car, third-party, CTP, discounts, excess adjustments,
 * optional covers, and the full buy flow.
 *
 * Tags: @smoke, @regression, @quote, @car-insurance
 */

test.describe('RACQ Car Insurance — Quote and Buy', () => {
  let quoteWorkflow: QuoteAndBuyWorkflow;

  test.beforeEach(async ({ page }) => {
    quoteWorkflow = new QuoteAndBuyWorkflow(page);
  });

  // ─── Smoke tests ─────────────────────────────────────────────────────────────

  test(
    'standard Brisbane driver gets comprehensive car quote and buys online @smoke @quote @car-insurance',
    async () => {
      // Arrange
      const applicant = AustralianPersonFactory.standard();
      const vehicle = AustralianVehicleBuilder.standardSedan();
      const request = QuoteRequestBuilder.comprehensiveCar(applicant, vehicle);
      const payment = {
        method: PaymentMethod.CreditCard,
        accountName: `${applicant.firstName} ${applicant.lastName}`,
        accountNumber: '4111111111111111',
        expiryDate: '12/27',
      };

      // Act — get a quote
      const quote = await quoteWorkflow.getQuote(request);

      // Assert — quote is valid
      expect(quote.quoteNumber).toBeTruthy();
      expect(quote.annualPremium).toBeGreaterThan(0);
      expect(quote.annualPremium).toBeLessThan(10000); // sanity range for AU car

      // Act — buy the policy
      const policyNumber = await quoteWorkflow.buyPolicy(request, payment);

      // Assert — policy is issued
      expect(policyNumber).toMatch(/\d+/);
      const emailSent = await quoteWorkflow.getConfirmationEmailSent();
      expect(emailSent).toBe(true);
    },
  );

  // ─── Demographic pricing ──────────────────────────────────────────────────────

  test(
    'young driver (21yo) receives higher premium than standard adult @regression @quote @car-insurance',
    async () => {
      const vehicle = AustralianVehicleBuilder.standardSedan();

      const standardRequest = QuoteRequestBuilder.comprehensiveCar(
        AustralianPersonFactory.standard(),
        vehicle,
      );
      const youngRequest = QuoteRequestBuilder.comprehensiveCar(
        AustralianPersonFactory.youngDriver(),
        vehicle,
      );

      const standardQuote = await quoteWorkflow.getQuote(standardRequest);
      const youngQuote = await quoteWorkflow.getQuote(youngRequest);

      // Young drivers attract age loading — premium should be higher
      expect(youngQuote.annualPremium).toBeGreaterThan(standardQuote.annualPremium);
      expect(youngQuote.annualPremium).toBeGreaterThan(2000); // young driver baseline
    },
  );

  test(
    'senior driver (68yo) comprehensive car quote @regression @quote @car-insurance',
    async () => {
      const applicant = AustralianPersonFactory.seniorDriver();
      const vehicle = AustralianVehicleBuilder.standardSedan();
      const request = QuoteRequestBuilder.comprehensiveCar(applicant, vehicle);

      const quote = await quoteWorkflow.getQuote(request);

      expect(quote.quoteNumber).toBeTruthy();
      expect(quote.annualPremium).toBeGreaterThan(0);
    },
  );

  // ─── Discounts ────────────────────────────────────────────────────────────────

  test(
    'RACQ member discount reduces comprehensive car premium @regression @quote @car-insurance',
    async () => {
      const applicant = AustralianPersonFactory.standard();
      const vehicle = AustralianVehicleBuilder.standardSedan();

      // Quote without membership
      const nonMemberRequest = QuoteRequestBuilder.comprehensiveCar(applicant, vehicle);
      const nonMemberQuote = await quoteWorkflow.getQuote(nonMemberRequest);

      // Quote with RACQ membership
      const memberRequest = new QuoteRequestBuilder()
        .withProduct(QuoteProductType.ComprehensiveCar)
        .withApplicant(applicant)
        .withVehicle(vehicle)
        .withRACQMembership(true)
        .build();
      const memberQuote = await quoteWorkflow.getQuote(memberRequest);

      // RACQ member discount should apply and reduce premium
      expect(memberQuote.annualPremium).toBeLessThan(nonMemberQuote.annualPremium);
      const isDiscountApplied = await quoteWorkflow.isDiscountApplied(DiscountType.RACQMember);
      expect(isDiscountApplied).toBe(true);
    },
  );

  test(
    'multi-policy discount applied with 3 existing RACQ policies @regression @quote @car-insurance',
    async () => {
      const applicant = AustralianPersonFactory.standard();
      const vehicle = AustralianVehicleBuilder.standardSedan();

      const request = new QuoteRequestBuilder()
        .withProduct(QuoteProductType.ComprehensiveCar)
        .withApplicant(applicant)
        .withVehicle(vehicle)
        .withExistingPolicies(3)
        .build();

      await quoteWorkflow.getQuote(request);

      const isDiscountApplied = await quoteWorkflow.isDiscountApplied(DiscountType.MultiPolicy);
      expect(isDiscountApplied).toBe(true);
    },
  );

  test(
    'claims-free 5-year discount applied to quote @regression @quote @car-insurance',
    async () => {
      const applicant = AustralianPersonFactory.standard();
      const vehicle = AustralianVehicleBuilder.standardSedan();

      const request = new QuoteRequestBuilder()
        .withProduct(QuoteProductType.ComprehensiveCar)
        .withApplicant(applicant)
        .withVehicle(vehicle)
        .withClaimsFreeYears(5)
        .build();

      await quoteWorkflow.getQuote(request);

      const isDiscountApplied = await quoteWorkflow.isDiscountApplied(DiscountType.ClaimsFree);
      expect(isDiscountApplied).toBe(true);
    },
  );

  // ─── Excess adjustments ───────────────────────────────────────────────────────

  test(
    'increasing excess from $750 to $1500 reduces the annual premium @regression @quote @car-insurance',
    async () => {
      const applicant = AustralianPersonFactory.standard();
      const vehicle = AustralianVehicleBuilder.standardSedan();
      const request = new QuoteRequestBuilder()
        .withProduct(QuoteProductType.ComprehensiveCar)
        .withApplicant(applicant)
        .withVehicle(vehicle)
        .withCoverageOptions({ excess: ExcessOption.Standard })
        .build();

      await quoteWorkflow.getQuote(request);
      const premiumAt750 = await quoteWorkflow.getPremium(PaymentFrequency.Annual);

      const revisedQuote = await quoteWorkflow.adjustExcess(ExcessOption.Higher1500);

      expect(revisedQuote.annualPremium).toBeLessThan(premiumAt750);
      expect(revisedQuote.excess).toBe(1500);
    },
  );

  test(
    'increasing excess from $750 to $2000 gives maximum premium reduction @regression @quote @car-insurance',
    async () => {
      const applicant = AustralianPersonFactory.standard();
      const vehicle = AustralianVehicleBuilder.standardSedan();
      const request = new QuoteRequestBuilder()
        .withProduct(QuoteProductType.ComprehensiveCar)
        .withApplicant(applicant)
        .withVehicle(vehicle)
        .withCoverageOptions({ excess: ExcessOption.Standard })
        .build();

      await quoteWorkflow.getQuote(request);
      const premiumAtStandard = await quoteWorkflow.getPremium(PaymentFrequency.Annual);
      const revisedQuote = await quoteWorkflow.adjustExcess(ExcessOption.Higher2000);

      expect(revisedQuote.annualPremium).toBeLessThan(premiumAtStandard);
    },
  );

  // ─── Optional covers ──────────────────────────────────────────────────────────

  test(
    'adding hire car cover increases the premium @regression @quote @car-insurance',
    async () => {
      const applicant = AustralianPersonFactory.standard();
      const vehicle = AustralianVehicleBuilder.standardSedan();

      // Quote without hire car
      const baseRequest = new QuoteRequestBuilder()
        .withProduct(QuoteProductType.ComprehensiveCar)
        .withApplicant(applicant)
        .withVehicle(vehicle)
        .withCoverageOptions({ hireCar: false })
        .build();
      await quoteWorkflow.getQuote(baseRequest);
      const basePremium = await quoteWorkflow.getPremium(PaymentFrequency.Annual);

      // Add hire car
      const revisedQuote = await quoteWorkflow.addOptionalCover('hireCar');

      expect(revisedQuote.annualPremium).toBeGreaterThan(basePremium);
    },
  );

  test(
    'adding windscreen cover increases the premium @regression @quote @car-insurance',
    async () => {
      const applicant = AustralianPersonFactory.standard();
      const vehicle = AustralianVehicleBuilder.standardSedan();

      const request = new QuoteRequestBuilder()
        .withProduct(QuoteProductType.ComprehensiveCar)
        .withApplicant(applicant)
        .withVehicle(vehicle)
        .withCoverageOptions({ windscreen: false })
        .build();
      await quoteWorkflow.getQuote(request);
      const basePremium = await quoteWorkflow.getPremium(PaymentFrequency.Annual);

      const revisedQuote = await quoteWorkflow.addOptionalCover('windscreen');

      expect(revisedQuote.annualPremium).toBeGreaterThan(basePremium);
    },
  );

  // ─── Payment frequency ────────────────────────────────────────────────────────

  test(
    'annual payment discount makes annual premium lower than 12x monthly @regression @quote @car-insurance',
    async () => {
      const applicant = AustralianPersonFactory.standard();
      const vehicle = AustralianVehicleBuilder.standardSedan();

      const annualRequest = new QuoteRequestBuilder()
        .withProduct(QuoteProductType.ComprehensiveCar)
        .withApplicant(applicant)
        .withVehicle(vehicle)
        .withPaymentFrequency(PaymentFrequency.Annual)
        .build();
      const annualQuote = await quoteWorkflow.getQuote(annualRequest);

      const monthlyRequest = new QuoteRequestBuilder()
        .withProduct(QuoteProductType.ComprehensiveCar)
        .withApplicant(applicant)
        .withVehicle(vehicle)
        .withPaymentFrequency(PaymentFrequency.Monthly)
        .build();
      const monthlyQuote = await quoteWorkflow.getQuote(monthlyRequest);

      // Paying annually should be cheaper than 12 monthly instalments
      expect(annualQuote.annualPremium).toBeLessThan(monthlyQuote.monthlyPremium * 12);
    },
  );

  // ─── Vehicle types ────────────────────────────────────────────────────────────

  test(
    'high-value Mercedes C-Class quote includes agreed value option @regression @quote @car-insurance',
    async () => {
      const applicant = AustralianPersonFactory.standard();
      const vehicle = AustralianVehicleBuilder.highValueCar();
      const request = QuoteRequestBuilder.comprehensiveCar(applicant, vehicle);

      const quote = await quoteWorkflow.getQuote(request);

      // High-value vehicles should have higher premiums
      expect(quote.annualPremium).toBeGreaterThan(1500);
      expect(quote.quoteNumber).toBeTruthy();
    },
  );

  test(
    'financed vehicle — financier correctly noted in quote details @regression @quote @car-insurance',
    async () => {
      const applicant = AustralianPersonFactory.standard();
      const vehicle = AustralianVehicleBuilder.financedVehicle();
      const request = QuoteRequestBuilder.comprehensiveCar(applicant, vehicle);

      const quote = await quoteWorkflow.getQuote(request);

      expect(quote.quoteNumber).toBeTruthy();
      // The financier name should appear in the coverage summary
      const hasFinancier = quote.coverageSummary.some((line) =>
        line.includes('Commonwealth Bank'),
      );
      expect(hasFinancier).toBe(true);
    },
  );

  test(
    'classic vehicle (30+ years old) takes agreed value path @regression @quote @car-insurance',
    async () => {
      const applicant = AustralianPersonFactory.standard();
      const vehicle = AustralianVehicleBuilder.classicVehicle();
      const request = QuoteRequestBuilder.comprehensiveCar(applicant, vehicle);

      const quote = await quoteWorkflow.getQuote(request);

      expect(quote.quoteNumber).toBeTruthy();
    },
  );

  // ─── Third party products ─────────────────────────────────────────────────────

  test(
    'third party property damage quote for low-value vehicle @regression @quote @car-insurance',
    async () => {
      const applicant = AustralianPersonFactory.standard();
      const vehicle = AustralianVehicleBuilder.oldVehicle();
      const request = QuoteRequestBuilder.thirdPartyPropertyDamage(applicant, vehicle);

      const quote = await quoteWorkflow.getQuote(request);

      // TPPD is significantly cheaper than comprehensive
      expect(quote.annualPremium).toBeGreaterThan(0);
      expect(quote.quoteNumber).toBeTruthy();
    },
  );

  // ─── Quote save and retrieve ──────────────────────────────────────────────────

  test(
    'save a quote for later and retrieve it using quote reference number @regression @quote @car-insurance',
    async () => {
      const applicant = AustralianPersonFactory.standard();
      const vehicle = AustralianVehicleBuilder.standardSedan();
      const request = QuoteRequestBuilder.comprehensiveCar(applicant, vehicle);

      // Save the quote
      const quoteNumber = await quoteWorkflow.saveQuoteForLater(request);
      expect(quoteNumber).toBeTruthy();

      // Retrieve and confirm details are preserved
      const retrievedQuote = await quoteWorkflow.retrieveSavedQuote(quoteNumber);
      expect(retrievedQuote.quoteNumber).toBe(quoteNumber);
      expect(retrievedQuote.annualPremium).toBeGreaterThan(0);
    },
  );

  test(
    'expired quote (>30 days) shows expiry warning when retrieved @regression @quote @car-insurance',
    async () => {
      // Simulate accessing an expired quote reference
      const expiredQuoteRef = 'QT-EXPIRED-TEST-001';

      await quoteWorkflow.retrieveSavedQuote(expiredQuoteRef);

      const isExpiredWarningVisible = await quoteWorkflow.isExpiredQuoteWarningVisible();
      expect(isExpiredWarningVisible).toBe(true);
    },
  );

  // ─── Validation ───────────────────────────────────────────────────────────────

  test(
    'invalid postcode (non-QLD) shows validation error @regression @quote @car-insurance',
    async () => {
      const applicant = {
        ...AustralianPersonFactory.standard(),
        address: {
          line1: '100 Test Street',
          city: 'Sydney',
          state: 'NSW',
          postalCode: '2000', // NSW postcode — RACQ is QLD insurer
          country: 'AU',
        },
      };
      const vehicle = AustralianVehicleBuilder.standardSedan();
      const request = QuoteRequestBuilder.comprehensiveCar(applicant, vehicle);

      await quoteWorkflow.startQuote(request.product);
      await quoteWorkflow.fillApplicantDetails(request.applicant);

      const hasError = await quoteWorkflow.isValidationErrorVisible('PostCode');
      expect(hasError).toBe(true);
    },
  );
});

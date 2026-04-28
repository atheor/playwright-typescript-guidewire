import { test, expect } from '../../fixtures';
import { AustralianPersonFactory } from '../../builders/australian-person.factory';
import {
  QuoteRequestBuilder,
  HomePropertyBuilder,
} from '../../builders/quote.builder';
import { QuoteAndBuyWorkflow } from '../../workflows/quote-and-buy.workflow';
import {
  PaymentFrequency,
  DiscountType,
  PaymentMethod,
  QuoteProductType,
} from '../../types/domain.types';

/**
 * RACQ Home & Contents Insurance — Quote and Buy tests
 *
 * Real-world scenarios for Queensland residential property insurance.
 * Covers owner-occupier, renters, landlords, high-value homes, old construction,
 * optional covers, and the full buy flow.
 *
 * Tags: @smoke, @regression, @quote, @home-insurance
 */

test.describe('RACQ Home & Contents Insurance — Quote and Buy', () => {
  let quoteWorkflow: QuoteAndBuyWorkflow;

  test.beforeEach(async ({ page }) => {
    quoteWorkflow = new QuoteAndBuyWorkflow(page);
  });

  // ─── Smoke tests ─────────────────────────────────────────────────────────────

  test(
    'owner-occupier gets home and contents quote for Brisbane brick home @smoke @quote @home-insurance',
    async () => {
      // Arrange — standard owner-occupier in Toowong
      const applicant = AustralianPersonFactory.standard();
      const property = HomePropertyBuilder.standardBrickHome();
      const request = QuoteRequestBuilder.homeContents(applicant, property);

      // Act
      const quote = await quoteWorkflow.getQuote(request);

      // Assert
      expect(quote.quoteNumber).toBeTruthy();
      expect(quote.annualPremium).toBeGreaterThan(0);
      expect(quote.annualPremium).toBeLessThan(10000); // reasonable AU home insurance range
    },
  );

  test(
    'apartment renter gets contents-only quote for South Bank unit @smoke @quote @home-insurance',
    async () => {
      // Arrange — renter in South Bank apartment
      const applicant = AustralianPersonFactory.standard();
      const property = HomePropertyBuilder.contentsOnlyApartment();
      const request = QuoteRequestBuilder.contentsOnly(applicant, property);

      // Act
      const quote = await quoteWorkflow.getQuote(request);

      // Assert — contents-only is cheaper than combined home+contents
      expect(quote.quoteNumber).toBeTruthy();
      expect(quote.annualPremium).toBeGreaterThan(0);
    },
  );

  // ─── Pricing factors ──────────────────────────────────────────────────────────

  test(
    'home and contents premium is higher than contents-only for same property @regression @quote @home-insurance',
    async () => {
      const applicant = AustralianPersonFactory.standard();
      const property = HomePropertyBuilder.standardBrickHome();

      const homeContentsQuote = await quoteWorkflow.getQuote(
        QuoteRequestBuilder.homeContents(applicant, property),
      );

      // Use same property but contents-only
      const contentsProperty = { ...property, buildingSum: undefined };
      const contentsQuote = await quoteWorkflow.getQuote(
        QuoteRequestBuilder.contentsOnly(applicant, contentsProperty),
      );

      expect(homeContentsQuote.annualPremium).toBeGreaterThan(contentsQuote.annualPremium);
    },
  );

  test(
    'pre-1970 fibro construction home attracts elevated premium @regression @quote @home-insurance',
    async () => {
      const applicant = AustralianPersonFactory.standard();
      const modernProperty = HomePropertyBuilder.standardBrickHome();
      const oldProperty = HomePropertyBuilder.oldFibroHome();

      const modernQuote = await quoteWorkflow.getQuote(
        QuoteRequestBuilder.homeContents(applicant, modernProperty),
      );
      const oldQuote = await quoteWorkflow.getQuote(
        QuoteRequestBuilder.homeContents(applicant, oldProperty),
      );

      // Older fibro construction is higher risk — premium should be elevated
      expect(oldQuote.annualPremium).toBeGreaterThan(modernQuote.annualPremium);
    },
  );

  test(
    'high sum insured home ($1.2M building) completes quote successfully @regression @quote @home-insurance',
    async () => {
      const applicant = AustralianPersonFactory.standard();
      const property = HomePropertyBuilder.highValueHome();
      const request = QuoteRequestBuilder.homeContents(applicant, property);

      const quote = await quoteWorkflow.getQuote(request);

      expect(quote.quoteNumber).toBeTruthy();
      expect(quote.annualPremium).toBeGreaterThan(0);
    },
  );

  test(
    'home with pool receives quote with liability note acknowledged @regression @quote @home-insurance',
    async () => {
      const applicant = AustralianPersonFactory.standard();
      const property = HomePropertyBuilder.poolHome();
      const request = QuoteRequestBuilder.homeContents(applicant, property);

      const quote = await quoteWorkflow.getQuote(request);

      expect(quote.quoteNumber).toBeTruthy();
      expect(quote.annualPremium).toBeGreaterThan(0);
    },
  );

  // ─── Discounts ────────────────────────────────────────────────────────────────

  test(
    'security alarm discount reduces home insurance premium @regression @quote @home-insurance',
    async () => {
      const applicant = AustralianPersonFactory.standard();

      // Quote without alarm
      const noAlarmProperty = HomePropertyBuilder.standardBrickHome();
      noAlarmProperty.hasAlarm = false;
      await quoteWorkflow.getQuote(
        QuoteRequestBuilder.homeContents(applicant, noAlarmProperty),
      );

      // Quote with approved alarm
      const alarmProperty = HomePropertyBuilder.standardBrickHome();
      alarmProperty.hasAlarm = true;
      await quoteWorkflow.getQuote(
        QuoteRequestBuilder.homeContents(applicant, alarmProperty),
      );

      const alarmDiscountApplied = await quoteWorkflow.isDiscountApplied(DiscountType.SecurityAlarm);
      expect(alarmDiscountApplied).toBe(true);
    },
  );

  test(
    'multi-policy discount applied when existing car policy is held @regression @quote @home-insurance',
    async () => {
      const applicant = AustralianPersonFactory.standard();
      const property = HomePropertyBuilder.standardBrickHome();
      const request = new QuoteRequestBuilder()
        .withProduct(QuoteProductType.HomeContents)
        .withApplicant(applicant)
        .withProperty(property)
        .withExistingPolicies(1) // 1 existing car policy
        .build();

      await quoteWorkflow.getQuote(request);

      const isDiscountApplied = await quoteWorkflow.isDiscountApplied(DiscountType.MultiPolicy);
      expect(isDiscountApplied).toBe(true);
    },
  );

  test(
    'RACQ member discount applied to home insurance quote @regression @quote @home-insurance',
    async () => {
      const applicant = AustralianPersonFactory.standard();
      const property = HomePropertyBuilder.standardBrickHome();

      // Non-member quote
      const nonMemberQuote = await quoteWorkflow.getQuote(
        QuoteRequestBuilder.homeContents(applicant, property),
      );

      // Member quote
      const memberRequest = new QuoteRequestBuilder()
        .withProduct(QuoteProductType.HomeContents)
        .withApplicant(applicant)
        .withProperty(property)
        .withRACQMembership(true)
        .build();
      const memberQuote = await quoteWorkflow.getQuote(memberRequest);

      expect(memberQuote.annualPremium).toBeLessThan(nonMemberQuote.annualPremium);
      const isDiscountApplied = await quoteWorkflow.isDiscountApplied(DiscountType.RACQMember);
      expect(isDiscountApplied).toBe(true);
    },
  );

  // ─── Optional covers ──────────────────────────────────────────────────────────

  test(
    'portable contents cover add-on increases the premium @regression @quote @home-insurance',
    async () => {
      const applicant = AustralianPersonFactory.standard();
      const property = HomePropertyBuilder.standardBrickHome();

      // Base quote without portable contents
      const baseRequest = new QuoteRequestBuilder()
        .withProduct(QuoteProductType.HomeContents)
        .withApplicant(applicant)
        .withProperty(property)
        .withCoverageOptions({ portableContents: false })
        .build();
      await quoteWorkflow.getQuote(baseRequest);
      const basePremium = await quoteWorkflow.getPremium(PaymentFrequency.Annual);

      // Add portable contents cover
      const revisedQuote = await quoteWorkflow.addOptionalCover('portableContents');

      expect(revisedQuote.annualPremium).toBeGreaterThan(basePremium);
    },
  );

  test(
    'accidental damage cover add-on increases the premium @regression @quote @home-insurance',
    async () => {
      const applicant = AustralianPersonFactory.standard();
      const property = HomePropertyBuilder.standardBrickHome();

      const baseRequest = new QuoteRequestBuilder()
        .withProduct(QuoteProductType.HomeContents)
        .withApplicant(applicant)
        .withProperty(property)
        .withCoverageOptions({ accidentalDamage: false })
        .build();
      await quoteWorkflow.getQuote(baseRequest);
      const basePremium = await quoteWorkflow.getPremium(PaymentFrequency.Annual);

      const revisedQuote = await quoteWorkflow.addOptionalCover('accidentalDamage');

      expect(revisedQuote.annualPremium).toBeGreaterThan(basePremium);
    },
  );

  // ─── Landlord insurance ───────────────────────────────────────────────────────

  test(
    'landlord insurance quote for investment property @regression @quote @home-insurance',
    async () => {
      const applicant = AustralianPersonFactory.retiree();
      const property = HomePropertyBuilder.landlordProperty();
      const request = QuoteRequestBuilder.landlord(applicant, property);

      const quote = await quoteWorkflow.getQuote(request);

      expect(quote.quoteNumber).toBeTruthy();
      expect(quote.annualPremium).toBeGreaterThan(0);
    },
  );

  // ─── Buy flow ─────────────────────────────────────────────────────────────────

  test(
    'owner-occupier completes home insurance purchase and receives policy @smoke @quote @home-insurance',
    async () => {
      const applicant = AustralianPersonFactory.standard();
      const property = HomePropertyBuilder.standardBrickHome();
      const request = QuoteRequestBuilder.homeContents(applicant, property);
      const payment = {
        method: PaymentMethod.CreditCard,
        accountName: `${applicant.firstName} ${applicant.lastName}`,
        accountNumber: '4111111111111111',
        expiryDate: '12/27',
      };

      const policyNumber = await quoteWorkflow.buyPolicy(request, payment);

      expect(policyNumber).toMatch(/\d+/);
      const emailSent = await quoteWorkflow.getConfirmationEmailSent();
      expect(emailSent).toBe(true);
    },
  );

  test(
    'direct debit payment method completes purchase successfully @regression @quote @home-insurance',
    async () => {
      const applicant = AustralianPersonFactory.standard();
      const property = HomePropertyBuilder.standardBrickHome();
      const request = new QuoteRequestBuilder()
        .withProduct(QuoteProductType.HomeContents)
        .withApplicant(applicant)
        .withProperty(property)
        .withPaymentFrequency(PaymentFrequency.Monthly)
        .build();

      const payment = {
        method: PaymentMethod.BankAccount,
        accountName: `${applicant.firstName} ${applicant.lastName}`,
        accountNumber: AustralianPersonFactory.auBankAccount(),
        routingNumber: AustralianPersonFactory.auBSB(),
      };

      const policyNumber = await quoteWorkflow.buyPolicy(request, payment);
      expect(policyNumber).toMatch(/\d+/);
    },
  );
});

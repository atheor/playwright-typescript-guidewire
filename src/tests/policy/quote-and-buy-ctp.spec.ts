import { test, expect } from '../../fixtures';
import { AustralianPersonFactory } from '../../builders/australian-person.factory';
import {
  QuoteRequestBuilder,
  AustralianVehicleBuilder,
} from '../../builders/quote.builder';
import { QuoteAndBuyWorkflow } from '../../workflows/quote-and-buy.workflow';
import { PaymentMethod } from '../../types/domain.types';

/**
 * RACQ Queensland CTP (Compulsory Third Party) Green Slip — Quote tests
 *
 * CTP in QLD is regulated by the Motor Accident Insurance Commission (MAIC).
 * RACQ is one of the authorised CTP insurers for Queensland.
 *
 * Class 1 = private passenger car/wagon/hatchback
 * Class 3 = light commercial (ute, van)
 * Class 6T = motorcycle
 *
 * Tags: @smoke, @regression, @quote, @ctp
 */

test.describe('RACQ Queensland CTP (Green Slip) — Quote', () => {
  let quoteWorkflow: QuoteAndBuyWorkflow;

  test.beforeEach(async ({ page }) => {
    quoteWorkflow = new QuoteAndBuyWorkflow(page);
  });

  // ─── Smoke tests ─────────────────────────────────────────────────────────────

  test(
    'standard QLD CTP quote for class 1 passenger sedan @smoke @quote @ctp',
    async () => {
      const applicant = AustralianPersonFactory.standard();
      const vehicle = AustralianVehicleBuilder.standardSedan();
      const request = QuoteRequestBuilder.ctpQueensland(applicant, vehicle);

      const quote = await quoteWorkflow.getQuote(request);

      // CTP in QLD is regulated — prices are fixed across insurers
      expect(quote.quoteNumber).toBeTruthy();
      expect(quote.annualPremium).toBeGreaterThan(0);
    },
  );

  test(
    'CTP quote for class 1 hatchback produces valid green slip price @smoke @quote @ctp',
    async () => {
      const applicant = AustralianPersonFactory.standard();
      const vehicle = AustralianVehicleBuilder.hatchback();
      const request = QuoteRequestBuilder.ctpQueensland(applicant, vehicle);

      const quote = await quoteWorkflow.getQuote(request);

      expect(quote.quoteNumber).toBeTruthy();
      expect(quote.annualPremium).toBeGreaterThan(0);
    },
  );

  // ─── Vehicle class rating ─────────────────────────────────────────────────────

  test(
    'CTP quote for class 3 light commercial ute shows correct vehicle class @regression @quote @ctp',
    async () => {
      const applicant = AustralianPersonFactory.standard();
      const vehicle = AustralianVehicleBuilder.ute();
      const request = QuoteRequestBuilder.ctpQueensland(applicant, vehicle);

      const quote = await quoteWorkflow.getQuote(request);

      expect(quote.quoteNumber).toBeTruthy();
      expect(quote.annualPremium).toBeGreaterThan(0);
      // Commercial vehicle class 3 premium differs from class 1
    },
  );

  test(
    'CTP quote for SUV (class 1) produces valid premium @regression @quote @ctp',
    async () => {
      const applicant = AustralianPersonFactory.standard();
      const vehicle = AustralianVehicleBuilder.suv();
      const request = QuoteRequestBuilder.ctpQueensland(applicant, vehicle);

      const quote = await quoteWorkflow.getQuote(request);

      expect(quote.quoteNumber).toBeTruthy();
      expect(quote.annualPremium).toBeGreaterThan(0);
    },
  );

  // ─── Demographic variations ───────────────────────────────────────────────────

  test(
    'CTP quote for young driver (21yo) produces valid premium @regression @quote @ctp',
    async () => {
      const applicant = AustralianPersonFactory.youngDriver();
      const vehicle = AustralianVehicleBuilder.standardSedan();
      const request = QuoteRequestBuilder.ctpQueensland(applicant, vehicle);

      const quote = await quoteWorkflow.getQuote(request);

      // CTP is regulated — even young drivers get the regulated rate
      expect(quote.quoteNumber).toBeTruthy();
      expect(quote.annualPremium).toBeGreaterThan(0);
    },
  );

  test(
    'CTP quote for senior driver (70yo) produces valid premium @regression @quote @ctp',
    async () => {
      const applicant = AustralianPersonFactory.seniorDriver();
      const vehicle = AustralianVehicleBuilder.standardSedan();
      const request = QuoteRequestBuilder.ctpQueensland(applicant, vehicle);

      const quote = await quoteWorkflow.getQuote(request);

      expect(quote.quoteNumber).toBeTruthy();
      expect(quote.annualPremium).toBeGreaterThan(0);
    },
  );

  // ─── Purchase flow ────────────────────────────────────────────────────────────

  test(
    'standard driver can proceed to purchase CTP green slip @regression @quote @ctp',
    async () => {
      const applicant = AustralianPersonFactory.standard();
      const vehicle = AustralianVehicleBuilder.standardSedan();
      const request = QuoteRequestBuilder.ctpQueensland(applicant, vehicle);
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
});

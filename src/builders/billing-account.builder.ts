import { BillingAccount, BillingPlan, PaymentMethod, PaymentInstrument } from '../types/domain.types';
import { faker } from '@faker-js/faker';

/**
 * BillingAccountBuilder — fluent builder for BillingAccount test data.
 */
export class BillingAccountBuilder {
  private data: Partial<BillingAccount> = {};

  withPolicyNumber(policyNumber: string): this {
    this.data.policyNumber = policyNumber;
    return this;
  }

  withBillingPlan(plan: BillingPlan): this {
    this.data.billingPlan = plan;
    return this;
  }

  withPaymentInstrument(instrument: PaymentInstrument): this {
    this.data.paymentInstrument = instrument;
    return this;
  }

  build(): BillingAccount {
    return {
      policyNumber: this.data.policyNumber ?? 'PC-000000',
      billingPlan: this.data.billingPlan ?? BillingPlan.Monthly,
      paymentInstrument: this.data.paymentInstrument ?? PaymentInstrumentFactory.creditCard(),
    };
  }
}

/**
 * PaymentInstrumentFactory — produces common payment instrument fixtures.
 */
export class PaymentInstrumentFactory {
  static creditCard(): PaymentInstrument {
    return {
      method: PaymentMethod.CreditCard,
      accountName: faker.person.fullName(),
      accountNumber: '4111111111111111', // Luhn-valid test card
      expiryDate: '12/28',
    };
  }

  static bankAccount(): PaymentInstrument {
    return {
      method: PaymentMethod.BankAccount,
      accountName: faker.person.fullName(),
      accountNumber: faker.finance.accountNumber(10),
      routingNumber: '021000021', // Chase test routing
    };
  }

  static check(): PaymentInstrument {
    return {
      method: PaymentMethod.Check,
      accountName: faker.person.fullName(),
      accountNumber: faker.string.numeric(6),
    };
  }
}

import { faker } from '@faker-js/faker';
import { Claim, LossType } from '../types/domain.types';
import { PersonFactory } from './person.factory';

/**
 * ClaimBuilder — fluent builder for Claim test data.
 */
export class ClaimBuilder {
  private data: Partial<Claim> = {};

  withPolicyNumber(policyNumber: string): this {
    this.data.policyNumber = policyNumber;
    return this;
  }

  withLossDate(date: string): this {
    this.data.lossDate = date;
    return this;
  }

  withLossType(type: LossType): this {
    this.data.lossType = type;
    return this;
  }

  withLossDescription(description: string): this {
    this.data.lossDescription = description;
    return this;
  }

  withLossLocation(address: Claim['lossLocation']): this {
    this.data.lossLocation = address;
    return this;
  }

  withEstimatedAmount(amount: number): this {
    this.data.estimatedAmount = amount;
    return this;
  }

  withClaimant(claimant: Claim['claimant']): this {
    this.data.claimant = claimant;
    return this;
  }

  build(): Claim {
    const pastDate = faker.date.past({ years: 1 }).toISOString().split('T')[0];

    return {
      policyNumber: this.data.policyNumber ?? 'PC-000000',
      lossDate: this.data.lossDate ?? pastDate,
      lossType: this.data.lossType ?? LossType.Auto,
      lossDescription: this.data.lossDescription ?? faker.lorem.sentence(),
      lossLocation: this.data.lossLocation ?? PersonFactory.usAddress(),
      estimatedAmount: this.data.estimatedAmount,
      claimant: this.data.claimant,
    };
  }

  /** Pre-configured auto collision claim */
  static autoCollision(policyNumber: string): Claim {
    return new ClaimBuilder()
      .withPolicyNumber(policyNumber)
      .withLossType(LossType.Auto)
      .withLossDescription('Vehicle collision at intersection — front-end damage')
      .withEstimatedAmount(8500)
      .build();
  }

  /** Pre-configured property damage claim */
  static propertyDamage(policyNumber: string): Claim {
    return new ClaimBuilder()
      .withPolicyNumber(policyNumber)
      .withLossType(LossType.Property)
      .withLossDescription('Water damage to insured property due to burst pipe')
      .withEstimatedAmount(15000)
      .build();
  }
}

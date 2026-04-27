import { faker } from '@faker-js/faker';
import {
  Policy,
  PolicyType,
  PolicyHolder,
  Vehicle,
  Driver,
  Coverage,
  VehicleUse,
  DriverRelation,
} from '../types/domain.types';
import { PersonFactory } from './person.factory';

/**
 * PolicyBuilder — fluent builder for Policy test data.
 *
 * Usage:
 *   const policy = new PolicyBuilder()
 *     .withType(PolicyType.PersonalAuto)
 *     .withHolder(PersonFactory.standard())
 *     .withVehicle(VehicleBuilder.standard())
 *     .build();
 */
export class PolicyBuilder {
  private data: Partial<Policy> = {};

  withType(type: PolicyType): this {
    this.data.type = type;
    return this;
  }

  withHolder(holder: PolicyHolder): this {
    this.data.holder = holder;
    return this;
  }

  withPeriod(effectiveDate: string, expirationDate: string): this {
    this.data.period = { effectiveDate, expirationDate };
    return this;
  }

  withVehicle(vehicle: Vehicle): this {
    this.data.vehicles = [...(this.data.vehicles ?? []), vehicle];
    return this;
  }

  withDriver(driver: Driver): this {
    this.data.drivers = [...(this.data.drivers ?? []), driver];
    return this;
  }

  withCoverage(coverage: Coverage): this {
    this.data.coverages = [...(this.data.coverages ?? []), coverage];
    return this;
  }

  build(): Policy {
    const today = new Date();
    const nextYear = new Date(today);
    nextYear.setFullYear(today.getFullYear() + 1);

    return {
      type: this.data.type ?? PolicyType.PersonalAuto,
      holder: this.data.holder ?? PersonFactory.standard(),
      period: this.data.period ?? {
        effectiveDate: today.toISOString().split('T')[0],
        expirationDate: nextYear.toISOString().split('T')[0],
      },
      vehicles: this.data.vehicles,
      drivers: this.data.drivers,
      coverages: this.data.coverages,
    };
  }
}

/**
 * VehicleBuilder — produces Vehicle objects.
 */
export class VehicleBuilder {
  private data: Partial<Vehicle> = {};

  static standard(): Vehicle {
    return new VehicleBuilder()
      .withYear(faker.date.past({ years: 5 }).getFullYear())
      .withMake('Toyota')
      .withModel('Camry')
      .withPrimaryUse(VehicleUse.Commute)
      .build();
  }

  static highValue(): Vehicle {
    return new VehicleBuilder()
      .withYear(new Date().getFullYear())
      .withMake('BMW')
      .withModel('M5')
      .withPrimaryUse(VehicleUse.Pleasure)
      .build();
  }

  withVin(vin: string): this {
    this.data.vin = vin;
    return this;
  }

  withYear(year: number): this {
    this.data.year = year;
    return this;
  }

  withMake(make: string): this {
    this.data.make = make;
    return this;
  }

  withModel(model: string): this {
    this.data.model = model;
    return this;
  }

  withPrimaryUse(use: VehicleUse): this {
    this.data.primaryUse = use;
    return this;
  }

  build(): Vehicle {
    return {
      vin: this.data.vin ?? faker.vehicle.vin(),
      year: this.data.year ?? new Date().getFullYear() - 2,
      make: this.data.make ?? faker.vehicle.manufacturer(),
      model: this.data.model ?? faker.vehicle.model(),
      primaryUse: this.data.primaryUse ?? VehicleUse.Commute,
    };
  }
}

/**
 * DriverBuilder — produces Driver objects.
 */
export class DriverBuilder {
  private data: Partial<Driver> = {};

  static primaryDriver(): Driver {
    return new DriverBuilder()
      .withPerson(PersonFactory.standard())
      .withRelation(DriverRelation.Insured)
      .withYearsLicensed(10)
      .build();
  }

  withPerson(person: import('../types/domain.types').Person): this {
    this.data.person = person;
    return this;
  }

  withLicenseNumber(licenseNumber: string): this {
    this.data.licenseNumber = licenseNumber;
    return this;
  }

  withLicenseState(state: string): this {
    this.data.licenseState = state;
    return this;
  }

  withYearsLicensed(years: number): this {
    this.data.yearsLicensed = years;
    return this;
  }

  withRelation(relation: DriverRelation): this {
    this.data.relation = relation;
    return this;
  }

  build(): Driver {
    return {
      person: this.data.person ?? PersonFactory.standard(),
      licenseNumber: this.data.licenseNumber ?? faker.string.alphanumeric(8).toUpperCase(),
      licenseState: this.data.licenseState ?? 'CA',
      yearsLicensed: this.data.yearsLicensed ?? 5,
      relation: this.data.relation ?? DriverRelation.Insured,
    };
  }
}

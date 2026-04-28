import { faker } from '@faker-js/faker';
import {
  QuoteRequest,
  QuoteProductType,
  PaymentFrequency,
  ExcessOption,
  AustralianVehicle,
  VehicleBodyType,
  VehicleUse,
  HomeProperty,
  ConstructionType,
  RoofType,
  QuoteCoverageOptions,
  Person,
  Address,
} from '../types/domain.types';

/**
 * Generates a QLD vehicle registration number.
 * Modern format: 3 digits + 3 letters (e.g. 123ABC)
 */
function qlnRego(): string {
  const digits = faker.number.int({ min: 100, max: 999 }).toString();
  const letters = faker.string.alpha({ length: 3, casing: 'upper' });
  return `${digits}${letters}`;
}

// ─── QuoteRequestBuilder ──────────────────────────────────────────────────────

/**
 * Fluent builder for QuoteRequest objects.
 * Use static preset methods for common scenarios or compose with fluent setters.
 *
 * @example
 * const request = QuoteRequestBuilder.comprehensiveCar(applicant, vehicle);
 * // or
 * const request = new QuoteRequestBuilder()
 *   .withProduct(QuoteProductType.ComprehensiveCar)
 *   .withApplicant(person)
 *   .withVehicle(vehicle)
 *   .withRACQMembership(true)
 *   .build();
 */
export class QuoteRequestBuilder {
  private data: Partial<QuoteRequest> = {
    paymentFrequency: PaymentFrequency.Annual,
    startDate: new Date(Date.now() + 86_400_000).toISOString().split('T')[0], // tomorrow
    racqMember: false,
    existingPolicies: 0,
    claimsFreeYears: 0,
    coverageOptions: { excess: ExcessOption.Standard },
  };

  withProduct(product: QuoteProductType): this {
    this.data.product = product;
    return this;
  }

  withApplicant(person: Person): this {
    this.data.applicant = person;
    return this;
  }

  withVehicle(vehicle: AustralianVehicle): this {
    this.data.vehicle = vehicle;
    return this;
  }

  withProperty(property: HomeProperty): this {
    this.data.property = property;
    return this;
  }

  withCoverageOptions(opts: QuoteCoverageOptions): this {
    this.data.coverageOptions = { ...this.data.coverageOptions, ...opts };
    return this;
  }

  withPaymentFrequency(freq: PaymentFrequency): this {
    this.data.paymentFrequency = freq;
    return this;
  }

  withStartDate(date: string): this {
    this.data.startDate = date;
    return this;
  }

  withRACQMembership(isMember: boolean): this {
    this.data.racqMember = isMember;
    return this;
  }

  withExistingPolicies(count: number): this {
    this.data.existingPolicies = count;
    return this;
  }

  withClaimsFreeYears(years: number): this {
    this.data.claimsFreeYears = years;
    return this;
  }

  build(): QuoteRequest {
    if (!this.data.product) throw new Error('QuoteRequestBuilder: product is required');
    if (!this.data.applicant) throw new Error('QuoteRequestBuilder: applicant is required');
    return this.data as QuoteRequest;
  }

  // ─── Static presets ──────────────────────────────────────────────────────────

  /** Comprehensive car insurance — most common RACQ car product */
  static comprehensiveCar(applicant: Person, vehicle: AustralianVehicle): QuoteRequest {
    return new QuoteRequestBuilder()
      .withProduct(QuoteProductType.ComprehensiveCar)
      .withApplicant(applicant)
      .withVehicle(vehicle)
      .withCoverageOptions({
        excess: ExcessOption.Standard,
        roadside: false,
        hireCar: false,
        windscreen: false,
      })
      .build();
  }

  /** Third party property damage — for older/lower-value vehicles */
  static thirdPartyPropertyDamage(applicant: Person, vehicle: AustralianVehicle): QuoteRequest {
    return new QuoteRequestBuilder()
      .withProduct(QuoteProductType.ThirdPartyPropertyDamage)
      .withApplicant(applicant)
      .withVehicle(vehicle)
      .build();
  }

  /** Home and contents — owner-occupier */
  static homeContents(applicant: Person, property: HomeProperty): QuoteRequest {
    return new QuoteRequestBuilder()
      .withProduct(QuoteProductType.HomeContents)
      .withApplicant(applicant)
      .withProperty(property)
      .build();
  }

  /** Contents only — renter/apartment dweller */
  static contentsOnly(applicant: Person, property: HomeProperty): QuoteRequest {
    return new QuoteRequestBuilder()
      .withProduct(QuoteProductType.ContentsOnly)
      .withApplicant(applicant)
      .withProperty(property)
      .build();
  }

  /** Queensland Compulsory Third Party (Green Slip) */
  static ctpQueensland(applicant: Person, vehicle: AustralianVehicle): QuoteRequest {
    return new QuoteRequestBuilder()
      .withProduct(QuoteProductType.CTPQ)
      .withApplicant(applicant)
      .withVehicle(vehicle)
      .build();
  }

  /** Landlord insurance for investment property */
  static landlord(applicant: Person, property: HomeProperty): QuoteRequest {
    return new QuoteRequestBuilder()
      .withProduct(QuoteProductType.LandlordInsurance)
      .withApplicant(applicant)
      .withProperty(property)
      .build();
  }
}

// ─── AustralianVehicleBuilder ─────────────────────────────────────────────────

/**
 * Builder for AustralianVehicle test data objects.
 * Produces realistic QLD-registered vehicles for RACQ quote scenarios.
 */
export class AustralianVehicleBuilder {
  private data: Partial<AustralianVehicle> = {
    primaryUse: VehicleUse.Pleasure,
    annualKilometres: 15000,
    financed: false,
    garagingPostcode: '4000',
  };

  withRegistration(rego: string): this {
    this.data.registrationNumber = rego;
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

  withBodyType(bodyType: VehicleBodyType): this {
    this.data.bodyType = bodyType;
    return this;
  }

  withPrimaryUse(use: VehicleUse): this {
    this.data.primaryUse = use;
    return this;
  }

  withGaragingPostcode(postcode: string): this {
    this.data.garagingPostcode = postcode;
    return this;
  }

  withAnnualKilometres(km: number): this {
    this.data.annualKilometres = km;
    return this;
  }

  withFinancier(financier: string): this {
    this.data.financed = true;
    this.data.financier = financier;
    return this;
  }

  withAgreedValue(value: number): this {
    this.data.agreedValue = value;
    return this;
  }

  build(): AustralianVehicle {
    if (!this.data.year) throw new Error('AustralianVehicleBuilder: year is required');
    if (!this.data.make) throw new Error('AustralianVehicleBuilder: make is required');
    if (!this.data.model) throw new Error('AustralianVehicleBuilder: model is required');
    return {
      registrationNumber: this.data.registrationNumber ?? qlnRego(),
      bodyType: this.data.bodyType ?? VehicleBodyType.Sedan,
      ...this.data,
    } as AustralianVehicle;
  }

  // ─── Static presets ────────────────────────────────────────────────────────

  /** Standard commuter sedan — Toyota Corolla, 2021, Brisbane */
  static standardSedan(): AustralianVehicle {
    return new AustralianVehicleBuilder()
      .withYear(2021)
      .withMake('Toyota')
      .withModel('Corolla')
      .withBodyType(VehicleBodyType.Sedan)
      .withGaragingPostcode('4000')
      .withAnnualKilometres(15000)
      .build();
  }

  /** Popular family SUV — Toyota RAV4 */
  static suv(): AustralianVehicle {
    return new AustralianVehicleBuilder()
      .withYear(2022)
      .withMake('Toyota')
      .withModel('RAV4')
      .withBodyType(VehicleBodyType.SUV)
      .withGaragingPostcode('4000')
      .withAnnualKilometres(18000)
      .build();
  }

  /** Tradesperson ute — Ford Ranger, business use */
  static ute(): AustralianVehicle {
    return new AustralianVehicleBuilder()
      .withYear(2020)
      .withMake('Ford')
      .withModel('Ranger')
      .withBodyType(VehicleBodyType.Ute)
      .withPrimaryUse(VehicleUse.Business)
      .withGaragingPostcode('4305')
      .withAnnualKilometres(30000)
      .build();
  }

  /** High-value luxury vehicle — Mercedes-Benz C-Class */
  static highValueCar(): AustralianVehicle {
    return new AustralianVehicleBuilder()
      .withYear(2023)
      .withMake('Mercedes-Benz')
      .withModel('C300')
      .withBodyType(VehicleBodyType.Sedan)
      .withGaragingPostcode('4000')
      .withAnnualKilometres(12000)
      .build();
  }

  /** Old vehicle — >15 years, lower market value */
  static oldVehicle(): AustralianVehicle {
    const year = new Date().getFullYear() - 18;
    return new AustralianVehicleBuilder()
      .withYear(year)
      .withMake('Honda')
      .withModel('Civic')
      .withBodyType(VehicleBodyType.Sedan)
      .withGaragingPostcode('4109')
      .withAnnualKilometres(10000)
      .build();
  }

  /** Classic vehicle — >25 years, agreed value */
  static classicVehicle(): AustralianVehicle {
    const year = new Date().getFullYear() - 30;
    return new AustralianVehicleBuilder()
      .withYear(year)
      .withMake('Ford')
      .withModel('Falcon')
      .withBodyType(VehicleBodyType.Sedan)
      .withGaragingPostcode('4066')
      .withAnnualKilometres(5000)
      .withAgreedValue(25000)
      .build();
  }

  /** Financed vehicle — financier listed on certificate of insurance */
  static financedVehicle(): AustralianVehicle {
    return new AustralianVehicleBuilder()
      .withYear(2022)
      .withMake('Mazda')
      .withModel('CX-5')
      .withBodyType(VehicleBodyType.SUV)
      .withGaragingPostcode('4068')
      .withFinancier('Commonwealth Bank of Australia')
      .build();
  }

  /** Hatchback — compact city car */
  static hatchback(): AustralianVehicle {
    return new AustralianVehicleBuilder()
      .withYear(2020)
      .withMake('Mazda')
      .withModel('Mazda3')
      .withBodyType(VehicleBodyType.Hatchback)
      .withGaragingPostcode('4101')
      .withAnnualKilometres(13000)
      .build();
  }
}

// ─── HomePropertyBuilder ──────────────────────────────────────────────────────

/**
 * Builder for HomeProperty test data objects.
 * Produces realistic Queensland residential properties for RACQ home insurance.
 */
export class HomePropertyBuilder {
  private data: Partial<HomeProperty> = {
    constructionType: ConstructionType.Brick,
    roofType: RoofType.Tile,
    numberOfBedrooms: 3,
    hasPool: false,
    hasAlarm: false,
    isOwnerOccupied: true,
  };

  withAddress(address: Address): this {
    this.data.address = address;
    return this;
  }

  withYearBuilt(year: number): this {
    this.data.yearBuilt = year;
    return this;
  }

  withConstructionType(type: ConstructionType): this {
    this.data.constructionType = type;
    return this;
  }

  withRoofType(type: RoofType): this {
    this.data.roofType = type;
    return this;
  }

  withBedrooms(count: number): this {
    this.data.numberOfBedrooms = count;
    return this;
  }

  withPool(hasPool: boolean): this {
    this.data.hasPool = hasPool;
    return this;
  }

  withAlarm(hasAlarm: boolean): this {
    this.data.hasAlarm = hasAlarm;
    return this;
  }

  withBuildingSum(amount: number): this {
    this.data.buildingSum = amount;
    return this;
  }

  withContentsSum(amount: number): this {
    this.data.contentsSum = amount;
    return this;
  }

  withOwnerOccupied(occupied: boolean): this {
    this.data.isOwnerOccupied = occupied;
    return this;
  }

  build(): HomeProperty {
    if (!this.data.address) throw new Error('HomePropertyBuilder: address is required');
    if (!this.data.yearBuilt) throw new Error('HomePropertyBuilder: yearBuilt is required');
    return this.data as HomeProperty;
  }

  // ─── Static presets ────────────────────────────────────────────────────────

  /** Standard owner-occupier brick home — 3-bed, Toowong, Brisbane */
  static standardBrickHome(address?: Address): HomeProperty {
    return new HomePropertyBuilder()
      .withAddress(
        address ?? {
          line1: '42 River Road',
          city: 'Toowong',
          state: 'QLD',
          postalCode: '4066',
          country: 'AU',
        },
      )
      .withYearBuilt(2005)
      .withConstructionType(ConstructionType.Brick)
      .withRoofType(RoofType.Tile)
      .withBedrooms(3)
      .withBuildingSum(650000)
      .withContentsSum(120000)
      .build();
  }

  /** Contents-only apartment — renter in South Bank */
  static contentsOnlyApartment(address?: Address): HomeProperty {
    return new HomePropertyBuilder()
      .withAddress(
        address ?? {
          line1: 'Unit 5/88 Grey Street',
          city: 'South Bank',
          state: 'QLD',
          postalCode: '4101',
          country: 'AU',
        },
      )
      .withYearBuilt(2010)
      .withConstructionType(ConstructionType.Brick)
      .withRoofType(RoofType.Tile)
      .withBedrooms(2)
      .withContentsSum(80000)
      .withOwnerOccupied(false)
      .build();
  }

  /** High-value home — $1M+ building sum, Indooroopilly */
  static highValueHome(address?: Address): HomeProperty {
    return new HomePropertyBuilder()
      .withAddress(
        address ?? {
          line1: '15 Riverview Terrace',
          city: 'Indooroopilly',
          state: 'QLD',
          postalCode: '4068',
          country: 'AU',
        },
      )
      .withYearBuilt(2018)
      .withConstructionType(ConstructionType.Brick)
      .withRoofType(RoofType.Colorbond)
      .withBedrooms(5)
      .withBuildingSum(1200000)
      .withContentsSum(250000)
      .withPool(true)
      .withAlarm(true)
      .build();
  }

  /** Old pre-1970 fibro home — elevated premium expected */
  static oldFibroHome(address?: Address): HomeProperty {
    return new HomePropertyBuilder()
      .withAddress(
        address ?? {
          line1: '7 Heritage Lane',
          city: 'Ipswich',
          state: 'QLD',
          postalCode: '4305',
          country: 'AU',
        },
      )
      .withYearBuilt(1965)
      .withConstructionType(ConstructionType.Fibro)
      .withRoofType(RoofType.Iron)
      .withBedrooms(3)
      .withBuildingSum(420000)
      .withContentsSum(80000)
      .build();
  }

  /** Home with pool — liability considerations */
  static poolHome(address?: Address): HomeProperty {
    return new HomePropertyBuilder()
      .withAddress(
        address ?? {
          line1: '22 Poolside Drive',
          city: 'Sunnybank',
          state: 'QLD',
          postalCode: '4109',
          country: 'AU',
        },
      )
      .withYearBuilt(2000)
      .withConstructionType(ConstructionType.BrickVeneer)
      .withRoofType(RoofType.Tile)
      .withBedrooms(4)
      .withBuildingSum(680000)
      .withContentsSum(130000)
      .withPool(true)
      .build();
  }

  /** Investment/landlord property — not owner-occupied */
  static landlordProperty(address?: Address): HomeProperty {
    return new HomePropertyBuilder()
      .withAddress(
        address ?? {
          line1: '14 Investment Street',
          city: 'Chermside',
          state: 'QLD',
          postalCode: '4032',
          country: 'AU',
        },
      )
      .withYearBuilt(1998)
      .withConstructionType(ConstructionType.BrickVeneer)
      .withRoofType(RoofType.Tile)
      .withBedrooms(3)
      .withBuildingSum(550000)
      .withContentsSum(50000)
      .withOwnerOccupied(false)
      .build();
  }
}

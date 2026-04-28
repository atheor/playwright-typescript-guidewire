// ─── Common ────────────────────────────────────────────────────────────────────

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Person {
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO 8601
  gender: Gender;
  address: Address;
  phone: string;
  email: string;
  taxId?: string;
}

export interface Company {
  name: string;
  taxId: string;
  address: Address;
  phone: string;
  email: string;
}

export type PolicyHolder = Person | Company;

export enum Gender {
  Male = 'M',
  Female = 'F',
  Other = 'X',
}

export enum State {
  CA = 'CA',
  NY = 'NY',
  TX = 'TX',
  FL = 'FL',
  IL = 'IL',
}

// ─── Policy ────────────────────────────────────────────────────────────────────

export enum PolicyType {
  PersonalAuto = 'PersonalAuto',
  CommercialAuto = 'CommercialAuto',
  Homeowners = 'Homeowners',
  CommercialProperty = 'CommercialProperty',
  GeneralLiability = 'GeneralLiability',
  WorkersComp = 'WorkersComp',
}

export enum PolicyStatus {
  Draft = 'Draft',
  Quoted = 'Quoted',
  Bound = 'Bound',
  Cancelled = 'Cancelled',
  Expired = 'Expired',
}

export interface PolicyPeriod {
  effectiveDate: string; // ISO 8601
  expirationDate: string; // ISO 8601
}

export interface Policy {
  policyNumber?: string;
  type: PolicyType;
  holder: PolicyHolder;
  period: PolicyPeriod;
  status?: PolicyStatus;
  vehicles?: Vehicle[];
  drivers?: Driver[];
  coverages?: Coverage[];
}

export interface Vehicle {
  vin: string;
  year: number;
  make: string;
  model: string;
  primaryUse: VehicleUse;
  annualMileage?: number;
  garagingAddress?: Address;
}

export interface Driver {
  person: Person;
  licenseNumber: string;
  licenseState: string;
  yearsLicensed: number;
  relation: DriverRelation;
}

export interface Coverage {
  type: string;
  limit?: number;
  deductible?: number;
}

export enum VehicleUse {
  Commute = 'Commute',
  Business = 'Business',
  Pleasure = 'Pleasure',
  Farm = 'Farm',
}

export enum DriverRelation {
  Insured = 'Insured',
  Spouse = 'Spouse',
  Child = 'Child',
  Other = 'Other',
}

// ─── Claims ────────────────────────────────────────────────────────────────────

export enum LossType {
  Auto = 'Auto',
  Property = 'Property',
  Liability = 'Liability',
  MedPay = 'MedPay',
}

export enum ClaimStatus {
  Open = 'Open',
  Closed = 'Closed',
  ReOpened = 'ReOpened',
  Denied = 'Denied',
}

export interface Claimant {
  person: Person;
  relation: string;
}

export interface Claim {
  claimNumber?: string;
  policyNumber: string;
  lossDate: string; // ISO 8601
  lossType: LossType;
  lossDescription: string;
  reportedDate?: string;
  status?: ClaimStatus;
  claimant?: Claimant;
  lossLocation?: Address;
  estimatedAmount?: number;
}

// ─── Billing ───────────────────────────────────────────────────────────────────

export enum PaymentMethod {
  CreditCard = 'CreditCard',
  BankAccount = 'BankAccount',
  Check = 'Check',
  Wire = 'Wire',
}

export enum BillingPlan {
  Annual = 'Annual',
  SemiAnnual = 'SemiAnnual',
  Quarterly = 'Quarterly',
  Monthly = 'Monthly',
}

export interface PaymentInstrument {
  method: PaymentMethod;
  accountName: string;
  accountNumber: string;
  routingNumber?: string; // bank accounts
  expiryDate?: string;    // credit cards
}

export interface BillingAccount {
  accountNumber?: string;
  policyNumber: string;
  billingPlan: BillingPlan;
  paymentInstrument: PaymentInstrument;
}

// ─── Australia / RACQ Quote & Buy ─────────────────────────────────────────────

export enum AustralianState {
  QLD = 'QLD',
  NSW = 'NSW',
  VIC = 'VIC',
  SA = 'SA',
  WA = 'WA',
  TAS = 'TAS',
  ACT = 'ACT',
  NT = 'NT',
}

export enum QuoteProductType {
  ComprehensiveCar = 'ComprehensiveCar',
  ThirdPartyPropertyDamage = 'ThirdPartyPropertyDamage',
  ThirdPartyFireTheft = 'ThirdPartyFireTheft',
  CTPQ = 'CTPQ', // QLD Green Slip
  HomeContents = 'HomeContents',
  ContentsOnly = 'ContentsOnly',
  LandlordInsurance = 'LandlordInsurance',
  TravelInsurance = 'TravelInsurance',
  BoatInsurance = 'BoatInsurance',
}

export enum QuoteStatus {
  Draft = 'Draft',
  Rated = 'Rated',
  Accepted = 'Accepted',
  Purchased = 'Purchased',
  Expired = 'Expired',
  Declined = 'Declined',
}

export enum PaymentFrequency {
  Monthly = 'Monthly',
  Fortnightly = 'Fortnightly',
  Annual = 'Annual',
}

export enum ExcessOption {
  Standard = '750',
  Higher1000 = '1000',
  Higher1500 = '1500',
  Higher2000 = '2000',
}

export enum ConstructionType {
  Brick = 'Brick',
  Timber = 'Timber',
  BrickVeneer = 'BrickVeneer',
  Fibro = 'Fibro',
}

export enum RoofType {
  Tile = 'Tile',
  Iron = 'Iron',
  Colorbond = 'Colorbond',
}

export enum VehicleBodyType {
  Sedan = 'Sedan',
  SUV = 'SUV',
  Ute = 'Ute',
  Hatchback = 'Hatchback',
  Wagon = 'Wagon',
  Van = 'Van',
  Motorcycle = 'Motorcycle',
}

export enum DiscountType {
  RACQMember = 'RACQMember',
  MultiPolicy = 'MultiPolicy',
  ClaimsFree = 'ClaimsFree',
  OnlineDiscount = 'OnlineDiscount',
  PayAnnually = 'PayAnnually',
  SecurityAlarm = 'SecurityAlarm',
}

export interface AustralianVehicle {
  registrationNumber: string; // QLD format e.g. 123ABC
  year: number;
  make: string;
  model: string;
  bodyType: VehicleBodyType;
  engineSize?: string;
  annualKilometres?: number;
  primaryUse: VehicleUse;
  financed?: boolean;
  financier?: string;
  garagingPostcode: string;
  agreedValue?: number; // AUD — for classic/high-value vehicles
}

export interface HomeProperty {
  address: Address;
  yearBuilt: number;
  constructionType: ConstructionType;
  roofType: RoofType;
  numberOfBedrooms: number;
  hasPool?: boolean;
  hasAlarm?: boolean;
  buildingSum?: number;  // AUD
  contentsSum?: number;  // AUD
  isOwnerOccupied: boolean;
}

export interface QuoteCoverageOptions {
  excess?: ExcessOption;
  roadside?: boolean;
  hireCar?: boolean;
  windscreen?: boolean;
  newForOldReplacement?: boolean;
  portableContents?: boolean;
  portableContentsLimit?: number; // AUD
  accidentalDamage?: boolean;
}

export interface QuoteRequest {
  quoteNumber?: string;
  product: QuoteProductType;
  applicant: Person;
  vehicle?: AustralianVehicle;
  property?: HomeProperty;
  coverageOptions?: QuoteCoverageOptions;
  paymentFrequency: PaymentFrequency;
  startDate: string; // ISO 8601
  racqMember?: boolean;
  existingPolicies?: number; // for multi-policy discount
  claimsFreeYears?: number;
}

export interface DiscountApplied {
  type: DiscountType;
  percentage: number;
  amountSaved: number; // AUD
}

export interface QuoteResult {
  quoteNumber: string;
  status: QuoteStatus;
  annualPremium: number;   // AUD
  monthlyPremium: number;  // AUD
  fortnightlyPremium?: number; // AUD
  excess: number; // AUD
  discountsApplied: DiscountApplied[];
  coverageSummary: string[];
  expiryDate: string; // ISO 8601 — quotes expire after 30 days
}

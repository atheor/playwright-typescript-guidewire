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

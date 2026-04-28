import { Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { WizardStep } from '../components/wizard-step.component';
import {
  Person,
  AustralianVehicle,
  HomeProperty,
  QuoteCoverageOptions,
  PaymentFrequency,
  ExcessOption,
  QuoteProductType,
} from '../../types/domain.types';

/**
 * Product selection page — choose insurance type (car, home, CTP, etc.)
 */
export class QuoteProductSelectionPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.page.goto('/quote/new');
    await this.waitForPageLoad();
  }

  async selectProduct(product: QuoteProductType): Promise<void> {
    await this.page.getByRole('button', { name: product }).click();
    await this.waitForPageLoad();
  }

  async selectComprehensiveCar(): Promise<void> {
    await this.page.getByRole('button', { name: /comprehensive car|car insurance/i }).click();
    await this.waitForPageLoad();
  }

  async selectThirdPartyPropertyDamage(): Promise<void> {
    await this.page.getByRole('button', { name: /third.party property damage/i }).click();
    await this.waitForPageLoad();
  }

  async selectHomeAndContents(): Promise<void> {
    await this.page.getByRole('button', { name: /home.*contents|home insurance/i }).click();
    await this.waitForPageLoad();
  }

  async selectContentsOnly(): Promise<void> {
    await this.page.getByRole('button', { name: /contents only/i }).click();
    await this.waitForPageLoad();
  }

  async selectCTP(): Promise<void> {
    await this.page.getByRole('button', { name: /ctp|green.?slip|compulsory third party/i }).click();
    await this.waitForPageLoad();
  }
}

/**
 * Applicant details step — name, DOB, address, contact, RACQ membership
 */
export class QuoteApplicantPage extends BasePage {
  readonly wizard = new WizardStep(this.page);

  private readonly firstNameField = this.page.locator('[name*="FirstName"], [id*="FirstName"], [placeholder*="First name"]');
  private readonly lastNameField = this.page.locator('[name*="LastName"], [id*="LastName"], [placeholder*="Last name"]');
  private readonly dobField = this.page.locator('[name*="DateOfBirth"], [id*="DateOfBirth"], [placeholder*="Date of birth"]');
  private readonly emailField = this.page.locator('[name*="Email"], [id*="Email"], [placeholder*="Email"]');
  private readonly phoneField = this.page.locator('[name*="Phone"], [id*="Phone"], [placeholder*="Phone"]');
  private readonly postcodeField = this.page.locator('[name*="PostCode"], [id*="PostCode"], [placeholder*="Postcode"]');
  private readonly racqMemberToggle = this.page.locator('[name*="RACQMember"], [id*="RACQMember"], [data-testid="racq-member"]');
  private readonly memberNumberField = this.page.locator('[name*="MemberNumber"], [id*="MemberNumber"]');

  constructor(page: Page) {
    super(page);
  }

  async fillApplicantDetails(person: Person): Promise<void> {
    await this.firstNameField.fill(person.firstName);
    await this.lastNameField.fill(person.lastName);
    await this.dobField.fill(this.formatAustralianDate(person.dateOfBirth));
    await this.emailField.fill(person.email);
    await this.phoneField.fill(person.phone);
    await this.postcodeField.fill(person.address.postalCode);
  }

  async setRACQMembership(isMember: boolean, memberNumber?: string): Promise<void> {
    if (isMember) {
      await this.racqMemberToggle.click();
      if (memberNumber && await this.memberNumberField.isVisible({ timeout: 3000 }).catch(() => false)) {
        await this.memberNumberField.fill(memberNumber);
      }
    }
  }

  async setExistingPoliciesCount(count: number): Promise<void> {
    const dropdown = this.page.locator('[name*="ExistingPolicies"], [id*="ExistingPolicies"]');
    if (await dropdown.isVisible({ timeout: 3000 }).catch(() => false)) {
      await dropdown.selectOption(count.toString());
    }
  }

  async setClaimsFreeYears(years: number): Promise<void> {
    const dropdown = this.page.locator('[name*="ClaimsFreeYears"], [id*="ClaimsFree"]');
    if (await dropdown.isVisible({ timeout: 3000 }).catch(() => false)) {
      await dropdown.selectOption(years.toString());
    }
  }

  /** Convert ISO 8601 date to Australian display format DD/MM/YYYY */
  private formatAustralianDate(isoDate: string): string {
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
  }
}

/**
 * Vehicle details step — registration, make, model, year, use, garaging postcode
 */
export class QuoteVehiclePage extends BasePage {
  readonly wizard = new WizardStep(this.page);

  private readonly regoField = this.page.locator('[name*="Registration"], [id*="Registration"], [placeholder*="Registration"]');
  private readonly yearField = this.page.locator('[name*="VehicleYear"], [id*="VehicleYear"]');
  private readonly makeField = this.page.locator('[name*="VehicleMake"], [id*="VehicleMake"]');
  private readonly modelField = this.page.locator('[name*="VehicleModel"], [id*="VehicleModel"]');
  private readonly bodyTypeField = this.page.locator('[name*="BodyType"], [id*="BodyType"]');
  private readonly primaryUseField = this.page.locator('[name*="PrimaryUse"], [id*="PrimaryUse"]');
  private readonly garagingPostcodeField = this.page.locator('[name*="GaragingPostcode"], [id*="GaragingPostcode"]');
  private readonly annualKmField = this.page.locator('[name*="AnnualKilometres"], [id*="AnnualKm"]');
  private readonly financedToggle = this.page.locator('[name*="Financed"], [id*="Financed"]');
  private readonly financierField = this.page.locator('[name*="Financier"], [id*="Financier"]');

  constructor(page: Page) {
    super(page);
  }

  async fillVehicleDetails(vehicle: AustralianVehicle): Promise<void> {
    await this.regoField.fill(vehicle.registrationNumber);
    await this.yearField.selectOption(vehicle.year.toString());
    await this.makeField.fill(vehicle.make);

    // Wait for model dropdown to populate after make selection
    await this.page.waitForTimeout(500);
    await this.modelField.fill(vehicle.model);

    await this.bodyTypeField.selectOption(vehicle.bodyType);
    await this.primaryUseField.selectOption(vehicle.primaryUse);
    await this.garagingPostcodeField.fill(vehicle.garagingPostcode);

    if (vehicle.annualKilometres) {
      await this.annualKmField.selectOption(this.annualKmBand(vehicle.annualKilometres));
    }

    if (vehicle.financed && vehicle.financier) {
      await this.financedToggle.click();
      await this.financierField.fill(vehicle.financier);
    }
  }

  /** Map annual kilometres to the nearest band option in the RACQ dropdown */
  private annualKmBand(km: number): string {
    if (km <= 5000) return '5000';
    if (km <= 10000) return '10000';
    if (km <= 15000) return '15000';
    if (km <= 20000) return '20000';
    if (km <= 25000) return '25000';
    return '30000';
  }
}

/**
 * Property details step — address, construction, roof, bedrooms, sums insured
 */
export class QuotePropertyPage extends BasePage {
  readonly wizard = new WizardStep(this.page);

  private readonly streetField = this.page.locator('[name*="PropertyAddress"], [id*="PropertyStreet"]');
  private readonly suburbField = this.page.locator('[name*="PropertySuburb"], [id*="PropertyCity"]');
  private readonly stateField = this.page.locator('[name*="PropertyState"], [id*="PropertyState"]');
  private readonly postcodeField = this.page.locator('[name*="PropertyPostcode"], [id*="PropertyPostCode"]');
  private readonly yearBuiltField = this.page.locator('[name*="YearBuilt"], [id*="YearBuilt"]');
  private readonly constructionTypeField = this.page.locator('[name*="ConstructionType"], [id*="ConstructionType"]');
  private readonly roofTypeField = this.page.locator('[name*="RoofType"], [id*="RoofType"]');
  private readonly bedroomsField = this.page.locator('[name*="Bedrooms"], [id*="Bedrooms"]');
  private readonly buildingSumField = this.page.locator('[name*="BuildingSum"], [id*="BuildingSum"]');
  private readonly contentsSumField = this.page.locator('[name*="ContentsSum"], [id*="ContentsSum"]');
  private readonly poolToggle = this.page.locator('[name*="HasPool"], [id*="HasPool"]');
  private readonly alarmToggle = this.page.locator('[name*="HasAlarm"], [id*="HasAlarm"]');

  constructor(page: Page) {
    super(page);
  }

  async fillPropertyDetails(property: HomeProperty): Promise<void> {
    await this.streetField.fill(property.address.line1);
    await this.suburbField.fill(property.address.city);
    await this.stateField.selectOption(property.address.state);
    await this.postcodeField.fill(property.address.postalCode);
    await this.yearBuiltField.fill(property.yearBuilt.toString());
    await this.constructionTypeField.selectOption(property.constructionType);
    await this.roofTypeField.selectOption(property.roofType);
    await this.bedroomsField.selectOption(property.numberOfBedrooms.toString());

    if (property.buildingSum) {
      await this.buildingSumField.fill(property.buildingSum.toString());
    }

    if (property.contentsSum) {
      await this.contentsSumField.fill(property.contentsSum.toString());
    }

    if (property.hasPool) {
      await this.poolToggle.click();
    }

    if (property.hasAlarm) {
      await this.alarmToggle.click();
    }
  }
}

/**
 * Coverage options step — excess, optional benefits (hire car, windscreen, roadside, etc.)
 */
export class QuoteCoverageOptionsPage extends BasePage {
  readonly wizard = new WizardStep(this.page);

  private readonly excessDropdown = this.page.locator('[name*="Excess"], [id*="Excess"]');
  private readonly roadsideToggle = this.page.locator('[name*="Roadside"], [id*="Roadside"]');
  private readonly hireCarToggle = this.page.locator('[name*="HireCar"], [id*="HireCar"]');
  private readonly windscreenToggle = this.page.locator('[name*="Windscreen"], [id*="Windscreen"]');
  private readonly newForOldToggle = this.page.locator('[name*="NewForOld"], [id*="NewForOld"]');
  private readonly portableContentsToggle = this.page.locator('[name*="PortableContents"], [id*="PortableContents"]');
  private readonly portableContentsLimitField = this.page.locator('[name*="PortableContentsLimit"], [id*="PortableLimit"]');
  private readonly accidentalDamageToggle = this.page.locator('[name*="AccidentalDamage"], [id*="AccidentalDamage"]');

  constructor(page: Page) {
    super(page);
  }

  async setCoverageOptions(options: QuoteCoverageOptions): Promise<void> {
    if (options.excess) {
      await this.excessDropdown.selectOption(options.excess);
    }

    if (options.roadside !== undefined) {
      await this.setToggle(this.roadsideToggle, options.roadside);
    }

    if (options.hireCar !== undefined) {
      await this.setToggle(this.hireCarToggle, options.hireCar);
    }

    if (options.windscreen !== undefined) {
      await this.setToggle(this.windscreenToggle, options.windscreen);
    }

    if (options.newForOldReplacement !== undefined) {
      await this.setToggle(this.newForOldToggle, options.newForOldReplacement);
    }

    if (options.portableContents !== undefined) {
      await this.setToggle(this.portableContentsToggle, options.portableContents);
      if (options.portableContents && options.portableContentsLimit) {
        await this.portableContentsLimitField.fill(options.portableContentsLimit.toString());
      }
    }

    if (options.accidentalDamage !== undefined) {
      await this.setToggle(this.accidentalDamageToggle, options.accidentalDamage);
    }
  }

  async setExcess(excess: ExcessOption): Promise<void> {
    await this.excessDropdown.selectOption(excess);
    await this.page.waitForLoadState('networkidle');
  }

  async addOptionalCover(coverName: string): Promise<void> {
    const toggle = this.page.locator(`[data-testid*="${coverName}"], [aria-label*="${coverName}"]`);
    await toggle.click();
    await this.page.waitForLoadState('networkidle');
  }

  private async setToggle(toggle: ReturnType<Page['locator']>, enabled: boolean): Promise<void> {
    const isChecked = await toggle.isChecked().catch(() => false);
    if (enabled && !isChecked) {
      await toggle.click();
    } else if (!enabled && isChecked) {
      await toggle.click();
    }
  }
}

/**
 * Payment frequency selection step — before quote calculation is shown
 */
export class QuotePaymentFrequencyPage extends BasePage {
  readonly wizard = new WizardStep(this.page);

  private readonly monthlyOption = this.page.getByRole('radio', { name: /monthly/i });
  private readonly fortnightlyOption = this.page.getByRole('radio', { name: /fortnightly/i });
  private readonly annualOption = this.page.getByRole('radio', { name: /annual|yearly|once a year/i });

  constructor(page: Page) {
    super(page);
  }

  async selectPaymentFrequency(frequency: PaymentFrequency): Promise<void> {
    switch (frequency) {
      case PaymentFrequency.Monthly:
        await this.monthlyOption.click();
        break;
      case PaymentFrequency.Fortnightly:
        await this.fortnightlyOption.click();
        break;
      case PaymentFrequency.Annual:
        await this.annualOption.click();
        break;
    }
    await this.page.waitForLoadState('networkidle');
  }
}

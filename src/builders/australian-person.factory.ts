import { faker } from '@faker-js/faker';
import { Person, Address, Gender } from '../types/domain.types';

/**
 * Queensland / Australian suburbs with correct postcodes.
 */
const QLD_SUBURBS: Array<{ suburb: string; postcode: string }> = [
  { suburb: 'Brisbane City', postcode: '4000' },
  { suburb: 'South Bank', postcode: '4101' },
  { suburb: 'Toowong', postcode: '4066' },
  { suburb: 'Chermside', postcode: '4032' },
  { suburb: 'Sunnybank', postcode: '4109' },
  { suburb: 'Indooroopilly', postcode: '4068' },
  { suburb: 'Carindale', postcode: '4152' },
  { suburb: 'Aspley', postcode: '4034' },
  { suburb: 'Springwood', postcode: '4127' },
  { suburb: 'Gold Coast', postcode: '4217' },
  { suburb: 'Southport', postcode: '4215' },
  { suburb: 'Robina', postcode: '4226' },
  { suburb: 'Ipswich', postcode: '4305' },
  { suburb: 'Toowoomba', postcode: '4350' },
  { suburb: 'Sunshine Coast', postcode: '4558' },
  { suburb: 'Maroochydore', postcode: '4558' },
  { suburb: 'Cairns', postcode: '4870' },
  { suburb: 'Townsville', postcode: '4810' },
];

/**
 * AustralianPersonFactory — produces Person objects with Australian addresses,
 * phone numbers, and other AU-specific data for RACQ Quote & Buy testing.
 */
export class AustralianPersonFactory {
  /** Standard adult policyholder — Brisbane area, age 25-60 */
  static standard(): Person {
    return {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      dateOfBirth: faker.date
        .birthdate({ min: 25, max: 60, mode: 'age' })
        .toISOString()
        .split('T')[0],
      gender: Gender.Male,
      address: AustralianPersonFactory.qlnAddress(),
      phone: AustralianPersonFactory.auMobilePhone(),
      email: faker.internet.email({ provider: 'gmail.com' }),
    };
  }

  /** Young driver — age 18-24, QLD */
  static youngDriver(): Person {
    return {
      ...AustralianPersonFactory.standard(),
      dateOfBirth: faker.date
        .birthdate({ min: 18, max: 24, mode: 'age' })
        .toISOString()
        .split('T')[0],
    };
  }

  /** Senior driver — age 65-85, QLD */
  static seniorDriver(): Person {
    return {
      ...AustralianPersonFactory.standard(),
      dateOfBirth: faker.date
        .birthdate({ min: 65, max: 85, mode: 'age' })
        .toISOString()
        .split('T')[0],
    };
  }

  /** Retiree — age 60-75, QLD */
  static retiree(): Person {
    return {
      ...AustralianPersonFactory.standard(),
      dateOfBirth: faker.date
        .birthdate({ min: 60, max: 75, mode: 'age' })
        .toISOString()
        .split('T')[0],
    };
  }

  /** Person with specified age, QLD address */
  static withAge(age: number): Person {
    return {
      ...AustralianPersonFactory.standard(),
      dateOfBirth: faker.date
        .birthdate({ min: age, max: age, mode: 'age' })
        .toISOString()
        .split('T')[0],
    };
  }

  /** Random QLD address; optionally pin a specific suburb */
  static qlnAddress(suburbName?: string): Address {
    const entry = suburbName
      ? (QLD_SUBURBS.find((s) => s.suburb.toLowerCase() === suburbName.toLowerCase()) ??
          QLD_SUBURBS[0])
      : faker.helpers.arrayElement(QLD_SUBURBS);

    return {
      line1: `${faker.number.int({ min: 1, max: 200 })} ${faker.location.street()}`,
      city: entry.suburb,
      state: 'QLD',
      postalCode: entry.postcode,
      country: 'AU',
    };
  }

  /** QLD address with specific postcode */
  static qlnAddressWithPostcode(postcode: string): Address {
    const entry = QLD_SUBURBS.find((s) => s.postcode === postcode) ?? {
      suburb: 'Brisbane City',
      postcode,
    };

    return {
      line1: `${faker.number.int({ min: 1, max: 200 })} ${faker.location.street()}`,
      city: entry.suburb,
      state: 'QLD',
      postalCode: postcode,
      country: 'AU',
    };
  }

  /** NSW address — Sydney area */
  static nswAddress(): Address {
    const suburbs = [
      { suburb: 'Sydney CBD', postcode: '2000' },
      { suburb: 'Parramatta', postcode: '2150' },
      { suburb: 'Bondi', postcode: '2026' },
      { suburb: 'Chatswood', postcode: '2067' },
    ];
    const entry = faker.helpers.arrayElement(suburbs);
    return {
      line1: `${faker.number.int({ min: 1, max: 200 })} ${faker.location.street()}`,
      city: entry.suburb,
      state: 'NSW',
      postalCode: entry.postcode,
      country: 'AU',
    };
  }

  /** VIC address — Melbourne area */
  static vicAddress(): Address {
    const suburbs = [
      { suburb: 'Melbourne CBD', postcode: '3000' },
      { suburb: 'Richmond', postcode: '3121' },
      { suburb: 'St Kilda', postcode: '3182' },
      { suburb: 'Doncaster', postcode: '3108' },
    ];
    const entry = faker.helpers.arrayElement(suburbs);
    return {
      line1: `${faker.number.int({ min: 1, max: 200 })} ${faker.location.street()}`,
      city: entry.suburb,
      state: 'VIC',
      postalCode: entry.postcode,
      country: 'AU',
    };
  }

  /** Australian mobile phone — 04XX XXX XXX */
  static auMobilePhone(): string {
    const prefix = faker.helpers.arrayElement(['0400', '0412', '0421', '0433', '0447', '0455', '0468', '0478', '0487', '0499']);
    const rest = faker.number.int({ min: 100000, max: 999999 }).toString();
    return `${prefix} ${rest.slice(0, 3)} ${rest.slice(3)}`;
  }

  /** Queensland landline — 07 XXXX XXXX */
  static auLandlinePhone(): string {
    const number = faker.number.int({ min: 30000000, max: 39999999 }).toString();
    return `07 ${number.slice(0, 4)} ${number.slice(4)}`;
  }

  /** Australian BSB — 6 digits (e.g. 064-000 for CommBank QLD) */
  static auBSB(): string {
    const bsbPrefixes = ['064', '062', '032', '013', '083', '733'];
    const prefix = faker.helpers.arrayElement(bsbPrefixes);
    const suffix = faker.number.int({ min: 100, max: 999 }).toString();
    return `${prefix}-${suffix}`;
  }

  /** Australian bank account number — 6-10 digits */
  static auBankAccount(): string {
    return faker.number.int({ min: 100000, max: 9999999999 }).toString();
  }
}

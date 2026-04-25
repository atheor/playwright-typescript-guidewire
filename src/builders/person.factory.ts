import { faker } from '@faker-js/faker';
import { Person, Address, Gender, State } from '../types/domain.types';

/**
 * PersonFactory — produces Person objects for common test roles.
 * Use .build() methods for defaults or compose via PersonBuilder.
 */
export class PersonFactory {
  /** A typical adult policyholder */
  static standard(): Person {
    return {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      dateOfBirth: faker.date
        .birthdate({ min: 25, max: 60, mode: 'age' })
        .toISOString()
        .split('T')[0],
      gender: Gender.Male,
      address: PersonFactory.usAddress(),
      phone: faker.phone.number('###-###-####'),
      email: faker.internet.email(),
    };
  }

  /** A young/new driver — useful for high-risk policy testing */
  static youngDriver(): Person {
    return {
      ...PersonFactory.standard(),
      dateOfBirth: faker.date
        .birthdate({ min: 18, max: 24, mode: 'age' })
        .toISOString()
        .split('T')[0],
    };
  }

  /** A senior driver */
  static seniorDriver(): Person {
    return {
      ...PersonFactory.standard(),
      dateOfBirth: faker.date
        .birthdate({ min: 65, max: 85, mode: 'age' })
        .toISOString()
        .split('T')[0],
    };
  }

  /** Minimal valid person — only required fields */
  static minimal(): Person {
    return {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      dateOfBirth: '1980-01-01',
      gender: Gender.Female,
      address: PersonFactory.usAddress(),
      phone: '555-555-5555',
      email: faker.internet.email(),
    };
  }

  static usAddress(state: State = State.CA): Address {
    return {
      line1: faker.location.streetAddress(),
      city: faker.location.city(),
      state,
      postalCode: faker.location.zipCode('#####'),
      country: 'US',
    };
  }
}

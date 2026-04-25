import { Page } from '@playwright/test';
import { Address } from '../../types/domain.types';

/**
 * AddressForm component — reusable address entry panel used across
 * PolicyCenter, ClaimCenter, and BillingCenter.
 */
export class AddressForm {
  constructor(
    private readonly page: Page,
    /** Optional scope locator to disambiguate multiple address forms on one page */
    private readonly scope?: string,
  ) {}

  private loc(selector: string) {
    return this.scope
      ? this.page.locator(this.scope).locator(selector)
      : this.page.locator(selector);
  }

  async fill(address: Address): Promise<void> {
    await this.loc('[name*="AddressLine1"], [id*="AddressLine1"]').fill(address.line1);

    if (address.line2) {
      await this.loc('[name*="AddressLine2"], [id*="AddressLine2"]').fill(address.line2);
    }

    await this.loc('[name*="City"], [id*="City"]').fill(address.city);

    // State — Guidewire renders this as a dropdown
    await this.loc('[name*="State"], [id*="State"]').selectOption(address.state);

    await this.loc('[name*="PostalCode"], [id*="PostalCode"]').fill(address.postalCode);

    // Country — may be pre-set; only interact if present
    const countryField = this.loc('[name*="Country"], [id*="Country"]');
    if (await countryField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await countryField.selectOption(address.country);
    }
  }

  async getFilledAddress(): Promise<Partial<Address>> {
    return {
      line1: await this.loc('[name*="AddressLine1"]').inputValue(),
      city: await this.loc('[name*="City"]').inputValue(),
      state: await this.loc('[name*="State"]').inputValue(),
      postalCode: await this.loc('[name*="PostalCode"]').inputValue(),
    };
  }
}

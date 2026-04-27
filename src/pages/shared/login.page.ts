import { Page, Locator } from '@playwright/test';
import { config } from '../../config/env.config';

/**
 * Login page — shared across all three Guidewire centers.
 * Instantiate with the target app's base URL.
 */
export class LoginPage {
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginBtn: Locator;

  constructor(private readonly page: Page) {
    this.usernameInput = page.locator('[name="j_username"], #username');
    this.passwordInput = page.locator('[name="j_password"], #password');
    this.loginBtn = page.getByRole('button', { name: /Log In|Login|Sign In/ });
  }

  async goto(baseUrl: string): Promise<void> {
    await this.page.goto(baseUrl);
    await this.page.waitForLoadState('networkidle');
  }

  async login(username?: string, password?: string): Promise<void> {
    await this.usernameInput.fill(username ?? config.credentials.username);
    await this.passwordInput.fill(password ?? config.credentials.password);
    await this.loginBtn.click();
    await this.page.waitForLoadState('networkidle');
  }

  async isLoggedIn(): Promise<boolean> {
    return this.page.locator('.gw-toolbar, [data-ref="userMenu"]').isVisible({ timeout: 5000 });
  }
}

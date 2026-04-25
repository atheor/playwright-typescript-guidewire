import { Page } from '@playwright/test';
import { Policy, PolicyType } from '../types/domain.types';
import {
  NewSubmissionPage,
  PolicyholderPage,
  VehiclesPage,
  CoveragesPage,
  QuotePage,
} from '../pages/policy/submission.page';
import { PolicySummaryPage } from '../pages/policy/policy-summary.page';
import { D365PolicyService } from '../services/soap/d365-policy.service';
import { Logger } from '../services/utils/logger';

/**
 * PolicyWorkflow — orchestrates multi-step PolicyCenter operations.
 *
 * Each method represents a discrete business step.
 * Tests call steps sequentially and can assert between steps.
 */
export class PolicyWorkflow {
  private readonly newSubmission: NewSubmissionPage;
  private readonly policyholderPage: PolicyholderPage;
  private readonly vehiclesPage: VehiclesPage;
  private readonly coveragesPage: CoveragesPage;
  private readonly quotePage: QuotePage;
  private readonly summaryPage: PolicySummaryPage;
  private readonly d365Service = new D365PolicyService();
  private readonly logger = Logger.getInstance();

  constructor(private readonly page: Page) {
    this.newSubmission = new NewSubmissionPage(page);
    this.policyholderPage = new PolicyholderPage(page);
    this.vehiclesPage = new VehiclesPage(page);
    this.coveragesPage = new CoveragesPage(page);
    this.quotePage = new QuotePage(page);
    this.summaryPage = new PolicySummaryPage(page);
  }

  /** Step 1: Navigate to and start a new submission */
  async startNewSubmission(policy: Policy): Promise<void> {
    this.logger.info('Starting new submission', { type: policy.type });
    await this.newSubmission.goto();
    await this.newSubmission.selectProduct(policy.type);

    if ('address' in policy.holder) {
      await this.newSubmission.selectState(policy.holder.address.state);
    }

    await this.newSubmission.proceed();
  }

  /** Step 2: Fill policyholder/account information */
  async fillPolicyholderInfo(policy: Policy): Promise<void> {
    this.logger.info('Filling policyholder info');
    await this.policyholderPage.fillPersonDetails(policy.holder);
    await this.policyholderPage.wizard.next();
  }

  /** Step 3: Add vehicles (auto policies only) */
  async addVehicles(policy: Policy): Promise<void> {
    if (!policy.vehicles?.length) return;

    this.logger.info('Adding vehicles', { count: policy.vehicles.length });
    for (const vehicle of policy.vehicles) {
      await this.vehiclesPage.addVehicle(vehicle);
    }
    await this.vehiclesPage.wizard.next();
  }

  /** Step 4: Review and configure coverages */
  async configureCoverages(policy: Policy): Promise<void> {
    this.logger.info('Configuring coverages');
    if (policy.coverages) {
      for (const coverage of policy.coverages) {
        if (coverage.limit) {
          await this.coveragesPage.setCoverageLimit(coverage.type, String(coverage.limit));
        }
        if (coverage.deductible) {
          await this.coveragesPage.setCoverageDeductible(coverage.type, String(coverage.deductible));
        }
      }
    }
    await this.coveragesPage.wizard.next();
  }

  /** Step 5: Bind the policy and return the policy number */
  async bindPolicy(): Promise<string> {
    this.logger.info('Binding policy');
    const policyNumber = await this.quotePage.bindPolicy();
    this.logger.info('Policy bound', { policyNumber });
    return policyNumber;
  }

  /**
   * Full happy-path submission: runs all steps end-to-end.
   * Useful for test setup/teardown when the submission itself isn't what's being tested.
   */
  async submitAndBindPolicy(policy: Policy): Promise<string> {
    await this.startNewSubmission(policy);
    await this.fillPolicyholderInfo(policy);

    if (policy.type === PolicyType.PersonalAuto || policy.type === PolicyType.CommercialAuto) {
      await this.addVehicles(policy);
    }

    await this.configureCoverages(policy);
    return this.bindPolicy();
  }

  /** Verify the bound policy is synced to D365 via SOAP */
  async verifyD365Sync(policyNumber: string): Promise<boolean> {
    this.logger.info('Verifying D365 sync', { policyNumber });
    return this.d365Service.verifyPolicySynced(policyNumber);
  }

  /** Navigate to an existing policy summary */
  async openPolicy(policyNumber: string): Promise<PolicySummaryPage> {
    await this.page.goto(`/pc/PolicyFile.do?policyNumber=${policyNumber}`);
    await this.page.waitForLoadState('networkidle');
    return this.summaryPage;
  }
}

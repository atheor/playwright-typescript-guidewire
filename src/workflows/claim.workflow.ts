import { Page } from '@playwright/test';
import { Claim } from '../types/domain.types';
import {
  NewClaimPage,
  LossDetailsPage,
  ClaimantDetailsPage,
  ClaimSummaryPage,
} from '../pages/claims/claim-entry.page';
import { D365ClaimService } from '../services/soap/d365-claim.service';
import { Logger } from '../services/utils/logger';

/**
 * ClaimWorkflow — orchestrates multi-step ClaimCenter operations.
 */
export class ClaimWorkflow {
  private readonly newClaimPage: NewClaimPage;
  private readonly lossDetailsPage: LossDetailsPage;
  private readonly claimantDetailsPage: ClaimantDetailsPage;
  private readonly claimSummaryPage: ClaimSummaryPage;
  private readonly d365Service = new D365ClaimService();
  private readonly logger = Logger.getInstance();

  constructor(private readonly page: Page) {
    this.newClaimPage = new NewClaimPage(page);
    this.lossDetailsPage = new LossDetailsPage(page);
    this.claimantDetailsPage = new ClaimantDetailsPage(page);
    this.claimSummaryPage = new ClaimSummaryPage(page);
  }

  /** Step 1: Start a new claim and search for the policy */
  async startNewClaim(policyNumber: string): Promise<void> {
    this.logger.info('Starting new claim', { policyNumber });
    await this.newClaimPage.goto();
    await this.newClaimPage.searchByPolicyNumber(policyNumber);
    await this.newClaimPage.selectPolicy(policyNumber);
  }

  /** Step 2: Fill in loss details */
  async fillLossDetails(claim: Claim): Promise<void> {
    this.logger.info('Filling loss details', { lossType: claim.lossType });
    await this.lossDetailsPage.fillLossDetails(claim);
    await this.lossDetailsPage.wizard.next();
  }

  /** Step 3: Add claimant (optional) */
  async addClaimant(claim: Claim): Promise<void> {
    if (!claim.claimant) return;

    this.logger.info('Adding claimant');
    await this.claimantDetailsPage.addClaimant(
      claim.claimant.person.firstName,
      claim.claimant.person.lastName,
    );
    await this.claimantDetailsPage.wizard.next();
  }

  /** Step 4: Finish and return the claim number */
  async finishClaim(): Promise<string> {
    this.logger.info('Finishing claim');
    await this.claimSummaryPage.wizard.finish();
    const claimNumber = await this.claimSummaryPage.getClaimNumber();
    this.logger.info('Claim created', { claimNumber });
    return claimNumber;
  }

  /** Full happy-path claim filing */
  async fileNewClaim(claim: Claim): Promise<string> {
    await this.startNewClaim(claim.policyNumber);
    await this.fillLossDetails(claim);
    await this.addClaimant(claim);
    return this.finishClaim();
  }

  /** Verify the claim is synced to D365 */
  async verifyD365Sync(claimNumber: string): Promise<boolean> {
    this.logger.info('Verifying D365 claim sync', { claimNumber });
    return this.d365Service.verifyClaimSynced(claimNumber);
  }

  /** Navigate to an existing claim */
  async openClaim(claimNumber: string): Promise<ClaimSummaryPage> {
    await this.page.goto(`/cc/ClaimSummary.do?claimNumber=${claimNumber}`);
    await this.page.waitForLoadState('networkidle');
    return this.claimSummaryPage;
  }
}

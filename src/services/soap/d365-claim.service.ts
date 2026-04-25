import { BaseSoapService } from './base-soap.service';
import {
  GetClaimRequest,
  GetClaimResponse,
  CreateClaimRequest,
  CreateClaimResponse,
} from '../../types/soap.types';
import path from 'path';

/**
 * D365ClaimService — SOAP client for claim-related D365 operations.
 */
export class D365ClaimService extends BaseSoapService {
  protected get wsdlPath(): string {
    return path.resolve(__dirname, '../wsdl/d365-claim.wsdl');
  }

  async getClaim(request: GetClaimRequest): Promise<GetClaimResponse> {
    return this.call<GetClaimRequest, GetClaimResponse>('GetClaim', request);
  }

  async createClaim(request: CreateClaimRequest): Promise<CreateClaimResponse> {
    return this.call<CreateClaimRequest, CreateClaimResponse>('CreateClaim', request);
  }

  async verifyClaimSynced(claimNumber: string): Promise<boolean> {
    const response = await this.getClaim({ claimNumber });
    return !response.errorCode && response.claimNumber === claimNumber;
  }
}

import { BaseSoapService } from './base-soap.service';
import {
  GetPolicyRequest,
  GetPolicyResponse,
  CreatePolicyRequest,
  CreatePolicyResponse,
} from '../../types/soap.types';
import path from 'path';

/**
 * D365PolicyService — SOAP client for policy-related D365 operations.
 * WSDL file lives in src/services/wsdl/d365-policy.wsdl
 */
export class D365PolicyService extends BaseSoapService {
  protected get wsdlPath(): string {
    return path.resolve(__dirname, '../wsdl/d365-policy.wsdl');
  }

  async getPolicy(request: GetPolicyRequest): Promise<GetPolicyResponse> {
    return this.call<GetPolicyRequest, GetPolicyResponse>('GetPolicy', request);
  }

  async createPolicy(request: CreatePolicyRequest): Promise<CreatePolicyResponse> {
    return this.call<CreatePolicyRequest, CreatePolicyResponse>('CreatePolicy', request);
  }

  async verifyPolicySynced(policyNumber: string): Promise<boolean> {
    const response = await this.getPolicy({ policyNumber });
    return !response.errorCode && response.policyNumber === policyNumber;
  }
}

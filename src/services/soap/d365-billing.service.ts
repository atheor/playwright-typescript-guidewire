import { BaseSoapService } from './base-soap.service';
import {
  GetAccountRequest,
  GetAccountResponse,
  ProcessPaymentRequest,
  ProcessPaymentResponse,
} from '../../types/soap.types';
import path from 'path';

/**
 * D365BillingService — SOAP client for billing/payment D365 operations.
 */
export class D365BillingService extends BaseSoapService {
  protected get wsdlPath(): string {
    return path.resolve(__dirname, '../wsdl/d365-billing.wsdl');
  }

  async getAccount(request: GetAccountRequest): Promise<GetAccountResponse> {
    return this.call<GetAccountRequest, GetAccountResponse>('GetAccount', request);
  }

  async processPayment(request: ProcessPaymentRequest): Promise<ProcessPaymentResponse> {
    return this.call<ProcessPaymentRequest, ProcessPaymentResponse>('ProcessPayment', request);
  }

  async getAccountBalance(accountNumber: string): Promise<number> {
    const response = await this.getAccount({ accountNumber });
    return response.balance;
  }
}

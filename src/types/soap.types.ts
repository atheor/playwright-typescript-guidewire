// D365 SOAP request/response type contracts
// These mirror the WSDL-generated interfaces (wsdl-tsclient output lives here too)

export interface SoapHeader {
  username: string;
  password: string;
  correlationId?: string;
}

// ─── Policy SOAP ───────────────────────────────────────────────────────────────

export interface GetPolicyRequest {
  policyNumber: string;
}

export interface GetPolicyResponse {
  policyNumber: string;
  status: string;
  effectiveDate: string;
  expirationDate: string;
  insuredName: string;
  premium: number;
  errorCode?: string;
  errorMessage?: string;
}

export interface CreatePolicyRequest {
  policyType: string;
  insuredFirstName: string;
  insuredLastName: string;
  effectiveDate: string;
  expirationDate: string;
  premium: number;
}

export interface CreatePolicyResponse {
  policyNumber: string;
  success: boolean;
  errorCode?: string;
  errorMessage?: string;
}

// ─── Claim SOAP ────────────────────────────────────────────────────────────────

export interface GetClaimRequest {
  claimNumber: string;
}

export interface GetClaimResponse {
  claimNumber: string;
  policyNumber: string;
  status: string;
  lossDate: string;
  reportedDate: string;
  reserveAmount: number;
  errorCode?: string;
  errorMessage?: string;
}

export interface CreateClaimRequest {
  policyNumber: string;
  lossDate: string;
  lossType: string;
  lossDescription: string;
  reportedBy: string;
}

export interface CreateClaimResponse {
  claimNumber: string;
  success: boolean;
  errorCode?: string;
  errorMessage?: string;
}

// ─── Billing SOAP ──────────────────────────────────────────────────────────────

export interface GetAccountRequest {
  accountNumber: string;
}

export interface GetAccountResponse {
  accountNumber: string;
  policyNumber: string;
  balance: number;
  dueDate: string;
  status: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface ProcessPaymentRequest {
  accountNumber: string;
  amount: number;
  paymentMethod: string;
  referenceNumber?: string;
}

export interface ProcessPaymentResponse {
  transactionId: string;
  success: boolean;
  newBalance: number;
  errorCode?: string;
  errorMessage?: string;
}

# SOAP & D365 Integration

## Overview

Microsoft Dynamics 365 (D365) is integrated with all three Guidewire applications. When key operations occur in Guidewire (policy bind, claim creation, payment processing), data is pushed to D365 via SOAP web services. Tests verify these integrations by making SOAP calls directly to D365 after a UI action completes.

```
Guidewire (UI action)
        │
        │  internal integration
        ▼
  D365 SOAP Endpoint
        │
        │  test verification call
        ▲
Test (D365SoapService.verifyXxx())
```

---

## SOAP Stack

| Component | Role |
|-----------|------|
| `node-soap` | WSDL parsing, client creation, WS-Security |
| `wsdl-tsclient` | Generates TypeScript interfaces from `.wsdl` files |
| `BaseSoapService` | Shared client lifecycle and logging |
| `D365PolicyService` | Policy SOAP operations |
| `D365ClaimService` | Claim SOAP operations |
| `D365BillingService` | Billing/payment SOAP operations |

---

## BaseSoapService

All SOAP services extend `BaseSoapService`, which handles:

### Client lifecycle

The SOAP client is created once and cached. Subsequent calls reuse the same client, avoiding expensive WSDL parsing on every request.

```typescript
protected async getClient(): Promise<soap.Client> {
  if (!this.client) {
    this.client = await soap.createClientAsync(this.wsdlPath, {
      endpoint: config.d365.soapUrl,
      timeout: config.d365.timeout,
    });
    this.client.setSecurity(
      new soap.WSSecurity(config.d365.username, config.d365.password)
    );
  }
  return this.client;
}
```

### WS-Security

Authentication uses WS-Security `UsernameToken`. Credentials are read from the environment config — never hardcoded. The `node-soap` `WSSecurity` class adds the required SOAP security header automatically.

### Typed call wrapper

```typescript
protected async call<TRequest, TResponse>(
  methodName: string,
  request: TRequest,
): Promise<TResponse> {
  const client = await this.getClient();
  this.logger.debug(`SOAP ${methodName} request`, request);
  const [result] = await client[`${methodName}Async`](request);
  this.logger.debug(`SOAP ${methodName} response`, result);
  return result;
}
```

All SOAP calls are logged at `debug` level. Set `LOG_LEVEL=debug` to see full request/response payloads.

---

## Service Classes

### D365PolicyService

```typescript
// Get a policy from D365 by policy number
const response: GetPolicyResponse = await d365PolicyService.getPolicy({
  policyNumber: 'PC-00012345',
});

// Create a policy record in D365 directly (for setup/teardown)
const result: CreatePolicyResponse = await d365PolicyService.createPolicy({
  policyType: 'PersonalAuto',
  insuredFirstName: 'James',
  insuredLastName: 'Smith',
  effectiveDate: '2026-01-01',
  expirationDate: '2027-01-01',
  premium: 1200,
});

// Check if GW-bound policy has synced
const isSynced: boolean = await d365PolicyService.verifyPolicySynced('PC-00012345');
```

### D365ClaimService

```typescript
const response: GetClaimResponse = await d365ClaimService.getClaim({
  claimNumber: 'CC-00056789',
});

const result: CreateClaimResponse = await d365ClaimService.createClaim({
  policyNumber: 'PC-00012345',
  lossDate: '2026-03-01',
  lossType: 'Auto',
  lossDescription: 'Vehicle collision',
  reportedBy: 'Agent',
});

const isSynced: boolean = await d365ClaimService.verifyClaimSynced('CC-00056789');
```

### D365BillingService

```typescript
const account: GetAccountResponse = await d365BillingService.getAccount({
  accountNumber: 'BC-00099999',
});
console.log(account.balance); // current balance

const result: ProcessPaymentResponse = await d365BillingService.processPayment({
  accountNumber: 'BC-00099999',
  amount: 500,
  paymentMethod: 'CreditCard',
  referenceNumber: 'TXN-001',
});

const balance: number = await d365BillingService.getAccountBalance('BC-00099999');
```

---

## SOAP Types (`src/types/soap.types.ts`)

TypeScript interfaces mirror the D365 WSDL message schema. These types prevent shape mismatches between what tests send and what D365 expects.

```typescript
// Request/response pairs for each operation
GetPolicyRequest    /  GetPolicyResponse
CreatePolicyRequest /  CreatePolicyResponse
GetClaimRequest     /  GetClaimResponse
CreateClaimRequest  /  CreateClaimResponse
GetAccountRequest   /  GetAccountResponse
ProcessPaymentRequest / ProcessPaymentResponse
```

All response types include optional `errorCode` and `errorMessage` fields following D365's standard fault envelope pattern.

---

## WSDL Type Generation

When a WSDL changes (new operations, updated schema), re-generate the TypeScript types:

```bash
# Place updated WSDLs in src/services/wsdl/
npm run generate:soap-types

# This runs scripts/generate-soap-types.js which invokes wsdl-tsclient:
# npx wsdl-tsclient src/services/wsdl/d365-policy.wsdl -o src/types/generated/d365-policy
# npx wsdl-tsclient src/services/wsdl/d365-claim.wsdl  -o src/types/generated/d365-claim
# npx wsdl-tsclient src/services/wsdl/d365-billing.wsdl -o src/types/generated/d365-billing
```

Generated types in `src/types/generated/` should be committed to source control. This ensures CI does not need network access to D365 to resolve types during build.

---

## Using SOAP in Tests

SOAP calls are exposed through workflow `verifyD365Sync()` methods — tests should not import service classes directly. This keeps tests at the business language level.

```typescript
// ✅ Correct — via workflow
const synced = await policyWorkflow.verifyD365Sync(policyNumber);
expect(synced).toBe(true);

// ❌ Avoid — imports service directly into test
import { D365PolicyService } from '../../services/soap/d365-policy.service';
const service = new D365PolicyService();
const response = await service.getPolicy({ policyNumber });
```

If a test needs a SOAP operation that isn't covered by an existing workflow method, add a new method to the appropriate workflow class.

---

## SOAP Timeout and Retry

The SOAP timeout is configured via `D365_SOAP_TIMEOUT` (default: `30000` ms). If D365 is slow in a particular environment, increase this value in `.env.local`.

`node-soap` does not retry automatically. If D365 integration is flaky in CI, wrap calls in a retry utility:

```typescript
// Utility example (not included by default — add if needed)
async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries - 1) throw err;
    }
  }
  throw new Error('Unreachable');
}

const response = await withRetry(() => d365PolicyService.getPolicy({ policyNumber }));
```

---

## Debugging SOAP Issues

```bash
# Enable debug logging to see request/response XML
LOG_LEVEL=debug npm run test:pc

# Output format:
# [2026-04-25T10:00:00Z] debug: SOAP GetPolicy request
# { policyNumber: 'PC-00012345' }
# [2026-04-25T10:00:01Z] debug: SOAP GetPolicy response
# { policyNumber: 'PC-00012345', status: 'Bound', premium: 1200, ... }
```

If `node-soap` is logging raw XML, also set `DEBUG=node-soap*` for full wire-level output.

export interface EnvConfig {
  baseUrl: string;
  policyCenterUrl: string;
  claimCenterUrl: string;
  billingCenterUrl: string;
  credentials: {
    username: string;
    password: string;
  };
  d365: {
    soapUrl: string;
    username: string;
    password: string;
    timeout: number;
  };
}

const env = process.env.TEST_ENV ?? 'dev';

const configs: Record<string, EnvConfig> = {
  dev: {
    baseUrl: process.env.POLICY_CENTER_URL ?? 'http://localhost:8080/pc',
    policyCenterUrl: process.env.POLICY_CENTER_URL ?? 'http://localhost:8080/pc',
    claimCenterUrl: process.env.CLAIM_CENTER_URL ?? 'http://localhost:8080/cc',
    billingCenterUrl: process.env.BILLING_CENTER_URL ?? 'http://localhost:8080/bc',
    credentials: {
      username: process.env.GW_USERNAME ?? 'admin',
      password: process.env.GW_PASSWORD ?? 'gw',
    },
    d365: {
      soapUrl: process.env.D365_SOAP_URL ?? 'http://d365-instance/api/soap',
      username: process.env.D365_SOAP_USERNAME ?? '',
      password: process.env.D365_SOAP_PASSWORD ?? '',
      timeout: parseInt(process.env.D365_SOAP_TIMEOUT ?? '30000', 10),
    },
  },
  staging: {
    baseUrl: process.env.POLICY_CENTER_URL ?? 'https://staging.policycenter.example.com',
    policyCenterUrl: process.env.POLICY_CENTER_URL ?? 'https://staging.policycenter.example.com',
    claimCenterUrl: process.env.CLAIM_CENTER_URL ?? 'https://staging.claimcenter.example.com',
    billingCenterUrl: process.env.BILLING_CENTER_URL ?? 'https://staging.billingcenter.example.com',
    credentials: {
      username: process.env.GW_USERNAME ?? '',
      password: process.env.GW_PASSWORD ?? '',
    },
    d365: {
      soapUrl: process.env.D365_SOAP_URL ?? '',
      username: process.env.D365_SOAP_USERNAME ?? '',
      password: process.env.D365_SOAP_PASSWORD ?? '',
      timeout: parseInt(process.env.D365_SOAP_TIMEOUT ?? '30000', 10),
    },
  },
};

export const config: EnvConfig = configs[env] ?? configs['dev'];

import * as soap from 'soap';
import { config } from '../../config/env.config';
import { Logger } from '../utils/logger';

/**
 * BaseSoapService — handles SOAP client lifecycle, authentication headers,
 * and common error handling for all D365 service clients.
 */
export abstract class BaseSoapService {
  protected client: soap.Client | null = null;
  protected readonly logger = Logger.getInstance();

  protected abstract get wsdlPath(): string;

  protected async getClient(): Promise<soap.Client> {
    if (!this.client) {
      this.client = await soap.createClientAsync(this.wsdlPath, {
        endpoint: config.d365.soapUrl,
      });

      // Set WS-Security credentials
      this.client.setSecurity(
        new soap.WSSecurity(config.d365.username, config.d365.password),
      );
    }
    return this.client;
  }

  protected async call<TRequest extends object, TResponse>(
    methodName: string,
    request: TRequest,
  ): Promise<TResponse> {
    const client = await this.getClient();
    this.logger.debug(`SOAP ${methodName} request`, request);

    const [result] = await (client as soap.Client & Record<string, (req: TRequest) => Promise<[TResponse]>>)
      [`${methodName}Async`](request);

    this.logger.debug(`SOAP ${methodName} response`, result);
    return result;
  }
}

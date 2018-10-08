import { ClientInfo } from './clientInfo';
/**
 * @classdesc Incapsulates network operations to make it possible to add some optimization/caching strategies
 */
declare class Network {
    clientInfo: ClientInfo;
    config: any;
    transport: any;
    constructor(clientInfo: ClientInfo, config: any, transport: any);
    private createHeaders;
    private backoffConfig;
    private executeWithRetry;
    /**
     * Make a GET request by given URI
     * @Returns Promise<Response> Result of successful get request
     */
    get(uri: string): Promise<Response>;
    post(uri: string, body: Object, revision?: string, twilsockOnly?: boolean): Promise<Response>;
    put(uri: string, body: Object, revision: string): Promise<Response>;
    delete(uri: string): Promise<Response>;
}
export { Network };

import { SyncError } from './syncerror';
declare class SyncNetworkError extends SyncError {
    body: any;
    constructor(message: string, status: number, code: number, body: any);
}
export { SyncNetworkError };
export default SyncNetworkError;

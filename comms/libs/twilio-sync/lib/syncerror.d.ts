/**
 * Generic SyncLibrary error class
 */
declare class SyncError extends Error {
    name: string;
    message: string;
    status: number;
    code: number;
    constructor(message: string, status?: number, code?: number);
}
export { SyncError };
export default SyncError;

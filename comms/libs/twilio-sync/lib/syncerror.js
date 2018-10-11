"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Generic SyncLibrary error class
 */
class SyncError extends Error {
    constructor(message, status = 0, code = 0) {
        super();
        this.name = this.constructor.name;
        this.message = `${message} (status: ${status}, code: ${code})`;
        this.status = status;
        this.code = code;
    }
}
exports.SyncError = SyncError;
exports.default = SyncError;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const syncerror_1 = require("./syncerror");
class SyncNetworkError extends syncerror_1.SyncError {
    constructor(message, status = 0, code = 0, body) {
        super(message, status, code);
        this.body = body;
    }
}
exports.SyncNetworkError = SyncNetworkError;
exports.default = SyncNetworkError;

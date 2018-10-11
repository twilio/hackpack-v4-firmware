"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid = require("uuid");
const logger_1 = require("./logger");
const syncerror_1 = require("./syncerror");
const syncNetworkError_1 = require("./syncNetworkError");
const operation_retrier_1 = require("operation-retrier");
const twilsock_1 = require("twilsock");
const MINIMUM_RETRY_DELAY = 4000;
const MAXIMUM_RETRY_DELAY = 60000;
const MAXIMUM_ATTEMPTS_TIME = 90000;
const RETRY_DELAY_RANDOMNESS = 0.2;
function messageFromErrorBody(trasportError) {
    if (trasportError.body) {
        if (trasportError.body.message) {
            return trasportError.body.message;
        }
    }
    switch (trasportError.status) {
        case 429:
            return 'Throttled by server';
        case 404:
            return 'Not found from server';
        default:
            return 'Error from server';
    }
}
function codeFromErrorBody(trasportError) {
    if (trasportError.body) {
        return trasportError.body.code;
    }
    return 0;
}
function mapTransportError(transportError) {
    if (transportError.status === 409) {
        return new syncNetworkError_1.SyncNetworkError(messageFromErrorBody(transportError), transportError.status, codeFromErrorBody(transportError), transportError.body);
    }
    else if (transportError.status) {
        return new syncerror_1.SyncError(messageFromErrorBody(transportError), transportError.status, codeFromErrorBody(transportError));
    }
    else if (transportError instanceof twilsock_1.TransportUnavailableError) {
        return transportError;
    }
    else {
        return new syncerror_1.SyncError(transportError.message, 0, 0);
    }
}
/**
 * @classdesc Incapsulates network operations to make it possible to add some optimization/caching strategies
 */
class Network {
    constructor(clientInfo, config, transport) {
        this.clientInfo = clientInfo;
        this.config = config;
        this.transport = transport;
    }
    createHeaders() {
        return {
            'Content-Type': 'application/json',
            'Twilio-Sync-Client-Info': JSON.stringify(this.clientInfo),
            'Twilio-Request-Id': 'RQ' + uuid.v4().replace(/-/g, '')
        };
    }
    backoffConfig() {
        return Object.assign({ min: MINIMUM_RETRY_DELAY,
            max: MAXIMUM_RETRY_DELAY,
            maxAttemptsTime: MAXIMUM_ATTEMPTS_TIME,
            randomness: RETRY_DELAY_RANDOMNESS }, this.config.backoffConfig);
    }
    executeWithRetry(request, retryWhenThrottled = true) {
        return new Promise((resolve, reject) => {
            let codesToRetryOn = [502, 503, 504];
            if (retryWhenThrottled) {
                codesToRetryOn.push(429);
            }
            let retrier = new operation_retrier_1.default(this.backoffConfig());
            retrier.on('attempt', () => {
                request()
                    .then(result => retrier.succeeded(result))
                    .catch(err => {
                    if (codesToRetryOn.includes(err.status)) {
                        let delayOverride = parseInt(err.headers ? err.headers['Retry-After'] : null);
                        retrier.failed(mapTransportError(err), isNaN(delayOverride) ? null : delayOverride * 1000);
                    }
                    else if (err.message === 'Twilsock disconnected') {
                        // Ugly hack. We must make a proper exceptions for twilsock
                        retrier.failed(mapTransportError(err));
                    }
                    else if (err.message && err.message.indexOf('Twilsock: request timeout') !== -1) {
                        // Ugly hack. We must make a proper exceptions for twilsock
                        retrier.failed(mapTransportError(err));
                    }
                    else {
                        // Fatal error
                        retrier.removeAllListeners();
                        retrier.cancel();
                        reject(mapTransportError(err));
                    }
                });
            });
            retrier.on('succeeded', result => { resolve(result); });
            retrier.on('cancelled', err => reject(mapTransportError(err)));
            retrier.on('failed', err => reject(mapTransportError(err)));
            retrier.start();
        });
    }
    /**
     * Make a GET request by given URI
     * @Returns Promise<Response> Result of successful get request
     */
    get(uri) {
        let headers = this.createHeaders();
        logger_1.default.debug('GET', uri, 'ID:', headers['Twilio-Request-Id']);
        return this.executeWithRetry(() => this.transport.get(uri, headers), true);
    }
    post(uri, body, revision, twilsockOnly) {
        let headers = this.createHeaders();
        if (typeof revision !== 'undefined' && revision !== null) {
            headers['If-Match'] = revision;
        }
        logger_1.default.debug('POST', uri, 'ID:', headers['Twilio-Request-Id']);
        return this.executeWithRetry(() => this.transport.post(uri, headers, body, twilsockOnly), false);
    }
    put(uri, body, revision) {
        let headers = this.createHeaders();
        if (typeof revision !== 'undefined' && revision !== null) {
            headers['If-Match'] = revision;
        }
        logger_1.default.debug('PUT', uri, 'ID:', headers['Twilio-Request-Id']);
        return this.executeWithRetry(() => this.transport.put(uri, headers, body), false);
    }
    delete(uri) {
        let headers = this.createHeaders();
        logger_1.default.debug('DELETE', uri, 'ID:', headers['Twilio-Request-Id']);
        return this.executeWithRetry(() => this.transport.delete(uri, headers), false);
    }
}
exports.Network = Network;

"use strict";

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var uuid = require("uuid");
var logger_1 = require("./logger");
var syncerror_1 = require("./syncerror");
var syncNetworkError_1 = require("./syncNetworkError");
var operation_retrier_1 = require("operation-retrier");
var twilsock_1 = require("twilsock");
var MINIMUM_RETRY_DELAY = 4000;
var MAXIMUM_RETRY_DELAY = 60000;
var MAXIMUM_ATTEMPTS_TIME = 90000;
var RETRY_DELAY_RANDOMNESS = 0.2;
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
    } else if (transportError.status) {
        return new syncerror_1.SyncError(messageFromErrorBody(transportError), transportError.status, codeFromErrorBody(transportError));
    } else if (transportError instanceof twilsock_1.TransportUnavailableError) {
        return transportError;
    } else {
        return new syncerror_1.SyncError(transportError.message, 0, 0);
    }
}
/**
 * @classdesc Incapsulates network operations to make it possible to add some optimization/caching strategies
 */

var Network = function () {
    function Network(clientInfo, config, transport) {
        (0, _classCallCheck3.default)(this, Network);

        this.clientInfo = clientInfo;
        this.config = config;
        this.transport = transport;
    }

    (0, _createClass3.default)(Network, [{
        key: "createHeaders",
        value: function createHeaders() {
            return {
                'Content-Type': 'application/json',
                'Twilio-Sync-Client-Info': (0, _stringify2.default)(this.clientInfo),
                'Twilio-Request-Id': 'RQ' + uuid.v4().replace(/-/g, '')
            };
        }
    }, {
        key: "backoffConfig",
        value: function backoffConfig() {
            return (0, _assign2.default)({ min: MINIMUM_RETRY_DELAY,
                max: MAXIMUM_RETRY_DELAY,
                maxAttemptsTime: MAXIMUM_ATTEMPTS_TIME,
                randomness: RETRY_DELAY_RANDOMNESS }, this.config.backoffConfig);
        }
    }, {
        key: "executeWithRetry",
        value: function executeWithRetry(request) {
            var _this = this;

            var retryWhenThrottled = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

            return new _promise2.default(function (resolve, reject) {
                var codesToRetryOn = [502, 503, 504];
                if (retryWhenThrottled) {
                    codesToRetryOn.push(429);
                }
                var retrier = new operation_retrier_1.default(_this.backoffConfig());
                retrier.on('attempt', function () {
                    request().then(function (result) {
                        return retrier.succeeded(result);
                    }).catch(function (err) {
                        if (codesToRetryOn.includes(err.status)) {
                            var delayOverride = parseInt(err.headers ? err.headers['Retry-After'] : null);
                            retrier.failed(mapTransportError(err), isNaN(delayOverride) ? null : delayOverride * 1000);
                        } else if (err.message === 'Twilsock disconnected') {
                            // Ugly hack. We must make a proper exceptions for twilsock
                            retrier.failed(mapTransportError(err));
                        } else if (err.message && err.message.indexOf('Twilsock: request timeout') !== -1) {
                            // Ugly hack. We must make a proper exceptions for twilsock
                            retrier.failed(mapTransportError(err));
                        } else {
                            // Fatal error
                            retrier.removeAllListeners();
                            retrier.cancel();
                            reject(mapTransportError(err));
                        }
                    });
                });
                retrier.on('succeeded', function (result) {
                    resolve(result);
                });
                retrier.on('cancelled', function (err) {
                    return reject(mapTransportError(err));
                });
                retrier.on('failed', function (err) {
                    return reject(mapTransportError(err));
                });
                retrier.start();
            });
        }
        /**
         * Make a GET request by given URI
         * @Returns Promise<Response> Result of successful get request
         */

    }, {
        key: "get",
        value: function get(uri) {
            var _this2 = this;

            var headers = this.createHeaders();
            logger_1.default.debug('GET', uri, 'ID:', headers['Twilio-Request-Id']);
            return this.executeWithRetry(function () {
                return _this2.transport.get(uri, headers);
            }, true);
        }
    }, {
        key: "post",
        value: function post(uri, body, revision, twilsockOnly) {
            var _this3 = this;

            var headers = this.createHeaders();
            if (typeof revision !== 'undefined' && revision !== null) {
                headers['If-Match'] = revision;
            }
            logger_1.default.debug('POST', uri, 'ID:', headers['Twilio-Request-Id']);
            return this.executeWithRetry(function () {
                return _this3.transport.post(uri, headers, body, twilsockOnly);
            }, false);
        }
    }, {
        key: "put",
        value: function put(uri, body, revision) {
            var _this4 = this;

            var headers = this.createHeaders();
            if (typeof revision !== 'undefined' && revision !== null) {
                headers['If-Match'] = revision;
            }
            logger_1.default.debug('PUT', uri, 'ID:', headers['Twilio-Request-Id']);
            return this.executeWithRetry(function () {
                return _this4.transport.put(uri, headers, body);
            }, false);
        }
    }, {
        key: "delete",
        value: function _delete(uri) {
            var _this5 = this;

            var headers = this.createHeaders();
            logger_1.default.debug('DELETE', uri, 'ID:', headers['Twilio-Request-Id']);
            return this.executeWithRetry(function () {
                return _this5.transport.delete(uri, headers);
            }, false);
        }
    }]);
    return Network;
}();

exports.Network = Network;
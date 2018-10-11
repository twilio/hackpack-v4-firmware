"use strict";
/* eslint-disable key-spacing */

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _getIterator2 = require("babel-runtime/core-js/get-iterator");

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _slicedToArray2 = require("babel-runtime/helpers/slicedToArray");

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

var _map = require("babel-runtime/core-js/map");

var _map2 = _interopRequireDefault(_map);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var Backoff = require("backoff");
var logger_1 = require("./logger");
var syncerror_1 = require("./syncerror");
var twilsock_1 = require("twilsock");
/**
 * A data container used by the Subscriptions class to track subscribed entities' local
 * representations and their state.
 */

var SubscribedEntity = function () {
    function SubscribedEntity(entity) {
        (0, _classCallCheck3.default)(this, SubscribedEntity);

        this.localObject = entity;
        this.pendingCorrelationId = null;
        this.pendingAction = null;
        this.established = false;
        this.retryCount = 0;
    }

    (0, _createClass3.default)(SubscribedEntity, [{
        key: "update",
        value: function update(event, isStrictlyOrderd) {
            this.localObject._update(event, isStrictlyOrderd);
        }
    }, {
        key: "updatePending",
        value: function updatePending(action, correlationId) {
            this.pendingAction = action;
            this.pendingCorrelationId = correlationId;
        }
    }, {
        key: "reset",
        value: function reset() {
            this.updatePending(null, null);
            this.retryCount = 0;
            this.established = false;
            this.localObject._setSubscriptionState('none');
        }
    }, {
        key: "markAsFailed",
        value: function markAsFailed(message) {
            this.rejectedWithError = message.error;
            this.updatePending(null, null);
            this.localObject.reportFailure(new syncerror_1.SyncError("Failed to subscribe on service events: " + message.error.message, message.error.status, message.error.code));
        }
    }, {
        key: "complete",
        value: function complete(eventId) {
            this.updatePending(null, null);
            this.established = true;
            this.localObject._advanceLastEventId(eventId);
        }
    }, {
        key: "sid",
        get: function get() {
            return this.localObject.sid;
        }
    }, {
        key: "type",
        get: function get() {
            return this.localObject.type;
        }
    }, {
        key: "lastEventId",
        get: function get() {
            return this.localObject.lastEventId;
        }
    }, {
        key: "isEstablished",
        get: function get() {
            return this.established;
        }
    }]);
    return SubscribedEntity;
}();
/**
 * @class Subscriptions
 * @classdesc A manager which, in batches of varying size, continuously persists the
 *      subscription intent of the caller to the Sync backend until it achieves a
 *      converged state.
 */


var Subscriptions = function () {
    /**
     * @constructor
     * Prepares a new Subscriptions manager object with zero subscribed or persisted subscriptions.
     *
     * @param {object} config may include a key 'backoffConfig', wherein any of the parameters
     *      of Backoff.exponential (from npm 'backoff') are valid and will override the defaults.
     *
     * @param {Network} must be a viable running Sync Network object, useful for routing requests.
     */
    function Subscriptions(services) {
        var _this = this;

        (0, _classCallCheck3.default)(this, Subscriptions);

        this.isConnected = false;
        this.maxBatchSize = 100;
        // If the server includes a `ttl_in_s` attribute in the poke response, subscriptionTtlTimer is started for that duration
        // such that when it fires, it repokes the entire sync set (i.e., emulates a reconnect). Every reconnect resets the timer.
        // After the timer has fired, the first poke request includes a `reason: ttl` attribute in the body.
        this.subscriptionTtlTimer = null;
        this.pendingPokeReason = null;
        this.services = services;
        this.subscriptions = new _map2.default();
        this.persisted = new _map2.default();
        this.latestPokeResponseArrivalTimestampByCorrelationId = new _map2.default();
        var defaultBackoffConfig = {
            randomisationFactor: 0.2,
            initialDelay: 100,
            maxDelay: 2 * 60 * 1000
        };
        this.backoff = Backoff.exponential((0, _assign2.default)(defaultBackoffConfig, this.services.config.backoffConfig));
        // This block is triggered by #_persist. Every request is executed in a series of (ideally 1)
        // backoff 'ready' event, at which point a new subscription set is calculated.
        this.backoff.on('ready', function () {
            var _getSubscriptionUpdat = _this.getSubscriptionUpdateBatch(),
                action = _getSubscriptionUpdat.action,
                subscriptionRequests = _getSubscriptionUpdat.subscriptions;

            if (action) {
                _this.applyNewSubscriptionUpdateBatch(action, subscriptionRequests);
            } else {
                _this.backoff.reset();
                logger_1.default.debug('All subscriptions resolved.');
            }
        });
    }

    (0, _createClass3.default)(Subscriptions, [{
        key: "getSubscriptionUpdateBatch",
        value: function getSubscriptionUpdateBatch() {
            function substract(these, those, action, limit) {
                var result = [];
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = (0, _getIterator3.default)(these), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var _ref = _step.value;

                        var _ref2 = (0, _slicedToArray3.default)(_ref, 2);

                        var thisKey = _ref2[0];
                        var thisValue = _ref2[1];

                        var otherValue = those.get(thisKey);
                        if (!otherValue && action !== thisValue.pendingAction && !thisValue.rejectedWithError) {
                            result.push(thisValue);
                            if (limit && result.length >= limit) {
                                break;
                            }
                        }
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }

                return result;
            }
            var listToAdd = substract(this.subscriptions, this.persisted, 'establish', this.maxBatchSize);
            if (listToAdd.length > 0) {
                return { action: 'establish', subscriptions: listToAdd };
            }
            var listToRemove = substract(this.persisted, this.subscriptions, 'cancel', this.maxBatchSize);
            if (listToRemove.length > 0) {
                return { action: 'cancel', subscriptions: listToRemove };
            }
            return { action: null, subscriptions: null };
        }
    }, {
        key: "persist",
        value: function persist() {
            try {
                this.backoff.backoff();
            } catch (e) {} // eslint-disable-line no-empty
        }
    }, {
        key: "applyNewSubscriptionUpdateBatch",
        value: function () {
            var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(action, requests) {
                var _this2 = this;

                var correlationId, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, subscribed, reason, response, newMaxBatchSize, subscriptionTtlInS, isNumeric, isValidTtl, estimatedDeliveryInMs, _isNumeric, isValidTimeout, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, attemptedSubscription;

                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                if (this.isConnected) {
                                    _context.next = 4;
                                    break;
                                }

                                logger_1.default.debug("Twilsock connection (required for subscription) not ready; waiting\u2026");
                                this.backoff.reset();
                                return _context.abrupt("return");

                            case 4:
                                // Keeping in mind that events may begin flowing _before_ we receive the response
                                requests = this.processLocalActions(action, requests);
                                correlationId = new Date().getTime();
                                _iteratorNormalCompletion2 = true;
                                _didIteratorError2 = false;
                                _iteratorError2 = undefined;
                                _context.prev = 9;

                                for (_iterator2 = (0, _getIterator3.default)(requests); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                    subscribed = _step2.value;

                                    this.recordActionAttemptOn(subscribed, action, correlationId);
                                }
                                _context.next = 17;
                                break;

                            case 13:
                                _context.prev = 13;
                                _context.t0 = _context["catch"](9);
                                _didIteratorError2 = true;
                                _iteratorError2 = _context.t0;

                            case 17:
                                _context.prev = 17;
                                _context.prev = 18;

                                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                    _iterator2.return();
                                }

                            case 20:
                                _context.prev = 20;

                                if (!_didIteratorError2) {
                                    _context.next = 23;
                                    break;
                                }

                                throw _iteratorError2;

                            case 23:
                                return _context.finish(20);

                            case 24:
                                return _context.finish(17);

                            case 25:
                                reason = this.pendingPokeReason;

                                this.pendingPokeReason = null;
                                // Send this batch to the service
                                _context.prev = 27;
                                _context.next = 30;
                                return this.request(action, correlationId, reason, requests);

                            case 30:
                                response = _context.sent;
                                newMaxBatchSize = response.body.max_batch_size;

                                if (!isNaN(parseInt(newMaxBatchSize)) && isFinite(newMaxBatchSize) && newMaxBatchSize > 0) {
                                    this.maxBatchSize = newMaxBatchSize;
                                }
                                if (!this.subscriptionTtlTimer) {
                                    subscriptionTtlInS = response.body.ttl_in_s;
                                    isNumeric = !isNaN(parseFloat(subscriptionTtlInS)) && isFinite(subscriptionTtlInS);
                                    isValidTtl = isNumeric && subscriptionTtlInS > 0;

                                    if (isValidTtl) {
                                        this.subscriptionTtlTimer = setTimeout(function () {
                                            return _this2.onSubscriptionTtlElapsed();
                                        }, subscriptionTtlInS * 1000);
                                    }
                                }
                                if (action === 'establish') {
                                    estimatedDeliveryInMs = response.body.estimated_delivery_in_ms;
                                    _isNumeric = !isNaN(parseFloat(estimatedDeliveryInMs)) && isFinite(estimatedDeliveryInMs);
                                    isValidTimeout = _isNumeric && estimatedDeliveryInMs > 0;

                                    if (isValidTimeout) {
                                        setTimeout(function () {
                                            return _this2.verifyPokeDelivery(correlationId, estimatedDeliveryInMs, requests);
                                        }, estimatedDeliveryInMs);
                                    } else {
                                        logger_1.default.error("Invalid timeout: " + estimatedDeliveryInMs);
                                    }
                                    requests.filter(function (r) {
                                        return r.pendingCorrelationId === correlationId;
                                    }).forEach(function (r) {
                                        return r.localObject._setSubscriptionState('response_in_flight');
                                    });
                                }
                                this.backoff.reset();
                                _context.next = 60;
                                break;

                            case 38:
                                _context.prev = 38;
                                _context.t1 = _context["catch"](27);
                                _iteratorNormalCompletion3 = true;
                                _didIteratorError3 = false;
                                _iteratorError3 = undefined;
                                _context.prev = 43;

                                for (_iterator3 = (0, _getIterator3.default)(requests); !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                                    attemptedSubscription = _step3.value;

                                    this.recordActionFailureOn(attemptedSubscription, action);
                                }
                                _context.next = 51;
                                break;

                            case 47:
                                _context.prev = 47;
                                _context.t2 = _context["catch"](43);
                                _didIteratorError3 = true;
                                _iteratorError3 = _context.t2;

                            case 51:
                                _context.prev = 51;
                                _context.prev = 52;

                                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                                    _iterator3.return();
                                }

                            case 54:
                                _context.prev = 54;

                                if (!_didIteratorError3) {
                                    _context.next = 57;
                                    break;
                                }

                                throw _iteratorError3;

                            case 57:
                                return _context.finish(54);

                            case 58:
                                return _context.finish(51);

                            case 59:
                                if (_context.t1 instanceof twilsock_1.TransportUnavailableError) {
                                    logger_1.default.debug("Twilsock connection (required for subscription) not ready (c:" + correlationId + "); waiting\u2026");
                                    this.backoff.reset();
                                } else {
                                    logger_1.default.debug("Failed an attempt to " + action + " subscriptions (c:" + correlationId + "); retrying", _context.t1);
                                    this.persist();
                                }

                            case 60:
                            case "end":
                                return _context.stop();
                        }
                    }
                }, _callee, this, [[9, 13, 17, 25], [18,, 20, 24], [27, 38], [43, 47, 51, 59], [52,, 54, 58]]);
            }));

            function applyNewSubscriptionUpdateBatch(_x, _x2) {
                return _ref3.apply(this, arguments);
            }

            return applyNewSubscriptionUpdateBatch;
        }()
    }, {
        key: "verifyPokeDelivery",
        value: function verifyPokeDelivery(correlationId, estimatedDeliveryInMs, requests) {
            var _this3 = this;

            var lastReceived = this.latestPokeResponseArrivalTimestampByCorrelationId.get(correlationId);
            var silencePeriod = lastReceived ? new Date().getTime() - lastReceived : estimatedDeliveryInMs;
            if (silencePeriod >= estimatedDeliveryInMs) {
                // If we haven't received _any_ responses from that poke request for the duration of estimated_delivery_in_ms, poke again
                requests.filter(function (r) {
                    return r.pendingCorrelationId === correlationId;
                }).forEach(function (r) {
                    r.updatePending(null, null);
                    r.retryCount++;
                    _this3.persisted.delete(r.sid);
                });
                this.persist();
                this.latestPokeResponseArrivalTimestampByCorrelationId.delete(correlationId);
            } else {
                // Otherwise, the poke responses are probably in transit and we should wait for them
                var timeoutExtension = estimatedDeliveryInMs - silencePeriod;
                setTimeout(function () {
                    return _this3.verifyPokeDelivery(correlationId, estimatedDeliveryInMs, requests);
                }, timeoutExtension);
            }
        }
    }, {
        key: "processLocalActions",
        value: function processLocalActions(action, requests) {
            if (action === 'cancel') {
                return requests.filter(function (request) {
                    return !request.rejectedWithError;
                });
            }
            return requests;
        }
    }, {
        key: "recordActionAttemptOn",
        value: function recordActionAttemptOn(attemptedSubscription, action, correlationId) {
            attemptedSubscription.localObject._setSubscriptionState('request_in_flight');
            if (action === 'establish') {
                this.persisted.set(attemptedSubscription.sid, attemptedSubscription);
                attemptedSubscription.updatePending(action, correlationId);
            } else {
                // cancel
                var persistedSubscription = this.persisted.get(attemptedSubscription.sid);
                if (persistedSubscription) {
                    persistedSubscription.updatePending(action, correlationId);
                }
            }
        }
    }, {
        key: "recordActionFailureOn",
        value: function recordActionFailureOn(attemptedSubscription, action) {
            attemptedSubscription.localObject._setSubscriptionState('none');
            attemptedSubscription.updatePending(null, null);
            if (action === 'establish') {
                this.persisted.delete(attemptedSubscription.sid);
            }
        }
    }, {
        key: "request",
        value: function request(action, correlationId, reason, objects) {
            var requests = objects.map(function (object) {
                return {
                    object_sid: object.sid,
                    object_type: object.type,
                    last_event_id: action === 'establish' ? object.lastEventId : undefined // eslint-disable-line no-undefined, camelcase
                };
            });
            var retriedRequests = objects.filter(function (a) {
                return a.retryCount > 0;
            }).length;
            logger_1.default.debug("Attempting '" + action + "' request (c:" + correlationId + "):", requests);
            /* eslint-disable camelcase */
            var requestBody = {
                event_protocol_version: 3,
                action: action,
                correlation_id: correlationId,
                retried_requests: retriedRequests,
                ttl_in_s: -1,
                requests: requests
            };
            if (reason === 'ttl') {
                requestBody.reason = reason;
            }
            /* eslint-enable camelcase */
            return this.services.network.post(this.services.config.subscriptionsUri, requestBody, null, true);
        }
        /**
         * Establishes intent to be subscribed to this entity. That subscription will be effected
         * asynchronously.
         * If subscription to the given sid already exists, it will be overwritten.
         *
         * @param {String} sid should be a well-formed SID, uniquely identifying a single instance of a Sync entity.
         * @param {Object} entity should represent the (singular) local representation of this entity.
         *      Incoming events and modifications to the entity will be directed at the _update() function
         *      of this provided reference.
         *
         * @return undefined
         */

    }, {
        key: "add",
        value: function add(sid, entity) {
            logger_1.default.debug("Establishing intent to subscribe to " + sid);
            var existingSubscription = this.subscriptions.get(sid);
            if (existingSubscription && existingSubscription.lastEventId === entity.lastEventId) {
                // If last event id is the same as before - we're fine
                return;
            }
            this.persisted.delete(sid);
            this.subscriptions.set(sid, new SubscribedEntity(entity));
            this.persist();
        }
        /**
         * Establishes the caller's intent to no longer be subscribed to this entity. Following this
         * call, no further events shall be routed to the local representation of the entity, even
         * though a server-side subscription may take more time to actually terminate.
         *
         * @param {string} sid should be any well-formed SID, uniquely identifying a Sync entity.
         *      This call only has meaningful effect if that entity is subscribed at the
         *      time of call. Otherwise does nothing.
         *
         * @return undefined
         */

    }, {
        key: "remove",
        value: function remove(sid) {
            logger_1.default.debug("Establishing intent to unsubscribe from " + sid);
            var removed = this.subscriptions.delete(sid);
            if (removed) {
                this.persist();
            }
        }
        /**
         * The point of ingestion for remote incoming messages (e.g. new data was written to a map
         * to which we are subscribed).
         *
         * @param {object} message is the full, unaltered body of the incoming notification.
         *
         * @return undefined
         */

    }, {
        key: "acceptMessage",
        value: function acceptMessage(message, isStrictlyOrdered) {
            logger_1.default.trace('Subscriptions received', message);
            if (message.correlation_id) {
                this.latestPokeResponseArrivalTimestampByCorrelationId.set(message.correlation_id, new Date().getTime());
            }
            switch (message.event_type) {
                case 'subscription_established':
                    this.applySubscriptionEstablishedMessage(message.event, message.correlation_id);
                    break;
                case 'subscription_canceled':
                    this.applySubscriptionCancelledMessage(message.event, message.correlation_id);
                    break;
                case 'subscription_failed':
                    this.applySubscriptionFailedMessage(message.event, message.correlation_id);
                    break;
                case (message.event_type.match(/^(?:map|list|document|stream)_/) || {}).input:
                    {
                        var typedSid = function typedSid() {
                            if (message.event_type.match(/^map_/)) {
                                return message.event.map_sid;
                            } else if (message.event_type.match(/^list_/)) {
                                return message.event.list_sid;
                            } else if (message.event_type.match(/^document_/)) {
                                return message.event.document_sid;
                            } else if (message.event_type.match(/^stream_/)) {
                                return message.event.stream_sid;
                            } else {
                                return undefined;
                            }
                        };
                        this.applyEventToSubscribedEntity(typedSid(), message, isStrictlyOrdered);
                    }
                    break;
                default:
                    logger_1.default.debug("Dropping unknown message type " + message.event_type);
                    break;
            }
        }
    }, {
        key: "applySubscriptionEstablishedMessage",
        value: function applySubscriptionEstablishedMessage(message, correlationId) {
            var sid = message.object_sid;
            var subscriptionIntent = this.persisted.get(message.object_sid);
            if (subscriptionIntent && subscriptionIntent.pendingCorrelationId === correlationId) {
                if (message.replay_status === 'interrupted') {
                    logger_1.default.debug("Event Replay for subscription to " + sid + " (c:" + correlationId + ") interrupted; continuing eagerly.");
                    subscriptionIntent.updatePending(null, null);
                    this.persisted.delete(subscriptionIntent.sid);
                    this.backoff.reset();
                } else if (message.replay_status === 'completed') {
                    logger_1.default.debug("Event Replay for subscription to " + sid + " (c:" + correlationId + ") completed. Subscription is ready.");
                    subscriptionIntent.complete(message.last_event_id);
                    this.persisted.set(message.object_sid, subscriptionIntent);
                    subscriptionIntent.localObject._setSubscriptionState('established');
                    this.backoff.reset();
                }
            } else {
                logger_1.default.debug("Late message for " + message.object_sid + " (c:" + correlationId + ") dropped.");
            }
            this.persist();
        }
    }, {
        key: "applySubscriptionCancelledMessage",
        value: function applySubscriptionCancelledMessage(message, correlationId) {
            var persistedSubscription = this.persisted.get(message.object_sid);
            if (persistedSubscription && persistedSubscription.pendingCorrelationId === correlationId) {
                persistedSubscription.updatePending(null, null);
                persistedSubscription.localObject._setSubscriptionState('none');
                this.persisted.delete(message.object_sid);
            } else {
                logger_1.default.debug("Late message for " + message.object_sid + " (c:" + correlationId + ") dropped.");
            }
            this.persist();
        }
    }, {
        key: "applySubscriptionFailedMessage",
        value: function applySubscriptionFailedMessage(message, correlationId) {
            var sid = message.object_sid;
            var subscriptionIntent = this.subscriptions.get(sid);
            var subscription = this.persisted.get(sid);
            if (subscriptionIntent && subscription) {
                if (subscription.pendingCorrelationId === correlationId) {
                    logger_1.default.error("Failed to subscribe on " + subscription.sid, message.error);
                    subscription.markAsFailed(message);
                    subscription.localObject._setSubscriptionState('none');
                }
            } else if (!subscriptionIntent && subscription) {
                this.persisted.delete(sid);
                subscription.localObject._setSubscriptionState('none');
            }
            this.persist();
        }
    }, {
        key: "applyEventToSubscribedEntity",
        value: function applyEventToSubscribedEntity(sid, message, isStrictlyOrdered) {
            var _this4 = this;

            if (!sid) {
                return;
            }
            // Looking for subscription descriptor to check if poke has been completed
            isStrictlyOrdered = isStrictlyOrdered || function () {
                var subscription = _this4.persisted.get(sid);
                return subscription && subscription.isEstablished;
            }();
            // Still searching for subscriptionIntents. User could remove subscription already
            var subscriptionIntent = this.subscriptions.get(sid);
            if (subscriptionIntent) {
                message.event.type = message.event_type;
                subscriptionIntent.update(message.event, isStrictlyOrdered);
            } else {
                logger_1.default.debug("Message dropped for SID '" + sid + "', for which there is no subscription.");
            }
        }
    }, {
        key: "onConnectionStateChanged",
        value: function onConnectionStateChanged(isConnected) {
            this.isConnected = isConnected;
            if (isConnected) {
                this.poke('reconnect');
            }
        }
    }, {
        key: "onSubscriptionTtlElapsed",
        value: function onSubscriptionTtlElapsed() {
            if (this.isConnected) {
                this.poke('ttl');
            }
        }
        /**
         * Prompts a playback of any missed changes made to any subscribed object. This method
         * should be invoked whenever the connectivity layer has experienced cross-cutting
         * delivery failures that would affect the entire local sync set. Any tangible result
         * of this operation will result in calls to the _update() function of subscribed
         * Sync entities.
         */

    }, {
        key: "poke",
        value: function poke(reason) {
            logger_1.default.debug("Triggering event replay for all subscriptions, reason=" + reason);
            this.pendingPokeReason = reason;
            if (this.subscriptionTtlTimer) {
                clearTimeout(this.subscriptionTtlTimer);
                this.subscriptionTtlTimer = null;
            }
            var failedSubscriptions = [];
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = (0, _getIterator3.default)(this.persisted.values()), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var it = _step4.value;
                    // eslint-disable-line no-unused-vars
                    it.reset();
                    if (it.rejectedWithError) {
                        failedSubscriptions.push(it);
                    }
                }
            } catch (err) {
                _didIteratorError4 = true;
                _iteratorError4 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion4 && _iterator4.return) {
                        _iterator4.return();
                    }
                } finally {
                    if (_didIteratorError4) {
                        throw _iteratorError4;
                    }
                }
            }

            this.persisted.clear();
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = (0, _getIterator3.default)(failedSubscriptions), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var _it = _step5.value;

                    this.persisted.set(_it.sid, _it);
                }
            } catch (err) {
                _didIteratorError5 = true;
                _iteratorError5 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion5 && _iterator5.return) {
                        _iterator5.return();
                    }
                } finally {
                    if (_didIteratorError5) {
                        throw _iteratorError5;
                    }
                }
            }

            this.persist();
        }
        /**
         * Stops all communication, clears any subscription intent, and returns.
         */

    }, {
        key: "shutdown",
        value: function shutdown() {
            this.backoff.reset();
            this.subscriptions.clear();
        }
    }]);
    return Subscriptions;
}();

exports.Subscriptions = Subscriptions;
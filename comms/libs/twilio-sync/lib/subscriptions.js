"use strict";
/* eslint-disable key-spacing */
Object.defineProperty(exports, "__esModule", { value: true });
const Backoff = require("backoff");
const logger_1 = require("./logger");
const syncerror_1 = require("./syncerror");
const twilsock_1 = require("twilsock");
/**
 * A data container used by the Subscriptions class to track subscribed entities' local
 * representations and their state.
 */
class SubscribedEntity {
    constructor(entity) {
        this.localObject = entity;
        this.pendingCorrelationId = null;
        this.pendingAction = null;
        this.established = false;
        this.retryCount = 0;
    }
    get sid() { return this.localObject.sid; }
    get type() { return this.localObject.type; }
    get lastEventId() { return this.localObject.lastEventId; }
    get isEstablished() { return this.established; }
    update(event, isStrictlyOrderd) {
        this.localObject._update(event, isStrictlyOrderd);
    }
    updatePending(action, correlationId) {
        this.pendingAction = action;
        this.pendingCorrelationId = correlationId;
    }
    reset() {
        this.updatePending(null, null);
        this.retryCount = 0;
        this.established = false;
        this.localObject._setSubscriptionState('none');
    }
    markAsFailed(message) {
        this.rejectedWithError = message.error;
        this.updatePending(null, null);
        this.localObject.reportFailure(new syncerror_1.SyncError(`Failed to subscribe on service events: ${message.error.message}`, message.error.status, message.error.code));
    }
    complete(eventId) {
        this.updatePending(null, null);
        this.established = true;
        this.localObject._advanceLastEventId(eventId);
    }
}
/**
 * @class Subscriptions
 * @classdesc A manager which, in batches of varying size, continuously persists the
 *      subscription intent of the caller to the Sync backend until it achieves a
 *      converged state.
 */
class Subscriptions {
    /**
     * @constructor
     * Prepares a new Subscriptions manager object with zero subscribed or persisted subscriptions.
     *
     * @param {object} config may include a key 'backoffConfig', wherein any of the parameters
     *      of Backoff.exponential (from npm 'backoff') are valid and will override the defaults.
     *
     * @param {Network} must be a viable running Sync Network object, useful for routing requests.
     */
    constructor(services) {
        this.isConnected = false;
        this.maxBatchSize = 100;
        // If the server includes a `ttl_in_s` attribute in the poke response, subscriptionTtlTimer is started for that duration
        // such that when it fires, it repokes the entire sync set (i.e., emulates a reconnect). Every reconnect resets the timer.
        // After the timer has fired, the first poke request includes a `reason: ttl` attribute in the body.
        this.subscriptionTtlTimer = null;
        this.pendingPokeReason = null;
        this.services = services;
        this.subscriptions = new Map();
        this.persisted = new Map();
        this.latestPokeResponseArrivalTimestampByCorrelationId = new Map();
        const defaultBackoffConfig = {
            randomisationFactor: 0.2,
            initialDelay: 100,
            maxDelay: 2 * 60 * 1000
        };
        this.backoff = Backoff.exponential(Object.assign(defaultBackoffConfig, this.services.config.backoffConfig));
        // This block is triggered by #_persist. Every request is executed in a series of (ideally 1)
        // backoff 'ready' event, at which point a new subscription set is calculated.
        this.backoff.on('ready', () => {
            let { action: action, subscriptions: subscriptionRequests } = this.getSubscriptionUpdateBatch();
            if (action) {
                this.applyNewSubscriptionUpdateBatch(action, subscriptionRequests);
            }
            else {
                this.backoff.reset();
                logger_1.default.debug('All subscriptions resolved.');
            }
        });
    }
    getSubscriptionUpdateBatch() {
        function substract(these, those, action, limit) {
            let result = [];
            for (let [thisKey, thisValue] of these) {
                const otherValue = those.get(thisKey);
                if (!otherValue && action !== thisValue.pendingAction && !thisValue.rejectedWithError) {
                    result.push(thisValue);
                    if (limit && result.length >= limit) {
                        break;
                    }
                }
            }
            return result;
        }
        let listToAdd = substract(this.subscriptions, this.persisted, 'establish', this.maxBatchSize);
        if (listToAdd.length > 0) {
            return { action: 'establish', subscriptions: listToAdd };
        }
        let listToRemove = substract(this.persisted, this.subscriptions, 'cancel', this.maxBatchSize);
        if (listToRemove.length > 0) {
            return { action: 'cancel', subscriptions: listToRemove };
        }
        return { action: null, subscriptions: null };
    }
    persist() {
        try {
            this.backoff.backoff();
        }
        catch (e) { } // eslint-disable-line no-empty
    }
    async applyNewSubscriptionUpdateBatch(action, requests) {
        if (!this.isConnected) {
            logger_1.default.debug(`Twilsock connection (required for subscription) not ready; waiting…`);
            this.backoff.reset();
            return;
        }
        // Keeping in mind that events may begin flowing _before_ we receive the response
        requests = this.processLocalActions(action, requests);
        const correlationId = new Date().getTime();
        for (const subscribed of requests) {
            this.recordActionAttemptOn(subscribed, action, correlationId);
        }
        let reason = this.pendingPokeReason;
        this.pendingPokeReason = null;
        // Send this batch to the service
        try {
            let response = await this.request(action, correlationId, reason, requests);
            let newMaxBatchSize = response.body.max_batch_size;
            if (!isNaN(parseInt(newMaxBatchSize)) && isFinite(newMaxBatchSize) && newMaxBatchSize > 0) {
                this.maxBatchSize = newMaxBatchSize;
            }
            if (!this.subscriptionTtlTimer) {
                let subscriptionTtlInS = response.body.ttl_in_s;
                let isNumeric = !isNaN(parseFloat(subscriptionTtlInS)) && isFinite(subscriptionTtlInS);
                let isValidTtl = isNumeric && subscriptionTtlInS > 0;
                if (isValidTtl) {
                    this.subscriptionTtlTimer = setTimeout(() => this.onSubscriptionTtlElapsed(), subscriptionTtlInS * 1000);
                }
            }
            if (action === 'establish') {
                const estimatedDeliveryInMs = response.body.estimated_delivery_in_ms;
                let isNumeric = !isNaN(parseFloat(estimatedDeliveryInMs)) && isFinite(estimatedDeliveryInMs);
                let isValidTimeout = isNumeric && estimatedDeliveryInMs > 0;
                if (isValidTimeout) {
                    setTimeout(() => this.verifyPokeDelivery(correlationId, estimatedDeliveryInMs, requests), estimatedDeliveryInMs);
                }
                else {
                    logger_1.default.error(`Invalid timeout: ${estimatedDeliveryInMs}`);
                }
                requests.filter(r => r.pendingCorrelationId === correlationId)
                    .forEach(r => r.localObject._setSubscriptionState('response_in_flight'));
            }
            this.backoff.reset();
        }
        catch (e) {
            for (const attemptedSubscription of requests) {
                this.recordActionFailureOn(attemptedSubscription, action);
            }
            if (e instanceof twilsock_1.TransportUnavailableError) {
                logger_1.default.debug(`Twilsock connection (required for subscription) not ready (c:${correlationId}); waiting…`);
                this.backoff.reset();
            }
            else {
                logger_1.default.debug(`Failed an attempt to ${action} subscriptions (c:${correlationId}); retrying`, e);
                this.persist();
            }
        }
    }
    verifyPokeDelivery(correlationId, estimatedDeliveryInMs, requests) {
        const lastReceived = this.latestPokeResponseArrivalTimestampByCorrelationId.get(correlationId);
        const silencePeriod = lastReceived ? (new Date().getTime() - lastReceived)
            : estimatedDeliveryInMs;
        if (silencePeriod >= estimatedDeliveryInMs) {
            // If we haven't received _any_ responses from that poke request for the duration of estimated_delivery_in_ms, poke again
            requests
                .filter(r => r.pendingCorrelationId === correlationId)
                .forEach(r => {
                r.updatePending(null, null);
                r.retryCount++;
                this.persisted.delete(r.sid);
            });
            this.persist();
            this.latestPokeResponseArrivalTimestampByCorrelationId.delete(correlationId);
        }
        else {
            // Otherwise, the poke responses are probably in transit and we should wait for them
            const timeoutExtension = estimatedDeliveryInMs - silencePeriod;
            setTimeout(() => this.verifyPokeDelivery(correlationId, estimatedDeliveryInMs, requests), timeoutExtension);
        }
    }
    processLocalActions(action, requests) {
        if (action === 'cancel') {
            return requests.filter(request => !request.rejectedWithError);
        }
        return requests;
    }
    recordActionAttemptOn(attemptedSubscription, action, correlationId) {
        attemptedSubscription.localObject._setSubscriptionState('request_in_flight');
        if (action === 'establish') {
            this.persisted.set(attemptedSubscription.sid, attemptedSubscription);
            attemptedSubscription.updatePending(action, correlationId);
        }
        else { // cancel
            let persistedSubscription = this.persisted.get(attemptedSubscription.sid);
            if (persistedSubscription) {
                persistedSubscription.updatePending(action, correlationId);
            }
        }
    }
    recordActionFailureOn(attemptedSubscription, action) {
        attemptedSubscription.localObject._setSubscriptionState('none');
        attemptedSubscription.updatePending(null, null);
        if (action === 'establish') {
            this.persisted.delete(attemptedSubscription.sid);
        }
    }
    request(action, correlationId, reason, objects) {
        let requests = objects.map(object => ({
            object_sid: object.sid,
            object_type: object.type,
            last_event_id: action === 'establish' ? object.lastEventId : undefined // eslint-disable-line no-undefined, camelcase
        }));
        let retriedRequests = objects.filter(a => a.retryCount > 0).length;
        logger_1.default.debug(`Attempting '${action}' request (c:${correlationId}):`, requests);
        /* eslint-disable camelcase */
        const requestBody = {
            event_protocol_version: 3,
            action,
            correlation_id: correlationId,
            retried_requests: retriedRequests,
            ttl_in_s: -1,
            requests
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
    add(sid, entity) {
        logger_1.default.debug(`Establishing intent to subscribe to ${sid}`);
        const existingSubscription = this.subscriptions.get(sid);
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
    remove(sid) {
        logger_1.default.debug(`Establishing intent to unsubscribe from ${sid}`);
        const removed = this.subscriptions.delete(sid);
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
    acceptMessage(message, isStrictlyOrdered) {
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
                    let typedSid = function () {
                        if (message.event_type.match(/^map_/)) {
                            return message.event.map_sid;
                        }
                        else if (message.event_type.match(/^list_/)) {
                            return message.event.list_sid;
                        }
                        else if (message.event_type.match(/^document_/)) {
                            return message.event.document_sid;
                        }
                        else if (message.event_type.match(/^stream_/)) {
                            return message.event.stream_sid;
                        }
                        else {
                            return undefined;
                        }
                    };
                    this.applyEventToSubscribedEntity(typedSid(), message, isStrictlyOrdered);
                }
                break;
            default:
                logger_1.default.debug(`Dropping unknown message type ${message.event_type}`);
                break;
        }
    }
    applySubscriptionEstablishedMessage(message, correlationId) {
        const sid = message.object_sid;
        let subscriptionIntent = this.persisted.get(message.object_sid);
        if (subscriptionIntent && subscriptionIntent.pendingCorrelationId === correlationId) {
            if (message.replay_status === 'interrupted') {
                logger_1.default.debug(`Event Replay for subscription to ${sid} (c:${correlationId}) interrupted; continuing eagerly.`);
                subscriptionIntent.updatePending(null, null);
                this.persisted.delete(subscriptionIntent.sid);
                this.backoff.reset();
            }
            else if (message.replay_status === 'completed') {
                logger_1.default.debug(`Event Replay for subscription to ${sid} (c:${correlationId}) completed. Subscription is ready.`);
                subscriptionIntent.complete(message.last_event_id);
                this.persisted.set(message.object_sid, subscriptionIntent);
                subscriptionIntent.localObject._setSubscriptionState('established');
                this.backoff.reset();
            }
        }
        else {
            logger_1.default.debug(`Late message for ${message.object_sid} (c:${correlationId}) dropped.`);
        }
        this.persist();
    }
    applySubscriptionCancelledMessage(message, correlationId) {
        let persistedSubscription = this.persisted.get(message.object_sid);
        if (persistedSubscription && persistedSubscription.pendingCorrelationId === correlationId) {
            persistedSubscription.updatePending(null, null);
            persistedSubscription.localObject._setSubscriptionState('none');
            this.persisted.delete(message.object_sid);
        }
        else {
            logger_1.default.debug(`Late message for ${message.object_sid} (c:${correlationId}) dropped.`);
        }
        this.persist();
    }
    applySubscriptionFailedMessage(message, correlationId) {
        const sid = message.object_sid;
        let subscriptionIntent = this.subscriptions.get(sid);
        let subscription = this.persisted.get(sid);
        if (subscriptionIntent && subscription) {
            if (subscription.pendingCorrelationId === correlationId) {
                logger_1.default.error(`Failed to subscribe on ${subscription.sid}`, message.error);
                subscription.markAsFailed(message);
                subscription.localObject._setSubscriptionState('none');
            }
        }
        else if (!subscriptionIntent && subscription) {
            this.persisted.delete(sid);
            subscription.localObject._setSubscriptionState('none');
        }
        this.persist();
    }
    applyEventToSubscribedEntity(sid, message, isStrictlyOrdered) {
        if (!sid) {
            return;
        }
        // Looking for subscription descriptor to check if poke has been completed
        isStrictlyOrdered = isStrictlyOrdered || (() => {
            let subscription = this.persisted.get(sid);
            return subscription && subscription.isEstablished;
        })();
        // Still searching for subscriptionIntents. User could remove subscription already
        let subscriptionIntent = this.subscriptions.get(sid);
        if (subscriptionIntent) {
            message.event.type = message.event_type;
            subscriptionIntent.update(message.event, isStrictlyOrdered);
        }
        else {
            logger_1.default.debug(`Message dropped for SID '${sid}', for which there is no subscription.`);
        }
    }
    onConnectionStateChanged(isConnected) {
        this.isConnected = isConnected;
        if (isConnected) {
            this.poke('reconnect');
        }
    }
    onSubscriptionTtlElapsed() {
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
    poke(reason) {
        logger_1.default.debug(`Triggering event replay for all subscriptions, reason=${reason}`);
        this.pendingPokeReason = reason;
        if (this.subscriptionTtlTimer) {
            clearTimeout(this.subscriptionTtlTimer);
            this.subscriptionTtlTimer = null;
        }
        let failedSubscriptions = [];
        for (let it of this.persisted.values()) { // eslint-disable-line no-unused-vars
            it.reset();
            if (it.rejectedWithError) {
                failedSubscriptions.push(it);
            }
        }
        this.persisted.clear();
        for (let it of failedSubscriptions) {
            this.persisted.set(it.sid, it);
        }
        this.persist();
    }
    /**
     * Stops all communication, clears any subscription intent, and returns.
     */
    shutdown() {
        this.backoff.reset();
        this.subscriptions.clear();
    }
}
exports.Subscriptions = Subscriptions;

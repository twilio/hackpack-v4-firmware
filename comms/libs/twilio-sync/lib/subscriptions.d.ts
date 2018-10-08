import { SyncEntity } from './entity';
import { Configuration, Network } from './interfaces/services';
interface SubscriptionsServices {
    config: Configuration;
    network: Network;
}
/**
 * @class Subscriptions
 * @classdesc A manager which, in batches of varying size, continuously persists the
 *      subscription intent of the caller to the Sync backend until it achieves a
 *      converged state.
 */
declare class Subscriptions {
    private services;
    private subscriptions;
    private persisted;
    private latestPokeResponseArrivalTimestampByCorrelationId;
    private backoff;
    private isConnected;
    private maxBatchSize;
    private subscriptionTtlTimer;
    private pendingPokeReason;
    /**
     * @constructor
     * Prepares a new Subscriptions manager object with zero subscribed or persisted subscriptions.
     *
     * @param {object} config may include a key 'backoffConfig', wherein any of the parameters
     *      of Backoff.exponential (from npm 'backoff') are valid and will override the defaults.
     *
     * @param {Network} must be a viable running Sync Network object, useful for routing requests.
     */
    constructor(services: SubscriptionsServices);
    private getSubscriptionUpdateBatch;
    private persist;
    private applyNewSubscriptionUpdateBatch;
    private verifyPokeDelivery;
    private processLocalActions;
    private recordActionAttemptOn;
    private recordActionFailureOn;
    private request;
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
    add(sid: string, entity: SyncEntity): void;
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
    remove(sid: string): void;
    /**
     * The point of ingestion for remote incoming messages (e.g. new data was written to a map
     * to which we are subscribed).
     *
     * @param {object} message is the full, unaltered body of the incoming notification.
     *
     * @return undefined
     */
    acceptMessage(message: any, isStrictlyOrdered: boolean): void;
    private applySubscriptionEstablishedMessage;
    private applySubscriptionCancelledMessage;
    private applySubscriptionFailedMessage;
    private applyEventToSubscribedEntity;
    onConnectionStateChanged(isConnected: boolean): void;
    private onSubscriptionTtlElapsed;
    /**
     * Prompts a playback of any missed changes made to any subscribed object. This method
     * should be invoked whenever the connectivity layer has experienced cross-cutting
     * delivery failures that would affect the entire local sync set. Any tangible result
     * of this operation will result in calls to the _update() function of subscribed
     * Sync entities.
     */
    private poke;
    /**
     * Stops all communication, clears any subscription intent, and returns.
     */
    shutdown(): void;
}
export { SubscriptionsServices, Subscriptions };

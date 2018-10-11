/**
 * @class Router
 * @classdesc Routes all incoming messages to the consumers
 */
declare class Router {
    private config;
    private notifications;
    private subscriptions;
    constructor(params: any);
    /**
     * Entry point for all incoming messages
     * @param {String} type - Type of incoming message
     * @param {Object} message - Message to route
     */
    onMessage(type: string, message: any): void;
    /**
     * Subscribe for events
     */
    subscribe(sid: string, entity: any): Promise<void>;
    /**
     * Unsubscribe from events
     */
    unsubscribe(sid: string, entity: any): Promise<void>;
    /**
     * Handle transport establishing event
     * If we have any subscriptions - we should check object for modifications
     */
    onConnectionStateChanged(isConnected: boolean): void;
}
export { Router };
export default Router;

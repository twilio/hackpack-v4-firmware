"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("./logger");
const SYNC_DOCUMENT_NOTIFICATION_TYPE = 'com.twilio.rtd.cds.document';
const SYNC_LIST_NOTIFICATION_TYPE = 'com.twilio.rtd.cds.list';
const SYNC_MAP_NOTIFICATION_TYPE = 'com.twilio.rtd.cds.map';
const SYNC_NOTIFICATION_TYPE = 'twilio.sync.event';
/**
 * @class Router
 * @classdesc Routes all incoming messages to the consumers
 */
class Router {
    constructor(params) {
        this.config = params.config;
        this.subscriptions = params.subscriptions;
        this.notifications = params.notifications;
        this.notifications.subscribe(SYNC_NOTIFICATION_TYPE);
        this.notifications.subscribe(SYNC_DOCUMENT_NOTIFICATION_TYPE);
        this.notifications.subscribe(SYNC_LIST_NOTIFICATION_TYPE);
        this.notifications.subscribe(SYNC_MAP_NOTIFICATION_TYPE);
        this.notifications.on('message', (messageType, payload) => this.onMessage(messageType, payload));
        this.notifications.on('transportReady', isConnected => this.onConnectionStateChanged(isConnected));
    }
    /**
     * Entry point for all incoming messages
     * @param {String} type - Type of incoming message
     * @param {Object} message - Message to route
     */
    onMessage(type, message) {
        logger_1.default.trace('Notification type:', type, 'content:', message);
        switch (type) {
            case SYNC_DOCUMENT_NOTIFICATION_TYPE:
            case SYNC_LIST_NOTIFICATION_TYPE:
            case SYNC_MAP_NOTIFICATION_TYPE:
                this.subscriptions.acceptMessage(message, false);
                break;
            case SYNC_NOTIFICATION_TYPE:
                this.subscriptions.acceptMessage(message, true);
                break;
        }
    }
    /**
     * Subscribe for events
     */
    async subscribe(sid, entity) {
        await this.subscriptions.add(sid, entity);
    }
    /**
     * Unsubscribe from events
     */
    async unsubscribe(sid, entity) {
        await this.subscriptions.remove(sid);
    }
    /**
     * Handle transport establishing event
     * If we have any subscriptions - we should check object for modifications
     */
    onConnectionStateChanged(isConnected) {
        this.subscriptions.onConnectionStateChanged(isConnected);
    }
}
exports.Router = Router;
exports.default = Router;

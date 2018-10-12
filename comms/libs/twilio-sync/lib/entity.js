"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
class SyncEntity extends events_1.EventEmitter {
    constructor(services, removalHandler) {
        super();
        this.services = services;
        this.removalHandler = removalHandler;
        this.subscriptionState = 'none';
    }
    _advanceLastEventId(eventId, revision) { }
    reportFailure(err) {
        if (err.status === 404) {
            // assume that 404 means that entity has been removed while we were away
            this.onRemoved(false);
        }
        else {
            this.emit('failure', err);
        }
    }
    /**
     * Subscribe to changes of data entity
     * @private
     */
    _subscribe() {
        this.services.router.subscribe(this.sid, this);
        return this;
    }
    /**
     * Unsubscribe from changes of current data entity
     * @private
     */
    _unsubscribe() {
        this.services.router.unsubscribe(this.sid, this);
        return this;
    }
    _setSubscriptionState(newState) {
        this.subscriptionState = newState;
        this.emit('_subscriptionStateChanged', newState);
    }
    /**
     * @public
     */
    close() {
        this._unsubscribe();
        this.removalHandler(this.type, this.sid, this.uniqueName);
    }
}
exports.SyncEntity = SyncEntity;
exports.default = SyncEntity;

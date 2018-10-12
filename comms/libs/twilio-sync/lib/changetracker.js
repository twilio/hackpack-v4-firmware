"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const rfc6902_1 = require("rfc6902");
/**
 * Tracks changes for JS objects and emits appropriate callbacks
 */
class ChangeTracker extends events_1.EventEmitter {
    constructor(data) {
        super();
        ['keyAdded', 'keyRemoved', 'keyUpdated'].forEach((eventName) => {
            this.pendingListeners[eventName] = {};
            this.on(eventName, (path, value) => {
                let handlers = this.pendingListeners[eventName][path] || [];
                handlers.forEach(handler => handler(value));
                this.pendingListeners[eventName][path] = [];
            });
        });
    }
    /**
     * Compare old and new data and fire events if difference found
     * @private
     */
    traverse(originalData, updatedData) {
        let diff = rfc6902_1.createPatch(originalData, updatedData);
        diff.forEach((row) => {
            if (row.op === 'add') {
                this.emit('keyAdded', row.path, row.value);
            }
            else if (row.op === 'replace') {
                this.emit('keyUpdated', row.path, row.value);
            }
            else if (row.op === 'remove') {
                this.emit('keyRemoved', row.path);
            }
        });
    }
    /**
     * Set new data to process
     * @param Object updatedData new data set
     * @public
     */
    update(updatedData) {
        const originalData = this.data;
        this.data = updatedData;
        this.traverse(originalData, updatedData);
    }
    addEventHandler(eventName, path, handler) {
        const handlers = this.pendingListeners[eventName][path] || [];
        handlers.push(handler);
        this.pendingListeners[eventName][path] = handlers;
    }
}
exports.ChangeTracker = ChangeTracker;
exports.default = ChangeTracker;

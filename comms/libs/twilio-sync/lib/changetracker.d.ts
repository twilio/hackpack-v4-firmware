/// <reference types="node" />
import { EventEmitter } from 'events';
/**
 * Tracks changes for JS objects and emits appropriate callbacks
 */
declare class ChangeTracker extends EventEmitter {
    private pendingListeners;
    private data;
    constructor(data: any);
    /**
     * Compare old and new data and fire events if difference found
     * @private
     */
    private traverse;
    /**
     * Set new data to process
     * @param Object updatedData new data set
     * @public
     */
    update(updatedData: Object): void;
    addEventHandler(eventName: string, path: string, handler: any): void;
}
export { ChangeTracker };
export default ChangeTracker;

/// <reference types="node" />
import { EventEmitter } from 'events';
import { Services, Network, Router, Storage } from './interfaces/services';
import { SyncError } from './syncerror';
interface EntityServices {
    network: Network;
    router: Router;
    storage: Storage;
}
declare type RemovalHandler = (type: string, sid: string, uniqueName: string) => void;
export declare type SubscriptionState = 'none' | 'request_in_flight' | 'response_in_flight' | 'established';
declare abstract class SyncEntity extends EventEmitter {
    protected readonly services: EntityServices;
    protected readonly removalHandler: RemovalHandler;
    private subscriptionState;
    constructor(services: EntityServices, removalHandler: RemovalHandler);
    abstract readonly sid: string;
    abstract readonly uniqueName: string;
    abstract readonly type: string;
    abstract readonly lastEventId: number;
    abstract _update(update: any, isStrictlyOrdered: boolean): void;
    _advanceLastEventId(eventId: number, revision?: string): void;
    protected abstract onRemoved(locally: boolean): void;
    reportFailure(err: SyncError): void;
    /**
     * Subscribe to changes of data entity
     * @private
     */
    _subscribe(): SyncEntity;
    /**
     * Unsubscribe from changes of current data entity
     * @private
     */
    _unsubscribe(): SyncEntity;
    _setSubscriptionState(newState: SubscriptionState): void;
    /**
     * @public
     */
    close(): void;
}
export { Services, EntityServices, RemovalHandler, SyncEntity };
export default SyncEntity;

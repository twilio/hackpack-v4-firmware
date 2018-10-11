import { SyncEntity } from './entity';
/**
 * Container for entities which are known by the client
 * It's needed for deduplication when client obtain the same object several times
 */
export declare class EntitiesCache {
    private readonly names;
    private readonly entities;
    constructor();
    store<T extends SyncEntity>(entity: T): T;
    protected getResolved(id: string, type: string): SyncEntity;
    get(id: string, type: string): SyncEntity;
    remove(sid: string): void;
}

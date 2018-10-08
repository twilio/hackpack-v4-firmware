import { Configuration, Storage } from '../interfaces/services';
interface StorageBackend {
    setItem(key: string, value: string): void;
    getItem(key: string): string;
    removeItem(key: string): void;
}
declare class SessionStorage implements Storage {
    private readonly config;
    private readonly storage;
    private storageId;
    constructor(config: Configuration, storage?: StorageBackend);
    private storageKey;
    private readonly isReady;
    updateStorageId(storageId: string): void;
    store(type: string, id: string, value: Object): void;
    read(type: string, id: string): Object;
    remove(type: string, sid: string, uniqueName: string): void;
    update(type: string, sid: string, uniqueName: string, patch: Object): void;
    private _store;
    private _read;
    private _apply;
}
export { StorageBackend, SessionStorage };

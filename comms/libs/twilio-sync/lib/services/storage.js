"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SessionStorage {
    constructor(config, storage) {
        this.config = config;
        this.storageId = null;
        try {
            this.storage = storage || sessionStorage;
        }
        catch (e) { }
    }
    storageKey(type, key) {
        return `${this.storageId}::${type}::${key}`;
    }
    get isReady() {
        return this.config.sessionStorageEnabled && !!this.storageId;
    }
    updateStorageId(storageId) {
        this.storageId = storageId;
    }
    store(type, id, value) {
        if (!this.isReady) {
            return null;
        }
        return this._store(this.storageKey(type, id), value);
    }
    read(type, id) {
        if (!this.isReady) {
            return null;
        }
        return this._read(this.storageKey(type, id));
    }
    remove(type, sid, uniqueName) {
        if (!this.isReady) {
            return null;
        }
        try {
            this.storage.removeItem(this.storageKey(type, sid));
            if (uniqueName) {
                this.storage.removeItem(this.storageKey(type, uniqueName));
            }
        }
        catch (e) { }
    }
    update(type, sid, uniqueName, patch) {
        if (!this.isReady) {
            return null;
        }
        // Currently cache may have root stored twice - by sid and by uniqueName
        // Maybe need to create some index if needed
        this._apply(this.storageKey(type, sid), patch);
        if (uniqueName) {
            this._apply(this.storageKey(type, uniqueName), patch);
        }
    }
    _store(key, value) {
        try {
            this.storage.setItem(key, JSON.stringify(value));
        }
        catch (e) { }
    }
    _read(key) {
        try {
            let storedData = this.storage.getItem(key);
            if (storedData) {
                return JSON.parse(storedData);
            }
        }
        catch (e) { }
        return null;
    }
    _apply(key, patch) {
        let value = this._read(key);
        if (!value) {
            return false;
        }
        this._store(key, Object.assign(value, patch));
    }
}
exports.SessionStorage = SessionStorage;

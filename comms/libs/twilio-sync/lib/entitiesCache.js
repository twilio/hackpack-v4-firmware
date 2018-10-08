"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Container for entities which are known by the client
 * It's needed for deduplication when client obtain the same object several times
 */
class EntitiesCache {
    constructor() {
        this.names = new Map();
        this.entities = new Map();
    }
    store(entity) {
        let stored = this.entities.get(entity.sid);
        if (stored) {
            return stored;
        }
        this.entities.set(entity.sid, entity);
        if (entity.uniqueName) {
            this.names.set(entity.type + '::' + entity.uniqueName, entity.sid);
        }
        return entity;
    }
    getResolved(id, type) {
        let resolvedSid = this.names.get(type + '::' + id);
        return resolvedSid ? this.entities.get(resolvedSid) : null;
    }
    get(id, type) {
        return this.entities.get(id) || this.getResolved(id, type) || null;
    }
    remove(sid) {
        let cached = this.entities.get(sid);
        if (cached) {
            this.entities.delete(sid);
            if (cached.uniqueName) {
                this.names.delete(cached.type + '::' + cached.uniqueName);
            }
        }
    }
}
exports.EntitiesCache = EntitiesCache;

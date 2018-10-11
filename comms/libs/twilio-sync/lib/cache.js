"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const karibu_1 = require("karibu");
class Entry {
    constructor(value, revision) {
        this.value = value;
        this.revision = (revision || 0);
    }
    get isValid() { return true; }
}
class Tombstone {
    constructor(revision) {
        this.revision = revision;
    }
    get isValid() { return false; }
}
class Cache {
    constructor() {
        this.items = new karibu_1.TreeMap();
    }
    store(key, value, revision) {
        let entry = this.items.get(key);
        if (entry && entry.revision > revision) {
            if (entry.isValid) {
                return entry.value;
            }
            return null;
        }
        this.items.set(key, new Entry(value, revision));
        return value;
    }
    delete(key, revision) {
        let curr = this.items.get(key);
        if (!curr || curr.revision < revision) {
            this.items.set(key, new Tombstone(revision));
        }
    }
    isKnown(key, revision) {
        let curr = this.items.get(key);
        return curr && curr.revision >= revision;
    }
    get(key) {
        let entry = this.items.get(key);
        if (entry && entry.isValid) {
            return entry.value;
        }
        return null;
    }
    has(key) {
        let entry = this.items.get(key);
        return entry && entry.isValid;
    }
}
exports.Cache = Cache;
exports.default = Cache;

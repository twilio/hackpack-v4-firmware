"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @class
 * @classdesc Represents an individual element in a Sync Map.
 * @alias MapItem
 * @property {String} key The identifier that maps to this item within the containing Map.
 * @property {Object} value The contents of the item.
 * @property {Date} dateUpdated Date when the Map Item was last updated, given in UTC ISO 8601 format (e.g., '2018-04-26T15:23:19.732Z')
 */
class MapItem {
    /**
     * @private
     * @constructor
     */
    constructor(descriptor) {
        this.descriptor = descriptor;
    }
    get uri() { return this.descriptor.url; }
    get revision() { return this.descriptor.revision; }
    get lastEventId() { return this.descriptor.last_event_id; }
    get dateExpires() { return this.descriptor.date_expires; }
    get key() { return this.descriptor.key; }
    get value() { return this.descriptor.data; }
    get dateUpdated() { return this.descriptor.date_updated; }
    /**
     * @private
     */
    update(eventId, revision, value, dateUpdated) {
        this.descriptor.last_event_id = eventId;
        this.descriptor.revision = revision;
        this.descriptor.data = value;
        this.descriptor.date_updated = dateUpdated;
        return this;
    }
    /**
     * @private
     */
    updateDateExpires(dateExpires) {
        this.descriptor.date_expires = dateExpires;
    }
}
exports.MapItem = MapItem;

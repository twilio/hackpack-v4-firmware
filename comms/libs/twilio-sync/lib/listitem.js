"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @class
 * @classdesc Represents an individual element in a Sync List.
 * @alias ListItem
 * @property {Number} index The index, within the containing List, of this item. This index is stable;
 * even if lower-indexed Items are removed, this index will remain as is.
 * @property {Object} value The contents of the item.
 * @property {Date} dateUpdated Date when the List Item was last updated.
 */
class ListItem {
    /**
     * @private
     * @constructor
     * @param {Object} data Item descriptor
     * @param {Number} data.index Item identifier
     * @param {String} data.uri Item URI
     * @param {Object} data.value Item data
     */
    constructor(data) {
        this.data = data;
    }
    get uri() { return this.data.uri; }
    get revision() { return this.data.revision; }
    get lastEventId() { return this.data.lastEventId; }
    get dateUpdated() { return this.data.dateUpdated; }
    get dateExpires() { return this.data.dateExpires; }
    get index() { return this.data.index; }
    get value() { return this.data.value; }
    /**
     * @private
     */
    update(eventId, revision, value, dateUpdated) {
        this.data.lastEventId = eventId;
        this.data.revision = revision;
        this.data.value = value;
        this.data.dateUpdated = dateUpdated;
        return this;
    }
    /**
     * @private
     */
    updateDateExpires(dateExpires) {
        this.data.dateExpires = dateExpires;
    }
}
exports.ListItem = ListItem;
exports.default = ListItem;

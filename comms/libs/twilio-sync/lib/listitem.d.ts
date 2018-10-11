export interface ListItemDescriptor {
    index: number;
    uri: string;
    value: Object;
    revision: string;
    lastEventId: number;
    dateUpdated: Date;
    dateExpires: string;
}
/**
 * @class
 * @classdesc Represents an individual element in a Sync List.
 * @alias ListItem
 * @property {Number} index The index, within the containing List, of this item. This index is stable;
 * even if lower-indexed Items are removed, this index will remain as is.
 * @property {Object} value The contents of the item.
 * @property {Date} dateUpdated Date when the List Item was last updated.
 */
declare class ListItem {
    private readonly data;
    /**
     * @private
     * @constructor
     * @param {Object} data Item descriptor
     * @param {Number} data.index Item identifier
     * @param {String} data.uri Item URI
     * @param {Object} data.value Item data
     */
    constructor(data: ListItemDescriptor);
    readonly uri: string;
    readonly revision: string;
    readonly lastEventId: number;
    readonly dateUpdated: Date;
    readonly dateExpires: string;
    readonly index: number;
    readonly value: Object;
    /**
     * @private
     */
    update(eventId: number, revision: string, value: Object, dateUpdated: Date): ListItem;
    /**
     * @private
     */
    updateDateExpires(dateExpires: string): void;
}
export { ListItem };
export default ListItem;

export interface MapItemDescriptor {
    key: string;
    url: string;
    revision: string;
    last_event_id: number;
    date_updated: Date;
    date_expires: string;
    data: Object;
}
/**
 * @class
 * @classdesc Represents an individual element in a Sync Map.
 * @alias MapItem
 * @property {String} key The identifier that maps to this item within the containing Map.
 * @property {Object} value The contents of the item.
 * @property {Date} dateUpdated Date when the Map Item was last updated, given in UTC ISO 8601 format (e.g., '2018-04-26T15:23:19.732Z')
 */
declare class MapItem {
    private readonly descriptor;
    /**
     * @private
     * @constructor
     */
    constructor(descriptor: MapItemDescriptor);
    readonly uri: string;
    readonly revision: string;
    readonly lastEventId: number;
    readonly dateExpires: string;
    readonly key: string;
    readonly value: Object;
    readonly dateUpdated: Date;
    /**
     * @private
     */
    update(eventId: number, revision: string, value: Object, dateUpdated: Date): MapItem;
    /**
     * @private
     */
    updateDateExpires(dateExpires: string): void;
}
export { MapItem };

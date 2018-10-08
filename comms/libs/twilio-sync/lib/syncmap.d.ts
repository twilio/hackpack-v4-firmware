import { SyncEntity, EntityServices, RemovalHandler } from './entity';
import { MapItemDescriptor, MapItem as Item } from './mapitem';
import { Paginator } from './paginator';
import { Mutator } from './interfaces/mutator';
export interface MapServices extends EntityServices {
}
export interface MapDescriptor {
    sid: string;
    url: string;
    revision: string;
    last_event_id: number;
    links: any;
    unique_name: string;
    date_updated: Date;
    date_expires: string;
    items?: MapItemDescriptor[];
}
export interface ItemMetadata {
    ttl?: number;
}
/**
 * @class
 * @alias Map
 * @classdesc Represents a Sync Map, which stores an unordered set of key:value pairs.
 * Use the {@link Client#map} method to obtain a reference to a Sync Map.
 * @property {String} sid An immutable identifier (a SID) assigned by the system on creation.
 * @property {String} [uniqueName=null] - An optional immutable identifier that may be assigned by the
 * programmer to this map on creation. Unique among other Maps.
 * @property {Date} dateUpdated Date when the Map was last updated.
 *
 * @fires Map#removed
 * @fires Map#itemAdded
 * @fires Map#itemRemoved
 * @fires Map#itemUpdated
 */
export declare class SyncMap extends SyncEntity {
    private readonly descriptor;
    private readonly updateMergingQueue;
    private readonly cache;
    /**
     * @private
     */
    constructor(services: MapServices, descriptor: MapDescriptor, removalHandler: RemovalHandler);
    readonly uri: string;
    readonly links: any;
    readonly revision: string;
    readonly lastEventId: number;
    readonly dateExpires: string;
    static readonly type: string;
    readonly type: string;
    readonly sid: string;
    readonly uniqueName: string;
    readonly dateUpdated: Date;
    /**
     * Add a new item to the map with the given key:value pair. Overwrites any value that might already exist at that key.
     * @param {String} key Unique item identifier.
     * @param {Object} value Value to be set.
     * @param {Map#ItemMetadata} [itemMetadataUpdates] New item metadata.
     * @returns {Promise<MapItem>} Newly added item, or modified one if already exists, with the latest known value.
     * @public
     * @example
     * map.set('myKey', { name: 'John Smith' }, { ttl: 86400 })
     *   .then(function(item) {
     *     console.log('Map Item set() successful, item value:', item.value);
     *   })
     *   .catch(function(error) {
     *     console.error('Map Item set() failed', error);
     *   });
     */
    set(key: string, value: Object, itemMetadataUpdates?: ItemMetadata): Promise<Item>;
    /**
     * Retrieve an item by key.
     * @param {String} key Identifies the desired item.
     * @returns {Promise<MapItem>} A promise that resolves when the item has been fetched.
     * This promise will be rejected if item was not found.
     * @public
     * @example
     * map.get('myKey')
     *   .then(function(item) {
     *     console.log('Map Item get() successful, item value:', item.value)
     *   })
     *   .catch(function(error) {
     *     console.error('Map Item get() failed', error);
     *   });
     */
    get(key: string): Promise<Item>;
    private _getItemFromServer;
    /**
     * Schedules a modification to this Map Item that will apply a mutation function.
     * If no Item with the given key exists, it will first be created, having the default value (<code>{}</code>).
     * @param {String} key Selects the map item to be mutated.
     * @param {Map~Mutator} mutator A function that outputs a new value based on the existing value.
     * May be called multiple times, particularly if this Map Item is modified concurrently by remote code.
     * If the mutation ultimately succeeds, the Map Item will have made the particular transition described
     * by this function.
     * @param {Map#ItemMetadata} [itemMetadataUpdates] New item metadata.
     * @returns {Promise<MapItem>} Resolves with the most recent item state, the output of a successful
     * mutation or a state that prompted graceful cancellation (mutator returned <code>null</code>).
     * @public
     * @example
     * var mutatorFunction = function(currentValue) {
     *     currentValue.viewCount = (currentValue.viewCount || 0) + 1;
     *     return currentValue;
     * };
     * map.mutate('myKey', mutatorFunction, { ttl: 86400 })
     *   .then(function(item) {
     *     console.log('Map Item mutate() successful, new value:', item.value)
     *   })
     *   .catch(function(error) {
     *     console.error('Map Item mutate() failed', error);
     *   });
     */
    mutate(key: string, mutator: Mutator, itemMetadataUpdates?: ItemMetadata): Promise<Item>;
    /**
     * Modify a map item by appending new fields (or by overwriting existing ones) with the values from
     * the provided Object. Creates a new item if no item by this key exists, copying all given fields and values
     * into it.
     * This is equivalent to
     * <pre>
     * map.mutate('myKey', function(currentValue) {
     *   return Object.assign(currentValue, obj));
     * });
     * </pre>
     * @param {String} key Selects the map item to update.
     * @param {Object} obj Specifies the particular (top-level) attributes that will receive new values.
     * @param {Map#ItemMetadata} [itemMetadataUpdates] New item metadata.
     * @returns {Promise<MapItem>} A promise resolving to the modified item in its new state.
     * @public
     * @example
     * // Say, the Map Item (key: 'myKey') value is { name: 'John Smith' }
     * map.update('myKey', { age: 34 }, { ttl: 86400 })
     *   .then(function(item) {
     *     // Now the Map Item value is { name: 'John Smith', age: 34 }
     *     console.log('Map Item update() successful, new value:', item.value);
     *   })
     *   .catch(function(error) {
     *     console.error('Map Item update() failed', error);
     *   });
     */
    update(key: string, obj: Object, itemMetadataUpdates?: ItemMetadata): Promise<Item>;
    private _putItemUnconditionally;
    private _putItemWithIfMatch;
    private _putItemToServer;
    /**
     * Delete an item, given its key.
     * @param {String} key Selects the item to delete.
     * @returns {Promise<void>} A promise to remove an item.
     * The promise will be rejected if 'key' is undefined or an item was not found.
     * @public
     * @example
     * map.remove('myKey')
     *   .then(function() {
     *     console.log('Map Item remove() successful');
     *   })
     *   .catch(function(error) {
     *     console.error('Map Item remove() failed', error);
     *   });
     */
    remove(key: string): Promise<void>;
    /**
     * @private
     */
    protected queryItems(args?: any): Promise<Paginator<Item>>;
    /**
     * Get a complete list of items from the map.
     * @param {Object} [args] Arguments for query.
     * @param {String} [args.from] Item key, which should be used as the offset. If undefined, starts from the beginning or end depending on args.order.
     * @param {Number} [args.pageSize=50] Result page size.
     * @param {'asc'|'desc'} [args.order='asc'] Lexicographical order of results.
     * @return {Promise<Paginator<MapItem>>}
     * @public
     * @example
     * var pageHandler = function(paginator) {
     *   paginator.items.forEach(function(item) {
     *     console.log('Item ' + item.key + ': ', item.value);
     *   });
     *   return paginator.hasNextPage ? paginator.nextPage().then(pageHandler)
     *                                : null;
     * };
     * map.getItems({ from: 'myKey', order: 'asc' })
     *   .then(pageHandler)
     *   .catch(function(error) {
     *     console.error('Map getItems() failed', error);
     *   });
     */
    getItems(args?: any): Promise<Paginator<Item>>;
    /**
     * Enumerate all items in this Map.
     * This always triggers server interaction when being called for the first time on a Map; this may be latent.
     * This method not supported now and not meant to be used externally.
     * @param {Function} handler Function to handle each argument.
     * @private
     */
    forEach(handler: any): Promise<{}>;
    private shouldIgnoreEvent;
    /**
     * Handle update from the server
     * @private
     */
    _update(update: any, isStrictlyOrdered: boolean): void;
    _advanceLastEventId(eventId: number, revision?: string): void;
    private _updateRootDateUpdated;
    private _handleItemMutated;
    private emitItemMutationEvent;
    /**
     * @private
     */
    protected _handleItemRemoved(key: any, eventId: any, oldData: any, dateUpdated: Date, remote: boolean): void;
    protected onRemoved(locally: boolean): void;
    /**
     * Update the time-to-live of the map.
     * @param {Number} ttl Specifies the TTL in seconds after which the map is subject to automatic deletion. The value 0 means infinity.
     * @return {Promise<void>} A promise that resolves after the TTL update was successful.
     * @public
     * @example
     * map.setTtl(3600)
     *   .then(function() {
     *     console.log('Map setTtl() successful');
     *   })
     *   .catch(function(error) {
     *     console.error('Map setTtl() failed', error);
     *   });
     */
    setTtl(ttl: number): Promise<void>;
    /**
     * Update the time-to-live of a map item.
     * @param {Number} key Item key.
     * @param {Number} ttl Specifies the TTL in seconds after which the map item is subject to automatic deletion. The value 0 means infinity.
     * @return {Promise<void>} A promise that resolves after the TTL update was successful.
     * @public
     * @example
     * map.setItemTtl('myKey', 86400)
     *   .then(function() {
     *     console.log('Map setItemTtl() successful');
     *   })
     *   .catch(function(error) {
     *     console.error('Map setItemTtl() failed', error);
     *   });
     */
    setItemTtl(key: string, ttl: number): Promise<void>;
    /**
     * Delete this map. It will be impossible to restore it.
     * @return {Promise<void>} A promise that resolves when the map has been deleted.
     * @public
     * @example
     * map.removeMap()
     *   .then(function() {
     *     console.log('Map removeMap() successful');
     *   })
     *   .catch(function(error) {
     *     console.error('Map removeMap() failed', error);
     *   });
     */
    removeMap(): Promise<void>;
}
export default SyncMap;
/**
 * Contains Map Item metadata.
 * @typedef {Object} Map#ItemMetadata
 * @property {String} [ttl] Specifies the time-to-live in seconds after which the map item is subject to automatic deletion.
 * The value 0 means infinity.
 */
/**
 * Applies a transformation to the item value. May be called multiple times on the
 * same datum in case of collisions with remote code.
 * @callback Map~Mutator
 * @param {Object} currentValue The current value of the item in the cloud.
 * @return {Object} The desired new value for the item or <code>null</code> to gracefully cancel the mutation.
 */
/**
 * Fired when a new item appears in the map, whether its creator was local or remote.
 * @event Map#itemAdded
 * @param {Object} args Arguments provided with the event.
 * @param {MapItem} args.item Added item.
 * @param {Boolean} args.isLocal Equals 'true' if item was added by local actor, 'false' otherwise.
 * @example
 * map.on('itemAdded', function(args) {
 *   console.log('Map item ' + args.item.key + ' was added');
 *   console.log('args.item.value:', args.item.value);
 *   console.log('args.isLocal:', args.isLocal);
 * });
 */
/**
 * Fired when a map item is updated (not added or removed, but changed), whether the updater was local or remote.
 * @event Map#itemUpdated
 * @param {Object} args Arguments provided with the event.
 * @param {MapItem} args.item Updated item.
 * @param {Boolean} args.isLocal Equals 'true' if item was updated by local actor, 'false' otherwise.
 * @example
 * map.on('itemUpdated', function(args) {
 *   console.log('Map item ' + args.item.key + ' was updated');
 *   console.log('args.item.value:', args.item.value);
 *   console.log('args.isLocal:', args.isLocal);
 * });
 */
/**
 * Fired when a map item is removed, whether the remover was local or remote.
 * @event Map#itemRemoved
 * @param {Object} args Arguments provided with the event.
 * @param {String} args.key The key of the removed item.
 * @param {Boolean} args.isLocal Equals 'true' if item was removed by local actor, 'false' otherwise.
 * @param {Object} args.value In case item was removed by a remote actor, contains a snapshot of item data before removal.
 * @example
 * map.on('itemRemoved', function(args) {
 *   console.log('Map item ' + args.key + ' was removed');
 *   console.log('args.value:', args.value);
 *   console.log('args.isLocal:', args.isLocal);
 * });
 */
/**
 * Fired when a map is deleted entirely, by any actor local or remote.
 * @event Map#removed
 * @param {Object} args Arguments provided with the event.
 * @param {Boolean} args.isLocal Equals 'true' if map was removed by local actor, 'false' otherwise.
 * @example
 * map.on('removed', function(args) {
 *   console.log('Map ' + map.sid + ' was removed');
 *   console.log('args.isLocal:', args.isLocal);
 * });
 */

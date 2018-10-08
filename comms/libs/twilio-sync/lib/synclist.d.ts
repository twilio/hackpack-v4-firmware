import { SyncEntity, EntityServices, RemovalHandler } from './entity';
import { ListItem as Item } from './listitem';
import { Paginator } from './paginator';
import { Mutator } from './interfaces/mutator';
interface ListServices extends EntityServices {
}
interface ListDescriptor {
    sid: string;
    url: string;
    revision: string;
    last_event_id: number;
    links: any;
    unique_name: string;
    date_updated: Date;
    date_expires: string;
}
export interface ItemMetadata {
    ttl?: number;
}
/**
 * @class
 * @alias List
 * @classdesc Represents a Sync List, which stores an ordered list of values.
 * Use the {@link Client#list} method to obtain a reference to a Sync List.
 * @property {String} sid - List unique id, immutable identifier assigned by the system.
 * @property {String} [uniqueName=null] - List unique name, immutable identifier that can be assigned to list during creation.
 * @property {Date} dateUpdated Date when the List was last updated.
 *
 * @fires List#removed
 * @fires List#itemAdded
 * @fires List#itemRemoved
 * @fires List#itemUpdated
 */
declare class SyncList extends SyncEntity {
    private descriptor;
    private updateMergingQueue;
    private cache;
    private context;
    private contextEventId;
    /**
     * @private
     */
    constructor(services: ListServices, descriptor: ListDescriptor, removalHandler: RemovalHandler);
    readonly uri: string;
    readonly revision: string;
    readonly lastEventId: number;
    readonly links: any;
    readonly dateExpires: string;
    static readonly type: string;
    readonly type: string;
    readonly sid: string;
    readonly uniqueName: string;
    readonly dateUpdated: Date;
    private _addOrUpdateItemOnServer;
    /**
     * Add a new item to the list.
     * @param {Object} value Value to be added.
     * @param {List#ItemMetadata} [itemMetadata] Item metadata.
     * @returns {Promise<ListItem>} A newly added item.
     * @public
     * @example
     * list.push({ name: 'John Smith' }, { ttl: 86400 })
     *   .then(function(item) {
     *     console.log('List Item push() successful, item index:' + item.index + ', value: ', item.value)
     *   })
     *   .catch(function(error) {
     *     console.error('List Item push() failed', error);
     *   });
     */
    push(value: any, itemMetadata?: ItemMetadata): Promise<Item>;
    /**
     * Assign new value to an existing item, given its index.
     * @param {Number} index Index of the item to be updated.
     * @param {Object} value New value to be assigned to an item.
     * @param {List#ItemMetadata} [itemMetadataUpdates] New item metadata.
     * @returns {Promise<ListItem>} A promise with updated item containing latest known value.
     * The promise will be rejected if the item does not exist.
     * @public
     * @example
     * list.set(42, { name: 'John Smith' }, { ttl: 86400 })
     *   .then(function(item) {
     *     console.log('List Item set() successful, item value:', item.value)
     *   })
     *   .catch(function(error) {
     *     console.error('List Item set() failed', error);
     *   });
     */
    set(index: number, value: Object, itemMetadataUpdates?: ItemMetadata): Promise<Item>;
    private _updateItemUnconditionally;
    private _updateItemWithIfMatch;
    /**
     * Modify an existing item by applying a mutation function to it.
     * @param {Number} index Index of an item to be changed.
     * @param {List~Mutator} mutator A function that outputs a new value based on the existing value.
     * @param {List#ItemMetadata} [itemMetadataUpdates] New item metadata.
     * @returns {Promise<ListItem>} Resolves with the most recent item state, the output of a successful
     *    mutation or a state that prompted graceful cancellation (mutator returned <code>null</code>). This promise
     *    will be rejected if the indicated item does not already exist.
     * @public
     * @example
     * var mutatorFunction = function(currentValue) {
     *     currentValue.viewCount = (currentValue.viewCount || 0) + 1;
     *     return currentValue;
     * };
     * list.mutate(42, mutatorFunction, { ttl: 86400 })
     *   .then(function(item) {
     *     console.log('List Item mutate() successful, new value:', item.value)
     *   })
     *   .catch(function(error) {
     *     console.error('List Item mutate() failed', error);
     *   });
     */
    mutate(index: number, mutator: Mutator, itemMetadataUpdates?: ItemMetadata): Promise<Item>;
    /**
     * Modify an existing item by appending new fields (or overwriting existing ones) with the values from Object.
     * This is equivalent to
     * <pre>
     * list.mutate(42, function(currentValue) {
     *   return Object.assign(currentValue, obj));
     * });
     * </pre>
     * @param {Number} index Index of an item to be changed.
     * @param {Object} obj Set of fields to update.
     * @param {List#ItemMetadata} [itemMetadataUpdates] New item metadata.
     * @returns {Promise<ListItem>} A promise with a modified item containing latest known value.
     * The promise will be rejected if an item was not found.
     * @public
     * @example
     * // Say, the List Item (index: 42) value is { name: 'John Smith' }
     * list.update(42, { age: 34 }, { ttl: 86400 })
     *   .then(function(item) {
     *     // Now the List Item value is { name: 'John Smith', age: 34 }
     *     console.log('List Item update() successful, new value:', item.value);
     *   })
     *   .catch(function(error) {
     *     console.error('List Item update() failed', error);
     *   });
     */
    update(index: number, obj: Object, itemMetadataUpdates?: ItemMetadata): Promise<Item>;
    /**
     * Delete an item, given its index.
     * @param {Number} index Index of an item to be removed.
     * @returns {Promise<void>} A promise to remove an item.
     * A promise will be rejected if an item was not found.
     * @public
     * @example
     * list.remove(42)
     *   .then(function() {
     *     console.log('List Item remove() successful');
     *   })
     *   .catch(function(error) {
     *     console.error('List Item remove() failed', error);
     *   });
     */
    remove(index: number): Promise<void>;
    /**
     * Retrieve an item by List index.
     * @param {Number} index Item index in a List.
     * @returns {Promise<ListItem>} A promise with an item containing latest known value.
     * A promise will be rejected if an item was not found.
     * @public
     * @example
     * list.get(42)
     *   .then(function(item) {
     *     console.log('List Item get() successful, item value:', item.value)
     *   })
     *   .catch(function(error) {
     *     console.error('List Item get() failed', error);
     *   });
     */
    get(index: number): Promise<Item>;
    private _getItemFromServer;
    /**
     * Query items from the List
     * @private
     */
    protected queryItems(arg: any): Promise<Paginator<Item>>;
    /**
     * Query a list of items from collection.
     * @param {Object} [args] Arguments for query
     * @param {Number} [args.from] Item index, which should be used as the offset.
     * If undefined, starts from the beginning or end depending on args.order.
     * @param {Number} [args.pageSize=50] Results page size.
     * @param {'asc'|'desc'} [args.order='asc'] Numeric order of results.
     * @returns {Promise<Paginator<ListItem>>}
     * @public
     * @example
     * var pageHandler = function(paginator) {
     *   paginator.items.forEach(function(item) {
     *     console.log('Item ' + item.index + ': ', item.value);
     *   });
     *   return paginator.hasNextPage ? paginator.nextPage().then(pageHandler)
     *                                : null;
     * };
     * list.getItems({ from: 0, order: 'asc' })
     *   .then(pageHandler)
     *   .catch(function(error) {
     *     console.error('List getItems() failed', error);
     *   });
     */
    getItems(args: any): Promise<Paginator<Item>>;
    /**
     * @return {Promise<Object>} Context of List
     * @private
     */
    getContext(): Promise<Object>;
    /**
     * Update the time-to-live of the list.
     * @param {Number} ttl Specifies the TTL in seconds after which the list is subject to automatic deletion. The value 0 means infinity.
     * @return {Promise<void>} A promise that resolves after the TTL update was successful.
     * @public
     * @example
     * list.setTtl(3600)
     *   .then(function() {
     *     console.log('List setTtl() successful');
     *   })
     *   .catch(function(error) {
     *     console.error('List setTtl() failed', error);
     *   });
     */
    setTtl(ttl: number): Promise<void>;
    /**
     * Update the time-to-live of a list item.
     * @param {Number} index Item index.
     * @param {Number} ttl Specifies the TTL in seconds after which the list item is subject to automatic deletion. The value 0 means infinity.
     * @return {Promise<void>} A promise that resolves after the TTL update was successful.
     * @public
     * @example
     * list.setItemTtl(42, 86400)
     *   .then(function() {
     *     console.log('List setItemTtl() successful');
     *   })
     *   .catch(function(error) {
     *     console.error('List setItemTtl() failed', error);
     *   });
     */
    setItemTtl(index: number, ttl: number): Promise<void>;
    /**
     * Delete this list. It will be impossible to restore it.
     * @return {Promise<void>} A promise that resolves when the list has been deleted.
     * @public
     * @example
     * list.removeList()
     *   .then(function() {
     *     console.log('List removeList() successful');
     *   })
     *   .catch(function(error) {
     *     console.error('List removeList() failed', error);
     *   });
     */
    removeList(): Promise<void>;
    protected onRemoved(locally: boolean): void;
    private shouldIgnoreEvent;
    /**
     * Handle update, which came from the server.
     * @private
     */
    _update(update: any, isStrictlyOrdered: boolean): void;
    _advanceLastEventId(eventId: number, revision?: string): void;
    private _updateRootDateUpdated;
    private _handleItemMutated;
    /**
     * @private
     */
    private emitItemMutationEvent;
    /**
     * @private
     */
    private _handleItemRemoved;
    /**
     * @private
     */
    private _handleContextUpdate;
    /**
     * @private
     */
    private _updateContextIfRequired;
}
export { ListServices, ListDescriptor, Mutator, SyncList };
export default SyncList;
/**
 * Contains List Item metadata.
 * @typedef {Object} List#ItemMetadata
 * @property {String} [ttl] Specifies the time-to-live in seconds after which the list item is subject to automatic deletion.
 * The value 0 means infinity.
 */
/**
 * Applies a transformation to the item value. May be called multiple times on the
 * same datum in case of collisions with remote code.
 * @callback List~Mutator
 * @param {Object} currentValue The current value of the item in the cloud.
 * @return {Object} The desired new value for the item or <code>null</code> to gracefully cancel the mutation.
 */
/**
 * Fired when a new item appears in the list, whether its creator was local or remote.
 * @event List#itemAdded
 * @param {Object} args Arguments provided with the event.
 * @param {ListItem} args.item Added item.
 * @param {Boolean} args.isLocal Equals 'true' if item was added by local actor, 'false' otherwise.
 * @example
 * list.on('itemAdded', function(args) {
 *   console.log('List item ' + args.item.index + ' was added');
 *   console.log('args.item.value:', args.item.value);
 *   console.log('args.isLocal:', args.isLocal);
 * });
 */
/**
 * Fired when a list item is updated (not added or removed, but changed), whether the updater was local or remote.
 * @event List#itemUpdated
 * @param {Object} args Arguments provided with the event.
 * @param {ListItem} args.item Updated item.
 * @param {Boolean} args.isLocal Equals 'true' if item was updated by local actor, 'false' otherwise.
 * @example
 * list.on('itemUpdated', function(args) {
 *   console.log('List item ' + args.item.index + ' was updated');
 *   console.log('args.item.value:', args.item.value);
 *   console.log('args.isLocal:', args.isLocal);
 * });
 */
/**
 * Fired when a list item is removed, whether the remover was local or remote.
 * @event List#itemRemoved
 * @param {Object} args Arguments provided with the event.
 * @param {Number} args.index The index of the removed item.
 * @param {Boolean} args.isLocal Equals 'true' if item was removed by local actor, 'false' otherwise.
 * @param {Object} args.value In case item was removed by a remote actor, contains a snapshot of item data before removal.
 * @example
 * list.on('itemRemoved', function(args) {
 *   console.log('List item ' + args.index + ' was removed');
 *   console.log('args.value:', args.value);
 *   console.log('args.isLocal:', args.isLocal);
 * });
 */
/**
 * Fired when a list is deleted entirely, by any actor local or remote.
 * @event List#removed
 * @param {Object} args Arguments provided with the event.
 * @param {Boolean} args.isLocal Equals 'true' if list was removed by local actor, 'false' otherwise.
 * @example
 * list.on('removed', function(args) {
 *   console.log('List ' + list.sid + ' was removed');
 *   console.log('args.isLocal:', args.isLocal);
 * });
 */

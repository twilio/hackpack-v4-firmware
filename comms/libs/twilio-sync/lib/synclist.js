"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const logger_1 = require("./logger");
const entity_1 = require("./entity");
const listitem_1 = require("./listitem");
const paginator_1 = require("./paginator");
const cache_1 = require("./cache");
const mergingqueue_1 = require("./mergingqueue");
const syncerror_1 = require("./syncerror");
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
class SyncList extends entity_1.SyncEntity {
    /**
     * @private
     */
    constructor(services, descriptor, removalHandler) {
        super(services, removalHandler);
        const updateRequestReducer = (acc, input) => (typeof input.ttl === 'number') ? { ttl: input.ttl }
            : acc;
        this.updateMergingQueue = new mergingqueue_1.NamespacedMergingQueue(updateRequestReducer);
        this.cache = new cache_1.Cache();
        this.descriptor = descriptor;
        this.descriptor.date_updated = new Date(this.descriptor.date_updated);
    }
    // private props
    get uri() { return this.descriptor.url; }
    get revision() { return this.descriptor.revision; }
    get lastEventId() { return this.descriptor.last_event_id; }
    get links() { return this.descriptor.links; }
    get dateExpires() { return this.descriptor.date_expires; }
    static get type() { return 'list'; }
    get type() { return 'list'; }
    // public props, documented along with class description
    get sid() { return this.descriptor.sid; }
    get uniqueName() { return this.descriptor.unique_name || null; }
    get dateUpdated() { return this.descriptor.date_updated; }
    async _addOrUpdateItemOnServer(url, data, ifMatch, ttl) {
        let requestBody = { data };
        if (typeof ttl === 'number') {
            requestBody.ttl = ttl;
        }
        let response = await this.services.network.post(url, requestBody, ifMatch);
        response.body.data = data;
        response.body.date_updated = new Date(response.body.date_updated);
        return response.body;
    }
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
    async push(value, itemMetadata) {
        let ttl = (itemMetadata || {}).ttl;
        utils_1.validateOptionalTtl(ttl);
        let item = await this._addOrUpdateItemOnServer(this.links.items, value, undefined, ttl);
        let index = Number(item.index);
        this._handleItemMutated(index, item.url, item.last_event_id, item.revision, value, item.date_updated, item.date_expires, true, false);
        return this.cache.get(index);
    }
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
    set(index, value, itemMetadataUpdates) {
        const input = itemMetadataUpdates || {};
        utils_1.validateOptionalTtl(input.ttl);
        return this.updateMergingQueue.squashAndAdd(index, input, (input) => this._updateItemUnconditionally(index, value, input.ttl));
    }
    async _updateItemUnconditionally(index, data, ttl) {
        let existingItem = await this.get(index);
        const itemDescriptor = await this._addOrUpdateItemOnServer(existingItem.uri, data, undefined, ttl);
        this._handleItemMutated(index, itemDescriptor.url, itemDescriptor.last_event_id, itemDescriptor.revision, itemDescriptor.data, itemDescriptor.date_updated, itemDescriptor.date_expires, false, false);
        return this.cache.get(index);
    }
    async _updateItemWithIfMatch(index, mutatorFunction, ttl) {
        const existingItem = await this.get(index);
        const data = mutatorFunction(utils_1.deepClone(existingItem.value));
        if (data) {
            const ifMatch = existingItem.revision;
            try {
                const itemDescriptor = await this._addOrUpdateItemOnServer(existingItem.uri, data, ifMatch, ttl);
                this._handleItemMutated(index, itemDescriptor.url, itemDescriptor.last_event_id, itemDescriptor.revision, itemDescriptor.data, itemDescriptor.date_updated, itemDescriptor.date_expires, false, false);
                return this.cache.get(index);
            }
            catch (error) {
                if (error.status === 412) {
                    await this._getItemFromServer(index);
                    return this._updateItemWithIfMatch(index, mutatorFunction, ttl);
                }
                else {
                    throw error;
                }
            }
        }
        else {
            return existingItem;
        }
    }
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
    async mutate(index, mutator, itemMetadataUpdates) {
        const input = itemMetadataUpdates || {};
        utils_1.validateOptionalTtl(input.ttl);
        return this.updateMergingQueue.add(index, input, (input) => this._updateItemWithIfMatch(index, mutator, input.ttl));
    }
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
    async update(index, obj, itemMetadataUpdates) {
        return this.mutate(index, remote => Object.assign(remote, obj), itemMetadataUpdates);
    }
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
    async remove(index) {
        let item = await this.get(index);
        let response = await this.services.network.delete(item.uri);
        this._handleItemRemoved(index, response.body.last_event_id, undefined, new Date(response.body.date_updated), false);
    }
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
    async get(index) {
        let cachedItem = this.cache.get(index);
        if (cachedItem) {
            return cachedItem;
        }
        else {
            return this._getItemFromServer(index);
        }
    }
    async _getItemFromServer(index) {
        let result = await this.queryItems({ index });
        if (result.items.length < 1) {
            throw new syncerror_1.SyncError(`No item with index ${index} found`, 404, 54151);
        }
        else {
            return result.items[0];
        }
    }
    /**
     * Query items from the List
     * @private
     */
    async queryItems(arg) {
        arg = arg || {};
        const url = new utils_1.UriBuilder(this.links.items)
            .queryParam('From', arg.from)
            .queryParam('PageSize', arg.limit)
            .queryParam('Index', arg.index)
            .queryParam('PageToken', arg.pageToken)
            .queryParam('Order', arg.order)
            .build();
        let response = await this.services.network.get(url);
        let items = response.body.items.map(el => {
            el.date_updated = new Date(el.date_updated);
            let itemInCache = this.cache.get(el.index);
            if (itemInCache) {
                this._handleItemMutated(el.index, el.url, el.last_event_id, el.revision, el.data, el.date_updated, el.date_expires, false, true);
            }
            else {
                this.cache.store(Number(el.index), new listitem_1.ListItem({ index: Number(el.index),
                    uri: el.url,
                    revision: el.revision,
                    lastEventId: el.last_event_id,
                    dateUpdated: el.date_updated,
                    dateExpires: el.date_expires,
                    value: el.data }), el.last_event_id);
            }
            return this.cache.get(el.index);
        });
        let meta = response.body.meta;
        return new paginator_1.Paginator(items, pageToken => this.queryItems({ pageToken }), meta.previous_token, meta.next_token);
    }
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
    async getItems(args) {
        args = args || {};
        utils_1.validatePageSize(args.pageSize);
        args.limit = args.pageSize || args.limit || 50;
        args.order = args.order || 'asc';
        return this.queryItems(args);
    }
    /**
     * @return {Promise<Object>} Context of List
     * @private
     */
    async getContext() {
        if (!this.context) {
            let response = await this.services.network.get(this.links.context);
            // store fetched context if we have't received any newer update
            this._updateContextIfRequired(response.body.data, response.body.last_event_id);
        }
        return this.context;
    }
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
    async setTtl(ttl) {
        utils_1.validateMandatoryTtl(ttl);
        try {
            const requestBody = { ttl };
            const response = await this.services.network.post(this.uri, requestBody);
            this.descriptor.date_expires = response.body.date_expires;
        }
        catch (error) {
            if (error.status === 404) {
                this.onRemoved(false);
            }
            throw error;
        }
    }
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
    async setItemTtl(index, ttl) {
        utils_1.validateMandatoryTtl(ttl);
        let existingItem = await this.get(index);
        const requestBody = { ttl };
        const response = await this.services.network.post(existingItem.uri, requestBody);
        existingItem.updateDateExpires(response.body.date_expires);
    }
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
    async removeList() {
        await this.services.network.delete(this.uri);
        this.onRemoved(true);
    }
    onRemoved(locally) {
        this._unsubscribe();
        this.removalHandler(this.type, this.sid, this.uniqueName);
        this.emit('removed', { isLocal: locally });
    }
    shouldIgnoreEvent(key, eventId) {
        return this.cache.isKnown(key, eventId);
    }
    /**
     * Handle update, which came from the server.
     * @private
     */
    _update(update, isStrictlyOrdered) {
        const itemIndex = Number(update.item_index);
        update.date_created = new Date(update.date_created);
        switch (update.type) {
            case 'list_item_added':
            case 'list_item_updated':
                {
                    this._handleItemMutated(itemIndex, update.item_url, update.id, update.item_revision, update.item_data, update.date_created, undefined, // orchestration does not include date_expires
                    update.type === 'list_item_added', true);
                }
                break;
            case 'list_item_removed':
                {
                    this._handleItemRemoved(itemIndex, update.id, update.item_data, update.date_created, true);
                }
                break;
            case 'list_context_updated':
                {
                    this._handleContextUpdate(update.context_data, update.id, update.date_created);
                }
                break;
            case 'list_removed':
                {
                    this.onRemoved(false);
                }
                break;
        }
        if (isStrictlyOrdered) {
            this._advanceLastEventId(update.id, update.list_revision);
        }
    }
    _advanceLastEventId(eventId, revision) {
        if (this.lastEventId < eventId) {
            this.descriptor.last_event_id = eventId;
            if (revision) {
                this.descriptor.revision = revision;
            }
        }
    }
    _updateRootDateUpdated(dateUpdated) {
        if (!this.descriptor.date_updated || dateUpdated.getTime() > this.descriptor.date_updated.getTime()) {
            this.descriptor.date_updated = dateUpdated;
            this.services.storage.update(this.type, this.sid, this.uniqueName, { date_updated: dateUpdated });
        }
    }
    _handleItemMutated(index, uri, lastEventId, revision, value, dateUpdated, dateExpires, added, remote) {
        if (this.shouldIgnoreEvent(index, lastEventId)) {
            logger_1.default.trace('Item ', index, ' update skipped, current:', this.lastEventId, ', remote:', lastEventId);
            return;
        }
        else {
            this._updateRootDateUpdated(dateUpdated);
            let item = this.cache.get(index);
            if (!item) {
                let item = new listitem_1.ListItem({ index, uri, lastEventId, revision, value, dateUpdated, dateExpires });
                this.cache.store(index, item, lastEventId);
                this.emitItemMutationEvent(item, remote, added);
            }
            else if (item.lastEventId < lastEventId) {
                item.update(lastEventId, revision, value, dateUpdated);
                if (dateExpires !== undefined) {
                    item.updateDateExpires(dateExpires);
                }
                this.emitItemMutationEvent(item, remote, false);
            }
        }
    }
    /**
     * @private
     */
    emitItemMutationEvent(item, remote, added) {
        let eventName = added ? 'itemAdded' : 'itemUpdated';
        this.emit(eventName, { item: item, isLocal: !remote });
    }
    /**
     * @private
     */
    _handleItemRemoved(index, eventId, oldData, dateUpdated, remote) {
        this._updateRootDateUpdated(dateUpdated);
        this.cache.delete(index, eventId);
        this.emit('itemRemoved', { index: index, isLocal: !remote, value: oldData });
    }
    /**
     * @private
     */
    _handleContextUpdate(data, eventId, dateUpdated) {
        this._updateRootDateUpdated(dateUpdated);
        if (this._updateContextIfRequired(data, eventId)) {
            this.emit('contextUpdated', { context: data, isLocal: false });
        }
    }
    /**
     * @private
     */
    _updateContextIfRequired(data, eventId) {
        if (!this.contextEventId || eventId > this.contextEventId) {
            this.context = data;
            this.contextEventId = eventId;
            return true;
        }
        else {
            logger_1.default.trace('Context update skipped, current:', this.lastEventId, ', remote:', eventId);
            return false;
        }
    }
}
exports.SyncList = SyncList;
exports.default = SyncList;
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

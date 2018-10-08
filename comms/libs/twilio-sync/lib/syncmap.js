"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const logger_1 = require("./logger");
const entity_1 = require("./entity");
const mapitem_1 = require("./mapitem");
const paginator_1 = require("./paginator");
const cache_1 = require("./cache");
const mergingqueue_1 = require("./mergingqueue");
const syncerror_1 = require("./syncerror");
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
class SyncMap extends entity_1.SyncEntity {
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
        if (descriptor.items) {
            descriptor.items.forEach(itemDescriptor => {
                itemDescriptor.date_updated = new Date(itemDescriptor.date_updated);
                this.cache.store(itemDescriptor.key, new mapitem_1.MapItem(itemDescriptor), itemDescriptor.last_event_id);
            });
        }
    }
    // private props
    get uri() { return this.descriptor.url; }
    get links() { return this.descriptor.links; }
    get revision() { return this.descriptor.revision; }
    get lastEventId() { return this.descriptor.last_event_id; }
    get dateExpires() { return this.descriptor.date_expires; }
    static get type() { return 'map'; }
    get type() { return 'map'; }
    // public props, documented along with class description
    get sid() { return this.descriptor.sid; }
    get uniqueName() { return this.descriptor.unique_name || null; }
    get dateUpdated() { return this.descriptor.date_updated; }
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
    async set(key, value, itemMetadataUpdates) {
        const input = itemMetadataUpdates || {};
        utils_1.validateOptionalTtl(input.ttl);
        return this.updateMergingQueue.squashAndAdd(key, input, (input) => this._putItemUnconditionally(key, value, input.ttl));
    }
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
    async get(key) {
        if (this.cache.has(key)) {
            return this.cache.get(key);
        }
        else {
            return this._getItemFromServer(key);
        }
    }
    async _getItemFromServer(key) {
        let result = await this.queryItems({ key: key });
        if (result.items.length < 1) {
            throw new syncerror_1.SyncError(`No item with key ${key} found`, 404, 54201);
        }
        else {
            return result.items[0];
        }
    }
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
    async mutate(key, mutator, itemMetadataUpdates) {
        const input = itemMetadataUpdates || {};
        utils_1.validateOptionalTtl(input.ttl);
        return this.updateMergingQueue.add(key, input, (input) => this._putItemWithIfMatch(key, mutator, input.ttl));
    }
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
    async update(key, obj, itemMetadataUpdates) {
        return this.mutate(key, remote => Object.assign(remote, obj), itemMetadataUpdates);
    }
    async _putItemUnconditionally(key, data, ttl) {
        const result = await this._putItemToServer(key, data, undefined, ttl);
        const item = result.item;
        this._handleItemMutated(item.key, item.url, item.last_event_id, item.revision, item.data, item.date_updated, item.date_expires, result.added, false);
        return this.cache.get(item.key);
    }
    async _putItemWithIfMatch(key, mutatorFunction, ttl) {
        const currentItem = await this.get(key)
            .catch(error => {
            if (error.status === 404) {
                // PUT /Items/myKey with `If-Match: -1` acts as "put if not exists"
                return new mapitem_1.MapItem({ key: key, data: {}, last_event_id: -1, revision: '-1', url: null, date_updated: null, date_expires: null });
            }
            else {
                throw error;
            }
        });
        let data = mutatorFunction(utils_1.deepClone(currentItem.value));
        if (data) {
            let ifMatch = currentItem.revision;
            try {
                const result = await this._putItemToServer(key, data, ifMatch, ttl);
                const item = result.item;
                this._handleItemMutated(item.key, item.url, item.last_event_id, item.revision, item.data, item.date_updated, item.date_expires, result.added, false);
                return this.cache.get(item.key);
            }
            catch (error) {
                if (error.status === 412) {
                    await this._getItemFromServer(key);
                    return this._putItemWithIfMatch(key, mutatorFunction, ttl);
                }
                else {
                    throw error;
                }
            }
        }
        else {
            return currentItem;
        }
    }
    async _putItemToServer(key, data, ifMatch, ttl) {
        const url = new utils_1.UriBuilder(this.links.items).pathSegment(key).build();
        const requestBody = { data };
        if (typeof ttl === 'number') {
            requestBody.ttl = ttl;
        }
        try {
            const response = await this.services.network.put(url, requestBody, ifMatch);
            const mapItemDescriptor = response.body;
            mapItemDescriptor.data = data; // The server does not return the data in the response
            mapItemDescriptor.date_updated = new Date(mapItemDescriptor.date_updated);
            const added = response.status.code === 201;
            return { added, item: mapItemDescriptor };
        }
        catch (error) {
            if (error.status === 404) {
                this.onRemoved(false);
            }
            throw error;
        }
    }
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
    async remove(key) {
        if (typeof key === 'undefined') {
            throw new Error('Key argument is invalid');
        }
        let item = await this.get(key);
        let response = await this.services.network.delete(item.uri);
        this._handleItemRemoved(key, response.body.last_event_id, undefined, new Date(response.body.date_updated), false);
    }
    /**
     * @private
     */
    async queryItems(args) {
        args = args || {};
        const uri = new utils_1.UriBuilder(this.links.items)
            .queryParam('From', args.from)
            .queryParam('PageSize', args.limit)
            .queryParam('Key', args.key)
            .queryParam('PageToken', args.pageToken)
            .queryParam('Order', args.order)
            .build();
        let response = await this.services.network.get(uri);
        let items = response.body.items.map(el => {
            el.date_updated = new Date(el.date_updated);
            let itemInCache = this.cache.get(el.key);
            if (itemInCache) {
                this._handleItemMutated(el.key, el.url, el.last_event_id, el.revision, el.data, el.date_updated, el.date_expires, false, true);
            }
            else {
                this.cache.store(el.key, new mapitem_1.MapItem(el), el.last_event_id);
            }
            return this.cache.get(el.key);
        });
        const meta = response.body.meta;
        return new paginator_1.Paginator(items, pageToken => this.queryItems({ pageToken }), meta.previous_token, meta.next_token);
    }
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
    async getItems(args) {
        args = args || {};
        utils_1.validatePageSize(args.pageSize);
        args.limit = args.pageSize || args.limit || 50;
        args.order = args.order || 'asc';
        return this.queryItems(args);
    }
    /**
     * Enumerate all items in this Map.
     * This always triggers server interaction when being called for the first time on a Map; this may be latent.
     * This method not supported now and not meant to be used externally.
     * @param {Function} handler Function to handle each argument.
     * @private
     */
    forEach(handler) {
        return new Promise((resolve, reject) => {
            function processPage(page) {
                page.items.forEach(x => handler(x));
                if (page.hasNextPage) {
                    page.nextPage().then(processPage).catch(reject);
                }
                else {
                    resolve();
                }
            }
            this.queryItems().then(processPage).catch(reject);
        });
    }
    shouldIgnoreEvent(key, eventId) {
        return this.cache.isKnown(key, eventId);
    }
    /**
     * Handle update from the server
     * @private
     */
    _update(update, isStrictlyOrdered) {
        update.date_created = new Date(update.date_created);
        switch (update.type) {
            case 'map_item_added':
            case 'map_item_updated':
                {
                    this._handleItemMutated(update.item_key, update.item_url, update.id, update.item_revision, update.item_data, update.date_created, undefined, // orchestration events do not include date_expires
                    update.type === 'map_item_added', true);
                }
                break;
            case 'map_item_removed':
                {
                    this._handleItemRemoved(update.item_key, update.id, update.item_data, update.date_created, true);
                }
                break;
            case 'map_removed':
                {
                    this.onRemoved(false);
                }
                break;
        }
        if (isStrictlyOrdered) {
            this._advanceLastEventId(update.id, update.map_revision);
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
    _handleItemMutated(key, url, lastEventId, revision, value, dateUpdated, dateExpires, added, remote) {
        if (this.shouldIgnoreEvent(key, lastEventId)) {
            logger_1.default.trace('Item ', key, ' update skipped, current:', this.lastEventId, ', remote:', lastEventId);
            return;
        }
        else {
            this._updateRootDateUpdated(dateUpdated);
            let item = this.cache.get(key);
            if (!item) {
                item = new mapitem_1.MapItem({ key: key, url, last_event_id: lastEventId, revision, data: value, date_updated: dateUpdated, date_expires: dateExpires });
                this.cache.store(key, item, lastEventId);
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
    emitItemMutationEvent(item, remote, added) {
        let eventName = added ? 'itemAdded' : 'itemUpdated';
        this.emit(eventName, { item: item, isLocal: !remote });
    }
    /**
     * @private
     */
    _handleItemRemoved(key, eventId, oldData, dateUpdated, remote) {
        this._updateRootDateUpdated(dateUpdated);
        this.cache.delete(key, eventId);
        this.emit('itemRemoved', { key: key, isLocal: !remote, value: oldData });
    }
    onRemoved(locally) {
        this._unsubscribe();
        this.removalHandler(this.type, this.sid, this.uniqueName);
        //
        // Should also do some cleanup here
        this.emit('removed', { isLocal: locally });
    }
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
    async setItemTtl(key, ttl) {
        utils_1.validateMandatoryTtl(ttl);
        let existingItem = await this.get(key);
        const requestBody = { ttl };
        const response = await this.services.network.post(existingItem.uri, requestBody);
        existingItem.updateDateExpires(response.body.date_expires);
    }
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
    async removeMap() {
        await this.services.network.delete(this.uri);
        this.onRemoved(true);
    }
}
exports.SyncMap = SyncMap;
exports.default = SyncMap;
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

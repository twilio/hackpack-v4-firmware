"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("./logger");
const entity_1 = require("./entity");
const utils_1 = require("./utils");
const mergingqueue_1 = require("./mergingqueue");
const syncerror_1 = require("./syncerror");
/**
 * @class
 * @alias Document
 * @classdesc Represents a Sync Document, the contents of which is a single JSON object.
 * Use the {@link Client#document} method to obtain a reference to a Sync Document.
 * @property {String} sid The immutable identifier of this document, assigned by the system.
 * @property {String} [uniqueName=null] An optional immutable identifier that may be assigned by the programmer
 * to this document during creation. Globally unique among other Documents.
 * @property {Date} dateUpdated Date when the Document was last updated.
 * @property {Object} value The contents of this document.
 *
 * @fires Document#removed
 * @fires Document#updated
 */
class SyncDocument extends entity_1.SyncEntity {
    /**
     * @private
     */
    constructor(services, descriptor, removalHandler) {
        super(services, removalHandler);
        this.isDeleted = false;
        const updateRequestReducer = (acc, input) => (typeof input.ttl === 'number') ? { ttl: input.ttl }
            : acc;
        this.updateMergingQueue = new mergingqueue_1.MergingQueue(updateRequestReducer);
        this.descriptor = descriptor;
        this.descriptor.data = this.descriptor.data || {};
        this.descriptor.date_updated = new Date(this.descriptor.date_updated);
    }
    // private props
    get uri() { return this.descriptor.url; }
    get revision() { return this.descriptor.revision; }
    get lastEventId() { return this.descriptor.last_event_id; }
    get dateExpires() { return this.descriptor.date_expires; }
    static get type() { return 'document'; }
    get type() { return 'document'; }
    // public props, documented along with class description
    get sid() { return this.descriptor.sid; }
    get value() { return this.descriptor.data; }
    get dateUpdated() { return this.descriptor.date_updated; }
    get uniqueName() { return this.descriptor.unique_name || null; }
    /**
     * Update data entity with new data
     * @private
     */
    _update(update) {
        update.date_created = new Date(update.date_created);
        switch (update.type) {
            case 'document_updated':
                if (update.id > this.lastEventId) {
                    this.descriptor.last_event_id = update.id;
                    this.descriptor.revision = update.document_revision;
                    this.descriptor.date_updated = update.date_created;
                    this.descriptor.data = update.document_data;
                    this.emit('updated', { value: update.document_data, isLocal: false });
                    this.services.storage.update(this.type, this.sid, this.uniqueName, {
                        last_event_id: update.id,
                        revision: update.document_revision,
                        date_updated: update.date_created,
                        data: update.document_data
                    });
                }
                else {
                    logger_1.default.trace('Document update skipped, current:', this.lastEventId, ', remote:', update.id);
                }
                break;
            case 'document_removed':
                this.onRemoved(false);
                break;
        }
    }
    /**
     * Assign new contents to this document. The current value will be overwritten.
     * @param {Object} value The new contents to assign.
     * @param {Document#Metadata} [metadataUpdates] New document metadata.
     * @returns {Promise<Object>} A promise resolving to the new value of the document.
     * @public
     * @example
     * // Say, the Document value is { name: 'John Smith', age: 34 }
     * document.set({ name: 'Barbara Oaks' }, { ttl: 86400 })
     *   .then(function(newValue) {
     *     // Now the Document value is { name: 'Barbara Oaks' }
     *     console.log('Document set() successful, new value:', newValue);
     *   })
     *   .catch(function(error) {
     *     console.error('Document set() failed', error);
     *   });
     */
    async set(value, metadataUpdates) {
        const input = metadataUpdates || {};
        utils_1.validateOptionalTtl(input.ttl);
        return this.updateMergingQueue.squashAndAdd(input, input => this._setUnconditionally(value, input.ttl));
    }
    /**
     * Schedules a modification to this document that will apply a mutation function.
     * @param {Document~Mutator} mutator A function that outputs a new value based on the existing value.
     * May be called multiple times, particularly if this Document is modified concurrently by remote code.
     * If the mutation ultimately succeeds, the Document will have made the particular transition described
     * by this function.
     * @param {Document#Metadata} [metadataUpdates] New document metadata.
     * @return {Promise<Object>} Resolves with the most recent Document state, whether the output of a
     *    successful mutation or a state that prompted graceful cancellation (mutator returned <code>null</code>).
     * @public
     * @example
     * var mutatorFunction = function(currentValue) {
     *     currentValue.viewCount = (currentValue.viewCount || 0) + 1;
     *     return currentValue;
     * };
     * document.mutate(mutatorFunction, { ttl: 86400 }))
     *   .then(function(newValue) {
     *     console.log('Document mutate() successful, new value:', newValue);
     *   })
     *   .catch(function(error) {
     *     console.error('Document mutate() failed', error);
     *   });
     */
    async mutate(mutator, metadataUpdates) {
        const input = metadataUpdates || {};
        utils_1.validateOptionalTtl(input.ttl);
        return this.updateMergingQueue.add(input, input => this._setWithIfMatch(mutator, input.ttl));
    }
    /**
     * Modify a document by appending new fields (or by overwriting existing ones) with the values from the provided Object.
     * This is equivalent to
     * <pre>
     * document.mutate(function(currentValue) {
     *   return Object.assign(currentValue, obj));
     * });
     * </pre>
     * @param {Object} obj Specifies the particular (top-level) attributes that will receive new values.
     * @param {Document#Metadata} [metadataUpdates] New document metadata.
     * @return {Promise<Object>} A promise resolving to the new value of the document.
     * @public
     * @example
     * // Say, the Document value is { name: 'John Smith' }
     * document.update({ age: 34 }, { ttl: 86400 })
     *   .then(function(newValue) {
     *     // Now the Document value is { name: 'John Smith', age: 34 }
     *     console.log('Document update() successful, new value:', newValue);
     *   })
     *   .catch(function(error) {
     *     console.error('Document update() failed', error);
     *   });
     */
    async update(obj, metadataUpdates) {
        return this.mutate(remote => Object.assign(remote, obj), metadataUpdates);
    }
    /**
     * Update the time-to-live of the document.
     * @param {Number} ttl Specifies the time-to-live in seconds after which the document is subject to automatic deletion. The value 0 means infinity.
     * @return {Promise<void>} A promise that resolves after the TTL update was successful.
     * @public
     * @example
     * document.setTtl(3600)
     *   .then(function() {
     *     console.log('Document setTtl() successful');
     *   })
     *   .catch(function(error) {
     *     console.error('Document setTtl() failed', error);
     *   });
     */
    async setTtl(ttl) {
        utils_1.validateMandatoryTtl(ttl);
        const response = await this._postUpdateToServer({ ttl });
        this.descriptor.date_expires = response.date_expires;
    }
    /**
     * @private
     */
    async _setUnconditionally(value, ttl) {
        let result = await this._postUpdateToServer({ data: value, revision: undefined, ttl });
        this._handleSuccessfulUpdateResult(result);
        return this.value;
    }
    /**
     * @private
     */
    async _setWithIfMatch(mutatorFunction, ttl) {
        let data = mutatorFunction(utils_1.deepClone(this.value));
        if (data) {
            let revision = this.revision;
            try {
                let result = await this._postUpdateToServer({ data, revision, ttl });
                this._handleSuccessfulUpdateResult(result);
                return this.value;
            }
            catch (error) {
                if (error.status === 412) {
                    await this._softSync();
                    return this._setWithIfMatch(mutatorFunction);
                }
                else {
                    throw error;
                }
            }
        }
        else {
            return this.value;
        }
    }
    /**
     * @private
     */
    _handleSuccessfulUpdateResult(result) {
        if (result.last_event_id > this.descriptor.last_event_id) {
            // Ignore returned value if we already got a newer one
            this.descriptor.revision = result.revision;
            this.descriptor.data = result.data;
            this.descriptor.last_event_id = result.last_event_id;
            this.descriptor.date_expires = result.date_expires;
            this.descriptor.date_updated = new Date(result.date_updated);
            this.services.storage.update(this.type, this.sid, this.uniqueName, {
                last_event_id: result.last_event_id,
                revision: result.revision,
                date_updated: result.date_updated,
                data: result.data
            });
            this.emit('updated', { value: this.value, isLocal: true });
        }
    }
    /**
     * @private
     */
    async _postUpdateToServer(request) {
        if (!this.isDeleted) {
            const requestBody = {
                data: request.data
            };
            if (typeof request.ttl === 'number') {
                requestBody.ttl = request.ttl;
            }
            const ifMatch = request.revision;
            try {
                const response = await this.services.network.post(this.uri, requestBody, ifMatch);
                return {
                    revision: response.body.revision,
                    data: request.data,
                    last_event_id: response.body.last_event_id,
                    date_updated: response.body.date_updated,
                    date_expires: response.body.date_expires
                };
            }
            catch (error) {
                if (error.status === 404) {
                    this.onRemoved(false);
                }
                throw error;
            }
        }
        else {
            return Promise.reject(new syncerror_1.SyncError('The Document has been removed', 404, 54100));
        }
    }
    /**
     * Get new data from server
     * @private
     */
    async _softSync() {
        return this.services.network.get(this.uri)
            .then(response => {
            const event = {
                type: 'document_updated',
                id: response.body.last_event_id,
                document_revision: response.body.revision,
                document_data: response.body.data,
                date_created: response.body.date_updated // eslint-disable-line camelcase
            };
            this._update(event);
            return this;
        })
            .catch(err => {
            if (err.status === 404) {
                this.onRemoved(false);
            }
            else {
                logger_1.default.error(`Can't get updates for ${this.sid}:`, err);
            }
        });
    }
    onRemoved(locally) {
        if (this.isDeleted) {
            return;
        }
        else {
            this.isDeleted = true;
            this._unsubscribe();
            this.removalHandler(this.type, this.sid, this.uniqueName);
            this.emit('removed', { isLocal: locally });
        }
    }
    /**
     * Delete a document.
     * @return {Promise<void>} A promise which resolves if (and only if) the document is ultimately deleted.
     * @public
     * @example
     * document.removeDocument()
     *   .then(function() {
     *     console.log('Document removeDocument() successful');
     *   })
     *   .catch(function(error) {
     *     console.error('Document removeDocument() failed', error);
     *   });
     */
    async removeDocument() {
        if (!this.isDeleted) {
            await this.services.network.delete(this.uri);
            this.onRemoved(true);
        }
        else {
            return Promise.reject(new syncerror_1.SyncError('The Document has been removed', 404, 54100));
        }
    }
}
exports.SyncDocument = SyncDocument;
exports.default = SyncDocument;
/**
 * Contains Document metadata.
 * @typedef {Object} Document#Metadata
 * @property {String} [ttl] Specifies the time-to-live in seconds after which the document is subject to automatic deletion.
 * The value 0 means infinity.
 */
/**
 * Applies a transformation to the document value.
 * @callback Document~Mutator
 * @param {Object} currentValue The current value of the document in the cloud.
 * @return {Object} The desired new value for the document or <code>null</code> to gracefully cancel the mutation.
 */
/**
 * Fired when the document is removed, whether the remover was local or remote.
 * @event Document#removed
 * @param {Object} args Arguments provided with the event.
 * @param {Boolean} args.isLocal Equals 'true' if document was removed by local actor, 'false' otherwise.
 * @example
 * document.on('removed', function(args) {
 *   console.log('Document ' + document.sid + ' was removed');
 *   console.log('args.isLocal:', args.isLocal);
 * });
 */
/**
 * Fired when the document's contents have changed, whether the updater was local or remote.
 * @event Document#updated
 * @param {Object} args Arguments provided with the event.
 * @param {Object} args.value A snapshot of the document's new contents.
 * @param {Boolean} args.isLocal Equals 'true' if document was updated by local actor, 'false' otherwise.
 * @example
 * document.on('updated', function(args) {
 *   console.log('Document ' + document.sid + ' was updated');
 *   console.log('args.value: ', args.value);
 *   console.log('args.isLocal: ', args.isLocal);
 * });
 */

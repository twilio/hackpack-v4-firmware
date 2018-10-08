import { SyncEntity, EntityServices, RemovalHandler } from './entity';
import { Mutator } from './interfaces/mutator';
interface DocumentServices extends EntityServices {
}
interface DocumentDescriptor {
    url: string;
    sid: string;
    revision: string;
    last_event_id: number;
    unique_name: string;
    data: Object;
    date_updated: Date;
    date_expires: string;
}
export interface DocumentMetadata {
    ttl?: number;
}
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
declare class SyncDocument extends SyncEntity {
    private readonly updateMergingQueue;
    private readonly descriptor;
    private isDeleted;
    /**
     * @private
     */
    constructor(services: DocumentServices, descriptor: DocumentDescriptor, removalHandler: RemovalHandler);
    readonly uri: string;
    readonly revision: string;
    readonly lastEventId: number;
    readonly dateExpires: string;
    static readonly type: string;
    readonly type: string;
    readonly sid: string;
    readonly value: Object;
    readonly dateUpdated: Date;
    readonly uniqueName: string;
    /**
     * Update data entity with new data
     * @private
     */
    _update(update: any): void;
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
    set(value: Object, metadataUpdates?: DocumentMetadata): Promise<Object>;
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
    mutate(mutator: Mutator, metadataUpdates?: DocumentMetadata): Promise<Object>;
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
    update(obj: Object, metadataUpdates?: DocumentMetadata): Promise<Object>;
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
    setTtl(ttl: number): Promise<void>;
    /**
     * @private
     */
    private _setUnconditionally;
    /**
     * @private
     */
    private _setWithIfMatch;
    /**
     * @private
     */
    private _handleSuccessfulUpdateResult;
    /**
     * @private
     */
    private _postUpdateToServer;
    /**
     * Get new data from server
     * @private
     */
    private _softSync;
    protected onRemoved(locally: boolean): void;
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
    removeDocument(): Promise<never>;
}
export { DocumentServices, DocumentDescriptor, Mutator, SyncDocument };
export default SyncDocument;
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

/// <reference types="node" />
import { EventEmitter } from 'events';
import { SyncDocument } from './syncdocument';
import { SyncList } from './synclist';
import { SyncMap } from './syncmap';
import { SyncStream } from './streams/syncstream';
declare type json = {
    [key: string]: any;
};
declare type OpenMode = 'open_or_create' | 'open_existing' | 'create_new';
interface OpenOptions {
    id?: string;
    mode?: OpenMode;
    ttl?: number;
}
interface OpenDocumentOptions extends OpenOptions {
    value?: json;
}
interface OpenListOptions extends OpenOptions {
    purpose?: string;
    context?: json;
    includeItems?: boolean;
}
interface OpenMapOptions extends OpenOptions {
    includeItems?: boolean;
}
interface OpenStreamOptions extends OpenOptions {
}
export declare type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'disconnecting' | 'denied' | 'error';
/**
 * @class Client
 * @classdesc
 * Client for the Twilio Sync service.
 * @constructor
 * @param {String} token - Twilio access token.
 * @param {Client#ClientOptions} [options] - Options to customize the Client.
 * @example
 * // Using NPM
 * var SyncClient = require('twilio-sync');
 * var syncClient = new SyncClient(token, { logLevel: 'debug' });
 *
 * // Using CDN
 * var SyncClient = new Twilio.Sync.Client(token, { logLevel: 'debug' });
 *
 * @property {Client#ConnectionState} connectionState - Contains current service connection state.
 * Valid options are ['connecting', 'connected', 'disconnecting', 'disconnected', 'denied', 'error'].
 */
declare class Client extends EventEmitter {
    private readonly services;
    private readonly entities;
    private localStorageId;
    constructor(fpaToken: string, options?: any);
    /**
     * Current version of Sync client.
     * @name Client#version
     * @type String
     * @readonly
     */
    static readonly version: any;
    readonly connectionState: ConnectionState;
    /**
     * Returns promise which resolves when library is correctly initialized
     * Or throws if initialization is impossible
     * @private
     */
    private ensureReady;
    private storeRootInSessionCache;
    private readRootFromSessionCache;
    private _get;
    private _createDocument;
    private _getDocument;
    private _createList;
    private _getList;
    private _createMap;
    private _getMap;
    private _getStream;
    private _createStream;
    private getCached;
    private removeFromCacheAndSession;
    /**
     * Read or create a Sync Document.
     * @param {String | Client#OpenOptions} [arg] One of:
     * <li>Unique name or SID identifying a Sync Document - opens a Document with the given identifier or creates one if it does not exist.</li>
     * <li>none - creates a new Document with a randomly assigned SID and no unique name.</li>
     * <li>{@link Client#OpenOptions} object for more granular control.</li>
     * @return {Promise<Document>} a promise which resolves after the Document is successfully read (or created).
     * This promise may reject if the Document could not be created or if this endpoint lacks the necessary permissions to access it.
     * @public
     * @example
     * syncClient.document('MyDocument')
     *   .then(function(document) {
     *     console.log('Successfully opened a Document. SID: ' + document.sid);
     *     document.on('updated', function(event) {
     *       console.log('Received updated event: ', event);
     *     });
     *   })
     *   .catch(function(error) {
     *     console.log('Unexpected error', error);
     *   });
     */
    document(arg?: string | OpenDocumentOptions): Promise<SyncDocument>;
    /**
     * Read or create a Sync Map.
     * @param {String | Client#OpenOptions} [arg] One of:
     * <li>Unique name or SID identifying a Sync Map - opens a Map with the given identifier or creates one if it does not exist.</li>
     * <li>none - creates a new Map with a randomly assigned SID and no unique name.</li>
     * <li>{@link Client#OpenOptions} object for more granular control.</li>
     * @return {Promise<Map>} a promise which resolves after the Map is successfully read (or created).
     * This promise may reject if the Map could not be created or if this endpoint lacks the necessary permissions to access it.
     * @public
     * @example
     * syncClient.map('MyMap')
     *   .then(function(map) {
     *     console.log('Successfully opened a Map. SID: ' + map.sid);
     *     map.on('itemUpdated', function(event) {
     *       console.log('Received itemUpdated event: ', event);
     *     });
     *   })
     *   .catch(function(error) {
     *     console.log('Unexpected error', error);
     *   });
     */
    map(arg?: string | OpenMapOptions): Promise<SyncMap>;
    /**
     * Read or create a Sync List.
     * @param {String | Client#OpenOptions} [arg] One of:
     * <li>Unique name or SID identifying a Sync List - opens a List with the given identifier or creates one if it does not exist.</li>
     * <li>none - creates a new List with a randomly assigned SID and no unique name.</li>
     * <li>{@link Client#OpenOptions} object for more granular control.</li>
     * @return {Promise<List>} a promise which resolves after the List is successfully read (or created).
     * This promise may reject if the List could not be created or if this endpoint lacks the necessary permissions to access it.
     * @public
     * @example
     * syncClient.list('MyList')
     *   .then(function(list) {
     *     console.log('Successfully opened a List. SID: ' + list.sid);
     *     list.on('itemAdded', function(event) {
     *       console.log('Received itemAdded event: ', event);
     *     });
     *   })
     *   .catch(function(error) {
     *     console.log('Unexpected error', error);
     *   });
     */
    list(arg?: string | OpenListOptions): Promise<SyncList>;
    /**
     * Read or create a Sync Message Stream.
     * @param {String | Client#OpenOptions} [arg] One of:
     * <li>Unique name or SID identifying a Stream - opens a Stream with the given identifier or creates one if it does not exist.</li>
     * <li>none - creates a new Stream with a randomly assigned SID and no unique name.</li>
     * <li>{@link Client#OpenOptions} object for more granular control.</li>
     * @return {Promise<Stream>} a promise which resolves after the Stream is successfully read (or created).
     * The flow of messages will begin imminently (but not necessarily immediately) upon resolution.
     * This promise may reject if the Stream could not be created or if this endpoint lacks the necessary permissions to access it.
     * @public
     * @example
     * syncClient.stream('MyStream')
     *   .then(function(stream) {
     *     console.log('Successfully opened a Message Stream. SID: ' + stream.sid);
     *     stream.on('messagePublished', function(event) {
     *       console.log('Received messagePublished event: ', event);
     *     });
     *   })
     *   .catch(function(error) {
     *     console.log('Unexpected error', error);
     *   });
     */
    stream(arg?: string | OpenStreamOptions): Promise<SyncStream>;
    /**
     * Gracefully shutdown the libray
     * Currently it is not properly implemented and being used only in tests
     * But should be made a part of public API
     * @private
     */
    shutdown(): Promise<void>;
    /**
     * Set new authentication token.
     * @param {String} token New token to set.
     * @return {Promise<void>}
     * @public
     */
    updateToken(token: string): Promise<void>;
}
export { Client, Client as SyncClient, OpenMode, json, OpenOptions, OpenDocumentOptions, OpenMapOptions, OpenListOptions, OpenStreamOptions };
export default Client;
/**
 * Indicates current state of connection between the client and Sync service.
 * <p>Valid options are as follows:
 * <li>'connecting' - client is offline and connection attempt is in process.
 * <li>'connected' - client is online and ready.
 * <li>'disconnecting' - client is going offline as disconnection is in process.
 * <li>'disconnected' - client is offline and no connection attempt is in process.
 * <li>'denied' - client connection is denied because of invalid JWT access token. User must refresh token in order to proceed.
 * <li>'error' - client connection is in a permanent erroneous state. Client re-initialization is required.
 * @typedef {('connecting'|'connected'|'disconnecting'|'disconnected'|'denied'|'error')} Client#ConnectionState
 */
/**
 * These options can be passed to Client constructor.
 * @typedef {Object} Client#ClientOptions
 * @property {String} [logLevel='error'] - The level of logging to enable. Valid options
 *   (from strictest to broadest): ['silent', 'error', 'warn', 'info', 'debug', 'trace'].
 */
/**
 * Fired when connection state has been changed.
 * @param {Client#ConnectionState} connectionState Contains current service connection state.
 * @event Client#connectionStateChanged
 * @example
 * syncClient.on('connectionStateChanged', function(newState) {
 *   console.log('Received new connection state: ' + newState);
 * });
 */
/**
 * Options for opening a Sync Object.
 * @typedef {Object} Client#OpenOptions
 * @property {String} [id] Sync object SID or unique name.
 * @property {'open_or_create' | 'open_existing' | 'create_new'} [mode='open_or_create'] - The mode for opening the Sync object:
 * <li>'open_or_create' - reads a Sync object or creates one if it does not exist.
 * <li>'open_existing' - reads an existing Sync object. The promise is rejected if the object does not exist.
 * <li>'create_new' - creates a new Sync object. If the <i>id</i> property is specified, it will be used as the unique name.
 * @property {Number} [ttl] - The time-to-live of the Sync object in seconds. This is applied only if the object is created.
 * @property {Object} [value={ }] - The initial value for the Sync Document (only applicable to Documents).
 * @example <caption>The following example is applicable to all Sync objects
 * (i.e., <code>syncClient.document(), syncClient.list(), syncClient.map(), syncClient.stream()</code>)</caption>
 * // Attempts to open an existing Document with unique name 'MyDocument'
 * // If no such Document exists, the promise is rejected
 * syncClient.document({
 *     id: 'MyDocument',
 *     mode: 'open_existing'
 *   })
 *   .then(...)
 *   .catch(...);
 *
 * // Attempts to create a new Document with unique name 'MyDocument', TTL of 24 hours and initial value { name: 'John Smith' }
 * // If such a Document already exists, the promise is rejected
 * syncClient.document({
 *     id: 'MyDocument',
 *     mode: 'create_new',
 *     ttl: 86400
 *     value: { name: 'John Smith' } // the `value` property is only applicable for Documents
 *   })
 *   .then(...)
 *   .catch(...);
 */
/**
 * Fired when the access token is about to expire and needs to be updated.
 * The trigger takes place three minutes before the JWT access token expiry.
 * For long living applications, you should refresh the token when either <code>tokenAboutToExpire</code> or
 * <code>tokenExpired</code> events occur; handling just one of them is sufficient.
 * @event Client#tokenAboutToExpire
 * @type {void}
 * @example <caption>The following example illustrates access token refresh</caption>
 * syncClient.on('tokenAboutToExpire', function() {
 *   // Obtain a JWT access token: https://www.twilio.com/docs/sync/identity-and-access-tokens
 *   var token = '<your-access-token-here>';
 *   syncClient.updateToken(token);
 * });
*/
/**
 * Fired when the access token is expired.
 * In case the token is not refreshed, all subsequent Sync operations will fail and the client will disconnect.
 * For long living applications, you should refresh the token when either <code>tokenAboutToExpire</code> or
 * <code>tokenExpired</code> events occur; handling just one of them is sufficient.
 * @event Client#tokenExpired
 * @type {void}
 */

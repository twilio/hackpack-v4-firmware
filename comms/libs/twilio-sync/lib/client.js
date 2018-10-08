"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const twilsock_1 = require("twilsock");
const twilio_notifications_1 = require("twilio-notifications");
const utils_1 = require("./utils");
const logger_1 = require("./logger");
const configuration_1 = require("./configuration");
const subscriptions_1 = require("./subscriptions");
const router_1 = require("./router");
const network_1 = require("./network");
const syncdocument_1 = require("./syncdocument");
const synclist_1 = require("./synclist");
const syncmap_1 = require("./syncmap");
const clientInfo_1 = require("./clientInfo");
const entitiesCache_1 = require("./entitiesCache");
const storage_1 = require("./services/storage");
const utils_2 = require("./utils");
const syncstream_1 = require("./streams/syncstream");
const SYNC_PRODUCT_ID = 'data_sync';
const SDK_VERSION = require('../package.json').version;
function subscribe(subscribable) {
    subscribable._subscribe();
    return subscribable;
}
function decompose(arg) {
    if (!arg) {
        return { mode: 'create_new' };
    }
    else if (typeof arg === 'string') {
        return { id: arg, mode: 'open_or_create' };
    }
    else {
        utils_1.validateOptionalTtl(arg.ttl);
        let mode = arg.mode || (arg.id ? 'open_or_create' : 'create_new');
        return Object.assign({}, arg, { mode: mode });
    }
}
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
class Client extends events_1.EventEmitter {
    constructor(fpaToken, options = {}) {
        super();
        if (!fpaToken) {
            throw new Error('Sync library needs a valid Twilio token to be passed');
        }
        if (options.hasOwnProperty('logLevel')) {
            logger_1.default.setLevel(options.logLevel);
        }
        else {
            logger_1.default.setLevel('silent');
        }
        const productId = options.productId = options.productId || SYNC_PRODUCT_ID;
        let twilsock = options.twilsockClient = options.twilsockClient || new twilsock_1.Twilsock(fpaToken, productId, options);
        twilsock.on('tokenAboutToExpire', ttl => this.emit('tokenAboutToExpire', ttl));
        twilsock.on('tokenExpired', () => this.emit('tokenExpired'));
        let notifications = options.notificationsClient = options.notificationsClient || new twilio_notifications_1.Notifications(fpaToken, options);
        let config = new configuration_1.Configuration(options);
        let network = new network_1.Network(new clientInfo_1.ClientInfo(SDK_VERSION), config, twilsock);
        let storage = new storage_1.SessionStorage(config);
        this.localStorageId = null;
        twilsock.connect();
        this.services = {
            config,
            twilsock,
            notifications,
            network,
            storage,
            router: null,
            subscriptions: null
        };
        let subscriptions = new subscriptions_1.Subscriptions(this.services);
        let router = new router_1.Router({ config, subscriptions, notifications });
        this.services.router = router;
        this.services.subscriptions = subscriptions;
        this.entities = new entitiesCache_1.EntitiesCache();
        notifications.on('connectionStateChanged', () => {
            this.emit('connectionStateChanged', this.services.notifications.connectionState);
        });
    }
    /**
     * Current version of Sync client.
     * @name Client#version
     * @type String
     * @readonly
     */
    static get version() { return SDK_VERSION; }
    get connectionState() { return this.services.notifications.connectionState; }
    /**
     * Returns promise which resolves when library is correctly initialized
     * Or throws if initialization is impossible
     * @private
     */
    async ensureReady() {
        if (!this.services.config.sessionStorageEnabled) {
            return;
        }
        try {
            let storageSettings = await this.services.twilsock.storageId();
            this.services.storage.updateStorageId(storageSettings.id);
        }
        catch (e) {
            logger_1.default.warn('Failed to initialize storage', e);
        }
    }
    storeRootInSessionCache(type, id, value) {
        // can't store without id
        if (!this.services.config.sessionStorageEnabled || !id) {
            return;
        }
        let valueToStore = utils_2.deepClone(value);
        if (type === synclist_1.SyncList.type || type === syncmap_1.SyncMap.type) {
            valueToStore['last_event_id'] = null;
            delete valueToStore['items'];
        }
        this.services.storage.store(type, id, valueToStore);
    }
    readRootFromSessionCache(type, id) {
        if (!this.services.config.sessionStorageEnabled || !id) {
            return null;
        }
        return this.services.storage.read(type, id);
    }
    async _get(baseUri, id, optimistic = false) {
        if (!id) {
            return null;
        }
        const uri = new utils_1.UriBuilder(baseUri).pathSegment(id)
            .queryParam('Include', optimistic ? 'items' : undefined).build();
        let response = await this.services.network.get(uri);
        return response.body;
    }
    _createDocument(id, data, ttl) {
        let requestBody = {
            unique_name: id,
            data: data || {}
        };
        if (typeof ttl === 'number') {
            requestBody.ttl = ttl;
        }
        return this.services.network.post(this.services.config.documentsUri, requestBody)
            .then(response => {
            response.body.data = requestBody.data;
            return response.body;
        });
    }
    async _getDocument(id) {
        return (this.readRootFromSessionCache(syncdocument_1.SyncDocument.type, id) || this._get(this.services.config.documentsUri, id));
    }
    _createList(id, purpose, context, ttl) {
        const requestBody = {
            unique_name: id,
            purpose: purpose,
            context: context
        };
        if (typeof ttl === 'number') {
            requestBody.ttl = ttl;
        }
        return this.services.network.post(this.services.config.listsUri, requestBody).then(response => response.body);
    }
    async _getList(id) {
        return (this.readRootFromSessionCache(synclist_1.SyncList.type, id) || this._get(this.services.config.listsUri, id));
    }
    _createMap(id, ttl) {
        let requestBody = {
            unique_name: id
        };
        if (typeof ttl === 'number') {
            requestBody.ttl = ttl;
        }
        return this.services.network.post(this.services.config.mapsUri, requestBody).then(response => response.body);
    }
    async _getMap(id, optimistic = false) {
        return (this.readRootFromSessionCache(syncmap_1.SyncMap.type, id) || this._get(this.services.config.mapsUri, id, optimistic));
    }
    async _getStream(id) {
        return (this.readRootFromSessionCache(syncstream_1.SyncStream.type, id) || this._get(this.services.config.streamsUri, id, false));
    }
    async _createStream(id, ttl) {
        let requestBody = {
            unique_name: id
        };
        if (typeof ttl === 'number') {
            requestBody.ttl = ttl;
        }
        const response = await this.services.network.post(this.services.config.streamsUri, requestBody);
        const streamDescriptor = response.body;
        return streamDescriptor;
    }
    getCached(id, type) {
        if (id) {
            return this.entities.get(id, type) || null;
        }
        return null;
    }
    removeFromCacheAndSession(type, sid, uniqueName) {
        this.entities.remove(sid);
        if (this.services.config.sessionStorageEnabled) {
            this.services.storage.remove(type, sid, uniqueName);
        }
    }
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
    async document(arg) {
        await this.ensureReady();
        let opts = decompose(arg);
        let docDescriptor;
        if (opts.mode === 'create_new') {
            docDescriptor = await this._createDocument(opts.id, opts.value, opts.ttl);
        }
        else {
            let docFromInMemoryCache = this.getCached(opts.id, syncdocument_1.SyncDocument.type);
            if (docFromInMemoryCache) {
                return docFromInMemoryCache;
            }
            else {
                try {
                    docDescriptor = await this._getDocument(opts.id);
                }
                catch (err) {
                    if (err.status !== 404 || opts.mode === 'open_existing') {
                        throw err;
                    }
                    else {
                        try {
                            docDescriptor = await this._createDocument(opts.id, opts.value, opts.ttl);
                        }
                        catch (err) {
                            if (err.status === 409) {
                                return this.document(arg);
                            }
                            else {
                                throw err;
                            }
                        }
                    }
                }
            }
        }
        this.storeRootInSessionCache(syncdocument_1.SyncDocument.type, opts.id, docDescriptor);
        let syncDocument = new syncdocument_1.SyncDocument(this.services, docDescriptor, (type, sid, uniqueName) => this.removeFromCacheAndSession(type, sid, uniqueName));
        syncDocument = this.entities.store(syncDocument);
        return subscribe(syncDocument);
    }
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
    async map(arg) {
        await this.ensureReady();
        let opts = decompose(arg);
        let mapDescriptor;
        if (opts.mode === 'create_new') {
            mapDescriptor = await this._createMap(opts.id, opts.ttl);
        }
        else {
            let mapFromInMemoryCache = this.getCached(opts.id, syncmap_1.SyncMap.type);
            if (mapFromInMemoryCache) {
                return mapFromInMemoryCache;
            }
            else {
                try {
                    mapDescriptor = await this._getMap(opts.id, opts.includeItems);
                }
                catch (err) {
                    if (err.status !== 404 || opts.mode === 'open_existing') {
                        throw err;
                    }
                    else {
                        try {
                            mapDescriptor = await this._createMap(opts.id, opts.ttl);
                        }
                        catch (err) {
                            if (err.status === 409) {
                                return this.map(arg);
                            }
                            else {
                                throw err;
                            }
                        }
                    }
                }
            }
        }
        this.storeRootInSessionCache(syncmap_1.SyncMap.type, opts.id, mapDescriptor);
        let syncMap = new syncmap_1.SyncMap(this.services, mapDescriptor, (type, sid, uniqueName) => this.removeFromCacheAndSession(type, sid, uniqueName));
        syncMap = this.entities.store(syncMap);
        return subscribe(syncMap);
    }
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
    async list(arg) {
        await this.ensureReady();
        let opts = decompose(arg);
        let listDescriptor;
        if (opts.mode === 'create_new') {
            listDescriptor = await this._createList(opts.id, opts.purpose, opts.context, opts.ttl);
        }
        else {
            let listFromInMemoryCache = this.getCached(opts.id, synclist_1.SyncList.type);
            if (listFromInMemoryCache) {
                return listFromInMemoryCache;
            }
            else {
                try {
                    listDescriptor = await this._getList(opts.id);
                }
                catch (err) {
                    if (err.status !== 404 || opts.mode === 'open_existing') {
                        throw err;
                    }
                    else {
                        try {
                            listDescriptor = await this._createList(opts.id, opts.purpose, opts.context, opts.ttl);
                        }
                        catch (err) {
                            if (err.status === 409) {
                                return this.list(arg);
                            }
                            else {
                                throw err;
                            }
                        }
                    }
                }
            }
        }
        this.storeRootInSessionCache(synclist_1.SyncList.type, opts.id, listDescriptor);
        let syncList = new synclist_1.SyncList(this.services, listDescriptor, (type, sid, uniqueName) => this.removeFromCacheAndSession(type, sid, uniqueName));
        syncList = this.entities.store(syncList);
        return subscribe(syncList);
    }
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
    async stream(arg) {
        await this.ensureReady();
        let opts = decompose(arg);
        let streamDescriptor;
        if (opts.mode === 'create_new') {
            streamDescriptor = await this._createStream(opts.id, opts.ttl);
        }
        else {
            let streamFromInMemoryCache = this.getCached(opts.id, syncstream_1.SyncStream.type);
            if (streamFromInMemoryCache) {
                return streamFromInMemoryCache;
            }
            else {
                try {
                    streamDescriptor = await this._getStream(opts.id);
                }
                catch (err) {
                    if (err.status !== 404 || opts.mode === 'open_existing') {
                        throw err;
                    }
                    else {
                        try {
                            streamDescriptor = await this._createStream(opts.id, opts.ttl);
                        }
                        catch (err) {
                            if (err.status === 409) {
                                return this.stream(arg);
                            }
                            else {
                                throw err;
                            }
                        }
                    }
                }
            }
        }
        this.storeRootInSessionCache(syncstream_1.SyncStream.type, opts.id, streamDescriptor);
        const streamRemovalHandler = (type, sid, uniqueName) => this.removeFromCacheAndSession(type, sid, uniqueName);
        let syncStream = new syncstream_1.SyncStream(this.services, streamDescriptor, streamRemovalHandler);
        syncStream = this.entities.store(syncStream);
        return subscribe(syncStream);
    }
    /**
     * Gracefully shutdown the libray
     * Currently it is not properly implemented and being used only in tests
     * But should be made a part of public API
     * @private
     */
    async shutdown() {
        await this.services.subscriptions.shutdown();
        await this.services.twilsock.disconnect();
    }
    /**
     * Set new authentication token.
     * @param {String} token New token to set.
     * @return {Promise<void>}
     * @public
     */
    updateToken(token) {
        return this.services.twilsock.updateToken(token);
    }
}
exports.Client = Client;
exports.SyncClient = Client;
exports.default = Client;
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

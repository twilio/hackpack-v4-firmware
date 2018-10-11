"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = require("events");
var twilsock_1 = require("twilsock");
var twilio_notifications_1 = require("twilio-notifications");
var utils_1 = require("./utils");
var logger_1 = require("./logger");
var configuration_1 = require("./configuration");
var subscriptions_1 = require("./subscriptions");
var router_1 = require("./router");
var network_1 = require("./network");
var syncdocument_1 = require("./syncdocument");
var synclist_1 = require("./synclist");
var syncmap_1 = require("./syncmap");
var clientInfo_1 = require("./clientInfo");
var entitiesCache_1 = require("./entitiesCache");
var storage_1 = require("./services/storage");
var utils_2 = require("./utils");
var syncstream_1 = require("./streams/syncstream");
var SYNC_PRODUCT_ID = 'data_sync';
var SDK_VERSION = require('../package.json').version;
function subscribe(subscribable) {
    subscribable._subscribe();
    return subscribable;
}
function decompose(arg) {
    if (!arg) {
        return { mode: 'create_new' };
    } else if (typeof arg === 'string') {
        return { id: arg, mode: 'open_or_create' };
    } else {
        utils_1.validateOptionalTtl(arg.ttl);
        var mode = arg.mode || (arg.id ? 'open_or_create' : 'create_new');
        return (0, _assign2.default)({}, arg, { mode: mode });
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

var Client = function (_events_1$EventEmitte) {
    (0, _inherits3.default)(Client, _events_1$EventEmitte);

    function Client(fpaToken) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        (0, _classCallCheck3.default)(this, Client);

        var _this = (0, _possibleConstructorReturn3.default)(this, (Client.__proto__ || (0, _getPrototypeOf2.default)(Client)).call(this));

        if (!fpaToken) {
            throw new Error('Sync library needs a valid Twilio token to be passed');
        }
        if (options.hasOwnProperty('logLevel')) {
            logger_1.default.setLevel(options.logLevel);
        } else {
            logger_1.default.setLevel('silent');
        }
        var productId = options.productId = options.productId || SYNC_PRODUCT_ID;
        var twilsock = options.twilsockClient = options.twilsockClient || new twilsock_1.Twilsock(fpaToken, productId, options);
        twilsock.on('tokenAboutToExpire', function (ttl) {
            return _this.emit('tokenAboutToExpire', ttl);
        });
        twilsock.on('tokenExpired', function () {
            return _this.emit('tokenExpired');
        });
        var notifications = options.notificationsClient = options.notificationsClient || new twilio_notifications_1.Notifications(fpaToken, options);
        var config = new configuration_1.Configuration(options);
        var network = new network_1.Network(new clientInfo_1.ClientInfo(SDK_VERSION), config, twilsock);
        var storage = new storage_1.SessionStorage(config);
        _this.localStorageId = null;
        twilsock.connect();
        _this.services = {
            config: config,
            twilsock: twilsock,
            notifications: notifications,
            network: network,
            storage: storage,
            router: null,
            subscriptions: null
        };
        var subscriptions = new subscriptions_1.Subscriptions(_this.services);
        var router = new router_1.Router({ config: config, subscriptions: subscriptions, notifications: notifications });
        _this.services.router = router;
        _this.services.subscriptions = subscriptions;
        _this.entities = new entitiesCache_1.EntitiesCache();
        notifications.on('connectionStateChanged', function () {
            _this.emit('connectionStateChanged', _this.services.notifications.connectionState);
        });
        return _this;
    }
    /**
     * Current version of Sync client.
     * @name Client#version
     * @type String
     * @readonly
     */


    (0, _createClass3.default)(Client, [{
        key: "ensureReady",

        /**
         * Returns promise which resolves when library is correctly initialized
         * Or throws if initialization is impossible
         * @private
         */
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
                var storageSettings;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                if (this.services.config.sessionStorageEnabled) {
                                    _context.next = 2;
                                    break;
                                }

                                return _context.abrupt("return");

                            case 2:
                                _context.prev = 2;
                                _context.next = 5;
                                return this.services.twilsock.storageId();

                            case 5:
                                storageSettings = _context.sent;

                                this.services.storage.updateStorageId(storageSettings.id);
                                _context.next = 12;
                                break;

                            case 9:
                                _context.prev = 9;
                                _context.t0 = _context["catch"](2);

                                logger_1.default.warn('Failed to initialize storage', _context.t0);

                            case 12:
                            case "end":
                                return _context.stop();
                        }
                    }
                }, _callee, this, [[2, 9]]);
            }));

            function ensureReady() {
                return _ref.apply(this, arguments);
            }

            return ensureReady;
        }()
    }, {
        key: "storeRootInSessionCache",
        value: function storeRootInSessionCache(type, id, value) {
            // can't store without id
            if (!this.services.config.sessionStorageEnabled || !id) {
                return;
            }
            var valueToStore = utils_2.deepClone(value);
            if (type === synclist_1.SyncList.type || type === syncmap_1.SyncMap.type) {
                valueToStore['last_event_id'] = null;
                delete valueToStore['items'];
            }
            this.services.storage.store(type, id, valueToStore);
        }
    }, {
        key: "readRootFromSessionCache",
        value: function readRootFromSessionCache(type, id) {
            if (!this.services.config.sessionStorageEnabled || !id) {
                return null;
            }
            return this.services.storage.read(type, id);
        }
    }, {
        key: "_get",
        value: function () {
            var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(baseUri, id) {
                var optimistic = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
                var uri, response;
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                if (id) {
                                    _context2.next = 2;
                                    break;
                                }

                                return _context2.abrupt("return", null);

                            case 2:
                                uri = new utils_1.UriBuilder(baseUri).pathSegment(id).queryParam('Include', optimistic ? 'items' : undefined).build();
                                _context2.next = 5;
                                return this.services.network.get(uri);

                            case 5:
                                response = _context2.sent;
                                return _context2.abrupt("return", response.body);

                            case 7:
                            case "end":
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function _get(_x3, _x4) {
                return _ref2.apply(this, arguments);
            }

            return _get;
        }()
    }, {
        key: "_createDocument",
        value: function _createDocument(id, data, ttl) {
            var requestBody = {
                unique_name: id,
                data: data || {}
            };
            if (typeof ttl === 'number') {
                requestBody.ttl = ttl;
            }
            return this.services.network.post(this.services.config.documentsUri, requestBody).then(function (response) {
                response.body.data = requestBody.data;
                return response.body;
            });
        }
    }, {
        key: "_getDocument",
        value: function () {
            var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(id) {
                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                return _context3.abrupt("return", this.readRootFromSessionCache(syncdocument_1.SyncDocument.type, id) || this._get(this.services.config.documentsUri, id));

                            case 1:
                            case "end":
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function _getDocument(_x5) {
                return _ref3.apply(this, arguments);
            }

            return _getDocument;
        }()
    }, {
        key: "_createList",
        value: function _createList(id, purpose, context, ttl) {
            var requestBody = {
                unique_name: id,
                purpose: purpose,
                context: context
            };
            if (typeof ttl === 'number') {
                requestBody.ttl = ttl;
            }
            return this.services.network.post(this.services.config.listsUri, requestBody).then(function (response) {
                return response.body;
            });
        }
    }, {
        key: "_getList",
        value: function () {
            var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(id) {
                return _regenerator2.default.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                return _context4.abrupt("return", this.readRootFromSessionCache(synclist_1.SyncList.type, id) || this._get(this.services.config.listsUri, id));

                            case 1:
                            case "end":
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            function _getList(_x6) {
                return _ref4.apply(this, arguments);
            }

            return _getList;
        }()
    }, {
        key: "_createMap",
        value: function _createMap(id, ttl) {
            var requestBody = {
                unique_name: id
            };
            if (typeof ttl === 'number') {
                requestBody.ttl = ttl;
            }
            return this.services.network.post(this.services.config.mapsUri, requestBody).then(function (response) {
                return response.body;
            });
        }
    }, {
        key: "_getMap",
        value: function () {
            var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(id) {
                var optimistic = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
                return _regenerator2.default.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                return _context5.abrupt("return", this.readRootFromSessionCache(syncmap_1.SyncMap.type, id) || this._get(this.services.config.mapsUri, id, optimistic));

                            case 1:
                            case "end":
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));

            function _getMap(_x8) {
                return _ref5.apply(this, arguments);
            }

            return _getMap;
        }()
    }, {
        key: "_getStream",
        value: function () {
            var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(id) {
                return _regenerator2.default.wrap(function _callee6$(_context6) {
                    while (1) {
                        switch (_context6.prev = _context6.next) {
                            case 0:
                                return _context6.abrupt("return", this.readRootFromSessionCache(syncstream_1.SyncStream.type, id) || this._get(this.services.config.streamsUri, id, false));

                            case 1:
                            case "end":
                                return _context6.stop();
                        }
                    }
                }, _callee6, this);
            }));

            function _getStream(_x9) {
                return _ref6.apply(this, arguments);
            }

            return _getStream;
        }()
    }, {
        key: "_createStream",
        value: function () {
            var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7(id, ttl) {
                var requestBody, response, streamDescriptor;
                return _regenerator2.default.wrap(function _callee7$(_context7) {
                    while (1) {
                        switch (_context7.prev = _context7.next) {
                            case 0:
                                requestBody = {
                                    unique_name: id
                                };

                                if (typeof ttl === 'number') {
                                    requestBody.ttl = ttl;
                                }
                                _context7.next = 4;
                                return this.services.network.post(this.services.config.streamsUri, requestBody);

                            case 4:
                                response = _context7.sent;
                                streamDescriptor = response.body;
                                return _context7.abrupt("return", streamDescriptor);

                            case 7:
                            case "end":
                                return _context7.stop();
                        }
                    }
                }, _callee7, this);
            }));

            function _createStream(_x10, _x11) {
                return _ref7.apply(this, arguments);
            }

            return _createStream;
        }()
    }, {
        key: "getCached",
        value: function getCached(id, type) {
            if (id) {
                return this.entities.get(id, type) || null;
            }
            return null;
        }
    }, {
        key: "removeFromCacheAndSession",
        value: function removeFromCacheAndSession(type, sid, uniqueName) {
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

    }, {
        key: "document",
        value: function () {
            var _ref8 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8(arg) {
                var _this2 = this;

                var opts, docDescriptor, docFromInMemoryCache, syncDocument;
                return _regenerator2.default.wrap(function _callee8$(_context8) {
                    while (1) {
                        switch (_context8.prev = _context8.next) {
                            case 0:
                                _context8.next = 2;
                                return this.ensureReady();

                            case 2:
                                opts = decompose(arg);
                                docDescriptor = void 0;

                                if (!(opts.mode === 'create_new')) {
                                    _context8.next = 10;
                                    break;
                                }

                                _context8.next = 7;
                                return this._createDocument(opts.id, opts.value, opts.ttl);

                            case 7:
                                docDescriptor = _context8.sent;
                                _context8.next = 40;
                                break;

                            case 10:
                                docFromInMemoryCache = this.getCached(opts.id, syncdocument_1.SyncDocument.type);

                                if (!docFromInMemoryCache) {
                                    _context8.next = 15;
                                    break;
                                }

                                return _context8.abrupt("return", docFromInMemoryCache);

                            case 15:
                                _context8.prev = 15;
                                _context8.next = 18;
                                return this._getDocument(opts.id);

                            case 18:
                                docDescriptor = _context8.sent;
                                _context8.next = 40;
                                break;

                            case 21:
                                _context8.prev = 21;
                                _context8.t0 = _context8["catch"](15);

                                if (!(_context8.t0.status !== 404 || opts.mode === 'open_existing')) {
                                    _context8.next = 27;
                                    break;
                                }

                                throw _context8.t0;

                            case 27:
                                _context8.prev = 27;
                                _context8.next = 30;
                                return this._createDocument(opts.id, opts.value, opts.ttl);

                            case 30:
                                docDescriptor = _context8.sent;
                                _context8.next = 40;
                                break;

                            case 33:
                                _context8.prev = 33;
                                _context8.t1 = _context8["catch"](27);

                                if (!(_context8.t1.status === 409)) {
                                    _context8.next = 39;
                                    break;
                                }

                                return _context8.abrupt("return", this.document(arg));

                            case 39:
                                throw _context8.t1;

                            case 40:
                                this.storeRootInSessionCache(syncdocument_1.SyncDocument.type, opts.id, docDescriptor);
                                syncDocument = new syncdocument_1.SyncDocument(this.services, docDescriptor, function (type, sid, uniqueName) {
                                    return _this2.removeFromCacheAndSession(type, sid, uniqueName);
                                });

                                syncDocument = this.entities.store(syncDocument);
                                return _context8.abrupt("return", subscribe(syncDocument));

                            case 44:
                            case "end":
                                return _context8.stop();
                        }
                    }
                }, _callee8, this, [[15, 21], [27, 33]]);
            }));

            function document(_x12) {
                return _ref8.apply(this, arguments);
            }

            return document;
        }()
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

    }, {
        key: "map",
        value: function () {
            var _ref9 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee9(arg) {
                var _this3 = this;

                var opts, mapDescriptor, mapFromInMemoryCache, syncMap;
                return _regenerator2.default.wrap(function _callee9$(_context9) {
                    while (1) {
                        switch (_context9.prev = _context9.next) {
                            case 0:
                                _context9.next = 2;
                                return this.ensureReady();

                            case 2:
                                opts = decompose(arg);
                                mapDescriptor = void 0;

                                if (!(opts.mode === 'create_new')) {
                                    _context9.next = 10;
                                    break;
                                }

                                _context9.next = 7;
                                return this._createMap(opts.id, opts.ttl);

                            case 7:
                                mapDescriptor = _context9.sent;
                                _context9.next = 40;
                                break;

                            case 10:
                                mapFromInMemoryCache = this.getCached(opts.id, syncmap_1.SyncMap.type);

                                if (!mapFromInMemoryCache) {
                                    _context9.next = 15;
                                    break;
                                }

                                return _context9.abrupt("return", mapFromInMemoryCache);

                            case 15:
                                _context9.prev = 15;
                                _context9.next = 18;
                                return this._getMap(opts.id, opts.includeItems);

                            case 18:
                                mapDescriptor = _context9.sent;
                                _context9.next = 40;
                                break;

                            case 21:
                                _context9.prev = 21;
                                _context9.t0 = _context9["catch"](15);

                                if (!(_context9.t0.status !== 404 || opts.mode === 'open_existing')) {
                                    _context9.next = 27;
                                    break;
                                }

                                throw _context9.t0;

                            case 27:
                                _context9.prev = 27;
                                _context9.next = 30;
                                return this._createMap(opts.id, opts.ttl);

                            case 30:
                                mapDescriptor = _context9.sent;
                                _context9.next = 40;
                                break;

                            case 33:
                                _context9.prev = 33;
                                _context9.t1 = _context9["catch"](27);

                                if (!(_context9.t1.status === 409)) {
                                    _context9.next = 39;
                                    break;
                                }

                                return _context9.abrupt("return", this.map(arg));

                            case 39:
                                throw _context9.t1;

                            case 40:
                                this.storeRootInSessionCache(syncmap_1.SyncMap.type, opts.id, mapDescriptor);
                                syncMap = new syncmap_1.SyncMap(this.services, mapDescriptor, function (type, sid, uniqueName) {
                                    return _this3.removeFromCacheAndSession(type, sid, uniqueName);
                                });

                                syncMap = this.entities.store(syncMap);
                                return _context9.abrupt("return", subscribe(syncMap));

                            case 44:
                            case "end":
                                return _context9.stop();
                        }
                    }
                }, _callee9, this, [[15, 21], [27, 33]]);
            }));

            function map(_x13) {
                return _ref9.apply(this, arguments);
            }

            return map;
        }()
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

    }, {
        key: "list",
        value: function () {
            var _ref10 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee10(arg) {
                var _this4 = this;

                var opts, listDescriptor, listFromInMemoryCache, syncList;
                return _regenerator2.default.wrap(function _callee10$(_context10) {
                    while (1) {
                        switch (_context10.prev = _context10.next) {
                            case 0:
                                _context10.next = 2;
                                return this.ensureReady();

                            case 2:
                                opts = decompose(arg);
                                listDescriptor = void 0;

                                if (!(opts.mode === 'create_new')) {
                                    _context10.next = 10;
                                    break;
                                }

                                _context10.next = 7;
                                return this._createList(opts.id, opts.purpose, opts.context, opts.ttl);

                            case 7:
                                listDescriptor = _context10.sent;
                                _context10.next = 40;
                                break;

                            case 10:
                                listFromInMemoryCache = this.getCached(opts.id, synclist_1.SyncList.type);

                                if (!listFromInMemoryCache) {
                                    _context10.next = 15;
                                    break;
                                }

                                return _context10.abrupt("return", listFromInMemoryCache);

                            case 15:
                                _context10.prev = 15;
                                _context10.next = 18;
                                return this._getList(opts.id);

                            case 18:
                                listDescriptor = _context10.sent;
                                _context10.next = 40;
                                break;

                            case 21:
                                _context10.prev = 21;
                                _context10.t0 = _context10["catch"](15);

                                if (!(_context10.t0.status !== 404 || opts.mode === 'open_existing')) {
                                    _context10.next = 27;
                                    break;
                                }

                                throw _context10.t0;

                            case 27:
                                _context10.prev = 27;
                                _context10.next = 30;
                                return this._createList(opts.id, opts.purpose, opts.context, opts.ttl);

                            case 30:
                                listDescriptor = _context10.sent;
                                _context10.next = 40;
                                break;

                            case 33:
                                _context10.prev = 33;
                                _context10.t1 = _context10["catch"](27);

                                if (!(_context10.t1.status === 409)) {
                                    _context10.next = 39;
                                    break;
                                }

                                return _context10.abrupt("return", this.list(arg));

                            case 39:
                                throw _context10.t1;

                            case 40:
                                this.storeRootInSessionCache(synclist_1.SyncList.type, opts.id, listDescriptor);
                                syncList = new synclist_1.SyncList(this.services, listDescriptor, function (type, sid, uniqueName) {
                                    return _this4.removeFromCacheAndSession(type, sid, uniqueName);
                                });

                                syncList = this.entities.store(syncList);
                                return _context10.abrupt("return", subscribe(syncList));

                            case 44:
                            case "end":
                                return _context10.stop();
                        }
                    }
                }, _callee10, this, [[15, 21], [27, 33]]);
            }));

            function list(_x14) {
                return _ref10.apply(this, arguments);
            }

            return list;
        }()
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

    }, {
        key: "stream",
        value: function () {
            var _ref11 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee11(arg) {
                var _this5 = this;

                var opts, streamDescriptor, streamFromInMemoryCache, streamRemovalHandler, syncStream;
                return _regenerator2.default.wrap(function _callee11$(_context11) {
                    while (1) {
                        switch (_context11.prev = _context11.next) {
                            case 0:
                                _context11.next = 2;
                                return this.ensureReady();

                            case 2:
                                opts = decompose(arg);
                                streamDescriptor = void 0;

                                if (!(opts.mode === 'create_new')) {
                                    _context11.next = 10;
                                    break;
                                }

                                _context11.next = 7;
                                return this._createStream(opts.id, opts.ttl);

                            case 7:
                                streamDescriptor = _context11.sent;
                                _context11.next = 40;
                                break;

                            case 10:
                                streamFromInMemoryCache = this.getCached(opts.id, syncstream_1.SyncStream.type);

                                if (!streamFromInMemoryCache) {
                                    _context11.next = 15;
                                    break;
                                }

                                return _context11.abrupt("return", streamFromInMemoryCache);

                            case 15:
                                _context11.prev = 15;
                                _context11.next = 18;
                                return this._getStream(opts.id);

                            case 18:
                                streamDescriptor = _context11.sent;
                                _context11.next = 40;
                                break;

                            case 21:
                                _context11.prev = 21;
                                _context11.t0 = _context11["catch"](15);

                                if (!(_context11.t0.status !== 404 || opts.mode === 'open_existing')) {
                                    _context11.next = 27;
                                    break;
                                }

                                throw _context11.t0;

                            case 27:
                                _context11.prev = 27;
                                _context11.next = 30;
                                return this._createStream(opts.id, opts.ttl);

                            case 30:
                                streamDescriptor = _context11.sent;
                                _context11.next = 40;
                                break;

                            case 33:
                                _context11.prev = 33;
                                _context11.t1 = _context11["catch"](27);

                                if (!(_context11.t1.status === 409)) {
                                    _context11.next = 39;
                                    break;
                                }

                                return _context11.abrupt("return", this.stream(arg));

                            case 39:
                                throw _context11.t1;

                            case 40:
                                this.storeRootInSessionCache(syncstream_1.SyncStream.type, opts.id, streamDescriptor);

                                streamRemovalHandler = function streamRemovalHandler(type, sid, uniqueName) {
                                    return _this5.removeFromCacheAndSession(type, sid, uniqueName);
                                };

                                syncStream = new syncstream_1.SyncStream(this.services, streamDescriptor, streamRemovalHandler);

                                syncStream = this.entities.store(syncStream);
                                return _context11.abrupt("return", subscribe(syncStream));

                            case 45:
                            case "end":
                                return _context11.stop();
                        }
                    }
                }, _callee11, this, [[15, 21], [27, 33]]);
            }));

            function stream(_x15) {
                return _ref11.apply(this, arguments);
            }

            return stream;
        }()
        /**
         * Gracefully shutdown the libray
         * Currently it is not properly implemented and being used only in tests
         * But should be made a part of public API
         * @private
         */

    }, {
        key: "shutdown",
        value: function () {
            var _ref12 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee12() {
                return _regenerator2.default.wrap(function _callee12$(_context12) {
                    while (1) {
                        switch (_context12.prev = _context12.next) {
                            case 0:
                                _context12.next = 2;
                                return this.services.subscriptions.shutdown();

                            case 2:
                                _context12.next = 4;
                                return this.services.twilsock.disconnect();

                            case 4:
                            case "end":
                                return _context12.stop();
                        }
                    }
                }, _callee12, this);
            }));

            function shutdown() {
                return _ref12.apply(this, arguments);
            }

            return shutdown;
        }()
        /**
         * Set new authentication token.
         * @param {String} token New token to set.
         * @return {Promise<void>}
         * @public
         */

    }, {
        key: "updateToken",
        value: function updateToken(token) {
            return this.services.twilsock.updateToken(token);
        }
    }, {
        key: "connectionState",
        get: function get() {
            return this.services.notifications.connectionState;
        }
    }], [{
        key: "version",
        get: function get() {
            return SDK_VERSION;
        }
    }]);
    return Client;
}(events_1.EventEmitter);

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
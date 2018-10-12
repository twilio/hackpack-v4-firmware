/* twilio-sync.js 0.8.4
The following license applies to all parts of this software except as
documented below.

    Copyright (c) 2016, Twilio, inc.
    All rights reserved.

    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions are
    met:

      1. Redistributions of source code must retain the above copyright
         notice, this list of conditions and the following disclaimer.

      2. Redistributions in binary form must reproduce the above copyright
         notice, this list of conditions and the following disclaimer in
         the documentation and/or other materials provided with the
         distribution.

      3. Neither the name of Twilio nor the names of its contributors may
         be used to endorse or promote products derived from this software
         without specific prior written permission.

    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
    "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
    LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
    A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
    HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
    SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
    LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
    DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
    THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
    (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
    OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

This software includes loglevel under the following license.

    Copyright (c) 2013 Tim Perry

    Permission is hereby granted, free of charge, to any person
    obtaining a copy of this software and associated documentation
    files (the "Software"), to deal in the Software without
    restriction, including without limitation the rights to use,
    copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the
    Software is furnished to do so, subject to the following
    conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
    OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
    HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
    WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
    FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
    OTHER DEALINGS IN THE SOFTWARE.

This software includes Backoff library under the following license

    Copyright (C) 2012 Mathieu Turcotte

    Permission is hereby granted, free of charge, to any person obtaining a copy of
    this software and associated documentation files (the "Software"), to deal in
    the Software without restriction, including without limitation the rights to
    use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
    of the Software, and to permit persons to whom the Software is furnished to do
    so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.

This software includes Event-to-Promise library under the following license

    Copyright (c) 2014, Julien Fontanet <julien.fontanet@isonoe.net>.

    Permission to use, copy, modify, and/or distribute this software for any purpose
    with or without fee is hereby granted, provided that the above copyright notice
    and this permission notice appear in all copies.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
    FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
    OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
    TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
    THIS SOFTWARE.
*/

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.Twilio || (g.Twilio = {})).Sync = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(_dereq_,module,exports){
"use strict";

var _classCallCheck2 = _dereq_("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = _dereq_("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

Object.defineProperty(exports, "__esModule", { value: true });
var karibu_1 = _dereq_("karibu");

var Entry = function () {
    function Entry(value, revision) {
        (0, _classCallCheck3.default)(this, Entry);

        this.value = value;
        this.revision = revision || 0;
    }

    (0, _createClass3.default)(Entry, [{
        key: "isValid",
        get: function get() {
            return true;
        }
    }]);
    return Entry;
}();

var Tombstone = function () {
    function Tombstone(revision) {
        (0, _classCallCheck3.default)(this, Tombstone);

        this.revision = revision;
    }

    (0, _createClass3.default)(Tombstone, [{
        key: "isValid",
        get: function get() {
            return false;
        }
    }]);
    return Tombstone;
}();

var Cache = function () {
    function Cache() {
        (0, _classCallCheck3.default)(this, Cache);

        this.items = new karibu_1.TreeMap();
    }

    (0, _createClass3.default)(Cache, [{
        key: "store",
        value: function store(key, value, revision) {
            var entry = this.items.get(key);
            if (entry && entry.revision > revision) {
                if (entry.isValid) {
                    return entry.value;
                }
                return null;
            }
            this.items.set(key, new Entry(value, revision));
            return value;
        }
    }, {
        key: "delete",
        value: function _delete(key, revision) {
            var curr = this.items.get(key);
            if (!curr || curr.revision < revision) {
                this.items.set(key, new Tombstone(revision));
            }
        }
    }, {
        key: "isKnown",
        value: function isKnown(key, revision) {
            var curr = this.items.get(key);
            return curr && curr.revision >= revision;
        }
    }, {
        key: "get",
        value: function get(key) {
            var entry = this.items.get(key);
            if (entry && entry.isValid) {
                return entry.value;
            }
            return null;
        }
    }, {
        key: "has",
        value: function has(key) {
            var entry = this.items.get(key);
            return entry && entry.isValid;
        }
    }]);
    return Cache;
}();

exports.Cache = Cache;
exports.default = Cache;

},{"babel-runtime/helpers/classCallCheck":40,"babel-runtime/helpers/createClass":41,"karibu":190}],2:[function(_dereq_,module,exports){
"use strict";

var _regenerator = _dereq_("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = _dereq_("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _getPrototypeOf = _dereq_("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = _dereq_("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = _dereq_("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = _dereq_("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = _dereq_("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

var _assign = _dereq_("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = _dereq_("events");
var twilsock_1 = _dereq_("twilsock");
var twilio_notifications_1 = _dereq_("twilio-notifications");
var utils_1 = _dereq_("./utils");
var logger_1 = _dereq_("./logger");
var configuration_1 = _dereq_("./configuration");
var subscriptions_1 = _dereq_("./subscriptions");
var router_1 = _dereq_("./router");
var network_1 = _dereq_("./network");
var syncdocument_1 = _dereq_("./syncdocument");
var synclist_1 = _dereq_("./synclist");
var syncmap_1 = _dereq_("./syncmap");
var clientInfo_1 = _dereq_("./clientInfo");
var entitiesCache_1 = _dereq_("./entitiesCache");
var storage_1 = _dereq_("./services/storage");
var utils_2 = _dereq_("./utils");
var syncstream_1 = _dereq_("./streams/syncstream");
var SYNC_PRODUCT_ID = 'data_sync';
var SDK_VERSION = _dereq_('../package.json').version;
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

},{"../package.json":242,"./clientInfo":3,"./configuration":4,"./entitiesCache":5,"./logger":8,"./network":11,"./router":13,"./services/storage":14,"./streams/syncstream":15,"./subscriptions":16,"./syncdocument":18,"./synclist":20,"./syncmap":21,"./utils":22,"babel-runtime/core-js/object/assign":28,"babel-runtime/core-js/object/get-prototype-of":32,"babel-runtime/helpers/asyncToGenerator":39,"babel-runtime/helpers/classCallCheck":40,"babel-runtime/helpers/createClass":41,"babel-runtime/helpers/inherits":43,"babel-runtime/helpers/possibleConstructorReturn":44,"babel-runtime/regenerator":48,"events":187,"twilio-notifications":203,"twilsock":216}],3:[function(_dereq_,module,exports){
"use strict";

var _classCallCheck2 = _dereq_("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

Object.defineProperty(exports, "__esModule", { value: true });
var platform = _dereq_("platform");

var ClientInfo = function ClientInfo(version) {
    (0, _classCallCheck3.default)(this, ClientInfo);

    this.sdk = 'js';
    this.sdkVer = version;
    this.os = platform.os.family;
    this.osVer = platform.os.version;
    this.pl = platform.name;
    this.plVer = platform.version;
};

exports.ClientInfo = ClientInfo;
exports.default = ClientInfo;

},{"babel-runtime/helpers/classCallCheck":40,"platform":193}],4:[function(_dereq_,module,exports){
"use strict";

var _classCallCheck2 = _dereq_("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = _dereq_("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

Object.defineProperty(exports, "__esModule", { value: true });
var SUBSCRIPTIONS_PATH = '/v4/Subscriptions';
var MAPS_PATH = '/v3/Maps';
var LISTS_PATH = '/v3/Lists';
var DOCUMENTS_PATH = '/v3/Documents';
var STREAMS_PATH = '/v3/Streams';
function getWithDefault(container, key, defaultValue) {
    if (container && typeof container[key] !== 'undefined') {
        return container[key];
    }
    return defaultValue;
}
/**
 * Settings container for Sync library
 */

var Configuration = function () {
    /**
     * @param {Object} options
     */
    function Configuration() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        (0, _classCallCheck3.default)(this, Configuration);

        var region = options.region || 'us1';
        var defaultCdsUrl = "https://cds." + region + ".twilio.com";
        var baseUri = options.cdsUri || defaultCdsUrl;
        this.settings = {
            subscriptionsUri: baseUri + SUBSCRIPTIONS_PATH,
            documentsUri: baseUri + DOCUMENTS_PATH,
            listsUri: baseUri + LISTS_PATH,
            mapsUri: baseUri + MAPS_PATH,
            streamsUri: baseUri + STREAMS_PATH,
            sessionStorageEnabled: getWithDefault(options.Sync, 'enableSessionStorage', true)
        };
    }

    (0, _createClass3.default)(Configuration, [{
        key: "subscriptionsUri",
        get: function get() {
            return this.settings.subscriptionsUri;
        }
    }, {
        key: "documentsUri",
        get: function get() {
            return this.settings.documentsUri;
        }
    }, {
        key: "listsUri",
        get: function get() {
            return this.settings.listsUri;
        }
    }, {
        key: "mapsUri",
        get: function get() {
            return this.settings.mapsUri;
        }
    }, {
        key: "streamsUri",
        get: function get() {
            return this.settings.streamsUri;
        }
    }, {
        key: "backoffConfig",
        get: function get() {
            return this.settings.backoffConfig || {};
        }
    }, {
        key: "sessionStorageEnabled",
        get: function get() {
            return this.settings.sessionStorageEnabled;
        }
    }]);
    return Configuration;
}();

exports.Configuration = Configuration;

},{"babel-runtime/helpers/classCallCheck":40,"babel-runtime/helpers/createClass":41}],5:[function(_dereq_,module,exports){
"use strict";

var _map = _dereq_("babel-runtime/core-js/map");

var _map2 = _interopRequireDefault(_map);

var _classCallCheck2 = _dereq_("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = _dereq_("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Container for entities which are known by the client
 * It's needed for deduplication when client obtain the same object several times
 */

var EntitiesCache = function () {
    function EntitiesCache() {
        (0, _classCallCheck3.default)(this, EntitiesCache);

        this.names = new _map2.default();
        this.entities = new _map2.default();
    }

    (0, _createClass3.default)(EntitiesCache, [{
        key: "store",
        value: function store(entity) {
            var stored = this.entities.get(entity.sid);
            if (stored) {
                return stored;
            }
            this.entities.set(entity.sid, entity);
            if (entity.uniqueName) {
                this.names.set(entity.type + '::' + entity.uniqueName, entity.sid);
            }
            return entity;
        }
    }, {
        key: "getResolved",
        value: function getResolved(id, type) {
            var resolvedSid = this.names.get(type + '::' + id);
            return resolvedSid ? this.entities.get(resolvedSid) : null;
        }
    }, {
        key: "get",
        value: function get(id, type) {
            return this.entities.get(id) || this.getResolved(id, type) || null;
        }
    }, {
        key: "remove",
        value: function remove(sid) {
            var cached = this.entities.get(sid);
            if (cached) {
                this.entities.delete(sid);
                if (cached.uniqueName) {
                    this.names.delete(cached.type + '::' + cached.uniqueName);
                }
            }
        }
    }]);
    return EntitiesCache;
}();

exports.EntitiesCache = EntitiesCache;

},{"babel-runtime/core-js/map":27,"babel-runtime/helpers/classCallCheck":40,"babel-runtime/helpers/createClass":41}],6:[function(_dereq_,module,exports){
"use strict";

var _getPrototypeOf = _dereq_("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = _dereq_("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = _dereq_("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = _dereq_("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = _dereq_("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = _dereq_("events");

var SyncEntity = function (_events_1$EventEmitte) {
    (0, _inherits3.default)(SyncEntity, _events_1$EventEmitte);

    function SyncEntity(services, removalHandler) {
        (0, _classCallCheck3.default)(this, SyncEntity);

        var _this = (0, _possibleConstructorReturn3.default)(this, (SyncEntity.__proto__ || (0, _getPrototypeOf2.default)(SyncEntity)).call(this));

        _this.services = services;
        _this.removalHandler = removalHandler;
        _this.subscriptionState = 'none';
        return _this;
    }

    (0, _createClass3.default)(SyncEntity, [{
        key: "_advanceLastEventId",
        value: function _advanceLastEventId(eventId, revision) {}
    }, {
        key: "reportFailure",
        value: function reportFailure(err) {
            if (err.status === 404) {
                // assume that 404 means that entity has been removed while we were away
                this.onRemoved(false);
            } else {
                this.emit('failure', err);
            }
        }
        /**
         * Subscribe to changes of data entity
         * @private
         */

    }, {
        key: "_subscribe",
        value: function _subscribe() {
            this.services.router.subscribe(this.sid, this);
            return this;
        }
        /**
         * Unsubscribe from changes of current data entity
         * @private
         */

    }, {
        key: "_unsubscribe",
        value: function _unsubscribe() {
            this.services.router.unsubscribe(this.sid, this);
            return this;
        }
    }, {
        key: "_setSubscriptionState",
        value: function _setSubscriptionState(newState) {
            this.subscriptionState = newState;
            this.emit('_subscriptionStateChanged', newState);
        }
        /**
         * @public
         */

    }, {
        key: "close",
        value: function close() {
            this._unsubscribe();
            this.removalHandler(this.type, this.sid, this.uniqueName);
        }
    }]);
    return SyncEntity;
}(events_1.EventEmitter);

exports.SyncEntity = SyncEntity;
exports.default = SyncEntity;

},{"babel-runtime/core-js/object/get-prototype-of":32,"babel-runtime/helpers/classCallCheck":40,"babel-runtime/helpers/createClass":41,"babel-runtime/helpers/inherits":43,"babel-runtime/helpers/possibleConstructorReturn":44,"events":187}],7:[function(_dereq_,module,exports){
"use strict";

var _classCallCheck2 = _dereq_("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = _dereq_("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @class
 * @classdesc Represents an individual element in a Sync List.
 * @alias ListItem
 * @property {Number} index The index, within the containing List, of this item. This index is stable;
 * even if lower-indexed Items are removed, this index will remain as is.
 * @property {Object} value The contents of the item.
 * @property {Date} dateUpdated Date when the List Item was last updated.
 */

var ListItem = function () {
  /**
   * @private
   * @constructor
   * @param {Object} data Item descriptor
   * @param {Number} data.index Item identifier
   * @param {String} data.uri Item URI
   * @param {Object} data.value Item data
   */
  function ListItem(data) {
    (0, _classCallCheck3.default)(this, ListItem);

    this.data = data;
  }

  (0, _createClass3.default)(ListItem, [{
    key: "update",

    /**
     * @private
     */
    value: function update(eventId, revision, value, dateUpdated) {
      this.data.lastEventId = eventId;
      this.data.revision = revision;
      this.data.value = value;
      this.data.dateUpdated = dateUpdated;
      return this;
    }
    /**
     * @private
     */

  }, {
    key: "updateDateExpires",
    value: function updateDateExpires(dateExpires) {
      this.data.dateExpires = dateExpires;
    }
  }, {
    key: "uri",
    get: function get() {
      return this.data.uri;
    }
  }, {
    key: "revision",
    get: function get() {
      return this.data.revision;
    }
  }, {
    key: "lastEventId",
    get: function get() {
      return this.data.lastEventId;
    }
  }, {
    key: "dateUpdated",
    get: function get() {
      return this.data.dateUpdated;
    }
  }, {
    key: "dateExpires",
    get: function get() {
      return this.data.dateExpires;
    }
  }, {
    key: "index",
    get: function get() {
      return this.data.index;
    }
  }, {
    key: "value",
    get: function get() {
      return this.data.value;
    }
  }]);
  return ListItem;
}();

exports.ListItem = ListItem;
exports.default = ListItem;

},{"babel-runtime/helpers/classCallCheck":40,"babel-runtime/helpers/createClass":41}],8:[function(_dereq_,module,exports){
"use strict";

var _from = _dereq_("babel-runtime/core-js/array/from");

var _from2 = _interopRequireDefault(_from);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

Object.defineProperty(exports, "__esModule", { value: true });
var log = _dereq_("loglevel");
function prepareLine(prefix, args) {
    return [new Date().toISOString() + " Sync " + prefix + ":"].concat((0, _from2.default)(args));
}
exports.default = {
    setLevel: function setLevel(level) {
        log.setLevel(level);
    },
    trace: function trace() {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        log.trace.apply(null, prepareLine('T', args));
    },
    debug: function debug() {
        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
        }

        log.debug.apply(null, prepareLine('D', args));
    },
    info: function info() {
        for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            args[_key3] = arguments[_key3];
        }

        log.info.apply(null, prepareLine('I', args));
    },
    warn: function warn() {
        for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
            args[_key4] = arguments[_key4];
        }

        log.warn.apply(null, prepareLine('W', args));
    },
    error: function error() {
        for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
            args[_key5] = arguments[_key5];
        }

        log.error.apply(null, prepareLine('E', args));
    }
};

},{"babel-runtime/core-js/array/from":23,"loglevel":191}],9:[function(_dereq_,module,exports){
"use strict";

var _classCallCheck2 = _dereq_("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = _dereq_("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @class
 * @classdesc Represents an individual element in a Sync Map.
 * @alias MapItem
 * @property {String} key The identifier that maps to this item within the containing Map.
 * @property {Object} value The contents of the item.
 * @property {Date} dateUpdated Date when the Map Item was last updated, given in UTC ISO 8601 format (e.g., '2018-04-26T15:23:19.732Z')
 */

var MapItem = function () {
  /**
   * @private
   * @constructor
   */
  function MapItem(descriptor) {
    (0, _classCallCheck3.default)(this, MapItem);

    this.descriptor = descriptor;
  }

  (0, _createClass3.default)(MapItem, [{
    key: "update",

    /**
     * @private
     */
    value: function update(eventId, revision, value, dateUpdated) {
      this.descriptor.last_event_id = eventId;
      this.descriptor.revision = revision;
      this.descriptor.data = value;
      this.descriptor.date_updated = dateUpdated;
      return this;
    }
    /**
     * @private
     */

  }, {
    key: "updateDateExpires",
    value: function updateDateExpires(dateExpires) {
      this.descriptor.date_expires = dateExpires;
    }
  }, {
    key: "uri",
    get: function get() {
      return this.descriptor.url;
    }
  }, {
    key: "revision",
    get: function get() {
      return this.descriptor.revision;
    }
  }, {
    key: "lastEventId",
    get: function get() {
      return this.descriptor.last_event_id;
    }
  }, {
    key: "dateExpires",
    get: function get() {
      return this.descriptor.date_expires;
    }
  }, {
    key: "key",
    get: function get() {
      return this.descriptor.key;
    }
  }, {
    key: "value",
    get: function get() {
      return this.descriptor.data;
    }
  }, {
    key: "dateUpdated",
    get: function get() {
      return this.descriptor.date_updated;
    }
  }]);
  return MapItem;
}();

exports.MapItem = MapItem;

},{"babel-runtime/helpers/classCallCheck":40,"babel-runtime/helpers/createClass":41}],10:[function(_dereq_,module,exports){
"use strict";

var _regenerator = _dereq_("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = _dereq_("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _map = _dereq_("babel-runtime/core-js/map");

var _map2 = _interopRequireDefault(_map);

var _promise = _dereq_("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _classCallCheck2 = _dereq_("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = _dereq_("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

Object.defineProperty(exports, "__esModule", { value: true });

var MergingQueue = function () {
    function MergingQueue(inputMergingFunction) {
        (0, _classCallCheck3.default)(this, MergingQueue);

        this.queuedRequests = [];
        this.isRequestInFlight = false;
        this.inputMergingFunction = inputMergingFunction;
    }

    (0, _createClass3.default)(MergingQueue, [{
        key: "add",
        value: function add(input, requestFunction) {
            var _this = this;

            var promise = new _promise2.default(function (resolve, reject) {
                return _this.queuedRequests.push({ input: input, requestFunction: requestFunction, resolve: resolve, reject: reject });
            });
            this.wakeupQueue();
            return promise;
        }
    }, {
        key: "squashAndAdd",
        value: function squashAndAdd(input, requestFunction) {
            var queueToSquash = this.queuedRequests;
            this.queuedRequests = [];
            var reducedInput = void 0;
            if (queueToSquash.length > 0) {
                reducedInput = queueToSquash.map(function (r) {
                    return r.input;
                }).reduce(this.inputMergingFunction);
                reducedInput = this.inputMergingFunction(reducedInput, input);
            } else {
                reducedInput = input;
            }
            var promise = this.add(reducedInput, requestFunction);
            queueToSquash.forEach(function (request) {
                return promise.then(request.resolve, request.reject);
            });
            return promise;
        }
    }, {
        key: "isEmpty",
        value: function isEmpty() {
            return this.queuedRequests.length === 0 && !this.isRequestInFlight;
        }
    }, {
        key: "wakeupQueue",
        value: function wakeupQueue() {
            var _this2 = this;

            if (this.queuedRequests.length === 0 || this.isRequestInFlight) {
                return;
            } else {
                var requestToExecute = this.queuedRequests.shift();
                this.isRequestInFlight = true;
                requestToExecute.requestFunction(requestToExecute.input).then(requestToExecute.resolve, requestToExecute.reject).then(function (__) {
                    _this2.isRequestInFlight = false;
                    _this2.wakeupQueue();
                });
            }
        }
    }]);
    return MergingQueue;
}();

exports.MergingQueue = MergingQueue;

var NamespacedMergingQueue = function () {
    function NamespacedMergingQueue(inputReducer) {
        (0, _classCallCheck3.default)(this, NamespacedMergingQueue);

        this.queueByNamespaceKey = new _map2.default();
        this.inputReducer = inputReducer;
    }

    (0, _createClass3.default)(NamespacedMergingQueue, [{
        key: "add",
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(namespaceKey, input, requestFunction) {
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                return _context.abrupt("return", this.invokeQueueMethod(namespaceKey, function (queue) {
                                    return queue.add(input, requestFunction);
                                }));

                            case 1:
                            case "end":
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function add(_x, _x2, _x3) {
                return _ref.apply(this, arguments);
            }

            return add;
        }()
    }, {
        key: "squashAndAdd",
        value: function () {
            var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(namespaceKey, input, requestFunction) {
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                return _context2.abrupt("return", this.invokeQueueMethod(namespaceKey, function (queue) {
                                    return queue.squashAndAdd(input, requestFunction);
                                }));

                            case 1:
                            case "end":
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function squashAndAdd(_x4, _x5, _x6) {
                return _ref2.apply(this, arguments);
            }

            return squashAndAdd;
        }()
    }, {
        key: "invokeQueueMethod",
        value: function () {
            var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(namespaceKey, queueMethodInvoker) {
                var queue, result;
                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                if (!this.queueByNamespaceKey.has(namespaceKey)) {
                                    this.queueByNamespaceKey.set(namespaceKey, new MergingQueue(this.inputReducer));
                                }
                                queue = this.queueByNamespaceKey.get(namespaceKey);
                                result = queueMethodInvoker(queue);

                                if (this.queueByNamespaceKey.get(namespaceKey).isEmpty()) {
                                    this.queueByNamespaceKey.delete(namespaceKey);
                                }
                                return _context3.abrupt("return", result);

                            case 5:
                            case "end":
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function invokeQueueMethod(_x7, _x8) {
                return _ref3.apply(this, arguments);
            }

            return invokeQueueMethod;
        }()
    }]);
    return NamespacedMergingQueue;
}();

exports.NamespacedMergingQueue = NamespacedMergingQueue;

},{"babel-runtime/core-js/map":27,"babel-runtime/core-js/promise":34,"babel-runtime/helpers/asyncToGenerator":39,"babel-runtime/helpers/classCallCheck":40,"babel-runtime/helpers/createClass":41,"babel-runtime/regenerator":48}],11:[function(_dereq_,module,exports){
"use strict";

var _promise = _dereq_("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _assign = _dereq_("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

var _stringify = _dereq_("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

var _classCallCheck2 = _dereq_("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = _dereq_("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

Object.defineProperty(exports, "__esModule", { value: true });
var uuid = _dereq_("uuid");
var logger_1 = _dereq_("./logger");
var syncerror_1 = _dereq_("./syncerror");
var syncNetworkError_1 = _dereq_("./syncNetworkError");
var operation_retrier_1 = _dereq_("operation-retrier");
var twilsock_1 = _dereq_("twilsock");
var MINIMUM_RETRY_DELAY = 4000;
var MAXIMUM_RETRY_DELAY = 60000;
var MAXIMUM_ATTEMPTS_TIME = 90000;
var RETRY_DELAY_RANDOMNESS = 0.2;
function messageFromErrorBody(trasportError) {
    if (trasportError.body) {
        if (trasportError.body.message) {
            return trasportError.body.message;
        }
    }
    switch (trasportError.status) {
        case 429:
            return 'Throttled by server';
        case 404:
            return 'Not found from server';
        default:
            return 'Error from server';
    }
}
function codeFromErrorBody(trasportError) {
    if (trasportError.body) {
        return trasportError.body.code;
    }
    return 0;
}
function mapTransportError(transportError) {
    if (transportError.status === 409) {
        return new syncNetworkError_1.SyncNetworkError(messageFromErrorBody(transportError), transportError.status, codeFromErrorBody(transportError), transportError.body);
    } else if (transportError.status) {
        return new syncerror_1.SyncError(messageFromErrorBody(transportError), transportError.status, codeFromErrorBody(transportError));
    } else if (transportError instanceof twilsock_1.TransportUnavailableError) {
        return transportError;
    } else {
        return new syncerror_1.SyncError(transportError.message, 0, 0);
    }
}
/**
 * @classdesc Incapsulates network operations to make it possible to add some optimization/caching strategies
 */

var Network = function () {
    function Network(clientInfo, config, transport) {
        (0, _classCallCheck3.default)(this, Network);

        this.clientInfo = clientInfo;
        this.config = config;
        this.transport = transport;
    }

    (0, _createClass3.default)(Network, [{
        key: "createHeaders",
        value: function createHeaders() {
            return {
                'Content-Type': 'application/json',
                'Twilio-Sync-Client-Info': (0, _stringify2.default)(this.clientInfo),
                'Twilio-Request-Id': 'RQ' + uuid.v4().replace(/-/g, '')
            };
        }
    }, {
        key: "backoffConfig",
        value: function backoffConfig() {
            return (0, _assign2.default)({ min: MINIMUM_RETRY_DELAY,
                max: MAXIMUM_RETRY_DELAY,
                maxAttemptsTime: MAXIMUM_ATTEMPTS_TIME,
                randomness: RETRY_DELAY_RANDOMNESS }, this.config.backoffConfig);
        }
    }, {
        key: "executeWithRetry",
        value: function executeWithRetry(request) {
            var _this = this;

            var retryWhenThrottled = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

            return new _promise2.default(function (resolve, reject) {
                var codesToRetryOn = [502, 503, 504];
                if (retryWhenThrottled) {
                    codesToRetryOn.push(429);
                }
                var retrier = new operation_retrier_1.default(_this.backoffConfig());
                retrier.on('attempt', function () {
                    request().then(function (result) {
                        return retrier.succeeded(result);
                    }).catch(function (err) {
                        if (codesToRetryOn.includes(err.status)) {
                            var delayOverride = parseInt(err.headers ? err.headers['Retry-After'] : null);
                            retrier.failed(mapTransportError(err), isNaN(delayOverride) ? null : delayOverride * 1000);
                        } else if (err.message === 'Twilsock disconnected') {
                            // Ugly hack. We must make a proper exceptions for twilsock
                            retrier.failed(mapTransportError(err));
                        } else if (err.message && err.message.indexOf('Twilsock: request timeout') !== -1) {
                            // Ugly hack. We must make a proper exceptions for twilsock
                            retrier.failed(mapTransportError(err));
                        } else {
                            // Fatal error
                            retrier.removeAllListeners();
                            retrier.cancel();
                            reject(mapTransportError(err));
                        }
                    });
                });
                retrier.on('succeeded', function (result) {
                    resolve(result);
                });
                retrier.on('cancelled', function (err) {
                    return reject(mapTransportError(err));
                });
                retrier.on('failed', function (err) {
                    return reject(mapTransportError(err));
                });
                retrier.start();
            });
        }
        /**
         * Make a GET request by given URI
         * @Returns Promise<Response> Result of successful get request
         */

    }, {
        key: "get",
        value: function get(uri) {
            var _this2 = this;

            var headers = this.createHeaders();
            logger_1.default.debug('GET', uri, 'ID:', headers['Twilio-Request-Id']);
            return this.executeWithRetry(function () {
                return _this2.transport.get(uri, headers);
            }, true);
        }
    }, {
        key: "post",
        value: function post(uri, body, revision, twilsockOnly) {
            var _this3 = this;

            var headers = this.createHeaders();
            if (typeof revision !== 'undefined' && revision !== null) {
                headers['If-Match'] = revision;
            }
            logger_1.default.debug('POST', uri, 'ID:', headers['Twilio-Request-Id']);
            return this.executeWithRetry(function () {
                return _this3.transport.post(uri, headers, body, twilsockOnly);
            }, false);
        }
    }, {
        key: "put",
        value: function put(uri, body, revision) {
            var _this4 = this;

            var headers = this.createHeaders();
            if (typeof revision !== 'undefined' && revision !== null) {
                headers['If-Match'] = revision;
            }
            logger_1.default.debug('PUT', uri, 'ID:', headers['Twilio-Request-Id']);
            return this.executeWithRetry(function () {
                return _this4.transport.put(uri, headers, body);
            }, false);
        }
    }, {
        key: "delete",
        value: function _delete(uri) {
            var _this5 = this;

            var headers = this.createHeaders();
            logger_1.default.debug('DELETE', uri, 'ID:', headers['Twilio-Request-Id']);
            return this.executeWithRetry(function () {
                return _this5.transport.delete(uri, headers);
            }, false);
        }
    }]);
    return Network;
}();

exports.Network = Network;

},{"./logger":8,"./syncNetworkError":17,"./syncerror":19,"babel-runtime/core-js/json/stringify":26,"babel-runtime/core-js/object/assign":28,"babel-runtime/core-js/promise":34,"babel-runtime/helpers/classCallCheck":40,"babel-runtime/helpers/createClass":41,"operation-retrier":192,"twilsock":216,"uuid":237}],12:[function(_dereq_,module,exports){
"use strict";

var _regenerator = _dereq_("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = _dereq_("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = _dereq_("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = _dereq_("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @class Paginator
 * @classdesc Pagination helper class.
 *
 * @property {Array} items Array of elements on current page.
 * @property {Boolean} hasNextPage Indicates the existence of next page.
 * @property {Boolean} hasPrevPage Indicates the existence of previous page.
 */

var Paginator = function () {
    /*
    * @constructor
    * @param {Array} items Array of element for current page.
    * @param {Object} params
    * @private
    */
    function Paginator(items, source, prevToken, nextToken) {
        (0, _classCallCheck3.default)(this, Paginator);

        this.prevToken = prevToken;
        this.nextToken = nextToken;
        this.items = items;
        this.source = source;
    }

    (0, _createClass3.default)(Paginator, [{
        key: "nextPage",

        /**
         * Request next page.
         * Does not modify existing object.
         * @return {Promise<Paginator>}
         */
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                if (this.hasNextPage) {
                                    _context.next = 2;
                                    break;
                                }

                                throw new Error('No next page');

                            case 2:
                                return _context.abrupt("return", this.source(this.nextToken));

                            case 3:
                            case "end":
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function nextPage() {
                return _ref.apply(this, arguments);
            }

            return nextPage;
        }()
        /**
         * Request previous page.
         * Does not modify existing object.
         * @return {Promise<Paginator>}
         */

    }, {
        key: "prevPage",
        value: function () {
            var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                if (this.hasPrevPage) {
                                    _context2.next = 2;
                                    break;
                                }

                                throw new Error('No previous page');

                            case 2:
                                return _context2.abrupt("return", this.source(this.prevToken));

                            case 3:
                            case "end":
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function prevPage() {
                return _ref2.apply(this, arguments);
            }

            return prevPage;
        }()
    }, {
        key: "hasNextPage",
        get: function get() {
            return !!this.nextToken;
        }
    }, {
        key: "hasPrevPage",
        get: function get() {
            return !!this.prevToken;
        }
    }]);
    return Paginator;
}();

exports.Paginator = Paginator;

},{"babel-runtime/helpers/asyncToGenerator":39,"babel-runtime/helpers/classCallCheck":40,"babel-runtime/helpers/createClass":41,"babel-runtime/regenerator":48}],13:[function(_dereq_,module,exports){
"use strict";

var _regenerator = _dereq_("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = _dereq_("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = _dereq_("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = _dereq_("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

Object.defineProperty(exports, "__esModule", { value: true });
var logger_1 = _dereq_("./logger");
var SYNC_DOCUMENT_NOTIFICATION_TYPE = 'com.twilio.rtd.cds.document';
var SYNC_LIST_NOTIFICATION_TYPE = 'com.twilio.rtd.cds.list';
var SYNC_MAP_NOTIFICATION_TYPE = 'com.twilio.rtd.cds.map';
var SYNC_NOTIFICATION_TYPE = 'twilio.sync.event';
/**
 * @class Router
 * @classdesc Routes all incoming messages to the consumers
 */

var Router = function () {
    function Router(params) {
        var _this = this;

        (0, _classCallCheck3.default)(this, Router);

        this.config = params.config;
        this.subscriptions = params.subscriptions;
        this.notifications = params.notifications;
        this.notifications.subscribe(SYNC_NOTIFICATION_TYPE);
        this.notifications.subscribe(SYNC_DOCUMENT_NOTIFICATION_TYPE);
        this.notifications.subscribe(SYNC_LIST_NOTIFICATION_TYPE);
        this.notifications.subscribe(SYNC_MAP_NOTIFICATION_TYPE);
        this.notifications.on('message', function (messageType, payload) {
            return _this.onMessage(messageType, payload);
        });
        this.notifications.on('transportReady', function (isConnected) {
            return _this.onConnectionStateChanged(isConnected);
        });
    }
    /**
     * Entry point for all incoming messages
     * @param {String} type - Type of incoming message
     * @param {Object} message - Message to route
     */

    (0, _createClass3.default)(Router, [{
        key: "onMessage",
        value: function onMessage(type, message) {
            logger_1.default.trace('Notification type:', type, 'content:', message);
            switch (type) {
                case SYNC_DOCUMENT_NOTIFICATION_TYPE:
                case SYNC_LIST_NOTIFICATION_TYPE:
                case SYNC_MAP_NOTIFICATION_TYPE:
                    this.subscriptions.acceptMessage(message, false);
                    break;
                case SYNC_NOTIFICATION_TYPE:
                    this.subscriptions.acceptMessage(message, true);
                    break;
            }
        }
        /**
         * Subscribe for events
         */

    }, {
        key: "subscribe",
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(sid, entity) {
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _context.next = 2;
                                return this.subscriptions.add(sid, entity);

                            case 2:
                            case "end":
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function subscribe(_x, _x2) {
                return _ref.apply(this, arguments);
            }

            return subscribe;
        }()
        /**
         * Unsubscribe from events
         */

    }, {
        key: "unsubscribe",
        value: function () {
            var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(sid, entity) {
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                _context2.next = 2;
                                return this.subscriptions.remove(sid);

                            case 2:
                            case "end":
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function unsubscribe(_x3, _x4) {
                return _ref2.apply(this, arguments);
            }

            return unsubscribe;
        }()
        /**
         * Handle transport establishing event
         * If we have any subscriptions - we should check object for modifications
         */

    }, {
        key: "onConnectionStateChanged",
        value: function onConnectionStateChanged(isConnected) {
            this.subscriptions.onConnectionStateChanged(isConnected);
        }
    }]);
    return Router;
}();

exports.Router = Router;
exports.default = Router;

},{"./logger":8,"babel-runtime/helpers/asyncToGenerator":39,"babel-runtime/helpers/classCallCheck":40,"babel-runtime/helpers/createClass":41,"babel-runtime/regenerator":48}],14:[function(_dereq_,module,exports){
"use strict";

var _assign = _dereq_("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

var _stringify = _dereq_("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

var _classCallCheck2 = _dereq_("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = _dereq_("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

Object.defineProperty(exports, "__esModule", { value: true });

var SessionStorage = function () {
    function SessionStorage(config, storage) {
        (0, _classCallCheck3.default)(this, SessionStorage);

        this.config = config;
        this.storageId = null;
        try {
            this.storage = storage || sessionStorage;
        } catch (e) {}
    }

    (0, _createClass3.default)(SessionStorage, [{
        key: "storageKey",
        value: function storageKey(type, key) {
            return this.storageId + "::" + type + "::" + key;
        }
    }, {
        key: "updateStorageId",
        value: function updateStorageId(storageId) {
            this.storageId = storageId;
        }
    }, {
        key: "store",
        value: function store(type, id, value) {
            if (!this.isReady) {
                return null;
            }
            return this._store(this.storageKey(type, id), value);
        }
    }, {
        key: "read",
        value: function read(type, id) {
            if (!this.isReady) {
                return null;
            }
            return this._read(this.storageKey(type, id));
        }
    }, {
        key: "remove",
        value: function remove(type, sid, uniqueName) {
            if (!this.isReady) {
                return null;
            }
            try {
                this.storage.removeItem(this.storageKey(type, sid));
                if (uniqueName) {
                    this.storage.removeItem(this.storageKey(type, uniqueName));
                }
            } catch (e) {}
        }
    }, {
        key: "update",
        value: function update(type, sid, uniqueName, patch) {
            if (!this.isReady) {
                return null;
            }
            // Currently cache may have root stored twice - by sid and by uniqueName
            // Maybe need to create some index if needed
            this._apply(this.storageKey(type, sid), patch);
            if (uniqueName) {
                this._apply(this.storageKey(type, uniqueName), patch);
            }
        }
    }, {
        key: "_store",
        value: function _store(key, value) {
            try {
                this.storage.setItem(key, (0, _stringify2.default)(value));
            } catch (e) {}
        }
    }, {
        key: "_read",
        value: function _read(key) {
            try {
                var storedData = this.storage.getItem(key);
                if (storedData) {
                    return JSON.parse(storedData);
                }
            } catch (e) {}
            return null;
        }
    }, {
        key: "_apply",
        value: function _apply(key, patch) {
            var value = this._read(key);
            if (!value) {
                return false;
            }
            this._store(key, (0, _assign2.default)(value, patch));
        }
    }, {
        key: "isReady",
        get: function get() {
            return this.config.sessionStorageEnabled && !!this.storageId;
        }
    }]);
    return SessionStorage;
}();

exports.SessionStorage = SessionStorage;

},{"babel-runtime/core-js/json/stringify":26,"babel-runtime/core-js/object/assign":28,"babel-runtime/helpers/classCallCheck":40,"babel-runtime/helpers/createClass":41}],15:[function(_dereq_,module,exports){
"use strict";

var _regenerator = _dereq_("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = _dereq_("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _getPrototypeOf = _dereq_("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = _dereq_("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = _dereq_("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = _dereq_("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = _dereq_("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

Object.defineProperty(exports, "__esModule", { value: true });
var entity_1 = _dereq_("../entity");
var utils_1 = _dereq_("../utils");
/**
 * @class
 * @alias Stream
 * @classdesc A Sync primitive for pub-sub messaging. Stream Messages are not persisted, exist
 *     only in transit, and will be dropped if (due to congestion or network anomalies) they
 *     cannot be delivered promptly. Use the {@link Client#stream} method to obtain a reference to a Sync Message Stream.
 * @property {String} sid The immutable system-assigned identifier of this stream. Never null.
 * @property {String} [uniqueName=null] A unique identifier optionally assigned to the stream on creation.
 *
 * @fires Stream#messagePublished
 * @fires Stream#removed
 */

var SyncStream = function (_entity_1$SyncEntity) {
    (0, _inherits3.default)(SyncStream, _entity_1$SyncEntity);

    /**
     * @private
     */
    function SyncStream(services, descriptor, removalHandler) {
        (0, _classCallCheck3.default)(this, SyncStream);

        var _this = (0, _possibleConstructorReturn3.default)(this, (SyncStream.__proto__ || (0, _getPrototypeOf2.default)(SyncStream)).call(this, services, removalHandler));

        _this.descriptor = descriptor;
        return _this;
    }
    // private props


    (0, _createClass3.default)(SyncStream, [{
        key: "publishMessage",

        /**
         * Publish a Message to the Stream. The system will attempt delivery to all online subscribers.
         * @param {Object} value The body of the dispatched message. Maximum size in serialized JSON: 4KB.
         * A rate limit applies to this operation, refer to the [Sync API documentation]{@link https://www.twilio.com/docs/api/sync} for details.
         * @return {Promise<StreamMessage>} A promise which resolves after the message is successfully published
         *   to the Sync service. Resolves irrespective of ultimate delivery to any subscribers.
         * @public
         * @example
         * stream.publishMessage({ x: 42, y: 123 })
         *   .then(function(message) {
         *     console.log('Stream publishMessage() successful, message SID:' + message.sid);
         *   })
         *   .catch(function(error) {
         *     console.error('Stream publishMessage() failed', error);
         *   });
         */
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(value) {
                var requestBody, response, responseBody, event;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                requestBody = { data: value };
                                _context.next = 3;
                                return this.services.network.post(this.links.messages, requestBody);

                            case 3:
                                response = _context.sent;
                                responseBody = response.body;
                                event = this._handleMessagePublished(responseBody.sid, value, false);
                                return _context.abrupt("return", event);

                            case 7:
                            case "end":
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function publishMessage(_x) {
                return _ref.apply(this, arguments);
            }

            return publishMessage;
        }()
        /**
         * Update the time-to-live of the stream.
         * @param {Number} ttl Specifies the TTL in seconds after which the stream is subject to automatic deletion. The value 0 means infinity.
         * @return {Promise<void>} A promise that resolves after the TTL update was successful.
         * @public
         * @example
         * stream.setTtl(3600)
         *   .then(function() {
         *     console.log('Stream setTtl() successful');
         *   })
         *   .catch(function(error) {
         *     console.error('Stream setTtl() failed', error);
         *   });
         */

    }, {
        key: "setTtl",
        value: function () {
            var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(ttl) {
                var requestBody, response;
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                utils_1.validateMandatoryTtl(ttl);
                                _context2.prev = 1;
                                requestBody = { ttl: ttl };
                                _context2.next = 5;
                                return this.services.network.post(this.uri, requestBody);

                            case 5:
                                response = _context2.sent;

                                this.descriptor.date_expires = response.body.date_expires;
                                _context2.next = 13;
                                break;

                            case 9:
                                _context2.prev = 9;
                                _context2.t0 = _context2["catch"](1);

                                if (_context2.t0.status === 404) {
                                    this.onRemoved(false);
                                }
                                throw _context2.t0;

                            case 13:
                            case "end":
                                return _context2.stop();
                        }
                    }
                }, _callee2, this, [[1, 9]]);
            }));

            function setTtl(_x2) {
                return _ref2.apply(this, arguments);
            }

            return setTtl;
        }()
        /**
         * Permanently delete this Stream.
         * @return {Promise<void>} A promise which resolves after the Stream is successfully deleted.
         * @public
         * @example
         * stream.removeStream()
         *   .then(function() {
         *     console.log('Stream removeStream() successful');
         *   })
         *   .catch(function(error) {
         *     console.error('Stream removeStream() failed', error);
         *   });
         */

    }, {
        key: "removeStream",
        value: function () {
            var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                _context3.next = 2;
                                return this.services.network.delete(this.uri);

                            case 2:
                                this.onRemoved(true);

                            case 3:
                            case "end":
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function removeStream() {
                return _ref3.apply(this, arguments);
            }

            return removeStream;
        }()
        /**
         * Handle event from the server
         * @private
         */

    }, {
        key: "_update",
        value: function _update(update) {
            switch (update.type) {
                case 'stream_message_published':
                    {
                        this._handleMessagePublished(update.message_sid, update.message_data, true);
                        break;
                    }
                case 'stream_removed':
                    {
                        this.onRemoved(false);
                        break;
                    }
            }
        }
    }, {
        key: "_handleMessagePublished",
        value: function _handleMessagePublished(sid, data, remote) {
            var event = {
                sid: sid,
                value: data
            };
            this.emit('messagePublished', { message: event, isLocal: !remote });
            return event;
        }
    }, {
        key: "onRemoved",
        value: function onRemoved(isLocal) {
            this._unsubscribe();
            this.removalHandler(this.type, this.sid, this.uniqueName);
            this.emit('removed', { isLocal: isLocal });
        }
    }, {
        key: "uri",
        get: function get() {
            return this.descriptor.url;
        }
    }, {
        key: "links",
        get: function get() {
            return this.descriptor.links;
        }
    }, {
        key: "dateExpires",
        get: function get() {
            return this.descriptor.date_expires;
        }
    }, {
        key: "type",
        get: function get() {
            return 'stream';
        }
    }, {
        key: "lastEventId",
        get: function get() {
            return null;
        }
    }, {
        key: "sid",

        // public props, documented along with class description
        get: function get() {
            return this.descriptor.sid;
        }
    }, {
        key: "uniqueName",
        get: function get() {
            return this.descriptor.unique_name || null;
        }
    }], [{
        key: "type",
        get: function get() {
            return 'stream';
        }
    }]);
    return SyncStream;
}(entity_1.SyncEntity);

exports.SyncStream = SyncStream;
exports.default = SyncStream;
/**
 * @class StreamMessage
 * @classdesc Stream Message descriptor.
 * @property {String} sid Contains Stream Message SID.
 * @property {Object} value Contains Stream Message value.
 */
/**
 * Fired when a Message is published to the Stream either locally or by a remote actor.
 * @event Stream#messagePublished
 * @param {Object} args Arguments provided with the event.
 * @param {StreamMessage} args.message Published message.
 * @param {Boolean} args.isLocal Equals 'true' if message was published by local code, 'false' otherwise.
 * @example
 * stream.on('messagePublished', function(args) {
 *   console.log('Stream message published');
 *   console.log('Message SID: ' + args.message.sid);
 *   console.log('Message value: ', args.message.value);
 *   console.log('args.isLocal:', args.isLocal);
 * });
 */
/**
 * Fired when a stream is removed entirely, whether the remover was local or remote.
 * @event Stream#removed
 * @param {Object} args Arguments provided with the event.
 * @param {Boolean} args.isLocal Equals 'true' if stream was removed by local code, 'false' otherwise.
 * @example
 * stream.on('removed', function(args) {
 *   console.log('Stream ' + stream.sid + ' was removed');
 *   console.log('args.isLocal:', args.isLocal);
 * });
 */

},{"../entity":6,"../utils":22,"babel-runtime/core-js/object/get-prototype-of":32,"babel-runtime/helpers/asyncToGenerator":39,"babel-runtime/helpers/classCallCheck":40,"babel-runtime/helpers/createClass":41,"babel-runtime/helpers/inherits":43,"babel-runtime/helpers/possibleConstructorReturn":44,"babel-runtime/regenerator":48}],16:[function(_dereq_,module,exports){
"use strict";
/* eslint-disable key-spacing */

var _regenerator = _dereq_("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = _dereq_("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _getIterator2 = _dereq_("babel-runtime/core-js/get-iterator");

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _slicedToArray2 = _dereq_("babel-runtime/helpers/slicedToArray");

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _assign = _dereq_("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

var _map = _dereq_("babel-runtime/core-js/map");

var _map2 = _interopRequireDefault(_map);

var _classCallCheck2 = _dereq_("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = _dereq_("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

Object.defineProperty(exports, "__esModule", { value: true });
var Backoff = _dereq_("backoff");
var logger_1 = _dereq_("./logger");
var syncerror_1 = _dereq_("./syncerror");
var twilsock_1 = _dereq_("twilsock");
/**
 * A data container used by the Subscriptions class to track subscribed entities' local
 * representations and their state.
 */

var SubscribedEntity = function () {
    function SubscribedEntity(entity) {
        (0, _classCallCheck3.default)(this, SubscribedEntity);

        this.localObject = entity;
        this.pendingCorrelationId = null;
        this.pendingAction = null;
        this.established = false;
        this.retryCount = 0;
    }

    (0, _createClass3.default)(SubscribedEntity, [{
        key: "update",
        value: function update(event, isStrictlyOrderd) {
            this.localObject._update(event, isStrictlyOrderd);
        }
    }, {
        key: "updatePending",
        value: function updatePending(action, correlationId) {
            this.pendingAction = action;
            this.pendingCorrelationId = correlationId;
        }
    }, {
        key: "reset",
        value: function reset() {
            this.updatePending(null, null);
            this.retryCount = 0;
            this.established = false;
            this.localObject._setSubscriptionState('none');
        }
    }, {
        key: "markAsFailed",
        value: function markAsFailed(message) {
            this.rejectedWithError = message.error;
            this.updatePending(null, null);
            this.localObject.reportFailure(new syncerror_1.SyncError("Failed to subscribe on service events: " + message.error.message, message.error.status, message.error.code));
        }
    }, {
        key: "complete",
        value: function complete(eventId) {
            this.updatePending(null, null);
            this.established = true;
            this.localObject._advanceLastEventId(eventId);
        }
    }, {
        key: "sid",
        get: function get() {
            return this.localObject.sid;
        }
    }, {
        key: "type",
        get: function get() {
            return this.localObject.type;
        }
    }, {
        key: "lastEventId",
        get: function get() {
            return this.localObject.lastEventId;
        }
    }, {
        key: "isEstablished",
        get: function get() {
            return this.established;
        }
    }]);
    return SubscribedEntity;
}();
/**
 * @class Subscriptions
 * @classdesc A manager which, in batches of varying size, continuously persists the
 *      subscription intent of the caller to the Sync backend until it achieves a
 *      converged state.
 */

var Subscriptions = function () {
    /**
     * @constructor
     * Prepares a new Subscriptions manager object with zero subscribed or persisted subscriptions.
     *
     * @param {object} config may include a key 'backoffConfig', wherein any of the parameters
     *      of Backoff.exponential (from npm 'backoff') are valid and will override the defaults.
     *
     * @param {Network} must be a viable running Sync Network object, useful for routing requests.
     */
    function Subscriptions(services) {
        var _this = this;

        (0, _classCallCheck3.default)(this, Subscriptions);

        this.isConnected = false;
        this.maxBatchSize = 100;
        // If the server includes a `ttl_in_s` attribute in the poke response, subscriptionTtlTimer is started for that duration
        // such that when it fires, it repokes the entire sync set (i.e., emulates a reconnect). Every reconnect resets the timer.
        // After the timer has fired, the first poke request includes a `reason: ttl` attribute in the body.
        this.subscriptionTtlTimer = null;
        this.pendingPokeReason = null;
        this.services = services;
        this.subscriptions = new _map2.default();
        this.persisted = new _map2.default();
        this.latestPokeResponseArrivalTimestampByCorrelationId = new _map2.default();
        var defaultBackoffConfig = {
            randomisationFactor: 0.2,
            initialDelay: 100,
            maxDelay: 2 * 60 * 1000
        };
        this.backoff = Backoff.exponential((0, _assign2.default)(defaultBackoffConfig, this.services.config.backoffConfig));
        // This block is triggered by #_persist. Every request is executed in a series of (ideally 1)
        // backoff 'ready' event, at which point a new subscription set is calculated.
        this.backoff.on('ready', function () {
            var _getSubscriptionUpdat = _this.getSubscriptionUpdateBatch(),
                action = _getSubscriptionUpdat.action,
                subscriptionRequests = _getSubscriptionUpdat.subscriptions;

            if (action) {
                _this.applyNewSubscriptionUpdateBatch(action, subscriptionRequests);
            } else {
                _this.backoff.reset();
                logger_1.default.debug('All subscriptions resolved.');
            }
        });
    }

    (0, _createClass3.default)(Subscriptions, [{
        key: "getSubscriptionUpdateBatch",
        value: function getSubscriptionUpdateBatch() {
            function substract(these, those, action, limit) {
                var result = [];
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = (0, _getIterator3.default)(these), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var _ref = _step.value;

                        var _ref2 = (0, _slicedToArray3.default)(_ref, 2);

                        var thisKey = _ref2[0];
                        var thisValue = _ref2[1];

                        var otherValue = those.get(thisKey);
                        if (!otherValue && action !== thisValue.pendingAction && !thisValue.rejectedWithError) {
                            result.push(thisValue);
                            if (limit && result.length >= limit) {
                                break;
                            }
                        }
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }

                return result;
            }
            var listToAdd = substract(this.subscriptions, this.persisted, 'establish', this.maxBatchSize);
            if (listToAdd.length > 0) {
                return { action: 'establish', subscriptions: listToAdd };
            }
            var listToRemove = substract(this.persisted, this.subscriptions, 'cancel', this.maxBatchSize);
            if (listToRemove.length > 0) {
                return { action: 'cancel', subscriptions: listToRemove };
            }
            return { action: null, subscriptions: null };
        }
    }, {
        key: "persist",
        value: function persist() {
            try {
                this.backoff.backoff();
            } catch (e) {} // eslint-disable-line no-empty
        }
    }, {
        key: "applyNewSubscriptionUpdateBatch",
        value: function () {
            var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(action, requests) {
                var _this2 = this;

                var correlationId, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, subscribed, reason, response, newMaxBatchSize, subscriptionTtlInS, isNumeric, isValidTtl, estimatedDeliveryInMs, _isNumeric, isValidTimeout, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, attemptedSubscription;

                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                if (this.isConnected) {
                                    _context.next = 4;
                                    break;
                                }

                                logger_1.default.debug("Twilsock connection (required for subscription) not ready; waiting\u2026");
                                this.backoff.reset();
                                return _context.abrupt("return");

                            case 4:
                                // Keeping in mind that events may begin flowing _before_ we receive the response
                                requests = this.processLocalActions(action, requests);
                                correlationId = new Date().getTime();
                                _iteratorNormalCompletion2 = true;
                                _didIteratorError2 = false;
                                _iteratorError2 = undefined;
                                _context.prev = 9;

                                for (_iterator2 = (0, _getIterator3.default)(requests); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                    subscribed = _step2.value;

                                    this.recordActionAttemptOn(subscribed, action, correlationId);
                                }
                                _context.next = 17;
                                break;

                            case 13:
                                _context.prev = 13;
                                _context.t0 = _context["catch"](9);
                                _didIteratorError2 = true;
                                _iteratorError2 = _context.t0;

                            case 17:
                                _context.prev = 17;
                                _context.prev = 18;

                                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                    _iterator2.return();
                                }

                            case 20:
                                _context.prev = 20;

                                if (!_didIteratorError2) {
                                    _context.next = 23;
                                    break;
                                }

                                throw _iteratorError2;

                            case 23:
                                return _context.finish(20);

                            case 24:
                                return _context.finish(17);

                            case 25:
                                reason = this.pendingPokeReason;

                                this.pendingPokeReason = null;
                                // Send this batch to the service
                                _context.prev = 27;
                                _context.next = 30;
                                return this.request(action, correlationId, reason, requests);

                            case 30:
                                response = _context.sent;
                                newMaxBatchSize = response.body.max_batch_size;

                                if (!isNaN(parseInt(newMaxBatchSize)) && isFinite(newMaxBatchSize) && newMaxBatchSize > 0) {
                                    this.maxBatchSize = newMaxBatchSize;
                                }
                                if (!this.subscriptionTtlTimer) {
                                    subscriptionTtlInS = response.body.ttl_in_s;
                                    isNumeric = !isNaN(parseFloat(subscriptionTtlInS)) && isFinite(subscriptionTtlInS);
                                    isValidTtl = isNumeric && subscriptionTtlInS > 0;

                                    if (isValidTtl) {
                                        this.subscriptionTtlTimer = setTimeout(function () {
                                            return _this2.onSubscriptionTtlElapsed();
                                        }, subscriptionTtlInS * 1000);
                                    }
                                }
                                if (action === 'establish') {
                                    estimatedDeliveryInMs = response.body.estimated_delivery_in_ms;
                                    _isNumeric = !isNaN(parseFloat(estimatedDeliveryInMs)) && isFinite(estimatedDeliveryInMs);
                                    isValidTimeout = _isNumeric && estimatedDeliveryInMs > 0;

                                    if (isValidTimeout) {
                                        setTimeout(function () {
                                            return _this2.verifyPokeDelivery(correlationId, estimatedDeliveryInMs, requests);
                                        }, estimatedDeliveryInMs);
                                    } else {
                                        logger_1.default.error("Invalid timeout: " + estimatedDeliveryInMs);
                                    }
                                    requests.filter(function (r) {
                                        return r.pendingCorrelationId === correlationId;
                                    }).forEach(function (r) {
                                        return r.localObject._setSubscriptionState('response_in_flight');
                                    });
                                }
                                this.backoff.reset();
                                _context.next = 60;
                                break;

                            case 38:
                                _context.prev = 38;
                                _context.t1 = _context["catch"](27);
                                _iteratorNormalCompletion3 = true;
                                _didIteratorError3 = false;
                                _iteratorError3 = undefined;
                                _context.prev = 43;

                                for (_iterator3 = (0, _getIterator3.default)(requests); !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                                    attemptedSubscription = _step3.value;

                                    this.recordActionFailureOn(attemptedSubscription, action);
                                }
                                _context.next = 51;
                                break;

                            case 47:
                                _context.prev = 47;
                                _context.t2 = _context["catch"](43);
                                _didIteratorError3 = true;
                                _iteratorError3 = _context.t2;

                            case 51:
                                _context.prev = 51;
                                _context.prev = 52;

                                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                                    _iterator3.return();
                                }

                            case 54:
                                _context.prev = 54;

                                if (!_didIteratorError3) {
                                    _context.next = 57;
                                    break;
                                }

                                throw _iteratorError3;

                            case 57:
                                return _context.finish(54);

                            case 58:
                                return _context.finish(51);

                            case 59:
                                if (_context.t1 instanceof twilsock_1.TransportUnavailableError) {
                                    logger_1.default.debug("Twilsock connection (required for subscription) not ready (c:" + correlationId + "); waiting\u2026");
                                    this.backoff.reset();
                                } else {
                                    logger_1.default.debug("Failed an attempt to " + action + " subscriptions (c:" + correlationId + "); retrying", _context.t1);
                                    this.persist();
                                }

                            case 60:
                            case "end":
                                return _context.stop();
                        }
                    }
                }, _callee, this, [[9, 13, 17, 25], [18,, 20, 24], [27, 38], [43, 47, 51, 59], [52,, 54, 58]]);
            }));

            function applyNewSubscriptionUpdateBatch(_x, _x2) {
                return _ref3.apply(this, arguments);
            }

            return applyNewSubscriptionUpdateBatch;
        }()
    }, {
        key: "verifyPokeDelivery",
        value: function verifyPokeDelivery(correlationId, estimatedDeliveryInMs, requests) {
            var _this3 = this;

            var lastReceived = this.latestPokeResponseArrivalTimestampByCorrelationId.get(correlationId);
            var silencePeriod = lastReceived ? new Date().getTime() - lastReceived : estimatedDeliveryInMs;
            if (silencePeriod >= estimatedDeliveryInMs) {
                // If we haven't received _any_ responses from that poke request for the duration of estimated_delivery_in_ms, poke again
                requests.filter(function (r) {
                    return r.pendingCorrelationId === correlationId;
                }).forEach(function (r) {
                    r.updatePending(null, null);
                    r.retryCount++;
                    _this3.persisted.delete(r.sid);
                });
                this.persist();
                this.latestPokeResponseArrivalTimestampByCorrelationId.delete(correlationId);
            } else {
                // Otherwise, the poke responses are probably in transit and we should wait for them
                var timeoutExtension = estimatedDeliveryInMs - silencePeriod;
                setTimeout(function () {
                    return _this3.verifyPokeDelivery(correlationId, estimatedDeliveryInMs, requests);
                }, timeoutExtension);
            }
        }
    }, {
        key: "processLocalActions",
        value: function processLocalActions(action, requests) {
            if (action === 'cancel') {
                return requests.filter(function (request) {
                    return !request.rejectedWithError;
                });
            }
            return requests;
        }
    }, {
        key: "recordActionAttemptOn",
        value: function recordActionAttemptOn(attemptedSubscription, action, correlationId) {
            attemptedSubscription.localObject._setSubscriptionState('request_in_flight');
            if (action === 'establish') {
                this.persisted.set(attemptedSubscription.sid, attemptedSubscription);
                attemptedSubscription.updatePending(action, correlationId);
            } else {
                // cancel
                var persistedSubscription = this.persisted.get(attemptedSubscription.sid);
                if (persistedSubscription) {
                    persistedSubscription.updatePending(action, correlationId);
                }
            }
        }
    }, {
        key: "recordActionFailureOn",
        value: function recordActionFailureOn(attemptedSubscription, action) {
            attemptedSubscription.localObject._setSubscriptionState('none');
            attemptedSubscription.updatePending(null, null);
            if (action === 'establish') {
                this.persisted.delete(attemptedSubscription.sid);
            }
        }
    }, {
        key: "request",
        value: function request(action, correlationId, reason, objects) {
            var requests = objects.map(function (object) {
                return {
                    object_sid: object.sid,
                    object_type: object.type,
                    last_event_id: action === 'establish' ? object.lastEventId : undefined // eslint-disable-line no-undefined, camelcase
                };
            });
            var retriedRequests = objects.filter(function (a) {
                return a.retryCount > 0;
            }).length;
            logger_1.default.debug("Attempting '" + action + "' request (c:" + correlationId + "):", requests);
            /* eslint-disable camelcase */
            var requestBody = {
                event_protocol_version: 3,
                action: action,
                correlation_id: correlationId,
                retried_requests: retriedRequests,
                ttl_in_s: -1,
                requests: requests
            };
            if (reason === 'ttl') {
                requestBody.reason = reason;
            }
            /* eslint-enable camelcase */
            return this.services.network.post(this.services.config.subscriptionsUri, requestBody, null, true);
        }
        /**
         * Establishes intent to be subscribed to this entity. That subscription will be effected
         * asynchronously.
         * If subscription to the given sid already exists, it will be overwritten.
         *
         * @param {String} sid should be a well-formed SID, uniquely identifying a single instance of a Sync entity.
         * @param {Object} entity should represent the (singular) local representation of this entity.
         *      Incoming events and modifications to the entity will be directed at the _update() function
         *      of this provided reference.
         *
         * @return undefined
         */

    }, {
        key: "add",
        value: function add(sid, entity) {
            logger_1.default.debug("Establishing intent to subscribe to " + sid);
            var existingSubscription = this.subscriptions.get(sid);
            if (existingSubscription && existingSubscription.lastEventId === entity.lastEventId) {
                // If last event id is the same as before - we're fine
                return;
            }
            this.persisted.delete(sid);
            this.subscriptions.set(sid, new SubscribedEntity(entity));
            this.persist();
        }
        /**
         * Establishes the caller's intent to no longer be subscribed to this entity. Following this
         * call, no further events shall be routed to the local representation of the entity, even
         * though a server-side subscription may take more time to actually terminate.
         *
         * @param {string} sid should be any well-formed SID, uniquely identifying a Sync entity.
         *      This call only has meaningful effect if that entity is subscribed at the
         *      time of call. Otherwise does nothing.
         *
         * @return undefined
         */

    }, {
        key: "remove",
        value: function remove(sid) {
            logger_1.default.debug("Establishing intent to unsubscribe from " + sid);
            var removed = this.subscriptions.delete(sid);
            if (removed) {
                this.persist();
            }
        }
        /**
         * The point of ingestion for remote incoming messages (e.g. new data was written to a map
         * to which we are subscribed).
         *
         * @param {object} message is the full, unaltered body of the incoming notification.
         *
         * @return undefined
         */

    }, {
        key: "acceptMessage",
        value: function acceptMessage(message, isStrictlyOrdered) {
            logger_1.default.trace('Subscriptions received', message);
            if (message.correlation_id) {
                this.latestPokeResponseArrivalTimestampByCorrelationId.set(message.correlation_id, new Date().getTime());
            }
            switch (message.event_type) {
                case 'subscription_established':
                    this.applySubscriptionEstablishedMessage(message.event, message.correlation_id);
                    break;
                case 'subscription_canceled':
                    this.applySubscriptionCancelledMessage(message.event, message.correlation_id);
                    break;
                case 'subscription_failed':
                    this.applySubscriptionFailedMessage(message.event, message.correlation_id);
                    break;
                case (message.event_type.match(/^(?:map|list|document|stream)_/) || {}).input:
                    {
                        var typedSid = function typedSid() {
                            if (message.event_type.match(/^map_/)) {
                                return message.event.map_sid;
                            } else if (message.event_type.match(/^list_/)) {
                                return message.event.list_sid;
                            } else if (message.event_type.match(/^document_/)) {
                                return message.event.document_sid;
                            } else if (message.event_type.match(/^stream_/)) {
                                return message.event.stream_sid;
                            } else {
                                return undefined;
                            }
                        };
                        this.applyEventToSubscribedEntity(typedSid(), message, isStrictlyOrdered);
                    }
                    break;
                default:
                    logger_1.default.debug("Dropping unknown message type " + message.event_type);
                    break;
            }
        }
    }, {
        key: "applySubscriptionEstablishedMessage",
        value: function applySubscriptionEstablishedMessage(message, correlationId) {
            var sid = message.object_sid;
            var subscriptionIntent = this.persisted.get(message.object_sid);
            if (subscriptionIntent && subscriptionIntent.pendingCorrelationId === correlationId) {
                if (message.replay_status === 'interrupted') {
                    logger_1.default.debug("Event Replay for subscription to " + sid + " (c:" + correlationId + ") interrupted; continuing eagerly.");
                    subscriptionIntent.updatePending(null, null);
                    this.persisted.delete(subscriptionIntent.sid);
                    this.backoff.reset();
                } else if (message.replay_status === 'completed') {
                    logger_1.default.debug("Event Replay for subscription to " + sid + " (c:" + correlationId + ") completed. Subscription is ready.");
                    subscriptionIntent.complete(message.last_event_id);
                    this.persisted.set(message.object_sid, subscriptionIntent);
                    subscriptionIntent.localObject._setSubscriptionState('established');
                    this.backoff.reset();
                }
            } else {
                logger_1.default.debug("Late message for " + message.object_sid + " (c:" + correlationId + ") dropped.");
            }
            this.persist();
        }
    }, {
        key: "applySubscriptionCancelledMessage",
        value: function applySubscriptionCancelledMessage(message, correlationId) {
            var persistedSubscription = this.persisted.get(message.object_sid);
            if (persistedSubscription && persistedSubscription.pendingCorrelationId === correlationId) {
                persistedSubscription.updatePending(null, null);
                persistedSubscription.localObject._setSubscriptionState('none');
                this.persisted.delete(message.object_sid);
            } else {
                logger_1.default.debug("Late message for " + message.object_sid + " (c:" + correlationId + ") dropped.");
            }
            this.persist();
        }
    }, {
        key: "applySubscriptionFailedMessage",
        value: function applySubscriptionFailedMessage(message, correlationId) {
            var sid = message.object_sid;
            var subscriptionIntent = this.subscriptions.get(sid);
            var subscription = this.persisted.get(sid);
            if (subscriptionIntent && subscription) {
                if (subscription.pendingCorrelationId === correlationId) {
                    logger_1.default.error("Failed to subscribe on " + subscription.sid, message.error);
                    subscription.markAsFailed(message);
                    subscription.localObject._setSubscriptionState('none');
                }
            } else if (!subscriptionIntent && subscription) {
                this.persisted.delete(sid);
                subscription.localObject._setSubscriptionState('none');
            }
            this.persist();
        }
    }, {
        key: "applyEventToSubscribedEntity",
        value: function applyEventToSubscribedEntity(sid, message, isStrictlyOrdered) {
            var _this4 = this;

            if (!sid) {
                return;
            }
            // Looking for subscription descriptor to check if poke has been completed
            isStrictlyOrdered = isStrictlyOrdered || function () {
                var subscription = _this4.persisted.get(sid);
                return subscription && subscription.isEstablished;
            }();
            // Still searching for subscriptionIntents. User could remove subscription already
            var subscriptionIntent = this.subscriptions.get(sid);
            if (subscriptionIntent) {
                message.event.type = message.event_type;
                subscriptionIntent.update(message.event, isStrictlyOrdered);
            } else {
                logger_1.default.debug("Message dropped for SID '" + sid + "', for which there is no subscription.");
            }
        }
    }, {
        key: "onConnectionStateChanged",
        value: function onConnectionStateChanged(isConnected) {
            this.isConnected = isConnected;
            if (isConnected) {
                this.poke('reconnect');
            }
        }
    }, {
        key: "onSubscriptionTtlElapsed",
        value: function onSubscriptionTtlElapsed() {
            if (this.isConnected) {
                this.poke('ttl');
            }
        }
        /**
         * Prompts a playback of any missed changes made to any subscribed object. This method
         * should be invoked whenever the connectivity layer has experienced cross-cutting
         * delivery failures that would affect the entire local sync set. Any tangible result
         * of this operation will result in calls to the _update() function of subscribed
         * Sync entities.
         */

    }, {
        key: "poke",
        value: function poke(reason) {
            logger_1.default.debug("Triggering event replay for all subscriptions, reason=" + reason);
            this.pendingPokeReason = reason;
            if (this.subscriptionTtlTimer) {
                clearTimeout(this.subscriptionTtlTimer);
                this.subscriptionTtlTimer = null;
            }
            var failedSubscriptions = [];
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = (0, _getIterator3.default)(this.persisted.values()), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var it = _step4.value;
                    // eslint-disable-line no-unused-vars
                    it.reset();
                    if (it.rejectedWithError) {
                        failedSubscriptions.push(it);
                    }
                }
            } catch (err) {
                _didIteratorError4 = true;
                _iteratorError4 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion4 && _iterator4.return) {
                        _iterator4.return();
                    }
                } finally {
                    if (_didIteratorError4) {
                        throw _iteratorError4;
                    }
                }
            }

            this.persisted.clear();
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = (0, _getIterator3.default)(failedSubscriptions), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var _it = _step5.value;

                    this.persisted.set(_it.sid, _it);
                }
            } catch (err) {
                _didIteratorError5 = true;
                _iteratorError5 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion5 && _iterator5.return) {
                        _iterator5.return();
                    }
                } finally {
                    if (_didIteratorError5) {
                        throw _iteratorError5;
                    }
                }
            }

            this.persist();
        }
        /**
         * Stops all communication, clears any subscription intent, and returns.
         */

    }, {
        key: "shutdown",
        value: function shutdown() {
            this.backoff.reset();
            this.subscriptions.clear();
        }
    }]);
    return Subscriptions;
}();

exports.Subscriptions = Subscriptions;

},{"./logger":8,"./syncerror":19,"babel-runtime/core-js/get-iterator":24,"babel-runtime/core-js/map":27,"babel-runtime/core-js/object/assign":28,"babel-runtime/helpers/asyncToGenerator":39,"babel-runtime/helpers/classCallCheck":40,"babel-runtime/helpers/createClass":41,"babel-runtime/helpers/slicedToArray":45,"babel-runtime/regenerator":48,"backoff":49,"twilsock":216}],17:[function(_dereq_,module,exports){
"use strict";

var _getPrototypeOf = _dereq_("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = _dereq_("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = _dereq_("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = _dereq_("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

Object.defineProperty(exports, "__esModule", { value: true });
var syncerror_1 = _dereq_("./syncerror");

var SyncNetworkError = function (_syncerror_1$SyncErro) {
    (0, _inherits3.default)(SyncNetworkError, _syncerror_1$SyncErro);

    function SyncNetworkError(message) {
        var status = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        var code = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
        var body = arguments[3];
        (0, _classCallCheck3.default)(this, SyncNetworkError);

        var _this = (0, _possibleConstructorReturn3.default)(this, (SyncNetworkError.__proto__ || (0, _getPrototypeOf2.default)(SyncNetworkError)).call(this, message, status, code));

        _this.body = body;
        return _this;
    }

    return SyncNetworkError;
}(syncerror_1.SyncError);

exports.SyncNetworkError = SyncNetworkError;
exports.default = SyncNetworkError;

},{"./syncerror":19,"babel-runtime/core-js/object/get-prototype-of":32,"babel-runtime/helpers/classCallCheck":40,"babel-runtime/helpers/inherits":43,"babel-runtime/helpers/possibleConstructorReturn":44}],18:[function(_dereq_,module,exports){
"use strict";

var _promise = _dereq_("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _assign = _dereq_("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

var _regenerator = _dereq_("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = _dereq_("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _getPrototypeOf = _dereq_("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = _dereq_("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = _dereq_("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = _dereq_("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = _dereq_("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

Object.defineProperty(exports, "__esModule", { value: true });
var logger_1 = _dereq_("./logger");
var entity_1 = _dereq_("./entity");
var utils_1 = _dereq_("./utils");
var mergingqueue_1 = _dereq_("./mergingqueue");
var syncerror_1 = _dereq_("./syncerror");
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

var SyncDocument = function (_entity_1$SyncEntity) {
    (0, _inherits3.default)(SyncDocument, _entity_1$SyncEntity);

    /**
     * @private
     */
    function SyncDocument(services, descriptor, removalHandler) {
        (0, _classCallCheck3.default)(this, SyncDocument);

        var _this = (0, _possibleConstructorReturn3.default)(this, (SyncDocument.__proto__ || (0, _getPrototypeOf2.default)(SyncDocument)).call(this, services, removalHandler));

        _this.isDeleted = false;
        var updateRequestReducer = function updateRequestReducer(acc, input) {
            return typeof input.ttl === 'number' ? { ttl: input.ttl } : acc;
        };
        _this.updateMergingQueue = new mergingqueue_1.MergingQueue(updateRequestReducer);
        _this.descriptor = descriptor;
        _this.descriptor.data = _this.descriptor.data || {};
        _this.descriptor.date_updated = new Date(_this.descriptor.date_updated);
        return _this;
    }
    // private props


    (0, _createClass3.default)(SyncDocument, [{
        key: "_update",

        /**
         * Update data entity with new data
         * @private
         */
        value: function _update(update) {
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
                    } else {
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

    }, {
        key: "set",
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(value, metadataUpdates) {
                var _this2 = this;

                var input;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                input = metadataUpdates || {};

                                utils_1.validateOptionalTtl(input.ttl);
                                return _context.abrupt("return", this.updateMergingQueue.squashAndAdd(input, function (input) {
                                    return _this2._setUnconditionally(value, input.ttl);
                                }));

                            case 3:
                            case "end":
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function set(_x, _x2) {
                return _ref.apply(this, arguments);
            }

            return set;
        }()
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

    }, {
        key: "mutate",
        value: function () {
            var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(mutator, metadataUpdates) {
                var _this3 = this;

                var input;
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                input = metadataUpdates || {};

                                utils_1.validateOptionalTtl(input.ttl);
                                return _context2.abrupt("return", this.updateMergingQueue.add(input, function (input) {
                                    return _this3._setWithIfMatch(mutator, input.ttl);
                                }));

                            case 3:
                            case "end":
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function mutate(_x3, _x4) {
                return _ref2.apply(this, arguments);
            }

            return mutate;
        }()
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

    }, {
        key: "update",
        value: function () {
            var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(obj, metadataUpdates) {
                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                return _context3.abrupt("return", this.mutate(function (remote) {
                                    return (0, _assign2.default)(remote, obj);
                                }, metadataUpdates));

                            case 1:
                            case "end":
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function update(_x5, _x6) {
                return _ref3.apply(this, arguments);
            }

            return update;
        }()
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

    }, {
        key: "setTtl",
        value: function () {
            var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(ttl) {
                var response;
                return _regenerator2.default.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                utils_1.validateMandatoryTtl(ttl);
                                _context4.next = 3;
                                return this._postUpdateToServer({ ttl: ttl });

                            case 3:
                                response = _context4.sent;

                                this.descriptor.date_expires = response.date_expires;

                            case 5:
                            case "end":
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            function setTtl(_x7) {
                return _ref4.apply(this, arguments);
            }

            return setTtl;
        }()
        /**
         * @private
         */

    }, {
        key: "_setUnconditionally",
        value: function () {
            var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(value, ttl) {
                var result;
                return _regenerator2.default.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                _context5.next = 2;
                                return this._postUpdateToServer({ data: value, revision: undefined, ttl: ttl });

                            case 2:
                                result = _context5.sent;

                                this._handleSuccessfulUpdateResult(result);
                                return _context5.abrupt("return", this.value);

                            case 5:
                            case "end":
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));

            function _setUnconditionally(_x8, _x9) {
                return _ref5.apply(this, arguments);
            }

            return _setUnconditionally;
        }()
        /**
         * @private
         */

    }, {
        key: "_setWithIfMatch",
        value: function () {
            var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(mutatorFunction, ttl) {
                var data, revision, result;
                return _regenerator2.default.wrap(function _callee6$(_context6) {
                    while (1) {
                        switch (_context6.prev = _context6.next) {
                            case 0:
                                data = mutatorFunction(utils_1.deepClone(this.value));

                                if (!data) {
                                    _context6.next = 22;
                                    break;
                                }

                                revision = this.revision;
                                _context6.prev = 3;
                                _context6.next = 6;
                                return this._postUpdateToServer({ data: data, revision: revision, ttl: ttl });

                            case 6:
                                result = _context6.sent;

                                this._handleSuccessfulUpdateResult(result);
                                return _context6.abrupt("return", this.value);

                            case 11:
                                _context6.prev = 11;
                                _context6.t0 = _context6["catch"](3);

                                if (!(_context6.t0.status === 412)) {
                                    _context6.next = 19;
                                    break;
                                }

                                _context6.next = 16;
                                return this._softSync();

                            case 16:
                                return _context6.abrupt("return", this._setWithIfMatch(mutatorFunction));

                            case 19:
                                throw _context6.t0;

                            case 20:
                                _context6.next = 23;
                                break;

                            case 22:
                                return _context6.abrupt("return", this.value);

                            case 23:
                            case "end":
                                return _context6.stop();
                        }
                    }
                }, _callee6, this, [[3, 11]]);
            }));

            function _setWithIfMatch(_x10, _x11) {
                return _ref6.apply(this, arguments);
            }

            return _setWithIfMatch;
        }()
        /**
         * @private
         */

    }, {
        key: "_handleSuccessfulUpdateResult",
        value: function _handleSuccessfulUpdateResult(result) {
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

    }, {
        key: "_postUpdateToServer",
        value: function () {
            var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7(request) {
                var requestBody, ifMatch, response;
                return _regenerator2.default.wrap(function _callee7$(_context7) {
                    while (1) {
                        switch (_context7.prev = _context7.next) {
                            case 0:
                                if (this.isDeleted) {
                                    _context7.next = 17;
                                    break;
                                }

                                requestBody = {
                                    data: request.data
                                };

                                if (typeof request.ttl === 'number') {
                                    requestBody.ttl = request.ttl;
                                }
                                ifMatch = request.revision;
                                _context7.prev = 4;
                                _context7.next = 7;
                                return this.services.network.post(this.uri, requestBody, ifMatch);

                            case 7:
                                response = _context7.sent;
                                return _context7.abrupt("return", {
                                    revision: response.body.revision,
                                    data: request.data,
                                    last_event_id: response.body.last_event_id,
                                    date_updated: response.body.date_updated,
                                    date_expires: response.body.date_expires
                                });

                            case 11:
                                _context7.prev = 11;
                                _context7.t0 = _context7["catch"](4);

                                if (_context7.t0.status === 404) {
                                    this.onRemoved(false);
                                }
                                throw _context7.t0;

                            case 15:
                                _context7.next = 18;
                                break;

                            case 17:
                                return _context7.abrupt("return", _promise2.default.reject(new syncerror_1.SyncError('The Document has been removed', 404, 54100)));

                            case 18:
                            case "end":
                                return _context7.stop();
                        }
                    }
                }, _callee7, this, [[4, 11]]);
            }));

            function _postUpdateToServer(_x12) {
                return _ref7.apply(this, arguments);
            }

            return _postUpdateToServer;
        }()
        /**
         * Get new data from server
         * @private
         */

    }, {
        key: "_softSync",
        value: function () {
            var _ref8 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8() {
                var _this4 = this;

                return _regenerator2.default.wrap(function _callee8$(_context8) {
                    while (1) {
                        switch (_context8.prev = _context8.next) {
                            case 0:
                                return _context8.abrupt("return", this.services.network.get(this.uri).then(function (response) {
                                    var event = {
                                        type: 'document_updated',
                                        id: response.body.last_event_id,
                                        document_revision: response.body.revision,
                                        document_data: response.body.data,
                                        date_created: response.body.date_updated // eslint-disable-line camelcase
                                    };
                                    _this4._update(event);
                                    return _this4;
                                }).catch(function (err) {
                                    if (err.status === 404) {
                                        _this4.onRemoved(false);
                                    } else {
                                        logger_1.default.error("Can't get updates for " + _this4.sid + ":", err);
                                    }
                                }));

                            case 1:
                            case "end":
                                return _context8.stop();
                        }
                    }
                }, _callee8, this);
            }));

            function _softSync() {
                return _ref8.apply(this, arguments);
            }

            return _softSync;
        }()
    }, {
        key: "onRemoved",
        value: function onRemoved(locally) {
            if (this.isDeleted) {
                return;
            } else {
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

    }, {
        key: "removeDocument",
        value: function () {
            var _ref9 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee9() {
                return _regenerator2.default.wrap(function _callee9$(_context9) {
                    while (1) {
                        switch (_context9.prev = _context9.next) {
                            case 0:
                                if (this.isDeleted) {
                                    _context9.next = 6;
                                    break;
                                }

                                _context9.next = 3;
                                return this.services.network.delete(this.uri);

                            case 3:
                                this.onRemoved(true);
                                _context9.next = 7;
                                break;

                            case 6:
                                return _context9.abrupt("return", _promise2.default.reject(new syncerror_1.SyncError('The Document has been removed', 404, 54100)));

                            case 7:
                            case "end":
                                return _context9.stop();
                        }
                    }
                }, _callee9, this);
            }));

            function removeDocument() {
                return _ref9.apply(this, arguments);
            }

            return removeDocument;
        }()
    }, {
        key: "uri",
        get: function get() {
            return this.descriptor.url;
        }
    }, {
        key: "revision",
        get: function get() {
            return this.descriptor.revision;
        }
    }, {
        key: "lastEventId",
        get: function get() {
            return this.descriptor.last_event_id;
        }
    }, {
        key: "dateExpires",
        get: function get() {
            return this.descriptor.date_expires;
        }
    }, {
        key: "type",
        get: function get() {
            return 'document';
        }
        // public props, documented along with class description

    }, {
        key: "sid",
        get: function get() {
            return this.descriptor.sid;
        }
    }, {
        key: "value",
        get: function get() {
            return this.descriptor.data;
        }
    }, {
        key: "dateUpdated",
        get: function get() {
            return this.descriptor.date_updated;
        }
    }, {
        key: "uniqueName",
        get: function get() {
            return this.descriptor.unique_name || null;
        }
    }], [{
        key: "type",
        get: function get() {
            return 'document';
        }
    }]);
    return SyncDocument;
}(entity_1.SyncEntity);

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

},{"./entity":6,"./logger":8,"./mergingqueue":10,"./syncerror":19,"./utils":22,"babel-runtime/core-js/object/assign":28,"babel-runtime/core-js/object/get-prototype-of":32,"babel-runtime/core-js/promise":34,"babel-runtime/helpers/asyncToGenerator":39,"babel-runtime/helpers/classCallCheck":40,"babel-runtime/helpers/createClass":41,"babel-runtime/helpers/inherits":43,"babel-runtime/helpers/possibleConstructorReturn":44,"babel-runtime/regenerator":48}],19:[function(_dereq_,module,exports){
"use strict";

var _create = _dereq_("babel-runtime/core-js/object/create");

var _create2 = _interopRequireDefault(_create);

var _setPrototypeOf = _dereq_("babel-runtime/core-js/object/set-prototype-of");

var _setPrototypeOf2 = _interopRequireDefault(_setPrototypeOf);

var _from = _dereq_("babel-runtime/core-js/array/from");

var _from2 = _interopRequireDefault(_from);

var _construct = _dereq_("babel-runtime/core-js/reflect/construct");

var _construct2 = _interopRequireDefault(_construct);

var _getPrototypeOf = _dereq_("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = _dereq_("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = _dereq_("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = _dereq_("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

function _extendableBuiltin(cls) {
    function ExtendableBuiltin() {
        var instance = (0, _construct2.default)(cls, (0, _from2.default)(arguments));
        (0, _setPrototypeOf2.default)(instance, (0, _getPrototypeOf2.default)(this));
        return instance;
    }

    ExtendableBuiltin.prototype = (0, _create2.default)(cls.prototype, {
        constructor: {
            value: cls,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });

    if (_setPrototypeOf2.default) {
        (0, _setPrototypeOf2.default)(ExtendableBuiltin, cls);
    } else {
        ExtendableBuiltin.__proto__ = cls;
    }

    return ExtendableBuiltin;
}

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Generic SyncLibrary error class
 */

var SyncError = function (_extendableBuiltin2) {
    (0, _inherits3.default)(SyncError, _extendableBuiltin2);

    function SyncError(message) {
        var status = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        var code = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
        (0, _classCallCheck3.default)(this, SyncError);

        var _this = (0, _possibleConstructorReturn3.default)(this, (SyncError.__proto__ || (0, _getPrototypeOf2.default)(SyncError)).call(this));

        _this.name = _this.constructor.name;
        _this.message = message + " (status: " + status + ", code: " + code + ")";
        _this.status = status;
        _this.code = code;
        return _this;
    }

    return SyncError;
}(_extendableBuiltin(Error));

exports.SyncError = SyncError;
exports.default = SyncError;

},{"babel-runtime/core-js/array/from":23,"babel-runtime/core-js/object/create":29,"babel-runtime/core-js/object/get-prototype-of":32,"babel-runtime/core-js/object/set-prototype-of":33,"babel-runtime/core-js/reflect/construct":35,"babel-runtime/helpers/classCallCheck":40,"babel-runtime/helpers/inherits":43,"babel-runtime/helpers/possibleConstructorReturn":44}],20:[function(_dereq_,module,exports){
"use strict";

var _assign = _dereq_("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

var _regenerator = _dereq_("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = _dereq_("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _getPrototypeOf = _dereq_("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = _dereq_("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = _dereq_("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = _dereq_("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = _dereq_("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = _dereq_("./utils");
var logger_1 = _dereq_("./logger");
var entity_1 = _dereq_("./entity");
var listitem_1 = _dereq_("./listitem");
var paginator_1 = _dereq_("./paginator");
var cache_1 = _dereq_("./cache");
var mergingqueue_1 = _dereq_("./mergingqueue");
var syncerror_1 = _dereq_("./syncerror");
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

var SyncList = function (_entity_1$SyncEntity) {
    (0, _inherits3.default)(SyncList, _entity_1$SyncEntity);

    /**
     * @private
     */
    function SyncList(services, descriptor, removalHandler) {
        (0, _classCallCheck3.default)(this, SyncList);

        var _this = (0, _possibleConstructorReturn3.default)(this, (SyncList.__proto__ || (0, _getPrototypeOf2.default)(SyncList)).call(this, services, removalHandler));

        var updateRequestReducer = function updateRequestReducer(acc, input) {
            return typeof input.ttl === 'number' ? { ttl: input.ttl } : acc;
        };
        _this.updateMergingQueue = new mergingqueue_1.NamespacedMergingQueue(updateRequestReducer);
        _this.cache = new cache_1.Cache();
        _this.descriptor = descriptor;
        _this.descriptor.date_updated = new Date(_this.descriptor.date_updated);
        return _this;
    }
    // private props


    (0, _createClass3.default)(SyncList, [{
        key: "_addOrUpdateItemOnServer",
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(url, data, ifMatch, ttl) {
                var requestBody, response;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                requestBody = { data: data };

                                if (typeof ttl === 'number') {
                                    requestBody.ttl = ttl;
                                }
                                _context.next = 4;
                                return this.services.network.post(url, requestBody, ifMatch);

                            case 4:
                                response = _context.sent;

                                response.body.data = data;
                                response.body.date_updated = new Date(response.body.date_updated);
                                return _context.abrupt("return", response.body);

                            case 8:
                            case "end":
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function _addOrUpdateItemOnServer(_x, _x2, _x3, _x4) {
                return _ref.apply(this, arguments);
            }

            return _addOrUpdateItemOnServer;
        }()
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

    }, {
        key: "push",
        value: function () {
            var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(value, itemMetadata) {
                var ttl, item, index;
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                ttl = (itemMetadata || {}).ttl;

                                utils_1.validateOptionalTtl(ttl);
                                _context2.next = 4;
                                return this._addOrUpdateItemOnServer(this.links.items, value, undefined, ttl);

                            case 4:
                                item = _context2.sent;
                                index = Number(item.index);

                                this._handleItemMutated(index, item.url, item.last_event_id, item.revision, value, item.date_updated, item.date_expires, true, false);
                                return _context2.abrupt("return", this.cache.get(index));

                            case 8:
                            case "end":
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function push(_x5, _x6) {
                return _ref2.apply(this, arguments);
            }

            return push;
        }()
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

    }, {
        key: "set",
        value: function set(index, value, itemMetadataUpdates) {
            var _this2 = this;

            var input = itemMetadataUpdates || {};
            utils_1.validateOptionalTtl(input.ttl);
            return this.updateMergingQueue.squashAndAdd(index, input, function (input) {
                return _this2._updateItemUnconditionally(index, value, input.ttl);
            });
        }
    }, {
        key: "_updateItemUnconditionally",
        value: function () {
            var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(index, data, ttl) {
                var existingItem, itemDescriptor;
                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                _context3.next = 2;
                                return this.get(index);

                            case 2:
                                existingItem = _context3.sent;
                                _context3.next = 5;
                                return this._addOrUpdateItemOnServer(existingItem.uri, data, undefined, ttl);

                            case 5:
                                itemDescriptor = _context3.sent;

                                this._handleItemMutated(index, itemDescriptor.url, itemDescriptor.last_event_id, itemDescriptor.revision, itemDescriptor.data, itemDescriptor.date_updated, itemDescriptor.date_expires, false, false);
                                return _context3.abrupt("return", this.cache.get(index));

                            case 8:
                            case "end":
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function _updateItemUnconditionally(_x7, _x8, _x9) {
                return _ref3.apply(this, arguments);
            }

            return _updateItemUnconditionally;
        }()
    }, {
        key: "_updateItemWithIfMatch",
        value: function () {
            var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(index, mutatorFunction, ttl) {
                var existingItem, data, ifMatch, itemDescriptor;
                return _regenerator2.default.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                _context4.next = 2;
                                return this.get(index);

                            case 2:
                                existingItem = _context4.sent;
                                data = mutatorFunction(utils_1.deepClone(existingItem.value));

                                if (!data) {
                                    _context4.next = 25;
                                    break;
                                }

                                ifMatch = existingItem.revision;
                                _context4.prev = 6;
                                _context4.next = 9;
                                return this._addOrUpdateItemOnServer(existingItem.uri, data, ifMatch, ttl);

                            case 9:
                                itemDescriptor = _context4.sent;

                                this._handleItemMutated(index, itemDescriptor.url, itemDescriptor.last_event_id, itemDescriptor.revision, itemDescriptor.data, itemDescriptor.date_updated, itemDescriptor.date_expires, false, false);
                                return _context4.abrupt("return", this.cache.get(index));

                            case 14:
                                _context4.prev = 14;
                                _context4.t0 = _context4["catch"](6);

                                if (!(_context4.t0.status === 412)) {
                                    _context4.next = 22;
                                    break;
                                }

                                _context4.next = 19;
                                return this._getItemFromServer(index);

                            case 19:
                                return _context4.abrupt("return", this._updateItemWithIfMatch(index, mutatorFunction, ttl));

                            case 22:
                                throw _context4.t0;

                            case 23:
                                _context4.next = 26;
                                break;

                            case 25:
                                return _context4.abrupt("return", existingItem);

                            case 26:
                            case "end":
                                return _context4.stop();
                        }
                    }
                }, _callee4, this, [[6, 14]]);
            }));

            function _updateItemWithIfMatch(_x10, _x11, _x12) {
                return _ref4.apply(this, arguments);
            }

            return _updateItemWithIfMatch;
        }()
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

    }, {
        key: "mutate",
        value: function () {
            var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(index, mutator, itemMetadataUpdates) {
                var _this3 = this;

                var input;
                return _regenerator2.default.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                input = itemMetadataUpdates || {};

                                utils_1.validateOptionalTtl(input.ttl);
                                return _context5.abrupt("return", this.updateMergingQueue.add(index, input, function (input) {
                                    return _this3._updateItemWithIfMatch(index, mutator, input.ttl);
                                }));

                            case 3:
                            case "end":
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));

            function mutate(_x13, _x14, _x15) {
                return _ref5.apply(this, arguments);
            }

            return mutate;
        }()
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

    }, {
        key: "update",
        value: function () {
            var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(index, obj, itemMetadataUpdates) {
                return _regenerator2.default.wrap(function _callee6$(_context6) {
                    while (1) {
                        switch (_context6.prev = _context6.next) {
                            case 0:
                                return _context6.abrupt("return", this.mutate(index, function (remote) {
                                    return (0, _assign2.default)(remote, obj);
                                }, itemMetadataUpdates));

                            case 1:
                            case "end":
                                return _context6.stop();
                        }
                    }
                }, _callee6, this);
            }));

            function update(_x16, _x17, _x18) {
                return _ref6.apply(this, arguments);
            }

            return update;
        }()
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

    }, {
        key: "remove",
        value: function () {
            var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7(index) {
                var item, response;
                return _regenerator2.default.wrap(function _callee7$(_context7) {
                    while (1) {
                        switch (_context7.prev = _context7.next) {
                            case 0:
                                _context7.next = 2;
                                return this.get(index);

                            case 2:
                                item = _context7.sent;
                                _context7.next = 5;
                                return this.services.network.delete(item.uri);

                            case 5:
                                response = _context7.sent;

                                this._handleItemRemoved(index, response.body.last_event_id, undefined, new Date(response.body.date_updated), false);

                            case 7:
                            case "end":
                                return _context7.stop();
                        }
                    }
                }, _callee7, this);
            }));

            function remove(_x19) {
                return _ref7.apply(this, arguments);
            }

            return remove;
        }()
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

    }, {
        key: "get",
        value: function () {
            var _ref8 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8(index) {
                var cachedItem;
                return _regenerator2.default.wrap(function _callee8$(_context8) {
                    while (1) {
                        switch (_context8.prev = _context8.next) {
                            case 0:
                                cachedItem = this.cache.get(index);

                                if (!cachedItem) {
                                    _context8.next = 5;
                                    break;
                                }

                                return _context8.abrupt("return", cachedItem);

                            case 5:
                                return _context8.abrupt("return", this._getItemFromServer(index));

                            case 6:
                            case "end":
                                return _context8.stop();
                        }
                    }
                }, _callee8, this);
            }));

            function get(_x20) {
                return _ref8.apply(this, arguments);
            }

            return get;
        }()
    }, {
        key: "_getItemFromServer",
        value: function () {
            var _ref9 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee9(index) {
                var result;
                return _regenerator2.default.wrap(function _callee9$(_context9) {
                    while (1) {
                        switch (_context9.prev = _context9.next) {
                            case 0:
                                _context9.next = 2;
                                return this.queryItems({ index: index });

                            case 2:
                                result = _context9.sent;

                                if (!(result.items.length < 1)) {
                                    _context9.next = 7;
                                    break;
                                }

                                throw new syncerror_1.SyncError("No item with index " + index + " found", 404, 54151);

                            case 7:
                                return _context9.abrupt("return", result.items[0]);

                            case 8:
                            case "end":
                                return _context9.stop();
                        }
                    }
                }, _callee9, this);
            }));

            function _getItemFromServer(_x21) {
                return _ref9.apply(this, arguments);
            }

            return _getItemFromServer;
        }()
        /**
         * Query items from the List
         * @private
         */

    }, {
        key: "queryItems",
        value: function () {
            var _ref10 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee10(arg) {
                var _this4 = this;

                var url, response, items, meta;
                return _regenerator2.default.wrap(function _callee10$(_context10) {
                    while (1) {
                        switch (_context10.prev = _context10.next) {
                            case 0:
                                arg = arg || {};
                                url = new utils_1.UriBuilder(this.links.items).queryParam('From', arg.from).queryParam('PageSize', arg.limit).queryParam('Index', arg.index).queryParam('PageToken', arg.pageToken).queryParam('Order', arg.order).build();
                                _context10.next = 4;
                                return this.services.network.get(url);

                            case 4:
                                response = _context10.sent;
                                items = response.body.items.map(function (el) {
                                    el.date_updated = new Date(el.date_updated);
                                    var itemInCache = _this4.cache.get(el.index);
                                    if (itemInCache) {
                                        _this4._handleItemMutated(el.index, el.url, el.last_event_id, el.revision, el.data, el.date_updated, el.date_expires, false, true);
                                    } else {
                                        _this4.cache.store(Number(el.index), new listitem_1.ListItem({ index: Number(el.index),
                                            uri: el.url,
                                            revision: el.revision,
                                            lastEventId: el.last_event_id,
                                            dateUpdated: el.date_updated,
                                            dateExpires: el.date_expires,
                                            value: el.data }), el.last_event_id);
                                    }
                                    return _this4.cache.get(el.index);
                                });
                                meta = response.body.meta;
                                return _context10.abrupt("return", new paginator_1.Paginator(items, function (pageToken) {
                                    return _this4.queryItems({ pageToken: pageToken });
                                }, meta.previous_token, meta.next_token));

                            case 8:
                            case "end":
                                return _context10.stop();
                        }
                    }
                }, _callee10, this);
            }));

            function queryItems(_x22) {
                return _ref10.apply(this, arguments);
            }

            return queryItems;
        }()
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

    }, {
        key: "getItems",
        value: function () {
            var _ref11 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee11(args) {
                return _regenerator2.default.wrap(function _callee11$(_context11) {
                    while (1) {
                        switch (_context11.prev = _context11.next) {
                            case 0:
                                args = args || {};
                                utils_1.validatePageSize(args.pageSize);
                                args.limit = args.pageSize || args.limit || 50;
                                args.order = args.order || 'asc';
                                return _context11.abrupt("return", this.queryItems(args));

                            case 5:
                            case "end":
                                return _context11.stop();
                        }
                    }
                }, _callee11, this);
            }));

            function getItems(_x23) {
                return _ref11.apply(this, arguments);
            }

            return getItems;
        }()
        /**
         * @return {Promise<Object>} Context of List
         * @private
         */

    }, {
        key: "getContext",
        value: function () {
            var _ref12 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee12() {
                var response;
                return _regenerator2.default.wrap(function _callee12$(_context12) {
                    while (1) {
                        switch (_context12.prev = _context12.next) {
                            case 0:
                                if (this.context) {
                                    _context12.next = 5;
                                    break;
                                }

                                _context12.next = 3;
                                return this.services.network.get(this.links.context);

                            case 3:
                                response = _context12.sent;

                                // store fetched context if we have't received any newer update
                                this._updateContextIfRequired(response.body.data, response.body.last_event_id);

                            case 5:
                                return _context12.abrupt("return", this.context);

                            case 6:
                            case "end":
                                return _context12.stop();
                        }
                    }
                }, _callee12, this);
            }));

            function getContext() {
                return _ref12.apply(this, arguments);
            }

            return getContext;
        }()
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

    }, {
        key: "setTtl",
        value: function () {
            var _ref13 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee13(ttl) {
                var requestBody, response;
                return _regenerator2.default.wrap(function _callee13$(_context13) {
                    while (1) {
                        switch (_context13.prev = _context13.next) {
                            case 0:
                                utils_1.validateMandatoryTtl(ttl);
                                _context13.prev = 1;
                                requestBody = { ttl: ttl };
                                _context13.next = 5;
                                return this.services.network.post(this.uri, requestBody);

                            case 5:
                                response = _context13.sent;

                                this.descriptor.date_expires = response.body.date_expires;
                                _context13.next = 13;
                                break;

                            case 9:
                                _context13.prev = 9;
                                _context13.t0 = _context13["catch"](1);

                                if (_context13.t0.status === 404) {
                                    this.onRemoved(false);
                                }
                                throw _context13.t0;

                            case 13:
                            case "end":
                                return _context13.stop();
                        }
                    }
                }, _callee13, this, [[1, 9]]);
            }));

            function setTtl(_x24) {
                return _ref13.apply(this, arguments);
            }

            return setTtl;
        }()
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

    }, {
        key: "setItemTtl",
        value: function () {
            var _ref14 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee14(index, ttl) {
                var existingItem, requestBody, response;
                return _regenerator2.default.wrap(function _callee14$(_context14) {
                    while (1) {
                        switch (_context14.prev = _context14.next) {
                            case 0:
                                utils_1.validateMandatoryTtl(ttl);
                                _context14.next = 3;
                                return this.get(index);

                            case 3:
                                existingItem = _context14.sent;
                                requestBody = { ttl: ttl };
                                _context14.next = 7;
                                return this.services.network.post(existingItem.uri, requestBody);

                            case 7:
                                response = _context14.sent;

                                existingItem.updateDateExpires(response.body.date_expires);

                            case 9:
                            case "end":
                                return _context14.stop();
                        }
                    }
                }, _callee14, this);
            }));

            function setItemTtl(_x25, _x26) {
                return _ref14.apply(this, arguments);
            }

            return setItemTtl;
        }()
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

    }, {
        key: "removeList",
        value: function () {
            var _ref15 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee15() {
                return _regenerator2.default.wrap(function _callee15$(_context15) {
                    while (1) {
                        switch (_context15.prev = _context15.next) {
                            case 0:
                                _context15.next = 2;
                                return this.services.network.delete(this.uri);

                            case 2:
                                this.onRemoved(true);

                            case 3:
                            case "end":
                                return _context15.stop();
                        }
                    }
                }, _callee15, this);
            }));

            function removeList() {
                return _ref15.apply(this, arguments);
            }

            return removeList;
        }()
    }, {
        key: "onRemoved",
        value: function onRemoved(locally) {
            this._unsubscribe();
            this.removalHandler(this.type, this.sid, this.uniqueName);
            this.emit('removed', { isLocal: locally });
        }
    }, {
        key: "shouldIgnoreEvent",
        value: function shouldIgnoreEvent(key, eventId) {
            return this.cache.isKnown(key, eventId);
        }
        /**
         * Handle update, which came from the server.
         * @private
         */

    }, {
        key: "_update",
        value: function _update(update, isStrictlyOrdered) {
            var itemIndex = Number(update.item_index);
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
    }, {
        key: "_advanceLastEventId",
        value: function _advanceLastEventId(eventId, revision) {
            if (this.lastEventId < eventId) {
                this.descriptor.last_event_id = eventId;
                if (revision) {
                    this.descriptor.revision = revision;
                }
            }
        }
    }, {
        key: "_updateRootDateUpdated",
        value: function _updateRootDateUpdated(dateUpdated) {
            if (!this.descriptor.date_updated || dateUpdated.getTime() > this.descriptor.date_updated.getTime()) {
                this.descriptor.date_updated = dateUpdated;
                this.services.storage.update(this.type, this.sid, this.uniqueName, { date_updated: dateUpdated });
            }
        }
    }, {
        key: "_handleItemMutated",
        value: function _handleItemMutated(index, uri, lastEventId, revision, value, dateUpdated, dateExpires, added, remote) {
            if (this.shouldIgnoreEvent(index, lastEventId)) {
                logger_1.default.trace('Item ', index, ' update skipped, current:', this.lastEventId, ', remote:', lastEventId);
                return;
            } else {
                this._updateRootDateUpdated(dateUpdated);
                var item = this.cache.get(index);
                if (!item) {
                    var _item = new listitem_1.ListItem({ index: index, uri: uri, lastEventId: lastEventId, revision: revision, value: value, dateUpdated: dateUpdated, dateExpires: dateExpires });
                    this.cache.store(index, _item, lastEventId);
                    this.emitItemMutationEvent(_item, remote, added);
                } else if (item.lastEventId < lastEventId) {
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

    }, {
        key: "emitItemMutationEvent",
        value: function emitItemMutationEvent(item, remote, added) {
            var eventName = added ? 'itemAdded' : 'itemUpdated';
            this.emit(eventName, { item: item, isLocal: !remote });
        }
        /**
         * @private
         */

    }, {
        key: "_handleItemRemoved",
        value: function _handleItemRemoved(index, eventId, oldData, dateUpdated, remote) {
            this._updateRootDateUpdated(dateUpdated);
            this.cache.delete(index, eventId);
            this.emit('itemRemoved', { index: index, isLocal: !remote, value: oldData });
        }
        /**
         * @private
         */

    }, {
        key: "_handleContextUpdate",
        value: function _handleContextUpdate(data, eventId, dateUpdated) {
            this._updateRootDateUpdated(dateUpdated);
            if (this._updateContextIfRequired(data, eventId)) {
                this.emit('contextUpdated', { context: data, isLocal: false });
            }
        }
        /**
         * @private
         */

    }, {
        key: "_updateContextIfRequired",
        value: function _updateContextIfRequired(data, eventId) {
            if (!this.contextEventId || eventId > this.contextEventId) {
                this.context = data;
                this.contextEventId = eventId;
                return true;
            } else {
                logger_1.default.trace('Context update skipped, current:', this.lastEventId, ', remote:', eventId);
                return false;
            }
        }
    }, {
        key: "uri",
        get: function get() {
            return this.descriptor.url;
        }
    }, {
        key: "revision",
        get: function get() {
            return this.descriptor.revision;
        }
    }, {
        key: "lastEventId",
        get: function get() {
            return this.descriptor.last_event_id;
        }
    }, {
        key: "links",
        get: function get() {
            return this.descriptor.links;
        }
    }, {
        key: "dateExpires",
        get: function get() {
            return this.descriptor.date_expires;
        }
    }, {
        key: "type",
        get: function get() {
            return 'list';
        }
        // public props, documented along with class description

    }, {
        key: "sid",
        get: function get() {
            return this.descriptor.sid;
        }
    }, {
        key: "uniqueName",
        get: function get() {
            return this.descriptor.unique_name || null;
        }
    }, {
        key: "dateUpdated",
        get: function get() {
            return this.descriptor.date_updated;
        }
    }], [{
        key: "type",
        get: function get() {
            return 'list';
        }
    }]);
    return SyncList;
}(entity_1.SyncEntity);

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

},{"./cache":1,"./entity":6,"./listitem":7,"./logger":8,"./mergingqueue":10,"./paginator":12,"./syncerror":19,"./utils":22,"babel-runtime/core-js/object/assign":28,"babel-runtime/core-js/object/get-prototype-of":32,"babel-runtime/helpers/asyncToGenerator":39,"babel-runtime/helpers/classCallCheck":40,"babel-runtime/helpers/createClass":41,"babel-runtime/helpers/inherits":43,"babel-runtime/helpers/possibleConstructorReturn":44,"babel-runtime/regenerator":48}],21:[function(_dereq_,module,exports){
"use strict";

var _promise = _dereq_("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _assign = _dereq_("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

var _regenerator = _dereq_("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = _dereq_("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _getPrototypeOf = _dereq_("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = _dereq_("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = _dereq_("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = _dereq_("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = _dereq_("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = _dereq_("./utils");
var logger_1 = _dereq_("./logger");
var entity_1 = _dereq_("./entity");
var mapitem_1 = _dereq_("./mapitem");
var paginator_1 = _dereq_("./paginator");
var cache_1 = _dereq_("./cache");
var mergingqueue_1 = _dereq_("./mergingqueue");
var syncerror_1 = _dereq_("./syncerror");
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

var SyncMap = function (_entity_1$SyncEntity) {
    (0, _inherits3.default)(SyncMap, _entity_1$SyncEntity);

    /**
     * @private
     */
    function SyncMap(services, descriptor, removalHandler) {
        (0, _classCallCheck3.default)(this, SyncMap);

        var _this = (0, _possibleConstructorReturn3.default)(this, (SyncMap.__proto__ || (0, _getPrototypeOf2.default)(SyncMap)).call(this, services, removalHandler));

        var updateRequestReducer = function updateRequestReducer(acc, input) {
            return typeof input.ttl === 'number' ? { ttl: input.ttl } : acc;
        };
        _this.updateMergingQueue = new mergingqueue_1.NamespacedMergingQueue(updateRequestReducer);
        _this.cache = new cache_1.Cache();
        _this.descriptor = descriptor;
        _this.descriptor.date_updated = new Date(_this.descriptor.date_updated);
        if (descriptor.items) {
            descriptor.items.forEach(function (itemDescriptor) {
                itemDescriptor.date_updated = new Date(itemDescriptor.date_updated);
                _this.cache.store(itemDescriptor.key, new mapitem_1.MapItem(itemDescriptor), itemDescriptor.last_event_id);
            });
        }
        return _this;
    }
    // private props


    (0, _createClass3.default)(SyncMap, [{
        key: "set",

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
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(key, value, itemMetadataUpdates) {
                var _this2 = this;

                var input;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                input = itemMetadataUpdates || {};

                                utils_1.validateOptionalTtl(input.ttl);
                                return _context.abrupt("return", this.updateMergingQueue.squashAndAdd(key, input, function (input) {
                                    return _this2._putItemUnconditionally(key, value, input.ttl);
                                }));

                            case 3:
                            case "end":
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function set(_x, _x2, _x3) {
                return _ref.apply(this, arguments);
            }

            return set;
        }()
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

    }, {
        key: "get",
        value: function () {
            var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(key) {
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                if (!this.cache.has(key)) {
                                    _context2.next = 4;
                                    break;
                                }

                                return _context2.abrupt("return", this.cache.get(key));

                            case 4:
                                return _context2.abrupt("return", this._getItemFromServer(key));

                            case 5:
                            case "end":
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function get(_x4) {
                return _ref2.apply(this, arguments);
            }

            return get;
        }()
    }, {
        key: "_getItemFromServer",
        value: function () {
            var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(key) {
                var result;
                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                _context3.next = 2;
                                return this.queryItems({ key: key });

                            case 2:
                                result = _context3.sent;

                                if (!(result.items.length < 1)) {
                                    _context3.next = 7;
                                    break;
                                }

                                throw new syncerror_1.SyncError("No item with key " + key + " found", 404, 54201);

                            case 7:
                                return _context3.abrupt("return", result.items[0]);

                            case 8:
                            case "end":
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function _getItemFromServer(_x5) {
                return _ref3.apply(this, arguments);
            }

            return _getItemFromServer;
        }()
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

    }, {
        key: "mutate",
        value: function () {
            var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(key, mutator, itemMetadataUpdates) {
                var _this3 = this;

                var input;
                return _regenerator2.default.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                input = itemMetadataUpdates || {};

                                utils_1.validateOptionalTtl(input.ttl);
                                return _context4.abrupt("return", this.updateMergingQueue.add(key, input, function (input) {
                                    return _this3._putItemWithIfMatch(key, mutator, input.ttl);
                                }));

                            case 3:
                            case "end":
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            function mutate(_x6, _x7, _x8) {
                return _ref4.apply(this, arguments);
            }

            return mutate;
        }()
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

    }, {
        key: "update",
        value: function () {
            var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(key, obj, itemMetadataUpdates) {
                return _regenerator2.default.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                return _context5.abrupt("return", this.mutate(key, function (remote) {
                                    return (0, _assign2.default)(remote, obj);
                                }, itemMetadataUpdates));

                            case 1:
                            case "end":
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));

            function update(_x9, _x10, _x11) {
                return _ref5.apply(this, arguments);
            }

            return update;
        }()
    }, {
        key: "_putItemUnconditionally",
        value: function () {
            var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(key, data, ttl) {
                var result, item;
                return _regenerator2.default.wrap(function _callee6$(_context6) {
                    while (1) {
                        switch (_context6.prev = _context6.next) {
                            case 0:
                                _context6.next = 2;
                                return this._putItemToServer(key, data, undefined, ttl);

                            case 2:
                                result = _context6.sent;
                                item = result.item;

                                this._handleItemMutated(item.key, item.url, item.last_event_id, item.revision, item.data, item.date_updated, item.date_expires, result.added, false);
                                return _context6.abrupt("return", this.cache.get(item.key));

                            case 6:
                            case "end":
                                return _context6.stop();
                        }
                    }
                }, _callee6, this);
            }));

            function _putItemUnconditionally(_x12, _x13, _x14) {
                return _ref6.apply(this, arguments);
            }

            return _putItemUnconditionally;
        }()
    }, {
        key: "_putItemWithIfMatch",
        value: function () {
            var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7(key, mutatorFunction, ttl) {
                var currentItem, data, ifMatch, result, item;
                return _regenerator2.default.wrap(function _callee7$(_context7) {
                    while (1) {
                        switch (_context7.prev = _context7.next) {
                            case 0:
                                _context7.next = 2;
                                return this.get(key).catch(function (error) {
                                    if (error.status === 404) {
                                        // PUT /Items/myKey with `If-Match: -1` acts as "put if not exists"
                                        return new mapitem_1.MapItem({ key: key, data: {}, last_event_id: -1, revision: '-1', url: null, date_updated: null, date_expires: null });
                                    } else {
                                        throw error;
                                    }
                                });

                            case 2:
                                currentItem = _context7.sent;
                                data = mutatorFunction(utils_1.deepClone(currentItem.value));

                                if (!data) {
                                    _context7.next = 26;
                                    break;
                                }

                                ifMatch = currentItem.revision;
                                _context7.prev = 6;
                                _context7.next = 9;
                                return this._putItemToServer(key, data, ifMatch, ttl);

                            case 9:
                                result = _context7.sent;
                                item = result.item;

                                this._handleItemMutated(item.key, item.url, item.last_event_id, item.revision, item.data, item.date_updated, item.date_expires, result.added, false);
                                return _context7.abrupt("return", this.cache.get(item.key));

                            case 15:
                                _context7.prev = 15;
                                _context7.t0 = _context7["catch"](6);

                                if (!(_context7.t0.status === 412)) {
                                    _context7.next = 23;
                                    break;
                                }

                                _context7.next = 20;
                                return this._getItemFromServer(key);

                            case 20:
                                return _context7.abrupt("return", this._putItemWithIfMatch(key, mutatorFunction, ttl));

                            case 23:
                                throw _context7.t0;

                            case 24:
                                _context7.next = 27;
                                break;

                            case 26:
                                return _context7.abrupt("return", currentItem);

                            case 27:
                            case "end":
                                return _context7.stop();
                        }
                    }
                }, _callee7, this, [[6, 15]]);
            }));

            function _putItemWithIfMatch(_x15, _x16, _x17) {
                return _ref7.apply(this, arguments);
            }

            return _putItemWithIfMatch;
        }()
    }, {
        key: "_putItemToServer",
        value: function () {
            var _ref8 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8(key, data, ifMatch, ttl) {
                var url, requestBody, response, mapItemDescriptor, added;
                return _regenerator2.default.wrap(function _callee8$(_context8) {
                    while (1) {
                        switch (_context8.prev = _context8.next) {
                            case 0:
                                url = new utils_1.UriBuilder(this.links.items).pathSegment(key).build();
                                requestBody = { data: data };

                                if (typeof ttl === 'number') {
                                    requestBody.ttl = ttl;
                                }
                                _context8.prev = 3;
                                _context8.next = 6;
                                return this.services.network.put(url, requestBody, ifMatch);

                            case 6:
                                response = _context8.sent;
                                mapItemDescriptor = response.body;

                                mapItemDescriptor.data = data; // The server does not return the data in the response
                                mapItemDescriptor.date_updated = new Date(mapItemDescriptor.date_updated);
                                added = response.status.code === 201;
                                return _context8.abrupt("return", { added: added, item: mapItemDescriptor });

                            case 14:
                                _context8.prev = 14;
                                _context8.t0 = _context8["catch"](3);

                                if (_context8.t0.status === 404) {
                                    this.onRemoved(false);
                                }
                                throw _context8.t0;

                            case 18:
                            case "end":
                                return _context8.stop();
                        }
                    }
                }, _callee8, this, [[3, 14]]);
            }));

            function _putItemToServer(_x18, _x19, _x20, _x21) {
                return _ref8.apply(this, arguments);
            }

            return _putItemToServer;
        }()
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

    }, {
        key: "remove",
        value: function () {
            var _ref9 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee9(key) {
                var item, response;
                return _regenerator2.default.wrap(function _callee9$(_context9) {
                    while (1) {
                        switch (_context9.prev = _context9.next) {
                            case 0:
                                if (!(typeof key === 'undefined')) {
                                    _context9.next = 2;
                                    break;
                                }

                                throw new Error('Key argument is invalid');

                            case 2:
                                _context9.next = 4;
                                return this.get(key);

                            case 4:
                                item = _context9.sent;
                                _context9.next = 7;
                                return this.services.network.delete(item.uri);

                            case 7:
                                response = _context9.sent;

                                this._handleItemRemoved(key, response.body.last_event_id, undefined, new Date(response.body.date_updated), false);

                            case 9:
                            case "end":
                                return _context9.stop();
                        }
                    }
                }, _callee9, this);
            }));

            function remove(_x22) {
                return _ref9.apply(this, arguments);
            }

            return remove;
        }()
        /**
         * @private
         */

    }, {
        key: "queryItems",
        value: function () {
            var _ref10 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee10(args) {
                var _this4 = this;

                var uri, response, items, meta;
                return _regenerator2.default.wrap(function _callee10$(_context10) {
                    while (1) {
                        switch (_context10.prev = _context10.next) {
                            case 0:
                                args = args || {};
                                uri = new utils_1.UriBuilder(this.links.items).queryParam('From', args.from).queryParam('PageSize', args.limit).queryParam('Key', args.key).queryParam('PageToken', args.pageToken).queryParam('Order', args.order).build();
                                _context10.next = 4;
                                return this.services.network.get(uri);

                            case 4:
                                response = _context10.sent;
                                items = response.body.items.map(function (el) {
                                    el.date_updated = new Date(el.date_updated);
                                    var itemInCache = _this4.cache.get(el.key);
                                    if (itemInCache) {
                                        _this4._handleItemMutated(el.key, el.url, el.last_event_id, el.revision, el.data, el.date_updated, el.date_expires, false, true);
                                    } else {
                                        _this4.cache.store(el.key, new mapitem_1.MapItem(el), el.last_event_id);
                                    }
                                    return _this4.cache.get(el.key);
                                });
                                meta = response.body.meta;
                                return _context10.abrupt("return", new paginator_1.Paginator(items, function (pageToken) {
                                    return _this4.queryItems({ pageToken: pageToken });
                                }, meta.previous_token, meta.next_token));

                            case 8:
                            case "end":
                                return _context10.stop();
                        }
                    }
                }, _callee10, this);
            }));

            function queryItems(_x23) {
                return _ref10.apply(this, arguments);
            }

            return queryItems;
        }()
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

    }, {
        key: "getItems",
        value: function () {
            var _ref11 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee11(args) {
                return _regenerator2.default.wrap(function _callee11$(_context11) {
                    while (1) {
                        switch (_context11.prev = _context11.next) {
                            case 0:
                                args = args || {};
                                utils_1.validatePageSize(args.pageSize);
                                args.limit = args.pageSize || args.limit || 50;
                                args.order = args.order || 'asc';
                                return _context11.abrupt("return", this.queryItems(args));

                            case 5:
                            case "end":
                                return _context11.stop();
                        }
                    }
                }, _callee11, this);
            }));

            function getItems(_x24) {
                return _ref11.apply(this, arguments);
            }

            return getItems;
        }()
        /**
         * Enumerate all items in this Map.
         * This always triggers server interaction when being called for the first time on a Map; this may be latent.
         * This method not supported now and not meant to be used externally.
         * @param {Function} handler Function to handle each argument.
         * @private
         */

    }, {
        key: "forEach",
        value: function forEach(handler) {
            var _this5 = this;

            return new _promise2.default(function (resolve, reject) {
                function processPage(page) {
                    page.items.forEach(function (x) {
                        return handler(x);
                    });
                    if (page.hasNextPage) {
                        page.nextPage().then(processPage).catch(reject);
                    } else {
                        resolve();
                    }
                }
                _this5.queryItems().then(processPage).catch(reject);
            });
        }
    }, {
        key: "shouldIgnoreEvent",
        value: function shouldIgnoreEvent(key, eventId) {
            return this.cache.isKnown(key, eventId);
        }
        /**
         * Handle update from the server
         * @private
         */

    }, {
        key: "_update",
        value: function _update(update, isStrictlyOrdered) {
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
    }, {
        key: "_advanceLastEventId",
        value: function _advanceLastEventId(eventId, revision) {
            if (this.lastEventId < eventId) {
                this.descriptor.last_event_id = eventId;
                if (revision) {
                    this.descriptor.revision = revision;
                }
            }
        }
    }, {
        key: "_updateRootDateUpdated",
        value: function _updateRootDateUpdated(dateUpdated) {
            if (!this.descriptor.date_updated || dateUpdated.getTime() > this.descriptor.date_updated.getTime()) {
                this.descriptor.date_updated = dateUpdated;
                this.services.storage.update(this.type, this.sid, this.uniqueName, { date_updated: dateUpdated });
            }
        }
    }, {
        key: "_handleItemMutated",
        value: function _handleItemMutated(key, url, lastEventId, revision, value, dateUpdated, dateExpires, added, remote) {
            if (this.shouldIgnoreEvent(key, lastEventId)) {
                logger_1.default.trace('Item ', key, ' update skipped, current:', this.lastEventId, ', remote:', lastEventId);
                return;
            } else {
                this._updateRootDateUpdated(dateUpdated);
                var item = this.cache.get(key);
                if (!item) {
                    item = new mapitem_1.MapItem({ key: key, url: url, last_event_id: lastEventId, revision: revision, data: value, date_updated: dateUpdated, date_expires: dateExpires });
                    this.cache.store(key, item, lastEventId);
                    this.emitItemMutationEvent(item, remote, added);
                } else if (item.lastEventId < lastEventId) {
                    item.update(lastEventId, revision, value, dateUpdated);
                    if (dateExpires !== undefined) {
                        item.updateDateExpires(dateExpires);
                    }
                    this.emitItemMutationEvent(item, remote, false);
                }
            }
        }
    }, {
        key: "emitItemMutationEvent",
        value: function emitItemMutationEvent(item, remote, added) {
            var eventName = added ? 'itemAdded' : 'itemUpdated';
            this.emit(eventName, { item: item, isLocal: !remote });
        }
        /**
         * @private
         */

    }, {
        key: "_handleItemRemoved",
        value: function _handleItemRemoved(key, eventId, oldData, dateUpdated, remote) {
            this._updateRootDateUpdated(dateUpdated);
            this.cache.delete(key, eventId);
            this.emit('itemRemoved', { key: key, isLocal: !remote, value: oldData });
        }
    }, {
        key: "onRemoved",
        value: function onRemoved(locally) {
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

    }, {
        key: "setTtl",
        value: function () {
            var _ref12 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee12(ttl) {
                var requestBody, response;
                return _regenerator2.default.wrap(function _callee12$(_context12) {
                    while (1) {
                        switch (_context12.prev = _context12.next) {
                            case 0:
                                utils_1.validateMandatoryTtl(ttl);
                                _context12.prev = 1;
                                requestBody = { ttl: ttl };
                                _context12.next = 5;
                                return this.services.network.post(this.uri, requestBody);

                            case 5:
                                response = _context12.sent;

                                this.descriptor.date_expires = response.body.date_expires;
                                _context12.next = 13;
                                break;

                            case 9:
                                _context12.prev = 9;
                                _context12.t0 = _context12["catch"](1);

                                if (_context12.t0.status === 404) {
                                    this.onRemoved(false);
                                }
                                throw _context12.t0;

                            case 13:
                            case "end":
                                return _context12.stop();
                        }
                    }
                }, _callee12, this, [[1, 9]]);
            }));

            function setTtl(_x25) {
                return _ref12.apply(this, arguments);
            }

            return setTtl;
        }()
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

    }, {
        key: "setItemTtl",
        value: function () {
            var _ref13 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee13(key, ttl) {
                var existingItem, requestBody, response;
                return _regenerator2.default.wrap(function _callee13$(_context13) {
                    while (1) {
                        switch (_context13.prev = _context13.next) {
                            case 0:
                                utils_1.validateMandatoryTtl(ttl);
                                _context13.next = 3;
                                return this.get(key);

                            case 3:
                                existingItem = _context13.sent;
                                requestBody = { ttl: ttl };
                                _context13.next = 7;
                                return this.services.network.post(existingItem.uri, requestBody);

                            case 7:
                                response = _context13.sent;

                                existingItem.updateDateExpires(response.body.date_expires);

                            case 9:
                            case "end":
                                return _context13.stop();
                        }
                    }
                }, _callee13, this);
            }));

            function setItemTtl(_x26, _x27) {
                return _ref13.apply(this, arguments);
            }

            return setItemTtl;
        }()
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

    }, {
        key: "removeMap",
        value: function () {
            var _ref14 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee14() {
                return _regenerator2.default.wrap(function _callee14$(_context14) {
                    while (1) {
                        switch (_context14.prev = _context14.next) {
                            case 0:
                                _context14.next = 2;
                                return this.services.network.delete(this.uri);

                            case 2:
                                this.onRemoved(true);

                            case 3:
                            case "end":
                                return _context14.stop();
                        }
                    }
                }, _callee14, this);
            }));

            function removeMap() {
                return _ref14.apply(this, arguments);
            }

            return removeMap;
        }()
    }, {
        key: "uri",
        get: function get() {
            return this.descriptor.url;
        }
    }, {
        key: "links",
        get: function get() {
            return this.descriptor.links;
        }
    }, {
        key: "revision",
        get: function get() {
            return this.descriptor.revision;
        }
    }, {
        key: "lastEventId",
        get: function get() {
            return this.descriptor.last_event_id;
        }
    }, {
        key: "dateExpires",
        get: function get() {
            return this.descriptor.date_expires;
        }
    }, {
        key: "type",
        get: function get() {
            return 'map';
        }
        // public props, documented along with class description

    }, {
        key: "sid",
        get: function get() {
            return this.descriptor.sid;
        }
    }, {
        key: "uniqueName",
        get: function get() {
            return this.descriptor.unique_name || null;
        }
    }, {
        key: "dateUpdated",
        get: function get() {
            return this.descriptor.date_updated;
        }
    }], [{
        key: "type",
        get: function get() {
            return 'map';
        }
    }]);
    return SyncMap;
}(entity_1.SyncEntity);

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

},{"./cache":1,"./entity":6,"./logger":8,"./mapitem":9,"./mergingqueue":10,"./paginator":12,"./syncerror":19,"./utils":22,"babel-runtime/core-js/object/assign":28,"babel-runtime/core-js/object/get-prototype-of":32,"babel-runtime/core-js/promise":34,"babel-runtime/helpers/asyncToGenerator":39,"babel-runtime/helpers/classCallCheck":40,"babel-runtime/helpers/createClass":41,"babel-runtime/helpers/inherits":43,"babel-runtime/helpers/possibleConstructorReturn":44,"babel-runtime/regenerator":48}],22:[function(_dereq_,module,exports){
"use strict";

var _classCallCheck2 = _dereq_("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = _dereq_("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _stringify = _dereq_("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

Object.defineProperty(exports, "__esModule", { value: true });
var syncerror_1 = _dereq_("./syncerror");
/**
 * Deep-clone an object. Note that this does not work on object containing
 * functions.
 * @param {object} obj - the object to deep-clone
 * @returns {object}
 */
function deepClone(obj) {
    return JSON.parse((0, _stringify2.default)(obj));
}
exports.deepClone = deepClone;
function validateOptionalTtl(ttl) {
    var validTtl = ttl === undefined || isNonNegativeInteger(ttl);
    if (!validTtl) {
        throw new syncerror_1.default("Invalid TTL value, expected a positive integer, was '" + ttl + "'", 400, 54011);
    }
}
exports.validateOptionalTtl = validateOptionalTtl;
function validateMandatoryTtl(ttl) {
    var validTtl = isNonNegativeInteger(ttl);
    if (!validTtl) {
        throw new syncerror_1.default("Invalid TTL value, expected a positive integer, was '" + ttl + "'", 400, 54011);
    }
}
exports.validateMandatoryTtl = validateMandatoryTtl;
function validatePageSize(pageSize) {
    var validPageSize = pageSize === undefined || isPositiveInteger(pageSize);
    if (!validPageSize) {
        throw new syncerror_1.default("Invalid pageSize parameter. Expected a positive integer, was '" + pageSize + "'.", 400, 54455);
    }
}
exports.validatePageSize = validatePageSize;
function isInteger(number) {
    return !isNaN(parseInt(number)) && isFinite(number);
}
function isPositiveInteger(number) {
    return isInteger(number) && number > 0;
}
function isNonNegativeInteger(number) {
    return isInteger(number) && number >= 0;
}
/**
 * Construct URI with query parameters
 */

var UriBuilder = function () {
    function UriBuilder(base) {
        (0, _classCallCheck3.default)(this, UriBuilder);

        this.base = base;
        this.args = new Array();
        this.paths = new Array();
    }

    (0, _createClass3.default)(UriBuilder, [{
        key: "pathSegment",
        value: function pathSegment(name) {
            this.paths.push(encodeURIComponent(name));
            return this;
        }
    }, {
        key: "queryParam",
        value: function queryParam(name, value) {
            if (typeof value !== 'undefined') {
                this.args.push(encodeURIComponent(name) + '=' + encodeURIComponent(value));
            }
            return this;
        }
    }, {
        key: "build",
        value: function build() {
            var result = this.base;
            if (this.paths.length) {
                result += '/' + this.paths.join('/');
            }
            if (this.args.length) {
                result += '?' + this.args.join('&');
            }
            return result;
        }
    }]);
    return UriBuilder;
}();

exports.UriBuilder = UriBuilder;

},{"./syncerror":19,"babel-runtime/core-js/json/stringify":26,"babel-runtime/helpers/classCallCheck":40,"babel-runtime/helpers/createClass":41}],23:[function(_dereq_,module,exports){
module.exports = { "default": _dereq_("core-js/library/fn/array/from"), __esModule: true };
},{"core-js/library/fn/array/from":56}],24:[function(_dereq_,module,exports){
module.exports = { "default": _dereq_("core-js/library/fn/get-iterator"), __esModule: true };
},{"core-js/library/fn/get-iterator":57}],25:[function(_dereq_,module,exports){
module.exports = { "default": _dereq_("core-js/library/fn/is-iterable"), __esModule: true };
},{"core-js/library/fn/is-iterable":58}],26:[function(_dereq_,module,exports){
module.exports = { "default": _dereq_("core-js/library/fn/json/stringify"), __esModule: true };
},{"core-js/library/fn/json/stringify":59}],27:[function(_dereq_,module,exports){
module.exports = { "default": _dereq_("core-js/library/fn/map"), __esModule: true };
},{"core-js/library/fn/map":60}],28:[function(_dereq_,module,exports){
module.exports = { "default": _dereq_("core-js/library/fn/object/assign"), __esModule: true };
},{"core-js/library/fn/object/assign":61}],29:[function(_dereq_,module,exports){
module.exports = { "default": _dereq_("core-js/library/fn/object/create"), __esModule: true };
},{"core-js/library/fn/object/create":62}],30:[function(_dereq_,module,exports){
module.exports = { "default": _dereq_("core-js/library/fn/object/define-property"), __esModule: true };
},{"core-js/library/fn/object/define-property":63}],31:[function(_dereq_,module,exports){
module.exports = { "default": _dereq_("core-js/library/fn/object/get-own-property-descriptor"), __esModule: true };
},{"core-js/library/fn/object/get-own-property-descriptor":64}],32:[function(_dereq_,module,exports){
module.exports = { "default": _dereq_("core-js/library/fn/object/get-prototype-of"), __esModule: true };
},{"core-js/library/fn/object/get-prototype-of":65}],33:[function(_dereq_,module,exports){
module.exports = { "default": _dereq_("core-js/library/fn/object/set-prototype-of"), __esModule: true };
},{"core-js/library/fn/object/set-prototype-of":66}],34:[function(_dereq_,module,exports){
module.exports = { "default": _dereq_("core-js/library/fn/promise"), __esModule: true };
},{"core-js/library/fn/promise":67}],35:[function(_dereq_,module,exports){
module.exports = { "default": _dereq_("core-js/library/fn/reflect/construct"), __esModule: true };
},{"core-js/library/fn/reflect/construct":68}],36:[function(_dereq_,module,exports){
module.exports = { "default": _dereq_("core-js/library/fn/set"), __esModule: true };
},{"core-js/library/fn/set":69}],37:[function(_dereq_,module,exports){
module.exports = { "default": _dereq_("core-js/library/fn/symbol"), __esModule: true };
},{"core-js/library/fn/symbol":70}],38:[function(_dereq_,module,exports){
module.exports = { "default": _dereq_("core-js/library/fn/symbol/iterator"), __esModule: true };
},{"core-js/library/fn/symbol/iterator":71}],39:[function(_dereq_,module,exports){
"use strict";

exports.__esModule = true;

var _promise = _dereq_("../core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (fn) {
  return function () {
    var gen = fn.apply(this, arguments);
    return new _promise2.default(function (resolve, reject) {
      function step(key, arg) {
        try {
          var info = gen[key](arg);
          var value = info.value;
        } catch (error) {
          reject(error);
          return;
        }

        if (info.done) {
          resolve(value);
        } else {
          return _promise2.default.resolve(value).then(function (value) {
            step("next", value);
          }, function (err) {
            step("throw", err);
          });
        }
      }

      return step("next");
    });
  };
};
},{"../core-js/promise":34}],40:[function(_dereq_,module,exports){
"use strict";

exports.__esModule = true;

exports.default = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};
},{}],41:[function(_dereq_,module,exports){
"use strict";

exports.__esModule = true;

var _defineProperty = _dereq_("../core-js/object/define-property");

var _defineProperty2 = _interopRequireDefault(_defineProperty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      (0, _defineProperty2.default)(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();
},{"../core-js/object/define-property":30}],42:[function(_dereq_,module,exports){
"use strict";

exports.__esModule = true;

var _getPrototypeOf = _dereq_("../core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _getOwnPropertyDescriptor = _dereq_("../core-js/object/get-own-property-descriptor");

var _getOwnPropertyDescriptor2 = _interopRequireDefault(_getOwnPropertyDescriptor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = (0, _getOwnPropertyDescriptor2.default)(object, property);

  if (desc === undefined) {
    var parent = (0, _getPrototypeOf2.default)(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};
},{"../core-js/object/get-own-property-descriptor":31,"../core-js/object/get-prototype-of":32}],43:[function(_dereq_,module,exports){
"use strict";

exports.__esModule = true;

var _setPrototypeOf = _dereq_("../core-js/object/set-prototype-of");

var _setPrototypeOf2 = _interopRequireDefault(_setPrototypeOf);

var _create = _dereq_("../core-js/object/create");

var _create2 = _interopRequireDefault(_create);

var _typeof2 = _dereq_("../helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : (0, _typeof3.default)(superClass)));
  }

  subClass.prototype = (0, _create2.default)(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf2.default ? (0, _setPrototypeOf2.default)(subClass, superClass) : subClass.__proto__ = superClass;
};
},{"../core-js/object/create":29,"../core-js/object/set-prototype-of":33,"../helpers/typeof":47}],44:[function(_dereq_,module,exports){
"use strict";

exports.__esModule = true;

var _typeof2 = _dereq_("../helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && ((typeof call === "undefined" ? "undefined" : (0, _typeof3.default)(call)) === "object" || typeof call === "function") ? call : self;
};
},{"../helpers/typeof":47}],45:[function(_dereq_,module,exports){
"use strict";

exports.__esModule = true;

var _isIterable2 = _dereq_("../core-js/is-iterable");

var _isIterable3 = _interopRequireDefault(_isIterable2);

var _getIterator2 = _dereq_("../core-js/get-iterator");

var _getIterator3 = _interopRequireDefault(_getIterator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = (0, _getIterator3.default)(arr), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if ((0, _isIterable3.default)(Object(arr))) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();
},{"../core-js/get-iterator":24,"../core-js/is-iterable":25}],46:[function(_dereq_,module,exports){
"use strict";

exports.__esModule = true;

var _from = _dereq_("../core-js/array/from");

var _from2 = _interopRequireDefault(_from);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
      arr2[i] = arr[i];
    }

    return arr2;
  } else {
    return (0, _from2.default)(arr);
  }
};
},{"../core-js/array/from":23}],47:[function(_dereq_,module,exports){
"use strict";

exports.__esModule = true;

var _iterator = _dereq_("../core-js/symbol/iterator");

var _iterator2 = _interopRequireDefault(_iterator);

var _symbol = _dereq_("../core-js/symbol");

var _symbol2 = _interopRequireDefault(_symbol);

var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = typeof _symbol2.default === "function" && _typeof(_iterator2.default) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof(obj);
} : function (obj) {
  return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof(obj);
};
},{"../core-js/symbol":37,"../core-js/symbol/iterator":38}],48:[function(_dereq_,module,exports){
module.exports = _dereq_("regenerator-runtime");

},{"regenerator-runtime":198}],49:[function(_dereq_,module,exports){
//      Copyright (c) 2012 Mathieu Turcotte
//      Licensed under the MIT license.

var Backoff = _dereq_('./lib/backoff');
var ExponentialBackoffStrategy = _dereq_('./lib/strategy/exponential');
var FibonacciBackoffStrategy = _dereq_('./lib/strategy/fibonacci');
var FunctionCall = _dereq_('./lib/function_call.js');

module.exports.Backoff = Backoff;
module.exports.FunctionCall = FunctionCall;
module.exports.FibonacciStrategy = FibonacciBackoffStrategy;
module.exports.ExponentialStrategy = ExponentialBackoffStrategy;

// Constructs a Fibonacci backoff.
module.exports.fibonacci = function(options) {
    return new Backoff(new FibonacciBackoffStrategy(options));
};

// Constructs an exponential backoff.
module.exports.exponential = function(options) {
    return new Backoff(new ExponentialBackoffStrategy(options));
};

// Constructs a FunctionCall for the given function and arguments.
module.exports.call = function(fn, vargs, callback) {
    var args = Array.prototype.slice.call(arguments);
    fn = args[0];
    vargs = args.slice(1, args.length - 1);
    callback = args[args.length - 1];
    return new FunctionCall(fn, vargs, callback);
};

},{"./lib/backoff":50,"./lib/function_call.js":51,"./lib/strategy/exponential":52,"./lib/strategy/fibonacci":53}],50:[function(_dereq_,module,exports){
//      Copyright (c) 2012 Mathieu Turcotte
//      Licensed under the MIT license.

var events = _dereq_('events');
var precond = _dereq_('precond');
var util = _dereq_('util');

// A class to hold the state of a backoff operation. Accepts a backoff strategy
// to generate the backoff delays.
function Backoff(backoffStrategy) {
    events.EventEmitter.call(this);

    this.backoffStrategy_ = backoffStrategy;
    this.maxNumberOfRetry_ = -1;
    this.backoffNumber_ = 0;
    this.backoffDelay_ = 0;
    this.timeoutID_ = -1;

    this.handlers = {
        backoff: this.onBackoff_.bind(this)
    };
}
util.inherits(Backoff, events.EventEmitter);

// Sets a limit, greater than 0, on the maximum number of backoffs. A 'fail'
// event will be emitted when the limit is reached.
Backoff.prototype.failAfter = function(maxNumberOfRetry) {
    precond.checkArgument(maxNumberOfRetry > 0,
        'Expected a maximum number of retry greater than 0 but got %s.',
        maxNumberOfRetry);

    this.maxNumberOfRetry_ = maxNumberOfRetry;
};

// Starts a backoff operation. Accepts an optional parameter to let the
// listeners know why the backoff operation was started.
Backoff.prototype.backoff = function(err) {
    precond.checkState(this.timeoutID_ === -1, 'Backoff in progress.');

    if (this.backoffNumber_ === this.maxNumberOfRetry_) {
        this.emit('fail', err);
        this.reset();
    } else {
        this.backoffDelay_ = this.backoffStrategy_.next();
        this.timeoutID_ = setTimeout(this.handlers.backoff, this.backoffDelay_);
        this.emit('backoff', this.backoffNumber_, this.backoffDelay_, err);
    }
};

// Handles the backoff timeout completion.
Backoff.prototype.onBackoff_ = function() {
    this.timeoutID_ = -1;
    this.emit('ready', this.backoffNumber_, this.backoffDelay_);
    this.backoffNumber_++;
};

// Stops any backoff operation and resets the backoff delay to its inital value.
Backoff.prototype.reset = function() {
    this.backoffNumber_ = 0;
    this.backoffStrategy_.reset();
    clearTimeout(this.timeoutID_);
    this.timeoutID_ = -1;
};

module.exports = Backoff;

},{"events":187,"precond":194,"util":236}],51:[function(_dereq_,module,exports){
//      Copyright (c) 2012 Mathieu Turcotte
//      Licensed under the MIT license.

var events = _dereq_('events');
var precond = _dereq_('precond');
var util = _dereq_('util');

var Backoff = _dereq_('./backoff');
var FibonacciBackoffStrategy = _dereq_('./strategy/fibonacci');

// Wraps a function to be called in a backoff loop.
function FunctionCall(fn, args, callback) {
    events.EventEmitter.call(this);

    precond.checkIsFunction(fn, 'Expected fn to be a function.');
    precond.checkIsArray(args, 'Expected args to be an array.');
    precond.checkIsFunction(callback, 'Expected callback to be a function.');

    this.function_ = fn;
    this.arguments_ = args;
    this.callback_ = callback;
    this.lastResult_ = [];
    this.numRetries_ = 0;

    this.backoff_ = null;
    this.strategy_ = null;
    this.failAfter_ = -1;
    this.retryPredicate_ = FunctionCall.DEFAULT_RETRY_PREDICATE_;

    this.state_ = FunctionCall.State_.PENDING;
}
util.inherits(FunctionCall, events.EventEmitter);

// States in which the call can be.
FunctionCall.State_ = {
    // Call isn't started yet.
    PENDING: 0,
    // Call is in progress.
    RUNNING: 1,
    // Call completed successfully which means that either the wrapped function
    // returned successfully or the maximal number of backoffs was reached.
    COMPLETED: 2,
    // The call was aborted.
    ABORTED: 3
};

// The default retry predicate which considers any error as retriable.
FunctionCall.DEFAULT_RETRY_PREDICATE_ = function(err) {
  return true;
};

// Checks whether the call is pending.
FunctionCall.prototype.isPending = function() {
    return this.state_ == FunctionCall.State_.PENDING;
};

// Checks whether the call is in progress.
FunctionCall.prototype.isRunning = function() {
    return this.state_ == FunctionCall.State_.RUNNING;
};

// Checks whether the call is completed.
FunctionCall.prototype.isCompleted = function() {
    return this.state_ == FunctionCall.State_.COMPLETED;
};

// Checks whether the call is aborted.
FunctionCall.prototype.isAborted = function() {
    return this.state_ == FunctionCall.State_.ABORTED;
};

// Sets the backoff strategy to use. Can only be called before the call is
// started otherwise an exception will be thrown.
FunctionCall.prototype.setStrategy = function(strategy) {
    precond.checkState(this.isPending(), 'FunctionCall in progress.');
    this.strategy_ = strategy;
    return this; // Return this for chaining.
};

// Sets the predicate which will be used to determine whether the errors
// returned from the wrapped function should be retried or not, e.g. a
// network error would be retriable while a type error would stop the
// function call.
FunctionCall.prototype.retryIf = function(retryPredicate) {
    precond.checkState(this.isPending(), 'FunctionCall in progress.');
    this.retryPredicate_ = retryPredicate;
    return this;
};

// Returns all intermediary results returned by the wrapped function since
// the initial call.
FunctionCall.prototype.getLastResult = function() {
    return this.lastResult_.concat();
};

// Returns the number of times the wrapped function call was retried.
FunctionCall.prototype.getNumRetries = function() {
    return this.numRetries_;
};

// Sets the backoff limit.
FunctionCall.prototype.failAfter = function(maxNumberOfRetry) {
    precond.checkState(this.isPending(), 'FunctionCall in progress.');
    this.failAfter_ = maxNumberOfRetry;
    return this; // Return this for chaining.
};

// Aborts the call.
FunctionCall.prototype.abort = function() {
    if (this.isCompleted() || this.isAborted()) {
      return;
    }

    if (this.isRunning()) {
        this.backoff_.reset();
    }

    this.state_ = FunctionCall.State_.ABORTED;
    this.lastResult_ = [new Error('Backoff aborted.')];
    this.emit('abort');
    this.doCallback_();
};

// Initiates the call to the wrapped function. Accepts an optional factory
// function used to create the backoff instance; used when testing.
FunctionCall.prototype.start = function(backoffFactory) {
    precond.checkState(!this.isAborted(), 'FunctionCall is aborted.');
    precond.checkState(this.isPending(), 'FunctionCall already started.');

    var strategy = this.strategy_ || new FibonacciBackoffStrategy();

    this.backoff_ = backoffFactory ?
        backoffFactory(strategy) :
        new Backoff(strategy);

    this.backoff_.on('ready', this.doCall_.bind(this, true /* isRetry */));
    this.backoff_.on('fail', this.doCallback_.bind(this));
    this.backoff_.on('backoff', this.handleBackoff_.bind(this));

    if (this.failAfter_ > 0) {
        this.backoff_.failAfter(this.failAfter_);
    }

    this.state_ = FunctionCall.State_.RUNNING;
    this.doCall_(false /* isRetry */);
};

// Calls the wrapped function.
FunctionCall.prototype.doCall_ = function(isRetry) {
    if (isRetry) {
        this.numRetries_++;
    }
    var eventArgs = ['call'].concat(this.arguments_);
    events.EventEmitter.prototype.emit.apply(this, eventArgs);
    var callback = this.handleFunctionCallback_.bind(this);
    this.function_.apply(null, this.arguments_.concat(callback));
};

// Calls the wrapped function's callback with the last result returned by the
// wrapped function.
FunctionCall.prototype.doCallback_ = function() {
    this.callback_.apply(null, this.lastResult_);
};

// Handles wrapped function's completion. This method acts as a replacement
// for the original callback function.
FunctionCall.prototype.handleFunctionCallback_ = function() {
    if (this.isAborted()) {
        return;
    }

    var args = Array.prototype.slice.call(arguments);
    this.lastResult_ = args; // Save last callback arguments.
    events.EventEmitter.prototype.emit.apply(this, ['callback'].concat(args));

    var err = args[0];
    if (err && this.retryPredicate_(err)) {
        this.backoff_.backoff(err);
    } else {
        this.state_ = FunctionCall.State_.COMPLETED;
        this.doCallback_();
    }
};

// Handles the backoff event by reemitting it.
FunctionCall.prototype.handleBackoff_ = function(number, delay, err) {
    this.emit('backoff', number, delay, err);
};

module.exports = FunctionCall;

},{"./backoff":50,"./strategy/fibonacci":53,"events":187,"precond":194,"util":236}],52:[function(_dereq_,module,exports){
//      Copyright (c) 2012 Mathieu Turcotte
//      Licensed under the MIT license.

var util = _dereq_('util');
var precond = _dereq_('precond');

var BackoffStrategy = _dereq_('./strategy');

// Exponential backoff strategy.
function ExponentialBackoffStrategy(options) {
    BackoffStrategy.call(this, options);
    this.backoffDelay_ = 0;
    this.nextBackoffDelay_ = this.getInitialDelay();
    this.factor_ = ExponentialBackoffStrategy.DEFAULT_FACTOR;

    if (options && options.factor !== undefined) {
        precond.checkArgument(options.factor > 1,
            'Exponential factor should be greater than 1 but got %s.',
            options.factor);
        this.factor_ = options.factor;
    }
}
util.inherits(ExponentialBackoffStrategy, BackoffStrategy);

// Default multiplication factor used to compute the next backoff delay from
// the current one. The value can be overridden by passing a custom factor as
// part of the options.
ExponentialBackoffStrategy.DEFAULT_FACTOR = 2;

ExponentialBackoffStrategy.prototype.next_ = function() {
    this.backoffDelay_ = Math.min(this.nextBackoffDelay_, this.getMaxDelay());
    this.nextBackoffDelay_ = this.backoffDelay_ * this.factor_;
    return this.backoffDelay_;
};

ExponentialBackoffStrategy.prototype.reset_ = function() {
    this.backoffDelay_ = 0;
    this.nextBackoffDelay_ = this.getInitialDelay();
};

module.exports = ExponentialBackoffStrategy;

},{"./strategy":54,"precond":194,"util":236}],53:[function(_dereq_,module,exports){
//      Copyright (c) 2012 Mathieu Turcotte
//      Licensed under the MIT license.

var util = _dereq_('util');

var BackoffStrategy = _dereq_('./strategy');

// Fibonacci backoff strategy.
function FibonacciBackoffStrategy(options) {
    BackoffStrategy.call(this, options);
    this.backoffDelay_ = 0;
    this.nextBackoffDelay_ = this.getInitialDelay();
}
util.inherits(FibonacciBackoffStrategy, BackoffStrategy);

FibonacciBackoffStrategy.prototype.next_ = function() {
    var backoffDelay = Math.min(this.nextBackoffDelay_, this.getMaxDelay());
    this.nextBackoffDelay_ += this.backoffDelay_;
    this.backoffDelay_ = backoffDelay;
    return backoffDelay;
};

FibonacciBackoffStrategy.prototype.reset_ = function() {
    this.nextBackoffDelay_ = this.getInitialDelay();
    this.backoffDelay_ = 0;
};

module.exports = FibonacciBackoffStrategy;

},{"./strategy":54,"util":236}],54:[function(_dereq_,module,exports){
//      Copyright (c) 2012 Mathieu Turcotte
//      Licensed under the MIT license.

var events = _dereq_('events');
var util = _dereq_('util');

function isDef(value) {
    return value !== undefined && value !== null;
}

// Abstract class defining the skeleton for the backoff strategies. Accepts an
// object holding the options for the backoff strategy:
//
//  * `randomisationFactor`: The randomisation factor which must be between 0
//     and 1 where 1 equates to a randomization factor of 100% and 0 to no
//     randomization.
//  * `initialDelay`: The backoff initial delay in milliseconds.
//  * `maxDelay`: The backoff maximal delay in milliseconds.
function BackoffStrategy(options) {
    options = options || {};

    if (isDef(options.initialDelay) && options.initialDelay < 1) {
        throw new Error('The initial timeout must be greater than 0.');
    } else if (isDef(options.maxDelay) && options.maxDelay < 1) {
        throw new Error('The maximal timeout must be greater than 0.');
    }

    this.initialDelay_ = options.initialDelay || 100;
    this.maxDelay_ = options.maxDelay || 10000;

    if (this.maxDelay_ <= this.initialDelay_) {
        throw new Error('The maximal backoff delay must be ' +
                        'greater than the initial backoff delay.');
    }

    if (isDef(options.randomisationFactor) &&
        (options.randomisationFactor < 0 || options.randomisationFactor > 1)) {
        throw new Error('The randomisation factor must be between 0 and 1.');
    }

    this.randomisationFactor_ = options.randomisationFactor || 0;
}

// Gets the maximal backoff delay.
BackoffStrategy.prototype.getMaxDelay = function() {
    return this.maxDelay_;
};

// Gets the initial backoff delay.
BackoffStrategy.prototype.getInitialDelay = function() {
    return this.initialDelay_;
};

// Template method that computes and returns the next backoff delay in
// milliseconds.
BackoffStrategy.prototype.next = function() {
    var backoffDelay = this.next_();
    var randomisationMultiple = 1 + Math.random() * this.randomisationFactor_;
    var randomizedDelay = Math.round(backoffDelay * randomisationMultiple);
    return randomizedDelay;
};

// Computes and returns the next backoff delay. Intended to be overridden by
// subclasses.
BackoffStrategy.prototype.next_ = function() {
    throw new Error('BackoffStrategy.next_() unimplemented.');
};

// Template method that resets the backoff delay to its initial value.
BackoffStrategy.prototype.reset = function() {
    this.reset_();
};

// Resets the backoff delay to its initial value. Intended to be overridden by
// subclasses.
BackoffStrategy.prototype.reset_ = function() {
    throw new Error('BackoffStrategy.reset_() unimplemented.');
};

module.exports = BackoffStrategy;

},{"events":187,"util":236}],55:[function(_dereq_,module,exports){
"use strict";

},{}],56:[function(_dereq_,module,exports){
_dereq_('../../modules/es6.string.iterator');
_dereq_('../../modules/es6.array.from');
module.exports = _dereq_('../../modules/_core').Array.from;

},{"../../modules/_core":87,"../../modules/es6.array.from":161,"../../modules/es6.string.iterator":174}],57:[function(_dereq_,module,exports){
_dereq_('../modules/web.dom.iterable');
_dereq_('../modules/es6.string.iterator');
module.exports = _dereq_('../modules/core.get-iterator');

},{"../modules/core.get-iterator":159,"../modules/es6.string.iterator":174,"../modules/web.dom.iterable":186}],58:[function(_dereq_,module,exports){
_dereq_('../modules/web.dom.iterable');
_dereq_('../modules/es6.string.iterator');
module.exports = _dereq_('../modules/core.is-iterable');

},{"../modules/core.is-iterable":160,"../modules/es6.string.iterator":174,"../modules/web.dom.iterable":186}],59:[function(_dereq_,module,exports){
var core = _dereq_('../../modules/_core');
var $JSON = core.JSON || (core.JSON = { stringify: JSON.stringify });
module.exports = function stringify(it) { // eslint-disable-line no-unused-vars
  return $JSON.stringify.apply($JSON, arguments);
};

},{"../../modules/_core":87}],60:[function(_dereq_,module,exports){
_dereq_('../modules/es6.object.to-string');
_dereq_('../modules/es6.string.iterator');
_dereq_('../modules/web.dom.iterable');
_dereq_('../modules/es6.map');
_dereq_('../modules/es7.map.to-json');
_dereq_('../modules/es7.map.of');
_dereq_('../modules/es7.map.from');
module.exports = _dereq_('../modules/_core').Map;

},{"../modules/_core":87,"../modules/es6.map":163,"../modules/es6.object.to-string":170,"../modules/es6.string.iterator":174,"../modules/es7.map.from":176,"../modules/es7.map.of":177,"../modules/es7.map.to-json":178,"../modules/web.dom.iterable":186}],61:[function(_dereq_,module,exports){
_dereq_('../../modules/es6.object.assign');
module.exports = _dereq_('../../modules/_core').Object.assign;

},{"../../modules/_core":87,"../../modules/es6.object.assign":164}],62:[function(_dereq_,module,exports){
_dereq_('../../modules/es6.object.create');
var $Object = _dereq_('../../modules/_core').Object;
module.exports = function create(P, D) {
  return $Object.create(P, D);
};

},{"../../modules/_core":87,"../../modules/es6.object.create":165}],63:[function(_dereq_,module,exports){
_dereq_('../../modules/es6.object.define-property');
var $Object = _dereq_('../../modules/_core').Object;
module.exports = function defineProperty(it, key, desc) {
  return $Object.defineProperty(it, key, desc);
};

},{"../../modules/_core":87,"../../modules/es6.object.define-property":166}],64:[function(_dereq_,module,exports){
_dereq_('../../modules/es6.object.get-own-property-descriptor');
var $Object = _dereq_('../../modules/_core').Object;
module.exports = function getOwnPropertyDescriptor(it, key) {
  return $Object.getOwnPropertyDescriptor(it, key);
};

},{"../../modules/_core":87,"../../modules/es6.object.get-own-property-descriptor":167}],65:[function(_dereq_,module,exports){
_dereq_('../../modules/es6.object.get-prototype-of');
module.exports = _dereq_('../../modules/_core').Object.getPrototypeOf;

},{"../../modules/_core":87,"../../modules/es6.object.get-prototype-of":168}],66:[function(_dereq_,module,exports){
_dereq_('../../modules/es6.object.set-prototype-of');
module.exports = _dereq_('../../modules/_core').Object.setPrototypeOf;

},{"../../modules/_core":87,"../../modules/es6.object.set-prototype-of":169}],67:[function(_dereq_,module,exports){
_dereq_('../modules/es6.object.to-string');
_dereq_('../modules/es6.string.iterator');
_dereq_('../modules/web.dom.iterable');
_dereq_('../modules/es6.promise');
_dereq_('../modules/es7.promise.finally');
_dereq_('../modules/es7.promise.try');
module.exports = _dereq_('../modules/_core').Promise;

},{"../modules/_core":87,"../modules/es6.object.to-string":170,"../modules/es6.promise":171,"../modules/es6.string.iterator":174,"../modules/es7.promise.finally":179,"../modules/es7.promise.try":180,"../modules/web.dom.iterable":186}],68:[function(_dereq_,module,exports){
_dereq_('../../modules/es6.reflect.construct');
module.exports = _dereq_('../../modules/_core').Reflect.construct;

},{"../../modules/_core":87,"../../modules/es6.reflect.construct":172}],69:[function(_dereq_,module,exports){
_dereq_('../modules/es6.object.to-string');
_dereq_('../modules/es6.string.iterator');
_dereq_('../modules/web.dom.iterable');
_dereq_('../modules/es6.set');
_dereq_('../modules/es7.set.to-json');
_dereq_('../modules/es7.set.of');
_dereq_('../modules/es7.set.from');
module.exports = _dereq_('../modules/_core').Set;

},{"../modules/_core":87,"../modules/es6.object.to-string":170,"../modules/es6.set":173,"../modules/es6.string.iterator":174,"../modules/es7.set.from":181,"../modules/es7.set.of":182,"../modules/es7.set.to-json":183,"../modules/web.dom.iterable":186}],70:[function(_dereq_,module,exports){
_dereq_('../../modules/es6.symbol');
_dereq_('../../modules/es6.object.to-string');
_dereq_('../../modules/es7.symbol.async-iterator');
_dereq_('../../modules/es7.symbol.observable');
module.exports = _dereq_('../../modules/_core').Symbol;

},{"../../modules/_core":87,"../../modules/es6.object.to-string":170,"../../modules/es6.symbol":175,"../../modules/es7.symbol.async-iterator":184,"../../modules/es7.symbol.observable":185}],71:[function(_dereq_,module,exports){
_dereq_('../../modules/es6.string.iterator');
_dereq_('../../modules/web.dom.iterable');
module.exports = _dereq_('../../modules/_wks-ext').f('iterator');

},{"../../modules/_wks-ext":156,"../../modules/es6.string.iterator":174,"../../modules/web.dom.iterable":186}],72:[function(_dereq_,module,exports){
module.exports = function (it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};

},{}],73:[function(_dereq_,module,exports){
module.exports = function () { /* empty */ };

},{}],74:[function(_dereq_,module,exports){
module.exports = function (it, Constructor, name, forbiddenField) {
  if (!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)) {
    throw TypeError(name + ': incorrect invocation!');
  } return it;
};

},{}],75:[function(_dereq_,module,exports){
var isObject = _dereq_('./_is-object');
module.exports = function (it) {
  if (!isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};

},{"./_is-object":107}],76:[function(_dereq_,module,exports){
var forOf = _dereq_('./_for-of');

module.exports = function (iter, ITERATOR) {
  var result = [];
  forOf(iter, false, result.push, result, ITERATOR);
  return result;
};

},{"./_for-of":97}],77:[function(_dereq_,module,exports){
// false -> Array#indexOf
// true  -> Array#includes
var toIObject = _dereq_('./_to-iobject');
var toLength = _dereq_('./_to-length');
var toAbsoluteIndex = _dereq_('./_to-absolute-index');
module.exports = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIObject($this);
    var length = toLength(O.length);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
      if (O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};

},{"./_to-absolute-index":146,"./_to-iobject":148,"./_to-length":149}],78:[function(_dereq_,module,exports){
// 0 -> Array#forEach
// 1 -> Array#map
// 2 -> Array#filter
// 3 -> Array#some
// 4 -> Array#every
// 5 -> Array#find
// 6 -> Array#findIndex
var ctx = _dereq_('./_ctx');
var IObject = _dereq_('./_iobject');
var toObject = _dereq_('./_to-object');
var toLength = _dereq_('./_to-length');
var asc = _dereq_('./_array-species-create');
module.exports = function (TYPE, $create) {
  var IS_MAP = TYPE == 1;
  var IS_FILTER = TYPE == 2;
  var IS_SOME = TYPE == 3;
  var IS_EVERY = TYPE == 4;
  var IS_FIND_INDEX = TYPE == 6;
  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
  var create = $create || asc;
  return function ($this, callbackfn, that) {
    var O = toObject($this);
    var self = IObject(O);
    var f = ctx(callbackfn, that, 3);
    var length = toLength(self.length);
    var index = 0;
    var result = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
    var val, res;
    for (;length > index; index++) if (NO_HOLES || index in self) {
      val = self[index];
      res = f(val, index, O);
      if (TYPE) {
        if (IS_MAP) result[index] = res;   // map
        else if (res) switch (TYPE) {
          case 3: return true;             // some
          case 5: return val;              // find
          case 6: return index;            // findIndex
          case 2: result.push(val);        // filter
        } else if (IS_EVERY) return false; // every
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
  };
};

},{"./_array-species-create":80,"./_ctx":89,"./_iobject":104,"./_to-length":149,"./_to-object":150}],79:[function(_dereq_,module,exports){
var isObject = _dereq_('./_is-object');
var isArray = _dereq_('./_is-array');
var SPECIES = _dereq_('./_wks')('species');

module.exports = function (original) {
  var C;
  if (isArray(original)) {
    C = original.constructor;
    // cross-realm fallback
    if (typeof C == 'function' && (C === Array || isArray(C.prototype))) C = undefined;
    if (isObject(C)) {
      C = C[SPECIES];
      if (C === null) C = undefined;
    }
  } return C === undefined ? Array : C;
};

},{"./_is-array":106,"./_is-object":107,"./_wks":157}],80:[function(_dereq_,module,exports){
// 9.4.2.3 ArraySpeciesCreate(originalArray, length)
var speciesConstructor = _dereq_('./_array-species-constructor');

module.exports = function (original, length) {
  return new (speciesConstructor(original))(length);
};

},{"./_array-species-constructor":79}],81:[function(_dereq_,module,exports){
'use strict';
var aFunction = _dereq_('./_a-function');
var isObject = _dereq_('./_is-object');
var invoke = _dereq_('./_invoke');
var arraySlice = [].slice;
var factories = {};

var construct = function (F, len, args) {
  if (!(len in factories)) {
    for (var n = [], i = 0; i < len; i++) n[i] = 'a[' + i + ']';
    // eslint-disable-next-line no-new-func
    factories[len] = Function('F,a', 'return new F(' + n.join(',') + ')');
  } return factories[len](F, args);
};

module.exports = Function.bind || function bind(that /* , ...args */) {
  var fn = aFunction(this);
  var partArgs = arraySlice.call(arguments, 1);
  var bound = function (/* args... */) {
    var args = partArgs.concat(arraySlice.call(arguments));
    return this instanceof bound ? construct(fn, args.length, args) : invoke(fn, args, that);
  };
  if (isObject(fn.prototype)) bound.prototype = fn.prototype;
  return bound;
};

},{"./_a-function":72,"./_invoke":103,"./_is-object":107}],82:[function(_dereq_,module,exports){
// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = _dereq_('./_cof');
var TAG = _dereq_('./_wks')('toStringTag');
// ES3 wrong here
var ARG = cof(function () { return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (e) { /* empty */ }
};

module.exports = function (it) {
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};

},{"./_cof":83,"./_wks":157}],83:[function(_dereq_,module,exports){
var toString = {}.toString;

module.exports = function (it) {
  return toString.call(it).slice(8, -1);
};

},{}],84:[function(_dereq_,module,exports){
'use strict';
var dP = _dereq_('./_object-dp').f;
var create = _dereq_('./_object-create');
var redefineAll = _dereq_('./_redefine-all');
var ctx = _dereq_('./_ctx');
var anInstance = _dereq_('./_an-instance');
var forOf = _dereq_('./_for-of');
var $iterDefine = _dereq_('./_iter-define');
var step = _dereq_('./_iter-step');
var setSpecies = _dereq_('./_set-species');
var DESCRIPTORS = _dereq_('./_descriptors');
var fastKey = _dereq_('./_meta').fastKey;
var validate = _dereq_('./_validate-collection');
var SIZE = DESCRIPTORS ? '_s' : 'size';

var getEntry = function (that, key) {
  // fast case
  var index = fastKey(key);
  var entry;
  if (index !== 'F') return that._i[index];
  // frozen object case
  for (entry = that._f; entry; entry = entry.n) {
    if (entry.k == key) return entry;
  }
};

module.exports = {
  getConstructor: function (wrapper, NAME, IS_MAP, ADDER) {
    var C = wrapper(function (that, iterable) {
      anInstance(that, C, NAME, '_i');
      that._t = NAME;         // collection type
      that._i = create(null); // index
      that._f = undefined;    // first entry
      that._l = undefined;    // last entry
      that[SIZE] = 0;         // size
      if (iterable != undefined) forOf(iterable, IS_MAP, that[ADDER], that);
    });
    redefineAll(C.prototype, {
      // 23.1.3.1 Map.prototype.clear()
      // 23.2.3.2 Set.prototype.clear()
      clear: function clear() {
        for (var that = validate(this, NAME), data = that._i, entry = that._f; entry; entry = entry.n) {
          entry.r = true;
          if (entry.p) entry.p = entry.p.n = undefined;
          delete data[entry.i];
        }
        that._f = that._l = undefined;
        that[SIZE] = 0;
      },
      // 23.1.3.3 Map.prototype.delete(key)
      // 23.2.3.4 Set.prototype.delete(value)
      'delete': function (key) {
        var that = validate(this, NAME);
        var entry = getEntry(that, key);
        if (entry) {
          var next = entry.n;
          var prev = entry.p;
          delete that._i[entry.i];
          entry.r = true;
          if (prev) prev.n = next;
          if (next) next.p = prev;
          if (that._f == entry) that._f = next;
          if (that._l == entry) that._l = prev;
          that[SIZE]--;
        } return !!entry;
      },
      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
      forEach: function forEach(callbackfn /* , that = undefined */) {
        validate(this, NAME);
        var f = ctx(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
        var entry;
        while (entry = entry ? entry.n : this._f) {
          f(entry.v, entry.k, this);
          // revert to the last existing entry
          while (entry && entry.r) entry = entry.p;
        }
      },
      // 23.1.3.7 Map.prototype.has(key)
      // 23.2.3.7 Set.prototype.has(value)
      has: function has(key) {
        return !!getEntry(validate(this, NAME), key);
      }
    });
    if (DESCRIPTORS) dP(C.prototype, 'size', {
      get: function () {
        return validate(this, NAME)[SIZE];
      }
    });
    return C;
  },
  def: function (that, key, value) {
    var entry = getEntry(that, key);
    var prev, index;
    // change existing entry
    if (entry) {
      entry.v = value;
    // create new entry
    } else {
      that._l = entry = {
        i: index = fastKey(key, true), // <- index
        k: key,                        // <- key
        v: value,                      // <- value
        p: prev = that._l,             // <- previous entry
        n: undefined,                  // <- next entry
        r: false                       // <- removed
      };
      if (!that._f) that._f = entry;
      if (prev) prev.n = entry;
      that[SIZE]++;
      // add to index
      if (index !== 'F') that._i[index] = entry;
    } return that;
  },
  getEntry: getEntry,
  setStrong: function (C, NAME, IS_MAP) {
    // add .keys, .values, .entries, [@@iterator]
    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
    $iterDefine(C, NAME, function (iterated, kind) {
      this._t = validate(iterated, NAME); // target
      this._k = kind;                     // kind
      this._l = undefined;                // previous
    }, function () {
      var that = this;
      var kind = that._k;
      var entry = that._l;
      // revert to the last existing entry
      while (entry && entry.r) entry = entry.p;
      // get next entry
      if (!that._t || !(that._l = entry = entry ? entry.n : that._t._f)) {
        // or finish the iteration
        that._t = undefined;
        return step(1);
      }
      // return step by kind
      if (kind == 'keys') return step(0, entry.k);
      if (kind == 'values') return step(0, entry.v);
      return step(0, [entry.k, entry.v]);
    }, IS_MAP ? 'entries' : 'values', !IS_MAP, true);

    // add [@@species], 23.1.2.2, 23.2.2.2
    setSpecies(NAME);
  }
};

},{"./_an-instance":74,"./_ctx":89,"./_descriptors":91,"./_for-of":97,"./_iter-define":110,"./_iter-step":112,"./_meta":115,"./_object-create":119,"./_object-dp":120,"./_redefine-all":134,"./_set-species":139,"./_validate-collection":154}],85:[function(_dereq_,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var classof = _dereq_('./_classof');
var from = _dereq_('./_array-from-iterable');
module.exports = function (NAME) {
  return function toJSON() {
    if (classof(this) != NAME) throw TypeError(NAME + "#toJSON isn't generic");
    return from(this);
  };
};

},{"./_array-from-iterable":76,"./_classof":82}],86:[function(_dereq_,module,exports){
'use strict';
var global = _dereq_('./_global');
var $export = _dereq_('./_export');
var meta = _dereq_('./_meta');
var fails = _dereq_('./_fails');
var hide = _dereq_('./_hide');
var redefineAll = _dereq_('./_redefine-all');
var forOf = _dereq_('./_for-of');
var anInstance = _dereq_('./_an-instance');
var isObject = _dereq_('./_is-object');
var setToStringTag = _dereq_('./_set-to-string-tag');
var dP = _dereq_('./_object-dp').f;
var each = _dereq_('./_array-methods')(0);
var DESCRIPTORS = _dereq_('./_descriptors');

module.exports = function (NAME, wrapper, methods, common, IS_MAP, IS_WEAK) {
  var Base = global[NAME];
  var C = Base;
  var ADDER = IS_MAP ? 'set' : 'add';
  var proto = C && C.prototype;
  var O = {};
  if (!DESCRIPTORS || typeof C != 'function' || !(IS_WEAK || proto.forEach && !fails(function () {
    new C().entries().next();
  }))) {
    // create collection constructor
    C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
    redefineAll(C.prototype, methods);
    meta.NEED = true;
  } else {
    C = wrapper(function (target, iterable) {
      anInstance(target, C, NAME, '_c');
      target._c = new Base();
      if (iterable != undefined) forOf(iterable, IS_MAP, target[ADDER], target);
    });
    each('add,clear,delete,forEach,get,has,set,keys,values,entries,toJSON'.split(','), function (KEY) {
      var IS_ADDER = KEY == 'add' || KEY == 'set';
      if (KEY in proto && !(IS_WEAK && KEY == 'clear')) hide(C.prototype, KEY, function (a, b) {
        anInstance(this, C, KEY);
        if (!IS_ADDER && IS_WEAK && !isObject(a)) return KEY == 'get' ? undefined : false;
        var result = this._c[KEY](a === 0 ? 0 : a, b);
        return IS_ADDER ? this : result;
      });
    });
    IS_WEAK || dP(C.prototype, 'size', {
      get: function () {
        return this._c.size;
      }
    });
  }

  setToStringTag(C, NAME);

  O[NAME] = C;
  $export($export.G + $export.W + $export.F, O);

  if (!IS_WEAK) common.setStrong(C, NAME, IS_MAP);

  return C;
};

},{"./_an-instance":74,"./_array-methods":78,"./_descriptors":91,"./_export":95,"./_fails":96,"./_for-of":97,"./_global":98,"./_hide":100,"./_is-object":107,"./_meta":115,"./_object-dp":120,"./_redefine-all":134,"./_set-to-string-tag":140}],87:[function(_dereq_,module,exports){
var core = module.exports = { version: '2.5.7' };
if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef

},{}],88:[function(_dereq_,module,exports){
'use strict';
var $defineProperty = _dereq_('./_object-dp');
var createDesc = _dereq_('./_property-desc');

module.exports = function (object, index, value) {
  if (index in object) $defineProperty.f(object, index, createDesc(0, value));
  else object[index] = value;
};

},{"./_object-dp":120,"./_property-desc":133}],89:[function(_dereq_,module,exports){
// optional / simple context binding
var aFunction = _dereq_('./_a-function');
module.exports = function (fn, that, length) {
  aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};

},{"./_a-function":72}],90:[function(_dereq_,module,exports){
// 7.2.1 RequireObjectCoercible(argument)
module.exports = function (it) {
  if (it == undefined) throw TypeError("Can't call method on  " + it);
  return it;
};

},{}],91:[function(_dereq_,module,exports){
// Thank's IE8 for his funny defineProperty
module.exports = !_dereq_('./_fails')(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});

},{"./_fails":96}],92:[function(_dereq_,module,exports){
var isObject = _dereq_('./_is-object');
var document = _dereq_('./_global').document;
// typeof document.createElement is 'object' in old IE
var is = isObject(document) && isObject(document.createElement);
module.exports = function (it) {
  return is ? document.createElement(it) : {};
};

},{"./_global":98,"./_is-object":107}],93:[function(_dereq_,module,exports){
// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');

},{}],94:[function(_dereq_,module,exports){
// all enumerable object keys, includes symbols
var getKeys = _dereq_('./_object-keys');
var gOPS = _dereq_('./_object-gops');
var pIE = _dereq_('./_object-pie');
module.exports = function (it) {
  var result = getKeys(it);
  var getSymbols = gOPS.f;
  if (getSymbols) {
    var symbols = getSymbols(it);
    var isEnum = pIE.f;
    var i = 0;
    var key;
    while (symbols.length > i) if (isEnum.call(it, key = symbols[i++])) result.push(key);
  } return result;
};

},{"./_object-gops":125,"./_object-keys":128,"./_object-pie":129}],95:[function(_dereq_,module,exports){
var global = _dereq_('./_global');
var core = _dereq_('./_core');
var ctx = _dereq_('./_ctx');
var hide = _dereq_('./_hide');
var has = _dereq_('./_has');
var PROTOTYPE = 'prototype';

var $export = function (type, name, source) {
  var IS_FORCED = type & $export.F;
  var IS_GLOBAL = type & $export.G;
  var IS_STATIC = type & $export.S;
  var IS_PROTO = type & $export.P;
  var IS_BIND = type & $export.B;
  var IS_WRAP = type & $export.W;
  var exports = IS_GLOBAL ? core : core[name] || (core[name] = {});
  var expProto = exports[PROTOTYPE];
  var target = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE];
  var key, own, out;
  if (IS_GLOBAL) source = name;
  for (key in source) {
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    if (own && has(exports, key)) continue;
    // export native or passed
    out = own ? target[key] : source[key];
    // prevent global pollution for namespaces
    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
    // bind timers to global for call from export context
    : IS_BIND && own ? ctx(out, global)
    // wrap global constructors for prevent change them in library
    : IS_WRAP && target[key] == out ? (function (C) {
      var F = function (a, b, c) {
        if (this instanceof C) {
          switch (arguments.length) {
            case 0: return new C();
            case 1: return new C(a);
            case 2: return new C(a, b);
          } return new C(a, b, c);
        } return C.apply(this, arguments);
      };
      F[PROTOTYPE] = C[PROTOTYPE];
      return F;
    // make static versions for prototype methods
    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
    if (IS_PROTO) {
      (exports.virtual || (exports.virtual = {}))[key] = out;
      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
      if (type & $export.R && expProto && !expProto[key]) hide(expProto, key, out);
    }
  }
};
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library`
module.exports = $export;

},{"./_core":87,"./_ctx":89,"./_global":98,"./_has":99,"./_hide":100}],96:[function(_dereq_,module,exports){
module.exports = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};

},{}],97:[function(_dereq_,module,exports){
var ctx = _dereq_('./_ctx');
var call = _dereq_('./_iter-call');
var isArrayIter = _dereq_('./_is-array-iter');
var anObject = _dereq_('./_an-object');
var toLength = _dereq_('./_to-length');
var getIterFn = _dereq_('./core.get-iterator-method');
var BREAK = {};
var RETURN = {};
var exports = module.exports = function (iterable, entries, fn, that, ITERATOR) {
  var iterFn = ITERATOR ? function () { return iterable; } : getIterFn(iterable);
  var f = ctx(fn, that, entries ? 2 : 1);
  var index = 0;
  var length, step, iterator, result;
  if (typeof iterFn != 'function') throw TypeError(iterable + ' is not iterable!');
  // fast case for arrays with default iterator
  if (isArrayIter(iterFn)) for (length = toLength(iterable.length); length > index; index++) {
    result = entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
    if (result === BREAK || result === RETURN) return result;
  } else for (iterator = iterFn.call(iterable); !(step = iterator.next()).done;) {
    result = call(iterator, f, step.value, entries);
    if (result === BREAK || result === RETURN) return result;
  }
};
exports.BREAK = BREAK;
exports.RETURN = RETURN;

},{"./_an-object":75,"./_ctx":89,"./_is-array-iter":105,"./_iter-call":108,"./_to-length":149,"./core.get-iterator-method":158}],98:[function(_dereq_,module,exports){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self
  // eslint-disable-next-line no-new-func
  : Function('return this')();
if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef

},{}],99:[function(_dereq_,module,exports){
var hasOwnProperty = {}.hasOwnProperty;
module.exports = function (it, key) {
  return hasOwnProperty.call(it, key);
};

},{}],100:[function(_dereq_,module,exports){
var dP = _dereq_('./_object-dp');
var createDesc = _dereq_('./_property-desc');
module.exports = _dereq_('./_descriptors') ? function (object, key, value) {
  return dP.f(object, key, createDesc(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

},{"./_descriptors":91,"./_object-dp":120,"./_property-desc":133}],101:[function(_dereq_,module,exports){
var document = _dereq_('./_global').document;
module.exports = document && document.documentElement;

},{"./_global":98}],102:[function(_dereq_,module,exports){
module.exports = !_dereq_('./_descriptors') && !_dereq_('./_fails')(function () {
  return Object.defineProperty(_dereq_('./_dom-create')('div'), 'a', { get: function () { return 7; } }).a != 7;
});

},{"./_descriptors":91,"./_dom-create":92,"./_fails":96}],103:[function(_dereq_,module,exports){
// fast apply, http://jsperf.lnkit.com/fast-apply/5
module.exports = function (fn, args, that) {
  var un = that === undefined;
  switch (args.length) {
    case 0: return un ? fn()
                      : fn.call(that);
    case 1: return un ? fn(args[0])
                      : fn.call(that, args[0]);
    case 2: return un ? fn(args[0], args[1])
                      : fn.call(that, args[0], args[1]);
    case 3: return un ? fn(args[0], args[1], args[2])
                      : fn.call(that, args[0], args[1], args[2]);
    case 4: return un ? fn(args[0], args[1], args[2], args[3])
                      : fn.call(that, args[0], args[1], args[2], args[3]);
  } return fn.apply(that, args);
};

},{}],104:[function(_dereq_,module,exports){
// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = _dereq_('./_cof');
// eslint-disable-next-line no-prototype-builtins
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
  return cof(it) == 'String' ? it.split('') : Object(it);
};

},{"./_cof":83}],105:[function(_dereq_,module,exports){
// check on default Array iterator
var Iterators = _dereq_('./_iterators');
var ITERATOR = _dereq_('./_wks')('iterator');
var ArrayProto = Array.prototype;

module.exports = function (it) {
  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
};

},{"./_iterators":113,"./_wks":157}],106:[function(_dereq_,module,exports){
// 7.2.2 IsArray(argument)
var cof = _dereq_('./_cof');
module.exports = Array.isArray || function isArray(arg) {
  return cof(arg) == 'Array';
};

},{"./_cof":83}],107:[function(_dereq_,module,exports){
module.exports = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};

},{}],108:[function(_dereq_,module,exports){
// call something on iterator step with safe closing on error
var anObject = _dereq_('./_an-object');
module.exports = function (iterator, fn, value, entries) {
  try {
    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch (e) {
    var ret = iterator['return'];
    if (ret !== undefined) anObject(ret.call(iterator));
    throw e;
  }
};

},{"./_an-object":75}],109:[function(_dereq_,module,exports){
'use strict';
var create = _dereq_('./_object-create');
var descriptor = _dereq_('./_property-desc');
var setToStringTag = _dereq_('./_set-to-string-tag');
var IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
_dereq_('./_hide')(IteratorPrototype, _dereq_('./_wks')('iterator'), function () { return this; });

module.exports = function (Constructor, NAME, next) {
  Constructor.prototype = create(IteratorPrototype, { next: descriptor(1, next) });
  setToStringTag(Constructor, NAME + ' Iterator');
};

},{"./_hide":100,"./_object-create":119,"./_property-desc":133,"./_set-to-string-tag":140,"./_wks":157}],110:[function(_dereq_,module,exports){
'use strict';
var LIBRARY = _dereq_('./_library');
var $export = _dereq_('./_export');
var redefine = _dereq_('./_redefine');
var hide = _dereq_('./_hide');
var Iterators = _dereq_('./_iterators');
var $iterCreate = _dereq_('./_iter-create');
var setToStringTag = _dereq_('./_set-to-string-tag');
var getPrototypeOf = _dereq_('./_object-gpo');
var ITERATOR = _dereq_('./_wks')('iterator');
var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
var FF_ITERATOR = '@@iterator';
var KEYS = 'keys';
var VALUES = 'values';

var returnThis = function () { return this; };

module.exports = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
  $iterCreate(Constructor, NAME, next);
  var getMethod = function (kind) {
    if (!BUGGY && kind in proto) return proto[kind];
    switch (kind) {
      case KEYS: return function keys() { return new Constructor(this, kind); };
      case VALUES: return function values() { return new Constructor(this, kind); };
    } return function entries() { return new Constructor(this, kind); };
  };
  var TAG = NAME + ' Iterator';
  var DEF_VALUES = DEFAULT == VALUES;
  var VALUES_BUG = false;
  var proto = Base.prototype;
  var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
  var $default = $native || getMethod(DEFAULT);
  var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
  var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
  var methods, key, IteratorPrototype;
  // Fix native
  if ($anyNative) {
    IteratorPrototype = getPrototypeOf($anyNative.call(new Base()));
    if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
      // Set @@toStringTag to native iterators
      setToStringTag(IteratorPrototype, TAG, true);
      // fix for some old engines
      if (!LIBRARY && typeof IteratorPrototype[ITERATOR] != 'function') hide(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if (DEF_VALUES && $native && $native.name !== VALUES) {
    VALUES_BUG = true;
    $default = function values() { return $native.call(this); };
  }
  // Define iterator
  if ((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
    hide(proto, ITERATOR, $default);
  }
  // Plug for library
  Iterators[NAME] = $default;
  Iterators[TAG] = returnThis;
  if (DEFAULT) {
    methods = {
      values: DEF_VALUES ? $default : getMethod(VALUES),
      keys: IS_SET ? $default : getMethod(KEYS),
      entries: $entries
    };
    if (FORCED) for (key in methods) {
      if (!(key in proto)) redefine(proto, key, methods[key]);
    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};

},{"./_export":95,"./_hide":100,"./_iter-create":109,"./_iterators":113,"./_library":114,"./_object-gpo":126,"./_redefine":135,"./_set-to-string-tag":140,"./_wks":157}],111:[function(_dereq_,module,exports){
var ITERATOR = _dereq_('./_wks')('iterator');
var SAFE_CLOSING = false;

try {
  var riter = [7][ITERATOR]();
  riter['return'] = function () { SAFE_CLOSING = true; };
  // eslint-disable-next-line no-throw-literal
  Array.from(riter, function () { throw 2; });
} catch (e) { /* empty */ }

module.exports = function (exec, skipClosing) {
  if (!skipClosing && !SAFE_CLOSING) return false;
  var safe = false;
  try {
    var arr = [7];
    var iter = arr[ITERATOR]();
    iter.next = function () { return { done: safe = true }; };
    arr[ITERATOR] = function () { return iter; };
    exec(arr);
  } catch (e) { /* empty */ }
  return safe;
};

},{"./_wks":157}],112:[function(_dereq_,module,exports){
module.exports = function (done, value) {
  return { value: value, done: !!done };
};

},{}],113:[function(_dereq_,module,exports){
module.exports = {};

},{}],114:[function(_dereq_,module,exports){
module.exports = true;

},{}],115:[function(_dereq_,module,exports){
var META = _dereq_('./_uid')('meta');
var isObject = _dereq_('./_is-object');
var has = _dereq_('./_has');
var setDesc = _dereq_('./_object-dp').f;
var id = 0;
var isExtensible = Object.isExtensible || function () {
  return true;
};
var FREEZE = !_dereq_('./_fails')(function () {
  return isExtensible(Object.preventExtensions({}));
});
var setMeta = function (it) {
  setDesc(it, META, { value: {
    i: 'O' + ++id, // object ID
    w: {}          // weak collections IDs
  } });
};
var fastKey = function (it, create) {
  // return primitive with prefix
  if (!isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if (!has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return 'F';
    // not necessary to add metadata
    if (!create) return 'E';
    // add missing metadata
    setMeta(it);
  // return object ID
  } return it[META].i;
};
var getWeak = function (it, create) {
  if (!has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return true;
    // not necessary to add metadata
    if (!create) return false;
    // add missing metadata
    setMeta(it);
  // return hash weak collections IDs
  } return it[META].w;
};
// add metadata on freeze-family methods calling
var onFreeze = function (it) {
  if (FREEZE && meta.NEED && isExtensible(it) && !has(it, META)) setMeta(it);
  return it;
};
var meta = module.exports = {
  KEY: META,
  NEED: false,
  fastKey: fastKey,
  getWeak: getWeak,
  onFreeze: onFreeze
};

},{"./_fails":96,"./_has":99,"./_is-object":107,"./_object-dp":120,"./_uid":152}],116:[function(_dereq_,module,exports){
var global = _dereq_('./_global');
var macrotask = _dereq_('./_task').set;
var Observer = global.MutationObserver || global.WebKitMutationObserver;
var process = global.process;
var Promise = global.Promise;
var isNode = _dereq_('./_cof')(process) == 'process';

module.exports = function () {
  var head, last, notify;

  var flush = function () {
    var parent, fn;
    if (isNode && (parent = process.domain)) parent.exit();
    while (head) {
      fn = head.fn;
      head = head.next;
      try {
        fn();
      } catch (e) {
        if (head) notify();
        else last = undefined;
        throw e;
      }
    } last = undefined;
    if (parent) parent.enter();
  };

  // Node.js
  if (isNode) {
    notify = function () {
      process.nextTick(flush);
    };
  // browsers with MutationObserver, except iOS Safari - https://github.com/zloirock/core-js/issues/339
  } else if (Observer && !(global.navigator && global.navigator.standalone)) {
    var toggle = true;
    var node = document.createTextNode('');
    new Observer(flush).observe(node, { characterData: true }); // eslint-disable-line no-new
    notify = function () {
      node.data = toggle = !toggle;
    };
  // environments with maybe non-completely correct, but existent Promise
  } else if (Promise && Promise.resolve) {
    // Promise.resolve without an argument throws an error in LG WebOS 2
    var promise = Promise.resolve(undefined);
    notify = function () {
      promise.then(flush);
    };
  // for other environments - macrotask based on:
  // - setImmediate
  // - MessageChannel
  // - window.postMessag
  // - onreadystatechange
  // - setTimeout
  } else {
    notify = function () {
      // strange IE + webpack dev server bug - use .call(global)
      macrotask.call(global, flush);
    };
  }

  return function (fn) {
    var task = { fn: fn, next: undefined };
    if (last) last.next = task;
    if (!head) {
      head = task;
      notify();
    } last = task;
  };
};

},{"./_cof":83,"./_global":98,"./_task":145}],117:[function(_dereq_,module,exports){
'use strict';
// 25.4.1.5 NewPromiseCapability(C)
var aFunction = _dereq_('./_a-function');

function PromiseCapability(C) {
  var resolve, reject;
  this.promise = new C(function ($$resolve, $$reject) {
    if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
    resolve = $$resolve;
    reject = $$reject;
  });
  this.resolve = aFunction(resolve);
  this.reject = aFunction(reject);
}

module.exports.f = function (C) {
  return new PromiseCapability(C);
};

},{"./_a-function":72}],118:[function(_dereq_,module,exports){
'use strict';
// 19.1.2.1 Object.assign(target, source, ...)
var getKeys = _dereq_('./_object-keys');
var gOPS = _dereq_('./_object-gops');
var pIE = _dereq_('./_object-pie');
var toObject = _dereq_('./_to-object');
var IObject = _dereq_('./_iobject');
var $assign = Object.assign;

// should work with symbols and should have deterministic property order (V8 bug)
module.exports = !$assign || _dereq_('./_fails')(function () {
  var A = {};
  var B = {};
  // eslint-disable-next-line no-undef
  var S = Symbol();
  var K = 'abcdefghijklmnopqrst';
  A[S] = 7;
  K.split('').forEach(function (k) { B[k] = k; });
  return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
}) ? function assign(target, source) { // eslint-disable-line no-unused-vars
  var T = toObject(target);
  var aLen = arguments.length;
  var index = 1;
  var getSymbols = gOPS.f;
  var isEnum = pIE.f;
  while (aLen > index) {
    var S = IObject(arguments[index++]);
    var keys = getSymbols ? getKeys(S).concat(getSymbols(S)) : getKeys(S);
    var length = keys.length;
    var j = 0;
    var key;
    while (length > j) if (isEnum.call(S, key = keys[j++])) T[key] = S[key];
  } return T;
} : $assign;

},{"./_fails":96,"./_iobject":104,"./_object-gops":125,"./_object-keys":128,"./_object-pie":129,"./_to-object":150}],119:[function(_dereq_,module,exports){
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
var anObject = _dereq_('./_an-object');
var dPs = _dereq_('./_object-dps');
var enumBugKeys = _dereq_('./_enum-bug-keys');
var IE_PROTO = _dereq_('./_shared-key')('IE_PROTO');
var Empty = function () { /* empty */ };
var PROTOTYPE = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = _dereq_('./_dom-create')('iframe');
  var i = enumBugKeys.length;
  var lt = '<';
  var gt = '>';
  var iframeDocument;
  iframe.style.display = 'none';
  _dereq_('./_html').appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while (i--) delete createDict[PROTOTYPE][enumBugKeys[i]];
  return createDict();
};

module.exports = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    Empty[PROTOTYPE] = anObject(O);
    result = new Empty();
    Empty[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : dPs(result, Properties);
};

},{"./_an-object":75,"./_dom-create":92,"./_enum-bug-keys":93,"./_html":101,"./_object-dps":121,"./_shared-key":141}],120:[function(_dereq_,module,exports){
var anObject = _dereq_('./_an-object');
var IE8_DOM_DEFINE = _dereq_('./_ie8-dom-define');
var toPrimitive = _dereq_('./_to-primitive');
var dP = Object.defineProperty;

exports.f = _dereq_('./_descriptors') ? Object.defineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return dP(O, P, Attributes);
  } catch (e) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};

},{"./_an-object":75,"./_descriptors":91,"./_ie8-dom-define":102,"./_to-primitive":151}],121:[function(_dereq_,module,exports){
var dP = _dereq_('./_object-dp');
var anObject = _dereq_('./_an-object');
var getKeys = _dereq_('./_object-keys');

module.exports = _dereq_('./_descriptors') ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var keys = getKeys(Properties);
  var length = keys.length;
  var i = 0;
  var P;
  while (length > i) dP.f(O, P = keys[i++], Properties[P]);
  return O;
};

},{"./_an-object":75,"./_descriptors":91,"./_object-dp":120,"./_object-keys":128}],122:[function(_dereq_,module,exports){
var pIE = _dereq_('./_object-pie');
var createDesc = _dereq_('./_property-desc');
var toIObject = _dereq_('./_to-iobject');
var toPrimitive = _dereq_('./_to-primitive');
var has = _dereq_('./_has');
var IE8_DOM_DEFINE = _dereq_('./_ie8-dom-define');
var gOPD = Object.getOwnPropertyDescriptor;

exports.f = _dereq_('./_descriptors') ? gOPD : function getOwnPropertyDescriptor(O, P) {
  O = toIObject(O);
  P = toPrimitive(P, true);
  if (IE8_DOM_DEFINE) try {
    return gOPD(O, P);
  } catch (e) { /* empty */ }
  if (has(O, P)) return createDesc(!pIE.f.call(O, P), O[P]);
};

},{"./_descriptors":91,"./_has":99,"./_ie8-dom-define":102,"./_object-pie":129,"./_property-desc":133,"./_to-iobject":148,"./_to-primitive":151}],123:[function(_dereq_,module,exports){
// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
var toIObject = _dereq_('./_to-iobject');
var gOPN = _dereq_('./_object-gopn').f;
var toString = {}.toString;

var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function (it) {
  try {
    return gOPN(it);
  } catch (e) {
    return windowNames.slice();
  }
};

module.exports.f = function getOwnPropertyNames(it) {
  return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
};

},{"./_object-gopn":124,"./_to-iobject":148}],124:[function(_dereq_,module,exports){
// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
var $keys = _dereq_('./_object-keys-internal');
var hiddenKeys = _dereq_('./_enum-bug-keys').concat('length', 'prototype');

exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return $keys(O, hiddenKeys);
};

},{"./_enum-bug-keys":93,"./_object-keys-internal":127}],125:[function(_dereq_,module,exports){
exports.f = Object.getOwnPropertySymbols;

},{}],126:[function(_dereq_,module,exports){
// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
var has = _dereq_('./_has');
var toObject = _dereq_('./_to-object');
var IE_PROTO = _dereq_('./_shared-key')('IE_PROTO');
var ObjectProto = Object.prototype;

module.exports = Object.getPrototypeOf || function (O) {
  O = toObject(O);
  if (has(O, IE_PROTO)) return O[IE_PROTO];
  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectProto : null;
};

},{"./_has":99,"./_shared-key":141,"./_to-object":150}],127:[function(_dereq_,module,exports){
var has = _dereq_('./_has');
var toIObject = _dereq_('./_to-iobject');
var arrayIndexOf = _dereq_('./_array-includes')(false);
var IE_PROTO = _dereq_('./_shared-key')('IE_PROTO');

module.exports = function (object, names) {
  var O = toIObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) if (key != IE_PROTO) has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (has(O, key = names[i++])) {
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};

},{"./_array-includes":77,"./_has":99,"./_shared-key":141,"./_to-iobject":148}],128:[function(_dereq_,module,exports){
// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys = _dereq_('./_object-keys-internal');
var enumBugKeys = _dereq_('./_enum-bug-keys');

module.exports = Object.keys || function keys(O) {
  return $keys(O, enumBugKeys);
};

},{"./_enum-bug-keys":93,"./_object-keys-internal":127}],129:[function(_dereq_,module,exports){
exports.f = {}.propertyIsEnumerable;

},{}],130:[function(_dereq_,module,exports){
// most Object methods by ES6 should accept primitives
var $export = _dereq_('./_export');
var core = _dereq_('./_core');
var fails = _dereq_('./_fails');
module.exports = function (KEY, exec) {
  var fn = (core.Object || {})[KEY] || Object[KEY];
  var exp = {};
  exp[KEY] = exec(fn);
  $export($export.S + $export.F * fails(function () { fn(1); }), 'Object', exp);
};

},{"./_core":87,"./_export":95,"./_fails":96}],131:[function(_dereq_,module,exports){
module.exports = function (exec) {
  try {
    return { e: false, v: exec() };
  } catch (e) {
    return { e: true, v: e };
  }
};

},{}],132:[function(_dereq_,module,exports){
var anObject = _dereq_('./_an-object');
var isObject = _dereq_('./_is-object');
var newPromiseCapability = _dereq_('./_new-promise-capability');

module.exports = function (C, x) {
  anObject(C);
  if (isObject(x) && x.constructor === C) return x;
  var promiseCapability = newPromiseCapability.f(C);
  var resolve = promiseCapability.resolve;
  resolve(x);
  return promiseCapability.promise;
};

},{"./_an-object":75,"./_is-object":107,"./_new-promise-capability":117}],133:[function(_dereq_,module,exports){
module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

},{}],134:[function(_dereq_,module,exports){
var hide = _dereq_('./_hide');
module.exports = function (target, src, safe) {
  for (var key in src) {
    if (safe && target[key]) target[key] = src[key];
    else hide(target, key, src[key]);
  } return target;
};

},{"./_hide":100}],135:[function(_dereq_,module,exports){
module.exports = _dereq_('./_hide');

},{"./_hide":100}],136:[function(_dereq_,module,exports){
'use strict';
// https://tc39.github.io/proposal-setmap-offrom/
var $export = _dereq_('./_export');
var aFunction = _dereq_('./_a-function');
var ctx = _dereq_('./_ctx');
var forOf = _dereq_('./_for-of');

module.exports = function (COLLECTION) {
  $export($export.S, COLLECTION, { from: function from(source /* , mapFn, thisArg */) {
    var mapFn = arguments[1];
    var mapping, A, n, cb;
    aFunction(this);
    mapping = mapFn !== undefined;
    if (mapping) aFunction(mapFn);
    if (source == undefined) return new this();
    A = [];
    if (mapping) {
      n = 0;
      cb = ctx(mapFn, arguments[2], 2);
      forOf(source, false, function (nextItem) {
        A.push(cb(nextItem, n++));
      });
    } else {
      forOf(source, false, A.push, A);
    }
    return new this(A);
  } });
};

},{"./_a-function":72,"./_ctx":89,"./_export":95,"./_for-of":97}],137:[function(_dereq_,module,exports){
'use strict';
// https://tc39.github.io/proposal-setmap-offrom/
var $export = _dereq_('./_export');

module.exports = function (COLLECTION) {
  $export($export.S, COLLECTION, { of: function of() {
    var length = arguments.length;
    var A = new Array(length);
    while (length--) A[length] = arguments[length];
    return new this(A);
  } });
};

},{"./_export":95}],138:[function(_dereq_,module,exports){
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var isObject = _dereq_('./_is-object');
var anObject = _dereq_('./_an-object');
var check = function (O, proto) {
  anObject(O);
  if (!isObject(proto) && proto !== null) throw TypeError(proto + ": can't set as prototype!");
};
module.exports = {
  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
    function (test, buggy, set) {
      try {
        set = _dereq_('./_ctx')(Function.call, _dereq_('./_object-gopd').f(Object.prototype, '__proto__').set, 2);
        set(test, []);
        buggy = !(test instanceof Array);
      } catch (e) { buggy = true; }
      return function setPrototypeOf(O, proto) {
        check(O, proto);
        if (buggy) O.__proto__ = proto;
        else set(O, proto);
        return O;
      };
    }({}, false) : undefined),
  check: check
};

},{"./_an-object":75,"./_ctx":89,"./_is-object":107,"./_object-gopd":122}],139:[function(_dereq_,module,exports){
'use strict';
var global = _dereq_('./_global');
var core = _dereq_('./_core');
var dP = _dereq_('./_object-dp');
var DESCRIPTORS = _dereq_('./_descriptors');
var SPECIES = _dereq_('./_wks')('species');

module.exports = function (KEY) {
  var C = typeof core[KEY] == 'function' ? core[KEY] : global[KEY];
  if (DESCRIPTORS && C && !C[SPECIES]) dP.f(C, SPECIES, {
    configurable: true,
    get: function () { return this; }
  });
};

},{"./_core":87,"./_descriptors":91,"./_global":98,"./_object-dp":120,"./_wks":157}],140:[function(_dereq_,module,exports){
var def = _dereq_('./_object-dp').f;
var has = _dereq_('./_has');
var TAG = _dereq_('./_wks')('toStringTag');

module.exports = function (it, tag, stat) {
  if (it && !has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
};

},{"./_has":99,"./_object-dp":120,"./_wks":157}],141:[function(_dereq_,module,exports){
var shared = _dereq_('./_shared')('keys');
var uid = _dereq_('./_uid');
module.exports = function (key) {
  return shared[key] || (shared[key] = uid(key));
};

},{"./_shared":142,"./_uid":152}],142:[function(_dereq_,module,exports){
var core = _dereq_('./_core');
var global = _dereq_('./_global');
var SHARED = '__core-js_shared__';
var store = global[SHARED] || (global[SHARED] = {});

(module.exports = function (key, value) {
  return store[key] || (store[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: core.version,
  mode: _dereq_('./_library') ? 'pure' : 'global',
  copyright: '© 2018 Denis Pushkarev (zloirock.ru)'
});

},{"./_core":87,"./_global":98,"./_library":114}],143:[function(_dereq_,module,exports){
// 7.3.20 SpeciesConstructor(O, defaultConstructor)
var anObject = _dereq_('./_an-object');
var aFunction = _dereq_('./_a-function');
var SPECIES = _dereq_('./_wks')('species');
module.exports = function (O, D) {
  var C = anObject(O).constructor;
  var S;
  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
};

},{"./_a-function":72,"./_an-object":75,"./_wks":157}],144:[function(_dereq_,module,exports){
var toInteger = _dereq_('./_to-integer');
var defined = _dereq_('./_defined');
// true  -> String#at
// false -> String#codePointAt
module.exports = function (TO_STRING) {
  return function (that, pos) {
    var s = String(defined(that));
    var i = toInteger(pos);
    var l = s.length;
    var a, b;
    if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? TO_STRING ? s.charAt(i) : a
      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};

},{"./_defined":90,"./_to-integer":147}],145:[function(_dereq_,module,exports){
var ctx = _dereq_('./_ctx');
var invoke = _dereq_('./_invoke');
var html = _dereq_('./_html');
var cel = _dereq_('./_dom-create');
var global = _dereq_('./_global');
var process = global.process;
var setTask = global.setImmediate;
var clearTask = global.clearImmediate;
var MessageChannel = global.MessageChannel;
var Dispatch = global.Dispatch;
var counter = 0;
var queue = {};
var ONREADYSTATECHANGE = 'onreadystatechange';
var defer, channel, port;
var run = function () {
  var id = +this;
  // eslint-disable-next-line no-prototype-builtins
  if (queue.hasOwnProperty(id)) {
    var fn = queue[id];
    delete queue[id];
    fn();
  }
};
var listener = function (event) {
  run.call(event.data);
};
// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if (!setTask || !clearTask) {
  setTask = function setImmediate(fn) {
    var args = [];
    var i = 1;
    while (arguments.length > i) args.push(arguments[i++]);
    queue[++counter] = function () {
      // eslint-disable-next-line no-new-func
      invoke(typeof fn == 'function' ? fn : Function(fn), args);
    };
    defer(counter);
    return counter;
  };
  clearTask = function clearImmediate(id) {
    delete queue[id];
  };
  // Node.js 0.8-
  if (_dereq_('./_cof')(process) == 'process') {
    defer = function (id) {
      process.nextTick(ctx(run, id, 1));
    };
  // Sphere (JS game engine) Dispatch API
  } else if (Dispatch && Dispatch.now) {
    defer = function (id) {
      Dispatch.now(ctx(run, id, 1));
    };
  // Browsers with MessageChannel, includes WebWorkers
  } else if (MessageChannel) {
    channel = new MessageChannel();
    port = channel.port2;
    channel.port1.onmessage = listener;
    defer = ctx(port.postMessage, port, 1);
  // Browsers with postMessage, skip WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
  } else if (global.addEventListener && typeof postMessage == 'function' && !global.importScripts) {
    defer = function (id) {
      global.postMessage(id + '', '*');
    };
    global.addEventListener('message', listener, false);
  // IE8-
  } else if (ONREADYSTATECHANGE in cel('script')) {
    defer = function (id) {
      html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function () {
        html.removeChild(this);
        run.call(id);
      };
    };
  // Rest old browsers
  } else {
    defer = function (id) {
      setTimeout(ctx(run, id, 1), 0);
    };
  }
}
module.exports = {
  set: setTask,
  clear: clearTask
};

},{"./_cof":83,"./_ctx":89,"./_dom-create":92,"./_global":98,"./_html":101,"./_invoke":103}],146:[function(_dereq_,module,exports){
var toInteger = _dereq_('./_to-integer');
var max = Math.max;
var min = Math.min;
module.exports = function (index, length) {
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};

},{"./_to-integer":147}],147:[function(_dereq_,module,exports){
// 7.1.4 ToInteger
var ceil = Math.ceil;
var floor = Math.floor;
module.exports = function (it) {
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};

},{}],148:[function(_dereq_,module,exports){
// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = _dereq_('./_iobject');
var defined = _dereq_('./_defined');
module.exports = function (it) {
  return IObject(defined(it));
};

},{"./_defined":90,"./_iobject":104}],149:[function(_dereq_,module,exports){
// 7.1.15 ToLength
var toInteger = _dereq_('./_to-integer');
var min = Math.min;
module.exports = function (it) {
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};

},{"./_to-integer":147}],150:[function(_dereq_,module,exports){
// 7.1.13 ToObject(argument)
var defined = _dereq_('./_defined');
module.exports = function (it) {
  return Object(defined(it));
};

},{"./_defined":90}],151:[function(_dereq_,module,exports){
// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = _dereq_('./_is-object');
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function (it, S) {
  if (!isObject(it)) return it;
  var fn, val;
  if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
  if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  throw TypeError("Can't convert object to primitive value");
};

},{"./_is-object":107}],152:[function(_dereq_,module,exports){
var id = 0;
var px = Math.random();
module.exports = function (key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};

},{}],153:[function(_dereq_,module,exports){
var global = _dereq_('./_global');
var navigator = global.navigator;

module.exports = navigator && navigator.userAgent || '';

},{"./_global":98}],154:[function(_dereq_,module,exports){
var isObject = _dereq_('./_is-object');
module.exports = function (it, TYPE) {
  if (!isObject(it) || it._t !== TYPE) throw TypeError('Incompatible receiver, ' + TYPE + ' required!');
  return it;
};

},{"./_is-object":107}],155:[function(_dereq_,module,exports){
var global = _dereq_('./_global');
var core = _dereq_('./_core');
var LIBRARY = _dereq_('./_library');
var wksExt = _dereq_('./_wks-ext');
var defineProperty = _dereq_('./_object-dp').f;
module.exports = function (name) {
  var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
  if (name.charAt(0) != '_' && !(name in $Symbol)) defineProperty($Symbol, name, { value: wksExt.f(name) });
};

},{"./_core":87,"./_global":98,"./_library":114,"./_object-dp":120,"./_wks-ext":156}],156:[function(_dereq_,module,exports){
exports.f = _dereq_('./_wks');

},{"./_wks":157}],157:[function(_dereq_,module,exports){
var store = _dereq_('./_shared')('wks');
var uid = _dereq_('./_uid');
var Symbol = _dereq_('./_global').Symbol;
var USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function (name) {
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;

},{"./_global":98,"./_shared":142,"./_uid":152}],158:[function(_dereq_,module,exports){
var classof = _dereq_('./_classof');
var ITERATOR = _dereq_('./_wks')('iterator');
var Iterators = _dereq_('./_iterators');
module.exports = _dereq_('./_core').getIteratorMethod = function (it) {
  if (it != undefined) return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};

},{"./_classof":82,"./_core":87,"./_iterators":113,"./_wks":157}],159:[function(_dereq_,module,exports){
var anObject = _dereq_('./_an-object');
var get = _dereq_('./core.get-iterator-method');
module.exports = _dereq_('./_core').getIterator = function (it) {
  var iterFn = get(it);
  if (typeof iterFn != 'function') throw TypeError(it + ' is not iterable!');
  return anObject(iterFn.call(it));
};

},{"./_an-object":75,"./_core":87,"./core.get-iterator-method":158}],160:[function(_dereq_,module,exports){
var classof = _dereq_('./_classof');
var ITERATOR = _dereq_('./_wks')('iterator');
var Iterators = _dereq_('./_iterators');
module.exports = _dereq_('./_core').isIterable = function (it) {
  var O = Object(it);
  return O[ITERATOR] !== undefined
    || '@@iterator' in O
    // eslint-disable-next-line no-prototype-builtins
    || Iterators.hasOwnProperty(classof(O));
};

},{"./_classof":82,"./_core":87,"./_iterators":113,"./_wks":157}],161:[function(_dereq_,module,exports){
'use strict';
var ctx = _dereq_('./_ctx');
var $export = _dereq_('./_export');
var toObject = _dereq_('./_to-object');
var call = _dereq_('./_iter-call');
var isArrayIter = _dereq_('./_is-array-iter');
var toLength = _dereq_('./_to-length');
var createProperty = _dereq_('./_create-property');
var getIterFn = _dereq_('./core.get-iterator-method');

$export($export.S + $export.F * !_dereq_('./_iter-detect')(function (iter) { Array.from(iter); }), 'Array', {
  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
  from: function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
    var O = toObject(arrayLike);
    var C = typeof this == 'function' ? this : Array;
    var aLen = arguments.length;
    var mapfn = aLen > 1 ? arguments[1] : undefined;
    var mapping = mapfn !== undefined;
    var index = 0;
    var iterFn = getIterFn(O);
    var length, result, step, iterator;
    if (mapping) mapfn = ctx(mapfn, aLen > 2 ? arguments[2] : undefined, 2);
    // if object isn't iterable or it's array with default iterator - use simple case
    if (iterFn != undefined && !(C == Array && isArrayIter(iterFn))) {
      for (iterator = iterFn.call(O), result = new C(); !(step = iterator.next()).done; index++) {
        createProperty(result, index, mapping ? call(iterator, mapfn, [step.value, index], true) : step.value);
      }
    } else {
      length = toLength(O.length);
      for (result = new C(length); length > index; index++) {
        createProperty(result, index, mapping ? mapfn(O[index], index) : O[index]);
      }
    }
    result.length = index;
    return result;
  }
});

},{"./_create-property":88,"./_ctx":89,"./_export":95,"./_is-array-iter":105,"./_iter-call":108,"./_iter-detect":111,"./_to-length":149,"./_to-object":150,"./core.get-iterator-method":158}],162:[function(_dereq_,module,exports){
'use strict';
var addToUnscopables = _dereq_('./_add-to-unscopables');
var step = _dereq_('./_iter-step');
var Iterators = _dereq_('./_iterators');
var toIObject = _dereq_('./_to-iobject');

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
module.exports = _dereq_('./_iter-define')(Array, 'Array', function (iterated, kind) {
  this._t = toIObject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var kind = this._k;
  var index = this._i++;
  if (!O || index >= O.length) {
    this._t = undefined;
    return step(1);
  }
  if (kind == 'keys') return step(0, index);
  if (kind == 'values') return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');

},{"./_add-to-unscopables":73,"./_iter-define":110,"./_iter-step":112,"./_iterators":113,"./_to-iobject":148}],163:[function(_dereq_,module,exports){
'use strict';
var strong = _dereq_('./_collection-strong');
var validate = _dereq_('./_validate-collection');
var MAP = 'Map';

// 23.1 Map Objects
module.exports = _dereq_('./_collection')(MAP, function (get) {
  return function Map() { return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, {
  // 23.1.3.6 Map.prototype.get(key)
  get: function get(key) {
    var entry = strong.getEntry(validate(this, MAP), key);
    return entry && entry.v;
  },
  // 23.1.3.9 Map.prototype.set(key, value)
  set: function set(key, value) {
    return strong.def(validate(this, MAP), key === 0 ? 0 : key, value);
  }
}, strong, true);

},{"./_collection":86,"./_collection-strong":84,"./_validate-collection":154}],164:[function(_dereq_,module,exports){
// 19.1.3.1 Object.assign(target, source)
var $export = _dereq_('./_export');

$export($export.S + $export.F, 'Object', { assign: _dereq_('./_object-assign') });

},{"./_export":95,"./_object-assign":118}],165:[function(_dereq_,module,exports){
var $export = _dereq_('./_export');
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
$export($export.S, 'Object', { create: _dereq_('./_object-create') });

},{"./_export":95,"./_object-create":119}],166:[function(_dereq_,module,exports){
var $export = _dereq_('./_export');
// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
$export($export.S + $export.F * !_dereq_('./_descriptors'), 'Object', { defineProperty: _dereq_('./_object-dp').f });

},{"./_descriptors":91,"./_export":95,"./_object-dp":120}],167:[function(_dereq_,module,exports){
// 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
var toIObject = _dereq_('./_to-iobject');
var $getOwnPropertyDescriptor = _dereq_('./_object-gopd').f;

_dereq_('./_object-sap')('getOwnPropertyDescriptor', function () {
  return function getOwnPropertyDescriptor(it, key) {
    return $getOwnPropertyDescriptor(toIObject(it), key);
  };
});

},{"./_object-gopd":122,"./_object-sap":130,"./_to-iobject":148}],168:[function(_dereq_,module,exports){
// 19.1.2.9 Object.getPrototypeOf(O)
var toObject = _dereq_('./_to-object');
var $getPrototypeOf = _dereq_('./_object-gpo');

_dereq_('./_object-sap')('getPrototypeOf', function () {
  return function getPrototypeOf(it) {
    return $getPrototypeOf(toObject(it));
  };
});

},{"./_object-gpo":126,"./_object-sap":130,"./_to-object":150}],169:[function(_dereq_,module,exports){
// 19.1.3.19 Object.setPrototypeOf(O, proto)
var $export = _dereq_('./_export');
$export($export.S, 'Object', { setPrototypeOf: _dereq_('./_set-proto').set });

},{"./_export":95,"./_set-proto":138}],170:[function(_dereq_,module,exports){

},{}],171:[function(_dereq_,module,exports){
'use strict';
var LIBRARY = _dereq_('./_library');
var global = _dereq_('./_global');
var ctx = _dereq_('./_ctx');
var classof = _dereq_('./_classof');
var $export = _dereq_('./_export');
var isObject = _dereq_('./_is-object');
var aFunction = _dereq_('./_a-function');
var anInstance = _dereq_('./_an-instance');
var forOf = _dereq_('./_for-of');
var speciesConstructor = _dereq_('./_species-constructor');
var task = _dereq_('./_task').set;
var microtask = _dereq_('./_microtask')();
var newPromiseCapabilityModule = _dereq_('./_new-promise-capability');
var perform = _dereq_('./_perform');
var userAgent = _dereq_('./_user-agent');
var promiseResolve = _dereq_('./_promise-resolve');
var PROMISE = 'Promise';
var TypeError = global.TypeError;
var process = global.process;
var versions = process && process.versions;
var v8 = versions && versions.v8 || '';
var $Promise = global[PROMISE];
var isNode = classof(process) == 'process';
var empty = function () { /* empty */ };
var Internal, newGenericPromiseCapability, OwnPromiseCapability, Wrapper;
var newPromiseCapability = newGenericPromiseCapability = newPromiseCapabilityModule.f;

var USE_NATIVE = !!function () {
  try {
    // correct subclassing with @@species support
    var promise = $Promise.resolve(1);
    var FakePromise = (promise.constructor = {})[_dereq_('./_wks')('species')] = function (exec) {
      exec(empty, empty);
    };
    // unhandled rejections tracking support, NodeJS Promise without it fails @@species test
    return (isNode || typeof PromiseRejectionEvent == 'function')
      && promise.then(empty) instanceof FakePromise
      // v8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
      // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
      // we can't detect it synchronously, so just check versions
      && v8.indexOf('6.6') !== 0
      && userAgent.indexOf('Chrome/66') === -1;
  } catch (e) { /* empty */ }
}();

// helpers
var isThenable = function (it) {
  var then;
  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
};
var notify = function (promise, isReject) {
  if (promise._n) return;
  promise._n = true;
  var chain = promise._c;
  microtask(function () {
    var value = promise._v;
    var ok = promise._s == 1;
    var i = 0;
    var run = function (reaction) {
      var handler = ok ? reaction.ok : reaction.fail;
      var resolve = reaction.resolve;
      var reject = reaction.reject;
      var domain = reaction.domain;
      var result, then, exited;
      try {
        if (handler) {
          if (!ok) {
            if (promise._h == 2) onHandleUnhandled(promise);
            promise._h = 1;
          }
          if (handler === true) result = value;
          else {
            if (domain) domain.enter();
            result = handler(value); // may throw
            if (domain) {
              domain.exit();
              exited = true;
            }
          }
          if (result === reaction.promise) {
            reject(TypeError('Promise-chain cycle'));
          } else if (then = isThenable(result)) {
            then.call(result, resolve, reject);
          } else resolve(result);
        } else reject(value);
      } catch (e) {
        if (domain && !exited) domain.exit();
        reject(e);
      }
    };
    while (chain.length > i) run(chain[i++]); // variable length - can't use forEach
    promise._c = [];
    promise._n = false;
    if (isReject && !promise._h) onUnhandled(promise);
  });
};
var onUnhandled = function (promise) {
  task.call(global, function () {
    var value = promise._v;
    var unhandled = isUnhandled(promise);
    var result, handler, console;
    if (unhandled) {
      result = perform(function () {
        if (isNode) {
          process.emit('unhandledRejection', value, promise);
        } else if (handler = global.onunhandledrejection) {
          handler({ promise: promise, reason: value });
        } else if ((console = global.console) && console.error) {
          console.error('Unhandled promise rejection', value);
        }
      });
      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
      promise._h = isNode || isUnhandled(promise) ? 2 : 1;
    } promise._a = undefined;
    if (unhandled && result.e) throw result.v;
  });
};
var isUnhandled = function (promise) {
  return promise._h !== 1 && (promise._a || promise._c).length === 0;
};
var onHandleUnhandled = function (promise) {
  task.call(global, function () {
    var handler;
    if (isNode) {
      process.emit('rejectionHandled', promise);
    } else if (handler = global.onrejectionhandled) {
      handler({ promise: promise, reason: promise._v });
    }
  });
};
var $reject = function (value) {
  var promise = this;
  if (promise._d) return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  promise._v = value;
  promise._s = 2;
  if (!promise._a) promise._a = promise._c.slice();
  notify(promise, true);
};
var $resolve = function (value) {
  var promise = this;
  var then;
  if (promise._d) return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  try {
    if (promise === value) throw TypeError("Promise can't be resolved itself");
    if (then = isThenable(value)) {
      microtask(function () {
        var wrapper = { _w: promise, _d: false }; // wrap
        try {
          then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
        } catch (e) {
          $reject.call(wrapper, e);
        }
      });
    } else {
      promise._v = value;
      promise._s = 1;
      notify(promise, false);
    }
  } catch (e) {
    $reject.call({ _w: promise, _d: false }, e); // wrap
  }
};

// constructor polyfill
if (!USE_NATIVE) {
  // 25.4.3.1 Promise(executor)
  $Promise = function Promise(executor) {
    anInstance(this, $Promise, PROMISE, '_h');
    aFunction(executor);
    Internal.call(this);
    try {
      executor(ctx($resolve, this, 1), ctx($reject, this, 1));
    } catch (err) {
      $reject.call(this, err);
    }
  };
  // eslint-disable-next-line no-unused-vars
  Internal = function Promise(executor) {
    this._c = [];             // <- awaiting reactions
    this._a = undefined;      // <- checked in isUnhandled reactions
    this._s = 0;              // <- state
    this._d = false;          // <- done
    this._v = undefined;      // <- value
    this._h = 0;              // <- rejection state, 0 - default, 1 - handled, 2 - unhandled
    this._n = false;          // <- notify
  };
  Internal.prototype = _dereq_('./_redefine-all')($Promise.prototype, {
    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
    then: function then(onFulfilled, onRejected) {
      var reaction = newPromiseCapability(speciesConstructor(this, $Promise));
      reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
      reaction.fail = typeof onRejected == 'function' && onRejected;
      reaction.domain = isNode ? process.domain : undefined;
      this._c.push(reaction);
      if (this._a) this._a.push(reaction);
      if (this._s) notify(this, false);
      return reaction.promise;
    },
    // 25.4.5.1 Promise.prototype.catch(onRejected)
    'catch': function (onRejected) {
      return this.then(undefined, onRejected);
    }
  });
  OwnPromiseCapability = function () {
    var promise = new Internal();
    this.promise = promise;
    this.resolve = ctx($resolve, promise, 1);
    this.reject = ctx($reject, promise, 1);
  };
  newPromiseCapabilityModule.f = newPromiseCapability = function (C) {
    return C === $Promise || C === Wrapper
      ? new OwnPromiseCapability(C)
      : newGenericPromiseCapability(C);
  };
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, { Promise: $Promise });
_dereq_('./_set-to-string-tag')($Promise, PROMISE);
_dereq_('./_set-species')(PROMISE);
Wrapper = _dereq_('./_core')[PROMISE];

// statics
$export($export.S + $export.F * !USE_NATIVE, PROMISE, {
  // 25.4.4.5 Promise.reject(r)
  reject: function reject(r) {
    var capability = newPromiseCapability(this);
    var $$reject = capability.reject;
    $$reject(r);
    return capability.promise;
  }
});
$export($export.S + $export.F * (LIBRARY || !USE_NATIVE), PROMISE, {
  // 25.4.4.6 Promise.resolve(x)
  resolve: function resolve(x) {
    return promiseResolve(LIBRARY && this === Wrapper ? $Promise : this, x);
  }
});
$export($export.S + $export.F * !(USE_NATIVE && _dereq_('./_iter-detect')(function (iter) {
  $Promise.all(iter)['catch'](empty);
})), PROMISE, {
  // 25.4.4.1 Promise.all(iterable)
  all: function all(iterable) {
    var C = this;
    var capability = newPromiseCapability(C);
    var resolve = capability.resolve;
    var reject = capability.reject;
    var result = perform(function () {
      var values = [];
      var index = 0;
      var remaining = 1;
      forOf(iterable, false, function (promise) {
        var $index = index++;
        var alreadyCalled = false;
        values.push(undefined);
        remaining++;
        C.resolve(promise).then(function (value) {
          if (alreadyCalled) return;
          alreadyCalled = true;
          values[$index] = value;
          --remaining || resolve(values);
        }, reject);
      });
      --remaining || resolve(values);
    });
    if (result.e) reject(result.v);
    return capability.promise;
  },
  // 25.4.4.4 Promise.race(iterable)
  race: function race(iterable) {
    var C = this;
    var capability = newPromiseCapability(C);
    var reject = capability.reject;
    var result = perform(function () {
      forOf(iterable, false, function (promise) {
        C.resolve(promise).then(capability.resolve, reject);
      });
    });
    if (result.e) reject(result.v);
    return capability.promise;
  }
});

},{"./_a-function":72,"./_an-instance":74,"./_classof":82,"./_core":87,"./_ctx":89,"./_export":95,"./_for-of":97,"./_global":98,"./_is-object":107,"./_iter-detect":111,"./_library":114,"./_microtask":116,"./_new-promise-capability":117,"./_perform":131,"./_promise-resolve":132,"./_redefine-all":134,"./_set-species":139,"./_set-to-string-tag":140,"./_species-constructor":143,"./_task":145,"./_user-agent":153,"./_wks":157}],172:[function(_dereq_,module,exports){
// 26.1.2 Reflect.construct(target, argumentsList [, newTarget])
var $export = _dereq_('./_export');
var create = _dereq_('./_object-create');
var aFunction = _dereq_('./_a-function');
var anObject = _dereq_('./_an-object');
var isObject = _dereq_('./_is-object');
var fails = _dereq_('./_fails');
var bind = _dereq_('./_bind');
var rConstruct = (_dereq_('./_global').Reflect || {}).construct;

// MS Edge supports only 2 arguments and argumentsList argument is optional
// FF Nightly sets third argument as `new.target`, but does not create `this` from it
var NEW_TARGET_BUG = fails(function () {
  function F() { /* empty */ }
  return !(rConstruct(function () { /* empty */ }, [], F) instanceof F);
});
var ARGS_BUG = !fails(function () {
  rConstruct(function () { /* empty */ });
});

$export($export.S + $export.F * (NEW_TARGET_BUG || ARGS_BUG), 'Reflect', {
  construct: function construct(Target, args /* , newTarget */) {
    aFunction(Target);
    anObject(args);
    var newTarget = arguments.length < 3 ? Target : aFunction(arguments[2]);
    if (ARGS_BUG && !NEW_TARGET_BUG) return rConstruct(Target, args, newTarget);
    if (Target == newTarget) {
      // w/o altered newTarget, optimization for 0-4 arguments
      switch (args.length) {
        case 0: return new Target();
        case 1: return new Target(args[0]);
        case 2: return new Target(args[0], args[1]);
        case 3: return new Target(args[0], args[1], args[2]);
        case 4: return new Target(args[0], args[1], args[2], args[3]);
      }
      // w/o altered newTarget, lot of arguments case
      var $args = [null];
      $args.push.apply($args, args);
      return new (bind.apply(Target, $args))();
    }
    // with altered newTarget, not support built-in constructors
    var proto = newTarget.prototype;
    var instance = create(isObject(proto) ? proto : Object.prototype);
    var result = Function.apply.call(Target, instance, args);
    return isObject(result) ? result : instance;
  }
});

},{"./_a-function":72,"./_an-object":75,"./_bind":81,"./_export":95,"./_fails":96,"./_global":98,"./_is-object":107,"./_object-create":119}],173:[function(_dereq_,module,exports){
'use strict';
var strong = _dereq_('./_collection-strong');
var validate = _dereq_('./_validate-collection');
var SET = 'Set';

// 23.2 Set Objects
module.exports = _dereq_('./_collection')(SET, function (get) {
  return function Set() { return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, {
  // 23.2.3.1 Set.prototype.add(value)
  add: function add(value) {
    return strong.def(validate(this, SET), value = value === 0 ? 0 : value, value);
  }
}, strong);

},{"./_collection":86,"./_collection-strong":84,"./_validate-collection":154}],174:[function(_dereq_,module,exports){
'use strict';
var $at = _dereq_('./_string-at')(true);

// 21.1.3.27 String.prototype[@@iterator]()
_dereq_('./_iter-define')(String, 'String', function (iterated) {
  this._t = String(iterated); // target
  this._i = 0;                // next index
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var index = this._i;
  var point;
  if (index >= O.length) return { value: undefined, done: true };
  point = $at(O, index);
  this._i += point.length;
  return { value: point, done: false };
});

},{"./_iter-define":110,"./_string-at":144}],175:[function(_dereq_,module,exports){
'use strict';
// ECMAScript 6 symbols shim
var global = _dereq_('./_global');
var has = _dereq_('./_has');
var DESCRIPTORS = _dereq_('./_descriptors');
var $export = _dereq_('./_export');
var redefine = _dereq_('./_redefine');
var META = _dereq_('./_meta').KEY;
var $fails = _dereq_('./_fails');
var shared = _dereq_('./_shared');
var setToStringTag = _dereq_('./_set-to-string-tag');
var uid = _dereq_('./_uid');
var wks = _dereq_('./_wks');
var wksExt = _dereq_('./_wks-ext');
var wksDefine = _dereq_('./_wks-define');
var enumKeys = _dereq_('./_enum-keys');
var isArray = _dereq_('./_is-array');
var anObject = _dereq_('./_an-object');
var isObject = _dereq_('./_is-object');
var toIObject = _dereq_('./_to-iobject');
var toPrimitive = _dereq_('./_to-primitive');
var createDesc = _dereq_('./_property-desc');
var _create = _dereq_('./_object-create');
var gOPNExt = _dereq_('./_object-gopn-ext');
var $GOPD = _dereq_('./_object-gopd');
var $DP = _dereq_('./_object-dp');
var $keys = _dereq_('./_object-keys');
var gOPD = $GOPD.f;
var dP = $DP.f;
var gOPN = gOPNExt.f;
var $Symbol = global.Symbol;
var $JSON = global.JSON;
var _stringify = $JSON && $JSON.stringify;
var PROTOTYPE = 'prototype';
var HIDDEN = wks('_hidden');
var TO_PRIMITIVE = wks('toPrimitive');
var isEnum = {}.propertyIsEnumerable;
var SymbolRegistry = shared('symbol-registry');
var AllSymbols = shared('symbols');
var OPSymbols = shared('op-symbols');
var ObjectProto = Object[PROTOTYPE];
var USE_NATIVE = typeof $Symbol == 'function';
var QObject = global.QObject;
// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
var setter = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;

// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
var setSymbolDesc = DESCRIPTORS && $fails(function () {
  return _create(dP({}, 'a', {
    get: function () { return dP(this, 'a', { value: 7 }).a; }
  })).a != 7;
}) ? function (it, key, D) {
  var protoDesc = gOPD(ObjectProto, key);
  if (protoDesc) delete ObjectProto[key];
  dP(it, key, D);
  if (protoDesc && it !== ObjectProto) dP(ObjectProto, key, protoDesc);
} : dP;

var wrap = function (tag) {
  var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
  sym._k = tag;
  return sym;
};

var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function (it) {
  return typeof it == 'symbol';
} : function (it) {
  return it instanceof $Symbol;
};

var $defineProperty = function defineProperty(it, key, D) {
  if (it === ObjectProto) $defineProperty(OPSymbols, key, D);
  anObject(it);
  key = toPrimitive(key, true);
  anObject(D);
  if (has(AllSymbols, key)) {
    if (!D.enumerable) {
      if (!has(it, HIDDEN)) dP(it, HIDDEN, createDesc(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if (has(it, HIDDEN) && it[HIDDEN][key]) it[HIDDEN][key] = false;
      D = _create(D, { enumerable: createDesc(0, false) });
    } return setSymbolDesc(it, key, D);
  } return dP(it, key, D);
};
var $defineProperties = function defineProperties(it, P) {
  anObject(it);
  var keys = enumKeys(P = toIObject(P));
  var i = 0;
  var l = keys.length;
  var key;
  while (l > i) $defineProperty(it, key = keys[i++], P[key]);
  return it;
};
var $create = function create(it, P) {
  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
};
var $propertyIsEnumerable = function propertyIsEnumerable(key) {
  var E = isEnum.call(this, key = toPrimitive(key, true));
  if (this === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return false;
  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
};
var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
  it = toIObject(it);
  key = toPrimitive(key, true);
  if (it === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return;
  var D = gOPD(it, key);
  if (D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key])) D.enumerable = true;
  return D;
};
var $getOwnPropertyNames = function getOwnPropertyNames(it) {
  var names = gOPN(toIObject(it));
  var result = [];
  var i = 0;
  var key;
  while (names.length > i) {
    if (!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META) result.push(key);
  } return result;
};
var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
  var IS_OP = it === ObjectProto;
  var names = gOPN(IS_OP ? OPSymbols : toIObject(it));
  var result = [];
  var i = 0;
  var key;
  while (names.length > i) {
    if (has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectProto, key) : true)) result.push(AllSymbols[key]);
  } return result;
};

// 19.4.1.1 Symbol([description])
if (!USE_NATIVE) {
  $Symbol = function Symbol() {
    if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor!');
    var tag = uid(arguments.length > 0 ? arguments[0] : undefined);
    var $set = function (value) {
      if (this === ObjectProto) $set.call(OPSymbols, value);
      if (has(this, HIDDEN) && has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
      setSymbolDesc(this, tag, createDesc(1, value));
    };
    if (DESCRIPTORS && setter) setSymbolDesc(ObjectProto, tag, { configurable: true, set: $set });
    return wrap(tag);
  };
  redefine($Symbol[PROTOTYPE], 'toString', function toString() {
    return this._k;
  });

  $GOPD.f = $getOwnPropertyDescriptor;
  $DP.f = $defineProperty;
  _dereq_('./_object-gopn').f = gOPNExt.f = $getOwnPropertyNames;
  _dereq_('./_object-pie').f = $propertyIsEnumerable;
  _dereq_('./_object-gops').f = $getOwnPropertySymbols;

  if (DESCRIPTORS && !_dereq_('./_library')) {
    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
  }

  wksExt.f = function (name) {
    return wrap(wks(name));
  };
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, { Symbol: $Symbol });

for (var es6Symbols = (
  // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
).split(','), j = 0; es6Symbols.length > j;)wks(es6Symbols[j++]);

for (var wellKnownSymbols = $keys(wks.store), k = 0; wellKnownSymbols.length > k;) wksDefine(wellKnownSymbols[k++]);

$export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
  // 19.4.2.1 Symbol.for(key)
  'for': function (key) {
    return has(SymbolRegistry, key += '')
      ? SymbolRegistry[key]
      : SymbolRegistry[key] = $Symbol(key);
  },
  // 19.4.2.5 Symbol.keyFor(sym)
  keyFor: function keyFor(sym) {
    if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol!');
    for (var key in SymbolRegistry) if (SymbolRegistry[key] === sym) return key;
  },
  useSetter: function () { setter = true; },
  useSimple: function () { setter = false; }
});

$export($export.S + $export.F * !USE_NATIVE, 'Object', {
  // 19.1.2.2 Object.create(O [, Properties])
  create: $create,
  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
  defineProperty: $defineProperty,
  // 19.1.2.3 Object.defineProperties(O, Properties)
  defineProperties: $defineProperties,
  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: $getOwnPropertyNames,
  // 19.1.2.8 Object.getOwnPropertySymbols(O)
  getOwnPropertySymbols: $getOwnPropertySymbols
});

// 24.3.2 JSON.stringify(value [, replacer [, space]])
$JSON && $export($export.S + $export.F * (!USE_NATIVE || $fails(function () {
  var S = $Symbol();
  // MS Edge converts symbol values to JSON as {}
  // WebKit converts symbol values to JSON as null
  // V8 throws on boxed symbols
  return _stringify([S]) != '[null]' || _stringify({ a: S }) != '{}' || _stringify(Object(S)) != '{}';
})), 'JSON', {
  stringify: function stringify(it) {
    var args = [it];
    var i = 1;
    var replacer, $replacer;
    while (arguments.length > i) args.push(arguments[i++]);
    $replacer = replacer = args[1];
    if (!isObject(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
    if (!isArray(replacer)) replacer = function (key, value) {
      if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
      if (!isSymbol(value)) return value;
    };
    args[1] = replacer;
    return _stringify.apply($JSON, args);
  }
});

// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
$Symbol[PROTOTYPE][TO_PRIMITIVE] || _dereq_('./_hide')($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
// 19.4.3.5 Symbol.prototype[@@toStringTag]
setToStringTag($Symbol, 'Symbol');
// 20.2.1.9 Math[@@toStringTag]
setToStringTag(Math, 'Math', true);
// 24.3.3 JSON[@@toStringTag]
setToStringTag(global.JSON, 'JSON', true);

},{"./_an-object":75,"./_descriptors":91,"./_enum-keys":94,"./_export":95,"./_fails":96,"./_global":98,"./_has":99,"./_hide":100,"./_is-array":106,"./_is-object":107,"./_library":114,"./_meta":115,"./_object-create":119,"./_object-dp":120,"./_object-gopd":122,"./_object-gopn":124,"./_object-gopn-ext":123,"./_object-gops":125,"./_object-keys":128,"./_object-pie":129,"./_property-desc":133,"./_redefine":135,"./_set-to-string-tag":140,"./_shared":142,"./_to-iobject":148,"./_to-primitive":151,"./_uid":152,"./_wks":157,"./_wks-define":155,"./_wks-ext":156}],176:[function(_dereq_,module,exports){
// https://tc39.github.io/proposal-setmap-offrom/#sec-map.from
_dereq_('./_set-collection-from')('Map');

},{"./_set-collection-from":136}],177:[function(_dereq_,module,exports){
// https://tc39.github.io/proposal-setmap-offrom/#sec-map.of
_dereq_('./_set-collection-of')('Map');

},{"./_set-collection-of":137}],178:[function(_dereq_,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var $export = _dereq_('./_export');

$export($export.P + $export.R, 'Map', { toJSON: _dereq_('./_collection-to-json')('Map') });

},{"./_collection-to-json":85,"./_export":95}],179:[function(_dereq_,module,exports){
// https://github.com/tc39/proposal-promise-finally
'use strict';
var $export = _dereq_('./_export');
var core = _dereq_('./_core');
var global = _dereq_('./_global');
var speciesConstructor = _dereq_('./_species-constructor');
var promiseResolve = _dereq_('./_promise-resolve');

$export($export.P + $export.R, 'Promise', { 'finally': function (onFinally) {
  var C = speciesConstructor(this, core.Promise || global.Promise);
  var isFunction = typeof onFinally == 'function';
  return this.then(
    isFunction ? function (x) {
      return promiseResolve(C, onFinally()).then(function () { return x; });
    } : onFinally,
    isFunction ? function (e) {
      return promiseResolve(C, onFinally()).then(function () { throw e; });
    } : onFinally
  );
} });

},{"./_core":87,"./_export":95,"./_global":98,"./_promise-resolve":132,"./_species-constructor":143}],180:[function(_dereq_,module,exports){
'use strict';
// https://github.com/tc39/proposal-promise-try
var $export = _dereq_('./_export');
var newPromiseCapability = _dereq_('./_new-promise-capability');
var perform = _dereq_('./_perform');

$export($export.S, 'Promise', { 'try': function (callbackfn) {
  var promiseCapability = newPromiseCapability.f(this);
  var result = perform(callbackfn);
  (result.e ? promiseCapability.reject : promiseCapability.resolve)(result.v);
  return promiseCapability.promise;
} });

},{"./_export":95,"./_new-promise-capability":117,"./_perform":131}],181:[function(_dereq_,module,exports){
// https://tc39.github.io/proposal-setmap-offrom/#sec-set.from
_dereq_('./_set-collection-from')('Set');

},{"./_set-collection-from":136}],182:[function(_dereq_,module,exports){
// https://tc39.github.io/proposal-setmap-offrom/#sec-set.of
_dereq_('./_set-collection-of')('Set');

},{"./_set-collection-of":137}],183:[function(_dereq_,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var $export = _dereq_('./_export');

$export($export.P + $export.R, 'Set', { toJSON: _dereq_('./_collection-to-json')('Set') });

},{"./_collection-to-json":85,"./_export":95}],184:[function(_dereq_,module,exports){
_dereq_('./_wks-define')('asyncIterator');

},{"./_wks-define":155}],185:[function(_dereq_,module,exports){
_dereq_('./_wks-define')('observable');

},{"./_wks-define":155}],186:[function(_dereq_,module,exports){
_dereq_('./es6.array.iterator');
var global = _dereq_('./_global');
var hide = _dereq_('./_hide');
var Iterators = _dereq_('./_iterators');
var TO_STRING_TAG = _dereq_('./_wks')('toStringTag');

var DOMIterables = ('CSSRuleList,CSSStyleDeclaration,CSSValueList,ClientRectList,DOMRectList,DOMStringList,' +
  'DOMTokenList,DataTransferItemList,FileList,HTMLAllCollection,HTMLCollection,HTMLFormElement,HTMLSelectElement,' +
  'MediaList,MimeTypeArray,NamedNodeMap,NodeList,PaintRequestList,Plugin,PluginArray,SVGLengthList,SVGNumberList,' +
  'SVGPathSegList,SVGPointList,SVGStringList,SVGTransformList,SourceBufferList,StyleSheetList,TextTrackCueList,' +
  'TextTrackList,TouchList').split(',');

for (var i = 0; i < DOMIterables.length; i++) {
  var NAME = DOMIterables[i];
  var Collection = global[NAME];
  var proto = Collection && Collection.prototype;
  if (proto && !proto[TO_STRING_TAG]) hide(proto, TO_STRING_TAG, NAME);
  Iterators[NAME] = Iterators.Array;
}

},{"./_global":98,"./_hide":100,"./_iterators":113,"./_wks":157,"./es6.array.iterator":162}],187:[function(_dereq_,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var objectCreate = Object.create || objectCreatePolyfill
var objectKeys = Object.keys || objectKeysPolyfill
var bind = Function.prototype.bind || functionBindPolyfill

function EventEmitter() {
  if (!this._events || !Object.prototype.hasOwnProperty.call(this, '_events')) {
    this._events = objectCreate(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

var hasDefineProperty;
try {
  var o = {};
  if (Object.defineProperty) Object.defineProperty(o, 'x', { value: 0 });
  hasDefineProperty = o.x === 0;
} catch (err) { hasDefineProperty = false }
if (hasDefineProperty) {
  Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
    enumerable: true,
    get: function() {
      return defaultMaxListeners;
    },
    set: function(arg) {
      // check whether the input is a positive number (whose value is zero or
      // greater and not a NaN).
      if (typeof arg !== 'number' || arg < 0 || arg !== arg)
        throw new TypeError('"defaultMaxListeners" must be a positive number');
      defaultMaxListeners = arg;
    }
  });
} else {
  EventEmitter.defaultMaxListeners = defaultMaxListeners;
}

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || isNaN(n))
    throw new TypeError('"n" argument must be a positive number');
  this._maxListeners = n;
  return this;
};

function $getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return $getMaxListeners(this);
};

// These standalone emit* functions are used to optimize calling of event
// handlers for fast cases because emit() itself often has a variable number of
// arguments and can be deoptimized because of that. These functions always have
// the same number of arguments and thus do not get deoptimized, so the code
// inside them can execute faster.
function emitNone(handler, isFn, self) {
  if (isFn)
    handler.call(self);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self);
  }
}
function emitOne(handler, isFn, self, arg1) {
  if (isFn)
    handler.call(self, arg1);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1);
  }
}
function emitTwo(handler, isFn, self, arg1, arg2) {
  if (isFn)
    handler.call(self, arg1, arg2);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2);
  }
}
function emitThree(handler, isFn, self, arg1, arg2, arg3) {
  if (isFn)
    handler.call(self, arg1, arg2, arg3);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2, arg3);
  }
}

function emitMany(handler, isFn, self, args) {
  if (isFn)
    handler.apply(self, args);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].apply(self, args);
  }
}

EventEmitter.prototype.emit = function emit(type) {
  var er, handler, len, args, i, events;
  var doError = (type === 'error');

  events = this._events;
  if (events)
    doError = (doError && events.error == null);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    if (arguments.length > 1)
      er = arguments[1];
    if (er instanceof Error) {
      throw er; // Unhandled 'error' event
    } else {
      // At least give some kind of context to the user
      var err = new Error('Unhandled "error" event. (' + er + ')');
      err.context = er;
      throw err;
    }
    return false;
  }

  handler = events[type];

  if (!handler)
    return false;

  var isFn = typeof handler === 'function';
  len = arguments.length;
  switch (len) {
      // fast cases
    case 1:
      emitNone(handler, isFn, this);
      break;
    case 2:
      emitOne(handler, isFn, this, arguments[1]);
      break;
    case 3:
      emitTwo(handler, isFn, this, arguments[1], arguments[2]);
      break;
    case 4:
      emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
      break;
      // slower
    default:
      args = new Array(len - 1);
      for (i = 1; i < len; i++)
        args[i - 1] = arguments[i];
      emitMany(handler, isFn, this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');

  events = target._events;
  if (!events) {
    events = target._events = objectCreate(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener) {
      target.emit('newListener', type,
          listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (!existing) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
          prepend ? [listener, existing] : [existing, listener];
    } else {
      // If we've already got an array, just append.
      if (prepend) {
        existing.unshift(listener);
      } else {
        existing.push(listener);
      }
    }

    // Check for listener leak
    if (!existing.warned) {
      m = $getMaxListeners(target);
      if (m && m > 0 && existing.length > m) {
        existing.warned = true;
        var w = new Error('Possible EventEmitter memory leak detected. ' +
            existing.length + ' "' + String(type) + '" listeners ' +
            'added. Use emitter.setMaxListeners() to ' +
            'increase limit.');
        w.name = 'MaxListenersExceededWarning';
        w.emitter = target;
        w.type = type;
        w.count = existing.length;
        if (typeof console === 'object' && console.warn) {
          console.warn('%s: %s', w.name, w.message);
        }
      }
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    switch (arguments.length) {
      case 0:
        return this.listener.call(this.target);
      case 1:
        return this.listener.call(this.target, arguments[0]);
      case 2:
        return this.listener.call(this.target, arguments[0], arguments[1]);
      case 3:
        return this.listener.call(this.target, arguments[0], arguments[1],
            arguments[2]);
      default:
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; ++i)
          args[i] = arguments[i];
        this.listener.apply(this.target, args);
    }
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = bind.call(onceWrapper, state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');

      events = this._events;
      if (!events)
        return this;

      list = events[type];
      if (!list)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = objectCreate(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else
          spliceOne(list, position);

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (!events)
        return this;

      // not listening for removeListener, no need to emit
      if (!events.removeListener) {
        if (arguments.length === 0) {
          this._events = objectCreate(null);
          this._eventsCount = 0;
        } else if (events[type]) {
          if (--this._eventsCount === 0)
            this._events = objectCreate(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = objectKeys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = objectCreate(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (!events)
    return [];

  var evlistener = events[type];
  if (!evlistener)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
};

// About 1.5x faster than the two-arg version of Array#splice().
function spliceOne(list, index) {
  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
    list[i] = list[k];
  list.pop();
}

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function objectCreatePolyfill(proto) {
  var F = function() {};
  F.prototype = proto;
  return new F;
}
function objectKeysPolyfill(obj) {
  var keys = [];
  for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k)) {
    keys.push(k);
  }
  return k;
}
function functionBindPolyfill(context) {
  var fn = this;
  return function () {
    return fn.apply(context, arguments);
  };
}

},{}],188:[function(_dereq_,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],189:[function(_dereq_,module,exports){
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("StateMachine", [], factory);
	else if(typeof exports === 'object')
		exports["StateMachine"] = factory();
	else
		root["StateMachine"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function(target, sources) {
  var n, source, key;
  for(n = 1 ; n < arguments.length ; n++) {
    source = arguments[n];
    for(key in source) {
      if (source.hasOwnProperty(key))
        target[key] = source[key];
    }
  }
  return target;
}


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


//-------------------------------------------------------------------------------------------------

var mixin = __webpack_require__(0);

//-------------------------------------------------------------------------------------------------

module.exports = {

  build: function(target, config) {
    var n, max, plugin, plugins = config.plugins;
    for(n = 0, max = plugins.length ; n < max ; n++) {
      plugin = plugins[n];
      if (plugin.methods)
        mixin(target, plugin.methods);
      if (plugin.properties)
        Object.defineProperties(target, plugin.properties);
    }
  },

  hook: function(fsm, name, additional) {
    var n, max, method, plugin,
        plugins = fsm.config.plugins,
        args    = [fsm.context];

    if (additional)
      args = args.concat(additional)

    for(n = 0, max = plugins.length ; n < max ; n++) {
      plugin = plugins[n]
      method = plugins[n][name]
      if (method)
        method.apply(plugin, args);
    }
  }

}

//-------------------------------------------------------------------------------------------------


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


//-------------------------------------------------------------------------------------------------

function camelize(label) {

  if (label.length === 0)
    return label;

  var n, result, word, words = label.split(/[_-]/);

  // single word with first character already lowercase, return untouched
  if ((words.length === 1) && (words[0][0].toLowerCase() === words[0][0]))
    return label;

  result = words[0].toLowerCase();
  for(n = 1 ; n < words.length ; n++) {
    result = result + words[n].charAt(0).toUpperCase() + words[n].substring(1).toLowerCase();
  }

  return result;
}

//-------------------------------------------------------------------------------------------------

camelize.prepended = function(prepend, label) {
  label = camelize(label);
  return prepend + label[0].toUpperCase() + label.substring(1);
}

//-------------------------------------------------------------------------------------------------

module.exports = camelize;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


//-------------------------------------------------------------------------------------------------

var mixin    = __webpack_require__(0),
    camelize = __webpack_require__(2);

//-------------------------------------------------------------------------------------------------

function Config(options, StateMachine) {

  options = options || {};

  this.options     = options; // preserving original options can be useful (e.g visualize plugin)
  this.defaults    = StateMachine.defaults;
  this.states      = [];
  this.transitions = [];
  this.map         = {};
  this.lifecycle   = this.configureLifecycle();
  this.init        = this.configureInitTransition(options.init);
  this.data        = this.configureData(options.data);
  this.methods     = this.configureMethods(options.methods);

  this.map[this.defaults.wildcard] = {};

  this.configureTransitions(options.transitions || []);

  this.plugins = this.configurePlugins(options.plugins, StateMachine.plugin);

}

//-------------------------------------------------------------------------------------------------

mixin(Config.prototype, {

  addState: function(name) {
    if (!this.map[name]) {
      this.states.push(name);
      this.addStateLifecycleNames(name);
      this.map[name] = {};
    }
  },

  addStateLifecycleNames: function(name) {
    this.lifecycle.onEnter[name] = camelize.prepended('onEnter', name);
    this.lifecycle.onLeave[name] = camelize.prepended('onLeave', name);
    this.lifecycle.on[name]      = camelize.prepended('on',      name);
  },

  addTransition: function(name) {
    if (this.transitions.indexOf(name) < 0) {
      this.transitions.push(name);
      this.addTransitionLifecycleNames(name);
    }
  },

  addTransitionLifecycleNames: function(name) {
    this.lifecycle.onBefore[name] = camelize.prepended('onBefore', name);
    this.lifecycle.onAfter[name]  = camelize.prepended('onAfter',  name);
    this.lifecycle.on[name]       = camelize.prepended('on',       name);
  },

  mapTransition: function(transition) {
    var name = transition.name,
        from = transition.from,
        to   = transition.to;
    this.addState(from);
    if (typeof to !== 'function')
      this.addState(to);
    this.addTransition(name);
    this.map[from][name] = transition;
    return transition;
  },

  configureLifecycle: function() {
    return {
      onBefore: { transition: 'onBeforeTransition' },
      onAfter:  { transition: 'onAfterTransition'  },
      onEnter:  { state:      'onEnterState'       },
      onLeave:  { state:      'onLeaveState'       },
      on:       { transition: 'onTransition'       }
    };
  },

  configureInitTransition: function(init) {
    if (typeof init === 'string') {
      return this.mapTransition(mixin({}, this.defaults.init, { to: init, active: true }));
    }
    else if (typeof init === 'object') {
      return this.mapTransition(mixin({}, this.defaults.init, init, { active: true }));
    }
    else {
      this.addState(this.defaults.init.from);
      return this.defaults.init;
    }
  },

  configureData: function(data) {
    if (typeof data === 'function')
      return data;
    else if (typeof data === 'object')
      return function() { return data; }
    else
      return function() { return {};  }
  },

  configureMethods: function(methods) {
    return methods || {};
  },

  configurePlugins: function(plugins, builtin) {
    plugins = plugins || [];
    var n, max, plugin;
    for(n = 0, max = plugins.length ; n < max ; n++) {
      plugin = plugins[n];
      if (typeof plugin === 'function')
        plugins[n] = plugin = plugin()
      if (plugin.configure)
        plugin.configure(this);
    }
    return plugins
  },

  configureTransitions: function(transitions) {
    var i, n, transition, from, to, wildcard = this.defaults.wildcard;
    for(n = 0 ; n < transitions.length ; n++) {
      transition = transitions[n];
      from  = Array.isArray(transition.from) ? transition.from : [transition.from || wildcard]
      to    = transition.to || wildcard;
      for(i = 0 ; i < from.length ; i++) {
        this.mapTransition({ name: transition.name, from: from[i], to: to });
      }
    }
  },

  transitionFor: function(state, transition) {
    var wildcard = this.defaults.wildcard;
    return this.map[state][transition] ||
           this.map[wildcard][transition];
  },

  transitionsFor: function(state) {
    var wildcard = this.defaults.wildcard;
    return Object.keys(this.map[state]).concat(Object.keys(this.map[wildcard]));
  },

  allStates: function() {
    return this.states;
  },

  allTransitions: function() {
    return this.transitions;
  }

});

//-------------------------------------------------------------------------------------------------

module.exports = Config;

//-------------------------------------------------------------------------------------------------


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {


var mixin      = __webpack_require__(0),
    Exception  = __webpack_require__(6),
    plugin     = __webpack_require__(1),
    UNOBSERVED = [ null, [] ];

//-------------------------------------------------------------------------------------------------

function JSM(context, config) {
  this.context   = context;
  this.config    = config;
  this.state     = config.init.from;
  this.observers = [context];
}

//-------------------------------------------------------------------------------------------------

mixin(JSM.prototype, {

  init: function(args) {
    mixin(this.context, this.config.data.apply(this.context, args));
    plugin.hook(this, 'init');
    if (this.config.init.active)
      return this.fire(this.config.init.name, []);
  },

  is: function(state) {
    return Array.isArray(state) ? (state.indexOf(this.state) >= 0) : (this.state === state);
  },

  isPending: function() {
    return this.pending;
  },

  can: function(transition) {
    return !this.isPending() && !!this.seek(transition);
  },

  cannot: function(transition) {
    return !this.can(transition);
  },

  allStates: function() {
    return this.config.allStates();
  },

  allTransitions: function() {
    return this.config.allTransitions();
  },

  transitions: function() {
    return this.config.transitionsFor(this.state);
  },

  seek: function(transition, args) {
    var wildcard = this.config.defaults.wildcard,
        entry    = this.config.transitionFor(this.state, transition),
        to       = entry && entry.to;
    if (typeof to === 'function')
      return to.apply(this.context, args);
    else if (to === wildcard)
      return this.state
    else
      return to
  },

  fire: function(transition, args) {
    return this.transit(transition, this.state, this.seek(transition, args), args);
  },

  transit: function(transition, from, to, args) {

    var lifecycle = this.config.lifecycle,
        changed   = this.config.options.observeUnchangedState || (from !== to);

    if (!to)
      return this.context.onInvalidTransition(transition, from, to);

    if (this.isPending())
      return this.context.onPendingTransition(transition, from, to);

    this.config.addState(to);  // might need to add this state if it's unknown (e.g. conditional transition or goto)

    this.beginTransit();

    args.unshift({             // this context will be passed to each lifecycle event observer
      transition: transition,
      from:       from,
      to:         to,
      fsm:        this.context
    });

    return this.observeEvents([
                this.observersForEvent(lifecycle.onBefore.transition),
                this.observersForEvent(lifecycle.onBefore[transition]),
      changed ? this.observersForEvent(lifecycle.onLeave.state) : UNOBSERVED,
      changed ? this.observersForEvent(lifecycle.onLeave[from]) : UNOBSERVED,
                this.observersForEvent(lifecycle.on.transition),
      changed ? [ 'doTransit', [ this ] ]                       : UNOBSERVED,
      changed ? this.observersForEvent(lifecycle.onEnter.state) : UNOBSERVED,
      changed ? this.observersForEvent(lifecycle.onEnter[to])   : UNOBSERVED,
      changed ? this.observersForEvent(lifecycle.on[to])        : UNOBSERVED,
                this.observersForEvent(lifecycle.onAfter.transition),
                this.observersForEvent(lifecycle.onAfter[transition]),
                this.observersForEvent(lifecycle.on[transition])
    ], args);
  },

  beginTransit: function()          { this.pending = true;                 },
  endTransit:   function(result)    { this.pending = false; return result; },
  failTransit:  function(result)    { this.pending = false; throw result;  },
  doTransit:    function(lifecycle) { this.state = lifecycle.to;           },

  observe: function(args) {
    if (args.length === 2) {
      var observer = {};
      observer[args[0]] = args[1];
      this.observers.push(observer);
    }
    else {
      this.observers.push(args[0]);
    }
  },

  observersForEvent: function(event) { // TODO: this could be cached
    var n = 0, max = this.observers.length, observer, result = [];
    for( ; n < max ; n++) {
      observer = this.observers[n];
      if (observer[event])
        result.push(observer);
    }
    return [ event, result, true ]
  },

  observeEvents: function(events, args, previousEvent, previousResult) {
    if (events.length === 0) {
      return this.endTransit(previousResult === undefined ? true : previousResult);
    }

    var event     = events[0][0],
        observers = events[0][1],
        pluggable = events[0][2];

    args[0].event = event;
    if (event && pluggable && event !== previousEvent)
      plugin.hook(this, 'lifecycle', args);

    if (observers.length === 0) {
      events.shift();
      return this.observeEvents(events, args, event, previousResult);
    }
    else {
      var observer = observers.shift(),
          result = observer[event].apply(observer, args);
      if (result && typeof result.then === 'function') {
        return result.then(this.observeEvents.bind(this, events, args, event))
                     .catch(this.failTransit.bind(this))
      }
      else if (result === false) {
        return this.endTransit(false);
      }
      else {
        return this.observeEvents(events, args, event, result);
      }
    }
  },

  onInvalidTransition: function(transition, from, to) {
    throw new Exception("transition is invalid in current state", transition, from, to, this.state);
  },

  onPendingTransition: function(transition, from, to) {
    throw new Exception("transition is invalid while previous transition is still in progress", transition, from, to, this.state);
  }

});

//-------------------------------------------------------------------------------------------------

module.exports = JSM;

//-------------------------------------------------------------------------------------------------


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


//-----------------------------------------------------------------------------------------------

var mixin    = __webpack_require__(0),
    camelize = __webpack_require__(2),
    plugin   = __webpack_require__(1),
    Config   = __webpack_require__(3),
    JSM      = __webpack_require__(4);

//-----------------------------------------------------------------------------------------------

var PublicMethods = {
  is:                  function(state)       { return this._fsm.is(state)                                     },
  can:                 function(transition)  { return this._fsm.can(transition)                               },
  cannot:              function(transition)  { return this._fsm.cannot(transition)                            },
  observe:             function()            { return this._fsm.observe(arguments)                            },
  transitions:         function()            { return this._fsm.transitions()                                 },
  allTransitions:      function()            { return this._fsm.allTransitions()                              },
  allStates:           function()            { return this._fsm.allStates()                                   },
  onInvalidTransition: function(t, from, to) { return this._fsm.onInvalidTransition(t, from, to)              },
  onPendingTransition: function(t, from, to) { return this._fsm.onPendingTransition(t, from, to)              },
}

var PublicProperties = {
  state: {
    configurable: false,
    enumerable:   true,
    get: function() {
      return this._fsm.state;
    },
    set: function(state) {
      throw Error('use transitions to change state')
    }
  }
}

//-----------------------------------------------------------------------------------------------

function StateMachine(options) {
  return apply(this || {}, options);
}

function factory() {
  var cstor, options;
  if (typeof arguments[0] === 'function') {
    cstor   = arguments[0];
    options = arguments[1] || {};
  }
  else {
    cstor   = function() { this._fsm.apply(this, arguments) };
    options = arguments[0] || {};
  }
  var config = new Config(options, StateMachine);
  build(cstor.prototype, config);
  cstor.prototype._fsm.config = config; // convenience access to shared config without needing an instance
  return cstor;
}

//-------------------------------------------------------------------------------------------------

function apply(instance, options) {
  var config = new Config(options, StateMachine);
  build(instance, config);
  instance._fsm();
  return instance;
}

function build(target, config) {
  if ((typeof target !== 'object') || Array.isArray(target))
    throw Error('StateMachine can only be applied to objects');
  plugin.build(target, config);
  Object.defineProperties(target, PublicProperties);
  mixin(target, PublicMethods);
  mixin(target, config.methods);
  config.allTransitions().forEach(function(transition) {
    target[camelize(transition)] = function() {
      return this._fsm.fire(transition, [].slice.call(arguments))
    }
  });
  target._fsm = function() {
    this._fsm = new JSM(this, config);
    this._fsm.init(arguments);
  }
}

//-----------------------------------------------------------------------------------------------

StateMachine.version  = '3.0.1';
StateMachine.factory  = factory;
StateMachine.apply    = apply;
StateMachine.defaults = {
  wildcard: '*',
  init: {
    name: 'init',
    from: 'none'
  }
}

//===============================================================================================

module.exports = StateMachine;


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function(message, transition, from, to, current) {
  this.message    = message;
  this.transition = transition;
  this.from       = from;
  this.to         = to;
  this.current    = current;
}


/***/ })
/******/ ]);
});
},{}],190:[function(_dereq_,module,exports){
"use strict";

var _regenerator = _dereq_("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _getIterator2 = _dereq_("babel-runtime/core-js/get-iterator");

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _iterator2 = _dereq_("babel-runtime/core-js/symbol/iterator");

var _iterator3 = _interopRequireDefault(_iterator2);

var _classCallCheck2 = _dereq_("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = _dereq_("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });

var Node = function () {
    function Node(key, value) {
        (0, _classCallCheck3.default)(this, Node);

        this.balanceFactor = 0;
        this.key = key;
        this.value = value;
        this.parent = null;
        this.left = null;
        this.right = null;
    }

    (0, _createClass3.default)(Node, [{
        key: "update",
        value: function update(value) {
            this.value = value;
        }
    }, {
        key: "replace",
        value: function replace(target, replacement) {
            if (!target) {
                return;
            }
            if (this.left === replacement) {
                this.left = replacement;
            } else if (this.right === replacement) {
                this.right = replacement;
            }
        }
    }, {
        key: "isRoot",
        get: function get() {
            return this.parent === null;
        }
    }, {
        key: "isLeaf",
        get: function get() {
            return this.left === null && this.right === null;
        }
    }, {
        key: "isLeftChild",
        get: function get() {
            return this.parent.left === this;
        }
    }]);
    return Node;
}();
/**
 * @property length
 */


var TreeMap = function () {
    function TreeMap(less, equal) {
        (0, _classCallCheck3.default)(this, TreeMap);

        this.isLessThan = less || function (x, y) {
            return x < y;
        };
        this.isEqual = equal || function (x, y) {
            return x === y;
        };
        this.root = null;
        this.count = null;
    }

    (0, _createClass3.default)(TreeMap, [{
        key: "clear",
        value: function clear() {
            this.root = null;
            this.count = 0;
        }
    }, {
        key: "set",
        value: function set(key, value) {
            var node = this.getNode(key);
            if (node) {
                node.update(value);
            } else {
                this.insert(key, value);
            }
            // return node;
        }
    }, {
        key: "insert",
        value: function insert(key, value) {
            var node = new Node(key, value);
            this.count++;
            if (!this.root) {
                this.root = node;
                // return node;
                return;
            }
            var currNode = this.root;
            for (;;) {
                if (this.isLessThan(key, currNode.key)) {
                    if (currNode.left) {
                        currNode = currNode.left;
                    } else {
                        currNode.left = node;
                        break;
                    }
                } else {
                    if (currNode.right) {
                        currNode = currNode.right;
                    } else {
                        currNode.right = node;
                        break;
                    }
                }
            }
            node.parent = currNode;
            currNode = node;
            while (currNode.parent) {
                var parent = currNode.parent;
                var prevBalanceFactor = parent.balanceFactor;
                if (currNode.isLeftChild) {
                    parent.balanceFactor++;
                } else {
                    parent.balanceFactor--;
                }
                if (Math.abs(parent.balanceFactor) < Math.abs(prevBalanceFactor)) {
                    break;
                }
                if (parent.balanceFactor < -1 || parent.balanceFactor > 1) {
                    this.rebalance(parent);
                    break;
                }
                currNode = parent;
            }
            // return node;
        }
    }, {
        key: "get",
        value: function get(key) {
            var currentNode = this.root;
            while (currentNode) {
                if (this.isEqual(key, currentNode.key)) {
                    return currentNode.value;
                }
                if (this.isLessThan(key, currentNode.key)) {
                    currentNode = currentNode.left;
                } else {
                    currentNode = currentNode.right;
                }
            }
            return null;
        }
    }, {
        key: "delete",
        value: function _delete(key) {
            // update this algorithm and remove any
            var node = this.getNode(key);
            if (!node || node.key !== key) {
                return null;
            }
            var parent = node.parent;
            var left = node.left;
            var right = node.right;
            if (!!left !== !!right) {
                var child = left || right;
                if (!parent && !child) {
                    this.root = null;
                } else if (parent && !child) {
                    this.root = child;
                } else {
                    parent.replace(node, null);
                    this.rebalance(parent);
                }
            } else {
                var maxLeft = node.left;
                while (maxLeft.right) {
                    maxLeft = maxLeft.right;
                }
                if (node.left === maxLeft) {
                    if (node.isRoot) {
                        this.root = maxLeft;
                        maxLeft.parent = null;
                    } else {
                        if (node.isLeftChild) {
                            node.parent.left = maxLeft;
                        } else {
                            node.parent.right = maxLeft;
                        }
                        maxLeft.parent = node.parent;
                    }
                    maxLeft.right = node.right;
                    maxLeft.right.parent = maxLeft;
                    maxLeft.balanceFactor = node.balanceFactor;
                    node = {
                        parent: maxLeft, isLeftChild: true
                    };
                } else {
                    var mlParent = maxLeft.parent;
                    var mlLeft = maxLeft.left;
                    mlParent.right = mlLeft;
                    if (mlLeft) {
                        mlLeft.parent = mlParent;
                    }
                    if (node.isRoot) {
                        this.root = maxLeft;
                        maxLeft.parent = null;
                    } else {
                        if (node.isLeftChild) {
                            node.parent.left = maxLeft;
                        } else {
                            node.parent.right = maxLeft;
                        }
                        maxLeft.parent = node.parent;
                    }
                    maxLeft.right = node.right;
                    maxLeft.right.parent = maxLeft;
                    maxLeft.left = node.left;
                    maxLeft.left.parent = maxLeft;
                    maxLeft.balanceFactor = node.balanceFactor;
                    node = {
                        parent: mlParent, isLeftChild: false
                    };
                }
            }
            this.count--;
            while (node.parent) {
                var _parent = node.parent;
                var prevBalanceFactor = _parent.balanceFactor;
                if (node.isLeftChild) {
                    _parent.balanceFactor -= 1;
                } else {
                    _parent.balanceFactor += 1;
                }
                if (Math.abs(_parent.balanceFactor) > Math.abs(prevBalanceFactor)) {
                    if (_parent.balanceFactor < -1 || _parent.balanceFactor > 1) {
                        this.rebalance(_parent);
                        if (_parent.parent.balanceFactor === 0) {
                            node = _parent.parent;
                        } else {
                            break;
                        }
                    } else {
                        break;
                    }
                } else {
                    node = _parent;
                }
            }
            return null;
        }
    }, {
        key: "getNode",
        value: function getNode(key) {
            var currentNode = this.root;
            while (currentNode) {
                if (this.isEqual(key, currentNode.key)) {
                    return currentNode;
                }
                if (this.isLessThan(key, currentNode.key)) {
                    currentNode = currentNode.left;
                } else {
                    currentNode = currentNode.right;
                }
            }
            return null;
        }
    }, {
        key: "rebalance",
        value: function rebalance(node) {
            if (node.balanceFactor < 0) {
                if (node.right.balanceFactor > 0) {
                    this.rotateRight(node.right);
                    this.rotateLeft(node);
                } else {
                    this.rotateLeft(node);
                }
            } else if (node.balanceFactor > 0) {
                if (node.left.balanceFactor < 0) {
                    this.rotateLeft(node.left);
                    this.rotateRight(node);
                } else {
                    this.rotateRight(node);
                }
            }
        }
    }, {
        key: "rotateLeft",
        value: function rotateLeft(pivot) {
            var root = pivot.right;
            pivot.right = root.left;
            if (root.left !== null) {
                root.left.parent = pivot;
            }
            root.parent = pivot.parent;
            if (root.parent === null) {
                this.root = root;
            } else if (pivot.isLeftChild) {
                root.parent.left = root;
            } else {
                root.parent.right = root;
            }
            root.left = pivot;
            pivot.parent = root;
            pivot.balanceFactor = pivot.balanceFactor + 1 - Math.min(root.balanceFactor, 0);
            root.balanceFactor = root.balanceFactor + 1 - Math.max(pivot.balanceFactor, 0);
        }
    }, {
        key: "rotateRight",
        value: function rotateRight(pivot) {
            var root = pivot.left;
            pivot.left = root.right;
            if (root.right !== null) {
                root.right.parent = pivot;
            }
            root.parent = pivot.parent;
            if (root.parent === null) {
                this.root = root;
            } else if (pivot.isLeftChild) {
                root.parent.left = root;
            } else {
                root.parent.right = root;
            }
            root.right = pivot;
            pivot.parent = root;
            pivot.balanceFactor = pivot.balanceFactor - 1 - Math.min(root.balanceFactor, 0);
            root.balanceFactor = root.balanceFactor - 1 - Math.max(pivot.balanceFactor, 0);
        }
    }, {
        key: _iterator3.default,
        value: /*#__PURE__*/_regenerator2.default.mark(function value() {
            var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, iter;

            return _regenerator2.default.wrap(function value$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _iteratorNormalCompletion = true;
                            _didIteratorError = false;
                            _iteratorError = undefined;
                            _context.prev = 3;
                            _iterator = (0, _getIterator3.default)(this.getIterator());

                        case 5:
                            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                                _context.next = 12;
                                break;
                            }

                            iter = _step.value;
                            _context.next = 9;
                            return iter;

                        case 9:
                            _iteratorNormalCompletion = true;
                            _context.next = 5;
                            break;

                        case 12:
                            _context.next = 18;
                            break;

                        case 14:
                            _context.prev = 14;
                            _context.t0 = _context["catch"](3);
                            _didIteratorError = true;
                            _iteratorError = _context.t0;

                        case 18:
                            _context.prev = 18;
                            _context.prev = 19;

                            if (!_iteratorNormalCompletion && _iterator.return) {
                                _iterator.return();
                            }

                        case 21:
                            _context.prev = 21;

                            if (!_didIteratorError) {
                                _context.next = 24;
                                break;
                            }

                            throw _iteratorError;

                        case 24:
                            return _context.finish(21);

                        case 25:
                            return _context.finish(18);

                        case 26:
                        case "end":
                            return _context.stop();
                    }
                }
            }, value, this, [[3, 14, 18, 26], [19,, 21, 25]]);
        })
    }, {
        key: "getIterator",
        value: /*#__PURE__*/_regenerator2.default.mark(function getIterator() {
            var key = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
            var currentNode, fromleft;
            return _regenerator2.default.wrap(function getIterator$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            currentNode = this.root;

                        case 1:
                            if (!currentNode) {
                                _context2.next = 7;
                                break;
                            }

                            if (!(this.isEqual(key, currentNode.key) || key === null && !currentNode.left)) {
                                _context2.next = 4;
                                break;
                            }

                            return _context2.abrupt("break", 7);

                        case 4:
                            if (this.isLessThan(key, currentNode.key) || key === null) {
                                currentNode = currentNode.left;
                            } else {
                                currentNode = currentNode.right;
                            }
                            _context2.next = 1;
                            break;

                        case 7:
                            if (currentNode) {
                                _context2.next = 9;
                                break;
                            }

                            return _context2.abrupt("return", null);

                        case 9:
                            fromleft = true;

                        case 10:
                            if (!fromleft) {
                                _context2.next = 28;
                                break;
                            }

                            _context2.next = 13;
                            return [currentNode.key, currentNode.value];

                        case 13:
                            fromleft = false;

                            if (!currentNode.right) {
                                _context2.next = 20;
                                break;
                            }

                            currentNode = currentNode.right;
                            while (currentNode.left) {
                                currentNode = currentNode.left;
                            }
                            fromleft = true;
                            _context2.next = 26;
                            break;

                        case 20:
                            if (!currentNode.parent) {
                                _context2.next = 25;
                                break;
                            }

                            fromleft = currentNode.parent.left === currentNode;
                            currentNode = currentNode.parent;
                            _context2.next = 26;
                            break;

                        case 25:
                            return _context2.abrupt("break", 36);

                        case 26:
                            _context2.next = 34;
                            break;

                        case 28:
                            if (!currentNode.parent) {
                                _context2.next = 33;
                                break;
                            }

                            fromleft = currentNode.parent.left === currentNode;
                            currentNode = currentNode.parent;
                            _context2.next = 34;
                            break;

                        case 33:
                            return _context2.abrupt("break", 36);

                        case 34:
                            _context2.next = 10;
                            break;

                        case 36:
                            return _context2.abrupt("return", null);

                        case 37:
                        case "end":
                            return _context2.stop();
                    }
                }
            }, getIterator, this);
        })
    }, {
        key: "getReverseIterator",
        value: /*#__PURE__*/_regenerator2.default.mark(function getReverseIterator() {
            var key = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
            var currentNode, fromright;
            return _regenerator2.default.wrap(function getReverseIterator$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            currentNode = this.root;

                        case 1:
                            if (!currentNode) {
                                _context3.next = 7;
                                break;
                            }

                            if (!(this.isEqual(key, currentNode.key) || key === null && !currentNode.right)) {
                                _context3.next = 4;
                                break;
                            }

                            return _context3.abrupt("break", 7);

                        case 4:
                            if (!this.isLessThan(key, currentNode.key) || key === null) {
                                currentNode = currentNode.right;
                            } else {
                                currentNode = currentNode.left;
                            }
                            _context3.next = 1;
                            break;

                        case 7:
                            if (currentNode) {
                                _context3.next = 9;
                                break;
                            }

                            return _context3.abrupt("return", null);

                        case 9:
                            fromright = true;

                        case 10:
                            if (!fromright) {
                                _context3.next = 28;
                                break;
                            }

                            _context3.next = 13;
                            return [currentNode.key, currentNode.value];

                        case 13:
                            fromright = false;

                            if (!currentNode.left) {
                                _context3.next = 20;
                                break;
                            }

                            currentNode = currentNode.left;
                            while (currentNode.right) {
                                currentNode = currentNode.right;
                            }
                            fromright = true;
                            _context3.next = 26;
                            break;

                        case 20:
                            if (!currentNode.parent) {
                                _context3.next = 25;
                                break;
                            }

                            fromright = currentNode.parent.right === currentNode;
                            currentNode = currentNode.parent;
                            _context3.next = 26;
                            break;

                        case 25:
                            return _context3.abrupt("break", 36);

                        case 26:
                            _context3.next = 34;
                            break;

                        case 28:
                            if (!currentNode.parent) {
                                _context3.next = 33;
                                break;
                            }

                            fromright = currentNode.parent.right === currentNode;
                            currentNode = currentNode.parent;
                            _context3.next = 34;
                            break;

                        case 33:
                            return _context3.abrupt("break", 36);

                        case 34:
                            _context3.next = 10;
                            break;

                        case 36:
                            return _context3.abrupt("return", null);

                        case 37:
                        case "end":
                            return _context3.stop();
                    }
                }
            }, getReverseIterator, this);
        })
    }, {
        key: "size",
        get: function get() {
            return this.count;
        }
    }]);
    return TreeMap;
}();

exports.TreeMap = TreeMap;


},{"babel-runtime/core-js/get-iterator":24,"babel-runtime/core-js/symbol/iterator":38,"babel-runtime/helpers/classCallCheck":40,"babel-runtime/helpers/createClass":41,"babel-runtime/regenerator":48}],191:[function(_dereq_,module,exports){
/*
* loglevel - https://github.com/pimterry/loglevel
*
* Copyright (c) 2013 Tim Perry
* Licensed under the MIT license.
*/
(function (root, definition) {
    "use strict";
    if (typeof define === 'function' && define.amd) {
        define(definition);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = definition();
    } else {
        root.log = definition();
    }
}(this, function () {
    "use strict";

    // Slightly dubious tricks to cut down minimized file size
    var noop = function() {};
    var undefinedType = "undefined";

    var logMethods = [
        "trace",
        "debug",
        "info",
        "warn",
        "error"
    ];

    // Cross-browser bind equivalent that works at least back to IE6
    function bindMethod(obj, methodName) {
        var method = obj[methodName];
        if (typeof method.bind === 'function') {
            return method.bind(obj);
        } else {
            try {
                return Function.prototype.bind.call(method, obj);
            } catch (e) {
                // Missing bind shim or IE8 + Modernizr, fallback to wrapping
                return function() {
                    return Function.prototype.apply.apply(method, [obj, arguments]);
                };
            }
        }
    }

    // Build the best logging method possible for this env
    // Wherever possible we want to bind, not wrap, to preserve stack traces
    function realMethod(methodName) {
        if (methodName === 'debug') {
            methodName = 'log';
        }

        if (typeof console === undefinedType) {
            return false; // No method possible, for now - fixed later by enableLoggingWhenConsoleArrives
        } else if (console[methodName] !== undefined) {
            return bindMethod(console, methodName);
        } else if (console.log !== undefined) {
            return bindMethod(console, 'log');
        } else {
            return noop;
        }
    }

    // These private functions always need `this` to be set properly

    function replaceLoggingMethods(level, loggerName) {
        /*jshint validthis:true */
        for (var i = 0; i < logMethods.length; i++) {
            var methodName = logMethods[i];
            this[methodName] = (i < level) ?
                noop :
                this.methodFactory(methodName, level, loggerName);
        }

        // Define log.log as an alias for log.debug
        this.log = this.debug;
    }

    // In old IE versions, the console isn't present until you first open it.
    // We build realMethod() replacements here that regenerate logging methods
    function enableLoggingWhenConsoleArrives(methodName, level, loggerName) {
        return function () {
            if (typeof console !== undefinedType) {
                replaceLoggingMethods.call(this, level, loggerName);
                this[methodName].apply(this, arguments);
            }
        };
    }

    // By default, we use closely bound real methods wherever possible, and
    // otherwise we wait for a console to appear, and then try again.
    function defaultMethodFactory(methodName, level, loggerName) {
        /*jshint validthis:true */
        return realMethod(methodName) ||
               enableLoggingWhenConsoleArrives.apply(this, arguments);
    }

    function Logger(name, defaultLevel, factory) {
      var self = this;
      var currentLevel;
      var storageKey = "loglevel";
      if (name) {
        storageKey += ":" + name;
      }

      function persistLevelIfPossible(levelNum) {
          var levelName = (logMethods[levelNum] || 'silent').toUpperCase();

          if (typeof window === undefinedType) return;

          // Use localStorage if available
          try {
              window.localStorage[storageKey] = levelName;
              return;
          } catch (ignore) {}

          // Use session cookie as fallback
          try {
              window.document.cookie =
                encodeURIComponent(storageKey) + "=" + levelName + ";";
          } catch (ignore) {}
      }

      function getPersistedLevel() {
          var storedLevel;

          if (typeof window === undefinedType) return;

          try {
              storedLevel = window.localStorage[storageKey];
          } catch (ignore) {}

          // Fallback to cookies if local storage gives us nothing
          if (typeof storedLevel === undefinedType) {
              try {
                  var cookie = window.document.cookie;
                  var location = cookie.indexOf(
                      encodeURIComponent(storageKey) + "=");
                  if (location !== -1) {
                      storedLevel = /^([^;]+)/.exec(cookie.slice(location))[1];
                  }
              } catch (ignore) {}
          }

          // If the stored level is not valid, treat it as if nothing was stored.
          if (self.levels[storedLevel] === undefined) {
              storedLevel = undefined;
          }

          return storedLevel;
      }

      /*
       *
       * Public logger API - see https://github.com/pimterry/loglevel for details
       *
       */

      self.name = name;

      self.levels = { "TRACE": 0, "DEBUG": 1, "INFO": 2, "WARN": 3,
          "ERROR": 4, "SILENT": 5};

      self.methodFactory = factory || defaultMethodFactory;

      self.getLevel = function () {
          return currentLevel;
      };

      self.setLevel = function (level, persist) {
          if (typeof level === "string" && self.levels[level.toUpperCase()] !== undefined) {
              level = self.levels[level.toUpperCase()];
          }
          if (typeof level === "number" && level >= 0 && level <= self.levels.SILENT) {
              currentLevel = level;
              if (persist !== false) {  // defaults to true
                  persistLevelIfPossible(level);
              }
              replaceLoggingMethods.call(self, level, name);
              if (typeof console === undefinedType && level < self.levels.SILENT) {
                  return "No console available for logging";
              }
          } else {
              throw "log.setLevel() called with invalid level: " + level;
          }
      };

      self.setDefaultLevel = function (level) {
          if (!getPersistedLevel()) {
              self.setLevel(level, false);
          }
      };

      self.enableAll = function(persist) {
          self.setLevel(self.levels.TRACE, persist);
      };

      self.disableAll = function(persist) {
          self.setLevel(self.levels.SILENT, persist);
      };

      // Initialize with the right level
      var initialLevel = getPersistedLevel();
      if (initialLevel == null) {
          initialLevel = defaultLevel == null ? "WARN" : defaultLevel;
      }
      self.setLevel(initialLevel, false);
    }

    /*
     *
     * Top-level API
     *
     */

    var defaultLogger = new Logger();

    var _loggersByName = {};
    defaultLogger.getLogger = function getLogger(name) {
        if (typeof name !== "string" || name === "") {
          throw new TypeError("You must supply a name when creating a logger.");
        }

        var logger = _loggersByName[name];
        if (!logger) {
          logger = _loggersByName[name] = new Logger(
            name, defaultLogger.getLevel(), defaultLogger.methodFactory);
        }
        return logger;
    };

    // Grab the current global log variable in case of overwrite
    var _log = (typeof window !== undefinedType) ? window.log : undefined;
    defaultLogger.noConflict = function() {
        if (typeof window !== undefinedType &&
               window.log === defaultLogger) {
            window.log = _log;
        }

        return defaultLogger;
    };

    defaultLogger.getLoggers = function getLoggers() {
        return _loggersByName;
    };

    return defaultLogger;
}));

},{}],192:[function(_dereq_,module,exports){
"use strict";

var _promise = _dereq_("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _getPrototypeOf = _dereq_("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = _dereq_("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = _dereq_("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = _dereq_("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = _dereq_("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = _dereq_("events");
/**
 * Provides retrier service
 */

var Retrier = function (_events_1$EventEmitte) {
    (0, _inherits3.default)(Retrier, _events_1$EventEmitte);

    /**
     * Creates a new Retrier instance
     */
    function Retrier(options) {
        (0, _classCallCheck3.default)(this, Retrier);

        var _this = (0, _possibleConstructorReturn3.default)(this, (Retrier.__proto__ || (0, _getPrototypeOf2.default)(Retrier)).call(this));

        _this.minDelay = options.min;
        _this.maxDelay = options.max;
        _this.initialDelay = options.initial || 0;
        _this.maxAttemptsCount = options.maxAttemptsCount || 0;
        _this.maxAttemptsTime = options.maxAttemptsTime || 0;
        _this.randomness = options.randomness || 0;
        _this.inProgress = false;
        _this.attemptNum = 0;
        _this.prevDelay = 0;
        _this.currDelay = 0;
        return _this;
    }

    (0, _createClass3.default)(Retrier, [{
        key: "attempt",
        value: function attempt() {
            clearTimeout(this.timeout);
            this.attemptNum++;
            this.timeout = null;
            this.emit("attempt", this);
        }
    }, {
        key: "nextDelay",
        value: function nextDelay(delayOverride) {
            if (typeof delayOverride === 'number') {
                this.prevDelay = 0;
                this.currDelay = delayOverride;
                return delayOverride;
            }
            if (this.attemptNum == 0) {
                return this.initialDelay;
            }
            if (this.attemptNum == 1) {
                this.currDelay = this.minDelay;
                return this.currDelay;
            }
            var delay = this.currDelay + this.prevDelay;
            this.prevDelay = this.currDelay;
            this.currDelay = delay;
            return delay;
        }
    }, {
        key: "randomize",
        value: function randomize(delay) {
            var area = delay * this.randomness;
            var corr = Math.round(Math.random() * area * 2 - area);
            return Math.max(0, delay + corr);
        }
    }, {
        key: "scheduleAttempt",
        value: function scheduleAttempt(delayOverride) {
            var _this2 = this;

            if (this.maxAttemptsCount && this.attemptNum >= this.maxAttemptsCount) {
                this.cleanup();
                this.emit('failed', new Error('Maximum attempt count limit reached'));
                this.reject(new Error('Maximum attempt count reached'));
                return;
            }
            var delay = this.nextDelay(delayOverride);
            delay = this.randomize(delay);
            if (this.maxAttemptsTime && this.startTimestamp + this.maxAttemptsTime < Date.now() + delay) {
                this.cleanup();
                this.emit('failed', new Error('Maximum attempt time limit reached'));
                this.reject(new Error('Maximum attempt time limit reached'));
            }
            this.timeout = setTimeout(function () {
                return _this2.attempt();
            }, delay);
        }
    }, {
        key: "cleanup",
        value: function cleanup() {
            clearTimeout(this.timeout);
            this.timeout = null;
            this.inProgress = false;
            this.attemptNum = 0;
            this.prevDelay = 0;
            this.currDelay = 0;
        }
    }, {
        key: "start",
        value: function start() {
            var _this3 = this;

            if (this.inProgress) {
                throw new Error('Retrier is already in progress');
            }
            this.inProgress = true;
            return new _promise2.default(function (resolve, reject) {
                _this3.resolve = resolve;
                _this3.reject = reject;
                _this3.startTimestamp = Date.now();
                _this3.scheduleAttempt(_this3.initialDelay);
            });
        }
    }, {
        key: "cancel",
        value: function cancel() {
            if (this.timeout) {
                clearTimeout(this.timeout);
                this.timeout = null;
                this.inProgress = false;
                this.emit("cancelled");
                this.reject(new Error("Cancelled"));
            }
        }
    }, {
        key: "succeeded",
        value: function succeeded(arg) {
            this.emit("succeeded", arg);
            this.resolve(arg);
        }
    }, {
        key: "failed",
        value: function failed(err, nextAttemptDelayOverride) {
            if (this.timeout) {
                throw new Error("Retrier attempt is already in progress");
            }
            this.scheduleAttempt(nextAttemptDelayOverride);
        }
    }, {
        key: "run",
        value: function run(handler) {
            var _this4 = this;

            this.on('attempt', function () {
                handler().then(function (v) {
                    return _this4.succeeded(v);
                }).catch(function (e) {
                    return _this4.failed(e);
                });
            });
            return this.start();
        }
    }]);
    return Retrier;
}(events_1.EventEmitter);

exports.Retrier = Retrier;
exports.default = Retrier;


},{"babel-runtime/core-js/object/get-prototype-of":32,"babel-runtime/core-js/promise":34,"babel-runtime/helpers/classCallCheck":40,"babel-runtime/helpers/createClass":41,"babel-runtime/helpers/inherits":43,"babel-runtime/helpers/possibleConstructorReturn":44,"events":187}],193:[function(_dereq_,module,exports){
(function (global){
/*!
 * Platform.js <https://mths.be/platform>
 * Copyright 2014-2018 Benjamin Tan <https://bnjmnt4n.now.sh/>
 * Copyright 2011-2013 John-David Dalton <http://allyoucanleet.com/>
 * Available under MIT license <https://mths.be/mit>
 */
;(function() {
  'use strict';

  /** Used to determine if values are of the language type `Object`. */
  var objectTypes = {
    'function': true,
    'object': true
  };

  /** Used as a reference to the global object. */
  var root = (objectTypes[typeof window] && window) || this;

  /** Backup possible global object. */
  var oldRoot = root;

  /** Detect free variable `exports`. */
  var freeExports = objectTypes[typeof exports] && exports;

  /** Detect free variable `module`. */
  var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;

  /** Detect free variable `global` from Node.js or Browserified code and use it as `root`. */
  var freeGlobal = freeExports && freeModule && typeof global == 'object' && global;
  if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal || freeGlobal.self === freeGlobal)) {
    root = freeGlobal;
  }

  /**
   * Used as the maximum length of an array-like object.
   * See the [ES6 spec](http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength)
   * for more details.
   */
  var maxSafeInteger = Math.pow(2, 53) - 1;

  /** Regular expression to detect Opera. */
  var reOpera = /\bOpera/;

  /** Possible global object. */
  var thisBinding = this;

  /** Used for native method references. */
  var objectProto = Object.prototype;

  /** Used to check for own properties of an object. */
  var hasOwnProperty = objectProto.hasOwnProperty;

  /** Used to resolve the internal `[[Class]]` of values. */
  var toString = objectProto.toString;

  /*--------------------------------------------------------------------------*/

  /**
   * Capitalizes a string value.
   *
   * @private
   * @param {string} string The string to capitalize.
   * @returns {string} The capitalized string.
   */
  function capitalize(string) {
    string = String(string);
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  /**
   * A utility function to clean up the OS name.
   *
   * @private
   * @param {string} os The OS name to clean up.
   * @param {string} [pattern] A `RegExp` pattern matching the OS name.
   * @param {string} [label] A label for the OS.
   */
  function cleanupOS(os, pattern, label) {
    // Platform tokens are defined at:
    // http://msdn.microsoft.com/en-us/library/ms537503(VS.85).aspx
    // http://web.archive.org/web/20081122053950/http://msdn.microsoft.com/en-us/library/ms537503(VS.85).aspx
    var data = {
      '10.0': '10',
      '6.4':  '10 Technical Preview',
      '6.3':  '8.1',
      '6.2':  '8',
      '6.1':  'Server 2008 R2 / 7',
      '6.0':  'Server 2008 / Vista',
      '5.2':  'Server 2003 / XP 64-bit',
      '5.1':  'XP',
      '5.01': '2000 SP1',
      '5.0':  '2000',
      '4.0':  'NT',
      '4.90': 'ME'
    };
    // Detect Windows version from platform tokens.
    if (pattern && label && /^Win/i.test(os) && !/^Windows Phone /i.test(os) &&
        (data = data[/[\d.]+$/.exec(os)])) {
      os = 'Windows ' + data;
    }
    // Correct character case and cleanup string.
    os = String(os);

    if (pattern && label) {
      os = os.replace(RegExp(pattern, 'i'), label);
    }

    os = format(
      os.replace(/ ce$/i, ' CE')
        .replace(/\bhpw/i, 'web')
        .replace(/\bMacintosh\b/, 'Mac OS')
        .replace(/_PowerPC\b/i, ' OS')
        .replace(/\b(OS X) [^ \d]+/i, '$1')
        .replace(/\bMac (OS X)\b/, '$1')
        .replace(/\/(\d)/, ' $1')
        .replace(/_/g, '.')
        .replace(/(?: BePC|[ .]*fc[ \d.]+)$/i, '')
        .replace(/\bx86\.64\b/gi, 'x86_64')
        .replace(/\b(Windows Phone) OS\b/, '$1')
        .replace(/\b(Chrome OS \w+) [\d.]+\b/, '$1')
        .split(' on ')[0]
    );

    return os;
  }

  /**
   * An iteration utility for arrays and objects.
   *
   * @private
   * @param {Array|Object} object The object to iterate over.
   * @param {Function} callback The function called per iteration.
   */
  function each(object, callback) {
    var index = -1,
        length = object ? object.length : 0;

    if (typeof length == 'number' && length > -1 && length <= maxSafeInteger) {
      while (++index < length) {
        callback(object[index], index, object);
      }
    } else {
      forOwn(object, callback);
    }
  }

  /**
   * Trim and conditionally capitalize string values.
   *
   * @private
   * @param {string} string The string to format.
   * @returns {string} The formatted string.
   */
  function format(string) {
    string = trim(string);
    return /^(?:webOS|i(?:OS|P))/.test(string)
      ? string
      : capitalize(string);
  }

  /**
   * Iterates over an object's own properties, executing the `callback` for each.
   *
   * @private
   * @param {Object} object The object to iterate over.
   * @param {Function} callback The function executed per own property.
   */
  function forOwn(object, callback) {
    for (var key in object) {
      if (hasOwnProperty.call(object, key)) {
        callback(object[key], key, object);
      }
    }
  }

  /**
   * Gets the internal `[[Class]]` of a value.
   *
   * @private
   * @param {*} value The value.
   * @returns {string} The `[[Class]]`.
   */
  function getClassOf(value) {
    return value == null
      ? capitalize(value)
      : toString.call(value).slice(8, -1);
  }

  /**
   * Host objects can return type values that are different from their actual
   * data type. The objects we are concerned with usually return non-primitive
   * types of "object", "function", or "unknown".
   *
   * @private
   * @param {*} object The owner of the property.
   * @param {string} property The property to check.
   * @returns {boolean} Returns `true` if the property value is a non-primitive, else `false`.
   */
  function isHostType(object, property) {
    var type = object != null ? typeof object[property] : 'number';
    return !/^(?:boolean|number|string|undefined)$/.test(type) &&
      (type == 'object' ? !!object[property] : true);
  }

  /**
   * Prepares a string for use in a `RegExp` by making hyphens and spaces optional.
   *
   * @private
   * @param {string} string The string to qualify.
   * @returns {string} The qualified string.
   */
  function qualify(string) {
    return String(string).replace(/([ -])(?!$)/g, '$1?');
  }

  /**
   * A bare-bones `Array#reduce` like utility function.
   *
   * @private
   * @param {Array} array The array to iterate over.
   * @param {Function} callback The function called per iteration.
   * @returns {*} The accumulated result.
   */
  function reduce(array, callback) {
    var accumulator = null;
    each(array, function(value, index) {
      accumulator = callback(accumulator, value, index, array);
    });
    return accumulator;
  }

  /**
   * Removes leading and trailing whitespace from a string.
   *
   * @private
   * @param {string} string The string to trim.
   * @returns {string} The trimmed string.
   */
  function trim(string) {
    return String(string).replace(/^ +| +$/g, '');
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Creates a new platform object.
   *
   * @memberOf platform
   * @param {Object|string} [ua=navigator.userAgent] The user agent string or
   *  context object.
   * @returns {Object} A platform object.
   */
  function parse(ua) {

    /** The environment context object. */
    var context = root;

    /** Used to flag when a custom context is provided. */
    var isCustomContext = ua && typeof ua == 'object' && getClassOf(ua) != 'String';

    // Juggle arguments.
    if (isCustomContext) {
      context = ua;
      ua = null;
    }

    /** Browser navigator object. */
    var nav = context.navigator || {};

    /** Browser user agent string. */
    var userAgent = nav.userAgent || '';

    ua || (ua = userAgent);

    /** Used to flag when `thisBinding` is the [ModuleScope]. */
    var isModuleScope = isCustomContext || thisBinding == oldRoot;

    /** Used to detect if browser is like Chrome. */
    var likeChrome = isCustomContext
      ? !!nav.likeChrome
      : /\bChrome\b/.test(ua) && !/internal|\n/i.test(toString.toString());

    /** Internal `[[Class]]` value shortcuts. */
    var objectClass = 'Object',
        airRuntimeClass = isCustomContext ? objectClass : 'ScriptBridgingProxyObject',
        enviroClass = isCustomContext ? objectClass : 'Environment',
        javaClass = (isCustomContext && context.java) ? 'JavaPackage' : getClassOf(context.java),
        phantomClass = isCustomContext ? objectClass : 'RuntimeObject';

    /** Detect Java environments. */
    var java = /\bJava/.test(javaClass) && context.java;

    /** Detect Rhino. */
    var rhino = java && getClassOf(context.environment) == enviroClass;

    /** A character to represent alpha. */
    var alpha = java ? 'a' : '\u03b1';

    /** A character to represent beta. */
    var beta = java ? 'b' : '\u03b2';

    /** Browser document object. */
    var doc = context.document || {};

    /**
     * Detect Opera browser (Presto-based).
     * http://www.howtocreate.co.uk/operaStuff/operaObject.html
     * http://dev.opera.com/articles/view/opera-mini-web-content-authoring-guidelines/#operamini
     */
    var opera = context.operamini || context.opera;

    /** Opera `[[Class]]`. */
    var operaClass = reOpera.test(operaClass = (isCustomContext && opera) ? opera['[[Class]]'] : getClassOf(opera))
      ? operaClass
      : (opera = null);

    /*------------------------------------------------------------------------*/

    /** Temporary variable used over the script's lifetime. */
    var data;

    /** The CPU architecture. */
    var arch = ua;

    /** Platform description array. */
    var description = [];

    /** Platform alpha/beta indicator. */
    var prerelease = null;

    /** A flag to indicate that environment features should be used to resolve the platform. */
    var useFeatures = ua == userAgent;

    /** The browser/environment version. */
    var version = useFeatures && opera && typeof opera.version == 'function' && opera.version();

    /** A flag to indicate if the OS ends with "/ Version" */
    var isSpecialCasedOS;

    /* Detectable layout engines (order is important). */
    var layout = getLayout([
      { 'label': 'EdgeHTML', 'pattern': 'Edge' },
      'Trident',
      { 'label': 'WebKit', 'pattern': 'AppleWebKit' },
      'iCab',
      'Presto',
      'NetFront',
      'Tasman',
      'KHTML',
      'Gecko'
    ]);

    /* Detectable browser names (order is important). */
    var name = getName([
      'Adobe AIR',
      'Arora',
      'Avant Browser',
      'Breach',
      'Camino',
      'Electron',
      'Epiphany',
      'Fennec',
      'Flock',
      'Galeon',
      'GreenBrowser',
      'iCab',
      'Iceweasel',
      'K-Meleon',
      'Konqueror',
      'Lunascape',
      'Maxthon',
      { 'label': 'Microsoft Edge', 'pattern': 'Edge' },
      'Midori',
      'Nook Browser',
      'PaleMoon',
      'PhantomJS',
      'Raven',
      'Rekonq',
      'RockMelt',
      { 'label': 'Samsung Internet', 'pattern': 'SamsungBrowser' },
      'SeaMonkey',
      { 'label': 'Silk', 'pattern': '(?:Cloud9|Silk-Accelerated)' },
      'Sleipnir',
      'SlimBrowser',
      { 'label': 'SRWare Iron', 'pattern': 'Iron' },
      'Sunrise',
      'Swiftfox',
      'Waterfox',
      'WebPositive',
      'Opera Mini',
      { 'label': 'Opera Mini', 'pattern': 'OPiOS' },
      'Opera',
      { 'label': 'Opera', 'pattern': 'OPR' },
      'Chrome',
      { 'label': 'Chrome Mobile', 'pattern': '(?:CriOS|CrMo)' },
      { 'label': 'Firefox', 'pattern': '(?:Firefox|Minefield)' },
      { 'label': 'Firefox for iOS', 'pattern': 'FxiOS' },
      { 'label': 'IE', 'pattern': 'IEMobile' },
      { 'label': 'IE', 'pattern': 'MSIE' },
      'Safari'
    ]);

    /* Detectable products (order is important). */
    var product = getProduct([
      { 'label': 'BlackBerry', 'pattern': 'BB10' },
      'BlackBerry',
      { 'label': 'Galaxy S', 'pattern': 'GT-I9000' },
      { 'label': 'Galaxy S2', 'pattern': 'GT-I9100' },
      { 'label': 'Galaxy S3', 'pattern': 'GT-I9300' },
      { 'label': 'Galaxy S4', 'pattern': 'GT-I9500' },
      { 'label': 'Galaxy S5', 'pattern': 'SM-G900' },
      { 'label': 'Galaxy S6', 'pattern': 'SM-G920' },
      { 'label': 'Galaxy S6 Edge', 'pattern': 'SM-G925' },
      { 'label': 'Galaxy S7', 'pattern': 'SM-G930' },
      { 'label': 'Galaxy S7 Edge', 'pattern': 'SM-G935' },
      'Google TV',
      'Lumia',
      'iPad',
      'iPod',
      'iPhone',
      'Kindle',
      { 'label': 'Kindle Fire', 'pattern': '(?:Cloud9|Silk-Accelerated)' },
      'Nexus',
      'Nook',
      'PlayBook',
      'PlayStation Vita',
      'PlayStation',
      'TouchPad',
      'Transformer',
      { 'label': 'Wii U', 'pattern': 'WiiU' },
      'Wii',
      'Xbox One',
      { 'label': 'Xbox 360', 'pattern': 'Xbox' },
      'Xoom'
    ]);

    /* Detectable manufacturers. */
    var manufacturer = getManufacturer({
      'Apple': { 'iPad': 1, 'iPhone': 1, 'iPod': 1 },
      'Archos': {},
      'Amazon': { 'Kindle': 1, 'Kindle Fire': 1 },
      'Asus': { 'Transformer': 1 },
      'Barnes & Noble': { 'Nook': 1 },
      'BlackBerry': { 'PlayBook': 1 },
      'Google': { 'Google TV': 1, 'Nexus': 1 },
      'HP': { 'TouchPad': 1 },
      'HTC': {},
      'LG': {},
      'Microsoft': { 'Xbox': 1, 'Xbox One': 1 },
      'Motorola': { 'Xoom': 1 },
      'Nintendo': { 'Wii U': 1,  'Wii': 1 },
      'Nokia': { 'Lumia': 1 },
      'Samsung': { 'Galaxy S': 1, 'Galaxy S2': 1, 'Galaxy S3': 1, 'Galaxy S4': 1 },
      'Sony': { 'PlayStation': 1, 'PlayStation Vita': 1 }
    });

    /* Detectable operating systems (order is important). */
    var os = getOS([
      'Windows Phone',
      'Android',
      'CentOS',
      { 'label': 'Chrome OS', 'pattern': 'CrOS' },
      'Debian',
      'Fedora',
      'FreeBSD',
      'Gentoo',
      'Haiku',
      'Kubuntu',
      'Linux Mint',
      'OpenBSD',
      'Red Hat',
      'SuSE',
      'Ubuntu',
      'Xubuntu',
      'Cygwin',
      'Symbian OS',
      'hpwOS',
      'webOS ',
      'webOS',
      'Tablet OS',
      'Tizen',
      'Linux',
      'Mac OS X',
      'Macintosh',
      'Mac',
      'Windows 98;',
      'Windows '
    ]);

    /*------------------------------------------------------------------------*/

    /**
     * Picks the layout engine from an array of guesses.
     *
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {null|string} The detected layout engine.
     */
    function getLayout(guesses) {
      return reduce(guesses, function(result, guess) {
        return result || RegExp('\\b' + (
          guess.pattern || qualify(guess)
        ) + '\\b', 'i').exec(ua) && (guess.label || guess);
      });
    }

    /**
     * Picks the manufacturer from an array of guesses.
     *
     * @private
     * @param {Array} guesses An object of guesses.
     * @returns {null|string} The detected manufacturer.
     */
    function getManufacturer(guesses) {
      return reduce(guesses, function(result, value, key) {
        // Lookup the manufacturer by product or scan the UA for the manufacturer.
        return result || (
          value[product] ||
          value[/^[a-z]+(?: +[a-z]+\b)*/i.exec(product)] ||
          RegExp('\\b' + qualify(key) + '(?:\\b|\\w*\\d)', 'i').exec(ua)
        ) && key;
      });
    }

    /**
     * Picks the browser name from an array of guesses.
     *
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {null|string} The detected browser name.
     */
    function getName(guesses) {
      return reduce(guesses, function(result, guess) {
        return result || RegExp('\\b' + (
          guess.pattern || qualify(guess)
        ) + '\\b', 'i').exec(ua) && (guess.label || guess);
      });
    }

    /**
     * Picks the OS name from an array of guesses.
     *
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {null|string} The detected OS name.
     */
    function getOS(guesses) {
      return reduce(guesses, function(result, guess) {
        var pattern = guess.pattern || qualify(guess);
        if (!result && (result =
              RegExp('\\b' + pattern + '(?:/[\\d.]+|[ \\w.]*)', 'i').exec(ua)
            )) {
          result = cleanupOS(result, pattern, guess.label || guess);
        }
        return result;
      });
    }

    /**
     * Picks the product name from an array of guesses.
     *
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {null|string} The detected product name.
     */
    function getProduct(guesses) {
      return reduce(guesses, function(result, guess) {
        var pattern = guess.pattern || qualify(guess);
        if (!result && (result =
              RegExp('\\b' + pattern + ' *\\d+[.\\w_]*', 'i').exec(ua) ||
              RegExp('\\b' + pattern + ' *\\w+-[\\w]*', 'i').exec(ua) ||
              RegExp('\\b' + pattern + '(?:; *(?:[a-z]+[_-])?[a-z]+\\d+|[^ ();-]*)', 'i').exec(ua)
            )) {
          // Split by forward slash and append product version if needed.
          if ((result = String((guess.label && !RegExp(pattern, 'i').test(guess.label)) ? guess.label : result).split('/'))[1] && !/[\d.]+/.test(result[0])) {
            result[0] += ' ' + result[1];
          }
          // Correct character case and cleanup string.
          guess = guess.label || guess;
          result = format(result[0]
            .replace(RegExp(pattern, 'i'), guess)
            .replace(RegExp('; *(?:' + guess + '[_-])?', 'i'), ' ')
            .replace(RegExp('(' + guess + ')[-_.]?(\\w)', 'i'), '$1 $2'));
        }
        return result;
      });
    }

    /**
     * Resolves the version using an array of UA patterns.
     *
     * @private
     * @param {Array} patterns An array of UA patterns.
     * @returns {null|string} The detected version.
     */
    function getVersion(patterns) {
      return reduce(patterns, function(result, pattern) {
        return result || (RegExp(pattern +
          '(?:-[\\d.]+/|(?: for [\\w-]+)?[ /-])([\\d.]+[^ ();/_-]*)', 'i').exec(ua) || 0)[1] || null;
      });
    }

    /**
     * Returns `platform.description` when the platform object is coerced to a string.
     *
     * @name toString
     * @memberOf platform
     * @returns {string} Returns `platform.description` if available, else an empty string.
     */
    function toStringPlatform() {
      return this.description || '';
    }

    /*------------------------------------------------------------------------*/

    // Convert layout to an array so we can add extra details.
    layout && (layout = [layout]);

    // Detect product names that contain their manufacturer's name.
    if (manufacturer && !product) {
      product = getProduct([manufacturer]);
    }
    // Clean up Google TV.
    if ((data = /\bGoogle TV\b/.exec(product))) {
      product = data[0];
    }
    // Detect simulators.
    if (/\bSimulator\b/i.test(ua)) {
      product = (product ? product + ' ' : '') + 'Simulator';
    }
    // Detect Opera Mini 8+ running in Turbo/Uncompressed mode on iOS.
    if (name == 'Opera Mini' && /\bOPiOS\b/.test(ua)) {
      description.push('running in Turbo/Uncompressed mode');
    }
    // Detect IE Mobile 11.
    if (name == 'IE' && /\blike iPhone OS\b/.test(ua)) {
      data = parse(ua.replace(/like iPhone OS/, ''));
      manufacturer = data.manufacturer;
      product = data.product;
    }
    // Detect iOS.
    else if (/^iP/.test(product)) {
      name || (name = 'Safari');
      os = 'iOS' + ((data = / OS ([\d_]+)/i.exec(ua))
        ? ' ' + data[1].replace(/_/g, '.')
        : '');
    }
    // Detect Kubuntu.
    else if (name == 'Konqueror' && !/buntu/i.test(os)) {
      os = 'Kubuntu';
    }
    // Detect Android browsers.
    else if ((manufacturer && manufacturer != 'Google' &&
        ((/Chrome/.test(name) && !/\bMobile Safari\b/i.test(ua)) || /\bVita\b/.test(product))) ||
        (/\bAndroid\b/.test(os) && /^Chrome/.test(name) && /\bVersion\//i.test(ua))) {
      name = 'Android Browser';
      os = /\bAndroid\b/.test(os) ? os : 'Android';
    }
    // Detect Silk desktop/accelerated modes.
    else if (name == 'Silk') {
      if (!/\bMobi/i.test(ua)) {
        os = 'Android';
        description.unshift('desktop mode');
      }
      if (/Accelerated *= *true/i.test(ua)) {
        description.unshift('accelerated');
      }
    }
    // Detect PaleMoon identifying as Firefox.
    else if (name == 'PaleMoon' && (data = /\bFirefox\/([\d.]+)\b/.exec(ua))) {
      description.push('identifying as Firefox ' + data[1]);
    }
    // Detect Firefox OS and products running Firefox.
    else if (name == 'Firefox' && (data = /\b(Mobile|Tablet|TV)\b/i.exec(ua))) {
      os || (os = 'Firefox OS');
      product || (product = data[1]);
    }
    // Detect false positives for Firefox/Safari.
    else if (!name || (data = !/\bMinefield\b/i.test(ua) && /\b(?:Firefox|Safari)\b/.exec(name))) {
      // Escape the `/` for Firefox 1.
      if (name && !product && /[\/,]|^[^(]+?\)/.test(ua.slice(ua.indexOf(data + '/') + 8))) {
        // Clear name of false positives.
        name = null;
      }
      // Reassign a generic name.
      if ((data = product || manufacturer || os) &&
          (product || manufacturer || /\b(?:Android|Symbian OS|Tablet OS|webOS)\b/.test(os))) {
        name = /[a-z]+(?: Hat)?/i.exec(/\bAndroid\b/.test(os) ? os : data) + ' Browser';
      }
    }
    // Add Chrome version to description for Electron.
    else if (name == 'Electron' && (data = (/\bChrome\/([\d.]+)\b/.exec(ua) || 0)[1])) {
      description.push('Chromium ' + data);
    }
    // Detect non-Opera (Presto-based) versions (order is important).
    if (!version) {
      version = getVersion([
        '(?:Cloud9|CriOS|CrMo|Edge|FxiOS|IEMobile|Iron|Opera ?Mini|OPiOS|OPR|Raven|SamsungBrowser|Silk(?!/[\\d.]+$))',
        'Version',
        qualify(name),
        '(?:Firefox|Minefield|NetFront)'
      ]);
    }
    // Detect stubborn layout engines.
    if ((data =
          layout == 'iCab' && parseFloat(version) > 3 && 'WebKit' ||
          /\bOpera\b/.test(name) && (/\bOPR\b/.test(ua) ? 'Blink' : 'Presto') ||
          /\b(?:Midori|Nook|Safari)\b/i.test(ua) && !/^(?:Trident|EdgeHTML)$/.test(layout) && 'WebKit' ||
          !layout && /\bMSIE\b/i.test(ua) && (os == 'Mac OS' ? 'Tasman' : 'Trident') ||
          layout == 'WebKit' && /\bPlayStation\b(?! Vita\b)/i.test(name) && 'NetFront'
        )) {
      layout = [data];
    }
    // Detect Windows Phone 7 desktop mode.
    if (name == 'IE' && (data = (/; *(?:XBLWP|ZuneWP)(\d+)/i.exec(ua) || 0)[1])) {
      name += ' Mobile';
      os = 'Windows Phone ' + (/\+$/.test(data) ? data : data + '.x');
      description.unshift('desktop mode');
    }
    // Detect Windows Phone 8.x desktop mode.
    else if (/\bWPDesktop\b/i.test(ua)) {
      name = 'IE Mobile';
      os = 'Windows Phone 8.x';
      description.unshift('desktop mode');
      version || (version = (/\brv:([\d.]+)/.exec(ua) || 0)[1]);
    }
    // Detect IE 11 identifying as other browsers.
    else if (name != 'IE' && layout == 'Trident' && (data = /\brv:([\d.]+)/.exec(ua))) {
      if (name) {
        description.push('identifying as ' + name + (version ? ' ' + version : ''));
      }
      name = 'IE';
      version = data[1];
    }
    // Leverage environment features.
    if (useFeatures) {
      // Detect server-side environments.
      // Rhino has a global function while others have a global object.
      if (isHostType(context, 'global')) {
        if (java) {
          data = java.lang.System;
          arch = data.getProperty('os.arch');
          os = os || data.getProperty('os.name') + ' ' + data.getProperty('os.version');
        }
        if (rhino) {
          try {
            version = context.require('ringo/engine').version.join('.');
            name = 'RingoJS';
          } catch(e) {
            if ((data = context.system) && data.global.system == context.system) {
              name = 'Narwhal';
              os || (os = data[0].os || null);
            }
          }
          if (!name) {
            name = 'Rhino';
          }
        }
        else if (
          typeof context.process == 'object' && !context.process.browser &&
          (data = context.process)
        ) {
          if (typeof data.versions == 'object') {
            if (typeof data.versions.electron == 'string') {
              description.push('Node ' + data.versions.node);
              name = 'Electron';
              version = data.versions.electron;
            } else if (typeof data.versions.nw == 'string') {
              description.push('Chromium ' + version, 'Node ' + data.versions.node);
              name = 'NW.js';
              version = data.versions.nw;
            }
          }
          if (!name) {
            name = 'Node.js';
            arch = data.arch;
            os = data.platform;
            version = /[\d.]+/.exec(data.version);
            version = version ? version[0] : null;
          }
        }
      }
      // Detect Adobe AIR.
      else if (getClassOf((data = context.runtime)) == airRuntimeClass) {
        name = 'Adobe AIR';
        os = data.flash.system.Capabilities.os;
      }
      // Detect PhantomJS.
      else if (getClassOf((data = context.phantom)) == phantomClass) {
        name = 'PhantomJS';
        version = (data = data.version || null) && (data.major + '.' + data.minor + '.' + data.patch);
      }
      // Detect IE compatibility modes.
      else if (typeof doc.documentMode == 'number' && (data = /\bTrident\/(\d+)/i.exec(ua))) {
        // We're in compatibility mode when the Trident version + 4 doesn't
        // equal the document mode.
        version = [version, doc.documentMode];
        if ((data = +data[1] + 4) != version[1]) {
          description.push('IE ' + version[1] + ' mode');
          layout && (layout[1] = '');
          version[1] = data;
        }
        version = name == 'IE' ? String(version[1].toFixed(1)) : version[0];
      }
      // Detect IE 11 masking as other browsers.
      else if (typeof doc.documentMode == 'number' && /^(?:Chrome|Firefox)\b/.test(name)) {
        description.push('masking as ' + name + ' ' + version);
        name = 'IE';
        version = '11.0';
        layout = ['Trident'];
        os = 'Windows';
      }
      os = os && format(os);
    }
    // Detect prerelease phases.
    if (version && (data =
          /(?:[ab]|dp|pre|[ab]\d+pre)(?:\d+\+?)?$/i.exec(version) ||
          /(?:alpha|beta)(?: ?\d)?/i.exec(ua + ';' + (useFeatures && nav.appMinorVersion)) ||
          /\bMinefield\b/i.test(ua) && 'a'
        )) {
      prerelease = /b/i.test(data) ? 'beta' : 'alpha';
      version = version.replace(RegExp(data + '\\+?$'), '') +
        (prerelease == 'beta' ? beta : alpha) + (/\d+\+?/.exec(data) || '');
    }
    // Detect Firefox Mobile.
    if (name == 'Fennec' || name == 'Firefox' && /\b(?:Android|Firefox OS)\b/.test(os)) {
      name = 'Firefox Mobile';
    }
    // Obscure Maxthon's unreliable version.
    else if (name == 'Maxthon' && version) {
      version = version.replace(/\.[\d.]+/, '.x');
    }
    // Detect Xbox 360 and Xbox One.
    else if (/\bXbox\b/i.test(product)) {
      if (product == 'Xbox 360') {
        os = null;
      }
      if (product == 'Xbox 360' && /\bIEMobile\b/.test(ua)) {
        description.unshift('mobile mode');
      }
    }
    // Add mobile postfix.
    else if ((/^(?:Chrome|IE|Opera)$/.test(name) || name && !product && !/Browser|Mobi/.test(name)) &&
        (os == 'Windows CE' || /Mobi/i.test(ua))) {
      name += ' Mobile';
    }
    // Detect IE platform preview.
    else if (name == 'IE' && useFeatures) {
      try {
        if (context.external === null) {
          description.unshift('platform preview');
        }
      } catch(e) {
        description.unshift('embedded');
      }
    }
    // Detect BlackBerry OS version.
    // http://docs.blackberry.com/en/developers/deliverables/18169/HTTP_headers_sent_by_BB_Browser_1234911_11.jsp
    else if ((/\bBlackBerry\b/.test(product) || /\bBB10\b/.test(ua)) && (data =
          (RegExp(product.replace(/ +/g, ' *') + '/([.\\d]+)', 'i').exec(ua) || 0)[1] ||
          version
        )) {
      data = [data, /BB10/.test(ua)];
      os = (data[1] ? (product = null, manufacturer = 'BlackBerry') : 'Device Software') + ' ' + data[0];
      version = null;
    }
    // Detect Opera identifying/masking itself as another browser.
    // http://www.opera.com/support/kb/view/843/
    else if (this != forOwn && product != 'Wii' && (
          (useFeatures && opera) ||
          (/Opera/.test(name) && /\b(?:MSIE|Firefox)\b/i.test(ua)) ||
          (name == 'Firefox' && /\bOS X (?:\d+\.){2,}/.test(os)) ||
          (name == 'IE' && (
            (os && !/^Win/.test(os) && version > 5.5) ||
            /\bWindows XP\b/.test(os) && version > 8 ||
            version == 8 && !/\bTrident\b/.test(ua)
          ))
        ) && !reOpera.test((data = parse.call(forOwn, ua.replace(reOpera, '') + ';'))) && data.name) {
      // When "identifying", the UA contains both Opera and the other browser's name.
      data = 'ing as ' + data.name + ((data = data.version) ? ' ' + data : '');
      if (reOpera.test(name)) {
        if (/\bIE\b/.test(data) && os == 'Mac OS') {
          os = null;
        }
        data = 'identify' + data;
      }
      // When "masking", the UA contains only the other browser's name.
      else {
        data = 'mask' + data;
        if (operaClass) {
          name = format(operaClass.replace(/([a-z])([A-Z])/g, '$1 $2'));
        } else {
          name = 'Opera';
        }
        if (/\bIE\b/.test(data)) {
          os = null;
        }
        if (!useFeatures) {
          version = null;
        }
      }
      layout = ['Presto'];
      description.push(data);
    }
    // Detect WebKit Nightly and approximate Chrome/Safari versions.
    if ((data = (/\bAppleWebKit\/([\d.]+\+?)/i.exec(ua) || 0)[1])) {
      // Correct build number for numeric comparison.
      // (e.g. "532.5" becomes "532.05")
      data = [parseFloat(data.replace(/\.(\d)$/, '.0$1')), data];
      // Nightly builds are postfixed with a "+".
      if (name == 'Safari' && data[1].slice(-1) == '+') {
        name = 'WebKit Nightly';
        prerelease = 'alpha';
        version = data[1].slice(0, -1);
      }
      // Clear incorrect browser versions.
      else if (version == data[1] ||
          version == (data[2] = (/\bSafari\/([\d.]+\+?)/i.exec(ua) || 0)[1])) {
        version = null;
      }
      // Use the full Chrome version when available.
      data[1] = (/\bChrome\/([\d.]+)/i.exec(ua) || 0)[1];
      // Detect Blink layout engine.
      if (data[0] == 537.36 && data[2] == 537.36 && parseFloat(data[1]) >= 28 && layout == 'WebKit') {
        layout = ['Blink'];
      }
      // Detect JavaScriptCore.
      // http://stackoverflow.com/questions/6768474/how-can-i-detect-which-javascript-engine-v8-or-jsc-is-used-at-runtime-in-androi
      if (!useFeatures || (!likeChrome && !data[1])) {
        layout && (layout[1] = 'like Safari');
        data = (data = data[0], data < 400 ? 1 : data < 500 ? 2 : data < 526 ? 3 : data < 533 ? 4 : data < 534 ? '4+' : data < 535 ? 5 : data < 537 ? 6 : data < 538 ? 7 : data < 601 ? 8 : '8');
      } else {
        layout && (layout[1] = 'like Chrome');
        data = data[1] || (data = data[0], data < 530 ? 1 : data < 532 ? 2 : data < 532.05 ? 3 : data < 533 ? 4 : data < 534.03 ? 5 : data < 534.07 ? 6 : data < 534.10 ? 7 : data < 534.13 ? 8 : data < 534.16 ? 9 : data < 534.24 ? 10 : data < 534.30 ? 11 : data < 535.01 ? 12 : data < 535.02 ? '13+' : data < 535.07 ? 15 : data < 535.11 ? 16 : data < 535.19 ? 17 : data < 536.05 ? 18 : data < 536.10 ? 19 : data < 537.01 ? 20 : data < 537.11 ? '21+' : data < 537.13 ? 23 : data < 537.18 ? 24 : data < 537.24 ? 25 : data < 537.36 ? 26 : layout != 'Blink' ? '27' : '28');
      }
      // Add the postfix of ".x" or "+" for approximate versions.
      layout && (layout[1] += ' ' + (data += typeof data == 'number' ? '.x' : /[.+]/.test(data) ? '' : '+'));
      // Obscure version for some Safari 1-2 releases.
      if (name == 'Safari' && (!version || parseInt(version) > 45)) {
        version = data;
      }
    }
    // Detect Opera desktop modes.
    if (name == 'Opera' &&  (data = /\bzbov|zvav$/.exec(os))) {
      name += ' ';
      description.unshift('desktop mode');
      if (data == 'zvav') {
        name += 'Mini';
        version = null;
      } else {
        name += 'Mobile';
      }
      os = os.replace(RegExp(' *' + data + '$'), '');
    }
    // Detect Chrome desktop mode.
    else if (name == 'Safari' && /\bChrome\b/.exec(layout && layout[1])) {
      description.unshift('desktop mode');
      name = 'Chrome Mobile';
      version = null;

      if (/\bOS X\b/.test(os)) {
        manufacturer = 'Apple';
        os = 'iOS 4.3+';
      } else {
        os = null;
      }
    }
    // Strip incorrect OS versions.
    if (version && version.indexOf((data = /[\d.]+$/.exec(os))) == 0 &&
        ua.indexOf('/' + data + '-') > -1) {
      os = trim(os.replace(data, ''));
    }
    // Add layout engine.
    if (layout && !/\b(?:Avant|Nook)\b/.test(name) && (
        /Browser|Lunascape|Maxthon/.test(name) ||
        name != 'Safari' && /^iOS/.test(os) && /\bSafari\b/.test(layout[1]) ||
        /^(?:Adobe|Arora|Breach|Midori|Opera|Phantom|Rekonq|Rock|Samsung Internet|Sleipnir|Web)/.test(name) && layout[1])) {
      // Don't add layout details to description if they are falsey.
      (data = layout[layout.length - 1]) && description.push(data);
    }
    // Combine contextual information.
    if (description.length) {
      description = ['(' + description.join('; ') + ')'];
    }
    // Append manufacturer to description.
    if (manufacturer && product && product.indexOf(manufacturer) < 0) {
      description.push('on ' + manufacturer);
    }
    // Append product to description.
    if (product) {
      description.push((/^on /.test(description[description.length - 1]) ? '' : 'on ') + product);
    }
    // Parse the OS into an object.
    if (os) {
      data = / ([\d.+]+)$/.exec(os);
      isSpecialCasedOS = data && os.charAt(os.length - data[0].length - 1) == '/';
      os = {
        'architecture': 32,
        'family': (data && !isSpecialCasedOS) ? os.replace(data[0], '') : os,
        'version': data ? data[1] : null,
        'toString': function() {
          var version = this.version;
          return this.family + ((version && !isSpecialCasedOS) ? ' ' + version : '') + (this.architecture == 64 ? ' 64-bit' : '');
        }
      };
    }
    // Add browser/OS architecture.
    if ((data = /\b(?:AMD|IA|Win|WOW|x86_|x)64\b/i.exec(arch)) && !/\bi686\b/i.test(arch)) {
      if (os) {
        os.architecture = 64;
        os.family = os.family.replace(RegExp(' *' + data), '');
      }
      if (
          name && (/\bWOW64\b/i.test(ua) ||
          (useFeatures && /\w(?:86|32)$/.test(nav.cpuClass || nav.platform) && !/\bWin64; x64\b/i.test(ua)))
      ) {
        description.unshift('32-bit');
      }
    }
    // Chrome 39 and above on OS X is always 64-bit.
    else if (
        os && /^OS X/.test(os.family) &&
        name == 'Chrome' && parseFloat(version) >= 39
    ) {
      os.architecture = 64;
    }

    ua || (ua = null);

    /*------------------------------------------------------------------------*/

    /**
     * The platform object.
     *
     * @name platform
     * @type Object
     */
    var platform = {};

    /**
     * The platform description.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.description = ua;

    /**
     * The name of the browser's layout engine.
     *
     * The list of common layout engines include:
     * "Blink", "EdgeHTML", "Gecko", "Trident" and "WebKit"
     *
     * @memberOf platform
     * @type string|null
     */
    platform.layout = layout && layout[0];

    /**
     * The name of the product's manufacturer.
     *
     * The list of manufacturers include:
     * "Apple", "Archos", "Amazon", "Asus", "Barnes & Noble", "BlackBerry",
     * "Google", "HP", "HTC", "LG", "Microsoft", "Motorola", "Nintendo",
     * "Nokia", "Samsung" and "Sony"
     *
     * @memberOf platform
     * @type string|null
     */
    platform.manufacturer = manufacturer;

    /**
     * The name of the browser/environment.
     *
     * The list of common browser names include:
     * "Chrome", "Electron", "Firefox", "Firefox for iOS", "IE",
     * "Microsoft Edge", "PhantomJS", "Safari", "SeaMonkey", "Silk",
     * "Opera Mini" and "Opera"
     *
     * Mobile versions of some browsers have "Mobile" appended to their name:
     * eg. "Chrome Mobile", "Firefox Mobile", "IE Mobile" and "Opera Mobile"
     *
     * @memberOf platform
     * @type string|null
     */
    platform.name = name;

    /**
     * The alpha/beta release indicator.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.prerelease = prerelease;

    /**
     * The name of the product hosting the browser.
     *
     * The list of common products include:
     *
     * "BlackBerry", "Galaxy S4", "Lumia", "iPad", "iPod", "iPhone", "Kindle",
     * "Kindle Fire", "Nexus", "Nook", "PlayBook", "TouchPad" and "Transformer"
     *
     * @memberOf platform
     * @type string|null
     */
    platform.product = product;

    /**
     * The browser's user agent string.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.ua = ua;

    /**
     * The browser/environment version.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.version = name && version;

    /**
     * The name of the operating system.
     *
     * @memberOf platform
     * @type Object
     */
    platform.os = os || {

      /**
       * The CPU architecture the OS is built for.
       *
       * @memberOf platform.os
       * @type number|null
       */
      'architecture': null,

      /**
       * The family of the OS.
       *
       * Common values include:
       * "Windows", "Windows Server 2008 R2 / 7", "Windows Server 2008 / Vista",
       * "Windows XP", "OS X", "Ubuntu", "Debian", "Fedora", "Red Hat", "SuSE",
       * "Android", "iOS" and "Windows Phone"
       *
       * @memberOf platform.os
       * @type string|null
       */
      'family': null,

      /**
       * The version of the OS.
       *
       * @memberOf platform.os
       * @type string|null
       */
      'version': null,

      /**
       * Returns the OS string.
       *
       * @memberOf platform.os
       * @returns {string} The OS string.
       */
      'toString': function() { return 'null'; }
    };

    platform.parse = parse;
    platform.toString = toStringPlatform;

    if (platform.version) {
      description.unshift(version);
    }
    if (platform.name) {
      description.unshift(name);
    }
    if (os && name && !(os == String(os).split(' ')[0] && (os == name.split(' ')[0] || product))) {
      description.push(product ? '(' + os + ')' : 'on ' + os);
    }
    if (description.length) {
      platform.description = description.join(' ');
    }
    return platform;
  }

  /*--------------------------------------------------------------------------*/

  // Export platform.
  var platform = parse();

  // Some AMD build optimizers, like r.js, check for condition patterns like the following:
  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    // Expose platform on the global object to prevent errors when platform is
    // loaded by a script tag in the presence of an AMD loader.
    // See http://requirejs.org/docs/errors.html#mismatch for more details.
    root.platform = platform;

    // Define as an anonymous module so platform can be aliased through path mapping.
    define(function() {
      return platform;
    });
  }
  // Check for `exports` after `define` in case a build optimizer adds an `exports` object.
  else if (freeExports && freeModule) {
    // Export for CommonJS support.
    forOwn(platform, function(value, key) {
      freeExports[key] = value;
    });
  }
  else {
    // Export to the global object.
    root.platform = platform;
  }
}.call(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],194:[function(_dereq_,module,exports){
/*
 * Copyright (c) 2012 Mathieu Turcotte
 * Licensed under the MIT license.
 */

module.exports = _dereq_('./lib/checks');
},{"./lib/checks":195}],195:[function(_dereq_,module,exports){
/*
 * Copyright (c) 2012 Mathieu Turcotte
 * Licensed under the MIT license.
 */

var util = _dereq_('util');

var errors = module.exports = _dereq_('./errors');

function failCheck(ExceptionConstructor, callee, messageFormat, formatArgs) {
    messageFormat = messageFormat || '';
    var message = util.format.apply(this, [messageFormat].concat(formatArgs));
    var error = new ExceptionConstructor(message);
    Error.captureStackTrace(error, callee);
    throw error;
}

function failArgumentCheck(callee, message, formatArgs) {
    failCheck(errors.IllegalArgumentError, callee, message, formatArgs);
}

function failStateCheck(callee, message, formatArgs) {
    failCheck(errors.IllegalStateError, callee, message, formatArgs);
}

module.exports.checkArgument = function(value, message) {
    if (!value) {
        failArgumentCheck(arguments.callee, message,
            Array.prototype.slice.call(arguments, 2));
    }
};

module.exports.checkState = function(value, message) {
    if (!value) {
        failStateCheck(arguments.callee, message,
            Array.prototype.slice.call(arguments, 2));
    }
};

module.exports.checkIsDef = function(value, message) {
    if (value !== undefined) {
        return value;
    }

    failArgumentCheck(arguments.callee, message ||
        'Expected value to be defined but was undefined.',
        Array.prototype.slice.call(arguments, 2));
};

module.exports.checkIsDefAndNotNull = function(value, message) {
    // Note that undefined == null.
    if (value != null) {
        return value;
    }

    failArgumentCheck(arguments.callee, message ||
        'Expected value to be defined and not null but got "' +
        typeOf(value) + '".', Array.prototype.slice.call(arguments, 2));
};

// Fixed version of the typeOf operator which returns 'null' for null values
// and 'array' for arrays.
function typeOf(value) {
    var s = typeof value;
    if (s == 'object') {
        if (!value) {
            return 'null';
        } else if (value instanceof Array) {
            return 'array';
        }
    }
    return s;
}

function typeCheck(expect) {
    return function(value, message) {
        var type = typeOf(value);

        if (type == expect) {
            return value;
        }

        failArgumentCheck(arguments.callee, message ||
            'Expected "' + expect + '" but got "' + type + '".',
            Array.prototype.slice.call(arguments, 2));
    };
}

module.exports.checkIsString = typeCheck('string');
module.exports.checkIsArray = typeCheck('array');
module.exports.checkIsNumber = typeCheck('number');
module.exports.checkIsBoolean = typeCheck('boolean');
module.exports.checkIsFunction = typeCheck('function');
module.exports.checkIsObject = typeCheck('object');

},{"./errors":196,"util":236}],196:[function(_dereq_,module,exports){
/*
 * Copyright (c) 2012 Mathieu Turcotte
 * Licensed under the MIT license.
 */

var util = _dereq_('util');

function IllegalArgumentError(message) {
    Error.call(this, message);
    this.message = message;
}
util.inherits(IllegalArgumentError, Error);

IllegalArgumentError.prototype.name = 'IllegalArgumentError';

function IllegalStateError(message) {
    Error.call(this, message);
    this.message = message;
}
util.inherits(IllegalStateError, Error);

IllegalStateError.prototype.name = 'IllegalStateError';

module.exports.IllegalStateError = IllegalStateError;
module.exports.IllegalArgumentError = IllegalArgumentError;
},{"util":236}],197:[function(_dereq_,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],198:[function(_dereq_,module,exports){
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// This method of obtaining a reference to the global object needs to be
// kept identical to the way it is obtained in runtime.js
var g = (function() { return this })() || Function("return this")();

// Use `getOwnPropertyNames` because not all browsers support calling
// `hasOwnProperty` on the global `self` object in a worker. See #183.
var hadRuntime = g.regeneratorRuntime &&
  Object.getOwnPropertyNames(g).indexOf("regeneratorRuntime") >= 0;

// Save the old regeneratorRuntime in case it needs to be restored later.
var oldRuntime = hadRuntime && g.regeneratorRuntime;

// Force reevalutation of runtime.js.
g.regeneratorRuntime = undefined;

module.exports = _dereq_("./runtime");

if (hadRuntime) {
  // Restore the original runtime.
  g.regeneratorRuntime = oldRuntime;
} else {
  // Remove the global property added by runtime.js.
  try {
    delete g.regeneratorRuntime;
  } catch(e) {
    g.regeneratorRuntime = undefined;
  }
}

},{"./runtime":199}],199:[function(_dereq_,module,exports){
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

!(function(global) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  var inModule = typeof module === "object";
  var runtime = global.regeneratorRuntime;
  if (runtime) {
    if (inModule) {
      // If regeneratorRuntime is defined globally and we're in a module,
      // make the exports object identical to regeneratorRuntime.
      module.exports = runtime;
    }
    // Don't bother evaluating the rest of this file if the runtime was
    // already defined globally.
    return;
  }

  // Define the runtime globally (as expected by generated code) as either
  // module.exports (if we're in a module) or a new, empty object.
  runtime = global.regeneratorRuntime = inModule ? module.exports : {};

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  runtime.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunctionPrototype[toStringTagSymbol] =
    GeneratorFunction.displayName = "GeneratorFunction";

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      prototype[method] = function(arg) {
        return this._invoke(method, arg);
      };
    });
  }

  runtime.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  runtime.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      if (!(toStringTagSymbol in genFun)) {
        genFun[toStringTagSymbol] = "GeneratorFunction";
      }
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  runtime.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return Promise.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return Promise.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration. If the Promise is rejected, however, the
          // result for this iteration will be rejected with the same
          // reason. Note that rejections of yielded Promises are not
          // thrown back into the generator function, as is the case
          // when an awaited Promise is rejected. This difference in
          // behavior between yield and await is important, because it
          // allows the consumer to decide what to do with the yielded
          // rejection (swallow it and continue, manually .throw it back
          // into the generator, abandon iteration, whatever). With
          // await, by contrast, there is no opportunity to examine the
          // rejection reason outside the generator function, so the
          // only option is to throw it from the await expression, and
          // let the generator function handle the exception.
          result.value = unwrapped;
          resolve(result);
        }, reject);
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new Promise(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  runtime.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  runtime.async = function(innerFn, outerFn, self, tryLocsList) {
    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList)
    );

    return runtime.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        if (delegate.iterator.return) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  Gp[toStringTagSymbol] = "Generator";

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  runtime.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  runtime.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };
})(
  // In sloppy mode, unbound `this` refers to the global object, fallback to
  // Function constructor if we're in global strict mode. That is sadly a form
  // of indirect eval which violates Content Security Policy.
  (function() { return this })() || Function("return this")()
);

},{}],200:[function(_dereq_,module,exports){
"use strict";

var _regenerator = _dereq_("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = _dereq_("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _getPrototypeOf = _dereq_("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = _dereq_("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = _dereq_("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = _dereq_("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = _dereq_("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = _dereq_("events");
var twilsock_1 = _dereq_("twilsock");
var configuration_1 = _dereq_("./configuration");
var registrar_1 = _dereq_("./registrar");
var logger_1 = _dereq_("./logger");
/**
 * @class
 * @alias Notifications
 * @classdesc The helper library for the notification service.
 * Provides high level api for creating and managing notification subscriptions and receiving messages
 * Creates the instance of Notification helper library
 *
 * @constructor
 * @param {string} token - Twilio access token
 * @param {Notifications#ClientOptions} options - Options to customize client behavior
 */

var Client = function (_events_1$EventEmitte) {
    (0, _inherits3.default)(Client, _events_1$EventEmitte);

    function Client(token) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        (0, _classCallCheck3.default)(this, Client);

        var _this = (0, _possibleConstructorReturn3.default)(this, (Client.__proto__ || (0, _getPrototypeOf2.default)(Client)).call(this));

        if (!token || token.length === 0) {
            throw new Error('Token is required for Notifications client');
        }
        options.logLevel = options.logLevel || 'error';
        logger_1.log.setLevel(options.logLevel);
        var minTokenRefreshInterval = options.minTokenRefreshInterval || 10000;
        var productId = options.productId || 'notifications';
        options.twilsockClient = options.twilsockClient || new twilsock_1.TwilsockClient(token, productId, options);
        options.transport = options.transport || options.twilsockClient;
        _this.services = {
            twilsock: options.twilsockClient,
            transport: options.transport,
            config: new configuration_1.Configuration(null, options)
        };
        _this.registrar = new registrar_1.Registrar(productId, _this.services.transport, _this.services.twilsock, _this.services.config);
        _this.reliableTransportState = {
            overall: false,
            transport: false,
            registration: false,
            lastEmitted: null
        };
        _this._onTransportStateChange(_this.services.twilsock.isConnected);
        _this.registrar.on('transportReady', function (state) {
            _this._onRegistrationStateChange(state ? 'registered' : '');
        });
        _this.registrar.on('stateChanged', function (state) {
            _this._onRegistrationStateChange(state);
        });
        _this.registrar.on('needReliableTransport', _this._onNeedReliableTransport.bind(_this));
        _this.services.twilsock.on('message', function (type, message) {
            return _this._routeMessage(type, message);
        });
        _this.services.twilsock.on('connected', function (notificationId) {
            _this._onTransportStateChange(true);
            _this.registrar.setNotificationId('twilsock', notificationId);
        });
        _this.services.twilsock.on('disconnected', function () {
            _this._onTransportStateChange(false);
        });
        _this.updateToken(token);
        return _this;
    }

    (0, _createClass3.default)(Client, [{
        key: "_routeMessage",

        /**
         * Routes messages to the external subscribers
         * @private
         */
        value: function _routeMessage(type, message) {
            logger_1.log.trace('Message arrived: ', type, message);
            this.emit('message', type, message);
        }
    }, {
        key: "_onNeedReliableTransport",
        value: function _onNeedReliableTransport(isNeeded) {
            if (isNeeded) {
                this.services.twilsock.connect();
            } else {
                this.services.twilsock.disconnect();
            }
        }
    }, {
        key: "_onRegistrationStateChange",
        value: function _onRegistrationStateChange(state) {
            this.reliableTransportState.registration = state === 'registered';
            this._updateTransportState();
        }
    }, {
        key: "_onTransportStateChange",
        value: function _onTransportStateChange(connected) {
            this.reliableTransportState.transport = connected;
            this._updateTransportState();
        }
    }, {
        key: "_updateTransportState",
        value: function _updateTransportState() {
            var overallState = this.reliableTransportState.transport && this.reliableTransportState.registration;
            if (this.reliableTransportState.overall !== overallState) {
                this.reliableTransportState.overall = overallState;
                logger_1.log.info('Transport ready:', overallState);
                this.emit('transportReady', overallState);
            }
            if (this.reliableTransportState.lastEmitted !== this.connectionState) {
                this.reliableTransportState.lastEmitted = this.connectionState;
                this.emit('connectionStateChanged', this.connectionState);
            }
        }
        /**
         * Adds the subscription for the given message type
         * @param {string} messageType The type of message that you want to receive
         * @param {string} channelType. Supported are 'twilsock', 'gcm' and 'fcm'
         */

    }, {
        key: "subscribe",
        value: function subscribe(messageType) {
            var channelType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'twilsock';

            logger_1.log.trace('Add subscriptions for message type: ', messageType, channelType);
            return this.registrar.subscribe(messageType, channelType);
        }
        /**
         * Remove the subscription for the particular message type
         * @param {string} messageType The type of message that you don't want to receive anymore
         * @param {string} channelType. Supported are 'twilsock', 'gcm' and 'fcm'
         */

    }, {
        key: "unsubscribe",
        value: function unsubscribe(messageType) {
            var channelType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'twilsock';

            logger_1.log.trace('Remove subscriptions for message type: ', messageType, channelType);
            return this.registrar.unsubscribe(messageType, channelType);
        }
        /**
         * Handle incoming push notification.
         * Client application should call this method when it receives push notifications and pass the received data
         * @param {Object} message push message
         * @return {PushNotification}
         */

    }, {
        key: "handlePushNotification",
        value: function handlePushNotification(message) {
            return {
                messageType: message.twi_message_type,
                payload: message.payload
            };
        }
        /**
         * Set APN/GCM/FCM token to enable application register for a push messages
         * @param {string} gcmToken/fcmToken Token received from GCM/FCM system
         */

    }, {
        key: "setPushRegistrationId",
        value: function setPushRegistrationId(registrationId, channelType) {
            logger_1.log.trace('Set push registration id', registrationId, channelType);
            this.registrar.setNotificationId(channelType, registrationId);
        }
        /**
         * Updates auth token for registration
         * @param {string} token Authentication token for registrations
         */

    }, {
        key: "updateToken",
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(token) {
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                logger_1.log.info('authTokenUpdated');

                                if (!(this.services.config.token === token)) {
                                    _context.next = 3;
                                    break;
                                }

                                return _context.abrupt("return");

                            case 3:
                                this.services.twilsock.updateToken(token);
                                this.services.config.updateToken(token);
                                this.registrar.updateToken(token);

                            case 6:
                            case "end":
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function updateToken(_x4) {
                return _ref.apply(this, arguments);
            }

            return updateToken;
        }()
    }, {
        key: "connectionState",
        get: function get() {
            if (this.services.twilsock.state === 'disconnected') {
                return 'disconnected';
            } else if (this.services.twilsock.state === 'disconnecting') {
                return 'disconnecting';
            } else if (this.services.twilsock.state === 'connected' && this.reliableTransportState.registration) {
                return 'connected';
            } else if (this.services.twilsock.state === 'rejected') {
                return 'denied';
            }
            return 'connecting';
        }
    }]);
    return Client;
}(events_1.EventEmitter);

exports.Client = Client;
/**
 * Fired when new message arrived.
 * @param {Object} message`
 * @event Client#message
 */
/**
 * Fired when transport state has changed
 * @param {boolean} transport state
 * @event Client#transportReady
 */
/**
 * Fired when transport state has been changed
 * @param {string} transport state
 * @event Client#connectionStateChanged
 */
/**
 * These options can be passed to Client constructor
 * @typedef {Object} Notifications#ClientOptions
 * @property {String} [logLevel='error'] - The level of logging to enable. Valid options
 *   (from strictest to broadest): ['silent', 'error', 'warn', 'info', 'debug', 'trace']
 */

},{"./configuration":201,"./logger":204,"./registrar":206,"babel-runtime/core-js/object/get-prototype-of":32,"babel-runtime/helpers/asyncToGenerator":39,"babel-runtime/helpers/classCallCheck":40,"babel-runtime/helpers/createClass":41,"babel-runtime/helpers/inherits":43,"babel-runtime/helpers/possibleConstructorReturn":44,"babel-runtime/regenerator":48,"events":187,"twilsock":216}],201:[function(_dereq_,module,exports){
"use strict";

var _classCallCheck2 = _dereq_("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = _dereq_("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });

var Configuration = function () {
    function Configuration(token) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        (0, _classCallCheck3.default)(this, Configuration);

        var config = options.notifications || {};
        var region = config.region || options.region || 'us1';
        var defaultUrl = "https://ers." + region + ".twilio.com/v1/registrations";
        this.registrarUrl = config.ersUrl || defaultUrl;
        this._token = token;
    }

    (0, _createClass3.default)(Configuration, [{
        key: "updateToken",
        value: function updateToken(token) {
            this._token = token;
        }
    }, {
        key: "token",
        get: function get() {
            return this._token;
        }
    }]);
    return Configuration;
}();

exports.Configuration = Configuration;

},{"babel-runtime/helpers/classCallCheck":40,"babel-runtime/helpers/createClass":41}],202:[function(_dereq_,module,exports){
"use strict";

var _slicedToArray2 = _dereq_("babel-runtime/helpers/slicedToArray");

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _regenerator = _dereq_("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = _dereq_("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _getPrototypeOf = _dereq_("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _possibleConstructorReturn2 = _dereq_("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = _dereq_("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

var _toConsumableArray2 = _dereq_("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _set = _dereq_("babel-runtime/core-js/set");

var _set2 = _interopRequireDefault(_set);

var _classCallCheck2 = _dereq_("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = _dereq_("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = _dereq_("events");
var logger_1 = _dereq_("./logger");

var RegistrationState = function () {
    function RegistrationState() {
        var token = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
        var notificationId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
        var messageTypes = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : new _set2.default();
        (0, _classCallCheck3.default)(this, RegistrationState);

        this.token = token;
        this.notificationId = notificationId;
        this.messageTypes = messageTypes;
    }

    (0, _createClass3.default)(RegistrationState, [{
        key: "clone",
        value: function clone() {
            return new RegistrationState(this.token, this.notificationId, new _set2.default(this.messageTypes));
        }
    }]);
    return RegistrationState;
}();

exports.RegistrationState = RegistrationState;
function setDifference(a, b) {
    return [].concat((0, _toConsumableArray3.default)([].concat((0, _toConsumableArray3.default)(a)).filter(function (x) {
        return !b.has(x);
    })), (0, _toConsumableArray3.default)([].concat((0, _toConsumableArray3.default)(b)).filter(function (x) {
        return !a.has(x);
    })));
}
function hasDifference(a, b) {
    var reasons = new _set2.default();
    if (a.notificationId !== b.notificationId) {
        reasons.add('notificationId');
    }
    if (a.token !== b.token) {
        reasons.add('token');
    }
    if (setDifference(a.messageTypes, b.messageTypes).length > 0) {
        reasons.add('messageType');
    }
    return [reasons.size > 0, reasons];
}

var Connector = function (_events_1$EventEmitte) {
    (0, _inherits3.default)(Connector, _events_1$EventEmitte);

    function Connector(config) {
        (0, _classCallCheck3.default)(this, Connector);

        var _this = (0, _possibleConstructorReturn3.default)(this, (Connector.__proto__ || (0, _getPrototypeOf2.default)(Connector)).call(this));

        _this.config = config;
        _this.desiredState = new RegistrationState();
        _this.currentState = new RegistrationState();
        _this.hasActiveAttempt = false;
        return _this;
    }

    (0, _createClass3.default)(Connector, [{
        key: "subscribe",
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(messageType) {
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                if (!this.desiredState.messageTypes.has(messageType)) {
                                    _context.next = 3;
                                    break;
                                }

                                logger_1.log.debug('message type already registered ', messageType);
                                return _context.abrupt("return");

                            case 3:
                                this.desiredState.messageTypes.add(messageType);
                                this.persistRegistration();

                            case 5:
                            case "end":
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function subscribe(_x4) {
                return _ref.apply(this, arguments);
            }

            return subscribe;
        }()
    }, {
        key: "unsubscribe",
        value: function () {
            var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(messageType) {
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                if (this.desiredState.messageTypes.has(messageType)) {
                                    _context2.next = 2;
                                    break;
                                }

                                return _context2.abrupt("return");

                            case 2:
                                this.desiredState.messageTypes.delete(messageType);
                                this.persistRegistration();

                            case 4:
                            case "end":
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function unsubscribe(_x5) {
                return _ref2.apply(this, arguments);
            }

            return unsubscribe;
        }()
    }, {
        key: "updateToken",
        value: function updateToken(token) {
            this.desiredState.token = token;
            this.persistRegistration();
        }
    }, {
        key: "persistRegistration",
        value: function () {
            var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
                var _this2 = this;

                var _hasDifference, _hasDifference2, needToUpdate, reasons, stateToPersist, persistedState;

                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                if (!(!this.config.token || this.config.token.length === 0)) {
                                    _context3.next = 3;
                                    break;
                                }

                                logger_1.log.trace('Can\'t persist registration: token is not set');
                                return _context3.abrupt("return");

                            case 3:
                                if (!this.hasActiveAttempt) {
                                    _context3.next = 6;
                                    break;
                                }

                                logger_1.log.trace('One registration attempt is already in progress');
                                return _context3.abrupt("return");

                            case 6:
                                _hasDifference = hasDifference(this.desiredState, this.currentState), _hasDifference2 = (0, _slicedToArray3.default)(_hasDifference, 2), needToUpdate = _hasDifference2[0], reasons = _hasDifference2[1];

                                if (needToUpdate) {
                                    _context3.next = 9;
                                    break;
                                }

                                return _context3.abrupt("return");

                            case 9:
                                if (!this.currentState.notificationId) {
                                    reasons.delete('notificationId');
                                }
                                logger_1.log.trace('Persisting registration', reasons, this.desiredState);
                                _context3.prev = 11;

                                this.hasActiveAttempt = true;
                                stateToPersist = this.desiredState.clone();

                                if (!(stateToPersist.messageTypes.size > 0)) {
                                    _context3.next = 24;
                                    break;
                                }

                                _context3.next = 17;
                                return this.updateRegistration(stateToPersist, reasons);

                            case 17:
                                persistedState = _context3.sent;

                                this.currentState.token = persistedState.token;
                                this.currentState.notificationId = persistedState.notificationId;
                                this.currentState.messageTypes = persistedState.messageTypes;
                                this.emit('stateChanged', 'registered');
                                _context3.next = 30;
                                break;

                            case 24:
                                _context3.next = 26;
                                return this.removeRegistration();

                            case 26:
                                this.currentState.token = stateToPersist.token;
                                this.currentState.notificationId = stateToPersist.notificationId;
                                this.currentState.messageTypes.clear();
                                this.emit('stateChanged', 'unregistered');

                            case 30:
                                _context3.prev = 30;

                                this.hasActiveAttempt = false;
                                setTimeout(function () {
                                    return _this2.persistRegistration();
                                }, 0);
                                return _context3.finish(30);

                            case 34:
                            case "end":
                                return _context3.stop();
                        }
                    }
                }, _callee3, this, [[11,, 30, 34]]);
            }));

            function persistRegistration() {
                return _ref3.apply(this, arguments);
            }

            return persistRegistration;
        }()
    }, {
        key: "setNotificationId",
        value: function setNotificationId(notificationId) {
            this.desiredState.notificationId = notificationId;
            this.persistRegistration();
        }
    }]);
    return Connector;
}(events_1.EventEmitter);

exports.Connector = Connector;

},{"./logger":204,"babel-runtime/core-js/object/get-prototype-of":32,"babel-runtime/core-js/set":36,"babel-runtime/helpers/asyncToGenerator":39,"babel-runtime/helpers/classCallCheck":40,"babel-runtime/helpers/createClass":41,"babel-runtime/helpers/inherits":43,"babel-runtime/helpers/possibleConstructorReturn":44,"babel-runtime/helpers/slicedToArray":45,"babel-runtime/helpers/toConsumableArray":46,"babel-runtime/regenerator":48,"events":187}],203:[function(_dereq_,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = _dereq_("./client");
exports.Notifications = client_1.Client;

},{"./client":200}],204:[function(_dereq_,module,exports){
"use strict";

var _classCallCheck2 = _dereq_("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = _dereq_("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _from = _dereq_("babel-runtime/core-js/array/from");

var _from2 = _interopRequireDefault(_from);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var logger = _dereq_("loglevel");
function prepareLine(prefix, args) {
    return [new Date().toISOString() + " Notifications " + prefix + ":"].concat((0, _from2.default)(args));
}

var Logger = function () {
    function Logger() {
        (0, _classCallCheck3.default)(this, Logger);

        this.prefix = '';
    }

    (0, _createClass3.default)(Logger, [{
        key: "setLevel",
        value: function setLevel(level) {
            logger.setLevel(level);
        }
    }, {
        key: "trace",
        value: function trace() {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            logger.debug.apply(null, prepareLine('T' + this.prefix, args));
        }
    }, {
        key: "debug",
        value: function debug() {
            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                args[_key2] = arguments[_key2];
            }

            logger.debug.apply(null, prepareLine('D' + this.prefix, args));
        }
    }, {
        key: "info",
        value: function info() {
            for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                args[_key3] = arguments[_key3];
            }

            logger.info.apply(null, prepareLine('I' + this.prefix, args));
        }
    }, {
        key: "warn",
        value: function warn() {
            for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
                args[_key4] = arguments[_key4];
            }

            logger.warn.apply(null, prepareLine('W' + this.prefix, args));
        }
    }, {
        key: "error",
        value: function error() {
            for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
                args[_key5] = arguments[_key5];
            }

            logger.error.apply(null, prepareLine('E' + this.prefix, args));
        }
    }], [{
        key: "scope",
        value: function scope() {
            var prefix = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

            // TBD this.prefix += ' ' + prefix;
            return new Logger();
        }
    }]);
    return Logger;
}();

exports.Logger = Logger;
var logInstance = Logger.scope();
exports.log = logInstance;

},{"babel-runtime/core-js/array/from":23,"babel-runtime/helpers/classCallCheck":40,"babel-runtime/helpers/createClass":41,"loglevel":191}],205:[function(_dereq_,module,exports){
"use strict";

var _from = _dereq_("babel-runtime/core-js/array/from");

var _from2 = _interopRequireDefault(_from);

var _assign = _dereq_("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

var _regenerator = _dereq_("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = _dereq_("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _getPrototypeOf = _dereq_("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = _dereq_("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = _dereq_("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = _dereq_("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = _dereq_("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var operation_retrier_1 = _dereq_("operation-retrier");
var logger_1 = _dereq_("./logger");
var connector_1 = _dereq_("./connector");
exports.Connector = connector_1.Connector;
var retrierConfig = {
    min: 2000,
    max: 120000,
    randomness: 0.2
};
/**
 * Manages the registrations on ERS service.
 * Deduplicates registrations and manages them automatically
 */

var RegistrarConnector = function (_connector_1$Connecto) {
    (0, _inherits3.default)(RegistrarConnector, _connector_1$Connecto);

    /**
     * Creates new instance of the ERS registrar
     *
     * @param Object configuration
     * @param string notificationId
     * @param string channelType
     * @param Array messageTypes
     */
    function RegistrarConnector(channelType, context, transport, config) {
        (0, _classCallCheck3.default)(this, RegistrarConnector);

        var _this = (0, _possibleConstructorReturn3.default)(this, (RegistrarConnector.__proto__ || (0, _getPrototypeOf2.default)(RegistrarConnector)).call(this, config));

        _this.channelType = channelType;
        _this.context = context;
        _this.transport = transport;
        return _this;
    }

    (0, _createClass3.default)(RegistrarConnector, [{
        key: "updateRegistration",
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(registration, reasons) {
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                if (!reasons.has('notificationId')) {
                                    _context.next = 3;
                                    break;
                                }

                                _context.next = 3;
                                return this.removeRegistration();

                            case 3:
                                if (!(!registration.notificationId || !registration.notificationId.length)) {
                                    _context.next = 5;
                                    break;
                                }

                                return _context.abrupt("return", registration);

                            case 5:
                                _context.next = 7;
                                return this.register(registration);

                            case 7:
                                return _context.abrupt("return", registration);

                            case 8:
                            case "end":
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function updateRegistration(_x, _x2) {
                return _ref.apply(this, arguments);
            }

            return updateRegistration;
        }()
    }, {
        key: "removeRegistration",
        value: function () {
            var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
                var _this2 = this;

                var url, headers;
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                if (this.registrationId) {
                                    _context2.next = 2;
                                    break;
                                }

                                return _context2.abrupt("return");

                            case 2:
                                url = this.config.registrarUrl + "/" + this.registrationId + "?productId=" + this.context.productId;
                                headers = {
                                    'Content-Type': 'application/json',
                                    'X-Twilio-Token': this.config.token
                                };
                                _context2.prev = 4;

                                logger_1.log.trace('Removing registration for ', this.channelType);
                                _context2.next = 8;
                                return new operation_retrier_1.Retrier((0, _assign2.default)(retrierConfig, { maxAttemptsCount: 3 })).run(function () {
                                    return _this2.transport.delete(url, headers);
                                });

                            case 8:
                                logger_1.log.debug('Registration removed for', this.channelType);
                                _context2.next = 15;
                                break;

                            case 11:
                                _context2.prev = 11;
                                _context2.t0 = _context2["catch"](4);

                                logger_1.log.error('Failed to remove of registration ', this.channelType, _context2.t0);
                                throw _context2.t0;

                            case 15:
                            case "end":
                                return _context2.stop();
                        }
                    }
                }, _callee2, this, [[4, 11]]);
            }));

            function removeRegistration() {
                return _ref2.apply(this, arguments);
            }

            return removeRegistration;
        }()
    }, {
        key: "register",
        value: function () {
            var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(registration) {
                var _this3 = this;

                var registrarRequest, url, headers, response;
                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                logger_1.log.trace('Registering', this.channelType, registration);
                                registrarRequest = {
                                    endpoint_platform: this.context.platform,
                                    channel_type: this.channelType,
                                    version: this.context.protocolVersion.toString(),
                                    message_types: (0, _from2.default)(registration.messageTypes),
                                    data: {
                                        registration_id: registration.notificationId
                                    },
                                    ttl: 'PT24H'
                                };
                                url = this.config.registrarUrl + "?productId=" + this.context.productId;
                                headers = {
                                    'Content-Type': 'application/json',
                                    'X-Twilio-Token': registration.token
                                };

                                logger_1.log.trace('Creating registration for channel ', this.channelType);
                                _context3.prev = 5;
                                _context3.next = 8;
                                return new operation_retrier_1.Retrier(retrierConfig).run(function () {
                                    return _this3.transport.post(url, headers, registrarRequest);
                                });

                            case 8:
                                response = _context3.sent;

                                this.registrationId = response.body.id;
                                logger_1.log.debug('Registration created: ', response);
                                _context3.next = 17;
                                break;

                            case 13:
                                _context3.prev = 13;
                                _context3.t0 = _context3["catch"](5);

                                logger_1.log.error('Registration failed: ', _context3.t0);
                                throw _context3.t0;

                            case 17:
                            case "end":
                                return _context3.stop();
                        }
                    }
                }, _callee3, this, [[5, 13]]);
            }));

            function register(_x3) {
                return _ref3.apply(this, arguments);
            }

            return register;
        }()
    }]);
    return RegistrarConnector;
}(connector_1.Connector);

exports.RegistrarConnector = RegistrarConnector;

},{"./connector":202,"./logger":204,"babel-runtime/core-js/array/from":23,"babel-runtime/core-js/object/assign":28,"babel-runtime/core-js/object/get-prototype-of":32,"babel-runtime/helpers/asyncToGenerator":39,"babel-runtime/helpers/classCallCheck":40,"babel-runtime/helpers/createClass":41,"babel-runtime/helpers/inherits":43,"babel-runtime/helpers/possibleConstructorReturn":44,"babel-runtime/regenerator":48,"operation-retrier":192}],206:[function(_dereq_,module,exports){
"use strict";

var _map = _dereq_("babel-runtime/core-js/map");

var _map2 = _interopRequireDefault(_map);

var _getPrototypeOf = _dereq_("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = _dereq_("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = _dereq_("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = _dereq_("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = _dereq_("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = _dereq_("events");
var registrar_connector_1 = _dereq_("./registrar.connector");
var twilsock_connector_1 = _dereq_("./twilsock.connector");
/**
 * Provides an interface to the ERS registrar
 */

var Registrar = function (_events_1$EventEmitte) {
    (0, _inherits3.default)(Registrar, _events_1$EventEmitte);

    /**
     * Creates the new instance of registrar client
     */
    function Registrar(productId, transport, twilsock, config) {
        (0, _classCallCheck3.default)(this, Registrar);

        var _this = (0, _possibleConstructorReturn3.default)(this, (Registrar.__proto__ || (0, _getPrototypeOf2.default)(Registrar)).call(this));

        _this.config = config;
        _this.connectors = new _map2.default();
        var platform = _this.detectPlatform();
        _this.connectors.set('gcm', new registrar_connector_1.RegistrarConnector('gcm', { protocolVersion: 3, productId: productId, platform: platform }, transport, config));
        _this.connectors.set('fcm', new registrar_connector_1.RegistrarConnector('fcm', { protocolVersion: 3, productId: productId, platform: platform }, transport, config));
        _this.connectors.set('apn', new registrar_connector_1.RegistrarConnector('apn', { protocolVersion: 4, productId: productId, platform: platform }, transport, config));
        _this.connectors.set('twilsock', new twilsock_connector_1.TwilsockConnector({ productId: productId, platform: platform }, twilsock, config));
        _this.connectors.get('twilsock').on('transportReady', function (state) {
            return _this.emit('transportReady', state);
        });
        return _this;
    }
    /**
     *  Sets notification ID.
     *  If new URI is different from previous, it triggers updating of registration for given channel
     *
     *  @param {string} channelType channel type (apn|gcm|fcm|twilsock)
     *  @param {string} notificationId The notification ID
     */


    (0, _createClass3.default)(Registrar, [{
        key: "setNotificationId",
        value: function setNotificationId(channelType, notificationId) {
            this.connector(channelType).setNotificationId(notificationId);
        }
        /**
         * Subscribe for given type of message
         *
         * @param {String} messageType Message type identifier
         * @param {String} channelType Channel type, can be 'twilsock', 'gcm' or 'fcm'
         * @public
         */

    }, {
        key: "subscribe",
        value: function subscribe(messageType, channelType) {
            return this.connector(channelType).subscribe(messageType);
        }
        /**
         * Remove subscription
         * @param {String} messageType Message type
         * @param {String} channelType Channel type (twilsock or gcm/fcm)
         */

    }, {
        key: "unsubscribe",
        value: function unsubscribe(messageType, channelType) {
            return this.connector(channelType).unsubscribe(messageType);
        }
    }, {
        key: "updateToken",
        value: function updateToken(token) {
            this.connectors.forEach(function (connector) {
                return connector.updateToken(token);
            });
        }
        /**
         * @param {String} type Channel type
         * @throws {Error} Error with description
         */

    }, {
        key: "connector",
        value: function connector(type) {
            var connector = this.connectors.get(type);
            if (!connector) {
                throw new Error("Unknown channel type: " + type);
            }
            return connector;
        }
        /**
         * Returns platform string limited to max 128 chars
         */

    }, {
        key: "detectPlatform",
        value: function detectPlatform() {
            var platform = '';
            if (typeof navigator !== 'undefined') {
                platform = 'unknown';
                if (typeof navigator.product !== 'undefined') {
                    platform = navigator.product;
                }
                if (typeof navigator.userAgent !== 'undefined') {
                    platform = navigator.userAgent;
                }
            } else {
                platform = 'web';
            }
            return platform.substring(0, 128);
        }
    }]);
    return Registrar;
}(events_1.EventEmitter);

exports.Registrar = Registrar;

},{"./registrar.connector":205,"./twilsock.connector":207,"babel-runtime/core-js/map":27,"babel-runtime/core-js/object/get-prototype-of":32,"babel-runtime/helpers/classCallCheck":40,"babel-runtime/helpers/createClass":41,"babel-runtime/helpers/inherits":43,"babel-runtime/helpers/possibleConstructorReturn":44,"events":187}],207:[function(_dereq_,module,exports){
"use strict";

var _from = _dereq_("babel-runtime/core-js/array/from");

var _from2 = _interopRequireDefault(_from);

var _regenerator = _dereq_("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = _dereq_("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _getPrototypeOf = _dereq_("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = _dereq_("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = _dereq_("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = _dereq_("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = _dereq_("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var uuid = _dereq_("uuid");
var connector_1 = _dereq_("./connector");
var DEFAULT_TTL = 60 * 60 * 48;
/**
 * Registrar connector implementation for twilsock
 */

var TwilsockConnector = function (_connector_1$Connecto) {
    (0, _inherits3.default)(TwilsockConnector, _connector_1$Connecto);

    function TwilsockConnector(context, twilsock, config) {
        (0, _classCallCheck3.default)(this, TwilsockConnector);

        var _this = (0, _possibleConstructorReturn3.default)(this, (TwilsockConnector.__proto__ || (0, _getPrototypeOf2.default)(TwilsockConnector)).call(this, config));

        _this.twilsock = twilsock;
        _this.context = context;
        context.id = uuid.v4();
        _this.twilsock.on('stateChanged', function (state) {
            if (state !== 'connected') {
                _this.emit('transportReady', false);
            }
        });
        _this.twilsock.on('registered', function (id) {
            if (context && id === context.id && twilsock.state === 'connected') {
                _this.emit('transportReady', true);
            }
        });
        return _this;
    }

    (0, _createClass3.default)(TwilsockConnector, [{
        key: "setNotificationId",
        value: function setNotificationId() {}
    }, {
        key: "updateToken",
        value: function updateToken(token) {
            // no need to do anything here, twilsock backend handles it on it's own
            // so just ignoring here
        }
    }, {
        key: "updateContextRequest",
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(messageTypes) {
                var context;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                context = {
                                    product_id: this.context.productId,
                                    notification_protocol_version: 4,
                                    endpoint_platform: this.context.platform,
                                    message_types: messageTypes
                                };

                                this.emit('transportReady', false);
                                _context.next = 4;
                                return this.twilsock.setNotificationsContext(this.context.id, context);

                            case 4:
                            case "end":
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function updateContextRequest(_x) {
                return _ref.apply(this, arguments);
            }

            return updateContextRequest;
        }()
    }, {
        key: "updateRegistration",
        value: function () {
            var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(registration, reasons) {
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                if (reasons.has('messageType')) {
                                    _context2.next = 2;
                                    break;
                                }

                                return _context2.abrupt("return");

                            case 2:
                                _context2.next = 4;
                                return this.updateContextRequest((0, _from2.default)(registration.messageTypes));

                            case 4:
                                return _context2.abrupt("return", registration);

                            case 5:
                            case "end":
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function updateRegistration(_x2, _x3) {
                return _ref2.apply(this, arguments);
            }

            return updateRegistration;
        }()
    }, {
        key: "removeRegistration",
        value: function removeRegistration() {
            return this.twilsock.removeNotificationsContext(this.context.id);
        }
    }]);
    return TwilsockConnector;
}(connector_1.Connector);

exports.TwilsockConnector = TwilsockConnector;

},{"./connector":202,"babel-runtime/core-js/array/from":23,"babel-runtime/core-js/object/get-prototype-of":32,"babel-runtime/helpers/asyncToGenerator":39,"babel-runtime/helpers/classCallCheck":40,"babel-runtime/helpers/createClass":41,"babel-runtime/helpers/inherits":43,"babel-runtime/helpers/possibleConstructorReturn":44,"babel-runtime/regenerator":48,"uuid":237}],208:[function(_dereq_,module,exports){
"use strict";

var _assign = _dereq_("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

var _getPrototypeOf = _dereq_("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = _dereq_("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = _dereq_("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _createClass2 = _dereq_("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _inherits2 = _dereq_("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = _dereq_("events");
var operation_retrier_1 = _dereq_("operation-retrier");
/**
 * Retrier with backoff override capability
*/

var BackoffRetrier = function (_events_1$EventEmitte) {
    (0, _inherits3.default)(BackoffRetrier, _events_1$EventEmitte);
    (0, _createClass3.default)(BackoffRetrier, [{
        key: "inProgress",
        get: function get() {
            return !!this.retrier;
        }
    }]);

    function BackoffRetrier(options) {
        (0, _classCallCheck3.default)(this, BackoffRetrier);

        var _this = (0, _possibleConstructorReturn3.default)(this, (BackoffRetrier.__proto__ || (0, _getPrototypeOf2.default)(BackoffRetrier)).call(this));

        _this.options = options ? (0, _assign2.default)({}, options) : {};
        return _this;
    }
    /**
     * Should be called once per attempt series to start retrier.
    */


    (0, _createClass3.default)(BackoffRetrier, [{
        key: "start",
        value: function start() {
            if (this.inProgress) {
                throw new Error('Already waiting for next attempt, call finishAttempt(success : boolean) to finish it');
            }
            this.createRetrier();
        }
        /**
         * Should be called to stop retrier entirely.
        */

    }, {
        key: "stop",
        value: function stop() {
            this.cleanRetrier();
            this.newBackoff = null;
            this.usedBackoff = null;
        }
        /**
         * Modifies backoff for next attempt.
         * Expected behavior:
         * - If there was no backoff passed previously reschedulling next attempt to given backoff
         * - If previous backoff was longer then ignoring this one.
         * - If previous backoff was shorter then reschedulling with this one.
         * With or without backoff retrier will keep growing normally.
         * @param delay delay of next attempts in ms.
         */

    }, {
        key: "modifyBackoff",
        value: function modifyBackoff(delay) {
            this.newBackoff = delay;
        }
        /**
         * Mark last emmited attempt as failed, initiating either next of fail if limits were hit.
        */

    }, {
        key: "attemptFailed",
        value: function attemptFailed() {
            if (!this.inProgress) {
                throw new Error('No attempt is in progress');
            }
            if (this.newBackoff) {
                var shouldUseNewBackoff = !this.usedBackoff || this.usedBackoff < this.newBackoff;
                if (shouldUseNewBackoff) {
                    this.createRetrier();
                } else {
                    this.retrier.failed(new Error());
                }
            } else {
                this.retrier.failed(new Error());
            }
        }
    }, {
        key: "cleanRetrier",
        value: function cleanRetrier() {
            if (this.retrier) {
                this.retrier.removeAllListeners();
                this.retrier.cancel();
                this.retrier = null;
            }
        }
    }, {
        key: "getRetryPolicy",
        value: function getRetryPolicy() {
            var clone = (0, _assign2.default)({}, this.options);
            if (this.newBackoff) {
                clone.min = this.newBackoff;
                clone.max = this.options.max && this.options.max > this.newBackoff ? this.options.max : this.newBackoff;
            }
            // As we're always skipping first attempt we should add one extra if limit is present
            clone.maxAttemptsCount = this.options.maxAttemptsCount ? this.options.maxAttemptsCount + 1 : undefined;
            return clone;
        }
    }, {
        key: "createRetrier",
        value: function createRetrier() {
            var _this2 = this;

            this.cleanRetrier();
            var retryPolicy = this.getRetryPolicy();
            this.retrier = new operation_retrier_1.default(retryPolicy);
            this.retrier.once('attempt', function () {
                _this2.retrier.on('attempt', function () {
                    return _this2.emit('attempt');
                });
                _this2.retrier.failed(new Error('Skipping first attempt'));
            });
            this.retrier.on('failed', function (err) {
                return _this2.emit('failed', err);
            });
            this.usedBackoff = this.newBackoff;
            this.newBackoff = null;
            this.retrier.start().catch(function (err) {});
        }
    }]);
    return BackoffRetrier;
}(events_1.EventEmitter);

exports.BackoffRetrier = BackoffRetrier;

},{"babel-runtime/core-js/object/assign":28,"babel-runtime/core-js/object/get-prototype-of":32,"babel-runtime/helpers/classCallCheck":40,"babel-runtime/helpers/createClass":41,"babel-runtime/helpers/inherits":43,"babel-runtime/helpers/possibleConstructorReturn":44,"events":187,"operation-retrier":192}],209:[function(_dereq_,module,exports){
"use strict";

var _regenerator = _dereq_("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = _dereq_("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _stringify = _dereq_("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

var _getPrototypeOf = _dereq_("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = _dereq_("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = _dereq_("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = _dereq_("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = _dereq_("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = _dereq_("events");
var logger_1 = _dereq_("./logger");
var configuration_1 = _dereq_("./configuration");
var twilsock_1 = _dereq_("./twilsock");
var packetinterface_1 = _dereq_("./packetinterface");
var websocketchannel_1 = _dereq_("./websocketchannel");
var registrations_1 = _dereq_("./services/registrations");
var upstream_1 = _dereq_("./services/upstream");
var deferred_1 = _dereq_("./deferred");
var index_1 = _dereq_("./index");
var offlinestorage_1 = _dereq_("./offlinestorage");
var tokenStorage_1 = _dereq_("./tokenStorage");
/**
 * @alias Twilsock
 * @classdesc Client library for the Twilsock service
 * It allows to recevie service-generated updates as well as bi-directional transport
 */

var TwilsockClient = function (_events_1$EventEmitte) {
    (0, _inherits3.default)(TwilsockClient, _events_1$EventEmitte);

    /**
     * @param {string} Token Twilio access token
     * @param {string} ProductId Product identifier. Should be the same as a grant name in token
     */
    function TwilsockClient(token, productId) {
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        (0, _classCallCheck3.default)(this, TwilsockClient);

        var _this = (0, _possibleConstructorReturn3.default)(this, (TwilsockClient.__proto__ || (0, _getPrototypeOf2.default)(TwilsockClient)).call(this));

        _this.offlineStorageDeferred = new deferred_1.Deferred();
        options.continuationToken = options.continuationToken ? options.continuationToken : tokenStorage_1.TokenStorage.getStoredToken(productId);
        var config = _this.config = new configuration_1.Configuration(token, productId, options);
        logger_1.log.setLevel(config.logLevel);
        var websocket = new websocketchannel_1.WebSocketChannel(config.url);
        var transport = options.transport ? options.transport : new packetinterface_1.PacketInterface(websocket, config);
        _this.channel = options.channel ? options.channel : new twilsock_1.TwilsockImpl(websocket, transport, config);
        _this.registrations = options.registrations ? options.registrations : new registrations_1.Registrations(transport);
        _this.upstream = new upstream_1.Upstream(transport, _this.channel, config);
        _this.registrations.on('registered', function (id) {
            return _this.emit('registered', id);
        });
        _this.channel.on('message', function (type, message) {
            return setTimeout(function () {
                return _this.emit('message', type, message);
            }, 0);
        });
        _this.channel.on('tokenAboutToExpire', function () {
            return setTimeout(function () {
                return _this.emit('tokenAboutToExpire');
            }, 0);
        });
        _this.channel.on('tokenExpired', function () {
            return setTimeout(function () {
                return _this.emit('tokenExpired');
            }, 0);
        });
        _this.channel.on('connected', function () {
            return _this.registrations.updateRegistrations();
        });
        _this.channel.on('connected', function () {
            return _this.upstream.sendPendingMessages();
        });
        _this.channel.on('connected', function () {
            return setTimeout(function () {
                return _this.emit('connected');
            }, 0);
        });
        _this.channel.on('disconnected', function () {
            return setTimeout(function () {
                return _this.emit('disconnected');
            }, 0);
        });
        _this.channel.on('disconnected', function () {
            return _this.upstream.rejectPendingMessages();
        });
        _this.channel.on('stateChanged', function (state) {
            return setTimeout(function () {
                return _this.emit('stateChanged', state);
            }, 0);
        });
        _this.channel.on('disconnected', function () {
            return _this.offlineStorageDeferred.fail(new index_1.TwilsockError('Client disconnected'));
        });
        _this.channel.on('initialized', function (initReply) {
            _this.handleStorageId(productId, initReply);
            tokenStorage_1.TokenStorage.storeToken(initReply.continuationToken, productId);
        });
        _this.offlineStorageDeferred.promise.catch(function () {});
        return _this;
    }

    (0, _createClass3.default)(TwilsockClient, [{
        key: "handleStorageId",
        value: function handleStorageId(productId, initReply) {
            if (!initReply.offlineStorage) {
                this.offlineStorageDeferred.fail(new index_1.TwilsockError('No offline storage id'));
            } else if (initReply.offlineStorage.hasOwnProperty(productId)) {
                try {
                    this.offlineStorageDeferred.set(offlinestorage_1.OfflineProductStorage.create(initReply.offlineStorage[productId]));
                    logger_1.log.debug("Offline storage for '" + productId + "' product: " + (0, _stringify2.default)(initReply.offlineStorage[productId]) + ".");
                } catch (e) {
                    this.offlineStorageDeferred.fail(new index_1.TwilsockError("Failed to parse offline storage for " + productId + " " + (0, _stringify2.default)(initReply.offlineStorage[productId]) + ". " + e + "."));
                }
            } else {
                this.offlineStorageDeferred.fail(new index_1.TwilsockError("No offline storage id for '" + productId + "' product: " + (0, _stringify2.default)(initReply.offlineStorage)));
            }
        }
    }, {
        key: "storageId",
        value: function storageId() {
            return this.offlineStorageDeferred.promise;
        }
        /**
         * Indicates if twilsock is connected now
         */

    }, {
        key: "updateToken",

        /**
         * Update token
         * @param {String} token
         */
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(token) {
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                logger_1.log.trace("updating token '" + token + "'");

                                if (!(this.config.token === token)) {
                                    _context.next = 3;
                                    break;
                                }

                                return _context.abrupt("return");

                            case 3:
                                this.config.updateToken(token);
                                return _context.abrupt("return", this.channel.updateToken(token));

                            case 5:
                            case "end":
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function updateToken(_x2) {
                return _ref.apply(this, arguments);
            }

            return updateToken;
        }()
        /**
         * Updates notification context.
         * This method shouldn't be used anyone except twilio notifications library
         * @param contextId id of notification context
         * @param context value of notification context
         * @private
         */

    }, {
        key: "setNotificationsContext",
        value: function setNotificationsContext(contextId, context) {
            this.registrations.setNotificationsContext(contextId, context);
        }
        /**
         * Remove notification context.
         * This method shouldn't be used anyone except twilio notifications library
         * @param contextId id of notification context
         * @private
         */

    }, {
        key: "removeNotificationsContext",
        value: function removeNotificationsContext(contextId) {
            this.registrations.removeNotificationsContext(contextId);
        }
        /**
         * Connect to the server
         * @fires TwilsockClient#connected
         * @public
         */

    }, {
        key: "connect",
        value: function connect() {
            return this.channel.connect();
        }
        /**
         * Disconnect from the server
         * @fires TwilsockClient#disconnected
         * @public
         */

    }, {
        key: "disconnect",
        value: function disconnect() {
            return this.channel.disconnect();
        }
        /**
         * Get HTTP request to upstream service
         * @param {string} url Upstream service url
         * @param {headers} headers Set of custom headers
         */

    }, {
        key: "get",
        value: function get(url, headers) {
            return this.upstream.send('GET', url, headers);
        }
        /**
         * Post HTTP request to upstream service
         * @param {string} url Upstream service url
         * @param {headers} headers Set of custom headers
         * @param {body} body Body to send
         */

    }, {
        key: "post",
        value: function post(url, headers, body) {
            return this.upstream.send('POST', url, headers, body);
        }
        /**
         * Put HTTP request to upstream service
         * @param {string} url Upstream service url
         * @param {headers} headers Set of custom headers
         * @param {body} body Body to send
         */

    }, {
        key: "put",
        value: function put(url, headers, body) {
            return this.upstream.send('PUT', url, headers, body);
        }
        /**
         * Delete HTTP request to upstream service
         * @param {string} url Upstream service url
         * @param {headers} headers Set of custom headers
         */

    }, {
        key: "delete",
        value: function _delete(url, headers) {
            return this.upstream.send('DELETE', url, headers);
        }
    }, {
        key: "isConnected",
        get: function get() {
            return this.channel.isConnected;
        }
    }, {
        key: "state",
        get: function get() {
            return this.channel.state;
        }
    }]);
    return TwilsockClient;
}(events_1.EventEmitter);

exports.TwilsockClient = TwilsockClient;
exports.Twilsock = TwilsockClient;

},{"./configuration":210,"./deferred":211,"./index":216,"./logger":217,"./offlinestorage":219,"./packetinterface":220,"./services/registrations":230,"./services/upstream":231,"./tokenStorage":232,"./twilsock":233,"./websocketchannel":234,"babel-runtime/core-js/json/stringify":26,"babel-runtime/core-js/object/get-prototype-of":32,"babel-runtime/helpers/asyncToGenerator":39,"babel-runtime/helpers/classCallCheck":40,"babel-runtime/helpers/createClass":41,"babel-runtime/helpers/inherits":43,"babel-runtime/helpers/possibleConstructorReturn":44,"babel-runtime/regenerator":48,"events":187}],210:[function(_dereq_,module,exports){
"use strict";

var _classCallCheck2 = _dereq_("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = _dereq_("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var packageVersion = '0.5.5';
/**
 * Settings container for the Twilsock client library
 */

var Configuration = function () {
    /**
     * @param {String} token - authentication token
     * @param {Object} options - options to override defaults
     */
    function Configuration(token, activeGrant) {
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        (0, _classCallCheck3.default)(this, Configuration);

        this.activeGrant = activeGrant;
        this._token = token;
        var region = options.region || 'us1';
        var defaultTwilsockUrl = "wss://tsock." + region + ".twilio.com/v3/wsconnect";
        var twilsockOptions = options.twilsock || options.Twilsock || {};
        this.url = twilsockOptions.uri || defaultTwilsockUrl;
        this._continuationToken = options.continuationToken ? options.continuationToken : null;
        this.logLevel = options.logLevel ? options.logLevel : 'error';
        this.retryPolicy = options.retryPolicy ? options.retryPolicy : {
            min: 1 * 1000,
            max: 2 * 60 * 1000,
            randomness: 0.2
        };
        this.clientMetadata = options.clientMetadata ? options.clientMetadata : {};
        this.clientMetadata.ver = packageVersion;
    }

    (0, _createClass3.default)(Configuration, [{
        key: "updateToken",
        value: function updateToken(token) {
            this._token = token;
        }
    }, {
        key: "updateContinuationToken",
        value: function updateContinuationToken(continuationToken) {
            this._continuationToken = continuationToken;
        }
    }, {
        key: "token",
        get: function get() {
            return this._token;
        }
    }, {
        key: "continuationToken",
        get: function get() {
            return this._continuationToken;
        }
    }]);
    return Configuration;
}();

exports.Configuration = Configuration;

},{"babel-runtime/helpers/classCallCheck":40,"babel-runtime/helpers/createClass":41}],211:[function(_dereq_,module,exports){
"use strict";

var _promise = _dereq_("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _classCallCheck2 = _dereq_("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = _dereq_("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });

var Deferred = function () {
    function Deferred() {
        var _this = this;

        (0, _classCallCheck3.default)(this, Deferred);

        this._promise = new _promise2.default(function (resolve, reject) {
            _this._resolve = resolve;
            _this._reject = reject;
        });
    }

    (0, _createClass3.default)(Deferred, [{
        key: "update",
        value: function update(value) {
            this._resolve(value);
        }
    }, {
        key: "set",
        value: function set(value) {
            this.current = value;
            this._resolve(value);
        }
    }, {
        key: "fail",
        value: function fail(e) {
            this._reject(e);
        }
    }, {
        key: "promise",
        get: function get() {
            return this._promise;
        }
    }]);
    return Deferred;
}();

exports.Deferred = Deferred;

},{"babel-runtime/core-js/promise":34,"babel-runtime/helpers/classCallCheck":40,"babel-runtime/helpers/createClass":41}],212:[function(_dereq_,module,exports){
"use strict";

var _getPrototypeOf = _dereq_("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = _dereq_("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = _dereq_("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = _dereq_("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var twilsockerror_1 = _dereq_("./twilsockerror");

var TransportUnavailableError = function (_twilsockerror_1$Twil) {
    (0, _inherits3.default)(TransportUnavailableError, _twilsockerror_1$Twil);

    function TransportUnavailableError(description) {
        (0, _classCallCheck3.default)(this, TransportUnavailableError);
        return (0, _possibleConstructorReturn3.default)(this, (TransportUnavailableError.__proto__ || (0, _getPrototypeOf2.default)(TransportUnavailableError)).call(this, description));
    }

    return TransportUnavailableError;
}(twilsockerror_1.TwilsockError);

exports.TransportUnavailableError = TransportUnavailableError;

},{"./twilsockerror":213,"babel-runtime/core-js/object/get-prototype-of":32,"babel-runtime/helpers/classCallCheck":40,"babel-runtime/helpers/inherits":43,"babel-runtime/helpers/possibleConstructorReturn":44}],213:[function(_dereq_,module,exports){
"use strict";

var _create = _dereq_("babel-runtime/core-js/object/create");

var _create2 = _interopRequireDefault(_create);

var _setPrototypeOf = _dereq_("babel-runtime/core-js/object/set-prototype-of");

var _setPrototypeOf2 = _interopRequireDefault(_setPrototypeOf);

var _from = _dereq_("babel-runtime/core-js/array/from");

var _from2 = _interopRequireDefault(_from);

var _construct = _dereq_("babel-runtime/core-js/reflect/construct");

var _construct2 = _interopRequireDefault(_construct);

var _getPrototypeOf = _dereq_("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = _dereq_("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = _dereq_("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = _dereq_("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _extendableBuiltin(cls) {
    function ExtendableBuiltin() {
        var instance = (0, _construct2.default)(cls, (0, _from2.default)(arguments));
        (0, _setPrototypeOf2.default)(instance, (0, _getPrototypeOf2.default)(this));
        return instance;
    }

    ExtendableBuiltin.prototype = (0, _create2.default)(cls.prototype, {
        constructor: {
            value: cls,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });

    if (_setPrototypeOf2.default) {
        (0, _setPrototypeOf2.default)(ExtendableBuiltin, cls);
    } else {
        ExtendableBuiltin.__proto__ = cls;
    }

    return ExtendableBuiltin;
}

Object.defineProperty(exports, "__esModule", { value: true });

var TwilsockError = function (_extendableBuiltin2) {
    (0, _inherits3.default)(TwilsockError, _extendableBuiltin2);

    function TwilsockError(description) {
        (0, _classCallCheck3.default)(this, TwilsockError);
        return (0, _possibleConstructorReturn3.default)(this, (TwilsockError.__proto__ || (0, _getPrototypeOf2.default)(TwilsockError)).call(this, description));
    }

    return TwilsockError;
}(_extendableBuiltin(Error));

exports.TwilsockError = TwilsockError;

},{"babel-runtime/core-js/array/from":23,"babel-runtime/core-js/object/create":29,"babel-runtime/core-js/object/get-prototype-of":32,"babel-runtime/core-js/object/set-prototype-of":33,"babel-runtime/core-js/reflect/construct":35,"babel-runtime/helpers/classCallCheck":40,"babel-runtime/helpers/inherits":43,"babel-runtime/helpers/possibleConstructorReturn":44}],214:[function(_dereq_,module,exports){
"use strict";

var _getPrototypeOf = _dereq_("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = _dereq_("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = _dereq_("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = _dereq_("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var twilsockerror_1 = _dereq_("./twilsockerror");

var TwilsockReplyError = function (_twilsockerror_1$Twil) {
    (0, _inherits3.default)(TwilsockReplyError, _twilsockerror_1$Twil);

    function TwilsockReplyError(description, reply) {
        (0, _classCallCheck3.default)(this, TwilsockReplyError);

        var _this = (0, _possibleConstructorReturn3.default)(this, (TwilsockReplyError.__proto__ || (0, _getPrototypeOf2.default)(TwilsockReplyError)).call(this, description));

        _this.reply = reply;
        return _this;
    }

    return TwilsockReplyError;
}(twilsockerror_1.TwilsockError);

exports.TwilsockReplyError = TwilsockReplyError;

},{"./twilsockerror":213,"babel-runtime/core-js/object/get-prototype-of":32,"babel-runtime/helpers/classCallCheck":40,"babel-runtime/helpers/inherits":43,"babel-runtime/helpers/possibleConstructorReturn":44}],215:[function(_dereq_,module,exports){
"use strict";

var _getPrototypeOf = _dereq_("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = _dereq_("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = _dereq_("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = _dereq_("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var twilsockerror_1 = _dereq_("./twilsockerror");

var TwilsockUpstreamError = function (_twilsockerror_1$Twil) {
    (0, _inherits3.default)(TwilsockUpstreamError, _twilsockerror_1$Twil);

    function TwilsockUpstreamError(status, description, body) {
        (0, _classCallCheck3.default)(this, TwilsockUpstreamError);

        var _this = (0, _possibleConstructorReturn3.default)(this, (TwilsockUpstreamError.__proto__ || (0, _getPrototypeOf2.default)(TwilsockUpstreamError)).call(this, description));

        _this.status = status;
        _this.description = description;
        _this.body = body;
        return _this;
    }

    return TwilsockUpstreamError;
}(twilsockerror_1.TwilsockError);

exports.TwilsockUpstreamError = TwilsockUpstreamError;

},{"./twilsockerror":213,"babel-runtime/core-js/object/get-prototype-of":32,"babel-runtime/helpers/classCallCheck":40,"babel-runtime/helpers/inherits":43,"babel-runtime/helpers/possibleConstructorReturn":44}],216:[function(_dereq_,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = _dereq_("./client");
exports.TwilsockClient = client_1.TwilsockClient;
exports.Twilsock = client_1.TwilsockClient;
var twilsockerror_1 = _dereq_("./error/twilsockerror");
exports.TwilsockError = twilsockerror_1.TwilsockError;
var transportunavailableerror_1 = _dereq_("./error/transportunavailableerror");
exports.TransportUnavailableError = transportunavailableerror_1.TransportUnavailableError;

},{"./client":209,"./error/transportunavailableerror":212,"./error/twilsockerror":213}],217:[function(_dereq_,module,exports){
"use strict";

var _classCallCheck2 = _dereq_("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = _dereq_("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _from = _dereq_("babel-runtime/core-js/array/from");

var _from2 = _interopRequireDefault(_from);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var log = _dereq_("loglevel");
function prepareLine(prefix, args) {
    return [new Date().toISOString() + " Twilsock " + prefix + ":"].concat((0, _from2.default)(args));
}

var Logger = function () {
    function Logger(prefix) {
        (0, _classCallCheck3.default)(this, Logger);

        this.prefix = '';
        this.prefix = prefix !== null && prefix !== undefined && prefix.length > 0 ? ' ' + prefix + ':' : '';
    }

    (0, _createClass3.default)(Logger, [{
        key: "setLevel",
        value: function setLevel(level) {
            log.setLevel(level);
        }
    }, {
        key: "trace",
        value: function trace() {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            log.debug.apply(null, prepareLine('T', args));
        }
    }, {
        key: "debug",
        value: function debug() {
            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                args[_key2] = arguments[_key2];
            }

            log.debug.apply(null, prepareLine('D', args));
        }
    }, {
        key: "info",
        value: function info() {
            for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                args[_key3] = arguments[_key3];
            }

            log.info.apply(null, prepareLine('I', args));
        }
    }, {
        key: "warn",
        value: function warn() {
            for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
                args[_key4] = arguments[_key4];
            }

            log.warn.apply(null, prepareLine('W', args));
        }
    }, {
        key: "error",
        value: function error() {
            for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
                args[_key5] = arguments[_key5];
            }

            log.error.apply(null, prepareLine('E', args));
        }
    }], [{
        key: "setLevel",
        value: function setLevel(level) {
            log.setLevel(level);
        }
    }, {
        key: "trace",
        value: function trace() {
            for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
                args[_key6] = arguments[_key6];
            }

            log.trace.apply(null, prepareLine('T', args));
        }
    }, {
        key: "debug",
        value: function debug() {
            for (var _len7 = arguments.length, args = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
                args[_key7] = arguments[_key7];
            }

            log.debug.apply(null, prepareLine('D', args));
        }
    }, {
        key: "info",
        value: function info() {
            for (var _len8 = arguments.length, args = Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
                args[_key8] = arguments[_key8];
            }

            log.info.apply(null, prepareLine('I', args));
        }
    }, {
        key: "warn",
        value: function warn() {
            for (var _len9 = arguments.length, args = Array(_len9), _key9 = 0; _key9 < _len9; _key9++) {
                args[_key9] = arguments[_key9];
            }

            log.warn.apply(null, prepareLine('W', args));
        }
    }, {
        key: "error",
        value: function error() {
            for (var _len10 = arguments.length, args = Array(_len10), _key10 = 0; _key10 < _len10; _key10++) {
                args[_key10] = arguments[_key10];
            }

            log.error.apply(null, prepareLine('E', args));
        }
    }]);
    return Logger;
}();

exports.Logger = Logger;
var logInstance = new Logger('');
exports.log = logInstance;

},{"babel-runtime/core-js/array/from":23,"babel-runtime/helpers/classCallCheck":40,"babel-runtime/helpers/createClass":41,"loglevel":191}],218:[function(_dereq_,module,exports){
"use strict";

var _classCallCheck2 = _dereq_("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = _dereq_("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var platform = _dereq_("platform");

var Metadata = function () {
    function Metadata() {
        (0, _classCallCheck3.default)(this, Metadata);
    }

    (0, _createClass3.default)(Metadata, null, [{
        key: "getMetadata",
        value: function getMetadata(options) {
            var platformInfo = typeof navigator !== 'undefined' ? platform.parse(navigator.userAgent) : platform;
            var overrides = options && options.clientMetadata ? options.clientMetadata : {};
            var fieldNames = ['ver', 'env', 'envv', 'os', 'osv', 'osa', 'type', 'sdk', 'sdkv', 'dev', 'devv', 'devt', 'app', 'appv'];
            var defaults = {
                'env': platform.name,
                'envv': platform.version,
                'os': platform.os.family,
                'osv': platform.os.version,
                'osa': platform.os.architecture,
                'sdk': 'js-default'
            };
            var finalClientMetadata = {};
            fieldNames.filter(function (key) {
                return key in overrides || key in defaults;
            }).forEach(function (key) {
                return finalClientMetadata[key] = key in overrides ? overrides[key] : defaults[key];
            });
            return finalClientMetadata;
        }
    }]);
    return Metadata;
}();

exports.Metadata = Metadata;

},{"babel-runtime/helpers/classCallCheck":40,"babel-runtime/helpers/createClass":41,"platform":193}],219:[function(_dereq_,module,exports){
"use strict";

var _classCallCheck2 = _dereq_("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = _dereq_("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = _dereq_("./index");

var OfflineProductStorage = function () {
    function OfflineProductStorage(id) {
        (0, _classCallCheck3.default)(this, OfflineProductStorage);

        this.id = id;
    }

    (0, _createClass3.default)(OfflineProductStorage, null, [{
        key: "create",
        value: function create(productPayload) {
            if (productPayload instanceof Object && 'storage_id' in productPayload) {
                return new OfflineProductStorage(productPayload.storage_id);
            } else {
                throw new index_1.TwilsockError('Field "storage_id" is missing');
            }
        }
    }]);
    return OfflineProductStorage;
}();

exports.OfflineProductStorage = OfflineProductStorage;

},{"./index":216,"babel-runtime/helpers/classCallCheck":40,"babel-runtime/helpers/createClass":41}],220:[function(_dereq_,module,exports){
"use strict";

var _promise = _dereq_("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _regenerator = _dereq_("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = _dereq_("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _map = _dereq_("babel-runtime/core-js/map");

var _map2 = _interopRequireDefault(_map);

var _createClass2 = _dereq_("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _classCallCheck2 = _dereq_("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _stringify = _dereq_("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

var _typeof2 = _dereq_("babel-runtime/helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var logger_1 = _dereq_("./logger");
var uuid_1 = _dereq_("uuid");
var twilsockerror_1 = _dereq_("./error/twilsockerror");
var twilsockreplyerror_1 = _dereq_("./error/twilsockreplyerror");
var parser_1 = _dereq_("./parser");
var Messages = _dereq_("./protocol/messages");
var metadata_1 = _dereq_("./metadata");
var REQUEST_TIMEOUT = 30000;
function isHttpSuccess(code) {
    return code >= 200 && code < 300;
}
/**
 * Makes sure that body is properly stringified
 */
function preparePayload(payload) {
    switch (typeof payload === "undefined" ? "undefined" : (0, _typeof3.default)(payload)) {
        case 'undefined':
            return '';
        case 'object':
            return (0, _stringify2.default)(payload);
        default:
            return payload;
    }
}

var PacketRequest = function PacketRequest() {
    (0, _classCallCheck3.default)(this, PacketRequest);
};

var PacketResponse = function PacketResponse() {
    (0, _classCallCheck3.default)(this, PacketResponse);
};

exports.PacketResponse = PacketResponse;

var PacketInterface = function () {
    function PacketInterface(channel, config) {
        var _this = this;

        (0, _classCallCheck3.default)(this, PacketInterface);

        this.config = config;
        this.activeRequests = new _map2.default();
        this.channel = channel;
        this.channel.on('reply', function (reply) {
            return _this.processReply(reply);
        });
        this.channel.on('disconnected', function () {
            _this.activeRequests.forEach(function (descriptor) {
                clearTimeout(descriptor.timeout);
                descriptor.reject(new twilsockerror_1.TwilsockError('disconnected'));
            });
            _this.activeRequests.clear();
        });
    }

    (0, _createClass3.default)(PacketInterface, [{
        key: "processReply",
        value: function processReply(reply) {
            var request = this.activeRequests.get(reply.id);
            if (request) {
                clearTimeout(request.timeout);
                this.activeRequests.delete(reply.id);
                if (!isHttpSuccess(reply.status.code)) {
                    request.reject(new twilsockreplyerror_1.TwilsockReplyError('Transport failure: ' + reply.status.status, reply));
                    logger_1.log.trace('message rejected');
                } else {
                    request.resolve(reply);
                }
            }
        }
    }, {
        key: "storeRequest",
        value: function storeRequest(id, resolve, reject) {
            var requestDescriptor = {
                resolve: resolve,
                reject: reject,
                timeout: setTimeout(function () {
                    logger_1.log.trace('request', id, 'is timed out');
                    reject(new twilsockerror_1.TwilsockError('Twilsock: request timeout: ' + id));
                }, REQUEST_TIMEOUT)
            };
            this.activeRequests.set(id, requestDescriptor);
        }
    }, {
        key: "shutdown",
        value: function shutdown() {
            this.activeRequests.forEach(function (descriptor) {
                clearTimeout(descriptor.timeout);
                descriptor.reject(new twilsockerror_1.TwilsockError('Twilsock: request cancelled by user'));
            });
            this.activeRequests.clear();
        }
    }, {
        key: "sendInit",
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
                var metadata, message, response;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                logger_1.log.trace('sendInit');
                                metadata = metadata_1.Metadata.getMetadata(this.config);
                                message = new Messages.Init(this.config.token, this.config.continuationToken, metadata);
                                _context.next = 5;
                                return this.sendWithReply(message);

                            case 5:
                                response = _context.sent;
                                return _context.abrupt("return", new Messages.InitReply(response.id, response.header.continuation_token, response.header.continuation_token_status, response.header.offline_storage));

                            case 7:
                            case "end":
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function sendInit() {
                return _ref.apply(this, arguments);
            }

            return sendInit;
        }()
    }, {
        key: "sendClose",
        value: function sendClose() {
            var message = new Messages.Close();
            this.send(message);
        }
    }, {
        key: "sendWithReply",
        value: function sendWithReply(header, payload) {
            var _this2 = this;

            return new _promise2.default(function (resolve, reject) {
                var id = _this2.send(header, payload);
                _this2.storeRequest(id, resolve, reject);
            });
        }
    }, {
        key: "send",
        value: function send(header, payload) {
            header.id = header.id || "TM" + uuid_1.v4();
            var message = parser_1.Parser.createPacket(header, preparePayload(payload));
            try {
                this.channel.send(message);
                return header.id;
            } catch (e) {
                logger_1.log.debug('failed to send ', header, e);
                logger_1.log.trace(e.stack);
                throw e;
            }
        }
    }, {
        key: "isConnected",
        get: function get() {
            return this.channel.isConnected;
        }
    }]);
    return PacketInterface;
}();

exports.PacketInterface = PacketInterface;

},{"./error/twilsockerror":213,"./error/twilsockreplyerror":214,"./logger":217,"./metadata":218,"./parser":221,"./protocol/messages":224,"babel-runtime/core-js/json/stringify":26,"babel-runtime/core-js/map":27,"babel-runtime/core-js/promise":34,"babel-runtime/helpers/asyncToGenerator":39,"babel-runtime/helpers/classCallCheck":40,"babel-runtime/helpers/createClass":41,"babel-runtime/helpers/typeof":47,"babel-runtime/regenerator":48,"uuid":237}],221:[function(_dereq_,module,exports){
"use strict";

var _stringify = _dereq_("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

var _classCallCheck2 = _dereq_("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = _dereq_("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var logger_1 = _dereq_("./logger");
function byteLength(s) {
    var escstr = encodeURIComponent(s);
    var binstr = escstr.replace(/%([0-9A-F]{2})/g, function (match, p1) {
        return String.fromCharCode('0x' + p1);
    });
    return binstr.length;
}
function stringToUint8Array(s) {
    var escstr = encodeURIComponent(s);
    var binstr = escstr.replace(/%([0-9A-F]{2})/g, function (match, p1) {
        return String.fromCharCode('0x' + p1);
    });
    var ua = new Uint8Array(binstr.length);
    Array.prototype.forEach.call(binstr, function (ch, i) {
        ua[i] = ch.charCodeAt(0);
    });
    return ua;
}
function uint8ArrayToString(ua) {
    var binstr = Array.prototype.map.call(ua, function (ch) {
        return String.fromCharCode(ch);
    }).join('');
    var escstr = binstr.replace(/(.)/g, function (m, p) {
        var code = p.charCodeAt(0).toString(16).toUpperCase();
        if (code.length < 2) {
            code = '0' + code;
        }
        return '%' + code;
    });
    return decodeURIComponent(escstr);
}
function getJsonObject(array) {
    return JSON.parse(uint8ArrayToString(array));
}
function getMagic(buffer) {
    var strMagic = '';
    var idx = 0;
    for (; idx < buffer.length; ++idx) {
        var chr = String.fromCharCode(buffer[idx]);
        strMagic += chr;
        if (chr === '\r') {
            idx += 2;
            break;
        }
    }
    var magics = strMagic.split(' ');
    return {
        size: idx,
        protocol: magics[0],
        version: magics[1],
        headerSize: Number(magics[2])
    };
}

var Parser = function () {
    function Parser() {
        (0, _classCallCheck3.default)(this, Parser);
    }

    (0, _createClass3.default)(Parser, null, [{
        key: "parse",
        value: function parse(message) {
            var fieldMargin = 2;
            var dataView = new Uint8Array(message);
            var magic = getMagic(dataView);
            if (magic.protocol !== 'TWILSOCK' || magic.version !== 'V3.0') {
                logger_1.log.error("unsupported protocol: " + magic.protocol + " ver " + magic.version);
                //throw new Error('Unsupported protocol');
                //this.fsm.unsupportedProtocol();
                return;
            }
            var header = null;
            try {
                header = getJsonObject(dataView.subarray(magic.size, magic.size + magic.headerSize));
            } catch (e) {
                logger_1.log.error('failed to parse message header', e, message);
                //throw new Error('Failed to parse message');
                //this.fsm.protocolError();
                return;
            }
            logger_1.log.debug('message received: ', header.method);
            logger_1.log.trace('message received: ', header);
            var payload = null;
            if (header.payload_size > 0) {
                var payloadOffset = fieldMargin + magic.size + magic.headerSize;
                var payloadSize = header.payload_size;
                if (!header.hasOwnProperty('payload_type') || header.payload_type.indexOf('application/json') === 0) {
                    try {
                        payload = getJsonObject(dataView.subarray(payloadOffset, payloadOffset + payloadSize));
                    } catch (e) {
                        logger_1.log.error('failed to parse message body', e, message);
                        //this.fsm.protocolError();
                        return;
                    }
                } else if (header.payload_type.indexOf('text/plain') === 0) {
                    payload = uint8ArrayToString(dataView.subarray(payloadOffset, payloadOffset + payloadSize));
                }
            }
            return { method: header.method, header: header, payload: payload };
        }
    }, {
        key: "createPacket",
        value: function createPacket(header) {
            var payloadString = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

            header.payload_size = byteLength(payloadString); // eslint-disable-line camelcase
            var headerString = (0, _stringify2.default)(header) + '\r\n';
            var magicString = 'TWILSOCK V3.0 ' + (byteLength(headerString) - 2) + '\r\n';
            logger_1.log.debug('send request:', magicString + headerString + payloadString);
            var message = stringToUint8Array(magicString + headerString + payloadString);
            return message.buffer;
        }
    }]);
    return Parser;
}();

exports.Parser = Parser;

},{"./logger":217,"babel-runtime/core-js/json/stringify":26,"babel-runtime/helpers/classCallCheck":40,"babel-runtime/helpers/createClass":41}],222:[function(_dereq_,module,exports){
"use strict";

var _classCallCheck2 = _dereq_("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var uuid_1 = _dereq_("uuid");

var AbstractMessage = function AbstractMessage(id) {
    (0, _classCallCheck3.default)(this, AbstractMessage);

    this.id = id || "TM" + uuid_1.v4();
};

exports.AbstractMessage = AbstractMessage;

},{"babel-runtime/helpers/classCallCheck":40,"uuid":237}],223:[function(_dereq_,module,exports){
"use strict";

var _getPrototypeOf = _dereq_("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = _dereq_("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = _dereq_("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = _dereq_("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var abstractmessage_1 = _dereq_("./abstractmessage");

var Close = function (_abstractmessage_1$Ab) {
    (0, _inherits3.default)(Close, _abstractmessage_1$Ab);

    function Close() {
        (0, _classCallCheck3.default)(this, Close);

        var _this = (0, _possibleConstructorReturn3.default)(this, (Close.__proto__ || (0, _getPrototypeOf2.default)(Close)).call(this));

        _this.method = 'close';
        return _this;
    }

    return Close;
}(abstractmessage_1.AbstractMessage);

exports.Close = Close;

},{"./abstractmessage":222,"babel-runtime/core-js/object/get-prototype-of":32,"babel-runtime/helpers/classCallCheck":40,"babel-runtime/helpers/inherits":43,"babel-runtime/helpers/possibleConstructorReturn":44}],224:[function(_dereq_,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var init_1 = _dereq_("./init");
exports.Init = init_1.Init;
var initReply_1 = _dereq_("./initReply");
exports.InitReply = initReply_1.InitReply;
var update_1 = _dereq_("./update");
exports.Update = update_1.Update;
var message_1 = _dereq_("./message");
exports.Message = message_1.Message;
var reply_1 = _dereq_("./reply");
exports.Reply = reply_1.Reply;
var close_1 = _dereq_("./close");
exports.Close = close_1.Close;

},{"./close":223,"./init":225,"./initReply":226,"./message":227,"./reply":228,"./update":229}],225:[function(_dereq_,module,exports){
"use strict";

var _getPrototypeOf = _dereq_("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = _dereq_("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = _dereq_("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = _dereq_("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var abstractmessage_1 = _dereq_("./abstractmessage");

var Init = function (_abstractmessage_1$Ab) {
    (0, _inherits3.default)(Init, _abstractmessage_1$Ab);

    function Init(token, continuationToken, metadata) {
        (0, _classCallCheck3.default)(this, Init);

        var _this = (0, _possibleConstructorReturn3.default)(this, (Init.__proto__ || (0, _getPrototypeOf2.default)(Init)).call(this));

        _this.method = 'init';
        _this.token = token;
        _this.continuation_token = continuationToken;
        _this.metadata = metadata;
        _this.capabilities = ['client_update', 'offline_storage'];
        return _this;
    }

    return Init;
}(abstractmessage_1.AbstractMessage);

exports.Init = Init;

},{"./abstractmessage":222,"babel-runtime/core-js/object/get-prototype-of":32,"babel-runtime/helpers/classCallCheck":40,"babel-runtime/helpers/inherits":43,"babel-runtime/helpers/possibleConstructorReturn":44}],226:[function(_dereq_,module,exports){
"use strict";

var _getPrototypeOf = _dereq_("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _possibleConstructorReturn2 = _dereq_("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = _dereq_("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

var _classCallCheck2 = _dereq_("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var abstractmessage_1 = _dereq_("./abstractmessage");

var ContinuationTokenStatus = function ContinuationTokenStatus() {
    (0, _classCallCheck3.default)(this, ContinuationTokenStatus);
};

exports.ContinuationTokenStatus = ContinuationTokenStatus;

var InitReply = function (_abstractmessage_1$Ab) {
    (0, _inherits3.default)(InitReply, _abstractmessage_1$Ab);

    function InitReply(id, continuationToken, continuationTokenStatus, offlineStorage) {
        (0, _classCallCheck3.default)(this, InitReply);

        var _this = (0, _possibleConstructorReturn3.default)(this, (InitReply.__proto__ || (0, _getPrototypeOf2.default)(InitReply)).call(this, id));

        _this.continuationToken = continuationToken;
        _this.continuationTokenStatus = continuationTokenStatus;
        _this.offlineStorage = offlineStorage;
        return _this;
    }

    return InitReply;
}(abstractmessage_1.AbstractMessage);

exports.InitReply = InitReply;

},{"./abstractmessage":222,"babel-runtime/core-js/object/get-prototype-of":32,"babel-runtime/helpers/classCallCheck":40,"babel-runtime/helpers/inherits":43,"babel-runtime/helpers/possibleConstructorReturn":44}],227:[function(_dereq_,module,exports){
"use strict";

var _getPrototypeOf = _dereq_("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = _dereq_("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = _dereq_("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = _dereq_("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var abstractmessage_1 = _dereq_("./abstractmessage");

var Message = function (_abstractmessage_1$Ab) {
    (0, _inherits3.default)(Message, _abstractmessage_1$Ab);

    function Message(grant, contentType, request) {
        (0, _classCallCheck3.default)(this, Message);

        var _this = (0, _possibleConstructorReturn3.default)(this, (Message.__proto__ || (0, _getPrototypeOf2.default)(Message)).call(this));

        _this.method = 'message';
        _this.active_grant = grant;
        _this.payload_type = contentType;
        _this.http_request = request;
        return _this;
    }

    return Message;
}(abstractmessage_1.AbstractMessage);

exports.Message = Message;

},{"./abstractmessage":222,"babel-runtime/core-js/object/get-prototype-of":32,"babel-runtime/helpers/classCallCheck":40,"babel-runtime/helpers/inherits":43,"babel-runtime/helpers/possibleConstructorReturn":44}],228:[function(_dereq_,module,exports){
"use strict";

var _getPrototypeOf = _dereq_("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = _dereq_("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = _dereq_("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = _dereq_("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var abstractmessage_1 = _dereq_("./abstractmessage");

var Reply = function (_abstractmessage_1$Ab) {
    (0, _inherits3.default)(Reply, _abstractmessage_1$Ab);

    function Reply(id) {
        (0, _classCallCheck3.default)(this, Reply);

        var _this = (0, _possibleConstructorReturn3.default)(this, (Reply.__proto__ || (0, _getPrototypeOf2.default)(Reply)).call(this, id));

        _this.method = 'reply';
        _this.payload_type = 'application/json';
        _this.status = { code: 200, status: 'OK' };
        return _this;
    }

    return Reply;
}(abstractmessage_1.AbstractMessage);

exports.Reply = Reply;

},{"./abstractmessage":222,"babel-runtime/core-js/object/get-prototype-of":32,"babel-runtime/helpers/classCallCheck":40,"babel-runtime/helpers/inherits":43,"babel-runtime/helpers/possibleConstructorReturn":44}],229:[function(_dereq_,module,exports){
"use strict";

var _getPrototypeOf = _dereq_("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = _dereq_("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = _dereq_("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = _dereq_("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var abstractmessage_1 = _dereq_("./abstractmessage");

var Update = function (_abstractmessage_1$Ab) {
    (0, _inherits3.default)(Update, _abstractmessage_1$Ab);

    function Update(token) {
        (0, _classCallCheck3.default)(this, Update);

        var _this = (0, _possibleConstructorReturn3.default)(this, (Update.__proto__ || (0, _getPrototypeOf2.default)(Update)).call(this));

        _this.method = 'update';
        _this.token = token;
        return _this;
    }

    return Update;
}(abstractmessage_1.AbstractMessage);

exports.Update = Update;

},{"./abstractmessage":222,"babel-runtime/core-js/object/get-prototype-of":32,"babel-runtime/helpers/classCallCheck":40,"babel-runtime/helpers/inherits":43,"babel-runtime/helpers/possibleConstructorReturn":44}],230:[function(_dereq_,module,exports){
"use strict";

var _set = _dereq_("babel-runtime/core-js/set");

var _set2 = _interopRequireDefault(_set);

var _regenerator = _dereq_("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = _dereq_("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _map = _dereq_("babel-runtime/core-js/map");

var _map2 = _interopRequireDefault(_map);

var _getPrototypeOf = _dereq_("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = _dereq_("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = _dereq_("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = _dereq_("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = _dereq_("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var logger_1 = _dereq_("../logger");
var events_1 = _dereq_("events");
var uuid_1 = _dereq_("uuid");
var twilsockerror_1 = _dereq_("../error/twilsockerror");
/**
 * Registrations module handles all operations with registration contexts through twilsock
 * Main role: it automatically refreshes all registrations after reconnect.
 */

var Registrations = function (_events_1$EventEmitte) {
    (0, _inherits3.default)(Registrations, _events_1$EventEmitte);

    function Registrations(transport) {
        (0, _classCallCheck3.default)(this, Registrations);

        var _this = (0, _possibleConstructorReturn3.default)(this, (Registrations.__proto__ || (0, _getPrototypeOf2.default)(Registrations)).call(this));

        _this.transport = transport;
        _this.registrations = new _map2.default();
        _this.registrationsInProgress = new _map2.default();
        return _this;
    }

    (0, _createClass3.default)(Registrations, [{
        key: "putNotificationContext",
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(contextId, context) {
                var header, reply;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                header = { method: 'put_notification_ctx', notification_ctx_id: contextId };
                                _context.next = 3;
                                return this.transport.sendWithReply(header, context);

                            case 3:
                                reply = _context.sent;

                            case 4:
                            case "end":
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function putNotificationContext(_x, _x2) {
                return _ref.apply(this, arguments);
            }

            return putNotificationContext;
        }()
    }, {
        key: "deleteNotificationContext",
        value: function () {
            var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(contextId) {
                var message, reply;
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                message = { method: 'delete_notification_ctx',
                                    notification_ctx_id: contextId };
                                _context2.next = 3;
                                return this.transport.sendWithReply(message);

                            case 3:
                                reply = _context2.sent;

                            case 4:
                            case "end":
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function deleteNotificationContext(_x3) {
                return _ref2.apply(this, arguments);
            }

            return deleteNotificationContext;
        }()
    }, {
        key: "updateRegistration",
        value: function () {
            var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(contextId, context) {
                var registrationAttempts, attemptId;
                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                logger_1.log.debug('update registration for context', contextId);
                                registrationAttempts = this.registrationsInProgress.get(contextId);

                                if (!registrationAttempts) {
                                    registrationAttempts = new _set2.default();
                                    this.registrationsInProgress.set(contextId, registrationAttempts);
                                }
                                attemptId = uuid_1.v4();

                                registrationAttempts.add(attemptId);
                                _context3.prev = 5;
                                _context3.next = 8;
                                return this.putNotificationContext(contextId, context);

                            case 8:
                                logger_1.log.debug('registration attempt succeeded for context', context);
                                registrationAttempts.delete(attemptId);
                                if (registrationAttempts.size === 0) {
                                    this.registrationsInProgress.delete(contextId);
                                    this.emit('registered', contextId);
                                }
                                _context3.next = 19;
                                break;

                            case 13:
                                _context3.prev = 13;
                                _context3.t0 = _context3["catch"](5);

                                logger_1.log.warn('registration attempt failed for context', context);
                                logger_1.log.debug(_context3.t0);
                                registrationAttempts.delete(attemptId);
                                if (registrationAttempts.size === 0) {
                                    this.registrationsInProgress.delete(contextId);
                                    this.emit('registrationFailed', contextId, _context3.t0);
                                }

                            case 19:
                            case "end":
                                return _context3.stop();
                        }
                    }
                }, _callee3, this, [[5, 13]]);
            }));

            function updateRegistration(_x4, _x5) {
                return _ref3.apply(this, arguments);
            }

            return updateRegistration;
        }()
    }, {
        key: "updateRegistrations",
        value: function updateRegistrations() {
            var _this2 = this;

            logger_1.log.trace("refreshing " + this.registrations.size + " registrations");
            this.registrations.forEach(function (context, id) {
                _this2.updateRegistration(id, context);
            });
        }
    }, {
        key: "setNotificationsContext",
        value: function setNotificationsContext(contextId, context) {
            if (!contextId || !context) {
                throw new twilsockerror_1.TwilsockError('Invalid arguments provided');
            }
            this.registrations.set(contextId, context);
            if (this.transport.isConnected) {
                this.updateRegistration(contextId, context);
            }
        }
    }, {
        key: "removeNotificationsContext",
        value: function () {
            var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(contextId) {
                return _regenerator2.default.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                if (this.registrations.has(contextId)) {
                                    _context4.next = 2;
                                    break;
                                }

                                return _context4.abrupt("return");

                            case 2:
                                _context4.next = 4;
                                return this.deleteNotificationContext(contextId);

                            case 4:
                                if (this.transport.isConnected) {
                                    this.registrations.delete(contextId);
                                }

                            case 5:
                            case "end":
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            function removeNotificationsContext(_x6) {
                return _ref4.apply(this, arguments);
            }

            return removeNotificationsContext;
        }()
    }]);
    return Registrations;
}(events_1.EventEmitter);

exports.Registrations = Registrations;

},{"../error/twilsockerror":213,"../logger":217,"babel-runtime/core-js/map":27,"babel-runtime/core-js/object/get-prototype-of":32,"babel-runtime/core-js/set":36,"babel-runtime/helpers/asyncToGenerator":39,"babel-runtime/helpers/classCallCheck":40,"babel-runtime/helpers/createClass":41,"babel-runtime/helpers/inherits":43,"babel-runtime/helpers/possibleConstructorReturn":44,"babel-runtime/regenerator":48,"events":187,"uuid":237}],231:[function(_dereq_,module,exports){
"use strict";

var _regenerator = _dereq_("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = _dereq_("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _promise = _dereq_("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _createClass2 = _dereq_("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _classCallCheck2 = _dereq_("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var logger_1 = _dereq_("../logger");
var twilsockerror_1 = _dereq_("../error/twilsockerror");
var twilsockupstreamerror_1 = _dereq_("../error/twilsockupstreamerror");
var Messages = _dereq_("../protocol/messages");
var index_1 = _dereq_("../index");
var REQUEST_TIMEOUT = 20000;
function isHttpSuccess(code) {
    return code >= 200 && code < 300;
}
function isHttpReply(packet) {
    return packet && packet.header && packet.header.http_status;
}

var Request = function Request() {
    (0, _classCallCheck3.default)(this, Request);
};

function parseUri(uri) {
    var match = uri.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)(\/[^?#]*)(\?[^#]*|)(#.*|)$/);
    if (match) {
        var uriStruct = {
            protocol: match[1],
            host: match[2],
            hostname: match[3],
            port: match[4],
            pathname: match[5],
            search: match[6],
            hash: match[7],
            params: null
        };
        if (uriStruct.search.length > 0) {
            var paramsString = uriStruct.search.substring(1);
            uriStruct.params = paramsString.split('&').map(function (el) {
                return el.split('=');
            }).reduce(function (prev, curr) {
                if (!prev.hasOwnProperty(curr[0])) {
                    prev[curr[0]] = curr[1];
                } else if (Array.isArray(prev[curr[0]])) {
                    prev[curr[0]].push(curr[1]);
                } else {
                    prev[curr[0]] = [prev[curr[0]], curr[1]];
                }
                return prev;
            }, {});
        }
        return uriStruct;
    }
    throw new twilsockerror_1.TwilsockError('Incorrect URI: ' + uri);
}
function twilsockAddress(method, uri) {
    var parsedUri = parseUri(uri);
    var to = {
        method: method,
        host: parsedUri.host,
        path: parsedUri.pathname
    };
    if (parsedUri.params) {
        to.params = parsedUri.params;
    }
    return to;
}
function twilsockParams(method, uri, headers, body) {
    return {
        to: twilsockAddress(method, uri),
        headers: headers,
        body: body
    };
}

var Upstream = function () {
    function Upstream(transport, twilsock, config) {
        (0, _classCallCheck3.default)(this, Upstream);

        this.config = config;
        this.transport = transport;
        this.pendingMessages = [];
        this.twilsock = twilsock;
    }

    (0, _createClass3.default)(Upstream, [{
        key: "saveMessage",
        value: function saveMessage(message) {
            var _this = this;

            return new _promise2.default(function (resolve, reject) {
                var requestDescriptor = {
                    message: message,
                    resolve: resolve,
                    reject: reject,
                    timeout: setTimeout(function () {
                        logger_1.log.debug('request is timed out');
                        reject(new twilsockerror_1.TwilsockError('Twilsock: request timeout'));
                    }, REQUEST_TIMEOUT)
                };
                _this.pendingMessages.push(requestDescriptor);
            });
        }
    }, {
        key: "sendPendingMessages",
        value: function sendPendingMessages() {
            var _this2 = this;

            var _loop = function _loop() {
                var request = _this2.pendingMessages[0];
                try {
                    var message = request.message;
                    _this2.actualSend(message).then(function (response) {
                        return request.resolve(response);
                    }).catch(function (e) {
                        return request.reject(e);
                    });
                    clearTimeout(request.timeout);
                } catch (e) {
                    logger_1.log.debug('Failed to send pending message', e);
                    return "break";
                }
                _this2.pendingMessages.splice(0, 1);
            };

            while (this.pendingMessages.length) {
                var _ret = _loop();

                if (_ret === "break") break;
            }
        }
    }, {
        key: "rejectPendingMessages",
        value: function rejectPendingMessages() {
            this.pendingMessages.forEach(function (message) {
                message.reject(new index_1.TransportUnavailableError("Can't connect to twilsock"));
                clearTimeout(message.timeout);
            });
            this.pendingMessages.splice(0, this.pendingMessages.length);
        }
    }, {
        key: "actualSend",
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(message) {
                var address, headers, body, httpRequest, upstreamMessage, reply;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                address = message.to;
                                headers = message.headers;
                                body = message.body;
                                httpRequest = {
                                    host: address.host,
                                    path: address.path,
                                    method: address.method,
                                    params: address.params,
                                    headers: headers
                                };
                                upstreamMessage = new Messages.Message(this.config.activeGrant, headers['Content-Type'] || 'application/json', httpRequest);
                                _context.next = 7;
                                return this.transport.sendWithReply(upstreamMessage, body);

                            case 7:
                                reply = _context.sent;

                                if (!(isHttpReply(reply) && !isHttpSuccess(reply.header.http_status.code))) {
                                    _context.next = 10;
                                    break;
                                }

                                throw new twilsockupstreamerror_1.TwilsockUpstreamError(reply.header.http_status.code, reply.header.http_status.status, reply.body);

                            case 10:
                                return _context.abrupt("return", {
                                    status: reply.header.http_status,
                                    headers: reply.header.http_headers,
                                    body: reply.body
                                });

                            case 11:
                            case "end":
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function actualSend(_x) {
                return _ref.apply(this, arguments);
            }

            return actualSend;
        }()
        /**
         * Send an upstream message
         * @param {Twilsock#Message} message Message structure with header, body and remote address
         * @returns {Promise<Result>} Result from remote side
         */

    }, {
        key: "send",
        value: function send(method, url) {
            var headers = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
            var body = arguments[3];

            if (this.twilsock.isTerminalState) {
                return _promise2.default.reject(new index_1.TransportUnavailableError("Can't connect to twilsock"));
            }
            var twilsockMessage = twilsockParams(method, url, headers, body);
            if (!this.twilsock.isConnected) {
                return this.saveMessage(twilsockMessage);
            }
            return this.actualSend(twilsockMessage);
        }
    }]);
    return Upstream;
}();

exports.Upstream = Upstream;

},{"../error/twilsockerror":213,"../error/twilsockupstreamerror":215,"../index":216,"../logger":217,"../protocol/messages":224,"babel-runtime/core-js/promise":34,"babel-runtime/helpers/asyncToGenerator":39,"babel-runtime/helpers/classCallCheck":40,"babel-runtime/helpers/createClass":41,"babel-runtime/regenerator":48}],232:[function(_dereq_,module,exports){
(function (global){
"use strict";

var _classCallCheck2 = _dereq_("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = _dereq_("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });

var TokenStorage = function () {
    function TokenStorage() {
        (0, _classCallCheck3.default)(this, TokenStorage);
    }

    (0, _createClass3.default)(TokenStorage, null, [{
        key: "storeToken",
        value: function storeToken(continuationToken, productId) {
            if (TokenStorage.canStore) {
                TokenStorage.sessionStorage.setItem(TokenStorage.getKeyName(productId), continuationToken);
            }
        }
    }, {
        key: "getStoredToken",
        value: function getStoredToken(productId) {
            if (!TokenStorage.canStore) {
                return null;
            }
            return TokenStorage.sessionStorage.getItem(TokenStorage.getKeyName(productId));
        }
    }, {
        key: "initialize",
        value: function initialize() {
            if (TokenStorage.canStore) {
                var flag = TokenStorage.sessionStorage.getItem(TokenStorage.initializedFlag);
                // Duplicated tab, cleaning up all stored keys
                if (flag) {
                    this.clear();
                }
                TokenStorage.sessionStorage.setItem(TokenStorage.initializedFlag, 'true');
                // When leaving page or refreshing
                TokenStorage.window.addEventListener('unload', function () {
                    TokenStorage.sessionStorage.removeItem(TokenStorage.initializedFlag);
                });
            }
        }
    }, {
        key: "clear",
        value: function clear() {
            if (TokenStorage.canStore) {
                var keyToDelete = [];
                for (var i = 0; i < TokenStorage.sessionStorage.length; i++) {
                    var key = TokenStorage.sessionStorage.key(i);
                    if (key.startsWith(TokenStorage.tokenStoragePrefix)) {
                        keyToDelete.push(key);
                    }
                }
                keyToDelete.forEach(function (key) {
                    return TokenStorage.sessionStorage.removeItem(key);
                });
                TokenStorage.sessionStorage.removeItem(TokenStorage.initializedFlag);
            }
        }
    }, {
        key: "getKeyName",
        value: function getKeyName(productId) {
            return "" + TokenStorage.tokenStoragePrefix + productId;
        }
    }, {
        key: "canStore",
        get: function get() {
            return TokenStorage.sessionStorage && TokenStorage.window;
        }
    }]);
    return TokenStorage;
}();

TokenStorage.initializedFlag = 'twilio_twilsock_token_storage';
TokenStorage.tokenStoragePrefix = 'twilio_continuation_token_';
TokenStorage.sessionStorage = global['sessionStorage'];
TokenStorage.window = global['window'];
exports.TokenStorage = TokenStorage;
TokenStorage.initialize();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"babel-runtime/helpers/classCallCheck":40,"babel-runtime/helpers/createClass":41}],233:[function(_dereq_,module,exports){
"use strict";

var _promise = _dereq_("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _regenerator = _dereq_("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = _dereq_("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _getPrototypeOf = _dereq_("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _createClass2 = _dereq_("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = _dereq_("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _get3 = _dereq_("babel-runtime/helpers/get");

var _get4 = _interopRequireDefault(_get3);

var _inherits2 = _dereq_("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

var _classCallCheck2 = _dereq_("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _stringify = _dereq_("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

var _typeof2 = _dereq_("babel-runtime/helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = _dereq_("events");
var StateMachine = _dereq_("javascript-state-machine");
var logger_1 = _dereq_("./logger");
var Messages = _dereq_("./protocol/messages");
var parser_1 = _dereq_("./parser");
var twilsockreplyerror_1 = _dereq_("./error/twilsockreplyerror");
var backoffretrier_1 = _dereq_("./backoffretrier");
var ACTIVITY_CHECK_INTERVAL = 5000;
var ACTIVITY_TIMEOUT = 43000;
var INIT_TIMEOUT = 5000;
var UPDATE_TIMEOUT = 5000;
var DISCONNECTING_TIMEOUT = 3000;
// Wraps asynchronous rescheduling
// Just makes it simpler to find these hacks over the code
function trampoline(f) {
    setTimeout(f, 0);
}
/**
 * Makes sure that body is properly stringified
 */
function preparePayload(payload) {
    switch (typeof payload === "undefined" ? "undefined" : (0, _typeof3.default)(payload)) {
        case 'undefined':
            return '';
        case 'object':
            return (0, _stringify2.default)(payload);
        default:
            return payload;
    }
}

var Request = function Request() {
    (0, _classCallCheck3.default)(this, Request);
};

var Response = function Response() {
    (0, _classCallCheck3.default)(this, Response);
};

exports.Response = Response;
/**
 * Twilsock channel level protocol implementation
 */

var TwilsockChannel = function (_events_1$EventEmitte) {
    (0, _inherits3.default)(TwilsockChannel, _events_1$EventEmitte);

    function TwilsockChannel(websocket, transport, config) {
        (0, _classCallCheck3.default)(this, TwilsockChannel);

        var _this = (0, _possibleConstructorReturn3.default)(this, (TwilsockChannel.__proto__ || (0, _getPrototypeOf2.default)(TwilsockChannel)).call(this));

        _this.terminalStates = ['disconnected', 'rejected'];
        _this.lastEmittedState = undefined;
        _this.tokenExpiredSasCode = 20104;
        _this.websocket = websocket;
        _this.websocket.on('connected', function () {
            return _this.fsm.socketConnected();
        });
        _this.websocket.on('disconnected', function (e) {
            return _this.fsm.socketClosed();
        });
        _this.websocket.on('message', function (message) {
            return _this.onIncomingMessage(message);
        });
        _this.transport = transport;
        _this.config = config;
        _this.retrier = new backoffretrier_1.BackoffRetrier(config.retryPolicy);
        _this.retrier.on('attempt', function () {
            return _this.retry();
        });
        _this.retrier.on('failed', function (err) {
            logger_1.log.warn("Retrying failed: " + err.message);
            _this.disconnect();
        });
        if (typeof window !== 'undefined' && typeof window.addEventListener !== 'undefined') {
            window.addEventListener('online', function () {
                logger_1.log.debug('Browser reported connectivity state: online');
                _this.fsm.systemOnline();
            });
            window.addEventListener('offline', function () {
                logger_1.log.debug('Browser reported connectivity state: online');
                _this.websocket.close();
                _this.fsm.socketClosed();
            });
        }
        _this.fsm = new StateMachine({
            init: 'disconnected',
            transitions: [{ name: 'userConnect', from: ['disconnected', 'rejected'], to: 'connecting' }, { name: 'userConnect', from: ['connecting', 'connected'] }, { name: 'userDisconnect', from: ['connecting', 'initialising', 'connected', 'updating', 'retrying', 'rejected', 'waitSocketClosed', 'waitOffloadSocketClosed'], to: 'disconnecting' }, { name: 'userRetry', from: ['retrying'], to: 'connecting' }, { name: 'socketConnected', from: ['connecting'], to: 'initialising' }, { name: 'socketClosed', from: ['connecting', 'initialising', 'connected', 'updating', 'error', 'waitOffloadSocketClosed'], to: 'retrying' }, { name: 'socketClosed', from: ['disconnecting'], to: 'disconnected' }, { name: 'socketClosed', from: ['waitSocketClosed'], to: 'disconnected' }, { name: 'socketClosed', from: ['rejected'], to: 'rejected' }, { name: 'initSuccess', from: ['initialising'], to: 'connected' }, { name: 'initError', from: ['initialising'], to: 'error' }, { name: 'tokenRejected', from: ['initialising', 'updating'], to: 'rejected' }, { name: 'protocolError', from: ['initialising', 'connected', 'updating'], to: 'error' }, { name: 'receiveClose', from: ['initialising', 'connected', 'updating'], to: 'waitSocketClosed' }, { name: 'receiveOffload', from: ['initialising', 'connected', 'updating'], to: 'waitOffloadSocketClosed' }, { name: 'unsupportedProtocol', from: ['initialising', 'connected', 'updating'], to: 'unsupported' }, { name: 'receiveFatalClose', from: ['initialising', 'connected', 'updating'], to: 'unsupported' }, { name: 'userUpdateToken', from: ['disconnected', 'rejected', 'connecting', 'retrying'], to: 'connecting' }, { name: 'userUpdateToken', from: ['connected'], to: 'updating' }, { name: 'updateSuccess', from: ['updating'], to: 'connected' }, { name: 'updateError', from: ['updating'], to: 'error' }, { name: 'userSend', from: ['connected'], to: 'connected' }, { name: 'systemOnline', from: ['retrying'], to: 'connecting' }],
            methods: {
                onConnecting: function onConnecting() {
                    _this.startWatchdogTimer();
                    _this.setupSocket();
                    _this.emit('connecting');
                },
                onEnterInitialising: function onEnterInitialising() {
                    _this.sendInit();
                },
                onLeaveInitialising: function onLeaveInitialising() {
                    _this.cancelInit();
                },
                onEnterUpdating: function onEnterUpdating() {
                    _this.sendUpdate();
                },
                onLeaveUpdating: function onLeaveUpdating() {
                    _this.cancelUpdate();
                },
                onEnterRetrying: function onEnterRetrying() {
                    _this.initRetry();
                    _this.emit('connecting');
                },
                onEnterConnected: function onEnterConnected() {
                    _this.resetBackoff();
                    _this.onConnected();
                },
                onUserUpdateToken: function onUserUpdateToken() {
                    _this.resetBackoff();
                },
                onTokenRejected: function onTokenRejected() {
                    _this.resetBackoff();
                    _this.closeSocket(true);
                    _this.finalizeSocket();
                },
                onUserDisconnect: function onUserDisconnect() {
                    _this.closeSocket(true);
                },
                onEnterDisconnecting: function onEnterDisconnecting() {
                    _this.startDisconnectTimer();
                },
                onLeaveDisconnecting: function onLeaveDisconnecting() {
                    _this.cancelDisconnectTimer();
                },
                onEnterWaitSocketClosed: function onEnterWaitSocketClosed() {
                    _this.startDisconnectTimer();
                },
                onLeaveWaitSocketClosed: function onLeaveWaitSocketClosed() {
                    _this.cancelDisconnectTimer();
                },
                onEnterWaitOffloadSocketClosed: function onEnterWaitOffloadSocketClosed() {
                    _this.startDisconnectTimer();
                },
                onLeaveWaitOffloadSocketClosed: function onLeaveWaitOffloadSocketClosed() {
                    _this.cancelDisconnectTimer();
                },
                onDisconnected: function onDisconnected() {
                    _this.resetBackoff();
                    _this.finalizeSocket();
                },
                onReceiveClose: function onReceiveClose(event, args) {
                    _this.onCloseReceived(args);
                },
                onReceiveOffload: function onReceiveOffload(event, args) {
                    logger_1.log.debug('onreceiveoffload: ', args);
                    _this.modifyBackoff(args.body);
                    _this.onCloseReceived(args.status);
                },
                onUnsupported: function onUnsupported() {
                    _this.closeSocket(true);
                    _this.finalizeSocket();
                },
                onError: function onError(lifecycle, graceful) {
                    _this.closeSocket(graceful);
                    _this.finalizeSocket();
                },
                onEnterState: function onEnterState(event) {
                    if (event.from !== 'none') {
                        _this.changeState(event);
                    }
                },
                onInvalidTransition: function onInvalidTransition(transition, from, to) {
                    logger_1.log.warn('FSM: unexpected transition', from, to);
                }
            }
        });
        return _this;
    }

    (0, _createClass3.default)(TwilsockChannel, [{
        key: "changeState",
        value: function changeState(event) {
            logger_1.log.debug("FSM: " + event.transition + ": " + event.from + " --> " + event.to);
            if (this.lastEmittedState !== this.state) {
                this.lastEmittedState = this.state;
                this.emit('stateChanged', this.state);
            }
        }
    }, {
        key: "resetBackoff",
        value: function resetBackoff() {
            logger_1.log.trace('resetBackoff');
            this.retrier.stop();
        }
    }, {
        key: "modifyBackoff",
        value: function modifyBackoff(body) {
            logger_1.log.trace('modifyBackoff', body);
            var backoffPolicy = body ? body.backoff_policy : null;
            if (backoffPolicy && typeof backoffPolicy.reconnect_min_ms === 'number') {
                this.retrier.modifyBackoff(backoffPolicy.reconnect_min_ms);
            }
        }
    }, {
        key: "emit",
        value: function emit(event) {
            var _get2;

            for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
            }

            logger_1.log.debug("Emitting '" + event.toString() + "'" + (args.length > 0 ? ' with ' + args.length + ' argument/s' : ''));
            return (_get2 = (0, _get4.default)(TwilsockChannel.prototype.__proto__ || (0, _getPrototypeOf2.default)(TwilsockChannel.prototype), "emit", this)).call.apply(_get2, [this, event].concat(args));
        }
    }, {
        key: "startDisconnectTimer",
        value: function startDisconnectTimer() {
            var _this2 = this;

            logger_1.log.trace('startDisconnectTimer');
            if (this.disconnectingTimer) {
                clearTimeout(this.disconnectingTimer);
                this.disconnectingTimer = null;
            }
            this.disconnectingTimer = setTimeout(function () {
                logger_1.log.debug('disconnecting is timed out');
                _this2.closeSocket(true);
            }, DISCONNECTING_TIMEOUT);
        }
    }, {
        key: "cancelDisconnectTimer",
        value: function cancelDisconnectTimer() {
            logger_1.log.trace('cancelDisconnectTimer');
            if (this.disconnectingTimer) {
                clearTimeout(this.disconnectingTimer);
                this.disconnectingTimer = null;
            }
        }
    }, {
        key: "initRetry",
        value: function initRetry() {
            logger_1.log.debug('initRetry');
            if (this.retrier.inProgress) {
                this.retrier.attemptFailed();
            } else {
                this.retrier.start();
            }
        }
    }, {
        key: "retry",
        value: function retry() {
            logger_1.log.trace('retry');
            this.websocket.close();
            this.fsm.userRetry();
        }
    }, {
        key: "onConnected",
        value: function onConnected() {
            this.emit('connected');
        }
    }, {
        key: "finalizeSocket",
        value: function finalizeSocket() {
            logger_1.log.trace('finalizeSocket');
            this.stopWatchdogTimer();
            this.websocket.close();
            this.emit('disconnected');
            if (this.disconnectedPromiseResolve) {
                this.disconnectedPromiseResolve();
                this.disconnectedPromiseResolve = null;
            }
        }
    }, {
        key: "setupSocket",
        value: function setupSocket() {
            logger_1.log.trace('setupSocket:', this.config.token);
            this.websocket.connect();
        }
    }, {
        key: "onIncomingMessage",
        value: function onIncomingMessage(message) {
            var _parser_1$Parser$pars = parser_1.Parser.parse(message),
                method = _parser_1$Parser$pars.method,
                header = _parser_1$Parser$pars.header,
                payload = _parser_1$Parser$pars.payload;

            this.updateActivityTimestamp();
            if (method !== 'reply') {
                this.confirmReceiving(header);
            }
            if (method === 'notification') {
                this.emit('message', header.message_type, payload);
            } else if (header.method === 'reply') {
                this.transport.processReply({
                    id: header.id,
                    status: header.status,
                    header: header,
                    body: payload
                });
            } else if (header.method === 'client_update') {
                if (header.client_update_type === 'token_about_to_expire') {
                    this.emit('tokenAboutToExpire');
                }
            } else if (header.method === 'close') {
                if (header.status.code === 308) {
                    logger_1.log.debug('Connection has been offloaded');
                    this.fsm.receiveOffload({ status: header.status.status, body: payload });
                } else if (header.status.code === 406) {
                    // Not acceptable message
                    logger_1.log.error("Server closed connection because can't parse protocol: " + (0, _stringify2.default)(header.status));
                    this.fsm.receiveFatalClose();
                } else if (header.status.code === 417) {
                    // Protocol error
                    logger_1.log.error("Server closed connection because can't parse client reply: " + (0, _stringify2.default)(header.status));
                    this.fsm.receiveFatalClose(header.status.status);
                } else if (header.status.code === 410) {
                    // Expired token
                    logger_1.log.warn("Server closed connection: " + (0, _stringify2.default)(header.status));
                    this.fsm.receiveClose(header.status.status);
                    this.emit('tokenExpired');
                } else if (header.status.code === 401) {
                    // Authentication fail
                    logger_1.log.error("Server closed connection: " + (0, _stringify2.default)(header.status));
                    this.fsm.receiveClose(header.status.status);
                } else {
                    logger_1.log.warn('unexpected message: ', header.status);
                    // Try to reconnect
                    this.fsm.receiveOffload({ status: header.status.status, body: null });
                }
            }
        }
    }, {
        key: "sendInit",
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
                var reply;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                logger_1.log.trace('sendInit');
                                _context.prev = 1;
                                _context.next = 4;
                                return this.transport.sendInit();

                            case 4:
                                reply = _context.sent;

                                this.config.updateContinuationToken(reply.continuationToken);
                                this.fsm.initSuccess(reply);
                                this.emit('initialized', reply);
                                this.emit('tokenUpdated');
                                _context.next = 15;
                                break;

                            case 11:
                                _context.prev = 11;
                                _context.t0 = _context["catch"](1);

                                if (_context.t0 instanceof twilsockreplyerror_1.TwilsockReplyError) {
                                    logger_1.log.warn("Init rejected by server: " + (0, _stringify2.default)(_context.t0.reply.status));
                                    if (_context.t0.reply.status.code === 401 || _context.t0.reply.status.code === 403) {
                                        this.fsm.tokenRejected(_context.t0.reply.status);
                                        if (_context.t0.reply.status.errorCode === this.tokenExpiredSasCode) {
                                            this.emit('tokenExpired');
                                        }
                                    } else if (_context.t0.reply.status.code === 429) {
                                        this.modifyBackoff(_context.t0.reply.body);
                                        this.fsm.initError(true);
                                    } else if (_context.t0.reply.status.code === 500) {
                                        this.fsm.initError(false);
                                    } else {
                                        this.fsm.initError(true);
                                    }
                                } else {
                                    this.fsm.initError(true);
                                }
                                this.emit('tokenUpdated', _context.t0);

                            case 15:
                            case "end":
                                return _context.stop();
                        }
                    }
                }, _callee, this, [[1, 11]]);
            }));

            function sendInit() {
                return _ref.apply(this, arguments);
            }

            return sendInit;
        }()
    }, {
        key: "sendUpdate",
        value: function () {
            var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
                var message, reply;
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                logger_1.log.trace('sendUpdate');
                                message = new Messages.Update(this.config.token);
                                _context2.prev = 2;
                                _context2.next = 5;
                                return this.transport.sendWithReply(message);

                            case 5:
                                reply = _context2.sent;

                                this.fsm.updateSuccess(reply.body);
                                this.emit('tokenUpdated');
                                _context2.next = 14;
                                break;

                            case 10:
                                _context2.prev = 10;
                                _context2.t0 = _context2["catch"](2);

                                if (_context2.t0 instanceof twilsockreplyerror_1.TwilsockReplyError) {
                                    logger_1.log.warn("Token update rejected by server: " + (0, _stringify2.default)(_context2.t0.reply.status));
                                    if (_context2.t0.reply.status.code === 401 || _context2.t0.reply.status.code === 403) {
                                        this.fsm.tokenRejected(_context2.t0.reply.status);
                                        if (_context2.t0.reply.status.errorCode === this.tokenExpiredSasCode) {
                                            this.emit('tokenExpired');
                                        }
                                    } else if (_context2.t0.reply.status.code === 429) {
                                        this.modifyBackoff(_context2.t0.reply.body);
                                        this.fsm.updateError(_context2.t0.reply.status);
                                    } else {
                                        this.fsm.updateError(_context2.t0.reply.status);
                                    }
                                } else {
                                    this.fsm.updateError(_context2.t0);
                                }
                                this.emit('tokenUpdated', _context2.t0);

                            case 14:
                            case "end":
                                return _context2.stop();
                        }
                    }
                }, _callee2, this, [[2, 10]]);
            }));

            function sendUpdate() {
                return _ref2.apply(this, arguments);
            }

            return sendUpdate;
        }()
    }, {
        key: "cancelInit",
        value: function cancelInit() {
            logger_1.log.trace('cancelInit');
            // TODO: implement
        }
    }, {
        key: "cancelUpdate",
        value: function cancelUpdate() {
            logger_1.log.trace('cancelUpdate');
            // TODO: implement
        }
        /**
         * Should be called for each message to confirm it received
         */

    }, {
        key: "confirmReceiving",
        value: function confirmReceiving(messageHeader) {
            logger_1.log.trace('confirmReceiving');
            try {
                this.transport.send(new Messages.Reply(messageHeader.id));
            } catch (e) {
                logger_1.log.debug('failed to confirm packet receiving', e);
            }
        }
        /**
         * Shutdown connection
         */

    }, {
        key: "closeSocket",
        value: function closeSocket(graceful) {
            var _this3 = this;

            logger_1.log.trace("closeSocket (graceful: " + graceful + ")");
            if (graceful && this.transport.isConnected) {
                this.transport.sendClose();
            }
            this.websocket.close();
            trampoline(function () {
                return _this3.fsm.socketClosed();
            });
        }
        /**
         * Initiate the twilsock connection
         * If already connected, it does nothing
         */

    }, {
        key: "connect",
        value: function connect() {
            logger_1.log.trace('connect');
            this.fsm.userConnect();
        }
        /**
         * Close twilsock connection
         * If already disconnected, it does nothing
         */

    }, {
        key: "disconnect",
        value: function disconnect() {
            var _this4 = this;

            logger_1.log.trace('disconnect');
            if (this.fsm.is('disconnected')) {
                return _promise2.default.resolve();
            }
            return new _promise2.default(function (resolve) {
                _this4.disconnectedPromiseResolve = resolve;
                _this4.fsm.userDisconnect();
            });
        }
        /**
         * Update fpa token for twilsock connection
         */

    }, {
        key: "updateToken",
        value: function updateToken(token) {
            var _this5 = this;

            logger_1.log.trace('updateToken:', token);
            return new _promise2.default(function (resolve, reject) {
                _this5.once('tokenUpdated', function (e) {
                    if (e) {
                        reject(e);
                    } else {
                        resolve();
                    }
                });
                _this5.fsm.userUpdateToken();
            });
        }
    }, {
        key: "onCloseReceived",
        value: function onCloseReceived(reason) {
            this.websocket.close();
        }
    }, {
        key: "startWatchdogTimer",
        value: function startWatchdogTimer() {
            var _this6 = this;

            logger_1.log.trace('startWatchdogTimer');
            this.recentActivityTimestamp = Date.now();
            this.watchTimer = setInterval(function () {
                if (Date.now() - _this6.recentActivityTimestamp > ACTIVITY_TIMEOUT && _this6.websocket.isConnected) {
                    _this6.websocket.close();
                }
            }, ACTIVITY_CHECK_INTERVAL);
        }
    }, {
        key: "stopWatchdogTimer",
        value: function stopWatchdogTimer() {
            logger_1.log.trace('stopWatchdogTimer');
            clearInterval(this.watchTimer);
        }
    }, {
        key: "updateActivityTimestamp",
        value: function updateActivityTimestamp() {
            logger_1.log.trace('updateActivityTimestamp');
            this.recentActivityTimestamp = Date.now();
        }
    }, {
        key: "isConnected",
        get: function get() {
            return this.state === 'connected' && this.websocket.isConnected;
        }
    }, {
        key: "state",
        get: function get() {
            switch (this.fsm.state) {
                case 'connecting':
                case 'initialising':
                case 'retrying':
                case 'error':
                    return 'connecting';
                case 'updating':
                case 'connected':
                    return 'connected';
                case 'rejected':
                    return 'rejected';
                case 'disconnecting':
                case 'waitSocketClosed':
                case 'waitOffloadSocketClosed':
                    return 'disconnecting';
                case 'disconnected':
                default:
                    return 'disconnected';
            }
        }
    }, {
        key: "isTerminalState",
        get: function get() {
            return this.terminalStates.indexOf(this.fsm.state) !== -1;
        }
    }]);
    return TwilsockChannel;
}(events_1.EventEmitter);

exports.TwilsockChannel = TwilsockChannel;
exports.TwilsockImpl = TwilsockChannel;

},{"./backoffretrier":208,"./error/twilsockreplyerror":214,"./logger":217,"./parser":221,"./protocol/messages":224,"babel-runtime/core-js/json/stringify":26,"babel-runtime/core-js/object/get-prototype-of":32,"babel-runtime/core-js/promise":34,"babel-runtime/helpers/asyncToGenerator":39,"babel-runtime/helpers/classCallCheck":40,"babel-runtime/helpers/createClass":41,"babel-runtime/helpers/get":42,"babel-runtime/helpers/inherits":43,"babel-runtime/helpers/possibleConstructorReturn":44,"babel-runtime/helpers/typeof":47,"babel-runtime/regenerator":48,"events":187,"javascript-state-machine":189}],234:[function(_dereq_,module,exports){
(function (global){
"use strict";

var _getPrototypeOf = _dereq_("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = _dereq_("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = _dereq_("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = _dereq_("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = _dereq_("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = _dereq_("events");
var logger_1 = _dereq_("./logger");

var WebSocketChannel = function (_events_1$EventEmitte) {
    (0, _inherits3.default)(WebSocketChannel, _events_1$EventEmitte);

    function WebSocketChannel(url) {
        (0, _classCallCheck3.default)(this, WebSocketChannel);

        var _this = (0, _possibleConstructorReturn3.default)(this, (WebSocketChannel.__proto__ || (0, _getPrototypeOf2.default)(WebSocketChannel)).call(this));

        _this.url = url;
        _this.WebSocket = global['WebSocket'] || global['MozWebSocket'] || _dereq_('ws');
        return _this;
    }

    (0, _createClass3.default)(WebSocketChannel, [{
        key: "connect",
        value: function connect() {
            var _this2 = this;

            logger_1.log.trace('connecting to socket');
            var socket = new this.WebSocket(this.url);
            socket.binaryType = 'arraybuffer';
            socket.onopen = function () {
                logger_1.log.debug("socket opened " + _this2.url);
                _this2.emit('connected');
            };
            socket.onclose = function (e) {
                logger_1.log.debug('socket closed', e);
                _this2.emit('disconnected', e);
            };
            socket.onerror = function (e) {
                logger_1.log.debug('error:', e);
            };
            socket.onmessage = function (message) {
                _this2.emit('message', message.data);
            };
            this.socket = socket;
        }
    }, {
        key: "send",
        value: function send(message) {
            this.socket.send(message);
        }
    }, {
        key: "close",
        value: function close() {
            logger_1.log.trace('closing socket');
            if (this.socket) {
                this.socket.onopen = null;
                this.socket.onclose = null;
                this.socket.onerror = null;
                this.socket.onmessage = null;
                this.socket.close();
            }
        }
    }, {
        key: "isConnected",
        get: function get() {
            return this.socket && this.socket.readyState === 1;
        }
    }]);
    return WebSocketChannel;
}(events_1.EventEmitter);

exports.WebSocketChannel = WebSocketChannel;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./logger":217,"babel-runtime/core-js/object/get-prototype-of":32,"babel-runtime/helpers/classCallCheck":40,"babel-runtime/helpers/createClass":41,"babel-runtime/helpers/inherits":43,"babel-runtime/helpers/possibleConstructorReturn":44,"events":187,"ws":55}],235:[function(_dereq_,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],236:[function(_dereq_,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = _dereq_('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = _dereq_('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,_dereq_('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":235,"_process":197,"inherits":188}],237:[function(_dereq_,module,exports){
var v1 = _dereq_('./v1');
var v4 = _dereq_('./v4');

var uuid = v4;
uuid.v1 = v1;
uuid.v4 = v4;

module.exports = uuid;

},{"./v1":240,"./v4":241}],238:[function(_dereq_,module,exports){
/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
var byteToHex = [];
for (var i = 0; i < 256; ++i) {
  byteToHex[i] = (i + 0x100).toString(16).substr(1);
}

function bytesToUuid(buf, offset) {
  var i = offset || 0;
  var bth = byteToHex;
  // join used to fix memory issue caused by concatenation: https://bugs.chromium.org/p/v8/issues/detail?id=3175#c4
  return ([bth[buf[i++]], bth[buf[i++]], 
	bth[buf[i++]], bth[buf[i++]], '-',
	bth[buf[i++]], bth[buf[i++]], '-',
	bth[buf[i++]], bth[buf[i++]], '-',
	bth[buf[i++]], bth[buf[i++]], '-',
	bth[buf[i++]], bth[buf[i++]],
	bth[buf[i++]], bth[buf[i++]],
	bth[buf[i++]], bth[buf[i++]]]).join('');
}

module.exports = bytesToUuid;

},{}],239:[function(_dereq_,module,exports){
// Unique ID creation requires a high quality random # generator.  In the
// browser this is a little complicated due to unknown quality of Math.random()
// and inconsistent support for the `crypto` API.  We do the best we can via
// feature-detection

// getRandomValues needs to be invoked in a context where "this" is a Crypto
// implementation. Also, find the complete implementation of crypto on IE11.
var getRandomValues = (typeof(crypto) != 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto)) ||
                      (typeof(msCrypto) != 'undefined' && typeof window.msCrypto.getRandomValues == 'function' && msCrypto.getRandomValues.bind(msCrypto));

if (getRandomValues) {
  // WHATWG crypto RNG - http://wiki.whatwg.org/wiki/Crypto
  var rnds8 = new Uint8Array(16); // eslint-disable-line no-undef

  module.exports = function whatwgRNG() {
    getRandomValues(rnds8);
    return rnds8;
  };
} else {
  // Math.random()-based (RNG)
  //
  // If all else fails, use Math.random().  It's fast, but is of unspecified
  // quality.
  var rnds = new Array(16);

  module.exports = function mathRNG() {
    for (var i = 0, r; i < 16; i++) {
      if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
      rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
    }

    return rnds;
  };
}

},{}],240:[function(_dereq_,module,exports){
var rng = _dereq_('./lib/rng');
var bytesToUuid = _dereq_('./lib/bytesToUuid');

// **`v1()` - Generate time-based UUID**
//
// Inspired by https://github.com/LiosK/UUID.js
// and http://docs.python.org/library/uuid.html

var _nodeId;
var _clockseq;

// Previous uuid creation time
var _lastMSecs = 0;
var _lastNSecs = 0;

// See https://github.com/broofa/node-uuid for API details
function v1(options, buf, offset) {
  var i = buf && offset || 0;
  var b = buf || [];

  options = options || {};
  var node = options.node || _nodeId;
  var clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq;

  // node and clockseq need to be initialized to random values if they're not
  // specified.  We do this lazily to minimize issues related to insufficient
  // system entropy.  See #189
  if (node == null || clockseq == null) {
    var seedBytes = rng();
    if (node == null) {
      // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
      node = _nodeId = [
        seedBytes[0] | 0x01,
        seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]
      ];
    }
    if (clockseq == null) {
      // Per 4.2.2, randomize (14 bit) clockseq
      clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 0x3fff;
    }
  }

  // UUID timestamps are 100 nano-second units since the Gregorian epoch,
  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
  var msecs = options.msecs !== undefined ? options.msecs : new Date().getTime();

  // Per 4.2.1.2, use count of uuid's generated during the current clock
  // cycle to simulate higher resolution clock
  var nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1;

  // Time since last uuid creation (in msecs)
  var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;

  // Per 4.2.1.2, Bump clockseq on clock regression
  if (dt < 0 && options.clockseq === undefined) {
    clockseq = clockseq + 1 & 0x3fff;
  }

  // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
  // time interval
  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
    nsecs = 0;
  }

  // Per 4.2.1.2 Throw error if too many uuids are requested
  if (nsecs >= 10000) {
    throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
  }

  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq;

  // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
  msecs += 12219292800000;

  // `time_low`
  var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
  b[i++] = tl >>> 24 & 0xff;
  b[i++] = tl >>> 16 & 0xff;
  b[i++] = tl >>> 8 & 0xff;
  b[i++] = tl & 0xff;

  // `time_mid`
  var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
  b[i++] = tmh >>> 8 & 0xff;
  b[i++] = tmh & 0xff;

  // `time_high_and_version`
  b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
  b[i++] = tmh >>> 16 & 0xff;

  // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
  b[i++] = clockseq >>> 8 | 0x80;

  // `clock_seq_low`
  b[i++] = clockseq & 0xff;

  // `node`
  for (var n = 0; n < 6; ++n) {
    b[i + n] = node[n];
  }

  return buf ? buf : bytesToUuid(b);
}

module.exports = v1;

},{"./lib/bytesToUuid":238,"./lib/rng":239}],241:[function(_dereq_,module,exports){
var rng = _dereq_('./lib/rng');
var bytesToUuid = _dereq_('./lib/bytesToUuid');

function v4(options, buf, offset) {
  var i = buf && offset || 0;

  if (typeof(options) == 'string') {
    buf = options === 'binary' ? new Array(16) : null;
    options = null;
  }
  options = options || {};

  var rnds = options.random || (options.rng || rng)();

  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
  rnds[6] = (rnds[6] & 0x0f) | 0x40;
  rnds[8] = (rnds[8] & 0x3f) | 0x80;

  // Copy bytes to buffer, if provided
  if (buf) {
    for (var ii = 0; ii < 16; ++ii) {
      buf[i + ii] = rnds[ii];
    }
  }

  return buf || bytesToUuid(rnds);
}

module.exports = v4;

},{"./lib/bytesToUuid":238,"./lib/rng":239}],242:[function(_dereq_,module,exports){
module.exports={
  "name": "twilio-sync",
  "version": "0.8.4",
  "description": "Twilio Sync client library",
  "main": "lib/index.js",
  "types": "./lib/index.d.ts",
  "scripts": {
    "test": "gulp unit-test",
    "prepare": "gulp build"
  },
  "author": "Twilio",
  "license": "MIT",
  "dependencies": {
    "twilio-notifications": "^0.5.1",
    "twilsock": "^0.5.5",
    "karibu": "^2.0.0",
    "loglevel": "^1.6.1",
    "operation-retrier": "^2.0.0",
    "backoff": "^2.5.0",
    "platform": "^1.3.5",
    "rfc6902": "^2.2.2",
    "update": "^0.7.4",
    "uuid": "^3.2.1"
  },
  "devDependencies": {
    "@types/chai": "^4.1.2",
    "@types/chai-as-promised": "7.1.0",
    "@types/mocha": "^2.2.48",
    "@types/node": "^8.9.1",
    "@types/sinon": "^4.1.3",
    "@types/sinon-chai": "^2.7.29",
    "async-test-tools": "^1.0.7",
    "babel-core": "^6.26.0",
    "babel-eslint": "^8.2.3",
    "babel-plugin-transform-builtin-extend": "^1.1.2",
    "babel-plugin-transform-runtime": "^6.23.0",
    "babel-preset-env": "^1.6.1",
    "babel-runtime": "^6.26.0",
    "babelify": "^8.0.0",
    "browserify": "^16.0.0",
    "chai": "^4.1.2",
    "chai-as-promised": "^7.1.1",
    "cheerio": "^1.0.0-rc.2",
    "del": "^3.0.0",
    "gulp": "^4.0.0",
    "gulp-babel": "^7.0.1",
    "gulp-derequire": "^2.1.0",
    "gulp-exit": "0.0.2",
    "gulp-insert": "^0.5.0",
    "gulp-istanbul": "^1.1.3",
    "gulp-mocha": "^5.0.0",
    "gulp-rename": "^1.2.2",
    "gulp-replace": "^0.6.1",
    "gulp-tap": "^1.0.1",
    "gulp-tslint": "^8.1.2",
    "gulp-typescript": "^4.0.1",
    "gulp-uglify-es": "^1.0.0",
    "ink-docstrap": "^1.3.2",
    "isparta": "^4.0.0",
    "jsdoc": "^3.5.5",
    "jsonwebtoken": "^8.1.1",
    "karma": "^2.0.0",
    "karma-browserify": "^5.2.0",
    "karma-browserstack-launcher": "^1.3.0",
    "karma-mocha": "^1.3.0",
    "karma-mocha-reporter": "^2.2.5",
    "mocha": "^5.0.0",
    "run-sequence": "^2.2.1",
    "sinon": "^4.2.2",
    "sinon-chai": "^2.14.0",
    "ts-node": "^4.1.0",
    "tslint": "^5.9.1",
    "twilio": "^3.15.0",
    "typescript": "^2.8.1",
    "uglify-es": "^3.3.10",
    "uglify-save-license": "^0.4.1",
    "underscore": "^1.8.3",
    "vinyl-buffer": "^1.0.1",
    "vinyl-source-stream": "^2.0.0",
    "watchify": "^3.10.0"
  },
  "browserify": {
    "transform": [
      "babelify"
    ]
  },
  "engines": {
    "node": ">=8"
  }
}

},{}]},{},[2])(2)
});

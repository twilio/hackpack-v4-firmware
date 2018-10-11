"use strict";

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
var logger_1 = require("./logger");
var entity_1 = require("./entity");
var mapitem_1 = require("./mapitem");
var paginator_1 = require("./paginator");
var cache_1 = require("./cache");
var mergingqueue_1 = require("./mergingqueue");
var syncerror_1 = require("./syncerror");
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
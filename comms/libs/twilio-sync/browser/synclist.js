"use strict";

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
var listitem_1 = require("./listitem");
var paginator_1 = require("./paginator");
var cache_1 = require("./cache");
var mergingqueue_1 = require("./mergingqueue");
var syncerror_1 = require("./syncerror");
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
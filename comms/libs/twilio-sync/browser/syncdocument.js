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
var logger_1 = require("./logger");
var entity_1 = require("./entity");
var utils_1 = require("./utils");
var mergingqueue_1 = require("./mergingqueue");
var syncerror_1 = require("./syncerror");
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
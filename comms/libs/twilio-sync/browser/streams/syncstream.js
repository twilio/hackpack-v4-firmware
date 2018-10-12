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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var entity_1 = require("../entity");
var utils_1 = require("../utils");
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
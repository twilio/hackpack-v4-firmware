"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var logger_1 = require("./logger");
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
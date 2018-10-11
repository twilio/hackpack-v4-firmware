"use strict";

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
var events_1 = require("events");

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
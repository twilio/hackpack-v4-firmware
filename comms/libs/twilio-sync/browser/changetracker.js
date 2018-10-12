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
var rfc6902_1 = require("rfc6902");
/**
 * Tracks changes for JS objects and emits appropriate callbacks
 */

var ChangeTracker = function (_events_1$EventEmitte) {
    (0, _inherits3.default)(ChangeTracker, _events_1$EventEmitte);

    function ChangeTracker(data) {
        (0, _classCallCheck3.default)(this, ChangeTracker);

        var _this = (0, _possibleConstructorReturn3.default)(this, (ChangeTracker.__proto__ || (0, _getPrototypeOf2.default)(ChangeTracker)).call(this));

        ['keyAdded', 'keyRemoved', 'keyUpdated'].forEach(function (eventName) {
            _this.pendingListeners[eventName] = {};
            _this.on(eventName, function (path, value) {
                var handlers = _this.pendingListeners[eventName][path] || [];
                handlers.forEach(function (handler) {
                    return handler(value);
                });
                _this.pendingListeners[eventName][path] = [];
            });
        });
        return _this;
    }
    /**
     * Compare old and new data and fire events if difference found
     * @private
     */


    (0, _createClass3.default)(ChangeTracker, [{
        key: "traverse",
        value: function traverse(originalData, updatedData) {
            var _this2 = this;

            var diff = rfc6902_1.createPatch(originalData, updatedData);
            diff.forEach(function (row) {
                if (row.op === 'add') {
                    _this2.emit('keyAdded', row.path, row.value);
                } else if (row.op === 'replace') {
                    _this2.emit('keyUpdated', row.path, row.value);
                } else if (row.op === 'remove') {
                    _this2.emit('keyRemoved', row.path);
                }
            });
        }
        /**
         * Set new data to process
         * @param Object updatedData new data set
         * @public
         */

    }, {
        key: "update",
        value: function update(updatedData) {
            var originalData = this.data;
            this.data = updatedData;
            this.traverse(originalData, updatedData);
        }
    }, {
        key: "addEventHandler",
        value: function addEventHandler(eventName, path, handler) {
            var handlers = this.pendingListeners[eventName][path] || [];
            handlers.push(handler);
            this.pendingListeners[eventName][path] = handlers;
        }
    }]);
    return ChangeTracker;
}(events_1.EventEmitter);

exports.ChangeTracker = ChangeTracker;
exports.default = ChangeTracker;
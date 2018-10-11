"use strict";

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
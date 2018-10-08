"use strict";

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var karibu_1 = require("karibu");

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
"use strict";

var _map = require("babel-runtime/core-js/map");

var _map2 = _interopRequireDefault(_map);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
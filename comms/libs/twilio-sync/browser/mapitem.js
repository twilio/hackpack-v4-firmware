"use strict";

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @class
 * @classdesc Represents an individual element in a Sync Map.
 * @alias MapItem
 * @property {String} key The identifier that maps to this item within the containing Map.
 * @property {Object} value The contents of the item.
 * @property {Date} dateUpdated Date when the Map Item was last updated, given in UTC ISO 8601 format (e.g., '2018-04-26T15:23:19.732Z')
 */

var MapItem = function () {
  /**
   * @private
   * @constructor
   */
  function MapItem(descriptor) {
    (0, _classCallCheck3.default)(this, MapItem);

    this.descriptor = descriptor;
  }

  (0, _createClass3.default)(MapItem, [{
    key: "update",

    /**
     * @private
     */
    value: function update(eventId, revision, value, dateUpdated) {
      this.descriptor.last_event_id = eventId;
      this.descriptor.revision = revision;
      this.descriptor.data = value;
      this.descriptor.date_updated = dateUpdated;
      return this;
    }
    /**
     * @private
     */

  }, {
    key: "updateDateExpires",
    value: function updateDateExpires(dateExpires) {
      this.descriptor.date_expires = dateExpires;
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
    key: "dateExpires",
    get: function get() {
      return this.descriptor.date_expires;
    }
  }, {
    key: "key",
    get: function get() {
      return this.descriptor.key;
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
  }]);
  return MapItem;
}();

exports.MapItem = MapItem;
"use strict";

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @class
 * @classdesc Represents an individual element in a Sync List.
 * @alias ListItem
 * @property {Number} index The index, within the containing List, of this item. This index is stable;
 * even if lower-indexed Items are removed, this index will remain as is.
 * @property {Object} value The contents of the item.
 * @property {Date} dateUpdated Date when the List Item was last updated.
 */

var ListItem = function () {
  /**
   * @private
   * @constructor
   * @param {Object} data Item descriptor
   * @param {Number} data.index Item identifier
   * @param {String} data.uri Item URI
   * @param {Object} data.value Item data
   */
  function ListItem(data) {
    (0, _classCallCheck3.default)(this, ListItem);

    this.data = data;
  }

  (0, _createClass3.default)(ListItem, [{
    key: "update",

    /**
     * @private
     */
    value: function update(eventId, revision, value, dateUpdated) {
      this.data.lastEventId = eventId;
      this.data.revision = revision;
      this.data.value = value;
      this.data.dateUpdated = dateUpdated;
      return this;
    }
    /**
     * @private
     */

  }, {
    key: "updateDateExpires",
    value: function updateDateExpires(dateExpires) {
      this.data.dateExpires = dateExpires;
    }
  }, {
    key: "uri",
    get: function get() {
      return this.data.uri;
    }
  }, {
    key: "revision",
    get: function get() {
      return this.data.revision;
    }
  }, {
    key: "lastEventId",
    get: function get() {
      return this.data.lastEventId;
    }
  }, {
    key: "dateUpdated",
    get: function get() {
      return this.data.dateUpdated;
    }
  }, {
    key: "dateExpires",
    get: function get() {
      return this.data.dateExpires;
    }
  }, {
    key: "index",
    get: function get() {
      return this.data.index;
    }
  }, {
    key: "value",
    get: function get() {
      return this.data.value;
    }
  }]);
  return ListItem;
}();

exports.ListItem = ListItem;
exports.default = ListItem;
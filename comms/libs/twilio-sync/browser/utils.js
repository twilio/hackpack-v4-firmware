"use strict";

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var syncerror_1 = require("./syncerror");
/**
 * Deep-clone an object. Note that this does not work on object containing
 * functions.
 * @param {object} obj - the object to deep-clone
 * @returns {object}
 */
function deepClone(obj) {
    return JSON.parse((0, _stringify2.default)(obj));
}
exports.deepClone = deepClone;
function validateOptionalTtl(ttl) {
    var validTtl = ttl === undefined || isNonNegativeInteger(ttl);
    if (!validTtl) {
        throw new syncerror_1.default("Invalid TTL value, expected a positive integer, was '" + ttl + "'", 400, 54011);
    }
}
exports.validateOptionalTtl = validateOptionalTtl;
function validateMandatoryTtl(ttl) {
    var validTtl = isNonNegativeInteger(ttl);
    if (!validTtl) {
        throw new syncerror_1.default("Invalid TTL value, expected a positive integer, was '" + ttl + "'", 400, 54011);
    }
}
exports.validateMandatoryTtl = validateMandatoryTtl;
function validatePageSize(pageSize) {
    var validPageSize = pageSize === undefined || isPositiveInteger(pageSize);
    if (!validPageSize) {
        throw new syncerror_1.default("Invalid pageSize parameter. Expected a positive integer, was '" + pageSize + "'.", 400, 54455);
    }
}
exports.validatePageSize = validatePageSize;
function isInteger(number) {
    return !isNaN(parseInt(number)) && isFinite(number);
}
function isPositiveInteger(number) {
    return isInteger(number) && number > 0;
}
function isNonNegativeInteger(number) {
    return isInteger(number) && number >= 0;
}
/**
 * Construct URI with query parameters
 */

var UriBuilder = function () {
    function UriBuilder(base) {
        (0, _classCallCheck3.default)(this, UriBuilder);

        this.base = base;
        this.args = new Array();
        this.paths = new Array();
    }

    (0, _createClass3.default)(UriBuilder, [{
        key: "pathSegment",
        value: function pathSegment(name) {
            this.paths.push(encodeURIComponent(name));
            return this;
        }
    }, {
        key: "queryParam",
        value: function queryParam(name, value) {
            if (typeof value !== 'undefined') {
                this.args.push(encodeURIComponent(name) + '=' + encodeURIComponent(value));
            }
            return this;
        }
    }, {
        key: "build",
        value: function build() {
            var result = this.base;
            if (this.paths.length) {
                result += '/' + this.paths.join('/');
            }
            if (this.args.length) {
                result += '?' + this.args.join('&');
            }
            return result;
        }
    }]);
    return UriBuilder;
}();

exports.UriBuilder = UriBuilder;
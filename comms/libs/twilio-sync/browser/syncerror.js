"use strict";

var _create = require("babel-runtime/core-js/object/create");

var _create2 = _interopRequireDefault(_create);

var _setPrototypeOf = require("babel-runtime/core-js/object/set-prototype-of");

var _setPrototypeOf2 = _interopRequireDefault(_setPrototypeOf);

var _from = require("babel-runtime/core-js/array/from");

var _from2 = _interopRequireDefault(_from);

var _construct = require("babel-runtime/core-js/reflect/construct");

var _construct2 = _interopRequireDefault(_construct);

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _extendableBuiltin(cls) {
    function ExtendableBuiltin() {
        var instance = (0, _construct2.default)(cls, (0, _from2.default)(arguments));
        (0, _setPrototypeOf2.default)(instance, (0, _getPrototypeOf2.default)(this));
        return instance;
    }

    ExtendableBuiltin.prototype = (0, _create2.default)(cls.prototype, {
        constructor: {
            value: cls,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });

    if (_setPrototypeOf2.default) {
        (0, _setPrototypeOf2.default)(ExtendableBuiltin, cls);
    } else {
        ExtendableBuiltin.__proto__ = cls;
    }

    return ExtendableBuiltin;
}

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Generic SyncLibrary error class
 */

var SyncError = function (_extendableBuiltin2) {
    (0, _inherits3.default)(SyncError, _extendableBuiltin2);

    function SyncError(message) {
        var status = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        var code = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
        (0, _classCallCheck3.default)(this, SyncError);

        var _this = (0, _possibleConstructorReturn3.default)(this, (SyncError.__proto__ || (0, _getPrototypeOf2.default)(SyncError)).call(this));

        _this.name = _this.constructor.name;
        _this.message = message + " (status: " + status + ", code: " + code + ")";
        _this.status = status;
        _this.code = code;
        return _this;
    }

    return SyncError;
}(_extendableBuiltin(Error));

exports.SyncError = SyncError;
exports.default = SyncError;
"use strict";

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var syncerror_1 = require("./syncerror");

var SyncNetworkError = function (_syncerror_1$SyncErro) {
    (0, _inherits3.default)(SyncNetworkError, _syncerror_1$SyncErro);

    function SyncNetworkError(message) {
        var status = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        var code = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
        var body = arguments[3];
        (0, _classCallCheck3.default)(this, SyncNetworkError);

        var _this = (0, _possibleConstructorReturn3.default)(this, (SyncNetworkError.__proto__ || (0, _getPrototypeOf2.default)(SyncNetworkError)).call(this, message, status, code));

        _this.body = body;
        return _this;
    }

    return SyncNetworkError;
}(syncerror_1.SyncError);

exports.SyncNetworkError = SyncNetworkError;
exports.default = SyncNetworkError;
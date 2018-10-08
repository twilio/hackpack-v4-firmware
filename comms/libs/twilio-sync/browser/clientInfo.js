"use strict";

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var platform = require("platform");

var ClientInfo = function ClientInfo(version) {
    (0, _classCallCheck3.default)(this, ClientInfo);

    this.sdk = 'js';
    this.sdkVer = version;
    this.os = platform.os.family;
    this.osVer = platform.os.version;
    this.pl = platform.name;
    this.plVer = platform.version;
};

exports.ClientInfo = ClientInfo;
exports.default = ClientInfo;
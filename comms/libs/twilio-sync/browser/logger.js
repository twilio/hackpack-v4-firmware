"use strict";

var _from = require("babel-runtime/core-js/array/from");

var _from2 = _interopRequireDefault(_from);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var log = require("loglevel");
function prepareLine(prefix, args) {
    return [new Date().toISOString() + " Sync " + prefix + ":"].concat((0, _from2.default)(args));
}
exports.default = {
    setLevel: function setLevel(level) {
        log.setLevel(level);
    },
    trace: function trace() {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        log.trace.apply(null, prepareLine('T', args));
    },
    debug: function debug() {
        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
        }

        log.debug.apply(null, prepareLine('D', args));
    },
    info: function info() {
        for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            args[_key3] = arguments[_key3];
        }

        log.info.apply(null, prepareLine('I', args));
    },
    warn: function warn() {
        for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
            args[_key4] = arguments[_key4];
        }

        log.warn.apply(null, prepareLine('W', args));
    },
    error: function error() {
        for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
            args[_key5] = arguments[_key5];
        }

        log.error.apply(null, prepareLine('E', args));
    }
};
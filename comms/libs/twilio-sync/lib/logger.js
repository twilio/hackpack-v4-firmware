"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const log = require("loglevel");
function prepareLine(prefix, args) {
    return [`${new Date().toISOString()} Sync ${prefix}:`].concat(Array.from(args));
}
exports.default = {
    setLevel: function (level) { log.setLevel(level); },
    trace: function (...args) { log.trace.apply(null, prepareLine('T', args)); },
    debug: function (...args) { log.debug.apply(null, prepareLine('D', args)); },
    info: function (...args) { log.info.apply(null, prepareLine('I', args)); },
    warn: function (...args) { log.warn.apply(null, prepareLine('W', args)); },
    error: function (...args) { log.error.apply(null, prepareLine('E', args)); }
};

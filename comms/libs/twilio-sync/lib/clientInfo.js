"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const platform = require("platform");
class ClientInfo {
    constructor(version) {
        this.sdk = 'js';
        this.sdkVer = version;
        this.os = platform.os.family;
        this.osVer = platform.os.version;
        this.pl = platform.name;
        this.plVer = platform.version;
    }
}
exports.ClientInfo = ClientInfo;
exports.default = ClientInfo;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const syncerror_1 = require("./syncerror");
/**
 * Deep-clone an object. Note that this does not work on object containing
 * functions.
 * @param {object} obj - the object to deep-clone
 * @returns {object}
 */
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}
exports.deepClone = deepClone;
function validateOptionalTtl(ttl) {
    const validTtl = ttl === undefined || isNonNegativeInteger(ttl);
    if (!validTtl) {
        throw new syncerror_1.default(`Invalid TTL value, expected a positive integer, was '${ttl}'`, 400, 54011);
    }
}
exports.validateOptionalTtl = validateOptionalTtl;
function validateMandatoryTtl(ttl) {
    const validTtl = isNonNegativeInteger(ttl);
    if (!validTtl) {
        throw new syncerror_1.default(`Invalid TTL value, expected a positive integer, was '${ttl}'`, 400, 54011);
    }
}
exports.validateMandatoryTtl = validateMandatoryTtl;
function validatePageSize(pageSize) {
    const validPageSize = pageSize === undefined || isPositiveInteger(pageSize);
    if (!validPageSize) {
        throw new syncerror_1.default(`Invalid pageSize parameter. Expected a positive integer, was '${pageSize}'.`, 400, 54455);
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
class UriBuilder {
    constructor(base) {
        this.base = base;
        this.args = new Array();
        this.paths = new Array();
    }
    pathSegment(name) {
        this.paths.push(encodeURIComponent(name));
        return this;
    }
    queryParam(name, value) {
        if (typeof value !== 'undefined') {
            this.args.push(encodeURIComponent(name) + '=' + encodeURIComponent(value));
        }
        return this;
    }
    build() {
        let result = this.base;
        if (this.paths.length) {
            result += '/' + this.paths.join('/');
        }
        if (this.args.length) {
            result += '?' + this.args.join('&');
        }
        return result;
    }
}
exports.UriBuilder = UriBuilder;

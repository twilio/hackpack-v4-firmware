"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @class Paginator
 * @classdesc Pagination helper class.
 *
 * @property {Array} items Array of elements on current page.
 * @property {Boolean} hasNextPage Indicates the existence of next page.
 * @property {Boolean} hasPrevPage Indicates the existence of previous page.
 */
class Paginator {
    /*
    * @constructor
    * @param {Array} items Array of element for current page.
    * @param {Object} params
    * @private
    */
    constructor(items, source, prevToken, nextToken) {
        this.prevToken = prevToken;
        this.nextToken = nextToken;
        this.items = items;
        this.source = source;
    }
    get hasNextPage() { return !!this.nextToken; }
    get hasPrevPage() { return !!this.prevToken; }
    /**
     * Request next page.
     * Does not modify existing object.
     * @return {Promise<Paginator>}
     */
    async nextPage() {
        if (!this.hasNextPage) {
            throw new Error('No next page');
        }
        return this.source(this.nextToken);
    }
    /**
     * Request previous page.
     * Does not modify existing object.
     * @return {Promise<Paginator>}
     */
    async prevPage() {
        if (!this.hasPrevPage) {
            throw new Error('No previous page');
        }
        return this.source(this.prevToken);
    }
}
exports.Paginator = Paginator;

/**
 * @class Paginator
 * @classdesc Pagination helper class.
 *
 * @property {Array} items Array of elements on current page.
 * @property {Boolean} hasNextPage Indicates the existence of next page.
 * @property {Boolean} hasPrevPage Indicates the existence of previous page.
 */
declare class Paginator<Item> {
    private prevToken;
    private nextToken;
    private source;
    readonly items: Item[];
    constructor(items: any, source: any, prevToken: string, nextToken: string);
    readonly hasNextPage: boolean;
    readonly hasPrevPage: boolean;
    /**
     * Request next page.
     * Does not modify existing object.
     * @return {Promise<Paginator>}
     */
    nextPage(): Promise<any>;
    /**
     * Request previous page.
     * Does not modify existing object.
     * @return {Promise<Paginator>}
     */
    prevPage(): Promise<any>;
}
export { Paginator };

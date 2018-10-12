/**
 * Deep-clone an object. Note that this does not work on object containing
 * functions.
 * @param {object} obj - the object to deep-clone
 * @returns {object}
 */
declare function deepClone<T>(obj: T): T;
declare function validateOptionalTtl(ttl: number): void;
declare function validateMandatoryTtl(ttl: number): void;
declare function validatePageSize(pageSize: number): void;
/**
 * Construct URI with query parameters
 */
declare class UriBuilder {
    base: string;
    args: string[];
    paths: string[];
    constructor(base: string);
    pathSegment(name: string): UriBuilder;
    queryParam(name: string, value: any): UriBuilder;
    build(): string;
}
export { deepClone, UriBuilder, validateOptionalTtl, validateMandatoryTtl, validatePageSize };

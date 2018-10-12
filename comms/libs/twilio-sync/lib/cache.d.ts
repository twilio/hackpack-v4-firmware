declare class Cache<K, V> {
    private items;
    constructor();
    store(key: K, value: V, revision: number): V;
    delete(key: K, revision: number): void;
    isKnown(key: K, revision: number): boolean;
    get(key: K): V;
    has(key: K): boolean;
}
export { Cache };
export default Cache;

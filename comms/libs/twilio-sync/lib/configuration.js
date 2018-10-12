"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SUBSCRIPTIONS_PATH = '/v4/Subscriptions';
const MAPS_PATH = '/v3/Maps';
const LISTS_PATH = '/v3/Lists';
const DOCUMENTS_PATH = '/v3/Documents';
const STREAMS_PATH = '/v3/Streams';
function getWithDefault(container, key, defaultValue) {
    if (container && typeof container[key] !== 'undefined') {
        return container[key];
    }
    return defaultValue;
}
/**
 * Settings container for Sync library
 */
class Configuration {
    /**
     * @param {Object} options
     */
    constructor(options = {}) {
        const region = options.region || 'us1';
        const defaultCdsUrl = `https://cds.${region}.twilio.com`;
        const baseUri = options.cdsUri || defaultCdsUrl;
        this.settings = {
            subscriptionsUri: baseUri + SUBSCRIPTIONS_PATH,
            documentsUri: baseUri + DOCUMENTS_PATH,
            listsUri: baseUri + LISTS_PATH,
            mapsUri: baseUri + MAPS_PATH,
            streamsUri: baseUri + STREAMS_PATH,
            sessionStorageEnabled: getWithDefault(options.Sync, 'enableSessionStorage', true)
        };
    }
    get subscriptionsUri() { return this.settings.subscriptionsUri; }
    get documentsUri() { return this.settings.documentsUri; }
    get listsUri() { return this.settings.listsUri; }
    get mapsUri() { return this.settings.mapsUri; }
    get streamsUri() { return this.settings.streamsUri; }
    get backoffConfig() { return this.settings.backoffConfig || {}; }
    get sessionStorageEnabled() { return this.settings.sessionStorageEnabled; }
}
exports.Configuration = Configuration;

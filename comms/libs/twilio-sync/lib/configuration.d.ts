/**
 * Settings container for Sync library
 */
declare class Configuration {
    private settings;
    /**
     * @param {Object} options
     */
    constructor(options?: any);
    readonly subscriptionsUri: string;
    readonly documentsUri: string;
    readonly listsUri: string;
    readonly mapsUri: string;
    readonly streamsUri: string;
    readonly backoffConfig: any;
    readonly sessionStorageEnabled: boolean;
}
export { Configuration };

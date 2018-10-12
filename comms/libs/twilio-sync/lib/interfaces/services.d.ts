import { Router } from '../router';
import { Subscriptions } from '../subscriptions';
import { Twilsock } from 'twilsock';
interface Configuration {
    subscriptionsUri: string;
    documentsUri: string;
    listsUri: string;
    mapsUri: string;
    streamsUri: string;
    backoffConfig: any;
    sessionStorageEnabled: boolean;
}
interface Network {
    get(uri: string): any;
    post(uri: string, body: Object, revision?: string, twilsockOnly?: boolean): any;
    put(uri: string, body: Object, revision: string): any;
    delete(uri: string): any;
}
interface Notifications {
    connectionState: any;
    updateToken(token: string): Promise<Notifications>;
}
interface Storage {
    store(type: string, id: string, value: Object): any;
    read(type: string, id: string): Object;
    update(type: string, id: string, uniqueName: string, patch: Object): any;
    remove(type: string, sid: string, uniqueName: string): any;
    updateStorageId(storageId: string): any;
}
interface Services {
    twilsock: Twilsock;
    notifications: Notifications;
    network: Network;
    config: Configuration;
    router: Router;
    subscriptions: Subscriptions;
    storage: Storage;
}
export { Twilsock, Notifications, Configuration, Network, Router, Storage, Services };

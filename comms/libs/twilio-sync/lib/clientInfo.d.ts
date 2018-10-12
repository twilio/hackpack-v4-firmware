declare class ClientInfo {
    sdk: string;
    sdkVer: string;
    os: string;
    osVer: string;
    pl: string;
    plVer: string;
    constructor(version: string);
}
export default ClientInfo;
export { ClientInfo };

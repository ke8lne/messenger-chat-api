import Log from "npmlog";
export default function setOptions(globalOptions: ApiOptions, options?: ApiOptions): ApiOptions;
export interface ApiOptions {
    logLevel?: Log.LogLevels;
    selfListen?: boolean;
    listenEvents?: boolean;
    listenTyping?: boolean;
    pageID?: string | number;
    updatePresence?: boolean;
    forceLogin?: boolean;
    userAgent?: string;
    autoMarkDelivery?: boolean;
    autoMarkRead?: boolean;
    logRecordSize?: number;
    autoReconnect?: boolean;
    online?: boolean;
    proxy?: string;
    agent?: string;
}

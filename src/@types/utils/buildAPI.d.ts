import { ApiOptions } from "./setOptions";
import { CookieJar } from "request";
export default function buildAPI(globalOptions: ApiOptions, html: string, jar: CookieJar): {
    ctx: {
        userID: string;
        jar: CookieJar;
        clientID: string;
        globalOptions: ApiOptions;
        loggedIn: boolean;
        access_token: string;
        clientMutationId: number;
        mqttClient: any;
        lastSeqId: number;
        syncToken: any;
    };
    api: {
        setOptions: any;
        getAppState: () => import("tough-cookie").Cookie[];
    };
    functions: {
        get: (url: any, jar: any, qs: any) => Promise<any>;
        post: (url: any, jar: any, form: any) => Promise<any>;
        postFormData: (url: any, jar: any, form: any, qs: any) => Promise<any>;
    };
    globalOptions: ApiOptions;
};

import changeBlockedStatus from "./functions/changeBlockedStatus";
import changeAdminStatus from "./functions/changeAdminStatus";
import changeThreadColor from "./functions/changeThreadColor";
import changeGroupImage from "./functions/changeGroupImage";
import changeNickname from "./functions/changeNickname";
import changeAvatar from "./functions/changeAvatar";
import sendMessage from "./functions/sendMessage";
import { ApiOptions } from "./utils/setOptions";
import postFormData from "./utils/postFormData";
import changeBio from "./functions/changeBio";
import { Cookie, CookieJar } from "request";
import addUser from "./functions/addUser";
import post from "./utils/post";
import { Client } from "mqtt";
import get from "./utils/get";
export interface Api {
    setOptions: (options: ApiOptions) => ApiOptions;
    getAppState: () => Cookie[];
    addUser: ReturnType<typeof addUser>;
    changeAdminStatus: ReturnType<typeof changeAdminStatus>;
    changeArchivedStatus: ReturnType<typeof changeAdminStatus>;
    changeAvatar: ReturnType<typeof changeAvatar>;
    changeBio: ReturnType<typeof changeBio>;
    changeBlockedStatus: ReturnType<typeof changeBlockedStatus>;
    changeGroupImage: ReturnType<typeof changeGroupImage>;
    changeNickname: ReturnType<typeof changeNickname>;
    changeThreadColor: ReturnType<typeof changeThreadColor>;
    sendMessage: ReturnType<typeof sendMessage>;
    [funcName: string]: (...args: any[]) => any;
}
export type LoginData = {
    email: string;
    password: string;
    appState?: any[];
} | {
    email?: string;
    password?: string;
    appState: any[];
};
export interface DefaultFuncs {
    get: typeof get;
    post: typeof post;
    postFormData: typeof postFormData;
}
export interface Ctx {
    region: string;
    mqttEndpoint: string;
    userID: string;
    jar: CookieJar;
    clientID: string;
    globalOptions: ApiOptions;
    loggedIn: boolean;
    access_token: string;
    clientMutationId: number;
    mqttClient: Client;
    lastSeqId: number;
    syncToken: any;
}

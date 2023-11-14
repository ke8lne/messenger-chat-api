import handleMessageRequest from "./functions/handleMessageRequest";
import handleFriendRequest from "./functions/handleFriendRequest";
import removeUserFromGroup from "./functions/removeUserFromGroup";
import sendTypingIndicator from "./functions/sendTypingIndicator";
import changeBlockedStatus from "./functions/changeBlockedStatus";
import setMessageReaction from "./functions/setMessageReaction";
import forwardAttachment from "./functions/forwardAttachment";
import getThreadPictures from "./functions/getThreadPictures";
import changeThreadEmoji from "./functions/changeThreadEmoji";
import changeAdminStatus from "./functions/changeAdminStatus";
import changeThreadColor from "./functions/changeThreadColor";
import getCurrentUserID from "./functions/getCurrentUserID";
import getThreadHistory from "./functions/getThreadHistory";
import changeGroupImage from "./functions/changeGroupImage";
import resolvePhotoUrl from "./functions/resolvePhotoUrl";
import searchForThread from "./functions/searchForThread";
import setPostReaction from "./functions/setPostReaction";
import markAsDelivered from "./functions/markAsDelivered";
import addUserToThread from "./functions/addUserToThread";
import createNewGroup from "./functions/createNewGroup";
import getFriendsList from "./functions/getFriendsList";
import changeNickname from "./functions/changeNickname";
import unsendMessage from "./functions/unsendMessage";
import markAsReadAll from "./functions/markAsReadAll";
import deleteMessage from "./functions/deleteMessage";
import getThreadInfo from "./functions/getThreadInfo";
import getThreadList from "./functions/getThreadList";
import deleteThread from "./functions/deleteThread";
import changeAvatar from "./functions/changeAvatar";
import sendMessage from "./functions/sendMessage";
import getEmojiUrl from "./functions/getEmojiUrl";
import getUserInfo from "./functions/getUserInfo";
import markAsRead from "./functions/markAsRead";
import markAsSeen from "./functions/markAsSeen";
import { ApiOptions } from "./utils/setOptions";
import postFormData from "./utils/postFormData";
import muteThread from "./functions/muteThread";
import createPoll from "./functions/createPoll";
import getMessage from "./functions/getMessage";
import changeBio from "./functions/changeBio";
import getUserID from "./functions/getUserID";
import setTitle from "./functions/setTitle";
import unfriend from "./functions/unfriend";
import { Cookie, CookieJar } from "request";
import logout from "./functions/logout";
import post from "./utils/post";
import { Client } from "mqtt";
import get from "./utils/get";

export type LoginData = { email: string; password: string; appState?: Cookie[] } | { email?: string; password?: string; appState: Cookie[] }
export interface Api {
     setOptions: (options: ApiOptions) => ApiOptions;
     getAppState: () => Cookie[];
     addUserToThread: ReturnType<typeof addUserToThread>;
     changeAdminStatus: ReturnType<typeof changeAdminStatus>;
     changeArchivedStatus: ReturnType<typeof changeAdminStatus>;
     changeAvatar: ReturnType<typeof changeAvatar>;
     changeBio: ReturnType<typeof changeBio>;
     changeBlockedStatus: ReturnType<typeof changeBlockedStatus>;
     changeGroupImage: ReturnType<typeof changeGroupImage>;
     changeNickname: ReturnType<typeof changeNickname>;
     changeThreadColor: ReturnType<typeof changeThreadColor>;
     changeThreadEmoji: ReturnType<typeof changeThreadEmoji>;
     createNewGroup: ReturnType<typeof createNewGroup>;
     createPoll: ReturnType<typeof createPoll>;
     deleteMessage: ReturnType<typeof deleteMessage>;
     deleteThread: ReturnType<typeof deleteThread>;
     forwardAttachment: ReturnType<typeof forwardAttachment>;
     getCurrentUserID: ReturnType<typeof getCurrentUserID>;
     getEmojiUrl: ReturnType<typeof getEmojiUrl>;
     getFriendList: ReturnType<typeof getFriendsList>;
     getMessage: ReturnType<typeof getMessage>;
     getThreadHistory: ReturnType<typeof getThreadHistory>;
     getThreadInfo: ReturnType<typeof getThreadInfo>;
     getThreadList: ReturnType<typeof getThreadList>;
     getThreadPictures: ReturnType<typeof getThreadPictures>;
     getUserID: ReturnType<typeof getUserID>;
     getUserInfo: ReturnType<typeof getUserInfo>;
     handleFriendRequest: ReturnType<typeof handleFriendRequest>;
     handleMessageRequest: ReturnType<typeof handleMessageRequest>;
     logout: ReturnType<typeof logout>;
     markAsDelivered: ReturnType<typeof markAsDelivered>;
     markAsRead: ReturnType<typeof markAsRead>;
     markAsReadAll: ReturnType<typeof markAsReadAll>;
     markAsSeen: ReturnType<typeof markAsSeen>;
     muteThread: ReturnType<typeof muteThread>;
     removeUserFromGroup: ReturnType<typeof removeUserFromGroup>;
     resolvePhotoUrl: ReturnType<typeof resolvePhotoUrl>;
     searchForThread: ReturnType<typeof searchForThread>;
     sendMessage: ReturnType<typeof sendMessage>;
     sendTypingIndicator: ReturnType<typeof sendTypingIndicator>;
     setMessageReaction: ReturnType<typeof setMessageReaction>;
     setPostReaction: ReturnType<typeof setPostReaction>;
     setTitle: ReturnType<typeof setTitle>;
     unfriend: ReturnType<typeof unfriend>;
     unsendMessage: ReturnType<typeof unsendMessage>;
}


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
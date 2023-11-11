import { ApiOptions } from "./setOptions";
import { Api, Ctx, DefaultFuncs } from "../Interface";
export default function (funcs: DefaultFuncs, api: Api, ctx: Ctx): Promise<{
    ctx: Ctx;
    api: Api;
    functions: DefaultFuncs;
    setOptions(_options: ApiOptions): ApiOptions;
    stopListening(): void;
    addListener(eventName: string | symbol, listener: (...args: any[]) => void): any;
    on(eventName: string | symbol, listener: (...args: any[]) => void): any;
    once(eventName: string | symbol, listener: (...args: any[]) => void): any;
    removeListener(eventName: string | symbol, listener: (...args: any[]) => void): any;
    off(eventName: string | symbol, listener: (...args: any[]) => void): any;
    removeAllListeners(event?: string | symbol): any;
    setMaxListeners(n: number): any;
    getMaxListeners(): number;
    listeners(eventName: string | symbol): Function[];
    rawListeners(eventName: string | symbol): Function[];
    emit(eventName: string | symbol, ...args: any[]): boolean;
    listenerCount(eventName: string | symbol, listener?: Function): number;
    prependListener(eventName: string | symbol, listener: (...args: any[]) => void): any;
    prependOnceListener(eventName: string | symbol, listener: (...args: any[]) => void): any;
    eventNames(): (string | symbol)[];
}>;
export declare enum Events {
    AddFriend = "friend_request_received",
    CancelRequest = "friend_request_cancel",
    Typing = "typing",
    Presence = "presence",
    SelfEvent = "selfListenEvent",
    AdminMessage = "admin_text_message",
    ChangeName = "change_name",
    ChangeTheme = "change_theme",
    ChangeNickname = "change_nickname",
    ChangeAdmin = "change_admin",
    ChangeIcon = "change_icon",
    ThreadUserJoin = "thread_join",
    ThreadUserLeave = "thread_leave",
    MessageReact = "message_react",
    MessageUnsend = "message_unsend",
    MessageSend = "message_send",
    MessageRead = "message_read",
    ThreadEvent = "thread_event",
    Poll = "thread_poll"
}

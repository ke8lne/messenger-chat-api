import { Thread } from "../utils/formatThread";
import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "../utils/setOptions";
export declare enum ThreadTags {
    Inbox = "INBOX",
    Archived = "ARCHIVED",
    Pending = "PENDING",
    Other = "OTHER"
}
export default function (funcs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions): (limit: number, timestamp?: number, tag?: ThreadTags, unreadTag?: boolean) => Promise<Thread[]>;

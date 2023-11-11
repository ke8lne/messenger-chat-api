import { Api, Ctx, DefaultFuncs } from "../Interface";
export default function resolveAttachmentUrl(i: number, v: Record<string, any>, pk: {
    funcs: DefaultFuncs;
    api: Api;
    ctx: Ctx;
}): {
    isReply: boolean;
    senderID: string;
    body: any;
    threadID: string;
    messageID: any;
    attachments: any;
    mentions: {};
    timestamp: any;
    isGroup: boolean;
};

import { ApiOptions } from "../utils/setOptions";
import { Api, Ctx, DefaultFuncs } from "../Interface";
export type Message = {
    body?: string;
    sticker?: string;
    attachment?: ReadableStream | ReadableStream[];
    url?: string;
    emoji?: {
        emojiSize: EmojiSize;
        emoji: string;
    };
    mentions?: Mention[];
    location?: {
        latitude: number;
        longitude: number;
        current: boolean;
    };
};
export interface Mention {
    id: string;
    tag: string;
    fromIndex?: number;
}
export declare enum EmojiSize {
    Small = "small",
    Medium = "medium",
    Large = "large"
}
export default function (defaultFuncs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions): (msg: Message, threadID: string, replyMessageId?: string, isGroup?: boolean) => Promise<unknown>;

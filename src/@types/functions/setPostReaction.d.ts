import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "../utils/setOptions";
export declare enum PostReaction {
    Unlike = 0,
    Like = 1,
    Heart = 2,
    Wow = 3,
    Haha = 4,
    Sad = 7,
    Angry = 8,
    Love = 16
}
export default function (funcs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions): (postID: PostReaction, type: (keyof typeof PostReaction) | PostReaction) => Promise<{
    viewer_feedback_reaction_info: any;
    supported_reactions: any;
    top_reactions: any;
    reaction_count: number;
}>;

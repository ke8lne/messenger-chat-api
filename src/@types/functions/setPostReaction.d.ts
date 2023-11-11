import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "../utils/setOptions";
export default function (funcs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions): (postID: string, type: string | number) => Promise<{
    viewer_feedback_reaction_info: any;
    supported_reactions: any;
    top_reactions: any;
    reaction_count: any;
}>;

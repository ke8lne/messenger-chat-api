import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "../utils/setOptions";
export default function (funcs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions): (reaction: string, messageID: string) => Promise<any>;
export declare function formatReaction(reaction: string, forceReaction?: boolean): void;

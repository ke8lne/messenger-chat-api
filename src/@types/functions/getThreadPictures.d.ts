import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "../utils/setOptions";
export default function (funcs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions): (threadID: string, offset: number, limit: number) => Promise<{
    uri: string;
    width: number;
    height: number;
}[]>;

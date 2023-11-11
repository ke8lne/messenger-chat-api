import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "../utils/setOptions";
export default function (funcs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions): (newTitle: string, threadID: string) => Promise<any>;

import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "../utils/setOptions";
export default function (defaultFuncs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions): (threadOrThreads: string | string[]) => Promise<boolean>;

import { Thread } from "../utils/formatThread";
import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "../utils/setOptions";
export default function (funcs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions): (threadID: string[]) => Promise<Thread | Thread[]>;

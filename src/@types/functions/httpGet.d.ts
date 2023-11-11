import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "../utils/setOptions";
export default function (funcs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions): (url: string, form: Record<string, any>, customHeader?: Record<string, any>, notAPI?: boolean) => Promise<void>;

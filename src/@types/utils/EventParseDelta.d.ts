import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "./setOptions";
export default function parseDelta(funcs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions, v: Record<string, any>): Promise<any>;

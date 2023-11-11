import { ApiOptions } from "../utils/setOptions";
import { Api, Ctx, DefaultFuncs } from "../Interface";
export default function (defaultFuncs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions): (userID: string, block: boolean) => Promise<any>;

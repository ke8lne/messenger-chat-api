import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "../utils/setOptions";
import { User } from "./getFriendsList";
export default function (funcs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions): (ids: string | string[]) => Promise<User[]>;

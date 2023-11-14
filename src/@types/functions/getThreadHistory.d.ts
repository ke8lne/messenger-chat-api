import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "../utils/setOptions";
import { Message } from "./sendMessage";
export default function (funcs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions): (threadID: string, amount: number, timestamp?: number) => Promise<Message[]>;

/// <reference types="node" />
import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "../utils/setOptions";
export default function (defaultFuncs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions): (image: Buffer, caption?: string, timestamp?: number | string) => Promise<any>;

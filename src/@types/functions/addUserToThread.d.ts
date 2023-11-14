import { ApiOptions } from "../utils/setOptions";
export default function (defaultFuncs: Record<string, any>, api: Record<string, any>, ctx: Record<string, any>, options: ApiOptions): (userID: string | string[], threadID: string) => Promise<string>;

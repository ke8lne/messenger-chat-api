import parseAndCheckLogin from "../utils/parseCheckAndLogin";
import { Api, Ctx, DefaultFuncs } from "../Interface";
import { parseUserData } from "../utils/formatUser";
import { ApiOptions } from "../utils/setOptions";
import Log from "npmlog";

export default function (funcs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions) {
  return async function getUserInfo(ids: string | string[]) {
    if (!Array.isArray(ids)) ids = [ids];
    const form = {};
    ids.forEach((v, i) => form[`ids[${i}`] = v);
    return await funcs.post("https://www.facebook.com/chat/user_info/", ctx.jar, form, options)
      .then(parseAndCheckLogin(ctx, funcs))
      .then(res => {
        if (res.error) throw res;
        return parseUserData(res.payload.profiles);
      })
      .catch(err => {
        Log.error("getUserInfo", err);
        throw err;
      })
  }
}
import parseAndCheckLogin from "../utils/parseCheckAndLogin";
import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "../utils/setOptions";
import { saveCookies } from "../utils/cookies";
import Log from "npmlog";

export default function (funcs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions) {
  return async function markAsReadAll() {
    return await funcs.post("https://www.facebook.com/ajax/mercury/mark_folder_as_read.php", ctx.jar, { folder: 'inbox' }, options)
      .then(saveCookies(ctx.jar))
      .then(parseAndCheckLogin(ctx, funcs))
      .then(res => {
        if (res.error) throw res;
        return res;
      })
      .catch(err => {
        Log.error("markAsReadAll", err);
        throw err;
      })
  }
}
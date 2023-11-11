import parseAndCheckLogin from "../utils/parseCheckAndLogin";
import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "../utils/setOptions";
import { saveCookies } from "../utils/cookies";
import getType from "../utils/getType";
import Log from "npmlog"

export default function (funcs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions) {
  return async function markAsDelivered(threadID: string, messageID: string) {
    const form = {};
    form["message_ids[0]"] = messageID;
    form["thread_ids[" + threadID + "][0]"] = messageID;
    return await funcs.post("https://www.facebook.com/ajax/mercury/delivery_receipts.php", ctx.jar, form, options)
      .then(saveCookies(ctx.jar))
      .then(parseAndCheckLogin(ctx, funcs))
      .then(res => {
        if (res.error) throw res;
        return res
      })
      .catch(err => {
        Log.error("markAsDelivered", err);
        if (getType(err) == "Object" && err.error === "Not logged in.") ctx.loggedIn = false;
        throw err;
      })
  }
}
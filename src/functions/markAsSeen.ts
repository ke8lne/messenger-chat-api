import parseAndCheckLogin from "../utils/parseCheckAndLogin";
import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "../utils/setOptions";
import { saveCookies } from "../utils/cookies";
import getType from "../utils/getType";
import Log from "npmlog";

export default function (funcs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions) {
  /**
   * @param Timestamp Seen timestamp.
   */
  return async function markAsRead(timestamp: number) {
    return await funcs.post("https://www.facebook.com/ajax/mercury/mark_seen.php", ctx.jar, { seen_timestamp: timestamp }, options)
      .then(saveCookies(ctx.jar))
      .then(parseAndCheckLogin(ctx, funcs))
      .then(res => {
        if (res.error)
          throw res
        return res;
      })
      .catch(err => {
        Log.error("markAsSeen", err);
        if (getType(err) == "Object" && err.error === "Not logged in.")
          ctx.loggedIn = false;
        throw err;
      })
  }
}

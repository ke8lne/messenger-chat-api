import parseAndCheckLogin from "../utils/parseCheckAndLogin";
import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "../utils/setOptions";
import { saveCookies } from "../utils/cookies";
import Log from "npmlog";

export default function (funcs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions) {
  /**
   * @param threadID Thread ID
   * @param muteSecond -1=permanent mute, 0=unmute, 60=one minute, 3600=one hour, etc.
   */
  return async function muteThread(threadID: string, muteSeconds: number) {
    return await funcs.post("https://www.facebook.com/ajax/mercury/change_mute_thread.php", ctx.jar, { thread_fbid: threadID, mute_settings: muteSeconds }, options)
      .then(saveCookies(ctx.jar))
      .then(parseAndCheckLogin(ctx, funcs))
      .then(res => {
        if (res.error)
          throw res
        return res;
      })
      .catch(err => {
        Log.error("muteThread", err);
        throw err;
      })
  }
}
import parseAndCheckLogin from "../utils/parseCheckAndLogin";
import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "../utils/setOptions";
import Log from "npmlog";

export default function (funcs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions) {
  /**
   * Removes a user from a thread.
   * @param userID User to remove.
   * @param threadID Thread to modify.
   */
  return async function removeUserFromGroup(userID: string, threadID: string) {
    return await funcs
      .post("https://www.facebook.com/chat/remove_participants", ctx.jar, { uid: userID, tid: threadID }, options)
      .then(parseAndCheckLogin(ctx, funcs))
      .then(res => {
        if (!res) throw { error: "Remove from group failed." };
        if (res.error) throw res;
        return res;
      })
      .catch(err => {
        Log.error("removeUserFromGroup", err);
        throw err;
      })
  }
}
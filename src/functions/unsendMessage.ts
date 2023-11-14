import parseAndCheckLogin from "../utils/parseCheckAndLogin";
import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "../utils/setOptions";
import Log from "npmlog";

export default function (funcs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions) {
  /**
   * Revokes a message from anyone that could see the message written by the logged user. Can only unsend if the message is 10 Minutes ago.
   * @param messageID Message to unsend.
   */
  return async function unsendMessage(messageID: string) {
    return await funcs.post("https://www.facebook.com/messaging/unsend_message/", ctx.jar, { message_id: messageID }, options)
      .then(parseAndCheckLogin(ctx, funcs))
      .then(res => {
        if (res.error) throw res;
        return res["payload"] == null;
      })
      .catch(err => {
        Log.error("unsendMessage", err);
        throw err;
      })
  }
}
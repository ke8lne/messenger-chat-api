import parseAndCheckLogin from "../utils/parseCheckAndLogin";
import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "../utils/setOptions";
import Log from "npmlog";

export default function (funcs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions) {
  return async function unsendMessage(messageID: string) {
    return await funcs.post("https://www.facebook.com/messaging/unsend_message/", ctx.jar, { message_id: messageID }, options)
      .then(parseAndCheckLogin(ctx, funcs))
      .then(res => {
        if (res.error) throw res;
        return res;
      })
      .catch(err => {
        Log.error("unsendMessage", err);
        throw err;
      })
  }
}
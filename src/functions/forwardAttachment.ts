import parseAndCheckLogin from "../utils/parseCheckAndLogin";
import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "../utils/setOptions";
import Log from "npmlog";

export default function (funcs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions) {
  return async function forwardAttachment(attachmentID: string, userOrUsers: string | string[]) {
    if (!Array.isArray(userOrUsers)) userOrUsers = [userOrUsers];
    const timestamp = Math.floor(Date.now() / 1000), form = { attachment_id: attachmentID };
    for (var i = 0; i < userOrUsers.length; i++)
      form["recipient_map[" + (timestamp + i) + "]"] = userOrUsers[i];
    return await funcs.post("https://www.facebook.com/mercury/attachments/forward/", ctx.jar, form, options)
      .then(parseAndCheckLogin(ctx.jar, funcs))
      .then(res => {
        if (res.error) throw res.err;
        return res;
      })
      .catch(err => {
        Log.error("forwardAttachment", err);
        throw err;
      })
  }
}
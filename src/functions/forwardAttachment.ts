import parseAndCheckLogin from "../utils/parseCheckAndLogin";
import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "../utils/setOptions";
import Log from "npmlog";

export default function (funcs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions) {
  /**
   * Forwards corresponding attachment to given userID or to every user from an array of userIDs
   * @param attachmentID The ID field in the attachment object. Recorded audio cannot be forwarded.
   * @param userID User IDs to submit.
   */
  return async function forwardAttachment(attachmentID: string, userID: string | string[]): Promise<boolean> {
    if (!Array.isArray(userID)) userID = [userID];
    const timestamp = Math.floor(Date.now() / 1000), form = { attachment_id: attachmentID };
    for (var i = 0; i < userID.length; i++)
      form["recipient_map[" + (timestamp + i) + "]"] = userID[i];
    return await funcs.post("https://www.facebook.com/mercury/attachments/forward/", ctx.jar, form, options)
      .then(parseAndCheckLogin(ctx.jar, funcs))
      .then(res => {
        if (res.error) throw res.err;
        return res["payload"] == null;
      })
      .catch(err => {
        Log.error("forwardAttachment", err);
        throw err;
      })
  }
}
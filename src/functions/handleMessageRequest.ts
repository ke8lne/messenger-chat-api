import parseAndCheckLogin from "../utils/parseCheckAndLogin";
import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "../utils/setOptions";
import Log from "npmlog";

export default function (funcs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions) {
  /**
   * Accept or ignore message request(s) with threadID.
   * @param threadIDs Group or User message to handle.
   * @param accept Accept the request if true.
   */
  return async function handleMessageRequest(threadIDs: string | string[], accept: boolean) {
    if (!Array.isArray(threadIDs)) threadIDs = [threadIDs];
    const form = { client: "mercury" };
    threadIDs.forEach((id, i) => form[`${accept ? "inbox" : "other"}[${i}]`] = id[i]);
    return await funcs.post("https://www.facebook.com/ajax/mercury/move_thread.php", ctx.jar, form, options)
      .then(parseAndCheckLogin(ctx, funcs))
      .then(res => {
        if (res.error) throw res;
        return res["payload"] == null;
      })
      .catch(err => {
        Log.error("handleMessageRequest", err);
        throw err;
      })
  }
}
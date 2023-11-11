import parseAndCheckLogin from "../utils/parseCheckAndLogin";
import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "../utils/setOptions";
import getType from "../utils/getType";
import Log from "npmlog";

export default function (defaultFuncs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions) {
  /**
   * Given a threadID, or an array of threadIDs, will delete the threads from your account. Note that this does not remove the messages from Facebook's servers - anyone who hasn't deleted the thread can still view all of the messages.
   * @param threadOrThreads The id(s) of the threads you wish to remove from your account.
   */
  return async function deleteThread(threadOrThreads: string | string[]): Promise<void> {
    const form = { client: "mercury" };
    if (getType(threadOrThreads) !== "Array") threadOrThreads = [threadOrThreads] as string[];
    for (var i = 0; i < threadOrThreads.length; i++)
      form["ids[" + i + "]"] = threadOrThreads[i];
    return await defaultFuncs.post("https://www.facebook.com/ajax/mercury/delete_thread.php", ctx.jar, form, options)
      .then(parseAndCheckLogin(ctx, defaultFuncs))
      .then(resData => {
        if (resData.error) throw resData.error;
        return resData;
      })
      .catch(err => {
        Log.error("deleteThread", err);
        throw err;
      })
  }
}
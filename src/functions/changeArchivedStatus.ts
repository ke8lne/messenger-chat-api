import parseAndCheckLogin from "../utils/parseCheckAndLogin";
import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "../utils/setOptions";
import getType from "../utils/getType";
import Log from "npmlog";

export default function (defaultFuncs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions) {
  /**
   * Given a threadID, or an array of threadIDs, will set the archive status of the threads to archive. Archiving a thread will hide it from the logged-in user's inbox until the next time a message is sent or received.
   * @param string threadID to modify
   * @returns result
   */
  return async function changeArchivedStatus(threadOrThreads: string | string[], archive: boolean): Promise<boolean> {
    const form = {};
    if (getType(threadOrThreads) === "Array")
      for (var i = 0; i < threadOrThreads.length; i++)
        form[`ids[${threadOrThreads[i]}]`] = archive;
    else
      form[`ids["${threadOrThreads}]`] = archive;
    return await defaultFuncs.post("https://www.facebook.com/ajax/mercury/change_archived_status.php", ctx.jar, form, options)
      .then(parseAndCheckLogin(ctx, defaultFuncs))
      .then(resData => {
        if (resData.error)
          throw resData.error;
        return resData["payload"] == null;
      })
      .catch(err => {
        Log.error("changeArchivedStatus", err);
        throw err;
      })
  }
}
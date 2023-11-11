import parseAndCheckLogin from "../utils/parseCheckAndLogin";
import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "../utils/setOptions";
import getType from "../utils/getType";
import Log from "npmlog";

export default function (defaultFuncs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions) {
  return async function changeArchivedStatus(threadOrThreads: string | string[], archive: boolean) {
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
        return resData
      })
      .catch(err => {
        Log.error("changeArchivedStatus", err);
        throw err;
      })
  }
}
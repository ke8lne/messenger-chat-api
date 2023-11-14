import parseAndCheckLogin from "../utils/parseCheckAndLogin";
import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "../utils/setOptions";
import formatUser from "../utils/formatUser";
import getGUID from "../utils/getGUID";
import Log from "npmlog";
import { User } from "./getFriendsList";

export default function (funcs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions) {
  /**
   * Given the full name or vanity name of a Facebook user, event, page, group or app, the call will perform a Facebook Graph search and return all corresponding IDs (order determined by Facebook).
   * @param name A string being the name of the item you're looking for.
   */
  return async function getUserID(name: string) {
    return await funcs
      .get("https://www.facebook.com/ajax/typeahead/search.php", ctx.jar, {
        value: name.toLowerCase(),
        viewer: ctx.userID,
        rsp: "search",
        context: "search",
        path: "/home.php",
        request_id: getGUID()
      }, options)
      .then(parseAndCheckLogin(ctx, funcs))
      .then(res => {
        if (res.error) throw res;
        return res.payload.entries.map(formatUser) as User;
      })
      .catch(err => {
        Log.error("getUserID", err);
        throw err;
      })
  }
}
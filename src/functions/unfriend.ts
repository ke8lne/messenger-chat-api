import parseAndCheckLogin from "../utils/parseCheckAndLogin";
import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "../utils/setOptions";
import Log from "npmlog";

export default function (funcs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions) {
  return async function unsendMessage(userID: string) {
    const form = {
      uid: userID,
      unref: "bd_friends_tab",
      floc: "friends_tab",
      "nctr[_mod]": "pagelet_timeline_app_collection_" + ctx.userID + ":2356318349:2"
    };
    return await funcs.post("https://www.facebook.com/ajax/profile/removefriendconfirm.php", ctx.jar, form, options)
      .then(parseAndCheckLogin(ctx, funcs))
      .then(res => {
        if (res.error) throw res;
        return res;
      })
      .catch(err => {
        Log.error("unfriend", err);
        throw err;
      })
  }
}
import parseAndCheckLogin from "../utils/parseCheckAndLogin";
import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "../utils/setOptions";
import getType from "../utils/getType";
import Log from "npmlog";

export default function (funcs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions) {
  return async function handleFriendRequest(userID: string, accept: boolean) {
    /**
     * 
     */
    if (getType(accept) !== "Boolean") throw { error: "Please pass a boolean as a second argument." };
    return await funcs
      .post("https://www.facebook.com/requests/friends/ajax/", ctx.jar, {
        viewer_id: userID, // Changed to first parameter. Useless if undo from ctx.userID
        "frefs[0]": "jwl",
        floc: "friend_center_requests",
        ref: "/reqs.php",
        action: (accept ? "confirm" : "reject")
      }, options)
      .then(parseAndCheckLogin(ctx, funcs))
      .then(res => {
        if (res.payload.err) throw { err: res.payload.err };
        return res;
      })
      .catch(err => {
        Log.error("handleFriendRequest", err);
        throw err;
      })
  }
}
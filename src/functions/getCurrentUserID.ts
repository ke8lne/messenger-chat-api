import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "../utils/setOptions";

export default function (defaultFuncs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions) {
  /**
   * Returns the currently logged-in user's Facebook user ID.
   */
  return function getCurrentUserID() {
    return ctx.userID;
  }
}
import parseAndCheckLogin from "../utils/parseCheckAndLogin";
import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "../utils/setOptions";
import Log from "npmlog";

export default function (funcs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions) {
  /**
   * Resolves the url to the full-size photo, given its ID. This function is useful for retrieving the full-size photo URL of image attachments in messages, returned by <API>.getThreadHistory().
   * @param photoID
   */
  return async function resolvePhotoUrl(photoID: string) {
    return await funcs.get("https://www.facebook.com/mercury/attachments/photo", ctx.jar, { photo_id: photoID }, options)
      .then(parseAndCheckLogin(ctx, funcs))
      .then(res => {
        if (res.error) throw res;
        return res.jsmods.require[0][3][0];
      })
      .catch(err => {
        Log.error("resolvePhotoUrl", err);
        throw err;
      })
  }
}
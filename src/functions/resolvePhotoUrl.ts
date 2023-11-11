import parseAndCheckLogin from "../utils/parseCheckAndLogin";
import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "../utils/setOptions";
import Log from "npmlog";

export default function (funcs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions) {
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
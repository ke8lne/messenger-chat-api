import parseAndCheckLogin from "../utils/parseCheckAndLogin";
import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "../utils/setOptions";
import Log from "npmlog";

export default function (funcs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions) {
  return async function getThreadPictures(threadID: string, offset: number = 0, limit: number) {
    return await funcs.post("https://www.facebook.com/ajax/messaging/attachments/sharedphotos.php", ctx.jar, { thread_id: threadID, offset: offset, limit: limit }, options)
      .then(parseAndCheckLogin(ctx, funcs))
      .then(res => {
        if (res.error) throw res;
        return Promise.all(
          res.payload.imagesData.map(async image => {
            return await funcs.post("https://www.facebook.com/ajax/messaging/attachments/sharedphotos.php", ctx.jar, { thread_id: threadID, image_id: image.fbid }, options)
              .then(parseAndCheckLogin(ctx, funcs))
              .then(res => {
                if (res.error) throw res;
                var queryThreadID = res.jsmods.require[0][3][1].query_metadata.query_path[0].message_thread;
                var imageData = res.jsmods.require[0][3][1].query_results[queryThreadID].message_images.edges[0].node.image2;
                return imageData;
              })
          })
        )
      })
      .catch(err => {
        Log.error("Error in getThreadPictures", err);
        throw err;
      })
  }
}
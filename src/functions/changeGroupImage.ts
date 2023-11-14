import { Api, Ctx, DefaultFuncs } from "../Interface";
import generateOfflineThreadingID from "../utils/generateOfflineThreadingID,";
import generateTimestampRelative from "../utils/generateTimestampRelative";
import parseAndCheckLogin from "../utils/parseCheckAndLogin";
import { ApiOptions } from "../utils/setOptions";
import Bluebird from "bluebird";
import Log from "npmlog";

async function handleUpload(image: Buffer, { defaultFuncs, ctx, options }) {
  const _uploads = new Array();
  var form = { images_only: "true", "attachment[]": image };
  _uploads.push(defaultFuncs
    .postFormData("https://upload.facebook.com/ajax/mercury/upload.php", ctx.jar, form, options)
    .then(parseAndCheckLogin(ctx, defaultFuncs))
    .then(resData => {
      if (resData.error) throw resData;
      return resData.payload.metadata[0];
    })
  );
  return await Bluebird.all(_uploads)
    .catch(err => {
      Log.error("handleUpload", err);
      throw err;
    });
}

export default function (defaultFuncs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions) {
  /**
   * Will change the group chat's image to the given image.
   * @param image Buffer Image
   * @param threadID Thread to modify.
   */
  return async function changeGroupImage(image: Buffer, threadID: string): Promise<boolean> {
    const messageAndOTID = generateOfflineThreadingID(), form = {
      client: "mercury",
      action_type: "ma-type:log-message",
      author: "fbid:" + ctx.userID,
      author_email: "",
      ephemeral_ttl_mode: "0",
      is_filtered_content: false,
      is_filtered_content_account: false,
      is_filtered_content_bh: false,
      is_filtered_content_invalid_app: false,
      is_filtered_content_quasar: false,
      is_forward: false,
      is_spoof_warning: false,
      is_unread: false,
      log_message_type: "log:thread-image",
      manual_retry_cnt: "0",
      message_id: messageAndOTID,
      offline_threading_id: messageAndOTID,
      source: "source:chat:web",
      "source_tags[0]": "source:chat",
      status: "0",
      thread_fbid: threadID,
      thread_id: "",
      timestamp: Date.now(),
      timestamp_absolute: "Today",
      timestamp_relative: generateTimestampRelative(),
      timestamp_time_passed: "0"
    };
    let _resUpload = await handleUpload(image, { defaultFuncs, ctx, options });
    form["thread_image_id"] = _resUpload[0]["image_id"];
    form["thread_id"] = threadID;
    return await defaultFuncs.post("https://www.facebook.com/messaging/set_thread_image/", ctx.jar, form, options)
      .then(parseAndCheckLogin(ctx, defaultFuncs))
      .then(resData => {
        if (resData.error)
          throw resData.error;
        return resData["payload"] == null;
      })
      .catch(err => {
        Log.error("changeGroupImage", err);
        throw err;
      })
  }
}

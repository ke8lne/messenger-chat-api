import generateOfflineThreadingID from "../utils/generateOfflineThreadingID,";
import generateTimestampRelative from "../utils/generateTimestampRelative";
import generateThreadingID from "../utils/generateThreadingID";
import parseAndCheckLogin from "../utils/parseCheckAndLogin";
import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "../utils/setOptions";
import Log from "npmlog";

export default function (funcs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions) {
  return async function setTitle(newTitle: string, threadID: string) {
    const messageAndOTID = generateOfflineThreadingID(),
      form = {
        client: "mercury",
        action_type: "ma-type:log-message",
        author: "fbid:" + ctx.userID,
        author_email: "",
        coordinates: "",
        timestamp: Date.now(),
        timestamp_absolute: "Today",
        timestamp_relative: generateTimestampRelative(),
        timestamp_time_passed: "0",
        is_unread: false,
        is_cleared: false,
        is_forward: false,
        is_filtered_content: false,
        is_spoof_warning: false,
        source: "source:chat:web",
        "source_tags[0]": "source:chat",
        status: "0",
        offline_threading_id: messageAndOTID,
        message_id: messageAndOTID,
        threading_id: generateThreadingID(ctx.clientID),
        manual_retry_cnt: "0",
        thread_fbid: threadID,
        thread_name: newTitle,
        thread_id: threadID,
        log_message_type: "log:thread-name"
      };

    return await funcs
      .post("https://www.facebook.com/messaging/set_thread_name/", ctx.jar, form, options)
      .then(parseAndCheckLogin(ctx, funcs))
      .then(res => {
        if (res.error && res.error === 1545012)
          throw { error: "Cannot change chat title: Not member of chat." };
        if (res.error && res.error === 1545003)
          throw { error: "Cannot set title of single-user chat." };
        if (res.error) throw res;
        return res;
      })
      .catch(err => {
        Log.error("setTitle", err);
        throw err;
      })
  }
}
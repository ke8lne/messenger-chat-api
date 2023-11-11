import generateOfflineThreadingID from "../utils/generateOfflineThreadingID,";
import generateTimestampRelative from "../utils/generateTimestampRelative";
import generateThreadingID from "../utils/generateThreadingID";
import parseAndCheckLogin from "../utils/parseCheckAndLogin";
import { ApiOptions } from "../utils/setOptions";
import getType from "../utils/getType";
import Log from "npmlog";

export default function (defaultFuncs: Record<string, any>, api: Record<string, any>, ctx: Record<string, any>, options: ApiOptions) {
  return async function addUser(userID: string | string[], threadID: string): Promise<void> {
    if (getType(threadID) !== "Number" && getType(threadID) !== "String")
      throw { error: `ThreadID should be of type Number or String and not ${getType(threadID)}.` };
    if (getType(userID) !== "Array")
      userID = [userID] as string[];
    const messageAndOTID = generateOfflineThreadingID(), form = {
      client: "mercury",
      action_type: "ma-type:log-message",
      author: "fbid:" + ctx.userID,
      thread_id: "",
      timestamp: Date.now(),
      timestamp_absolute: "Today",
      timestamp_relative: generateTimestampRelative(),
      timestamp_time_passed: "0",
      is_unread: false,
      is_cleared: false,
      is_forward: false,
      is_filtered_content: false,
      is_filtered_content_bh: false,
      is_filtered_content_account: false,
      is_spoof_warning: false,
      source: "source:chat:web",
      "source_tags[0]": "source:chat",
      log_message_type: "log:subscribe",
      status: "0",
      offline_threading_id: messageAndOTID,
      message_id: messageAndOTID,
      threading_id: generateThreadingID(ctx.clientID),
      manual_retry_cnt: "0",
      thread_fbid: threadID
    };
    for (var i = 0; i < userID.length; i++) {
      if (getType(userID[i]) !== "Number" && getType(userID[i]) !== "String")
        throw { error: `Elements of userID should be of type Number or String and not ${getType(userID[i])}` };
      form[`log_message_data[added_participants]["${i}"]`] = `fbid:${userID[i]}`;
    }
    return await defaultFuncs.post("https://www.facebook.com/messaging/send/", ctx.jar, form, options)
      .then(parseAndCheckLogin(ctx, defaultFuncs))
      .then(resData => {
        if (!resData) throw { error: "Failed to add user to the thread." };
        if (resData.error) throw resData.error;
        return resData;
      })
      .catch(err => {
        Log.error(__filename, err);
        throw err;
      })
  }
}
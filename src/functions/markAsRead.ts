import parseAndCheckLogin from "../utils/parseCheckAndLogin";
import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "../utils/setOptions";
import { saveCookies } from "../utils/cookies";
import getType from "../utils/getType";
import Log from "npmlog";

export default function (funcs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions) {
  /**
   * Mark all the unread messages in a thread as read. Facebook will take a couple of seconds to show that you've read the messages.
   * Using this function automatically will make your account getting banned especially when receiving HUGE amount of messages.
   * @param threadID Thread to target.
   * @param read Set to false will unmark as read the message.
   */
  return async function markAsRead(threadID: string, read = true) {
    if (typeof ctx.globalOptions.pageID !== 'undefined') {
      return await funcs.post("https://www.facebook.com/ajax/mercury/change_read_status.php", ctx.jar, {
        source: "PagesManagerMessagesInterface",
        request_user_id: ctx.globalOptions.pageID,
        watermarkTimestamp: new Date().getTime(),
        shouldSendReadReceipt: true,
        commerce_last_message_type: '',
        [`ids[${threadID}]`]: read
      }, options)
        .then(saveCookies(ctx.jar))
        .then(parseAndCheckLogin(ctx, funcs))
        .then(resData => resData["payload"] == null)
        .catch(err => {
          Log.error("markAsRead", err);
          if (getType(err) == "Object" && err.error === "Not logged in.") ctx.loggedIn = false;
          throw err;
        });
    }
    else {
      if (ctx.mqttClient)
        ctx.mqttClient.publish("/mark_thread", JSON.stringify({ threadID, mark: "read", state: read }), { qos: 1, retain: false }, (err) => {
          if (err) throw err;
          return true;
        });
      else throw { error: "Mqtt Client is missing. Initialize a client first before using this." };
    }
  }
}
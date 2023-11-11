import parseAndCheckLogin from "../utils/parseCheckAndLogin";
import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "../utils/setOptions";
import { saveCookies } from "../utils/cookies";
import getType from "../utils/getType";
import Log from "npmlog";

export default function (funcs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions) {
  return async function markAsRead(threadID: string, read = true) {
    if (typeof ctx.globalOptions.pageID !== 'undefined') {
      const form = {
        source: "PagesManagerMessagesInterface",
        request_user_id: ctx.globalOptions.pageID,
        watermarkTimestamp: new Date().getTime(),
        shouldSendReadReceipt: true,
        commerce_last_message_type: ''
      };
      form[`ids[${threadID}]`] = read;
      return await funcs.post("https://www.facebook.com/ajax/mercury/change_read_status.php", ctx.jar, form, options)
        .then(saveCookies(ctx.jar))
        .then(parseAndCheckLogin(ctx, funcs))
        .catch(err => {
          Log.error("markAsRead", err);
          if (getType(err) == "Object" && err.error === "Not logged in.") ctx.loggedIn = false;
          throw err;
        });
    }
    else {
      if (ctx.mqttClient)
        ctx.mqttClient.publish("/mark_thread", JSON.stringify({ threadID, mark: "read", state: read }), { qos: 1, retain: false }, (err) => {
          if (err) throw err
        });
      else throw { error: "You can only use this function after you start listening." };
    }
  }
}
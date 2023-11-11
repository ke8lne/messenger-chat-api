import parseAndCheckLogin from "../utils/parseCheckAndLogin";
import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "../utils/setOptions";
import getType from "../utils/getType";
import Log from "npmlog";

export default function (defaultFuncs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions) {
  return async function deleteMessage(messageOrMessages: string | string[]) {
    if (getType(messageOrMessages) !== "Array") messageOrMessages = [messageOrMessages] as string[];
    const form = { client: "mercury" };
    for (var i = 0; i < messageOrMessages.length; i++)
      form[`message_ids[${i}]`] = messageOrMessages[i];
    return await defaultFuncs.post("https://www.facebook.com/ajax/mercury/delete_messages.php", ctx.jar, form, options)
      .then(parseAndCheckLogin(ctx, defaultFuncs))
      .then(resData => {
        if (resData.error) throw resData;
        return resData;
      })
      .catch(err => {
        Log.error("deleteMessage", err);
        throw err;
      })
  }
}
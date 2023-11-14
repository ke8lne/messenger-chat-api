import parseAndCheckLogin from "../utils/parseCheckAndLogin";
import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "../utils/setOptions";
import getType from "../utils/getType";
import Log from "npmlog";

export default function (funcs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions) {
  return async function sendTypingIndicator(typing: boolean, threadID: string, isGroup?: boolean) {
    const form = {
      typ: +typing,
      to: '',
      source: "mercury-chat",
      thread: threadID
    };

    if (getType(isGroup) == "Boolean") {
      if (!isGroup) form.to = threadID;
      return await funcs
        .post("https://www.facebook.com/ajax/messaging/typ.php", ctx.jar, form, options)
        .then(parseAndCheckLogin(ctx, funcs))
        .then(res => {
          if (res.error) throw res;
          return res;
        })
        .catch(err => {
          Log.error("sendTypingIndicator", err);
          if (getType(err) == "Object" && err.error === "Not logged in") ctx.loggedIn = false;
          throw err;
        });
    }
    else {
      const user = await api.getUserInfo(threadID);
      if (Object.keys(user).length > 0) form.to = threadID;
      return await funcs
        .post("https://www.facebook.com/ajax/messaging/typ.php", ctx.jar, form, options)
        .then(parseAndCheckLogin(ctx, funcs))
        .then(res => {
          if (res.error) throw res;
          return res;
        })
        .catch(err => {
          Log.error("sendTypingIndicator", err);
          if (getType(err) == "Object" && err.error === "Not logged in.") ctx.loggedIn = false;
          throw err;
        })
    }
  }
}
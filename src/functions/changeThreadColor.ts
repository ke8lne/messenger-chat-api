import parseAndCheckLogin from "../utils/parseCheckAndLogin";
import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "../utils/setOptions";
import Log from "npmlog";

export default function (defaultFuncs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions) {
  return async function changeThreadColor(color: string, threadID: string) {
    const validatedColor = color !== null ? color.toLowerCase() : color;
    const colorList = Object.keys(api.threadColors).map(name => api.threadColors[name]);
    if (!colorList.includes(validatedColor))
      throw { error: "The color you are trying to use is not a valid thread color. Use api.threadColors to find acceptable values." };
    return await defaultFuncs.post("https://www.facebook.com/messaging/save_thread_color/?source=thread_settings&dpr=1", ctx.jar, { color_choice: validatedColor, thread_or_other_fbid: threadID }, options)
      .then(parseAndCheckLogin(ctx, defaultFuncs))
      .then(resData => {
        if (resData.error === 1357031)
          throw { error: "Trying to change colors of a chat that doesn't exist. Have at least one message in the thread before trying to change the colors." };
        if (resData.error) throw resData;
        return resData
      })
      .catch(err => {
        Log.error("changeThreadColor", err);
        throw err;
      })
  }
}
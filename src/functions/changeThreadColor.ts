import parseAndCheckLogin from "../utils/parseCheckAndLogin";
import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "../utils/setOptions";
import Log from "npmlog";
import { Colors } from "../utils/Colors";

export default function (defaultFuncs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions) {
  /**
   * Will change the thread color to the given color name.
   * @param color Color name to set.
   * @param threadID Thread to modify.
   */
  return async function changeThreadColor(color: string, threadID: string): Promise<boolean> {
    const validatedColor = Object.entries(Colors).find(_e => _e[0] === color);
    if (!validatedColor)
      throw { error: "The color you are trying to use is not a valid thread color. Use api.threadColors to find acceptable values." };
    return await defaultFuncs.post("https://www.facebook.com/messaging/save_thread_color/?source=thread_settings&dpr=1", ctx.jar, { color_choice: validatedColor[1].theme_color.toLowerCase(), thread_or_other_fbid: threadID }, options)
      .then(parseAndCheckLogin(ctx, defaultFuncs))
      .then(resData => {
        if (resData.error === 1357031)
          throw { error: "Trying to change colors of a chat that doesn't exist. Have at least one message in the thread before trying to change the colors." };
        if (resData.error) throw resData;
        return resData["payload"] == null;
      })
      .catch(err => {
        Log.error("changeThreadColor", err);
        throw err;
      })
  }
}
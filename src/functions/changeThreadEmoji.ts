import parseAndCheckLogin from "../utils/parseCheckAndLogin";
import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "../utils/setOptions";
import Log from "npmlog";

export default function (defaultFuncs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions) {
  /**
   * Will change the thread emoji to the one provided.
   * Note: The UI doesn't play nice with all emoji.
   * @param emoji String containing a single emoji character.
   * @param threadID String representing the ID of the thread.
   */
  return async function changeThreadEmoji(emoji: string, threadID: string): Promise<boolean> {
    return await defaultFuncs
      .post("https://www.facebook.com/messaging/save_thread_emoji/?source=thread_settings&__pc=EXP1%3Amessengerdotcom_pkg", ctx.jar, { emoji_choice: emoji, thread_or_other_fbid: threadID }, options)
      .then(parseAndCheckLogin(ctx, defaultFuncs))
      .then(resData => {
        if (resData.error === 1357031)
          throw { error: "Trying to change emoji of a chat that doesn't exist. Have at least one message in the thread before trying to change the emoji." };
        if (resData.error) throw resData;
        return resData["payload"] == null;
      })
      .catch(err => {
        Log.error("changeThreadEmoji", err);
        throw err;
      })
  }
}
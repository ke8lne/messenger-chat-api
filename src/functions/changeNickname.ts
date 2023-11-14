import parseAndCheckLogin from "../utils/parseCheckAndLogin";
import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "../utils/setOptions";
import Log from "npmlog";

export default function (defaultFuncs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions) {
  /**
   * Will change the thread user nickname to the one provided.
   * @param nickname Value to set.
   * @param threadID Thread to modify.
   * @param participantID User to modify inside the thread.
   */
  return async function changeNickname(nickname: string, threadID: string, participantID: string): Promise<boolean> {
    return await defaultFuncs
      .post("https://www.facebook.com/messaging/save_thread_nickname/?source=thread_settings&dpr=1", ctx.jar, { nickname: nickname, participant_id: participantID, thread_or_other_fbid: threadID }, options)
      .then(parseAndCheckLogin(ctx, defaultFuncs))
      .then(resData => {
        if (resData.error === 1545014) throw { error: "Trying to change nickname of user is not in the thread." };
        if (resData.error === 1357031)
          throw { error: "Trying to change user nickname of a thread that doesn't exist. Have at least one message in the thread before trying to change the user nickname." };
        if (resData.error) throw resData;
        return resData["payload"] == null;
      })
      .catch(err => {
        Log.error("changeNickname", err);
        throw err;
      })
  }
}
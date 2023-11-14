import parseAndCheckLogin from "../utils/parseCheckAndLogin";
import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "../utils/setOptions";
import Log from "npmlog";

export default function (funcs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions) {
  /**
   * Creates a poll with the specified title and optional poll options, which can also be initially selected by the logged-in user.
   * @param title Title for the poll.
   * @param threadID Thread to publish the poll.
   * @param pollOptions An optional string-boolean object to specify initial poll options and their initial states (selected/not selected), respectively. Example: { "Option 1": false }.
   */
  return async function createPoll(title: string, threadID: string, pollOptions: Record<string, boolean> = {}): Promise<boolean> {
    const form = { target_id: threadID, question_text: title };
    let _i = 0;
    for (let opt in pollOptions) {
      if (pollOptions.hasOwnProperty(opt)) {
        form["option_text_array[" + _i + "]"] = opt;
        form[`option_is_selected_array["${_i}]"]`] = options[opt] ? "1" : "0";
        _i++;
      }
    }
    return await funcs.post("https://www.facebook.com/messaging/group_polling/create_poll/?dpr=1", ctx.jar, form, options)
      .then(parseAndCheckLogin(ctx, funcs))
      .then(res => res.payload.status == "success")
      .catch(err => {
        Log.error("createPoll", err);
        throw err;
      })
  }
}
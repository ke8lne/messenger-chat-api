import parseAndCheckLogin from "../utils/parseCheckAndLogin";
import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "../utils/setOptions";
import Log from "npmlog";

export default function (funcs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions) {
  return async function createPoll(title: string, threadID: string, options: Record<string, any> = {}) {
    const form = { target_id: threadID, question_text: title };
    let _i = 0;
    for (let opt in options) {
      if (options.hasOwnProperty(opt)) {
        form["option_text_array[" + _i + "]"] = opt;
        form[`option_is_selected_array["${_i}]"]`] = options[opt] ? "1" : "0";
        _i++;
      }
    }
    return await funcs.post("https://www.facebook.com/messaging/group_polling/create_poll/?dpr=1", ctx.jar, form, options)
      .then(parseAndCheckLogin(ctx, funcs))
      .then(res => {
        if (res.payload.status != "success") throw res;
        return res;
      })
      .catch(err => {
        Log.error("createPoll", err);
        throw err;
      })
  }
}
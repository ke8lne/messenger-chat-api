import parseAndCheckLogin from "../utils/parseCheckAndLogin";
import { ApiOptions } from "../utils/setOptions";
import { saveCookies } from "../utils/cookies";
import Log from "npmlog";
import { Api, Ctx, DefaultFuncs } from "../Interface";

export default function (defaultFuncs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions) {
  /**
   * @param userID User ID
   * @param block Blocks the user if true
   */
  return async function changeBlockedStatus(userID: string, block: boolean) {
    if (block)
      return await defaultFuncs.post(`https://www.facebook.com/nfx/block_messages/?thread_fbid=${userID}&location=www_chat_head`, ctx.jar, undefined, options)
        .then(saveCookies(ctx.jar))
        .then(parseAndCheckLogin(ctx, defaultFuncs))
        .then(resData => {
          if (resData.error) throw resData;
          defaultFuncs.post("https://www.facebook.com" + /action="(.+?)"+?/
            .exec(resData.jsmods.markup[0][1].__html)[1]
            .replace(/&amp;/g, "&"), ctx.jar, undefined, options
          )
            .then(saveCookies(ctx.jar))
            .then(parseAndCheckLogin(ctx, defaultFuncs))
            .then(_resData => {
              if (_resData.error) throw _resData;
              return resData;
            });
        })
        .catch(err => {
          Log.error(__filename, err);
          throw err;
        });
    else
      return await defaultFuncs
        .post(`https://www.facebook.com/ajax/nfx/messenger_undo_block.php?story_location=messenger&context=%7B%22reportable_ent_token%22%3A%22${userID}%22%2C%22initial_action_name%22%3A%22BLOCK_MESSAGES%22%7D&`, ctx.jar, undefined, options)
        .then(saveCookies(ctx.jar))
        .then(parseAndCheckLogin(ctx, defaultFuncs))
        .then(resData => {
          if (resData.error) throw resData;
          return resData;
        })
        .catch(err => {
          Log.error(__filename, err);
          throw err;
        })
  }
}

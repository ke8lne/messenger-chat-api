import parseAndCheckLogin from "../utils/parseCheckAndLogin";
import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "../utils/setOptions";
import { saveCookies } from "../utils/cookies";
import getFrom from "../utils/getForm";
import Log from "npmlog"

export default function (funcs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions) {
  /**
   * Logs out the current user.
   */
  return async function logout() {
    return await funcs.post("https://www.facebook.com/bluebar/modern_settings_menu/?help_type=364455653583099&show_contextual_help=1", ctx.jar, { pmid: "0" }, options)
      .then(parseAndCheckLogin(ctx, funcs))
      .then(async res => {
        const elem = res.jsmods.instances[0][2][0].find(v => v.value === "logout"), html = res.jsmods.markup.find(v => v[0] === elem.markup.__m)[1].__html;
        return await funcs
          .post("https://www.facebook.com/logout.php", ctx.jar, {
            fb_dtsg: getFrom(html, '"fb_dtsg" value="', '"'),
            ref: getFrom(html, '"ref" value="', '"'),
            h: getFrom(html, '"h" value="', '"')
          }, options)
          .then(saveCookies(ctx.jar));
      })
      .then(async res => {
        if (!res.headers) throw { error: "An error occurred when logging out." };
        return await funcs.get(res.headers.location, ctx.jar).then(saveCookies(ctx.jar));
      })
      .then(() => {
        ctx.loggedIn = false;
        Log.info("logout", "Logged out successfully.");
        return true;
      })
      .catch(err => {
        Log.error("logout", err);
        throw err;
      })
  }
}
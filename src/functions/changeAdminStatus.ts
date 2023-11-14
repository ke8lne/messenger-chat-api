import parseAndCheckLogin from "../utils/parseCheckAndLogin";
import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "../utils/setOptions";
import getType from "../utils/getType";
import Log from "npmlog";

export default function (defaultFuncs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions) {
  /**
   * Sets the admin status of the user(s) either true as admin and false as not. Current user must be an admin to perform this.
   * @param threadID Thread to modify.
   * @param adminIDs Users to modify. Must be in the thread.
   * @param adminStatus Sets as admin if true.
   * @returns result
   */
  return async function changeAdminStatus(threadID: string, adminIDs: string | string[], adminStatus: boolean): Promise<boolean> {
    if (getType(threadID) !== "String") throw { error: "changeAdminStatus: threadID must be a string" };
    if (getType(adminIDs) === "String") adminIDs = [adminIDs] as string[];
    if (getType(adminIDs) !== "Array") throw { error: "changeAdminStatus: adminIDs must be an array or string" };
    if (getType(adminStatus) !== "Boolean") throw { error: "changeAdminStatus: adminStatus must be a string" };
    let form = { "thread_fbid": threadID };
    let i = 0;
    for (let u of adminIDs)
      form[`admin_ids[${i++}]`] = u
    form["add"] = adminStatus;
    return await defaultFuncs.post("https://www.facebook.com/messaging/save_admins/?dpr=1", ctx.jar, form, options)
      .then(parseAndCheckLogin(ctx, defaultFuncs))
      .then(resData => {
        if (resData.error) {
          switch (resData.error) {
            case 1976004:
              throw { error: "Cannot alter admin status: You are not an admin.", rawResponse: resData };
            case 1357031:
              throw { error: "Cannot alter admin status: This thread is not a group chat.", rawResponse: resData };
            default:
              throw { error: "Cannot alter admin status: Unknown error.", rawResponse: resData };
          }
        }
        return resData["payload"] == null;
      })
      .catch(err => {
        Log.error(__filename, err);
        throw err;
      })
  }
}
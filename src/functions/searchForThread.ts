import parseAndCheckLogin from "../utils/parseCheckAndLogin";
import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "../utils/setOptions";
import { formatThread } from "../utils/format";

export default function (funcs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions) {
  /**
   * @deprecated
   * Takes a chat title (thread name) and returns matching results as a formatted threads array (ordered according to Facebook).
   * @param nameOrID A messageID string or messageID string array
   */
  return async function searchForThread(nameOrID: string) {
    return await funcs
      .post("https://www.facebook.com/ajax/mercury/search_threads.php", ctx.jar,
        {
          client: "web_messenger",
          query: nameOrID,
          offset: 0,
          limit: 21,
          index: "fbid"
        }, options)
      .then(parseAndCheckLogin(ctx, funcs))
      .then(res => {
        if (res.error) throw res;
        if (!res.payload.mercury_payload.threads)
          return { error: `Could not find thread "${name}".` };
        return res.payload.mercury_payload.threads.map(formatThread);
      })
  }
}
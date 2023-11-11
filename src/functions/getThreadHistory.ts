import { formatMessagesGraphQLResponse } from "../utils/formatMessage";
import parseAndCheckLogin from "../utils/parseCheckAndLogin";
import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "../utils/setOptions";
import Log from "npmlog";

export default function (funcs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions) {
  return async function getThreadHistoryGraphQL(threadID: string, amount: number, timestamp?: number) {
    return await funcs
      .post("https://www.facebook.com/api/graphqlbatch/", ctx.jar, {
        "av": ctx.globalOptions.pageID,
        queries: JSON.stringify({
          o0: {
            doc_id: "1498317363570230",
            query_params: {
              id: threadID,
              message_limit: amount,
              load_messages: 1,
              load_read_receipts: false,
              before: timestamp
            }
          }
        })
      }, options)
      .then(parseAndCheckLogin(ctx, funcs))
      .then(res => {
        if (res.error) throw res;
        if (res[res.length - 1].error_results !== 0) throw new Error("There was an error_result.");
        return formatMessagesGraphQLResponse(res[0]);
      })
      .catch(err => {
        Log.error("getThreadHistoryGraphQL", err);
        return err;
      })
  }
}
import { formatMessagesGraphQLResponse } from "../utils/formatMessage";
import parseAndCheckLogin from "../utils/parseCheckAndLogin";
import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "../utils/setOptions";
import { Message } from "./sendMessage";
import Log from "npmlog";

export default function (funcs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions) {
  /**
   * Takes a threadID, number of messages, a timestamp, and a callback.
   * Note: If you're getting a 500 error, it's possible that you're requesting too many messages. Try reducing that number and see if that works.
   * 
   * To load 50 messages at a time, we can use undefined as the timestamp to retrieve the most recent messages and use the timestamp of the earliest message to load the next 50.
   * @param threadID Thread to obtain.
   * @param amount Number of messages to retrieve including system messages.
   * @param timestamp Used to described the time of the most recent message to load. If timestamp is not specified, facebook will load the most recent messages.
   */
  return async function getThreadHistoryGraphQL(threadID: string, amount: number, timestamp?: number): Promise<Message[]> {
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
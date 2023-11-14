import parseAndCheckLogin from "../utils/parseCheckAndLogin";
import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "../utils/setOptions";
import { formatMessage } from "../utils/format";
import { Message } from "./sendMessage";
import Log from "npmlog";

function parseDelta(threadID: string, delta: Record<string, any>) {
	if (delta.replied_to_message)
		return Object.assign({ type: "message_reply" }, formatMessage(threadID, delta), { messageReply: formatMessage(threadID, delta.replied_to_message.message) });
	else return formatMessage(threadID, delta);
}


export default function (funcs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions) {
	/**
	 * Fetches the messageID from the given thread.
	 * @param threadID Thread to target.
	 * @param messageID Message to fetch.
	 */
	return async function getMessage(threadID: string, messageID: string): Promise<Message> {
		if (typeof threadID !== "string" || typeof messageID !== "string") throw ({ error: "getMessage: need threadID and messageID" });
		return await funcs
			.post("https://www.facebook.com/api/graphqlbatch/", ctx.jar, {
				"av": ctx.globalOptions.pageID,
				"queries": JSON.stringify({
					"o0": {
						"doc_id": "1768656253222505",
						"query_params": { "thread_and_message_id": { "thread_id": threadID, "message_id": messageID } }
					}
				})
			}, options)
			.then(parseAndCheckLogin(ctx, funcs))
			.then(res => {
				if (res[res.length - 1].error_results > 0) throw res[0].o0.errors;
				if (res[res.length - 1].successful_results === 0) throw { error: "getMessage: there was no successful_results", res: res };
				const fetchData = res[0].o0.data.message;
				if (fetchData) return parseDelta(threadID, fetchData);
				else throw fetchData;
			})
			.catch(err => {
				Log.error("getMessage", err);
				throw err;
			})
	}
}
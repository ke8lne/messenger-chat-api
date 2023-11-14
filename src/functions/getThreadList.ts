import parseAndCheckLogin from "../utils/parseCheckAndLogin";
import { Thread, formatThreadList } from "../utils/formatThread";
import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "../utils/setOptions";
import getType from "../utils/getType";
import Log from "npmlog";

export enum ThreadTags {
	Inbox = "INBOX",
	Archived = "ARCHIVED",
	Pending = "PENDING",
	Other = "OTHER"
}

export default function (funcs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions) {
	/**
	 * Returns information about the user's threads.
	 * @param limit Limit the number of threads to fetch.
	 * @param timestamp Request threads before this date. If unspecified, most recent threads will be fetched.
	 * @param {ThreadTags} tag Describes what thread to fetch. See <ThreadTags>.
	 * @param unreadTag Specifies the function to fetch only unread threads with the tag.
	 */
	return async function getThreadList(limit: number, timestamp: number = null, tag: ThreadTags = ThreadTags.Inbox, unreadTag = false) {
		if (getType(limit) !== "Number" || !Number.isInteger(limit) || limit <= 0)
			throw { error: "getThreadList: limit must be a positive integer" };
		if (getType(timestamp) !== "Null" && (getType(timestamp) !== "Number" || !Number.isInteger(timestamp)))
			throw { error: "getThreadList: timestamp must be an integer or null" };
		return await funcs
			.post("https://www.facebook.com/api/graphqlbatch/", ctx.jar, {
				"av": ctx.globalOptions.pageID,
				"queries": JSON.stringify({
					"o0": {
						// This doc_id was valid on 2020-07-20
						"doc_id": "3336396659757871",
						"query_params": {
							"limit": limit + (timestamp ? 1 : 0),
							"before": timestamp,
							"tags": unreadTag ? [tag, "unread"] : [tag],
							"includeDeliveryReceipts": true,
							"includeSeqID": false
						}
					}
				}),
				"batch_name": "MessengerGraphQLThreadlistFetcher"
			}, options)
			.then(parseAndCheckLogin(ctx, funcs))
			.then(res => {
				if (res[res.length - 1].error_results > 0) throw res[0].o0.errors;
				if (res[res.length - 1].successful_results === 0) throw { error: "getThreadList: there was no successful_results", res };
				if (timestamp) res[0].o0.data.viewer.message_threads.nodes.shift();
				return formatThreadList(res[0].o0.data.viewer.message_threads.nodes) as Thread[];
			})
			.catch(err => {
				Log.error("getThreadList", err);
				throw err;
			})
	}
}
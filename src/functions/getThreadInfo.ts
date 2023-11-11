import { formatThreadGraphQLResponse } from "../utils/formatThread";
import parseAndCheckLogin from "../utils/parseCheckAndLogin";
import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "../utils/setOptions";
import Log from "npmlog";

export default function (funcs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions) {
	return async function getThreadInfo(threadID: string[]) {
		let form = {};
		threadID.forEach((threadID, i) => form["o" + i] = {
			doc_id: "3449967031715030",
			query_params: {
				id: threadID,
				message_limit: 0,
				load_messages: false,
				load_read_receipts: false,
				before: null
			}
		})
		form = { queries: JSON.stringify(form), batch_name: "MessengerGraphQLThreadFetcher" };
		return await funcs.post("https://www.facebook.com/api/graphqlbatch/", ctx.jar, form, options)
			.then(parseAndCheckLogin(ctx, funcs))
			.then(res => {
				if (res.error) throw res;
				const threadInfos = {};
				for (let i = res.length - 2; i >= 0; i--) {
					const threadInfo = formatThreadGraphQLResponse(res[i][Object.keys(res[i])[0]].data);
					threadInfos[threadInfo?.threadID || threadID[threadID.length - 1 - i]] = threadInfo;
				}
				if (Object.values(threadInfos).length == 1) return Object.values(threadInfos)[0];
				else return threadInfos;
			})
			.catch(err => {
				Log.error("getThreadInfoGraphQL", err);
				throw err;
			})
	}
}

import parseAndCheckLogin from "../utils/parseCheckAndLogin";
import { Api, Ctx, DefaultFuncs } from "../Interface";
import { formatPostReaction } from "../utils/format";
import { ApiOptions } from "../utils/setOptions";
import getType from "../utils/getType";
import Log from "npmlog";

export default function (funcs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions) {
  return async function setPostReaction(postID: string, type: string | number) {
    const map = {
      unlike: 0,
      like: 1,
      heart: 2,
      love: 16,
      haha: 4,
      wow: 3,
      sad: 7,
      angry: 8
    }
    if (getType(type) !== "Number" && getType(type) === "String")
      type = map[String(type).toLowerCase()];
    if (getType(type) !== "Number" && getType(type) !== "String")
      throw { error: "setPostReaction: Invalid reaction type" };
    if (type != 0 && !type)
      throw { error: "setPostReaction: Invalid reaction type" };

    const form = {
      av: ctx.userID,
      fb_api_caller_class: "RelayModern",
      fb_api_req_friendly_name: "CometUFIFeedbackReactMutation",
      doc_id: "4769042373179384",
      variables: JSON.stringify({
        input: {
          actor_id: ctx.userID,
          feedback_id: (new Buffer("feedback:" + postID)).toString("base64"),
          feedback_reaction: type,
          feedback_source: "OBJECT",
          is_tracking_encrypted: true,
          tracking: [],
          session_id: "f7dd50dd-db6e-4598-8cd9-561d5002b423",
          client_mutation_id: Math.round(Math.random() * 19).toString()
        },
        useDefaultActor: false,
        scale: 3
      })
    };

    return await funcs.post("https://www.facebook.com/api/graphql/", ctx.jar, form, options)
      .then(parseAndCheckLogin(ctx, funcs))
      .then(res => {
        if (res.error) throw res;
        return formatPostReaction(res.data);
      })
      .catch(err => {
        Log.error("setPostReaction", err);
        throw err;
      })
  }
}
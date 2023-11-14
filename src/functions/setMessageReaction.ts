import parseAndCheckLogin from "../utils/parseCheckAndLogin";
import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "../utils/setOptions";
import Log from "npmlog";

export default function (funcs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions) {
  /**
   * Sets reaction on message.
   * @param reaction A string containing either an emoji, an emoji in unicode, or an emoji shortcut. The string can be undefined in order to remove a reaction.
   * @param messageID Message to modify.
   */
  return async function setMessageReaction(reaction: string, messageID: string) {
    const vars = {
      data: {
        client_mutation_id: ctx.clientMutationId++,
        actor_id: ctx.userID,
        action: reaction == "" ? "REMOVE_REACTION" : "ADD_REACTION",
        message_id: messageID,
        reaction: reaction
      }
    }, qs = { doc_id: "1491398900900362", variables: JSON.stringify(vars), dpr: 1 };
    return await funcs.postFormData("https://www.facebook.com/webgraphql/mutation/", ctx.jar, {}, qs)
      .then(parseAndCheckLogin(ctx.jar, funcs))
      .then(res => {
        if (!res) throw { error: "setReaction returned empty object." };
        if (res.error) throw res;
        return res;
      })
      .catch(err => {
        Log.error("setReaction", err);
        throw err;
      });
  }
}


export function formatReaction(reaction: string, forceReaction?: boolean) {
  switch (reaction) {
    case "\uD83D\uDE0D": //:heart_eyes:
    case "\uD83D\uDE06": //:laughing:
    case "\uD83D\uDE2E": //:open_mouth:
    case "\uD83D\uDE22": //:cry:
    case "\uD83D\uDE20": //:angry:
    case "\uD83D\uDC4D": //:thumbsup:
    case "\uD83D\uDC4E": //:thumbsdown:
    case "\u2764": //:heart:
    case "\uD83D\uDC97": //:glowingheart:
    case "":
      //valid
      break;
    case ":heart_eyes:":
    case ":love:":
      reaction = "\uD83D\uDE0D";
      break;
    case ":laughing:":
    case ":haha:":
      reaction = "\uD83D\uDE06";
      break;
    case ":open_mouth:":
    case ":wow:":
      reaction = "\uD83D\uDE2E";
      break;
    case ":cry:":
    case ":sad:":
      reaction = "\uD83D\uDE22";
      break;
    case ":angry:":
      reaction = "\uD83D\uDE20";
      break;
    case ":thumbsup:":
    case ":like:":
      reaction = "\uD83D\uDC4D";
      break;
    case ":thumbsdown:":
    case ":dislike:":
      reaction = "\uD83D\uDC4E";
      break;
    case ":heart:":
      reaction = "\u2764";
      break;
    case ":glowingheart:":
      reaction = "\uD83D\uDC97";
      break;
    default:
      if (forceReaction) break;
      throw { error: "Reaction is not a valid emoji." };
  }
}
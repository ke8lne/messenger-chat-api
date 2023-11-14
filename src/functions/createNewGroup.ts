import parseAndCheckLogin from "../utils/parseCheckAndLogin";
import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "../utils/setOptions";
import getType from "../utils/getType";
import Log from "npmlog";

export default function (defaultFuncs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions) {
     /**
      * Create a new group chat.
      * @param participantIDs An array containing participant IDs. (Length must be >= 2)
      * @param groupTitle The title of the new group chat.
      * @returns Created threadID. 
      */
     return async function createNewGroup(participantIDs: string[], groupTitle?: string): Promise<string> {
          if (getType(participantIDs) !== "Array") throw { error: "createNewGroup: participantIDs should be an array." };
          if (participantIDs.length < 2) throw { error: "createNewGroup: participantIDs should have at least 2 IDs." };
          var pids = [];
          for (var n in participantIDs)
               pids.push({ fbid: participantIDs[n] });
          pids.push({ fbid: ctx.userID });
          return await defaultFuncs
               .post("https://www.facebook.com/api/graphql/", ctx.jar, {
                    fb_api_caller_class: "RelayModern",
                    fb_api_req_friendly_name: "MessengerGroupCreateMutation",
                    av: ctx.userID,
                    doc_id: "577041672419534",
                    variables: JSON.stringify({
                         input: {
                              entry_point: "jewel_new_group",
                              actor_id: ctx.userID,
                              participants: pids,
                              client_mutation_id: Math.round(Math.random() * 1024).toString(),
                              thread_settings: {
                                   name: groupTitle,
                                   joinable_mode: "PRIVATE",
                                   thread_image_fbid: null
                              }
                         }
                    })
               }, options)
               .then(parseAndCheckLogin(ctx, defaultFuncs))
               .then(resData => {
                    if (resData.errors) throw resData;
                    return resData.data.messenger_group_thread_create.thread.thread_key.thread_fbid
               })
               .catch(err => {
                    Log.error("createNewGroup", err);
                    throw err;
               })
     }
}
import parseAndCheckLogin from "../utils/parseCheckAndLogin";
import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "../utils/setOptions";
import getType from "../utils/getType";
import Log from "npmlog";

export default function (defaultFuncs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions) {
  /**
   * 
   */
  return async function changeBio(bio?: string, publish: boolean = false) {
    if (getType(bio) != "String") {
      bio = "";
      publish = false;
    }
    return await defaultFuncs
      .post("https://www.facebook.com/api/graphql/", ctx.jar, {
        fb_api_caller_class: "RelayModern",
        fb_api_req_friendly_name: "ProfileCometSetBioMutation",
        doc_id: "2725043627607610",
        variables: JSON.stringify({
          input: {
            bio: bio,
            publish_bio_feed_story: publish,
            actor_id: ctx.userID,
            client_mutation_id: Math.round(Math.random() * 1024).toString()
          },
          hasProfileTileViewID: false,
          profileTileViewID: null,
          scale: 1
        }),
        av: ctx.userID
      }, options)
      .then(parseAndCheckLogin(ctx, defaultFuncs))
      .then(resData => {
        if (resData.errors) throw resData.errors;
        return resData;
      })
      .catch(err => {
        Log.error("changeBio", err);
        throw err;
      })
  }
}
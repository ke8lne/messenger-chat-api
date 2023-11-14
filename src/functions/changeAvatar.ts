import parseAndCheckLogin from "../utils/parseCheckAndLogin";
import isReadableStream from "../utils/isReadableStream";
import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "../utils/setOptions";
import getType from "../utils/getType";
import Bluebird from "bluebird";
import Log from "npmlog";

async function handleUpload(image: Buffer, { defaultFuncs, ctx, options }) {
  const _uploads = new Array();
  var form = {
    profile_id: ctx.userID,
    photo_source: 57,
    av: ctx.userID,
    file: image
  };
  _uploads.push((await defaultFuncs.postFormData("https://www.facebook.com/profile/upload/", ctx.jar, form, options)
    .then(parseAndCheckLogin(ctx, defaultFuncs))
    .then(resData => {
      if (resData.error) throw resData;
      return resData.payload.metadata[0];
    })
  ));
  return await Bluebird.all(_uploads)
    .catch(err => {
      Log.error("handleUpload", err);
      throw err;
    });
}

export default function (defaultFuncs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions) {
  /**
   * 
   */
  return async function changeAvatar(image: Buffer, caption = "", temporaryTimestamp: number | string = null) {
    if (!temporaryTimestamp && getType(caption) === "Number") {
      temporaryTimestamp = caption;
      caption = "";
    }
    if (!isReadableStream(image))
      throw { error: "Image is not a readable stream" }
    let _resUpload = await handleUpload(image, { defaultFuncs, ctx, options });
    var form = {
      av: ctx.userID,
      fb_api_req_friendly_name: "ProfileCometProfilePictureSetMutation",
      fb_api_caller_class: "RelayModern",
      doc_id: "5066134240065849",
      variables: JSON.stringify({
        input: {
          caption,
          existing_photo_id: _resUpload[0].payload.fbid,
          expiration_time: temporaryTimestamp,
          profile_id: ctx.userID,
          profile_pic_method: "EXISTING",
          profile_pic_source: "TIMELINE",
          scaled_crop_rect: {
            height: 1,
            width: 1,
            x: 0,
            y: 0
          },
          skip_cropping: true,
          actor_id: ctx.userID,
          client_mutation_id: Math.round(Math.random() * 19).toString()
        },
        isPage: false,
        isProfile: true,
        scale: 3
      })
    };
    return await defaultFuncs.post("https://www.facebook.com/api/graphql/", ctx.jar, form, options)
      .then(parseAndCheckLogin(ctx, defaultFuncs))
      .then(resData => {
        if (resData.errors) throw resData.errors;
        return resData[0].data.profile_picture_set;
      })
      .catch(err => {
        Log.error("changeAvatar", err);
        throw err;
      })
  }
}
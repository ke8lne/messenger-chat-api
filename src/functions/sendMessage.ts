import generateOfflineThreadingID from "../utils/generateOfflineThreadingID,";
import generateTimestampRelative from "../utils/generateTimestampRelative";
import generateThreadingID from "../utils/generateThreadingID";
import parseAndCheckLogin from "../utils/parseCheckAndLogin";
import isReadableStream from "../utils/isReadableStream";
import getSignatureID from "../utils/getSignatureID";
import { ApiOptions } from "../utils/setOptions";
import getType from "../utils/getType";
import Bluebird from "bluebird";
import Log from "npmlog";
import { Api, Ctx, DefaultFuncs } from "../Interface";

const allowedProperties = {
  attachment: true,
  url: true,
  sticker: true,
  emoji: true,
  emojiSize: true,
  body: true,
  mentions: true,
  location: true,
};

export type Message = {
  /**
   * Message string.
   */
  body?: string;
  /**
   * Sticker ID
   */
  sticker?: string;
  /**
   * @type ReadableStream
   */
  attachment?: ReadableStream | ReadableStream[];
  /**
   * URL Attachment
   */
  url?: string;
  emoji?: { emojiSize: EmojiSize, emoji: string };
  mentions?: Mention[];
  location?: {
    latitude: number, longitude: number,
    /**
     * @default true
     */
    current: boolean
  }
}

export interface Mention {
  id: string;
  tag: string;
  /**
   * @default 0
   */
  fromIndex?: number;
}

export enum EmojiSize {
  Small = "small",
  Medium = "medium",
  Large = "large"
}

type Form = Record<string, any>;

async function uploadAttachment({ ctx, defaultFuncs, options }, attachments: ReadableStream[]) {
  const _uploads = new Array();
  // create an array of promises
  for (var i = 0; i < attachments.length; i++) {
    if (!isReadableStream(attachments[i]))
      throw { error: `Attachment should be a readable stream and not ${getType(attachments[i])}` };
    var form = { upload_1024: attachments[i], voice_clip: "true" };
    _uploads.push(defaultFuncs.postFormData("https://upload.facebook.com/ajax/mercury/upload.php", ctx.jar, form, options)
      .then(parseAndCheckLogin(ctx, defaultFuncs))
      .then(resData => {
        if (resData.error) throw resData;
        return resData.payload.metadata[0];
      }));
  }
  return await Bluebird.all(_uploads).catch(err => {
    Log.error("uploadAttachment", err);
    throw err;
  });
}

async function getUrl({ defaultFuncs, ctx }, url: string): Promise<unknown> {
  return await defaultFuncs.post("https://www.facebook.com/message_share_attachment/fromURI/", ctx.jar, {
    image_height: 960,
    image_width: 960,
    uri: url
  }, {})
    .then(parseAndCheckLogin(ctx, defaultFuncs))
    .then(resData => {
      if (resData.error) throw resData.error;
      if (!resData.payload) throw { error: "Invalid url" };
      return resData.payload.share_data.share_params;
    })
    .catch(err => {
      Log.error("getUrl", err)
      return err;
    });
}

async function send({ defaultFuncs, ctx, options }, form: Form, threadID: string, messageAndOTID: string, isGroup: boolean) {
  if (getType(threadID) === "Array") return await sendContent({ defaultFuncs, ctx, options }, form, threadID, false, messageAndOTID);
  else
    if (getType(isGroup) != "Boolean") return await sendContent({ defaultFuncs, ctx, options }, form, threadID, threadID.toString().length < 16, messageAndOTID);
    else return await sendContent({ defaultFuncs, ctx, options }, form, threadID, !isGroup, messageAndOTID);
}

async function sendContent({ defaultFuncs, ctx, options }, form: Form, threadID: string, isSingleUser: boolean, messageAndOTID: string) {
  if (getType(threadID) === "Array") {
    for (var i = 0; i < threadID.length; i++)
      form[`specific_to_list[${i}]`] = "fbid:" + threadID[i];
    form[`specific_to_list[${threadID.length}]`] = "fbid:" + ctx.userID;
    form["client_thread_id"] = "root:" + messageAndOTID;
    Log.info("sendMessage", "Sending message to multiple users: " + threadID);
  }
  else
    if (isSingleUser) {
      form["specific_to_list[0]"] = "fbid:" + threadID;
      form["specific_to_list[1]"] = "fbid:" + ctx.userID;
      form["other_user_fbid"] = threadID;
    }
    else form["thread_fbid"] = threadID;

  if (ctx.globalOptions.pageID) {
    form["author"] = "fbid:" + ctx.globalOptions.pageID;
    form["specific_to_list[1]"] = "fbid:" + ctx.globalOptions.pageID;
    form["creator_info[creatorID]"] = ctx.userID;
    form["creator_info[creatorType]"] = "direct_admin";
    form["creator_info[labelType]"] = "sent_message";
    form["creator_info[pageID]"] = ctx.globalOptions.pageID;
    form["request_user_id"] = ctx.globalOptions.pageID;
    form["creator_info[profileURI]"] = "https://www.facebook.com/profile.php?id=" + ctx.userID;
  }
  return await defaultFuncs.post("https://www.facebook.com/messaging/send/", ctx.jar, form, options)
    .then(parseAndCheckLogin(ctx, defaultFuncs))
    .then(resData => {
      if (!resData) throw { error: "Send message failed." };
      if (resData.error) {
        if (resData.error === 1545012) {
          Log.warn("sendMessage", "Got error 1545012. This might mean that you're not part of the conversation " + threadID);
          throw resData.error;
        }
        return resData;
      }
      return resData.payload.actions.reduce((p, v) => ({ threadID: v.thread_fbid, messageID: v.message_id, timestamp: v.timestamp }) || p, null);
    })
    .catch(err => {
      Log.error("sendMessage", err);
      if (getType(err) == "Object" && err.error === "Not logged in.") ctx.loggedIn = false;
      throw err;
    });
}

async function handleUrl(msg: Message, form: Form, { defaultFuncs, ctx }) {
  if (msg.url) {
    form["shareable_attachment[share_type]"] = "100";
    let _resUrl = await getUrl({ defaultFuncs, ctx }, msg.url);
    if (_resUrl === false) return;
    form["shareable_attachment[share_params]"] = _resUrl;
  }
}

async function handleLocation(msg: Message, form: Form) {
  if (msg.location) {
    if (msg.location.latitude == null || msg.location.longitude == null)
      throw { error: "location property needs both latitude and longitude" };
    form["location_attachment[coordinates][latitude]"] = msg.location.latitude;
    form["location_attachment[coordinates][longitude]"] = msg.location.longitude;
    form["location_attachment[is_current_location]"] = !!msg.location.current;
  }
}

async function handleSticker(msg: any, form: any) {
  if (msg.sticker) form["sticker_id"] = msg.sticker;
}

async function handleEmoji(msg: any, form: any) {
  if (msg.emojiSize != null && msg.emoji == null) throw { error: "emoji property is empty" };
  if (msg.emoji) {
    if (msg.emojiSize == null) msg.emojiSize = "medium";
    if (msg.emojiSize != "small" && msg.emojiSize != "medium" && msg.emojiSize != "large")
      throw { error: "emojiSize property is invalid" };
    if (form["body"] != null && form["body"] != "")
      throw { error: "body is not empty" };
    form["body"] = msg.emoji;
    form["tags[0]"] = "hot_emoji_size:" + msg.emojiSize;
  }
}

async function handleAttachment(msg: any, form: any, { defaultFuncs, ctx, options }) {
  if (msg.attachment) {
    form["image_ids"] = [];
    form["gif_ids"] = [];
    form["file_ids"] = [];
    form["video_ids"] = [];
    form["audio_ids"] = [];
    if (getType(msg.attachment) !== "Array") msg.attachment = [msg.attachment];
    let _resUploadAtt = await uploadAttachment({ ctx, defaultFuncs, options }, msg.attachment);
    _resUploadAtt.forEach(file => {
      let _key = Object.keys(file), type = _key[0];
      form[`${type}s`].push(file[type]);
    });
    return _resUploadAtt;
  }
}

async function handleMention(msg: any, form: any) {
  if (msg.mentions) {
    for (let i = 0; i < msg.mentions.length; i++) {
      const mention = msg.mentions[i];
      const tag = mention.tag;
      if (typeof tag !== "string") throw { error: "Mention tags must be strings." };
      const offset = msg.body.indexOf(tag, mention.fromIndex || 0);
      if (offset < 0) Log.warn("handleMention", `Mention for '${tag}' not found in message string.`)
      if (mention.id == null) Log.warn("handleMention", "Mention id should be non-null.");
      const id = mention.id || 0;
      form["profile_xmd[" + i + "][offset]"] = offset;
      form["profile_xmd[" + i + "][length]"] = tag.length;
      form["profile_xmd[" + i + "][id]"] = id;
      form["profile_xmd[" + i + "][type]"] = "p";
    }
  }
}

export default function (defaultFuncs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions) {
  return async function sendMessage(msg: Message, threadID: string, replyMessageId?: string, isGroup?: boolean) {
    return await new Promise(async (resolve, reject) => {
      var msgType = getType(msg);
      var threadIDType = getType(threadID);
      var messageIDType = getType(replyMessageId);
      if (msgType !== "String" && msgType !== "Object")
        throw { error: `Message should be of type string or object and not ${msgType}.` };
      if (threadIDType !== "Array" && threadIDType !== "Number" && threadIDType !== "String")
        throw { error: `ThreadID should be of type number, string, or array and not ${threadIDType}.` };
      if (replyMessageId && messageIDType !== 'String')
        throw { error: `MessageID should be of type string and not ${threadIDType}.` };
      if (msgType === "String") msg = { body: msg } as Message;
      var disallowedProperties = Object.keys(msg).filter(prop => !allowedProperties[prop]);
      if (disallowedProperties.length > 0)
        throw { error: `Dissallowed props: "${disallowedProperties.join(", ")}"` };
      var messageAndOTID = generateOfflineThreadingID();
      var form = {
        client: "mercury",
        action_type: "ma-type:user-generated-message",
        author: "fbid:" + ctx.userID,
        timestamp: Date.now(),
        timestamp_absolute: "Today",
        timestamp_relative: generateTimestampRelative(),
        timestamp_time_passed: "0",
        is_unread: false,
        is_cleared: false,
        is_forward: false,
        is_filtered_content: false,
        is_filtered_content_bh: false,
        is_filtered_content_account: false,
        is_filtered_content_quasar: false,
        is_filtered_content_invalid_app: false,
        is_spoof_warning: false,
        source: "source:chat:web",
        "source_tags[0]": "source:chat",
        body: msg.body ? msg.body.toString() : "",
        html_body: false,
        ui_push_phase: "V3",
        status: "0",
        offline_threading_id: messageAndOTID,
        message_id: messageAndOTID,
        threading_id: generateThreadingID(ctx.clientID),
        "ephemeral_ttl_mode:": "0",
        manual_retry_cnt: "0",
        has_attachment: !!(msg.attachment || msg.url || msg.sticker),
        signatureID: getSignatureID(),
        replied_to_message_id: replyMessageId
      };

      let res: any = await handleLocation(msg, form).catch(reject);
      res = await handleSticker(msg, form).catch(reject);
      res = await handleUrl(msg, form, { defaultFuncs, ctx }).catch(reject);
      res = await handleEmoji(msg, form).catch(reject);
      res = await handleMention(msg, form).catch(reject);
      res = await handleAttachment(msg, form, { defaultFuncs, ctx, options }).catch(reject);
      res = await send({ defaultFuncs, ctx, options }, form, threadID, messageAndOTID, isGroup).catch(reject);
      resolve(res);
    });
  }
};
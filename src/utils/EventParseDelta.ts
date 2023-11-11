import { formatDeltaEvent, formatDeltaMessage, formatDeltaReadReceipt, formatID } from "./format";
import { _formatAttachment } from "./forwardAttachment";
import decodeClientPayload from "./decodeClientPayload";
import parseAndCheckLogin from "./parseCheckAndLogin";
import { Api, Ctx, DefaultFuncs } from "../Interface";
import markDelivery from "./markDelivery";
import { ApiOptions } from "./setOptions";
import getType from "./getType";
import Log from "npmlog";

export default async function parseDelta(funcs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions, v: Record<string, any>) {
     if (v.delta.class == "NewMessage") {
          if (options.pageID && options.pageID != v.queue) return;
          function resolveAttachmentUrl(i: number) {
               if (i == v.delta.attachments.length) {
                    let fmtMsg;
                    try {
                         fmtMsg = formatDeltaMessage(v);
                    } catch (err) {
                         throw {
                              error: "Problem parsing message object. Please open an issue at https://github.com/szbartnik/unofficial-fb-chat-api/issues.",
                              detail: err,
                              res: v,
                              type: "parse_error",
                         };
                    }
                    if (fmtMsg)
                         if (options.autoMarkDelivery) markDelivery(ctx, api, fmtMsg.threadID, fmtMsg.messageID);
                    return !options.selfListen && fmtMsg.senderID === ctx.userID
                         ? undefined
                         : fmtMsg;
               }
               else {
                    if (v.delta.attachments[i].mercury.attach_type == "photo")
                         api.resolvePhotoUrl(v.delta.attachments[i].fbid, (err, url: string) => {
                              if (!err) v.delta.attachments[i].mercury.metadata.url = url;
                              return resolveAttachmentUrl(i + 1);
                         });
                    else return resolveAttachmentUrl(i + 1);
               }
          };
          return resolveAttachmentUrl(0);
     }

     if (v.delta.class == "ClientPayload") {
          let clientPayload = decodeClientPayload(v.delta.payload);
          if (clientPayload && clientPayload.deltas) {
               for (var i in clientPayload.deltas) {
                    let delta = clientPayload.deltas[i];
                    if (delta.deltaMessageReaction && !!ctx.globalOptions.listenEvents)
                         return {
                              type: "message_reaction",
                              threadID: (delta.deltaMessageReaction.threadKey.threadFbId ? delta.deltaMessageReaction.threadKey.threadFbId : delta.deltaMessageReaction.threadKey.otherUserFbId).toString(),
                              messageID: delta.deltaMessageReaction.messageId,
                              reaction: delta.deltaMessageReaction.reaction,
                              senderID: delta.deltaMessageReaction.senderId == 0 ? delta.deltaMessageReaction.userId.toString() : delta.deltaMessageReaction.senderId.toString(),
                              userID: (delta.deltaMessageReaction.userId || delta.deltaMessageReaction.senderId).toString(),
                         };
                    else if (delta.deltaRecallMessageData && !!ctx.globalOptions.listenEvents)
                         return {
                              type: "message_unsend",
                              threadID: (delta.deltaRecallMessageData.threadKey.threadFbId ? delta.deltaRecallMessageData.threadKey.threadFbId : delta.deltaRecallMessageData.threadKey.otherUserFbId).toString(),
                              messageID: delta.deltaRecallMessageData.messageID,
                              senderID: delta.deltaRecallMessageData.senderID.toString(),
                              deletionTimestamp: delta.deltaRecallMessageData.deletionTimestamp,
                              timestamp: delta.deltaRecallMessageData.timestamp,
                         };
                    else if (delta.deltaMessageReply) {
                         var mdata = delta.deltaMessageReply.message === undefined
                              ? []
                              : delta.deltaMessageReply.message.data === undefined
                                   ? []
                                   : delta.deltaMessageReply.message.data.prng === undefined
                                        ? []
                                        : JSON.parse(delta.deltaMessageReply.message.data.prng);
                         const mentions = {};
                         let m_id = mdata.map((u) => u.i), m_offset = mdata.map((u) => u.o), m_length = mdata.map((u) => u.l);
                         for (let i = 0; i < m_id.length; i++)
                              mentions[m_id[i]] = (delta.deltaMessageReply.message.body || "").substring(m_offset[i], m_offset[i] + m_length[i]);
                         var _cbReturn = {
                              type: "message_reply",
                              threadID: (delta.deltaMessageReply.message.messageMetadata.threadKey.threadFbId
                                   ? delta.deltaMessageReply.message.messageMetadata.threadKey.threadFbId
                                   : delta.deltaMessageReply.message.messageMetadata.threadKey.otherUserFbId
                              ).toString(),
                              messageID: delta.deltaMessageReply.message.messageMetadata.messageId,
                              senderID: delta.deltaMessageReply.message.messageMetadata.actorFbId.toString(),
                              attachments: delta.deltaMessageReply.message.attachments.map(att => {
                                   let m = JSON.parse(att.mercuryJSON);
                                   Object.assign(att, m);
                                   return att;
                              }).map(att => {
                                   let x;
                                   try {
                                        x = _formatAttachment(att);
                                   } catch (ex) {
                                        x = att;
                                        x.error = ex;
                                        x.type = "unknown";
                                   }
                                   return x;
                              }),
                              body: delta.deltaMessageReply.message.body || "",
                              isGroup: !!delta.deltaMessageReply.message.messageMetadata.threadKey.threadFbId,
                              mentions: mentions,
                              timestamp: delta.deltaMessageReply.message.messageMetadata.timestamp,
                         };

                         if (delta.deltaMessageReply.repliedToMessage) {
                              mdata = delta.deltaMessageReply.repliedToMessage === undefined
                                   ? []
                                   : delta.deltaMessageReply.repliedToMessage.data === undefined
                                        ? []
                                        : delta.deltaMessageReply.repliedToMessage.data.prng ===
                                             undefined
                                             ? []
                                             : JSON.parse(delta.deltaMessageReply.repliedToMessage.data.prng);
                              m_id = mdata.map(u => u.i);
                              m_offset = mdata.map(u => u.o);
                              m_length = mdata.map(u => u.l);
                              const replyMentions = {};
                              for (let i = 0; i < m_id.length; i++)
                                   replyMentions[m_id[i]] = (delta.deltaMessageReply.repliedToMessage.body || "").substring(m_offset[i], m_offset[i] + m_length[i]);
                              _cbReturn["messageReply"] = {
                                   threadID: (delta.deltaMessageReply.repliedToMessage.messageMetadata.threadKey.threadFbId
                                        ? delta.deltaMessageReply.repliedToMessage.messageMetadata.threadKey.threadFbId
                                        : delta.deltaMessageReply.repliedToMessage.messageMetadata.threadKey.otherUserFbId
                                   ).toString(),
                                   messageID: delta.deltaMessageReply.repliedToMessage.messageMetadata.messageId,
                                   senderID: delta.deltaMessageReply.repliedToMessage.messageMetadata.actorFbId.toString(),
                                   attachments: delta.deltaMessageReply.repliedToMessage.attachments.map(att => {
                                        let m = JSON.parse(att.mercuryJSON);
                                        Object.assign(att, m);
                                        return att;
                                   }).map(att => {
                                        let x;
                                        try {
                                             x = _formatAttachment(att);
                                        } catch (ex) {
                                             x = att;
                                             x.error = ex;
                                             x.type = "unknown";
                                        }
                                        return x;
                                   }),
                                   body: delta.deltaMessageReply.repliedToMessage.body || "",
                                   isGroup: !!delta.deltaMessageReply.repliedToMessage.messageMetadata.threadKey.threadFbId,
                                   mentions: replyMentions,
                                   timestamp: delta.deltaMessageReply.repliedToMessage.messageMetadata.timestamp,
                              };
                         }
                         else if (delta.deltaMessageReply.replyToMessageId) {
                              return funcs
                                   .post("https://www.facebook.com/api/graphqlbatch/", ctx.jar, {
                                        av: ctx.globalOptions.pageID,
                                        queries: JSON.stringify({
                                             o0: {
                                                  doc_id: "2848441488556444",
                                                  query_params: { thread_and_message_id: { thread_id: _cbReturn.threadID, message_id: delta.deltaMessageReply.replyToMessageId.id, }, },
                                             },
                                        }),
                                   }, options)
                                   .then(parseAndCheckLogin(ctx, funcs))
                                   .then(res => {
                                        if (res[res.length - 1].error_results > 0) throw res[0].o0.errors;
                                        if (res[res.length - 1].successful_results === 0)
                                             throw { error: "forcedFetch: there was no successful_results", res: res };
                                        const fetchData = res[0].o0.data.message;
                                        const mobj = {};
                                        for (var n in fetchData.message.ranges)
                                             mobj[fetchData.message.ranges[n].entity.id] = (fetchData.message.text || "").substr(fetchData.message.ranges[n].offset, fetchData.message.ranges[n].length);
                                        _cbReturn["messageReply"] = {
                                             threadID: _cbReturn.threadID,
                                             messageID: fetchData.message_id,
                                             senderID: fetchData.message_sender.id.toString(),
                                             attachments: fetchData.message.blob_attachment.map(att => {
                                                  let x;
                                                  try {
                                                       x = _formatAttachment({ blob_attachment: att });
                                                  } catch (ex) {
                                                       x = att;
                                                       x.error = ex;
                                                       x.type = "unknown";
                                                  }
                                                  return x;
                                             }),
                                             body: fetchData.message.text || "",
                                             isGroup: _cbReturn.isGroup,
                                             mentions: mobj,
                                             timestamp: parseInt(fetchData.timestamp_precise),
                                        };
                                   })
                                   .catch((err) => Log.error("forcedFetch", err))
                                   .finally(() => {
                                        if (ctx.globalOptions.autoMarkDelivery)
                                             markDelivery(ctx, api, _cbReturn.threadID, _cbReturn.messageID);
                                        return !ctx.globalOptions.selfListen && _cbReturn.senderID === ctx.userID
                                             ? undefined
                                             : _cbReturn;
                                   })
                         }
                         else _cbReturn["delta"] = delta;
                         if (ctx.globalOptions.autoMarkDelivery)
                              markDelivery(ctx, api, _cbReturn.threadID, _cbReturn.messageID)
                         return !ctx.globalOptions.selfListen && _cbReturn.senderID === ctx.userID
                              ? undefined
                              : _cbReturn;
                    }
               }
          }
     }
     if (v.delta.class !== "NewMessage" && !ctx.globalOptions.listenEvents) return;
     switch (v.delta.class) {
          case "ReadReceipt":
               let fmtMsg;
               try {
                    fmtMsg = formatDeltaReadReceipt(v.delta);
               } catch (err) {
                    throw {
                         error: "Problem parsing message object. Please open an issue at https://github.com/szbartnik/unofficial-fb-chat-api/issues.",
                         detail: err,
                         res: v.delta,
                         type: "parse_error",
                    };
               }
               return fmtMsg;

          case "AdminTextMessage":
               switch (v.delta.type) {
                    case "change_thread_theme":
                    case "change_thread_nickname":
                    case "change_thread_icon":
                    case "change_thread_admins":
                    case "group_poll":
                         let fmtMsg;
                         try {
                              fmtMsg = formatDeltaEvent(v.delta);
                         } catch (err) {
                              return {
                                   error: "Problem parsing message object. Please open an issue at https://github.com/szbartnik/unofficial-fb-chat-api/issues.",
                                   detail: err,
                                   res: v.delta,
                                   type: "parse_error",
                              };
                         }
                         return fmtMsg
                    default:
                         return;
               }

          case "ForcedFetch":
               if (!v.delta.threadKey) return;
               let mid = v.delta.messageId, tid = v.delta.threadKey.threadFbId;
               if (mid && tid) {
                    const form = {
                         av: ctx.globalOptions.pageID,
                         queries: JSON.stringify({
                              o0: {
                                   doc_id: "2848441488556444",
                                   query_params: { thread_and_message_id: { thread_id: tid.toString(), message_id: mid } }
                              }
                         })
                    };
                    return await funcs
                         .post("https://www.facebook.com/api/graphqlbatch/", ctx.jar, form, options)
                         .then(parseAndCheckLogin(ctx, funcs))
                         .then(res => {
                              if (res[res.length - 1].error_results > 0) throw res[0].o0.errors;
                              if (res[res.length - 1].successful_results === 0)
                                   throw { error: "forcedFetch: there was no successful_results", res: res };
                              var fetchData = res[0].o0.data.message;
                              if (getType(fetchData) == "Object") {
                                   Log.info("forcedFetch", fetchData);
                                   switch (fetchData.__typename) {
                                        case "ThreadImageMessage":
                                             return (!options["selfListenEvent"] && fetchData.message_sender.id.toString() === ctx.userID) || !ctx.loggedIn
                                                  ? undefined
                                                  : {
                                                       type: "event",
                                                       threadID: formatID(tid.toString()),
                                                       messageID: fetchData.message_id,
                                                       logMessageType: "log:thread-image",
                                                       logMessageData: {
                                                            attachmentID: fetchData.image_with_metadata && fetchData.image_with_metadata.legacy_attachment_id,
                                                            width: fetchData.image_with_metadata && fetchData.image_with_metadata.original_dimensions.x,
                                                            height: fetchData.image_with_metadata && fetchData.image_with_metadata.original_dimensions.y,
                                                            url: fetchData.image_with_metadata && fetchData.image_with_metadata.preview.uri,
                                                       },
                                                       logMessageBody: fetchData.snippet,
                                                       timestamp: fetchData.timestamp_precise,
                                                       author: fetchData.message_sender.id,
                                                  };

                                        case "UserMessage":
                                             Log.info("ff-Return", {
                                                  type: "message",
                                                  senderID: formatID(fetchData.message_sender.id),
                                                  body: fetchData.message.text || "",
                                                  threadID: formatID(tid.toString()),
                                                  messageID: fetchData.message_id,
                                                  attachments: [{
                                                       type: "share",
                                                       ID: fetchData.extensible_attachment.legacy_attachment_id,
                                                       url: fetchData.extensible_attachment.story_attachment.url,
                                                       title: fetchData.extensible_attachment.story_attachment.title_with_entities.text,
                                                       description: fetchData.extensible_attachment.story_attachment.description.text,
                                                       source: fetchData.extensible_attachment.story_attachment.source,
                                                       image: ((fetchData.extensible_attachment.story_attachment.media || {}).image || {}).uri,
                                                       width: ((fetchData.extensible_attachment.story_attachment.media || {}).image || {}).width,
                                                       height: ((fetchData.extensible_attachment.story_attachment.media || {}).image || {}).height,
                                                       playable: (fetchData.extensible_attachment.story_attachment.media || {}).is_playable || false,
                                                       duration: (fetchData.extensible_attachment.story_attachment.media || {}).playable_duration_in_ms || 0,
                                                       subattachments: fetchData.extensible_attachment.subattachments,
                                                       properties: fetchData.extensible_attachment.story_attachment.properties,
                                                  }],
                                                  mentions: {},
                                                  timestamp: parseInt(fetchData.timestamp_precise),
                                                  isGroup: fetchData.message_sender.id != tid.toString(),
                                             } as any);
                                             return {
                                                  type: "message",
                                                  senderID: formatID(fetchData.message_sender.id),
                                                  body: fetchData.message.text || "",
                                                  threadID: formatID(tid.toString()),
                                                  messageID: fetchData.message_id,
                                                  attachments: [{
                                                       type: "share",
                                                       ID: fetchData.extensible_attachment.legacy_attachment_id,
                                                       url: fetchData.extensible_attachment.story_attachment.url,
                                                       title: fetchData.extensible_attachment.story_attachment.title_with_entities.text,
                                                       description: fetchData.extensible_attachment.story_attachment.description.text,
                                                       source: fetchData.extensible_attachment.story_attachment.source,
                                                       image: ((fetchData.extensible_attachment.story_attachment.media || {}).image || {}).uri,
                                                       width: ((fetchData.extensible_attachment.story_attachment.media || {}).image || {}).width,
                                                       height: ((fetchData.extensible_attachment.story_attachment.media || {}).image || {}).height,
                                                       playable: (fetchData.extensible_attachment.story_attachment.media || {}).is_playable || false,
                                                       duration: (fetchData.extensible_attachment.story_attachment.media || {}).playable_duration_in_ms || 0,
                                                       subattachments: fetchData.extensible_attachment.subattachments,
                                                       properties: fetchData.extensible_attachment.story_attachment.properties,
                                                  }],
                                                  mentions: {},
                                                  timestamp: parseInt(fetchData.timestamp_precise),
                                                  isGroup: fetchData.message_sender.id != tid.toString(),
                                             };
                                   }
                              }
                              else Log.error("forcedFetch", fetchData);
                         })
                         .catch(err => Log.error("forcedFetch", err));
               }
               break;

          case "ThreadName":
          case "ParticipantsAddedToGroupThread":
          case "ParticipantLeftGroupThread":
          case "ApprovalQueue":
               let formattedEvent;
               try {
                    formattedEvent = formatDeltaEvent(v.delta);
               } catch (err) {
                    throw {
                         error: "Problem parsing message object. Please open an issue at https://github.com/szbartnik/unofficial-fb-chat-api/issues.",
                         detail: err,
                         res: v.delta,
                         type: "parse_error",
                    }
               }
               return (!ctx.globalOptions["selfListenEvent"] && formattedEvent.author.toString() === ctx.userID) || !ctx.loggedIn ? undefined : formattedEvent
     }
}
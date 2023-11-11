import getAdminTextMessageType from "./getAdminTextMessageType";
import formatAttachment from "./forwardAttachment";
import { formatID } from "./format";

export default function formatHistoryMessage(m: Record<string, any>) {
     switch (m.action_type) {
          case "ma-type:log-message":
               return formatEvent(m);
          default:
               return formatMessage(m);
     }
}

export function formatEvent(m: Record<string, any>) {
     let originalMessage = m.message ? m.message : m, logMessageType = originalMessage.log_message_type, logMessageData;
     if (logMessageType === "log:generic-admin-text") {
          logMessageData = originalMessage.log_message_data.untypedData;
          logMessageType = getAdminTextMessageType(originalMessage.log_message_data.message_type);
     }
     else logMessageData = originalMessage.log_message_data;
     return Object.assign(formatMessage(originalMessage), {
          type: "event",
          logMessageType: logMessageType,
          logMessageData: logMessageData,
          logMessageBody: originalMessage.log_message_body
     });
}

export function formatMessage(m: Record<string, any>) {
     let originalMessage = m.message ? m.message : m;
     let obj = {
          type: "message",
          senderName: originalMessage.sender_name,
          senderID: formatID(originalMessage.sender_fbid.toString()),
          participantNames: originalMessage.group_thread_info
               ? originalMessage.group_thread_info.participant_names
               : [originalMessage.sender_name.split(" ")[0]],
          participantIDs: originalMessage.group_thread_info
               ? originalMessage.group_thread_info.participant_ids.map(v => formatID(v.toString()))
               : [formatID(originalMessage.sender_fbid)],
          body: originalMessage.body || "",
          threadID: formatID((originalMessage.thread_fbid || originalMessage.other_user_fbid).toString()),
          threadName: originalMessage.group_thread_info
               ? originalMessage.group_thread_info.name
               : originalMessage.sender_name,
          location: originalMessage.coordinates ? originalMessage.coordinates : null,
          messageID: originalMessage.mid
               ? originalMessage.mid.toString()
               : originalMessage.message_id,
          attachments: formatAttachment(
               originalMessage.attachments,
               originalMessage.attachmentIds,
               originalMessage.attachment_map,
               originalMessage.share_map
          ),
          timestamp: originalMessage.timestamp,
          timestampAbsolute: originalMessage.timestamp_absolute,
          timestampRelative: originalMessage.timestamp_relative,
          timestampDatetime: originalMessage.timestamp_datetime,
          tags: originalMessage.tags,
          reactions: originalMessage.reactions ? originalMessage.reactions : [],
          isUnread: originalMessage.is_unread
     };

     if (m.type === "pages_messaging")
          obj["pageID"] = m.realtime_viewer_fbid.toString();
     obj["isGroup"] = obj.participantIDs.length > 2;
     return obj;
}
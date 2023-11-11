import getAdminTextMessageType from "./getAdminTextMessageType";
import getExtension from "./getExtension";

export type Attachment = Record<string, any>;
export type Reaction = Record<string, any>;
export type Event = Record<string, any>;

export function formatAttachmentsGraphQLResponse(attachment: Attachment) {
  switch (attachment.__typename) {
    case "MessageImage":
      return {
        type: "photo",
        ID: attachment.legacy_attachment_id,
        filename: attachment.filename,
        original_extension: getExtension(attachment.original_extension, attachment.filename),
        thumbnailUrl: attachment.thumbnail.uri,
        previewUrl: attachment.preview.uri,
        previewWidth: attachment.preview.width,
        previewHeight: attachment.preview.height,
        largePreviewUrl: attachment.large_preview.uri,
        largePreviewHeight: attachment.large_preview.height,
        largePreviewWidth: attachment.large_preview.width,
        url: attachment.large_preview.uri, // @Legacy
        width: attachment.large_preview.width, // @Legacy
        height: attachment.large_preview.height, // @Legacy
        name: attachment.filename, // @Legacy
        attributionApp: attachment.attribution_app
          ? {
            attributionAppID: attachment.attribution_app.id,
            name: attachment.attribution_app.name,
            logo: attachment.attribution_app.square_logo
          }
          : null
      };
    case "MessageAnimatedImage":
      return {
        type: "animated_image",
        ID: attachment.legacy_attachment_id,
        filename: attachment.filename,
        original_extension: getExtension(attachment.original_extension, attachment.filename),
        previewUrl: attachment.preview_image.uri,
        previewWidth: attachment.preview_image.width,
        previewHeight: attachment.preview_image.height,
        url: attachment.animated_image.uri,
        width: attachment.animated_image.width,
        height: attachment.animated_image.height,
        thumbnailUrl: attachment.preview_image.uri, // @Legacy
        name: attachment.filename, // @Legacy
        facebookUrl: attachment.animated_image.uri, // @Legacy
        rawGifImage: attachment.animated_image.uri, // @Legacy
        animatedGifUrl: attachment.animated_image.uri, // @Legacy
        animatedGifPreviewUrl: attachment.preview_image.uri, // @Legacy
        animatedWebpUrl: attachment.animated_image.uri, // @Legacy
        animatedWebpPreviewUrl: attachment.preview_image.uri, // @Legacy
        attributionApp: attachment.attribution_app
          ? {
            attributionAppID: attachment.attribution_app.id,
            name: attachment.attribution_app.name,
            logo: attachment.attribution_app.square_logo
          }
          : null
      };
    case "MessageVideo":
      return {
        type: "video",
        ID: attachment.legacy_attachment_id,
        filename: attachment.filename,
        original_extension: getExtension(attachment.original_extension, attachment.filename),
        duration: attachment.playable_duration_in_ms,
        thumbnailUrl: attachment.large_image.uri, // @Legacy
        previewUrl: attachment.large_image.uri,
        previewWidth: attachment.large_image.width,
        previewHeight: attachment.large_image.height,
        url: attachment.playable_url,
        width: attachment.original_dimensions.x,
        height: attachment.original_dimensions.y,
        videoType: attachment.video_type.toLowerCase()
      };
    case "MessageFile":
      return {
        type: "file",
        ID: attachment.message_file_fbid,
        filename: attachment.filename,
        original_extension: getExtension(attachment.original_extension, attachment.filename),
        url: attachment.url,
        isMalicious: attachment.is_malicious,
        contentType: attachment.content_type,
        name: attachment.filename, // @Legacy
        mimeType: "", // @Legacy
        fileSize: -1 // @Legacy
      };
    case "MessageAudio":
      return {
        type: "audio",
        ID: attachment.url_shimhash, // Not fowardable
        filename: attachment.filename,
        original_extension: getExtension(attachment.original_extension, attachment.filename),
        duration: attachment.playable_duration_in_ms,
        audioType: attachment.audio_type,
        url: attachment.playable_url,
        isVoiceMail: attachment.is_voicemail
      };
    default:
      return new Error(`Unknown attachment type "${attachment.__typename}"`)
  }
}

export function formatExtensibleAttachment(attachment: Attachment) {
  if (attachment.story_attachment) {
    return {
      type: "share",
      ID: attachment.legacy_attachment_id,
      url: attachment.story_attachment.url,
      title: attachment.story_attachment.title_with_entities.text,
      description: attachment.story_attachment.description && attachment.story_attachment.description.text,
      source: attachment.story_attachment.source == null
        ? null
        : attachment.story_attachment.source.text,
      image: attachment.story_attachment.media == null
        ? null
        : attachment.story_attachment.media.animated_image == null && attachment.story_attachment.media.image == null
          ? null
          : (attachment.story_attachment.media.animated_image || attachment.story_attachment.media.image).uri,
      width: attachment.story_attachment.media == null
        ? null
        : attachment.story_attachment.media.animated_image == null && attachment.story_attachment.media.image == null
          ? null
          : (attachment.story_attachment.media.animated_image || attachment.story_attachment.media.image).width,
      height: attachment.story_attachment.media == null
        ? null
        : attachment.story_attachment.media.animated_image == null && attachment.story_attachment.media.image == null
          ? null
          : (attachment.story_attachment.media.animated_image || attachment.story_attachment.media.image).height,
      playable: attachment.story_attachment.media == null
        ? null
        : attachment.story_attachment.media.is_playable,
      duration: attachment.story_attachment.media == null
        ? null
        : attachment.story_attachment.media.playable_duration_in_ms,
      playableUrl: attachment.story_attachment.media == null
        ? null
        : attachment.story_attachment.media.playable_url,
      subattachments: attachment.story_attachment.subattachments,
      properties: attachment.story_attachment.properties.reduce((obj: Record<string, any>, cur: Record<string, any>) => {
        obj[cur.key] = cur.value.text;
        return obj;
      }, {}),
      animatedImageSize: "", // @Legacy
      facebookUrl: "", // @Legacy
      styleList: "", // @Legacy
      target: "", // @Legacy
      thumbnailUrl: attachment.story_attachment.media == null
        ? null
        : attachment.story_attachment.media.animated_image == null && attachment.story_attachment.media.image == null
          ? null
          : (attachment.story_attachment.media.animated_image || attachment.story_attachment.media.image).uri,
      thumbnailWidth: attachment.story_attachment.media == null
        ? null
        : attachment.story_attachment.media.animated_image == null && attachment.story_attachment.media.image == null
          ? null
          : (attachment.story_attachment.media.animated_image || attachment.story_attachment.media.image).width, // @Legacy
      thumbnailHeight: attachment.story_attachment.media == null
        ? null
        : attachment.story_attachment.media.animated_image == null && attachment.story_attachment.media.image == null
          ? null
          : (attachment.story_attachment.media.animated_image || attachment.story_attachment.media.image).height // @Legacy
    };
  } else return new Error(`Unknown extension.`);
}

function formatReactionsGraphQL(reaction: Reaction) {
  return { reaction: reaction.reaction, userID: reaction.user.id };
}

export function formatEventData(event: Event) {
  if (event == null) return {};
  switch (event.__typename) {
    case "ThemeColorExtensibleMessageAdminText":
      return { color: event.theme_color };
    case "ThreadNicknameExtensibleMessageAdminText":
      return { nickname: event.nickname, participantID: event.participant_id };
    case "ThreadIconExtensibleMessageAdminText":
      return { threadIcon: event.thread_icon };
    case "InstantGameUpdateExtensibleMessageAdminText":
      return {
        gameID: (event.game == null ? null : event.game.id),
        update_type: event.update_type,
        collapsed_text: event.collapsed_text,
        expanded_text: event.expanded_text,
        instant_game_update_data: event.instant_game_update_data
      };
    case "GameScoreExtensibleMessageAdminText":
      return { game_type: event.game_type };
    case "RtcCallLogExtensibleMessageAdminText":
      return {
        event: event.event,
        is_video_call: event.is_video_call,
        server_info_data: event.server_info_data
      };
    case "GroupPollExtensibleMessageAdminText":
      return {
        event_type: event.event_type,
        total_count: event.total_count,
        question: event.question
      };
    case "AcceptPendingThreadExtensibleMessageAdminText":
      return { accepter_id: event.accepter_id, requester_id: event.requester_id };
    case "ConfirmFriendRequestExtensibleMessageAdminText":
      return { friend_request_recipient: event.friend_request_recipient, friend_request_sender: event.friend_request_sender };
    case "AddContactExtensibleMessageAdminText":
      return { contact_added_id: event.contact_added_id, contact_adder_id: event.contact_adder_id };
    case "AdExtensibleMessageAdminText":
      return {
        ad_client_token: event.ad_client_token,
        ad_id: event.ad_id,
        ad_preferences_link: event.ad_preferences_link,
        ad_properties: event.ad_properties
      };
    case "ParticipantJoinedGroupCallExtensibleMessageAdminText":
    case "ThreadEphemeralTtlModeExtensibleMessageAdminText":
    case "StartedSharingVideoExtensibleMessageAdminText":
    case "LightweightEventCreateExtensibleMessageAdminText":
    case "LightweightEventNotifyExtensibleMessageAdminText":
    case "LightweightEventNotifyBeforeEventExtensibleMessageAdminText":
    case "LightweightEventUpdateTitleExtensibleMessageAdminText":
    case "LightweightEventUpdateTimeExtensibleMessageAdminText":
    case "LightweightEventUpdateLocationExtensibleMessageAdminText":
    case "LightweightEventDeleteExtensibleMessageAdminText":
      return {};
    default:
      return new Error(`Unknown event "${event.__typename}"`);
  }
}

export function formatMessagesGraphQLResponse(data: Record<string, any>) {
  const messageThread = data.o0.data.message_thread, threadID = messageThread.thread_key.thread_fbid ? messageThread.thread_key.thread_fbid : messageThread.thread_key.other_user_id;
  const messages = messageThread.messages.nodes.map(d => {
    switch (d.__typename) {
      case "UserMessage":
        let maybeStickerAttachment;
        if (d.sticker) {
          maybeStickerAttachment = [
            {
              type: "sticker",
              ID: d.sticker.id,
              url: d.sticker.url,
              packID: d.sticker.pack ? d.sticker.pack.id : null,
              spriteUrl: d.sticker.sprite_image,
              spriteUrl2x: d.sticker.sprite_image_2x,
              width: d.sticker.width,
              height: d.sticker.height,
              caption: d.snippet, // Not sure what the heck caption was.
              description: d.sticker.label, // Not sure about this one either.
              frameCount: d.sticker.frame_count,
              frameRate: d.sticker.frame_rate,
              framesPerRow: d.sticker.frames_per_row,
              framesPerCol: d.sticker.frames_per_col,
              stickerID: d.sticker.id, // @Legacy
              spriteURI: d.sticker.sprite_image, // @Legacy
              spriteURI2x: d.sticker.sprite_image_2x // @Legacy
            }
          ];
        }
        let mentionsObj = {};
        if (d.message !== null)
          d.message.ranges.forEach(e => mentionsObj[e.entity.id] = d.message.text.substr(e.offset, e.length));
        return {
          type: "message",
          attachments: maybeStickerAttachment
            ? maybeStickerAttachment
            : d.blob_attachments && d.blob_attachments.length > 0
              ? d.blob_attachments.map(formatAttachmentsGraphQLResponse)
              : d.extensible_attachment
                ? [formatExtensibleAttachment(d.extensible_attachment)]
                : [],
          body: d.message !== null ? d.message.text : '',
          isGroup: messageThread.thread_type === "GROUP",
          messageID: d.message_id,
          senderID: d.message_sender.id,
          threadID: threadID,
          timestamp: d.timestamp_precise,
          mentions: mentionsObj,
          isUnread: d.unread,
          messageReactions: d.message_reactions
            ? d.message_reactions.map(formatReactionsGraphQL)
            : null,
          isSponsored: d.is_sponsored,
          snippet: d.snippet
        };
      case "ThreadNameMessage":
        return {
          type: "event",
          messageID: d.message_id,
          threadID: threadID,
          isGroup: messageThread.thread_type === "GROUP",
          senderID: d.message_sender.id,
          timestamp: d.timestamp_precise,
          eventType: "change_thread_name",
          snippet: d.snippet,
          eventData: { threadName: d.thread_name },
          author: d.message_sender.id,
          logMessageType: "log:thread-name",
          logMessageData: { name: d.thread_name }
        };
      case "ThreadImageMessage":
        return {
          type: "event",
          messageID: d.message_id,
          threadID: threadID,
          isGroup: messageThread.thread_type === "GROUP",
          senderID: d.message_sender.id,
          timestamp: d.timestamp_precise,
          eventType: "change_thread_image",
          snippet: d.snippet,
          eventData:
            d.image_with_metadata == null
              ? {}
              : {
                threadImage: {
                  attachmentID: d.image_with_metadata.legacy_attachment_id,
                  width: d.image_with_metadata.original_dimensions.x,
                  height: d.image_with_metadata.original_dimensions.y,
                  url: d.image_with_metadata.preview.uri
                }
              },
          logMessageType: "log:thread-icon",
          logMessageData: {
            thread_icon: d.image_with_metadata
              ? d.image_with_metadata.preview.uri
              : null
          }
        };
      case "ParticipantLeftMessage":
        return {
          type: "event",
          messageID: d.message_id,
          threadID: threadID,
          isGroup: messageThread.thread_type === "GROUP",
          senderID: d.message_sender.id,
          timestamp: d.timestamp_precise,
          eventType: "remove_participants",
          snippet: d.snippet,
          eventData: { participantsRemoved: d.participants_removed.map(p => p.id) },
          logMessageType: "log:unsubscribe",
          logMessageData: { leftParticipantFbId: d.participants_removed.map(p => p.id) }
        };
      case "ParticipantsAddedMessage":
        return {
          type: "event",
          messageID: d.message_id,
          threadID: threadID,
          isGroup: messageThread.thread_type === "GROUP",
          senderID: d.message_sender.id,
          timestamp: d.timestamp_precise,
          eventType: "add_participants",
          snippet: d.snippet,
          eventData: { participantsAdded: d.participants_added.map(p => p.id) },
          logMessageType: "log:subscribe",
          logMessageData: { addedParticipants: d.participants_added.map(p => p.id) }
        };
      case "VideoCallMessage":
        return {
          type: "event",
          messageID: d.message_id,
          threadID: threadID,
          isGroup: messageThread.thread_type === "GROUP",
          senderID: d.message_sender.id,
          timestamp: d.timestamp_precise,
          eventType: "video_call",
          snippet: d.snippet,
          logMessageType: "other"
        };
      case "VoiceCallMessage":
        return {
          type: "event",
          messageID: d.message_id,
          threadID: threadID,
          isGroup: messageThread.thread_type === "GROUP",
          senderID: d.message_sender.id,
          timestamp: d.timestamp_precise,
          eventType: "voice_call",
          snippet: d.snippet,
          logMessageType: "other"
        };
      case "GenericAdminTextMessage":
        return {
          type: "event",
          messageID: d.message_id,
          threadID: threadID,
          isGroup: messageThread.thread_type === "GROUP",
          senderID: d.message_sender.id,
          timestamp: d.timestamp_precise,
          snippet: d.snippet,
          eventType: d.extensible_message_admin_text_type.toLowerCase(),
          eventData: formatEventData(d.extensible_message_admin_text),
          logMessageType: getAdminTextMessageType(d.extensible_message_admin_text_type),
          logMessageData: d.extensible_message_admin_text
        };
      default:
        return new Error(`Unknown message type "${d.__typename}"`);
    }
  });
  return messages;
}
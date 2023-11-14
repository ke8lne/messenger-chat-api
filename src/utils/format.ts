import getAdminTextMessageType from "./getAdminTextMessageType";
import { _formatAttachment } from "./forwardAttachment";
import ColorArray from "./Colors";
import { Events } from "./EventHandler";

export function formatDeltaReadReceipt(delta: Record<string, any>) {
	return {
		reader: (delta.threadKey.otherUserFbId || delta.actorFbId).toString(),
		time: delta.actionTimestampMs,
		threadID: formatID((delta.threadKey.otherUserFbId || delta.threadKey.threadFbId).toString())
	};
}

export function formatPostReaction(data: Record<string, any>) {
	return {
		viewer_feedback_reaction_info: data.feedback_react.feedback.viewer_feedback_reaction_info,
		supported_reactions: data.feedback_react.feedback.supported_reactions,
		top_reactions: data.feedback_react.feedback.top_reactions.edges,
		reaction_count: data.feedback_react.feedback.reaction_count as number
	}
}

export function formatMessage(threadID: string, data: Record<string, any>) {
	switch (data.__typename) {
		case "ThreadNameMessage":
			return {
				type: "event",
				threadID: threadID,
				messageID: data.message_id,
				logMessageType: "log:thread-name",
				logMessageData: { name: data.thread_name },
				logMessageBody: data.snippet,
				timestamp: data.timestamp_precise,
				author: data.message_sender.id
			};
		case "ThreadImageMessage":
			const metadata = data.image_with_metadata;
			return {
				type: "event",
				threadID: threadID,
				messageID: data.message_id,
				logMessageType: "log:thread-image",
				logMessageData: metadata
					? {
						attachmentID: metadata.legacy_attachment_id,
						width: metadata.original_dimensions.x,
						height: metadata.original_dimensions.y,
						url: metadata.preview.uri
					} :
					{
						attachmentID: null,
						width: null,
						height: null,
						url: null
					},
				logMessageBody: data.snippet,
				timestamp: data.timestamp_precise,
				author: data.message_sender.id
			};
		case "GenericAdminTextMessage":
			switch (data.extensible_message_admin_text_type) {
				case "CHANGE_THREAD_THEME":
					return {
						type: "event",
						threadID: threadID,
						messageID: data.message_id,
						logMessageType: "log:thread-color",
						logMessageData: ColorArray().find(color => color.theme_color === data.extensible_message_admin_text.theme_color) ||
						{
							theme_color: data.extensible_message_admin_text.theme_color,
							theme_id: null,
							theme_emoji: null,
							gradient: null,
							should_show_icon: null,
							theme_name_with_subtitle: null
						},
						logMessageBody: data.snippet,
						timestamp: data.timestamp_precise,
						author: data.message_sender.id
					};
				case "CHANGE_THREAD_ICON":
					const thread_icon = data.extensible_message_admin_text.thread_icon;
					return {
						type: "event",
						threadID: threadID,
						messageID: data.message_id,
						logMessageType: "log:thread-icon",
						logMessageData: {
							thread_icon_url: `https://static.xx.fbcdn.net/images/emoji.php/v9/t3c/1/16/${thread_icon.codePointAt(0).toString(16)}.png`,
							thread_icon: thread_icon
						},
						logMessageBody: data.snippet,
						timestamp: data.timestamp_precise,
						author: data.message_sender.id
					};
				case "CHANGE_THREAD_NICKNAME":
					return {
						type: "event",
						threadID: threadID,
						messageID: data.message_id,
						logMessageType: "log:user-nickname",
						logMessageData: {
							nickname: data.extensible_message_admin_text.nickname,
							participant_id: data.extensible_message_admin_text.participant_id
						},
						logMessageBody: data.snippet,
						timestamp: data.timestamp_precise,
						author: data.message_sender.id
					};
				case "GROUP_POLL":
					const question = data.extensible_message_admin_text.question;
					return {
						type: "event",
						threadID: threadID,
						messageID: data.message_id,
						logMessageType: "log:thread-poll",
						logMessageData: {
							question_json: JSON.stringify({
								id: question.id,
								text: question.text,
								total_count: data.extensible_message_admin_text.total_count,
								viewer_has_voted: question.viewer_has_voted,
								question_type: "",
								creator_id: data.message_sender.id,
								options: question.options.nodes.map(option => ({
									id: option.id,
									text: option.text,
									total_count: option.voters.nodes.length,
									viewer_has_voted: option.viewer_has_voted,
									voters: option.voters.nodes.map(voter => voter.id)
								}))
							}),
							event_type: data.extensible_message_admin_text.event_type.toLowerCase(),
							question_id: question.id
						},
						logMessageBody: data.snippet,
						timestamp: data.timestamp_precise,
						author: data.message_sender.id
					};
				default:
					throw new Error(`Unknown admin text type: "${data.extensible_message_admin_text_type}", if this happens to you let me know when it happens. Please open an issue at https://github.com/szbartnik/unofficial-fb-chat-api/issues.`);
			}
		case "UserMessage":
			return {
				senderID: data.message_sender.id,
				body: data.message.text,
				threadID: threadID,
				messageID: data.message_id,
				reactions: data.message_reactions.map(r => ({ [r.user.id]: r.reaction })),
				attachments: data.blob_attachments && data.blob_attachments.length > 0
					? data.blob_attachments.length.map(att => {
						let x;
						try {
							x = _formatAttachment(att);
						} catch (ex) {
							x = att;
							x.error = ex;
							x.type = "unknown";
						}
						return x;
					})
					: data.extensible_attachment && Object.keys(data.extensible_attachment).length > 0
						? [{
							type: "share",
							ID: data.extensible_attachment.legacy_attachment_id,
							url: data.extensible_attachment.story_attachment.url,
							title: data.extensible_attachment.story_attachment.title_with_entities.text,
							description: data.extensible_attachment.story_attachment.description.text,
							source: data.extensible_attachment.story_attachment.source,
							image: ((data.extensible_attachment.story_attachment.media || {}).image || {}).uri,
							width: ((data.extensible_attachment.story_attachment.media || {}).image || {}).width,
							height: ((data.extensible_attachment.story_attachment.media || {}).image || {}).height,
							playable: (data.extensible_attachment.story_attachment.media || {}).is_playable || false,
							duration: (data.extensible_attachment.story_attachment.media || {}).playable_duration_in_ms || 0,
							subattachments: data.extensible_attachment.subattachments,
							properties: data.extensible_attachment.story_attachment.properties
						}]
						: [],
				mentions: data.message.ranges.map(mention => ({ [mention.entity.id]: data.message.text.substring(mention.offset, mention.offset + mention.length) })),
				timestamp: data.timestamp_precise
			};
		default:
			throw new Error(`Unknown message type: "${data.__typename}", if this happens to you let me know when it happens. Please open an issue at https://github.com/szbartnik/unofficial-fb-chat-api/issues.`);
	}
}


export function formatID(id: string) {
	if (id != undefined && id != null)
		return id.replace(/(fb)?id[:.]/, "");
	else return id;
}

export function formatType(event: Record<string, any>) {
	return {
		isTyping: !!event.st,
		from: event.from.toString(),
		threadID: formatID((event.to || event.thread_fbid || event.from).toString()),
		fromMobile: event.hasOwnProperty("from_mobile") ? event.from_mobile : true,
		userID: (event.realtime_viewer_fbid || event.from).toString(),
		type: "typ"
	}
}

export function formatReadReceipt(event: Record<string, any>) {
	return {
		reader: event.reader.toString(),
		time: event.time,
		threadID: formatID((event.thread_fbid || event.reader).toString()),
		type: "read_receipt"
	};
}

export function formatRead(event: Record<string, any>) {
	return {
		threadID: formatID(((event.chat_ids && event.chat_ids[0]) || (event.thread_fbids && event.thread_fbids[0])).toString()),
		time: event.timestamp,
		type: "read"
	};
}

export function formatProxyPresence(presence: Record<string, any>, userID: string) {
	if (presence.lat === undefined || presence.p === undefined) return null;
	return {
		type: "presence",
		timestamp: presence.lat * 1000,
		userID: userID,
		statuses: presence.p
	}
}

export function formatPresence(presence: Record<string, any>, userID: string) {
	return {
		type: "presence",
		timestamp: presence.la * 1000,
		userID: userID,
		statuses: presence.a
	}
}

export function formatThread(data: Record<string, any>) {
	return {
		threadID: formatID(data.thread_fbid.toString()),
		participants: data.participants.map(formatID),
		participantIDs: data.participants.map(formatID),
		name: data.name,
		nicknames: data.custom_nickname,
		snippet: data.snippet,
		snippetAttachments: data.snippet_attachments,
		snippetSender: formatID((data.snippet_sender || "").toString()),
		unreadCount: data.unread_count,
		messageCount: data.message_count,
		imageSrc: data.image_src,
		timestamp: data.timestamp,
		serverTimestamp: data.server_timestamp, // what is this?
		muteUntil: data.mute_until,
		isCanonicalUser: data.is_canonical_user,
		isCanonical: data.is_canonical,
		isSubscribed: data.is_subscribed,
		folder: data.folder,
		isArchived: data.is_archived,
		recipientsLoadable: data.recipients_loadable,
		hasEmailParticipant: data.has_email_participant,
		readOnly: data.read_only,
		canReply: data.can_reply,
		cannotReplyReason: data.cannot_reply_reason,
		lastMessageTimestamp: data.last_message_timestamp,
		lastReadTimestamp: data.last_read_timestamp,
		lastMessageType: data.last_message_type,
		emoji: data.custom_like_icon,
		color: data.custom_color,
		adminIDs: data.admin_ids,
		threadType: data.thread_type
	}
}

export function formatDeltaEvent(m: Record<string, any>) {
	let logMessageType, logMessageData, event;

	// log:thread-color => {theme_color}
	// log:user-nickname => {participant_id, nickname}
	// log:thread-icon => {thread_icon}
	// log:thread-name => {name}
	// log:subscribe => {addedParticipants - [Array]}
	// log:unsubscribe => {leftParticipantFbId}

	switch (m.class) {
		case "AdminTextMessage":
			event = Events.AdminMessage;
			logMessageData = m.untypedData;
			logMessageType = getAdminTextMessageType(m.type);
			break;
		case "ThreadName":
			event = Events.ChangeName;
			logMessageData = { name: m.name };
			break;
		case "ParticipantsAddedToGroupThread":
			event = Events.ThreadUserJoin;
			logMessageData = { userID: m.addedParticipants };
			break;
		case "ParticipantLeftGroupThread":
			event = Events.ThreadUserLeave
			logMessageData = { userID: m.leftParticipantFbId };
			break;
	}
	return {
		event,
		threadID: formatID((m.messageMetadata.threadKey.threadFbId || m.messageMetadata.threadKey.otherUserFbId).toString()),
		logMessageType: logMessageType,
		logMessageData: logMessageData,
		logMessageBody: m.messageMetadata.adminText,
		author: m.messageMetadata.actorFbId
	};
}

export function formatDeltaMessage(m: Record<string, any>) {
	let md = m.delta.messageMetadata, mdata = m.delta.data === undefined
		? []
		: m.delta.data.prng === undefined
			? []
			: JSON.parse(m.delta.data.prng);
	let m_id = mdata.map(u => u.i), m_offset = mdata.map(u => u.o), m_length = mdata.map(u => u.l), mentions = {};
	for (let i = 0; i < m_id.length; i++)
		mentions[m_id[i]] = m.delta.body.substring(m_offset[i], m_offset[i] + m_length[i]);

	return {
		isReply: false,
		senderID: formatID(md.actorFbId.toString()),
		body: m.delta.body || "",
		threadID: formatID((md.threadKey.threadFbId || md.threadKey.otherUserFbId).toString()),
		messageID: md.messageId,
		attachments: (m.delta.attachments || []).map(v => _formatAttachment(v)),
		mentions: mentions,
		timestamp: md.timestamp,
		isGroup: !!md.threadKey.threadFbId
	};
}
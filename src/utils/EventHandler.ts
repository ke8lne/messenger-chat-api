import { formatDeltaEvent, formatDeltaReadReceipt, formatID } from "./format";
import resolveAttachmentUrl from "./resolveAttachmentURL";
import decodeClientPayload from "./decodeClientPayload";
import { _formatAttachment } from "./forwardAttachment";
import parseAndCheckLogin from "./parseCheckAndLogin";
import setOptions, { ApiOptions } from "./setOptions";
import { Api, Ctx, DefaultFuncs } from "../Interface";
import markDelivery from "./markDelivery";
import Proxy from "https-proxy-agent";
import EventEmitter from "events";
import WS from "websocket-stream";
import getGUID from "./getGUID";
import getType from "./getType";
import Log from "npmlog";
import Mqtt from "mqtt";

var form = {}, getSeqID: () => Promise<ReturnType<typeof listenMqtt>>;

// Topics to subscribe on mqtt client.
const Topics = [
  "/legacy_web",
  "/webrtc",
  "/rtc_multi",
  "/onevc",
  "/sr_res",
  "/t_ms",
  "/thread_typing",
  "/orca_typing_notifications",
  "/notify_disconnect",
  "/orca_presence",
]

function listenMqtt(funcs: DefaultFuncs, api: Api, ctx: Ctx) {
  class MessageEmitter extends EventEmitter {
    ctx = ctx;
    api = api;
    functions = funcs;
    setOptions(_options: ApiOptions) {
      return setOptions(ctx.globalOptions, _options);
    }
    stopListening() {
      if (ctx.mqttClient) {
        ctx.mqttClient.unsubscribe("/webrtc");
        ctx.mqttClient.unsubscribe("/rtc_multi");
        ctx.mqttClient.unsubscribe("/onevc");
        ctx.mqttClient.publish("/browser_close", "{}");
        ctx.mqttClient.end(false, (...data) => {
          this.emit("end", ...data);
          ctx.mqttClient = undefined;
        });
      }
    }
  }

  const emitter = new MessageEmitter(),
    sessionID = Math.floor(Math.random() * 9007199254740991) + 1, cookies = ctx.jar.getCookies("https://www.facebook.com").join("; ");
  let chatOn = ctx.globalOptions.online, foreground = false,
    username = {
      u: ctx.userID,
      s: sessionID,
      chat_on: chatOn,
      fg: foreground,
      d: getGUID(),
      ct: "websocket",
      aid: "219994525426954",
      mqtt_sid: "",
      cp: 3,
      ecp: 10,
      st: [],
      pm: [],
      dc: "",
      no_auto_fg: true,
      gas: null,
      pack: []
    };
  let host;
  if (ctx.mqttEndpoint) host = `${ctx.mqttEndpoint}&sid=${sessionID}`;
  else if (ctx.region) host = `wss://edge-chat.facebook.com/chat?region=${ctx.region.toLocaleLowerCase()}&sid=${sessionID}`;
  else host = `wss://edge-chat.facebook.com/chat?sid=${sessionID}`;

  let mqttOptions = {
    clientId: "mqttwsclient",
    protocolId: 'MQIsdp',
    protocolVersion: 3,
    username: JSON.stringify(username),
    clean: true,
    wsOptions: {
      headers: {
        'Cookie': cookies,
        'Origin': 'https://www.facebook.com',
        'User-Agent': ctx.globalOptions.userAgent,
        'Referer': 'https://www.facebook.com/',
        'Host': new URL(host).hostname //'edge-chat.facebook.com'
      },
      agent: undefined,
      origin: 'https://www.facebook.com',
      protocolVersion: 13
    },
    keepalive: 10,
    reschedulePings: false
  };
  if (typeof ctx.globalOptions.proxy != "undefined") mqttOptions.wsOptions.agent = new (Proxy as any)(ctx.globalOptions.proxy);
  const client = ctx.mqttClient = new Mqtt.Client(_ => WS(host, mqttOptions.wsOptions), mqttOptions);
  client.on('error', async () => {
    Log.error("listenMqtt", "mqttError");
    client.end();
    if (ctx.globalOptions.autoReconnect) await getSeqID();
    else {
      emitter.emit("error", {
        type: "stop_listen",
        error: "Connection refused: Server unavailable"
      }, null);
    }
  });
  client.on('connect', () => {
    Topics.forEach(topic => client.subscribe(topic));
    let topic, queue = {
      sync_api_version: 10,
      max_deltas_able_to_process: 1000,
      delta_batch_size: 500,
      encoding: "JSON",
      entity_fbid: ctx.userID
    };
    if (ctx.syncToken) {
      topic = "/messenger_sync_get_diffs";
      queue["last_seq_id"] = ctx.lastSeqId;
      queue["sync_token"] = ctx.syncToken;
    }
    else {
      topic = "/messenger_sync_create_queue";
      queue["initial_titan_sequence_id"] = ctx.lastSeqId;
      queue["device_params"] = null;
    };
    client.publish(topic, JSON.stringify(queue), { qos: 1, retain: false });
    client.publish("/foreground_state", JSON.stringify({ foreground: chatOn }), { qos: 1 });
    client.publish("/set_client_settings", JSON.stringify({ make_user_available_when_in_foreground: true }), { qos: 1 });

    const _timeout = setTimeout(async () => {
      client.end();
      await getSeqID();
    }, 5000); // Threshold
    ctx["tmsWait"] = function () {
      clearTimeout(_timeout);
      emitter.emit("ready");
      delete ctx["tmsWait"];
    }
  });
  client.on('message', (topic, msg: any, _packet) => {
    let parseMsg = Buffer.isBuffer(msg) ? Buffer.from(msg).toString() : msg;
    try {
      parseMsg = JSON.parse(msg);
    }
    catch {
      parseMsg = {};
    }

    if (parseMsg.type === "jewel_requests_add")
      emitter.emit(Events.AddFriend, {
        actorFbId: parseMsg.from.toString(),
        timestamp: Date.now().toString()
      });
    else if (parseMsg.type === "jewel_requests_remove_old")
      emitter.emit(Events.CancelRequest, {
        actorFbId: parseMsg.from.toString(),
        timestamp: Date.now().toString()
      });
    else if (topic === "/t_ms") {
      if (ctx["tmsWait"] && typeof ctx["tmsWait"] == "function")
        ctx["tmsWait"]();
      if (parseMsg.firstDeltaSeqId && parseMsg.syncToken) {
        ctx.lastSeqId = parseMsg.firstDeltaSeqId;
        ctx.syncToken = parseMsg.syncToken;
      }
      if (parseMsg.lastIssuedSeqId) ctx.lastSeqId = parseInt(parseMsg.lastIssuedSeqId);
      for (var i in parseMsg.deltas)
        parseDelta(funcs, api, ctx, emitter, { "delta": parseMsg.deltas[i] });
    }
    else if (topic === "/thread_typing" || topic === "/orca_typing_notifications") {
      emitter.emit(Events.Typing, {
        isTyping: !!parseMsg.state,
        from: parseMsg.sender_fbid.toString(),
        threadID: formatID((parseMsg.thread || parseMsg.sender_fbid).toString())
      });
    }
    else if (topic === "/orca_presence") {
      if (!ctx.globalOptions.updatePresence) {
        for (var i in parseMsg.list) {
          var data = parseMsg.list[i];
          emitter.emit(Events.Presence, { type: "presence", userID: data['u'].toString(), timestamp: data["l"] * 1000, statuses: data["p"] });
        }
      }
    }
  });
  client.once('close', () => emitter.emit("close", "Connection closed."));
  return emitter;
}

async function parseDelta(funcs: DefaultFuncs, api: Api, ctx: Ctx, emitter: EventEmitter, v: Record<string, any>) {
  if (v.delta.class == "NewMessage") {
    if (ctx.globalOptions.pageID && ctx.globalOptions.pageID != v.queue) return;
    try {
      let _res = resolveAttachmentUrl(0, v, { funcs, api, ctx });
      emitter.emit(Events.MessageSend, _res);
    } catch (err) {
      throw {
        error: "Problem parsing message object. Please open an issue at https://github.com/szbartnik/unofficial-fb-chat-api/issues.",
        detail: err,
        res: v,
        type: "parse_error"
      };
    };
  }

  if (v.delta.class == "ClientPayload") {
    var clientPayload = decodeClientPayload(v.delta.payload);
    if (clientPayload && clientPayload.deltas) {
      for (var i in clientPayload.deltas) {
        var delta = clientPayload.deltas[i];
        if (delta.deltaMessageReaction && !!ctx.globalOptions.listenEvents) {
          emitter.emit(Events.MessageReact, {
            threadID: (delta.deltaMessageReaction.threadKey.threadFbId ? delta.deltaMessageReaction.threadKey.threadFbId : delta.deltaMessageReaction.threadKey.otherUserFbId).toString(),
            messageID: delta.deltaMessageReaction.messageId,
            reaction: delta.deltaMessageReaction.reaction,
            senderID: delta.deltaMessageReaction.senderId == 0 ? delta.deltaMessageReaction.userId.toString() : delta.deltaMessageReaction.senderId.toString(),
            userID: (delta.deltaMessageReaction.userId || delta.deltaMessageReaction.senderId).toString()
          });
        }
        else if (delta.deltaRecallMessageData && !!ctx.globalOptions.listenEvents) {
          emitter.emit(Events.MessageUnsend, {
            threadID: (delta.deltaRecallMessageData.threadKey.threadFbId ? delta.deltaRecallMessageData.threadKey.threadFbId : delta.deltaRecallMessageData.threadKey.otherUserFbId).toString(),
            messageID: delta.deltaRecallMessageData.messageID,
            senderID: delta.deltaRecallMessageData.senderID.toString(),
            deletionTimestamp: delta.deltaRecallMessageData.deletionTimestamp,
            timestamp: delta.deltaRecallMessageData.timestamp || new Date().getTime()
          });
        }
        else if (delta.deltaMessageReply) {
          let mdata = delta.deltaMessageReply.message === undefined ? [] :
            delta.deltaMessageReply.message.data === undefined ? [] :
              delta.deltaMessageReply.message.data.prng === undefined ? [] :
                JSON.parse(delta.deltaMessageReply.message.data.prng),
            m_id = mdata.map(u => u.i),
            m_offset = mdata.map(u => u.o),
            m_length = mdata.map(u => u.l),
            mentions = {};

          for (let i = 0; i < m_id.length; i++)
            mentions[m_id[i]] = (delta.deltaMessageReply.message.body || "").substring(m_offset[i], m_offset[i] + m_length[i]);
          const cbRetutn = {
            isReply: true,
            threadID: (delta.deltaMessageReply.message.messageMetadata.threadKey.threadFbId ? delta.deltaMessageReply.message.messageMetadata.threadKey.threadFbId : delta.deltaMessageReply.message.messageMetadata.threadKey.otherUserFbId).toString(),
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
            timestamp: delta.deltaMessageReply.message.messageMetadata.timestamp
          };

          if (delta.deltaMessageReply.repliedToMessage) {
            mdata = delta.deltaMessageReply.repliedToMessage === undefined ? [] :
              delta.deltaMessageReply.repliedToMessage.data === undefined ? [] :
                delta.deltaMessageReply.repliedToMessage.data.prng === undefined ? [] :
                  JSON.parse(delta.deltaMessageReply.repliedToMessage.data.prng);
            m_id = mdata.map(u => u.i),
              m_offset = mdata.map(u => u.o),
              m_length = mdata.map(u => u.l);
            const rmentions = {};
            for (let i = 0; i < m_id.length; i++)
              rmentions[m_id[i]] = (delta.deltaMessageReply.repliedToMessage.body || "").substring(m_offset[i], m_offset[i] + m_length[i]);
            cbRetutn["messageReply"] = {
              threadID: (delta.deltaMessageReply.repliedToMessage.messageMetadata.threadKey.threadFbId
                ? delta.deltaMessageReply.repliedToMessage.messageMetadata.threadKey.threadFbId
                : delta.deltaMessageReply.repliedToMessage.messageMetadata.threadKey.otherUserFbId).toString(),
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
              mentions: rmentions,
              timestamp: delta.deltaMessageReply.repliedToMessage.messageMetadata.timestamp
            };
          }
          else if (delta.deltaMessageReply.replyToMessageId) {
            await funcs
              .post("https://www.facebook.com/api/graphqlbatch/", ctx.jar, {
                "av": ctx.globalOptions.pageID,
                "queries": JSON.stringify({
                  "o0": {
                    "doc_id": "2848441488556444",
                    "query_params": {
                      "thread_and_message_id": {
                        "thread_id": cbRetutn.threadID,
                        "message_id": delta.deltaMessageReply.replyToMessageId.id
                      }
                    }
                  }
                })
              }, ctx.globalOptions)
              .then(parseAndCheckLogin(ctx, funcs))
              .then(res => {
                if (res[res.length - 1].error_results > 0) throw res[0].o0.errors;
                if (res[res.length - 1].successful_results === 0) throw { error: "forcedFetch: there was no successful_results", res };
                let fetchData = res[0].o0.data.message, mobj = {};
                for (var n in fetchData.message.ranges)
                  mobj[fetchData.message.ranges[n].entity.id] = (fetchData.message.text || "").substr(fetchData.message.ranges[n].offset, fetchData.message.ranges[n].length);
                cbRetutn["messageReply"] = {
                  threadID: cbRetutn.threadID,
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
                  isGroup: cbRetutn.isGroup,
                  mentions: mobj,
                  timestamp: parseInt(fetchData.timestamp_precise)
                };
              })
              .catch((err) => Log.error("forcedFetch", err))
              .finally(() => {
                if (ctx.globalOptions.autoMarkDelivery) markDelivery(ctx, api, cbRetutn.threadID, cbRetutn.messageID);
                !ctx.globalOptions.selfListen && cbRetutn.senderID === ctx.userID ? undefined : emitter.emit(Events.MessageSend, cbRetutn);
              });
          }
          else cbRetutn["delta"] = delta;

          if (ctx.globalOptions.autoMarkDelivery) markDelivery(ctx, api, cbRetutn.threadID, cbRetutn.messageID);
          return !ctx.globalOptions.selfListen && cbRetutn.senderID === ctx.userID ? undefined : emitter.emit(Events.MessageSend, cbRetutn);
        }
      }
    }
  }

  if (v.delta.class !== "NewMessage" && !ctx.globalOptions.listenEvents) return;
  switch (v.delta.class) {
    case "ReadReceipt":
      let _msg;
      try {
        _msg = formatDeltaReadReceipt(v.delta);
      }
      catch (err) {
        return emitter.emit("error", {
          error: "Problem parsing message object. Please open an issue at https://github.com/szbartnik/unofficial-fb-chat-api/issues.",
          detail: err,
          res: v.delta,
          type: "parse_error"
        });
      }
      return emitter.emit(Events.MessageRead, _msg);

    case "AdminTextMessage":
      let _event: Events;
      switch (v.delta.type) {
        case "change_thread_theme":
          _event = Events.ChangeTheme;
        case "change_thread_nickname":
          _event = Events.ChangeNickname;
        case "change_thread_icon":
          _event = Events.ChangeIcon;
        case "change_thread_admins":
          _event = Events.ChangeAdmin;
        case "group_poll":
          _event = Events.Poll;
          let _msg;
          try {
            _msg = formatDeltaEvent(v.delta);
          }
          catch (err) {
            return emitter.emit("error", {
              error: "Problem parsing message object. Please open an issue at https://github.com/szbartnik/unofficial-fb-chat-api/issues.",
              detail: err,
              res: v.delta,
              type: "parse_error"
            });
          }
          return emitter.emit(_event, _msg);
        default:
          return;
      }

    case "ForcedFetch":
      if (!v.delta.threadKey) return;
      let mid = v.delta.messageId, tid = v.delta.threadKey.threadFbId;
      if (mid && tid) {
        const form = {
          "av": ctx.globalOptions.pageID,
          "queries": JSON.stringify({
            "o0": {
              "doc_id": "2848441488556444",
              "query_params": {
                "thread_and_message_id": {
                  "thread_id": tid.toString(),
                  "message_id": mid
                }
              }
            }
          })
        };

        return await funcs.post("https://www.facebook.com/api/graphqlbatch/", ctx.jar, form, ctx.globalOptions)
          .then(parseAndCheckLogin(ctx, funcs))
          .then(res => {
            if (res[res.length - 1].error_results > 0) throw res[0].o0.errors;
            if (res[res.length - 1].successful_results === 0) throw { error: "forcedFetch: there was no successful_results", res };
            let fetchData = res[0].o0.data.message;
            if (getType(fetchData) == "Object") {
              // Log.info("forcedFetch", fetchData);
              switch (fetchData.__typename) {
                case "ThreadImageMessage":
                  if ((!ctx.globalOptions["selfListenEvent"] && fetchData.message_sender.id.toString() === ctx.userID) || !ctx.loggedIn)
                    emitter.emit(Events.SelfEvent, {
                      threadID: formatID(tid.toString()),
                      messageID: fetchData.message_id,
                      logMessageType: "log:thread-image",
                      logMessageData: {
                        attachmentID: fetchData.image_with_metadata && fetchData.image_with_metadata.legacy_attachment_id,
                        width: fetchData.image_with_metadata && fetchData.image_with_metadata.original_dimensions.x,
                        height: fetchData.image_with_metadata && fetchData.image_with_metadata.original_dimensions.y,
                        url: fetchData.image_with_metadata && fetchData.image_with_metadata.preview.uri
                      },
                      logMessageBody: fetchData.snippet,
                      timestamp: fetchData.timestamp_precise,
                      author: fetchData.message_sender.id
                    });
                  break;

                case "UserMessage":
                  emitter.emit(Events.MessageSend, {
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
                      properties: fetchData.extensible_attachment.story_attachment.properties
                    }],
                    mentions: {},
                    timestamp: parseInt(fetchData.timestamp_precise),
                    isGroup: (fetchData.message_sender.id != tid.toString())
                  });
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
        return emitter.emit("error", {
          error: "Problem parsing message object. Please open an issue at https://github.com/szbartnik/unofficial-fb-chat-api/issues.",
          detail: err,
          res: v.delta,
          type: "parse_error"
        });
      }
      if ((!ctx.globalOptions["selfListenEvent"] && formattedEvent.author.toString() === ctx.userID) || !ctx.loggedIn)
        emitter.emit(formattedEvent.event, formattedEvent);
  }
}

export default async function (funcs: DefaultFuncs, api: Api, ctx: Ctx) {
  let emitter: ReturnType<typeof listenMqtt>;
  getSeqID = async function getSeqID() {
    ctx["t_mqttCalled"] = false;
    await funcs.post("https://www.facebook.com/api/graphqlbatch/", ctx.jar, form, ctx.globalOptions)
      .then(parseAndCheckLogin(ctx, funcs))
      .then(res => {
        if (getType(res) != "Array") throw { error: "Not logged in", res };
        if (res && res[res.length - 1].error_results > 0) throw res[0].o0.errors;
        if (res[res.length - 1].successful_results === 0)
          throw { error: "getSeqId: there was no successful_results", res };
        if (res[0].o0.data.viewer.message_threads.sync_sequence_id) {
          ctx.lastSeqId = res[0].o0.data.viewer.message_threads.sync_sequence_id;
          emitter = listenMqtt(funcs, api, ctx);
        }
        else throw { error: "getSeqId: no sync_sequence_id found.", res };
      })
      .catch(err => {
        if (getType(err) == "Object" && err.error === "Not logged in") ctx.loggedIn = false;
        Log.error("error", err);
      });
    return emitter;
  };

  if (!ctx["firstListen"]) ctx.lastSeqId = null;
  ctx.syncToken = undefined;
  ctx["t_mqttCalled"] = false;
  form = {
    "av": ctx.globalOptions.pageID,
    "queries": JSON.stringify({
      "o0": {
        "doc_id": "3336396659757871",
        "query_params": {
          "limit": 1,
          "before": null,
          "tags": ["INBOX"],
          "includeDeliveryReceipts": false,
          "includeSeqID": true
        }
      }
    })
  };

  if (!ctx["firstListen"] || !ctx.lastSeqId) emitter = await getSeqID();
  else emitter = listenMqtt(funcs, api, ctx);
  ctx["firstListen"] = false;
  return emitter;
}

export enum Events {
  /**
   * When a user accepts the pending request from the current user.
   */
  AddFriend = "friend_request_received",
  /**
   * Opposite event of Emitter<AddFriend>.
   */
  CancelRequest = "friend_request_cancel",
  /**
   * User in a thread is typing.
   */
  Typing = "typing",
  /**
   * The online status of the user's friends.
   * Requires { updatePresence } option to be enabled.
   */
  Presence = "presence",
  /**
   * Listens to the current user's events.
   */
  SelfEvent = "selfListenEvent",
  /**
   * "System" Thread Messages.
   */
  AdminMessage = "admin_text_message",
  /**
   * Changing thread name.
   */
  ChangeName = "change_name",
  /**
   * Changing thread theme.
   */
  ChangeTheme = "change_theme",
  /**
   * Changing participant's nickname.
   */
  ChangeNickname = "change_nickname",
  /**
   * Changing participant's admin status.
   */
  ChangeAdmin = "change_admin",
  /**
   * Changing thread icon.
   */
  ChangeIcon = "change_icon",
  /**
   * A user joins the thread.
   */
  ThreadUserJoin = "thread_join",
  /**
   * A user leaves the thread.
   */
  ThreadUserLeave = "thread_leave",
  // Make sense
  MessageReact = "message_react",
  MessageUnsend = "message_unsend",
  MessageSend = "message_send",
  MessageRead = "message_read",
  /**
   * Other Events
   */
  ThreadEvent = "thread_event",
  /**
   * Thread poll creation or update.
   */
  Poll = "thread_poll",
}
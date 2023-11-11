import { Api, Ctx, DefaultFuncs } from "../Interface";
import { formatDeltaMessage } from "./format";
import markDelivery from "./markDelivery";

export default function resolveAttachmentUrl(i: number, v: Record<string, any>, pk: { funcs: DefaultFuncs, api: Api, ctx: Ctx }) {
     if (i == v.delta.attachments.length) {
          let _msg = formatDeltaMessage(v);
          if (_msg)
               if (pk.ctx.globalOptions.autoMarkDelivery)
                    markDelivery(pk.ctx, pk.api, _msg.threadID, _msg.messageID);
          return !pk.ctx.globalOptions.selfListen && _msg.senderID === pk.ctx.userID ? undefined : _msg;
     }
     else if (v.delta.attachments[i].mercury.attach_type == "photo")
          pk.api.resolvePhotoUrl(v.delta.attachments[i].fbid, (err, url) => {
               if (!err) v.delta.attachments[i].mercury.metadata.url = url;
               return resolveAttachmentUrl(i + 1, v, pk);
          });
     else return resolveAttachmentUrl(i + 1, v, pk);
}
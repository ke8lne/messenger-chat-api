import { Api, Ctx } from "../Interface";

export default async function markDelivery(ctx: Ctx, api: Api, threadID: string, messageID: string) {
     if (threadID && messageID) {
          await api.markAsDelivered(threadID, messageID);
          if (ctx.globalOptions.autoMarkRead) return await api.markAsRead(threadID);
     }
}

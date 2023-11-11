import { Api, Ctx } from "../Interface";

export default async function markDelivery(ctx: Ctx, api: Api, threadID: string, messageID: string) {
     if (threadID && messageID)
          return await api.markAsDelivered(threadID, messageID, async err => {
               if (err) throw err;
               else if (ctx.globalOptions.autoMarkRead)
                    return await api.markAsRead(threadID, (err) => {
                         if (err) throw err;
                    })
          })
}

import presenceEncode from "./presenceEncode";

export default function generatePresence(h: string, i: string, userID: string) {
     let time = Date.now();
     return ("E" + presenceEncode(h, i, JSON.stringify({
          v: 3,
          time: parseInt((time / 1000).toString(), 10),
          user: userID,
          state: {
               ut: 0,
               t2: [],
               lm2: null,
               uct2: time,
               tr: null,
               tw: Math.floor(Math.random() * 4294967295) + 1,
               at: time
          },
          ch: { ["p_" + userID]: 0 }
     })));
}
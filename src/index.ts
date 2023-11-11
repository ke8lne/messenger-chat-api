import setOptions, { ApiOptions } from "./utils/setOptions";
import loginHelper from "./utils/loginHelper";
import { LoginData } from "./Interface";
import Log from "npmlog";
import EventHandler from "./utils/EventHandler";

var defaultLogRecordSize = 100;
Log.maxRecordSize = defaultLogRecordSize;

var H, I = {}, J = {
     _: "%",
     A: "%2",
     B: "000",
     C: "%7d",
     D: "%7b%22",
     E: "%2c%22",
     F: "%22%3a",
     G: "%2c%22ut%22%3a1",
     H: "%2c%22bls%22%3a",
     I: "%2c%22n%22%3a%22%",
     J: "%22%3a%7b%22i%22%3a0%7d",
     K: "%2c%22pt%22%3a0%2c%22vis%22%3a",
     L: "%2c%22ch%22%3a%7b%22h%22%3a%22",
     M: "%7b%22v%22%3a2%2c%22time%22%3a1",
     N: ".channel%22%2c%22sub%22%3a%5b",
     O: "%2c%22sb%22%3a1%2c%22t%22%3a%5b",
     P: "%2c%22ud%22%3a100%2c%22lc%22%3a0",
     Q: "%5d%2c%22f%22%3anull%2c%22uct%22%3a",
     R: ".channel%22%2c%22sub%22%3a%5b1%5d",
     S: "%22%2c%22m%22%3a0%7d%2c%7b%22i%22%3a",
     T: "%2c%22blc%22%3a1%2c%22snd%22%3a1%2c%22ct%22%3a",
     U: "%2c%22blc%22%3a0%2c%22snd%22%3a1%2c%22ct%22%3a",
     V: "%2c%22blc%22%3a0%2c%22snd%22%3a0%2c%22ct%22%3a",
     W: "%2c%22s%22%3a0%2c%22blo%22%3a0%7d%2c%22bl%22%3a%7b%22ac%22%3a",
     X: "%2c%22ri%22%3a0%7d%2c%22state%22%3a%7b%22p%22%3a0%2c%22ut%22%3a1",
     Y: "%2c%22pt%22%3a0%2c%22vis%22%3a1%2c%22bls%22%3a0%2c%22blc%22%3a0%2c%22snd%22%3a1%2c%22ct%22%3a",
     Z: "%2c%22sb%22%3a1%2c%22t%22%3a%5b%5d%2c%22f%22%3anull%2c%22uct%22%3a0%2c%22s%22%3a0%2c%22blo%22%3a0%7d%2c%22bl%22%3a%7b%22ac%22%3a"
}

export default async function (loginData: LoginData, options: ApiOptions) {
     let l = [];
     for (let m in J) {
          I[J[m]] = m;
          l.push(J[m]);
     }
     H = new RegExp(l.reverse().join("|"), 'g');
     let globalOptions: ApiOptions = {
          selfListen: false,
          listenEvents: true,
          listenTyping: true,
          updatePresence: false,
          forceLogin: false,
          autoMarkDelivery: true,
          autoMarkRead: false,
          logRecordSize: defaultLogRecordSize,
          userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/600.3.18 (KHTML, like Gecko) Version/8.0.3 Safari/600.3.18" // Default Agent 
     };
     setOptions(globalOptions, options);
     const api = await loginHelper({ H, I, J }, loginData, globalOptions);
     return EventHandler(api.functions, api.api, api.ctx);
}
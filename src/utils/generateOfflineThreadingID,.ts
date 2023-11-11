import binaryToDecimal from "./binaryToDecimal";

export default function generateOfflineThreadingID() {
     const value = Math.floor(Math.random() * 4294967295);
     let ret = Date.now();
     let str = ("0000000000000000000000" + value.toString(2)).slice(-22);
     let msgs = ret.toString(2) + str;
     return binaryToDecimal(msgs);
}
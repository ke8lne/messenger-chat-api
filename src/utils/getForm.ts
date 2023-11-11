export default function getFrom(str: string, startToken: string, endToken: string) {
     let start = str.indexOf(startToken) + startToken.length;
     if (start < startToken.length) return "";
     let lastHalf = str.substring(start), end = lastHalf.indexOf(endToken);
     if (end === -1) throw Error("Could not find endTime `" + endToken + "` in the given string.");
     return lastHalf.substring(0, end);
}
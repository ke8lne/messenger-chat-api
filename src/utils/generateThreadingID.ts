export default function generateThreadingID(clientID: string) {
  let k = Date.now();
  let l = Math.floor(Math.random() * 4294967295);
  let m = clientID;
  return "<" + k + ":" + l + "-" + m + "@mail.projektitan.com>";
}
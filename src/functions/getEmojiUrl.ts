import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "../utils/setOptions";
import { format } from "util";

export default function (funcs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions) {
  return function getEmojiUrl(c: string, size: number, pixelRatio: string) {
    pixelRatio = pixelRatio || "1.0";
    const ending = format("%s/%s/%s.png", pixelRatio, size, c.codePointAt(0).toString(16))
    let base = 317426846;
    for (let i = 0; i < ending.length; i++)
      base = (base << 5) - base + ending.charCodeAt(i);
    return format("https://static.xx.fbcdn.net/images/emoji.php/v8/z%s/%s", (base & 255).toString(16), ending);
  }
}
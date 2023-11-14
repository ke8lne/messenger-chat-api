import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "../utils/setOptions";
import { format } from "util";

export default function (funcs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions) {
  /**
   * Returns the URL to a Facebook Messenger-style emoji image asset.
   * Note: This function will return a URL regardless of whether the image at the URL actually exists. This can happen if, for example, Messenger does not have an image asset for the requested emoji.
   * @param c Emoji character to set.
   * @param {EmojiSize} size The width and height of the emoji image.
   * @param {string} pixelRatio The pixel ratio of the emoji image; supported ratios are '1.0' and '1.5'. Default is '1.0'. 
   */
  return function getEmojiUrl(c: string, size: number, pixelRatio: string) {
    pixelRatio = pixelRatio || "1.0";
    const ending = format("%s/%s/%s.png", pixelRatio, size, c.codePointAt(0).toString(16))
    let base = 317426846;
    for (let i = 0; i < ending.length; i++)
      base = (base << 5) - base + ending.charCodeAt(i);
    return format("https://static.xx.fbcdn.net/images/emoji.php/v8/z%s/%s", (base & 255).toString(16), ending);
  }
}
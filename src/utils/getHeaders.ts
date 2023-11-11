import { ApiOptions } from "./setOptions";

export default function getHeaders(url: string, options: ApiOptions) {
     return {
          "Content-Type": "application/x-www-form-urlencoded",
          Referer: "https://www.facebook.com/",
          Host: url.replace("https://", "").split("/")[0],
          Origin: "https://www.facebook.com",
          "User-Agent": options.userAgent,
          Connection: "keep-alive"
     }
}
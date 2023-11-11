import bluebird from "bluebird";
const request = bluebird.promisify(require("request").defaults({ jar: true }), { multiArgs: true });
import Request, { CookieJar } from "request";
import getHeaders from "./getHeaders";
import { ApiOptions } from "./setOptions";

export default async function post(url: string, jar: CookieJar, form: Record<string, any>, options: ApiOptions) {
     const res = await (request as (arg: Request.RequiredUriUrl & Request.CoreOptions) => Promise<Request.Request>)({
          headers: getHeaders(url, options),
          timeout: 60000,
          url,
          method: "POST",
          form,
          jar,
          gzip: true
     });
     return res[0];
}
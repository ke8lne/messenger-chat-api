import Request, { CookieJar } from "request"
import { ApiOptions } from "./setOptions";
import getHeaders from "./getHeaders";
import getType from "./getType";
import bluebird from "bluebird";
const request = bluebird.promisify(require("request").defaults({ jar: true }), { multiArgs: true });

export default async function get(url: string, jar: CookieJar, qs?: Record<string, any>, options?: ApiOptions) {
     if (getType(qs) === "Object")
          for (var prop in qs)
               if (qs.hasOwnProperty(prop) && getType(qs[prop]) === "Object")
                    qs[prop] = JSON.stringify(qs[prop]);
     const res = await (request as (arg: Request.RequiredUriUrl & Request.CoreOptions) => Promise<Request.Request>)({
          headers: getHeaders(url, options),
          timeout: 60000,
          qs,
          url,
          method: "GET",
          jar,
          gzip: true
     });
     return res[0];
}
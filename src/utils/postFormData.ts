import bluebird from "bluebird";
const request = bluebird.promisify(require("request").defaults({ jar: true }), { multiArgs: true });
import Request, { CookieJar } from "request";
import getHeaders from "./getHeaders";
import { ApiOptions } from "./setOptions";

export default async function postFormData(url: string, jar: CookieJar, form: Record<string, any>, qs: any, options?: ApiOptions) {
     var headers = getHeaders(url, options);
     headers["Content-Type"] = "multipart/form-data";
     const res = await (request as (arg: Request.RequiredUriUrl & Request.CoreOptions) => Promise<Request.Request>)({
          headers,
          timeout: 60000,
          url,
          method: "POST",
          formData: form,
          qs,
          jar,
          gzip: true
     });
     return res[0];
}
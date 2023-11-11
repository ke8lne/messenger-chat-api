import makeParsable from "./makeParsable";
import { formatCookie } from "./cookies";
import bluebird from "bluebird";
import Log from "npmlog";

export default function parseAndCheckLogin(ctx: Record<string, any>, defaultFuncs: any, retryCount?: number) {
     if (retryCount == undefined) retryCount = 0;
     return function (data: Record<string, any>) {
          return bluebird.try(function () {
               Log.verbose("parseAndCheckLogin", data.body);
               if (data.statusCode >= 500 && data.statusCode < 600) {
                    if (retryCount >= 5)
                         throw {
                              error:
                                   "Request retry failed. Check the `res` and `statusCode` property on this error.",
                              statusCode: data.statusCode,
                              res: data.body
                         };
                    retryCount++;
                    let retryTime = Math.floor(Math.random() * 5000);
                    Log.warn("parseAndCheckLogin", "Got status code " + data.statusCode + " - " + retryCount + ". attempt to retry in " + retryTime + " milliseconds...");
                    var url = data.request.uri.protocol + "//" + data.request.uri.hostname + data.request.uri.pathname;
                    if (data.request.headers["Content-Type"].split(";")[0] === "multipart/form-data")
                         return bluebird
                              .delay(retryTime)
                              .then(() => defaultFuncs.postFormData(url, ctx.jar, data.request.formData, {}))
                              .then(parseAndCheckLogin(ctx, defaultFuncs, retryCount));
                    else
                         return bluebird
                              .delay(retryTime)
                              .then(() => defaultFuncs.post(url, ctx.jar, data.request.formData))
                              .then(parseAndCheckLogin(ctx, defaultFuncs, retryCount));
               }
               if (data.statusCode !== 200)
                    throw new Error("parseAndCheckLogin got status code: " + data.statusCode + ". Bailing out of trying to parse response.");
               let res = null;
               try {
                    res = JSON.parse(makeParsable(data.body) as string);
               } catch (e) {
                    throw {
                         error: "JSON.parse error. Check the `detail` property on this error.",
                         detail: e,
                         res: data.body
                    };
               }

               // In some cases the response contains only a redirect URL which should be followed
               if (res.redirect && data.request.method === "GET")
                    return defaultFuncs.get(res.redirect, ctx.jar).then(parseAndCheckLogin(ctx, defaultFuncs));
               if (res.jsmods && res.jsmods.require && Array.isArray(res.jsmods.require[0]) && res.jsmods.require[0][0] === "Cookie") {
                    res.jsmods.require[0][3][0] = res.jsmods.require[0][3][0].replace("_js_", '');
                    let cookie = formatCookie(res.jsmods.require[0][3], "facebook");
                    let cookie2 = formatCookie(res.jsmods.require[0][3], "messenger");
                    ctx.jar.setCookie(cookie, "https://www.facebook.com");
                    ctx.jar.setCookie(cookie2, "https://www.messenger.com");
               }
               if (res.jsmods && Array.isArray(res.jsmods.require)) {
                    let arr = res.jsmods.require;
                    for (let i in arr) {
                         if (arr[i][0] === "DTSG" && arr[i][1] === "setToken") {
                              ctx.fb_dtsg = arr[i][3][0];
                              ctx.ttstamp = "2";
                              for (let j = 0; j < ctx.fb_dtsg.length; j++)
                                   ctx.ttstamp += ctx.fb_dtsg.charCodeAt(j);
                         }
                    }
               }
               if (res.error === 1357001)
                    throw { error: "Not logged in." };
               return res;
          });
     };
}
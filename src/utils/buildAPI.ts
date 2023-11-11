import setOptions, { ApiOptions } from "./setOptions";
import makeDefaults from "./makeDefaults";
import getAppState from "./getAppState";
import { CookieJar } from "request";
import Log from "npmlog";
import fs from "fs";

export default function buildAPI(globalOptions: ApiOptions, html: string, jar: CookieJar) {
     const maybeCookie = jar.getCookies("https://www.facebook.com").filter(val => val.cookieString().split("=")[0] === "c_user");
     const clientID = (Math.random() * 2147483648 | 0).toString(16);
     if (maybeCookie.length === 0)
          throw { error: "Error retrieving userID. This can be caused by a lot of things, including getting blocked by Facebook for logging in from an unknown location. Try logging in with a browser to verify." };
     let userID = maybeCookie[0].cookieString().split("=")[1].toString();
     Log.info("login", "Logged in");
     const ctx = {
          userID,
          jar,
          clientID,
          globalOptions,
          loggedIn: true,
          access_token: 'NONE',
          clientMutationId: 0,
          mqttClient: undefined,
          lastSeqId: 0,
          syncToken: undefined
     };
     const api = { setOptions: setOptions.bind(null, globalOptions), getAppState: () => getAppState(jar) }
     var defaultFuncs = makeDefaults(html, userID, ctx);
     for (let funcName of fs.readdirSync("./prod/functions")) {
          const _func = require("../functions/" + funcName);
          funcName = funcName.split(".")[0];
          if (_func) api[funcName] = _func.default(defaultFuncs, api, ctx, globalOptions);
     }
     return { ctx, api, functions: defaultFuncs, globalOptions };
}
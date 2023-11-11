import { formatCookie, saveCookies } from "./cookies";
import { ApiOptions } from "./setOptions";
import { LoginData } from "../Interface";
import getAppState from "./getAppState";
import loginHelper from "./loginHelper";
import arrToForm from "./arrayToForm";
import { CookieJar } from "request";
import getFrom from "./getForm";
import CheerIo from "cheerio";
import post from "./post";
import Log from "npmlog";
import get from "./get";

export default async function makeLogin({ H, I, J }, jar: CookieJar, loginData: LoginData, loginOptions: ApiOptions) {
     return async function (res) {
          return new Promise(async (send, reject) => {
               const html = res.body, $ = CheerIo.load(html);
               let arr = [];
               // This will be empty, but just to be sure we leave it
               $("#login_form input").map((i, v) => arr.push({ val: $(v).val(), name: $(v).attr("name") }));
               arr = arr.filter(v => v.val && v.val.length);

               var form = arrToForm(arr);
               form.lsd = getFrom(html, "[\"LSD\",[],{\"token\":\"", "\"}");
               form.lgndim = Buffer.from("{\"w\":1440,\"h\":900,\"aw\":1440,\"ah\":834,\"c\":24}").toString('base64');
               form.email = loginData.email;
               form.pass = loginData.password;
               form.default_persistent = '0';
               form.lgnrnd = getFrom(html, "name=\"lgnrnd\" value=\"", "\"");
               form.locale = 'en_US';
               form.timezone = '240';
               form.lgnjs = ~~(Date.now() / 1000);
               var willBeCookies = html.split("\"_js_");
               willBeCookies.slice(1).map(val => {
                    let cookieData = JSON.parse("[\"" + getFrom(val, "", "]") + "]");
                    jar.setCookie(formatCookie(cookieData, "facebook"), "https://www.facebook.com");
               });
               // ---------- Very Hacky Part Ends -----------------
               Log.info(__filename, "Logging in...");
               return await post("https://www.facebook.com/login.php?login_attempt=1&lwv=110", jar, form, loginOptions)
                    .then(saveCookies(jar))
                    .then(async res => {
                         var headers = res.headers;
                         if (!headers.location)
                              throw { error: "Wrong username/password." };
                         // This means the account has login approvals turned on.
                         if (headers.location.indexOf('https://www.facebook.com/checkpoint/') > -1) {
                              Log.info(__filename, "You have login approvals turned on.");
                              var nextURL = 'https://www.facebook.com/checkpoint/?next=https%3A%2F%2Fwww.facebook.com%2Fhome.php';
                              return get(headers.location, jar, null, loginOptions)
                                   .then(saveCookies(jar))
                                   .then(res => {
                                        let html = res.body, $ = CheerIo.load(html);
                                        let arr = [];
                                        $("form input").map((i, v) => arr.push({ val: $(v).val(), name: $(v).attr("name") }));
                                        arr = arr.filter(v => v.val && v.val.length);
                                        let form = arrToForm(arr);
                                        if (html.indexOf("checkpoint/?next") > -1) {
                                             throw {
                                                  error: 'login-approval',
                                                  continue: function (code) {
                                                       form.approvals_code = code;
                                                       form['submit[Continue]'] = 'Continue';
                                                       return post(nextURL, jar, form, loginOptions)
                                                            .then(saveCookies(jar))
                                                            .then(() => {
                                                                 form.name_action_selected = 'save_device';
                                                                 return post(nextURL, jar, form, loginOptions).then(saveCookies(jar));
                                                            })
                                                            .then(res => {
                                                                 let headers = res.headers;
                                                                 if (!headers.location && res.body.indexOf('Review Recent Login') > -1)
                                                                      throw { error: "Something went wrong with login approvals." };
                                                                 var appState = getAppState(jar);
                                                                 return loginHelper({ H, I, J }, { appState }, loginOptions);
                                                            })
                                                            .catch(reject);
                                                  }
                                             };
                                        }
                                        else {
                                             if (!loginOptions.forceLogin)
                                                  throw { error: "Couldn't login. Facebook might have blocked this account. Please login with a browser or enable the option 'forceLogin' and try again." };
                                             if (html.indexOf("Suspicious Login Attempt") > -1)
                                                  form['submit[This was me]'] = "This was me";
                                             else
                                                  form['submit[This Is Okay]'] = "This Is Okay";

                                             return post(nextURL, jar, form, loginOptions)
                                                  .then(saveCookies(jar))
                                                  .then(() => {
                                                       // Use the same form (safe I hope)
                                                       form.name_action_selected = 'save_device';
                                                       return post(nextURL, jar, form, loginOptions).then(saveCookies(jar));
                                                  })
                                                  .then(res => {
                                                       let headers = res.headers;
                                                       if (!headers.location && res.body.indexOf('Review Recent Login') > -1)
                                                            throw { error: "Something went wrong with review recent login." };
                                                       let appState = getAppState(jar);
                                                       // Simply call loginHelper because all it needs is the jar
                                                       // and will then complete the login process
                                                       return loginHelper({ H, I, J }, loginData, loginOptions);
                                                  })
                                                  .catch(reject);
                                        }
                                   });
                         }
                         return await get('https://www.facebook.com/', jar, null, loginOptions).then(saveCookies(jar));
                    })
                    .then(send)
          });
     }
}
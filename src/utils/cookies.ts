import { CookieJar } from "request";

export function saveCookies(jar: CookieJar) {
     return function (res) {
          let cookies = res.headers["set-cookie"] || [];
          cookies.forEach(c => {
               if (c.indexOf(".facebook.com") > -1)
                    jar.setCookie(c, "https://www.facebook.com");
               let c2 = c.replace(/domain=\.facebook\.com/, "domain=.messenger.com");
               jar.setCookie(c2, "https://www.messenger.com");
          });
          return res;
     };
}

export function formatCookie(arr: string[], url: string) {
     return (arr[0] + "=" + arr[1] + "; Path=" + arr[3] + "; Domain=" + url + ".com");
}
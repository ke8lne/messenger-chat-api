import { CookieJar } from "request";

export default function getAppState(jar: CookieJar) {
     return jar
          .getCookies("https://www.facebook.com")
          .concat(jar.getCookies("https://facebook.com"))
          .concat(jar.getCookies("https://www.messenger.com"));
}
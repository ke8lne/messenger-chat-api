import { CookieJar } from "request";
export declare function saveCookies(jar: CookieJar): (res: any) => any;
export declare function formatCookie(arr: string[], url: string): string;

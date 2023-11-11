import { CookieJar } from "request";
import { ApiOptions } from "./setOptions";
export default function get(url: string, jar: CookieJar, qs?: Record<string, any>, options?: ApiOptions): Promise<any>;

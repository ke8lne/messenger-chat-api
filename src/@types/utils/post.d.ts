import { CookieJar } from "request";
import { ApiOptions } from "./setOptions";
export default function post(url: string, jar: CookieJar, form: Record<string, any>, options: ApiOptions): Promise<any>;

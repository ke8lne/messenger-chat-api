import { CookieJar } from "request";
import { ApiOptions } from "./setOptions";
export default function postFormData(url: string, jar: CookieJar, form: Record<string, any>, qs: any, options?: ApiOptions): Promise<any>;

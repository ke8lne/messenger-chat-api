import { ApiOptions } from "./setOptions";
import { LoginData } from "../Interface";
import { CookieJar } from "request";
export default function makeLogin({ H, I, J }: {
    H: any;
    I: any;
    J: any;
}, jar: CookieJar, loginData: LoginData, loginOptions: ApiOptions): Promise<(res: any) => Promise<unknown>>;

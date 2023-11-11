import { ApiOptions } from "./setOptions";
export default function getHeaders(url: string, options: ApiOptions): {
    "Content-Type": string;
    Referer: string;
    Host: string;
    Origin: string;
    "User-Agent": string;
    Connection: string;
};

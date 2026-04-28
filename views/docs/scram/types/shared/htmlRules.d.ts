import { CookieStore } from "./cookie";
import { URLMeta } from "./rewriters/url";
export declare const htmlRules: {
    [key: string]: "*" | string[] | ((...any: any[]) => string | null);
    fn: (value: string, meta: URLMeta, cookieStore: CookieStore) => string | null;
}[];

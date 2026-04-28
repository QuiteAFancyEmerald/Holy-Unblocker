export type Cookie = {
    name: string;
    value: string;
    path?: string;
    expires?: string;
    maxAge?: number;
    domain?: string;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: "strict" | "lax" | "none";
};
export declare class CookieStore {
    private cookies;
    setCookies(cookies: string[], url: URL): void;
    getCookies(url: URL, fromJs: boolean): string;
    load(cookies: string): null;
    dump(): string;
}

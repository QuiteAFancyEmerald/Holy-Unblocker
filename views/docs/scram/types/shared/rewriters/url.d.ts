export type URLMeta = {
    origin: URL;
    base: URL;
    topFrameName?: string;
    parentFrameName?: string;
};
export declare function rewriteBlob(url: string, meta: URLMeta): string;
export declare function unrewriteBlob(url: string): string;
export declare function rewriteUrl(url: string | URL, meta: URLMeta): string;
export declare function unrewriteUrl(url: string | URL): string;

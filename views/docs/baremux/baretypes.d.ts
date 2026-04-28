export type BareHeaders = Record<string, string | string[]>;
export type BareMeta = {};
export type TransferrableResponse = {
    body: ReadableStream | ArrayBuffer | Blob | string;
    headers: BareHeaders;
    status: number;
    statusText: string;
};
export interface BareTransport {
    init: () => Promise<void>;
    ready: boolean;
    connect: (url: URL, protocols: string[], requestHeaders: BareHeaders, onopen: (protocol: string) => void, onmessage: (data: Blob | ArrayBuffer | string) => void, onclose: (code: number, reason: string) => void, onerror: (error: string) => void) => [(data: Blob | ArrayBuffer | string) => void, (code: number, reason: string) => void];
    request: (remote: URL, method: string, body: BodyInit | null, headers: BareHeaders, signal: AbortSignal | undefined) => Promise<TransferrableResponse>;
    meta: () => BareMeta;
}
export interface BareWebSocketMeta {
    protocol: string;
    setCookies: string[];
}
export type BareHTTPProtocol = 'blob:' | 'http:' | 'https:' | string;
export type BareWSProtocol = 'ws:' | 'wss:' | string;
export declare const maxRedirects = 20;

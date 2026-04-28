export declare const nativeFetch: typeof fetch;
export declare const nativeWebSocket: {
    new (url: string | URL, protocols?: string | string[]): WebSocket;
    prototype: WebSocket;
    readonly CONNECTING: 0;
    readonly OPEN: 1;
    readonly CLOSING: 2;
    readonly CLOSED: 3;
};
export declare const nativeSharedWorker: {
    new (scriptURL: string | URL, options?: string | WorkerOptions): SharedWorker;
    prototype: SharedWorker;
};
export declare const nativeLocalStorage: Storage;
export declare const nativeServiceWorker: ServiceWorkerContainer;
export declare const nativePostMessage: {
    (message: any, transfer: Transferable[]): void;
    (message: any, options?: StructuredSerializeOptions): void;
};
export declare const WebSocketFields: {
    prototype: {
        send: (data: string | ArrayBufferLike | Blob | ArrayBufferView) => void;
    };
    CLOSED: 3;
    CLOSING: 2;
    CONNECTING: 0;
    OPEN: 1;
};

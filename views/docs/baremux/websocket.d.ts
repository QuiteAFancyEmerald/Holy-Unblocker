import type { WorkerConnection } from "./connection";
import { BareHeaders } from "./baretypes";
export declare class BareWebSocket extends EventTarget {
    protocols: string | string[] | undefined;
    url: string;
    readyState: number;
    channel: MessageChannel;
    constructor(remote: string | URL, protocols: string | string[] | undefined, worker: WorkerConnection, requestHeaders?: BareHeaders);
    send(...args: any[]): void;
    close(code: any, reason: any): void;
}

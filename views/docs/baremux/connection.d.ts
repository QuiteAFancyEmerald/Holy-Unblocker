import { BareHeaders, TransferrableResponse } from "./baretypes";
export type WorkerMessage = {
    type: "fetch" | "websocket" | "set" | "get" | "ping";
    fetch?: {
        remote: string;
        method: string;
        headers: BareHeaders;
        body: ReadableStream | ArrayBuffer | undefined;
    };
    websocket?: {
        url: string;
        protocols: string[];
        requestHeaders: BareHeaders;
        channel: MessagePort;
    };
    client?: {
        function: string;
        args: any[];
    };
};
export type WorkerRequest = {
    message: WorkerMessage;
    port: MessagePort;
};
export type WorkerResponse = {
    type: "fetch" | "websocket" | "set" | "get" | "pong" | "error";
    fetch?: TransferrableResponse;
    name?: string;
    error?: Error;
};
export type BroadcastMessage = {
    type: "refreshPort";
};
export declare function browserSupportsTransferringStreams(): boolean;
export declare class WorkerConnection {
    channel: BroadcastChannel;
    port: MessagePort | Promise<MessagePort>;
    workerPath: string;
    constructor(worker?: string | Promise<MessagePort> | MessagePort);
    createChannel(workerPath?: string, inInit?: boolean): void;
    sendMessage(message: WorkerMessage, transferable?: Transferable[]): Promise<WorkerResponse>;
}

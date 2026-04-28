import { BareHeaders, BareTransport, TransferrableResponse } from './baretypes';
import { WorkerConnection } from './connection';
import { BareWebSocket } from './websocket';
export declare function validProtocol(protocol: string): boolean;
/**
 * A Response with additional properties.
 */
export interface BareResponse extends Response {
    rawResponse: TransferrableResponse;
    rawHeaders: BareHeaders;
}
/**
 * A BareResponse with additional properties.
 */
export interface BareResponseFetch extends BareResponse {
    finalURL: string;
}
export declare class BareMuxConnection {
    worker: WorkerConnection;
    constructor(worker?: string | Promise<MessagePort> | MessagePort);
    getTransport(): Promise<string>;
    setTransport(path: string, options: any[], transferables?: Transferable[]): Promise<void>;
    setManualTransport(functionBody: string, options: any[], transferables?: Transferable[]): Promise<void>;
    setRemoteTransport(transport: BareTransport, name: string): Promise<void>;
    getInnerPort(): MessagePort | Promise<MessagePort>;
}
export declare class BareClient {
    worker: WorkerConnection;
    /**
     * Create a BareClient. Calls to fetch and connect will wait for an implementation to be ready.
     */
    constructor(worker?: string | Promise<MessagePort> | MessagePort);
    createWebSocket(remote: string | URL, protocols?: string | string[] | undefined, __deprecated_donotuse_websocket?: any, requestHeaders?: BareHeaders): BareWebSocket;
    fetch(url: string | URL, init?: RequestInit): Promise<BareResponseFetch>;
}

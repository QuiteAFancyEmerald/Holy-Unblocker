import { BareTransport } from "./baretypes";
import { WorkerMessage } from "./connection";
export declare function sendError(port: MessagePort, err: Error, name: string): void;
export declare function handleFetch(message: WorkerMessage, port: MessagePort, transport: BareTransport): Promise<void>;
export declare function handleWebsocket(message: WorkerMessage, port: MessagePort, transport: BareTransport): Promise<void>;

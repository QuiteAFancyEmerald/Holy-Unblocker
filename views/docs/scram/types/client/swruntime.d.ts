import { ScramjetClient } from "./index";
export declare class ScramjetServiceWorkerRuntime {
    client: ScramjetClient;
    recvport: MessagePort;
    constructor(client: ScramjetClient);
    hook(): void;
}
export type TransferrableResponse = {
    body: ReadableStream;
    headers: [string, string][];
    status: number;
    statusText: string;
};
export type TransferrableRequest = {
    body: ReadableStream;
    headers: [string, string][];
    destinitation: RequestDestination;
    method: Request["method"];
    mode: Request["mode"];
    url: string;
};
type FetchResponseMessage = {
    scramjet$type: "fetch";
    scramjet$response: TransferrableResponse;
};
type FetchRequestMessage = {
    scramjet$type: "fetch";
    scramjet$request: TransferrableRequest;
};
type MessageTypeR2W = FetchResponseMessage;
type MessageTypeW2R = FetchRequestMessage;
type MessageCommon = {
    scramjet$type: string;
    scramjet$token: number;
};
export type MessageR2W = MessageCommon & MessageTypeR2W;
export type MessageW2R = MessageCommon & MessageTypeW2R & {
    scramjet$port?: MessagePort;
};
export {};

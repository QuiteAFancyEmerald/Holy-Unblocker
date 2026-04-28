import { type MessageR2W } from "../client/swruntime";
export declare class FakeServiceWorker {
    handle: MessagePort;
    origin: string;
    syncToken: number;
    promises: Record<number, (val?: MessageR2W) => void>;
    messageChannel: MessageChannel;
    connected: boolean;
    constructor(handle: MessagePort, origin: string);
    handleMessage(data: MessageR2W): void;
    fetch(request: Request): Promise<Response | false>;
}

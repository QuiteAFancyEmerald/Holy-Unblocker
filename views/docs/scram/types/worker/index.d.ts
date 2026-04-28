/**
 * @fileoverview Contains the core Service Worker logic for Scramjet, which handles the initial request interception and handles client management for the Scramjet service.
 */
import { FakeServiceWorker } from "./fakesw";
import BareClient from "@mercuryworkshop/bare-mux";
import { ScramjetConfig } from "../types";
import { CookieStore } from "../shared/cookie";
import { ScramjetDownload } from "../client/events";
export * from "./error";
export * from "./fetch";
export * from "./fakesw";
/**
 * Main `ScramjetServiceWorker` class created by the `$scramjetLoadWorker` factory, which handles routing the proxy and contains the core logic for request interception.
 */
export declare class ScramjetServiceWorker extends EventTarget {
    /**
     * `BareClient` instance to fetch requests under a chosen proxy transport.
     */
    client: BareClient;
    /**
     * Current ScramjetConfig saved in memory.
     */
    config: ScramjetConfig;
    /**
     * Recorded sync messages in the message queue.
     */
    syncPool: Record<number, (val?: any) => void>;
    /**
     * Current sync token for collected messages in the queue.
     */
    synctoken: number;
    /**
     * Scramjet's cookie jar for cookie emulation through other storage means, connected to a client.
     */
    cookieStore: CookieStore;
    /**
     * Fake service worker registrations, so that some sites don't complain.
     * This will eventually be replaced with a NestedSW feature under a flag in the future, but this will remain for stability even then.
     */
    serviceWorkers: FakeServiceWorker[];
    /**
     * Initializes the `BareClient` Scramjet uses to fetch requests under a chosen proxy transport, the cookie jar store for proxifying cookies, and inits the listeners for emulation features and dynamic configs set through the Scramjet Controller.
     */
    constructor();
    /**
     * Dispatches a message in the message queues.
     */
    dispatch(client: Client, data: MessageW2C): Promise<MessageC2W>;
    /**
     * Persists the current Scramjet config into an IndexedDB store.
     * Remember, this is because the Scramjet config can be dynamically updated via the Scramjet Controller APIs.
     *
     * @example
     * self.addEventListener("fetch", async (ev) => {
     *   await scramjet.loadConfig();
     *
     *   ...
     * });
     */
    loadConfig(): Promise<void>;
    /**
     * Whether to route a request from a `FetchEvent` in Scramjet.
     *
     * @example
     * self.addEventListener("fetch", async (ev) => {
     *   ...
     *
     *   if (scramjet.route(ev)) {
     *     ...
     *   }
     * });
     * ```
     */
    route({ request }: FetchEvent): boolean;
    /**
     * Handles a `FetchEvent` to be routed in Scramjet.
     * This is the heart of adding Scramjet support to your web proxy.
     *
     * @example
     * self.addEventListener("fetch", async (ev) => {
     *   ...
     *
     *   if (scramjet.route(ev)) {
     *     ev.respondWith(scramjet.fetch(ev));
     *   }
     * });
     */
    fetch({ request, clientId }: FetchEvent): Promise<any>;
}
/**
 * Scramjet fake Service Worker event message.
 * Contains a `scramjet$type` for identifying the message.
 */
type RegisterServiceWorkerMessage = {
    scramjet$type: "registerServiceWorker";
    port: MessagePort;
    origin: string;
};
/**
 * Scramjet cookie jar event message.
 * Contains a `scramjet$type` for identifying the message.
 */
type CookieMessage = {
    scramjet$type: "cookie";
    cookie: string;
    url: string;
};
/**
 * Scramjet config event message.
 * Contains a `scramjet$type` for identifying the message.
 */
type ConfigMessage = {
    scramjet$type: "loadConfig";
    config: ScramjetConfig;
};
/**
 * Scramjet proxified download event message.
 * Contains a `scramjet$type` for identifying the message.
 */
type DownloadMessage = {
    scramjet$type: "download";
    download: ScramjetDownload;
};
/**
 * Default Scramjet message.
 * Contains a `scramjet$type` for identifying the message.
 */
type MessageCommon = {
    scramjet$token?: number;
};
/**
 * Message types sent from the client to the Service Worker.
 * These are routed by their `scramjet$type` to identify the messages apart from each other.
 */
type MessageTypeC2W = RegisterServiceWorkerMessage | CookieMessage | ConfigMessage;
/**
 * w2c (types): Message types sent from the Service Worker to the client.
 */
type MessageTypeW2C = CookieMessage | DownloadMessage;
/** c2w: client to Service Worker */
export type MessageC2W = MessageCommon & MessageTypeC2W;
/** w2c: Service Worker to client */
export type MessageW2C = MessageCommon & MessageTypeW2C;

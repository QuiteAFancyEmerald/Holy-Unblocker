import { ScramjetClient } from "./index";
/**
 * Union type for all global Scramjet events.
 */
export type ScramjetGlobalEvent = ScramjetGlobalDownloadEvent;
/**
 * Event class for proxified download interception.
 */
export declare class ScramjetGlobalDownloadEvent extends Event {
    download: ScramjetDownload;
    type: string;
    constructor(download: ScramjetDownload);
}
/**
 * Map for all global Scramjet events with their corresponding event types.
 */
export type ScramjetGlobalEvents = {
    download: ScramjetGlobalDownloadEvent;
};
/**
 * Event for proxified download interception.
 */
export type ScramjetDownload = {
    filename?: string;
    url: string;
    type: string;
    body: ReadableStream<Uint8Array>;
    length: number;
};
/**
 * Union type for all Scramjet proxified navigation events.
 */
export type ScramjetEvent = NavigateEvent | UrlChangeEvent | ScramjetContextEvent;
/**
 * Type map for all Scramjet navigation events with their corresponding event types.
 */
export type ScramjetEvents = {
    navigate: NavigateEvent;
    urlchange: UrlChangeEvent;
    contextInit: ScramjetContextEvent;
};
/**
 * Navigation event class fired when Scramjet frame navigates to a new proxified URL.
 */
export declare class NavigateEvent extends Event {
    url: string;
    type: string;
    constructor(url: string);
}
/**
 * URL change event class fired when the proxified URL changes in a Scramjet frame.
 */
export declare class UrlChangeEvent extends Event {
    url: string;
    type: string;
    constructor(url: string);
}
/**
 * Event class fired when Scramjet initializes in a frame.
 */
export declare class ScramjetContextEvent extends Event {
    window: Self;
    client: ScramjetClient;
    type: string;
    constructor(window: Self, client: ScramjetClient);
}

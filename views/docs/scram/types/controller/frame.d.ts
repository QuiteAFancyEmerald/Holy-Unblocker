/**
 * @fileoverview Contains abstractions for using Scrmajet under an iframe.
 */
import { ScramjetController } from "./index";
import type { ScramjetClient } from "../client/index";
import type { ScramjetEvents } from "../client/events";
/**
 * An abstraction over proxy iframe creation, which lets you manage instances of Scramjet and not have to worry about the proxy internals, since everything you need is already proxified.
 *
 * @example
 * ```typescript
 * const { ScramjetController } = $scramjetLoadController();
 * const scramjet = new ScramjetController({ prefix: "/scramjet/" });
 * await scramjet.init();
 *
 * const frame = scramjet.createFrame();
 * document.body.appendChild(frame.frame);
 *
 * // Navigate to a URL
 * frame.go("https://example.com");
 *
 * // Listen for proxified navigation events
 * frame.addEventListener("urlchange", (e) => {
 *   console.log("URL changed to:", e.url);
 * });
 *
 * // Go back
 * frame.back();
 * // Go forward
 * frame.forward();
 * // Reload page
 * frame.reload();
 * ```
 */
export declare class ScramjetFrame extends EventTarget {
    private controller;
    frame: HTMLIFrameElement;
    /**
     * Create a ScramjetFrame instance. You likely won't need to interact the {@link ScramjetFrame.constructor | constructor} directly.
     * You can instead use {@link ScramjetController.createFrame} on your existing `ScramjetController`.
     *
     * @param controller The `ScramjetController` instance that manages this frame with.
     * @param frame The frame to be controlled for you under Scramjet.
     */
    constructor(controller: ScramjetController, frame: HTMLIFrameElement);
    /**
     * Returns the {@link ScramjetClient} instance running inside the iframe's contentWindow.
     *
     * @returns The `ScramjetClient` instance.
     */
    get client(): ScramjetClient;
    /**
     * Returns the proxified URL.
     *
     * @returns The proxified URL.
     */
    get url(): URL;
    /**
     * Navigates the iframe to a new URL under Scramjet.
     *
     * @example
     * ```typescript
     * frame.go("https://example.net");
     * ```
     *
     * @param url A real URL to navigate to
     */
    go(url: string | URL): void;
    /**
     * Goes backwards in the browser history.
     */
    back(): void;
    /**
     * Goes forward in the browser history.
     */
    forward(): void;
    /**
     * Reloads the iframe.
     */
    reload(): void;
    /**
     * Binds event listeners to listen for proxified navigation events in Scramjet.
     *
     * @example
     * ```typescript
     * // Listen for URL changes
     * frame.addEventListener("urlchange", (event) => {
     *   console.log("URL changed:", event.url);
     *   document.title = event.url; // Update page title
     * });
     *
     * // Listen for navigation events
     * frame.addEventListener("navigate", (event) => {
     *   console.log("Navigating to:", event.url);
     * });
     * ```
     *
     * @param type Type of event to listen for.
     * @param listener Event listener to dispatch.
     * @param options Options for the event listener.
     */
    addEventListener<K extends keyof ScramjetEvents>(type: K, listener: (event: ScramjetEvents[K]) => void, options?: boolean | AddEventListenerOptions): void;
}

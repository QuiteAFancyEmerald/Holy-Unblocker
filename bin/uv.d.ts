const Ultraviolet: typeof import('./src/rewrite/index').default;
const UVClient: typeof import('./src/client/index').default;

export type UltravioletCtor = typeof Ultraviolet;
export type UVClientCtor = typeof UVClient;

/**
 * The proxy part of the URL.
 */
type Coded = string;

/**
 * The URL encoder.
 * Encoders will have to encode the result using encodeURLComponent.
 */
export type UVEncode = (input: Coded) => string;

/**
 * The URL encoder.
 * Decoders will have to decode the input first using decodeURLComponent.
 */
export type UVDecode = (input: Coded) => string;

/**
 * The Ultraviolet configuration object.
 * This interface defines the configuration options for the Ultraviolet library.
 */
export interface UVConfig {
    /**
     * The prefix for Ultraviolet to listen on.
     * This prefix will be used to create the URL for the service worker and the client script.
     * @example `https://example.org/uv/service/`
     * @example `/uv/service/`
     * @defaultValue `/service/`
     */
    prefix?: string;
    /**
     * The path to the Ultraviolet client script.
     * This script will be loaded by the browser and is responsible for communicating with the service worker.
     * Both relative and absolute paths are accepted. Relative paths are resolved to the current URL
     * @example `/uv/uv.client.js`,
     * @defaultValue `/uv.client.js` or if bundle is specified and the filename is `uv.bundle.js`, the directory of the bundle + `uv.client.js` will be used automatically
     */
    client?: string;
    /**
     * The path to the Ultraviolet service worker script.
     * This script will be registered as a service worker and is responsible for handling network requests.
     * Both relative and absolute paths are accepted. Relative paths are resolved to the current URL
     * @example `/uv/uv.sw.js`,
     * @defaultValue `/uv.sw.js`
     */
    handler?: string;
    /**
     * The path to the bundled script that contains both the Ultraviolet client and service worker scripts.
     * This path is optional and can be used instead of the `client` and `handler` paths to load a single bundled script.
     * Both relative and absolute paths are accepted. Relative paths are resolved to the current URL
     * @example `/uv/uv.bundle.js`,
     * @defaultValue `/uv.bundle.js`
     */
    bundle?: string;
    /**
     * The path to the Ultraviolet configuration script.
     * This script should export a configuration object that will be used to configure the client and service worker.
     * Both relative and absolute paths are accepted. Relative paths are resolved to the current URL
     * @example `/uv/uv.config.js`,
     * @defaultValue `/uv.config.js`
     */
    config?: string;
    /**
     * The path to the Ultraviolet service worker script.
     * This path is optional and can be used instead of the `handler` path to specify a custom service worker script.
     * Both relative and absolute paths are accepted. Relative paths are resolved to the current URL
     * @example `/uv/uv.sw.js`,
     * @defaultValue `/uv.sw.js`
     */
    sw?: string;
    /**
     * The URL encoder.
     * This function will be used to encode URLs before they are sent to the server.
     * The encoder should use `encodeURIComponent` to encode the URLs.
     * @defaultValue `Ultraviolet.codec.xor.encode`
     */
    encodeUrl?: UVEncode;
    /**
     * The URL decoder.
     * This function will be used to decode URLs after they are received from the server.
     * The decoder should use `decodeURIComponent` to decode the URLs.
     * @defaultValue `Ultraviolet.codec.xor.decode`
     */
    decodeUrl?: UVDecode;
}

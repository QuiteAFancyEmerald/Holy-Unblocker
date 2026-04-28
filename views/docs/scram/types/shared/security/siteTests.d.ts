import { type URLMeta } from "../rewriters/url";
import type { default as BareClient } from "@mercuryworkshop/bare-mux";
/**
 * Emulate `Sec-Fetch-Site` header using the referrer (another reason why Force Referrer is now a needed SJ feature)
 */
export declare function getSiteDirective(meta: URLMeta, referrerURL: URL, client: BareClient): Promise<string>;
/**
 * Tests if the two URLs are from the same site.
 * This will be used in the response header rewriter.
 *
 * @see https://developer.mozilla.org/en-US/docs/Glossary/Site
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Sec-Fetch-Site#directives
 *
 * @param url1 First URL to compare
 * @param url2 Second URL to compare
 * @param client `BareClient` instance used for fetching
 * @returns Whether the two URLs are from the same site
 *
 * @throws {Error} If an error occurs while getting the Public Suffix List
 */
export declare function isSameSite(url1: URL, url2: URL, client: BareClient): Promise<boolean>;
/**
 * Gets parsed Public Suffix list from the API.
 *
 * Complies with the standard format.
 * @see https://github.com/publicsuffix/list/wiki/Format#format
 *
 * @param {BareClient} client `BareClient` instance used for fetching
 * @returns {Promise<string[]>} Parsed Public Suffix list
 *
 * @throws {Error} If an error occurs while fetching from the Public Suffix List
 */
export declare function getPublicSuffixList(client: BareClient): Promise<string[]>;

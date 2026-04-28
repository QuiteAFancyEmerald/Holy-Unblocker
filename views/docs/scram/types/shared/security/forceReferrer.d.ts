import { type ReferrerPolicyData } from "../../types";
/**
 * Initialize tracking for a new request that might redirect
 *
 * @param requestUrl URL of the request being made
 * @param referrer Referrer URL of the request, or `null`
 * @param initialSite Initial Sec-Fetch-Site directive
 */
export declare function initializeTracker(requestUrl: string, referrer: string | null, initialSite: string): Promise<void>;
/**
 * Update tracker when a redirect is encountered
 *
 * @param originalUrl URL that is redirecting
 * @param redirectUrl URL being redirected to
 * @param newReferrerPolicy Referrer Policy from the redirect response
 */
export declare function updateTracker(originalUrl: string, redirectUrl: string, newReferrerPolicy?: string): Promise<void>;
/**
 * Get most restrictive site value for a request
 *
 * @param requestUrl The URL of the current request
 * @param currentSite The current `Sec-Fetch-Site` directive for this request
 * @returns Most restrictive `Sec-Fetch-Site` directive from the redirect chain
 */
export declare function getMostRestrictiveSite(requestUrl: string, currentSite: string): Promise<string>;
/**
 * Clean up tracker after request completes
 * @param requestUrl URL of the completed request
 */
export declare function cleanTracker(requestUrl: string): Promise<void>;
/**
 * Clean up expired trackers
 */
export declare function cleanExpiredTrackers(): Promise<void>;
/**
 * Store referrer policy for a URL
 *
 * @param url URL to store the policy for
 * @param policy Referrer policy to store
 * @param referrer The referrer URL that set this policy
 */
export declare function storeReferrerPolicy(url: string, policy: string, referrer: string): Promise<void>;
/**
 * Get referrer policy data for a URL
 *
 * @param url URL to get the policy for
 * @returns Referrer policy data if found, or `null`
 */
export declare function getReferrerPolicy(url: string): Promise<ReferrerPolicyData | null>;

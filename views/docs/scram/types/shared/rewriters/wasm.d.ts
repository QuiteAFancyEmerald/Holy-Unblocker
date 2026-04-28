import { Rewriter } from "../../../rewriter/wasm/out/wasm.js";
import type { JsRewriterOutput } from "../../../rewriter/wasm/out/wasm.js";
export type { JsRewriterOutput, Rewriter };
import { URLMeta } from "./url";
export declare function asyncSetWasm(): Promise<void>;
export declare const textDecoder: TextDecoder;
export declare function getRewriter(meta: URLMeta): [Rewriter, () => void];

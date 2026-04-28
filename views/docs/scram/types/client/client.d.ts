import { ScramjetFrame } from "../controller/frame";
import { type URLMeta } from "../shared/rewriters/url";
import { CookieStore } from "../shared/cookie";
import { SingletonBox } from "./singletonbox";
import BareClient from "@mercuryworkshop/bare-mux";
type NativeStore = {
    store: Record<string, any>;
    call: (target: string, that: any, ...args: any[]) => any;
    construct: (target: string, ...args: any[]) => any;
};
type DescriptorStore = {
    store: Record<string, PropertyDescriptor>;
    get: (target: string, that: any) => any;
    set: (target: string, that: any, value: any) => void;
};
export type AnyFunction = Function;
export type ScramjetModule = {
    enabled: (client: ScramjetClient) => boolean | undefined;
    disabled: (client: ScramjetClient, self: typeof globalThis) => void | undefined;
    order: number | undefined;
    default: (client: ScramjetClient, self: typeof globalThis) => void;
};
export type ProxyCtx = {
    fn: AnyFunction;
    this: any;
    args: any[];
    newTarget: AnyFunction;
    return: (r: any) => void;
    call: () => any;
};
export type Proxy = {
    construct?(ctx: ProxyCtx): any;
    apply?(ctx: ProxyCtx): any;
};
export type TrapCtx<T> = {
    this: any;
    get: () => T;
    set: (v: T) => void;
};
export type Trap<T> = {
    writable?: boolean;
    value?: any;
    enumerable?: boolean;
    configurable?: boolean;
    get?: (ctx: TrapCtx<T>) => T;
    set?: (ctx: TrapCtx<T>, v: T) => void;
};
export declare class ScramjetClient {
    global: typeof globalThis;
    locationProxy: any;
    serviceWorker: ServiceWorkerContainer;
    bare: BareClient;
    natives: NativeStore;
    descriptors: DescriptorStore;
    wrapfn: (i: any, ...args: any) => any;
    cookieStore: CookieStore;
    eventcallbacks: Map<any, [
        {
            event: string;
            originalCallback: AnyFunction;
            proxiedCallback: AnyFunction;
        }
    ]>;
    meta: URLMeta;
    box: SingletonBox;
    constructor(global: typeof globalThis);
    get frame(): ScramjetFrame | null;
    get isSubframe(): boolean;
    loadcookies(cookiestr: string): void;
    hook(): void;
    get url(): URL;
    set url(url: URL | string);
    Proxy(name: string | string[], handler: Proxy): void;
    RawProxy(target: any, prop: string, handler: Proxy): void;
    Trap<T>(name: string | string[], descriptor: Trap<T>): PropertyDescriptor;
    RawTrap<T>(target: any, prop: string, descriptor: Trap<T>): PropertyDescriptor;
}
export {};

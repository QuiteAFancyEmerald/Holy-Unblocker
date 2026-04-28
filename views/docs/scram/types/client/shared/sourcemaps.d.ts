import { ScramjetClient } from "../index";
declare enum RewriteType {
    Insert = 0,
    Replace = 1
}
type Rewrite = {
    start: number;
} & ({
    type: RewriteType.Insert;
    size: number;
} | {
    type: RewriteType.Replace;
    end: number;
    str: string;
});
export type SourceMaps = Record<string, Rewrite[]>;
export declare const enabled: (client: ScramjetClient) => boolean;
export default function (client: ScramjetClient, self: Self): void;
export {};

import { ScramjetClient } from "./client";
import { SourceMaps } from "./shared/sourcemaps";
export declare class SingletonBox {
    ownerclient: ScramjetClient;
    clients: ScramjetClient[];
    globals: Map<Self, ScramjetClient>;
    documents: Map<Document, ScramjetClient>;
    locations: Map<Location, ScramjetClient>;
    sourcemaps: SourceMaps;
    constructor(ownerclient: ScramjetClient);
    registerClient(client: ScramjetClient, global: Self): void;
}

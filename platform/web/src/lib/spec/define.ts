import type { SiteConfig } from "./contract.ts";
import type { SiteSchemaInput } from "./screens.ts";

export function defineConfig<const T extends SiteConfig> ( config: T ): T {

    return config;

}
export function defineSchema<const T extends SiteSchemaInput> ( schema: T ): T {

    return schema;

}
export function t ( key: string ): { key: string } {

    return { key };

}

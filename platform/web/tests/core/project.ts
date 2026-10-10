import { join } from "node:path";
import type { SiteConfig } from "../../src/lib/spec/contract.ts";
import { scratch } from "./scratch.ts";

export const minimal = {
    contents: {},
    contracts: {
        urls: { production: "https://api.example.test", local: "https://api.example.test" },
        options: { spec: "client", prefix: "v1" },
    },
} satisfies SiteConfig;

export const dictionaries = { en: { greeting: "Hi" }, ar: { greeting: "أهلاً" } };

export function project ( config: SiteConfig, brand: Record<string, string | Buffer> = {} ) {

    const files = Object.fromEntries(Object.entries(brand).map(( [name, content] ) => [`r/brand/${name}`, content]));
    const { root, dispose } = scratch({
        ...files,
        "r/config/index.ts": `export default ${JSON.stringify(config)};\n`,
        "r/schema/index.ts": "export default { screens: [] };\n",
    });

    return { directory: root, identity: "r", folder: join(root, "r"), dispose };

}

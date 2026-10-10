
declare module "@spec/theme.css";

declare module "@spec/config" {

    import type { PackedContract } from "@/api/core/pack";
    import type { CompiledConfig } from "@/lib/spec/contract";

    const config: Omit<CompiledConfig, "contract"> & { contract: PackedContract };

    export default config;

}
declare module "@spec/connections" {

    const connections: { origins: string[]; images: string[]; frames: string[] };

    export default connections;

}
declare module "@spec/routing" {

    import type { Locale } from "@/lib/spec/languages";

    const routing: { locales: Locale[]; defaultLocale: Locale };

    export default routing;

}
declare module "@spec/schema" {

    import type { CompiledSchema } from "@/lib/spec/screens";

    const schema: CompiledSchema;

    export default schema;

}
declare module "@spec/registry" {

    import type { ComponentType } from "react";

    const registry: Readonly<Record<string, () => Promise<{ default: ComponentType<never> }>>>;

    export default registry;

}
declare module "@spec/messages" {

    import type { Locale } from "@/lib/spec/languages";
    import type { Messages } from "@/lib/std/messages";
    import type messages from "../../messages/en.json";

    const dictionaries: Record<Locale, typeof messages & Messages>;

    export default dictionaries;

}
declare module "@spec/browser" {

    import type { PackedContract } from "@/api/core/pack";
    import type { BrowserConfig } from "@/api/core/resolve";
    import type { EntityRoute } from "@/lib/spec/screens";

    const browser: Omit<BrowserConfig, "contract"> & { contract: PackedContract; routes: EntityRoute[] };

    export default browser;

}

declare module "@spec/config" {
    import type { CompiledConfig } from "@/lib/spec/surface";

    const config: CompiledConfig;

    export default config;
}
declare module "@spec/client" {
    import type { BrowserConfig } from "engine/api";

    const client: BrowserConfig | null;

    export default client;
}
declare module "@spec/routing" {
    import type { Locale } from "@/lib/spec/languages";

    const routing: { locales: Locale[]; defaultLocale: Locale };

    export default routing;
}
declare module "@spec/schema" {
    import type { CompiledSchema } from "@/lib/spec/surface";

    const schema: CompiledSchema;

    export default schema;
}
declare module "@spec/registry" {
    import type { ComponentType } from "react";

    const registry: Readonly<Record<string, () => Promise<{ default: ComponentType<never> }>>>;

    export default registry;
}
declare module "@spec/messages" {
    import type { Messages } from "engine/translate";
    import type { Locale } from "@/lib/spec/languages";

    const dictionaries: Record<Locale, Messages>;

    export default dictionaries;
}
declare module "@spec/flags" {
    const flags: Readonly<Record<string, number>>;
    export default flags;
}
declare module "@spec/emoji" {
    const emoji: Readonly<Record<string, number>>;
    export default emoji;
}

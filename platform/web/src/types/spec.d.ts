declare module "@spec/theme.css";

declare module "@spec/config" {
    import type { CompiledConfig } from "@/lib/spec/surface";

    const config: CompiledConfig;

    export default config;
}
declare module "@spec/routing" {
    import type { Locale } from "@/lib/spec/languages";

    const routing: { locales: Locale[]; defaultLocale: Locale };

    export default routing;
}
declare module "@spec/settings" {
    const settings: { language: string; languages: string[]; currency: string; currencies: string[]; theme: string; themes: string[]; maintenance: boolean; maintenance_message: string };

    export default settings;
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
declare module "@spec/mount" {
    import type { ComponentType } from "react";

    const views: Readonly<Record<string, ComponentType<never>>>;

    export default views;
}
declare module "@spec/messages" {
    import type { Messages } from "@engine/translate";
    import type { Locale } from "@/lib/spec/languages";

    const dictionaries: Record<Locale, Messages>;

    export default dictionaries;
}
declare module "@spec/well-known" {
    const files: Readonly<Record<string, { type: string; body: string }>>;

    export default files;
}
declare module "@spec/browser" {
    import type { BrowserConfig } from "@engine/api";
    import type { CompiledConfig } from "@/lib/spec/surface";

    const browser: BrowserConfig & { realtime: CompiledConfig["realtime"] };

    export default browser;
}

import type { Endpoint, Layer } from "engine/api";
import { key, z } from "engine/validate";
import type { Features } from "./compile.ts";
import {
    backendOptionFields,
    baseSettings,
    brandImage,
    configShapes,
    connectionShape,
    contentShape,
    contractOverrides,
    fontFaceShape,
    fontsShape,
    realtimeShape,
    settingsInput,
    siteUrl,
} from "./contract.ts";
import { sharedSettingsDefaults } from "./defaults.ts";
import { defineSurface } from "./define.ts";
import { type CompiledSchemaBase, type Entities, entityRoute, screenShapes } from "./schema.ts";
import type { Backend, CompiledScreen, ShellPart } from "./settings.ts";
import { optionsShape } from "./shapes.ts";
import {
    backendOf,
    type CompiledShape,
    type ContractsInput,
    compiledScreen,
    type ScreenInputBase,
    type SurfaceConfig,
    surfaceValidator,
    type Theme,
    type Validator,
} from "./surface.ts";

type Patch = Record<string, unknown>;
type Kind = "web" | "native";

const tenantShape = z.string().regex(/^[a-z0-9.-]+$/i).nullable().default(null);

export type Brand = {
    images: string;
    imageFormats: readonly string[];
    fontFormats: readonly string[];
    fontWeight: RegExp;
};
export type Contracts<CX extends z.ZodRawShape> = {
    browser: boolean;
    options: CX;
    dropped: readonly (keyof typeof connectionShape.shape)[];
};
export type Vocabulary<
    L extends string,
    SO extends z.ZodObject,
    BO extends z.ZodObject,
    SH extends string,
    X extends z.ZodRawShape,
    SX extends z.ZodRawShape,
    CX extends z.ZodRawShape,
> = {
    kind: Kind;
    locales: readonly L[];
    entities: Entities;
    brand: Brand;
    screenOptions: SO;
    blockOptions: BO;
    shell: readonly SH[];
    contents: X;
    settings: SX;
    required?: readonly string[] | undefined;
    icons?: readonly string[] | undefined;
    settingsDefaults: Patch;
    themeDefaults: Theme;
    contracts: Contracts<CX>;
    environment?: Readonly<Record<string, string | undefined>> | undefined;
};

export function createSpecSurface<
    L extends string,
    SO extends z.ZodObject,
    BO extends z.ZodObject,
    SH extends string,
    X extends z.ZodRawShape,
    SX extends z.ZodRawShape,
    CX extends z.ZodRawShape,
> ( vocabulary: Vocabulary<L, SO, BO, SH, X, SX, CX> ) {

    const {
        kind,
        locales,
        entities,
        brand,
        screenOptions,
        blockOptions,
        shell,
        contents,
        settings,
        required = [],
        icons,
        contracts,
        environment = {},
    } = vocabulary;
    const locale = z.enum(locales as [L, ...L[]]);
    const image = brandImage(brand.images, brand.imageFormats);
    const fonts = fontsShape(locale, fontFaceShape(brand.fontFormats, brand.fontWeight));
    const shellValue = z.union([key, z.strictObject({ feature: key, options: optionsShape.optional() })]).nullable();
    const shellShape = z.strictObject(
        Object.fromEntries(shell.map(( part ) => [part, shellValue])) as Record<SH, typeof shellValue>,
    );
    const content = contentShape(image);
    const settingsShape = z.strictObject({
        ...baseSettings(locale, fonts),
        ...settings,
        screen: screenOptions,
        block: blockOptions,
        shell: shellShape,
    });
    const urls = z.strictObject({
        production: siteUrl.nullable(),
        local: siteUrl.nullable(),
        ...(contracts.browser ? { browser: siteUrl.nullable().default(null) } : {}),
    });
    const mask = Object.fromEntries(contracts.dropped.map(( name ) => [name, true])) as Record<string, true>;
    const contractsShape = z.strictObject({
        urls,
        options: connectionShape
            .omit(mask as never)
            .extend({ ...backendOptionFields, tenant: tenantShape, ...contracts.options }),
        realtime: realtimeShape.nullable().default(null),
        assets: siteUrl.nullable().default(null),
        ...contractOverrides,
    });
    const { configShape, configInputShape } = configShapes(
        content,
        settingsShape,
        settingsInput(settingsShape, required),
        contractsShape,
    );
    const shapes = screenShapes(screenOptions, blockOptions, entities, contents);
    const settingsDefaults = {
        ...sharedSettingsDefaults,
        locale: { default: locales[0], enabled: [...locales], timeZone: "UTC" },
        theme: { ...sharedSettingsDefaults.theme, default: kind === "web" ? "light" : "system" },
        ...vocabulary.settingsDefaults,
    };
    const themeDefaults = vocabulary.themeDefaults;

    type Config = z.output<typeof configShape>;
    type ConfigInput = z.output<typeof configInputShape>;
    type Screen = z.output<typeof shapes.screen> & ScreenInputBase<Block>;
    type ScreenOptions = z.output<SO>;
    type Block = z.output<BO>;
    type Hooks<R extends object, E extends object> = {
        reserved: RegExp;
        endpoints: Readonly<Record<string, Readonly<Record<string, Endpoint>>>>;
        core?: Layer | undefined;
        walk: ( screen: Screen, options: ScreenOptions, config: Config ) => { client: boolean; session: boolean };
        screen?:
            | ((
                  screen: Screen,
                  options: ScreenOptions,
                  config: Config,
                  compiled: CompiledScreen<Block>,
                  issues: string[],
              ) => R)
            | undefined;
        screenIssues?: (( screens: readonly Screen[] ) => string[]) | undefined;
        featureIssues?: (( features: Features ) => string[]) | undefined;
        schema?: (( screens: (CompiledShape<Screen, ScreenOptions, Block> & R)[] ) => E) | undefined;
    };

    return {
        locale,
        contentShape: content,
        settingsShape,
        contractsShape,
        configShape,
        configInputShape,
        screenOptions,
        blockOptions,
        shellShape,
        screenContents: shapes.contents,
        screenShape: shapes.screen,
        schemaShape: shapes.schema,
        settingsDefaults,
        themeDefaults,
        entityRoute: ( screen: { entity?: Parameters<typeof entityRoute>[1]["entity"]; path: string } ) =>
            entityRoute(entities, screen),
        define: {
            ...defineSurface<z.input<typeof configInputShape>, z.input<typeof shapes.schema>, Block>(),
            env: ( name: string, fallback: string ): string => environment[name] || fallback,
        },
        validator: <R extends object = Record<never, never>, E extends object = Record<never, never>>(
            hooks: Hooks<R, E>,
        ): Validator<Config, CompiledSchemaBase<CompiledShape<Screen, ScreenOptions, Block> & R, SH> & E> => {

            const surface = {
                reserved: hooks.reserved,
                endpoints: hooks.endpoints,
                core: hooks.core,
                entities,
                icons,
                configShape: configShape as z.ZodType<Config & SurfaceConfig>,
                configInputShape: configInputShape as z.ZodType<ConfigInput>,
                schemaShape: shapes.schema as z.ZodType<{ screens: Screen[] }>,
                settingsDefaults: settingsDefaults as Patch,
                themeDefaults,
                backend: ( identity: string, given: ConfigInput["contracts"], currency: string ): Backend =>
                    backendOf(identity, given as ContractsInput, currency),
                walk: ( screen: Screen, options: Record<string, unknown>, config: Config & SurfaceConfig ) =>
                    hooks.walk(screen, options as ScreenOptions, config),
                screen: (
                    screen: Screen,
                    options: Record<string, unknown>,
                    config: Config & SurfaceConfig,
                    compiled: CompiledScreen<Block>,
                    issues: string[],
                ) => ({
                    ...compiledScreen(screen, options as ScreenOptions, compiled),
                    ...(hooks.screen?.(screen, options as ScreenOptions, config, compiled, issues) ?? ({} as R)),
                }),
                screenIssues: hooks.screenIssues,
                featureIssues: hooks.featureIssues,
                schema: (
                    screens: (CompiledShape<Screen, ScreenOptions, Block> & R)[],
                    facts: { features: string[]; operations: string[] },
                    shell: Record<string, ShellPart>,
                ) => ({
                    screens,
                    ...facts,
                    shell: shell as Record<SH, ShellPart>,
                    ...(hooks.schema?.(screens) ?? ({} as E)),
                }),
            };

            return surfaceValidator(surface as never) as Validator<
                Config,
                CompiledSchemaBase<CompiledShape<Screen, ScreenOptions, Block> & R, SH> & E
            >;

        },
    };

}

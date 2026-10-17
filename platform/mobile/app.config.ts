import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { ConfigContext, ExpoConfig } from "expo/config";
import { type ConfigPlugin, withAndroidStyles, withMainApplication } from "expo/config-plugins.js";

type Font = { fontFamily: string; fontDefinitions: { path: string; weight: number }[] };
type Meta = { identity: string; insecure: boolean; icons: string; fonts: Font[]; app: { name: string; slug: string; scheme: string; icon: string | null; background: string } };

const root = import.meta.dirname;

function compiled (): Meta {
    const mode = process.env.NODE_ENV === "production" ? "production" : "development";
    const path = resolve(root, "node_modules/.cache/spec", mode, "meta.json");

    if ( !existsSync(path) ) throw new Error(`No compiled spec for ${mode}: run \`bun tools/compile/index.ts ${mode}\` first.`);

    return JSON.parse(readFileSync(path, "utf8")) as Meta;
}
const bareWindow: ConfigPlugin = ( config ) => withAndroidStyles(config, ( styles ) => {
    const theme = styles.modResults.resources.style?.find(( style ) => style.$.name === "AppTheme");

    if ( theme ) theme.item = [...theme.item.filter(( item ) => item.$.name !== "android:windowBackground"), { $: { name: "android:windowBackground" }, _: "@null" }];

    return styles;
});
const nativeFlags: Readonly<Record<string, boolean>> = {
    useNativeViewConfigsInBridgelessMode: false,
    enablePreparedTextLayout: true,
    enableAndroidTextMeasurementOptimizations: true,
    useOptimizedViewRegistryOnAndroid: true,
    enableDifferentiatorMutationVectorPreallocation: true,
};
const featureFlags: ConfigPlugin = ( config ) => withMainApplication(config, ( app ) => {
    const flags = "com.facebook.react.internal.featureflags";
    const entry = "loadReactNative(this)\n";
    const overrides = Object.entries(nativeFlags).map(( [name, value] ) => `override fun ${name}(): Boolean = ${value}`).join("; ");

    if ( !app.modResults.contents.includes(entry) ) throw new Error("MainApplication no longer calls loadReactNative(this): move the feature flag override.");

    app.modResults.contents = app.modResults.contents.replace(entry, `${entry}    if (DefaultNewArchitectureEntryPoint.releaseLevel == ReleaseLevel.STABLE) ${flags}.ReactNativeFeatureFlags.dangerouslyForceOverride(object : ${flags}.ReactNativeNewArchitectureFeatureFlagsDefaults() { ${overrides} })\n`);

    return app;
});
const push = process.env.GOOGLE_SERVICES_JSON ? resolve(root, process.env.GOOGLE_SERVICES_JSON) : undefined;

if ( push && !existsSync(push) ) throw new Error(`No Firebase file at ${push}.`);

export default ( { config }: ConfigContext ): ExpoConfig => {
    const { identity, insecure, icons, fonts, app } = compiled();
    const build: [string, Record<string, unknown>] = ["expo-build-properties", {
        android: { usesCleartextTraffic: insecure, enableMinifyInReleaseBuilds: true, enableShrinkResourcesInReleaseBuilds: true, enableBundleCompression: false },
    }];

    return featureFlags(bareWindow({
        ...config,
        name: app.name,
        slug: app.slug,
        scheme: app.scheme,
        version: config.version ?? "1.0.0",
        orientation: "portrait",
        userInterfaceStyle: "automatic",
        ...(app.icon ? { icon: app.icon } : {}),
        plugins: [
            ["expo-location", { locationWhenInUsePermission: "Your location fills your address." }],
            ["expo-image-picker", { photosPermission: "Your photos become your profile picture.", cameraPermission: "The camera takes your profile picture." }],
            ["expo-notifications", { defaultChannel: "default" }],
            "expo-localization",
            ["expo-font", { fonts: [icons], android: { fonts } }],
            ...(app.icon ? [["expo-splash-screen", { backgroundColor: app.background, image: app.icon }] as [string, Record<string, unknown>]] : []),
            build,
        ],
        android: {
            package: process.env.APP_PACKAGE ?? `com.${app.slug}.lab`,
            ...(push ? { googleServicesFile: push } : {}),
            ...config.android,
        },
        experiments: { tsconfigPaths: true, reactCompiler: true },
        extra: { ...config.extra, spec: identity, ...(process.env.APP_PROJECT ? { eas: { projectId: process.env.APP_PROJECT } } : {}) },
    }));
};

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { ConfigContext, ExpoConfig } from "expo/config";

type Meta = { identity: string; app: { name: string; slug: string; scheme: string; icon: string | null; background: string } };

const root = import.meta.dirname;

function compiled (): Meta {

    const mode = process.env.NODE_ENV === "production" ? "production" : "development";
    const path = resolve(root, "node_modules/.cache/spec", mode, "meta.json");

    if ( !existsSync(path) ) throw new Error(`No compiled spec for ${mode}: run \`bun tools/compile/index.ts ${mode}\` first.`);

    return JSON.parse(readFileSync(path, "utf8")) as Meta;

}
const lab: [string, Record<string, unknown>] = ["expo-build-properties", { android: { usesCleartextTraffic: true } }];
const push = resolve(root, "google-services.json");
const labProject = "aec4ba01-bed1-4811-8ab3-50f5f5b202ac";

export default ( { config }: ConfigContext ): ExpoConfig => {

    const { identity, app } = compiled();

    return {
        ...config,
        name: app.name,
        slug: app.slug,
        scheme: app.scheme,
        version: config.version ?? "1.0.0",
        orientation: "portrait",
        userInterfaceStyle: "automatic",
        ...(app.icon ? { icon: app.icon } : {}),
        plugins: [
            "expo-router",
            ["expo-location", { locationWhenInUsePermission: "Your location fills your address." }],
            ["expo-image-picker", { photosPermission: "Your photos become your profile picture.", cameraPermission: "The camera takes your profile picture." }],
            ["expo-notifications", { defaultChannel: "default" }],
            "expo-localization",
            ...(app.icon ? [["expo-splash-screen", { backgroundColor: app.background, image: app.icon }] as [string, Record<string, unknown>]] : []),
            ...(process.env.APP_LAB === "1" ? [lab] : []),
        ],
        android: {
            package: process.env.APP_LAB === "1" && existsSync(push) ? "com.zainlak.app" : `com.${app.slug}.lab`,
            ...(process.env.APP_LAB === "1" && existsSync(push) ? { googleServicesFile: push } : {}),
            ...config.android,
        },
        experiments: { typedRoutes: true, tsconfigPaths: true },
        extra: { ...config.extra, spec: identity, ...(process.env.APP_LAB === "1" && existsSync(push) ? { eas: { projectId: labProject } } : {}) },
    };

};

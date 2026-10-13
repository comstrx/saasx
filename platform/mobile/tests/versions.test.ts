import { describe, expect, test } from "bun:test";
import bundled from "../node_modules/expo/bundledNativeModules.json" with { type: "json" };
import manifest from "../package.json" with { type: "json" };

const expected = bundled as Record<string, string>;
const pinned = { ...manifest.dependencies, ...manifest.devDependencies } as Record<string, string>;

describe("expo-bundled versions", () => {

    test("every dependency Expo bundles is pinned inside the range Expo expects", () => {

        const drift = Object.entries(pinned)
            .filter(( [name] ) => name in expected)
            .filter(( [name, version] ) => !Bun.semver.satisfies(version, expected[name] ?? ""))
            .map(( [name, version] ) => `${name}: pinned ${version}, Expo expects ${expected[name]}`);

        expect(drift).toEqual([]);

    });

});

import { describe, expect, test } from "bun:test";
import manifest from "../package.json" with { type: "json" };

const host = /^(expo|expo-.*|@expo\/.*|react|react-dom|react-native|react-native-.*|@react-native\/.*|@react-native-.*)$/;
const tooling = /^(@biomejs\/biome|@types\/.*|typescript)$/;

describe("dependencies", () => {

    test("the part declares host packages only; every library reaches it through the engine", () => {

        const strangers = Object.keys(manifest.dependencies).filter(( name ) => !host.test(name));
        const strangeTools = Object.keys(manifest.devDependencies).filter(( name ) => !tooling.test(name));

        expect(strangers).toEqual([]);
        expect(strangeTools).toEqual([]);

    });

});

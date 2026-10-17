import { describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { createTools } from "engine/tooling";

function toolsAt ( root: string ) {

    return createTools({
        root,
        variable: "SPEC",
        locales: ["en"],
        catalogue: { operations: [], features: [] } as never,
        validate: (( input: unknown ) => input) as never,
        assets: [],
        architecture: { foundation: /^engine\//, html: true, owners: {}, layers: [] },
    });

}

describe("spec loader", () => {

    test("specs are named in lowercase words, the demo first behind its leading underscore", () => {

        const root = mkdtempSync(resolve(tmpdir(), "engine-specs-"));

        for ( const spec of ["shop", "_demo"] ) mkdirSync(resolve(root, "specs", spec, "config"), { recursive: true });

        const tools = toolsAt(root);

        expect(tools.loader.installedSpecs()).toEqual(["_demo", "shop"]);
        expect(tools.loader.selectSpec()).toBe("_demo");
        expect(tools.loader.selectSpec("shop")).toBe("shop");
        expect(() => tools.loader.selectSpec("__demo")).toThrow("leading underscore");
        expect(() => tools.loader.selectSpec("Shop")).toThrow("leading underscore");

    });
    test("parenthesized folders group specs at any depth, a plain folder is the spec, and a name exists once", () => {

        const root = mkdtempSync(resolve(tmpdir(), "engine-groups-"));
        const tools = toolsAt(root);

        for ( const spec of ["_demo", "(shop)/client", "(shop)/(v1)/(stage)/admin", "(shop)/vendor/(v1)"] ) {

            mkdirSync(resolve(root, "specs", spec, "config"), { recursive: true });

        }

        expect(tools.loader.installedSpecs()).toEqual(["_demo", "admin", "client", "vendor"]);
        expect(tools.loader.specFolder("admin")).toBe(resolve(root, "specs/(shop)/(v1)/(stage)/admin"));
        expect(tools.loader.specFolder("vendor")).toBe(resolve(root, "specs/(shop)/vendor"));

        mkdirSync(resolve(root, "specs", "(other)", "client", "schema"), { recursive: true });

        expect(() => tools.loader.installedSpecs()).toThrow("exists twice");

    });

});

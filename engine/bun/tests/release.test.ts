import { describe, expect, test } from "bun:test";
import { changelog, packOrder, versioned } from "../tools/release/lib.ts";

const manifests = {
    "packages/base/package.json": { name: "@engine/base", version: "0.1.0", dependencies: {} },
    "packages/error/package.json": {
        name: "@engine/error",
        version: "0.1.0",
        dependencies: { "@engine/base": "workspace:*" },
    },
    "packages/api/package.json": {
        name: "@engine/api",
        version: "0.1.0",
        dependencies: { "@engine/error": "workspace:*", "@engine/base": "workspace:*", zod: "4.6.5" },
    },
};

describe("release", () => {
    test("every package moves to the one engine version in lockstep, workspace links untouched", () => {
        const next = versioned(manifests, "0.2.0");

        expect(Object.values(next).map((manifest) => manifest.version)).toEqual(["0.2.0", "0.2.0", "0.2.0"]);
        expect(next["packages/api/package.json"]?.dependencies).toEqual(
            manifests["packages/api/package.json"].dependencies,
        );
        expect(() => versioned(manifests, "2")).toThrow("semver");
    });
    test("packages pack in dependency order, so a consumer can install each after the ones it needs", () => {
        expect(packOrder(manifests)).toEqual(["@engine/base", "@engine/error", "@engine/api"]);
    });
    test("the changelog groups engine commits by package and leaves the rest of the repository out", () => {
        const lines = [
            "a1 engine(validate): zod/mini behind the classic chain",
            "b2 web(form): autosave option",
            "c3 engine(form): object fields under dotted names, and autosave",
            "d4 engine(xtask): semver baseline",
            "e5 global(security): gitleaks",
        ];
        const text = changelog("0.2.0", "2026-10-13", lines);

        expect(text).toContain("## 0.2.0 (2026-10-13)");
        expect(text).toContain("### validate\n- zod/mini behind the classic chain (a1)");
        expect(text).toContain("### form\n- object fields under dotted names, and autosave (c3)");
        expect(text).toContain("### xtask");
        expect(text).not.toContain("web(form)");
        expect(text).not.toContain("gitleaks");
    });
});

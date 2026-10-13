import { describe, expect, test } from "bun:test";

type Manifest = { name: string; dependencies?: Record<string, string> };

const root = `${import.meta.dir}/../packages`;
const names = [...new Bun.Glob("*/package.json").scanSync({ cwd: root })]
    .map((path) => path.split("/")[0] ?? "")
    .sort();
const manifests = new Map(
    await Promise.all(
        names.map(async (name) => [name, (await Bun.file(`${root}/${name}/package.json`).json()) as Manifest] as const),
    ),
);
const sources = new Map(
    await Promise.all(
        names.map(async (name) => {
            const files = [...new Bun.Glob("*.ts").scanSync({ cwd: `${root}/${name}/src` })];
            const texts = await Promise.all(files.map((file) => Bun.file(`${root}/${name}/src/${file}`).text()));

            return [name, texts.join("\n")] as const;
        }),
    ),
);
const declared = (name: string): string[] => {
    return Object.keys(manifests.get(name)?.dependencies ?? {})
        .filter((dependency) => dependency.startsWith("@engine/"))
        .map((dependency) => dependency.slice("@engine/".length));
};
const imported = (name: string): string[] => {
    const found = new Set<string>();

    for (const match of (sources.get(name) ?? "").matchAll(/from "@engine\/([a-z]+)"/g)) found.add(match[1] ?? "");

    return [...found].sort();
};
const cycle = (name: string, trail: string[]): string[] | undefined => {
    if (trail.includes(name)) return [...trail, name];

    for (const next of declared(name)) {
        const found = cycle(next, [...trail, name]);

        if (found) return found;
    }

    return undefined;
};

describe("package graph", () => {
    test("every package is named after its folder under the engine scope", () => {
        for (const name of names) expect(manifests.get(name)?.name).toBe(`@engine/${name}`);
    });
    test("every engine import is a declared dependency", () => {
        for (const name of names) {
            const missing = imported(name).filter((dependency) => !declared(name).includes(dependency));

            expect({ name, missing }).toEqual({ name, missing: [] });
        }
    });
    test("every declared engine dependency is used", () => {
        for (const name of names) {
            const unused = declared(name).filter((dependency) => !imported(name).includes(dependency));

            expect({ name, unused }).toEqual({ name, unused: [] });
        }
    });
    test("the graph has no cycles", () => {
        for (const name of names) expect(cycle(name, [])).toBeUndefined();
    });
    test("base depends on nothing", () => {
        expect(declared("base")).toEqual([]);
    });
});

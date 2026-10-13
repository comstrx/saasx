import { describe, expect, test } from "bun:test";

const root = `${import.meta.dir}/../packages`;
const names = [...new Bun.Glob("*/package.json").scanSync({ cwd: root })]
    .map(( path ) => path.split("/")[0] ?? "")
    .sort();
const sources = await Promise.all(
    names.map(async ( name ) => {

        const files = [...new Bun.Glob("**/*.ts").scanSync({ cwd: `${root}/${name}/src` })];
        const texts = await Promise.all(
            files.map(async ( file ) => [file, await Bun.file(`${root}/${name}/src/${file}`).text()] as const),
        );

        return [name, Object.fromEntries(texts)] as const;

    }),
);
const tests = [...new Bun.Glob("*.test.ts").scanSync({ cwd: `${import.meta.dir}` })];
const codeOf = ( text: string ): string => text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

describe("package laws", () => {

    test("every package is reached by at least one test file", () => {

        const covered = ( name: string ) =>
            tests.some(( file ) => file.startsWith(`${name}.`) || file.startsWith(`${name}-`));
        const aliases: Record<string, string[]> = {
            spec: ["surface", "schema", "ports", "contract"],
            api: ["contract.fixture"],
        };
        const untested = names.filter(( name ) => !covered(name) && !(aliases[name] ?? []).some(covered));

        expect(untested).toEqual([]);

    });
    test("only context and tooling may import react or the host runtime", () => {

        const offenders = sources.flatMap(( [name, files] ) =>
            Object.entries(files).flatMap(( [file, text] ) => {

                const code = codeOf(text);
                const react = /from "react"/.test(code) || /from "zustand/.test(code);
                const host = /from "node:|from "bun|\bprocess\.|\bBun\./.test(code);

                if ( react && name !== "context" ) return [`${name}/${file} imports react`];

                if ( host && name !== "tooling" ) return [`${name}/${file} touches the host runtime`];

                return [];

            }),
        );

        expect(offenders).toEqual([]);

    });
    test("no package names a product, a backend or a surface", () => {

        const banned = /\b(zainlak|next\.js|nextjs|expo|react-native|laravel)\b/i;
        const offenders = sources.flatMap(( [name, files] ) =>
            Object.entries(files).flatMap(( [file, code] ) => (banned.test(code) ? [`${name}/${file}`] : [])),
        );

        expect(offenders).toEqual([]);

    });
    test("no package carries a style value or a product feature; those are the parts' to give", () => {

        const banned = /#[0-9a-fA-F]{6}\b|\b\d+px\b|cubic-bezier|"(?:USD|EUR|SAR|EGP)"|\b(?:catalogs?|manage|staff|announcements?|hotel|booking)\b/;
        const offenders = sources.flatMap(( [name, files] ) =>
            Object.entries(files).flatMap(( [file, code] ) => (banned.test(code) ? [`${name}/${file}`] : [])),
        );

        expect(offenders).toEqual([]);

    });
    test("every public export comes from the package index, never from a sibling's internals", () => {

        const offenders = sources.flatMap(( [name, files] ) =>
            Object.entries(files).flatMap(( [file, code] ) =>
                [...code.matchAll(/from "@engine\/([a-z]+)\/([^"]+)"/g)].map(
                    ( match ) => `${name}/${file} reaches into ${match[1]}/${match[2]}`,
                ),
            ),
        );

        expect(offenders).toEqual([]);

    });

});

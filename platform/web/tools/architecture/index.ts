import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { report, root, task, walk } from "../core/index.ts";
import { apiParts, declarations, extensions, featureParts, flat, layer, source, structure } from "./rules.ts";
import { analyze } from "./source.ts";

type Sources = ReadonlyMap<string, string>;
type Graph = Map<string, string[]>;

function code ( directory: string ): string[] {

    return walk(directory).filter(( item ) => /\.[jt]sx?$/.test(item.entry.name)).map(( item ) => item.path);

}
export function sources (): Map<string, string> {

    const paths = [...code(source), ...code(resolve(root, "specs"))];

    return new Map(paths.map(( path ) => [relative(source, path), readFileSync(path, "utf8")]));

}
function layers ( tree: string ): string[] {

    return readdirSync(tree)
        .filter(( entry ) => !structure.includes(entry))
        .map(( entry ) => `src/ holds the fixed layers only: ${entry}`);

}
function nesting ( tree: string ): string[] {

    return flat.flatMap(( folder ) => readdirSync(resolve(tree, folder), { withFileTypes: true })
        .filter(( entry ) => entry.isDirectory())
        .map(( entry ) => `src/${folder}/ must stay flat: ${entry.name}`));

}
function feature ( tree: string, name: string ): string[] {

    const folder = `src/features/${name}/`;
    const parts = readdirSync(resolve(tree, "features", name), { withFileTypes: true }).filter(( entry ) => !entry.name.startsWith("."));
    const strangers = parts.filter(( entry ) => !featureParts.includes(entry.name) || entry.isDirectory() === (entry.name === "index.tsx"));
    const paired = existsSync(resolve(tree, "api", "features", `${name}.ts`));

    return [
        ...(parts.some(( entry ) => entry.name === "index.tsx") ? [] : [`${folder} needs its entry index.tsx`]),
        ...strangers.map(( entry ) => `${folder} holds index.tsx, components/ and hooks/ only: ${entry.name}`),
        ...(paired ? [] : [`${folder} declares its calls and permissions in src/api/features/${name}.ts`]),
    ];

}
function features ( tree: string ): string[] {

    const entries = readdirSync(resolve(tree, "features"), { withFileTypes: true }).filter(( entry ) => !entry.name.startsWith("."));

    return entries.flatMap(( entry ) => {

        return entry.isDirectory() ? feature(tree, entry.name) : [`src/features/ contains feature directories only: ${entry.name}`];

    });

}
function api ( tree: string ): string[] {

    return readdirSync(resolve(tree, "api"), { withFileTypes: true })
        .filter(( entry ) => !entry.isDirectory() || !apiParts.includes(entry.name))
        .map(( entry ) => `src/api/ holds core/, features/ and workflow/ only: ${entry.name}`);

}
export function layoutIssues ( tree: string = source ): string[] {

    return [...layers(tree), ...nesting(tree), ...features(tree), ...api(tree)];

}
function target ( path: string, name: string, sources: Sources ): string | undefined {

    const local = name.startsWith(".") ? relative(source, resolve(source, dirname(path), name)) : null;
    const candidate = name.startsWith("@/") ? name.slice(2) : local;

    return candidate === null ? undefined : extensions.map(( suffix ) => candidate + suffix).find(( value ) => sources.has(value));

}
function edgeIssues ( path: string, to: string ): string[] {

    const feature = /^features\/([^/]+)\/(?:hooks|components)\//.exec(to);

    return [
        ...(to.startsWith("../specs/") && !path.startsWith("../specs/") ? [`${path}: direct project import; use lib/spec.`] : []),
        ...(layer(to) > layer(path) ? [`${path}: upward dependency on ${to}`] : []),
        ...(feature && !path.startsWith(`features/${feature[1]}/`) ? [`${path}: feature internals must stay private: ${to}`] : []),
    ];

}
function cycle ( graph: Graph, path: string, chain: string[], seen: Set<string>, problems: string[] ): void {

    if ( chain.includes(path) ) {

        problems.push(`Import cycle: ${[...chain, path].join(" -> ")}`);
        return;

    }

    if ( seen.has(path) ) return;
    seen.add(path);

    for ( const child of graph.get(path) ?? [] ) {

        cycle(graph, child, [...chain, path], seen, problems);

    }

}
export function inspect ( sources: Sources ): string[] {

    const problems: string[] = [];
    const graph: Graph = new Map();
    const seen = new Set<string>();

    for ( const [path, code] of sources ) {

        const { imports, types, issues } = analyze(path, code);
        const edges = imports.flatMap(( name ) => target(path, name, sources) ?? []);
        const shapes = declarations.some(( entry ) => path.startsWith(entry)) ? [] : types.flatMap(( name ) => target(path, name, sources) ?? []);

        problems.push(
            ...issues.map(( issue ) => `${path}: ${issue}`),
            ...edges.flatMap(( to ) => edgeIssues(path, to)),
            ...shapes.filter(( to ) => layer(to) > layer(path)).map(( to ) => `${path}: upward type dependency on ${to}`),
        );
        graph.set(path, edges);

    }
    for ( const path of graph.keys() ) {

        cycle(graph, path, [], seen, problems);

    }

    return problems;

}
function check (): void {

    const problems = [...inspect(sources()), ...layoutIssues()];

    report(problems.length ? problems.join("\n") : "Architecture: layers, imports and cycles passed.");
    process.exitCode = problems.length ? 1 : 0;

}

task(import.meta.url, check);

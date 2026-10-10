import { dirname, relative, resolve } from "node:path";
import { parse } from "@babel/parser";
import type { Node } from "@babel/types";
import { failure } from "../core/index.ts";
import { optionsOf } from "../features/index.ts";
import {
    executable, featureComponent, featureEntry, foundation, helpers, hookFiles, layer, markup, markupFiles, owners, source,
} from "./rules.ts";

type Context = {
    path: string;
    element: boolean;
    document: boolean;
    page: boolean;
    vendor: boolean;
    spec: boolean;
    api: boolean;
    entry?: string;
    component?: string;
};
type Reference = { name: string; typeOnly: boolean } | "dynamic" | undefined;
type Analysis = { imports: string[]; types: string[]; issues: string[]; jsx: boolean };

function context ( path: string ): Context {

    return {
        path,
        element: markup.some(( folder ) => path.startsWith(`${folder}/`)),
        document: ["app/[locale]/layout.tsx", "app/global-error.tsx"].includes(path),
        page: /(^|\/)page\.tsx$/.test(path),
        vendor: path.startsWith("lib/providers/"),
        spec: path.startsWith("../specs/"),
        api: path.startsWith("api/"),
        entry: featureEntry.exec(path)?.[1],
        component: featureComponent.exec(path)?.[1],
    };

}
function walk ( node: unknown, visit: ( node: Node ) => void ): void {

    if ( !node || typeof node !== "object" ) return;
    if ( "type" in node && typeof node.type === "string" ) visit(node as Node);

    for ( const value of Object.values(node) ) {

        if ( Array.isArray(value) ) value.forEach(( child ) => { walk(child, visit); });
        else if ( value && typeof value === "object" ) walk(value, visit);

    }

}
function literal ( node: Node | undefined ): Reference {

    return node?.type === "StringLiteral" ? { name: node.value, typeOnly: false } : "dynamic";

}
function reference ( node: Node ): Reference {

    if ( node.type === "ImportDeclaration" ) {

        return { name: node.source.value, typeOnly: node.importKind === "type" };

    }
    if ( (node.type === "ExportNamedDeclaration" || node.type === "ExportAllDeclaration") && node.source ) {

        return { name: node.source.value, typeOnly: node.exportKind === "type" };

    }
    if ( node.type === "ImportExpression" ) {

        return literal(node.source);

    }
    if ( node.type !== "CallExpression" || node.callee.type !== "Import" ) {

        return undefined;

    }

    return literal(node.arguments[0]);

}
function dependencyIssues ( { path, spec, vendor, entry, component }: Context, name: string, reasoned: boolean ): string[] {

    const selected = name.startsWith("@spec/");
    const target = name.startsWith(".") ? relative(source, resolve(source, dirname(path), name)) : "";
    const standard = name.startsWith("@/") ? relative(source, resolve(source, name.slice(2))) : target;
    const external = !name.startsWith(".") && !name.startsWith("@/") && !selected && !foundation.test(name);
    const own = entry !== undefined && (target.startsWith(`features/${entry}/components/`) || foundation.test(name));
    const bare = component !== undefined && standard.startsWith("elements/") && !reasoned;

    return [
        ...(selected && !owners[path]?.includes(name) ? ["Selected specs belong behind lib/spec."] : []),
        ...(external && !vendor ? [`Third-party imports belong in lib/providers: ${name}`] : []),
        ...(spec && target !== "lib/spec/define.ts" && !target.startsWith(`${path.split("/").slice(0, 3).join("/")}/`)
            ? ["Specs may import their own modules and typed define helpers only."] : []),
        ...(layer(path) === 0 && !spec && !vendor && !standard.startsWith("lib/std/") ? ["Standard utilities must stay framework-independent."] : []),
        ...(entry !== undefined && !own ? [`A feature entry is thin: it imports its own components only, not ${name}`] : []),
        ...(bare ? [`Features build on components; an element needs a reason comment (// element: …): ${name}`] : []),
    ];

}
function reasoned ( node: Node ): boolean {

    return (node.leadingComments ?? []).some(( comment ) => /\belement:/.test(comment.value));

}
function extensionIssues ( { path, spec }: Context, jsx: boolean ): string[] {

    if ( spec ) return [];

    const stem = path.replace(/\.[jt]sx?$/, "");
    const tsx = /\.[jt]sx$/.test(path);

    if ( markupFiles.test(stem) ) return tsx ? [] : ["Markup files end in .tsx."];
    if ( hookFiles.test(path) ) return tsx || jsx ? ["Hooks are logic: a .ts file without markup."] : [];
    if ( jsx && !tsx ) return ["Markup belongs in a .tsx file."];

    return tsx && !jsx ? ["No markup here: a .ts file."] : [];

}
function entryIssues ( { entry, path }: Context, code: string ): string[] {

    if ( entry === undefined ) return [];

    try { return optionsOf(code, path) === undefined ? ["A feature entry exports its options as a literal object."] : []; }
    catch ( error ) { return [failure(error).replace(`${path}.`, "")]; }

}
function specIssues ( { spec }: Context, node: Node ): string[] {

    if ( !spec ) return [];
    if ( executable.includes(node.type) ) return ["Specs are declarative data; execution and branching belong in src."];

    const helper = node.type === "CallExpression" && node.callee.type === "Identifier" && helpers.includes(node.callee.name);

    return node.type === "CallExpression" && !helper ? ["Specs may call typed definition helpers only."] : [];

}
function markupIssues ( { element, document, page, api }: Context, node: Node ): string[] {

    const fetches = node.type === "CallExpression" && node.callee.type === "Identifier" && node.callee.name === "fetch";

    if ( fetches && !api ) {

        return ["Backend transport belongs in src/api."];

    }
    if ( node.type === "JSXOpeningElement" && node.name.type === "JSXIdentifier" && /^[a-z]/.test(node.name.name) ) {

        const tag = node.name.name;
        const allowed = (document && ["html", "body"].includes(tag)) || (page && tag === "script");

        return element || allowed ? [] : [`HTML belongs in elements: ${tag}`];

    }

    const attribute = node.type === "JSXAttribute" && node.name.type === "JSXIdentifier" ? node.name.name : undefined;
    const styled = attribute !== undefined && ["className", "style", "css"].includes(attribute);

    return styled && !element ? ["Styling belongs in elements."] : [];

}
function ownershipIssues ( path: string, directives: { value: { value: string } }[], imports: string[] ): string[] {

    if ( !/^features\/[^/]+\/index\.[jt]sx?$/.test(path) ) return [];

    const client = directives.some(( directive ) => directive.value.value === "use client");

    return client || imports.includes("server-only") ? [] : ["Feature entries must explicitly declare client or server ownership."];

}
function visit ( scope: Context, node: Node, result: Analysis ): void {

    const found = reference(node);

    result.issues.push(...specIssues(scope, node));

    if ( found === "dynamic" ) {

        result.issues.push("Use explicit dynamic import paths.");

    }
    if ( found && found !== "dynamic" ) {

        if ( found.typeOnly ) result.types.push(found.name);
        else {

            result.imports.push(found.name);
            result.issues.push(...dependencyIssues(scope, found.name, reasoned(node)));

        }

    }

    if ( node.type === "JSXElement" || node.type === "JSXFragment" ) result.jsx = true;

    result.issues.push(...markupIssues(scope, node));

}
export function analyze ( path: string, code: string ): Analysis {

    const ast = parse(code, { sourceType: "module", plugins: ["typescript", "jsx"] });
    const scope = context(path);
    const result: Analysis = { imports: [], types: [], issues: [], jsx: false };

    walk(ast, ( node ) => { visit(scope, node, result); });

    result.issues.push(
        ...ownershipIssues(path, ast.program.directives, result.imports),
        ...extensionIssues(scope, result.jsx),
        ...entryIssues(scope, code),
    );

    return result;

}

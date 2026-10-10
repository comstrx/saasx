import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "@babel/parser";
import type { Node, ObjectExpression } from "@babel/types";
import { root } from "../core/index.ts";

type Options = Record<string, unknown>;
type FeatureFacts = { client: boolean; options: Options };

const folder = resolve(root, "src", "features");

function unwrap ( node: Node ): Node {

    const wrapped = node.type === "TSAsExpression" || node.type === "TSSatisfiesExpression" || node.type === "TSTypeAssertion";

    return wrapped ? unwrap(node.expression) : node;

}
function value ( node: Node, where: string ): unknown {

    const bare = unwrap(node);

    if ( bare.type === "StringLiteral" || bare.type === "NumericLiteral" || bare.type === "BooleanLiteral" ) return bare.value;
    if ( bare.type === "NullLiteral" ) return null;
    if ( bare.type === "UnaryExpression" && bare.operator === "-" && bare.argument.type === "NumericLiteral" ) return -bare.argument.value;
    if ( bare.type === "ArrayExpression" ) return bare.elements.map(( entry, index ) => item(entry, `${where}[${index}]`));
    if ( bare.type === "ObjectExpression" ) return object(bare, where);

    return fail(where);

}
function item ( node: Node | null, where: string ): unknown {

    return node && node.type !== "SpreadElement" ? value(node, where) : fail(where);

}
function nameOf ( node: Node, where: string ): string {

    if ( node.type === "Identifier" ) return node.name;
    if ( node.type === "StringLiteral" ) return node.value;

    return fail(where);

}
function fail ( where: string ): never {

    throw new Error(`${where}: feature options are literal values only (strings, numbers, booleans, null, arrays, objects).`);

}
function object ( node: ObjectExpression, where: string ): Options {

    const entries = node.properties.map(( property ) => {

        if ( property.type !== "ObjectProperty" || property.computed ) return fail(where);

        const key = nameOf(property.key, where);

        return [key, value(property.value, `${where}.${key}`)];

    });

    return Object.fromEntries(entries);

}
export function optionsOf ( code: string, where: string ): Options | undefined {

    const ast = parse(code, { sourceType: "module", plugins: ["typescript", "jsx"] });

    for ( const statement of ast.program.body ) {

        if ( statement.type !== "ExportNamedDeclaration" || statement.declaration?.type !== "VariableDeclaration" ) continue;

        for ( const declarator of statement.declaration.declarations ) {

            if ( declarator.id.type !== "Identifier" || declarator.id.name !== "options" || !declarator.init ) continue;

            const literal = unwrap(declarator.init);

            return literal.type === "ObjectExpression" ? object(literal, `${where}.options`) : fail(`${where}.options`);

        }

    }

    return undefined;

}
function featureNames (): string[] {

    if ( !existsSync(folder) ) return [];

    return readdirSync(folder, { withFileTypes: true }).filter(( entry ) => entry.isDirectory()).map(( entry ) => entry.name).sort();

}
export function featureFacts (): Record<string, FeatureFacts> {

    const entries = featureNames().flatMap(( name ) => {

        const entry = resolve(folder, name, "index.tsx");

        if ( !existsSync(entry) ) return [];

        const code = readFileSync(entry, "utf8");
        const client = /^\s*(?:"use client"|'use client');?/m.test(code.split("\n").slice(0, 3).join("\n"));

        return [[name, { client, options: optionsOf(code, `features/${name}`) ?? {} }] as const];

    });

    return Object.fromEntries(entries);

}

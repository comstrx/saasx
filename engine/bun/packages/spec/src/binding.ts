import { isRecord } from "engine/base";
import { templateKeys } from "engine/parse";
import type { FieldFact } from "engine/validate";
import type { OperationFacts, Walk } from "./compile.ts";
import type { Binding, CompiledPort, Live, Manifest, Port, SiteFeature, Value } from "./shapes.ts";

export const emptyManifest: Manifest = { owner: "server", options: {}, ports: {}, access: [], signals: [] };
function operationOf<B> ( walk: Walk<B>, name: string, where: string ) {

    const [feature = "", operation = ""] = name.split(".");
    const facts = walk.catalogue[feature]?.[operation];

    if ( !walk.backend ) walk.issues.push(`${where}: ${name} needs a backend; this spec declares none.`);
    if ( !facts ) walk.issues.push(`${where}: no operation named ${name} in the catalogue.`);

    return facts ? { feature, operation, facts } : undefined;

}
function inputIssues<B> ( walk: Walk<B>, input: Record<string, Value>, facts: OperationFacts, where: string ): void {

    const strangers = Object.keys(input).filter(( key ) => !facts.input.includes(key));
    const params = templateKeys(facts.path).filter(( key ) => !(Object.hasOwn(input, key) || walk.params.includes(key)));

    if ( strangers.length ) walk.issues.push(`${where}: unknown input ${strangers.join(", ")}.`);
    if ( params.length ) walk.issues.push(`${where}: path parameter {${params.join("}, {")}} is not bound.`);

    for ( const [key, value] of Object.entries(input) ) {

        if ( isRecord(value) && "param" in value && !walk.params.includes(value.param) ) {

            walk.issues.push(`${where}.${key}: the screen path has no :${value.param}.`);

        }

        if ( isRecord(value) && "signal" in value ) walk.consumed.add(value.signal);

    }

}
export function consumesSignal ( entry: SiteFeature<unknown> ): boolean {

    return Object.values(entry.ports ?? {}).some(
        ( binding ) =>
            ("live" in binding && binding.live !== undefined) ||
            ("input" in binding &&
                Object.values(binding.input ?? {}).some(( value ) => isRecord(value) && "signal" in value)),
    );

}
function fieldIssues ( fields: readonly string[], present: readonly string[] | undefined, where: string ): string[] {

    if ( present === undefined ) return [];

    const missing = fields.filter(( field ) => !present.includes(field));

    return missing.length ? [`${where}: the bound source lacks ${missing.join(", ")}.`] : [];

}
function rowKeys ( value: unknown ): string[] | undefined {

    if ( Array.isArray(value) ) return value.length ? rowKeys(value[0]) : undefined;

    return isRecord(value) ? Object.keys(value) : [];

}
function readPort<B> (
    walk: Walk<B>,
    name: string,
    port: Port,
    binding: { read: string; input?: Record<string, Value> | undefined; live?: Live | undefined },
    where: string,
): CompiledPort | undefined {

    const found = operationOf(walk, binding.read, where);

    if ( !found ) return undefined;
    if ( port.kind === "write" ) walk.issues.push(`${where}: port ${name} takes a write, not a read.`);
    if ( found.facts.method !== "GET" ) walk.issues.push(`${where}: ${binding.read} is not a read.`);

    if ( port.kind === "list" && !found.facts.many ) {

        walk.issues.push(`${where}: port ${name} wants a list; ${binding.read} answers one row.`);

    }

    if ( port.kind === "one" && found.facts.many ) {

        walk.issues.push(`${where}: port ${name} wants one row; ${binding.read} answers a list.`);

    }

    inputIssues(walk, binding.input ?? {}, found.facts, where);
    walk.issues.push(...fieldIssues(port.fields ?? [], found.facts.output, where));
    walk.operations.add(binding.read);

    if ( binding.live && !walk.realtime ) walk.issues.push(`${where}: a live port needs contracts.realtime.`);

    if ( binding.live?.patch ) {

        const { key, version } = binding.live.patch;

        walk.issues.push(...fieldIssues(version ? [key, version] : [key], found.facts.output, `${where}.live.patch`));

    }

    return {
        kind: "read",
        feature: found.feature,
        operation: found.operation,
        input: binding.input ?? {},
        many: found.facts.many,
        ...(binding.live ? { live: binding.live } : {}),
    };

}
function editable (
    facts: OperationFacts,
    input: Record<string, Value>,
    chosen: readonly string[] | undefined,
): FieldFact[] {

    const free = facts.fields.filter(( field ) => !Object.hasOwn(input, field.name));

    if ( !chosen ) return free;

    return chosen.flatMap(( name ) => {

        const fact = free.find(( field ) => field.name === name);

        return fact ? [fact] : [];

    });

}
function writePort<B> (
    walk: Walk<B>,
    name: string,
    port: Port,
    binding: { write: string; input?: Record<string, Value> | undefined; fields?: string[] | undefined },
    where: string,
): CompiledPort | undefined {

    const found = operationOf(walk, binding.write, where);

    if ( !found ) return undefined;
    if ( port.kind !== "write" ) walk.issues.push(`${where}: port ${name} takes a ${port.kind}, not a write.`);
    if ( found.facts.method === "GET" ) walk.issues.push(`${where}: ${binding.write} is a read, not a write.`);

    const input = binding.input ?? {};
    const strangers = (binding.fields ?? []).filter(( field ) => !found.facts.input.includes(field));

    if ( strangers.length ) walk.issues.push(`${where}: ${binding.write} takes no ${strangers.join(", ")}.`);

    inputIssues(walk, input, found.facts, where);
    walk.operations.add(binding.write);

    return {
        kind: "write",
        feature: found.feature,
        operation: found.operation,
        input,
        fields: editable(found.facts, input, binding.fields),
        touches: found.facts.touches,
        permissions: found.facts.permissions,
    };

}
function shapeIssues ( port: Port, name: string, many: boolean, source: string, where: string ): string[] {

    return [
        ...(port.kind === "write" ? [`${where}: port ${name} takes a write; ${source} cannot be written.`] : []),
        ...(port.kind === "list" && !many ? [`${where}: port ${name} wants a list; ${source} is not one.`] : []),
        ...(port.kind === "one" && many ? [`${where}: port ${name} wants one row; ${source} is a list.`] : []),
    ];

}
function dataPort<B> ( walk: Walk<B>, name: string, port: Port, value: unknown, where: string ): CompiledPort {

    walk.issues.push(...shapeIssues(port, name, Array.isArray(value), "inline data", where));
    walk.issues.push(...fieldIssues(port.fields ?? [], rowKeys(value), where));

    return { kind: "data", value };

}
function sitePort<B> ( walk: Walk<B>, name: string, port: Port, field: string, where: string ): CompiledPort {

    const whole = field === "$";
    const value = whole ? walk.site : walk.site[field];

    if ( !(whole || Object.hasOwn(walk.site, field)) ) walk.issues.push(`${where}: the site document has no ${field}.`);

    walk.issues.push(...shapeIssues(port, name, Array.isArray(value), `site.${field}`, where));
    walk.issues.push(...fieldIssues(port.fields ?? [], rowKeys(value), where));

    return { kind: "site", path: field };

}
function compilePort<B> (
    walk: Walk<B>,
    name: string,
    port: Port,
    binding: Binding,
    where: string,
): CompiledPort | undefined {

    if ( "read" in binding ) return readPort(walk, name, port, binding, where);
    if ( "write" in binding ) return writePort(walk, name, port, binding, where);
    if ( "data" in binding ) return dataPort(walk, name, port, binding.data, where);

    return sitePort(walk, name, port, binding.site, where);

}
export function compilePorts<B> (
    walk: Walk<B>,
    manifest: Manifest,
    entry: SiteFeature<B>,
    where: string,
): Record<string, CompiledPort> {

    const given = entry.ports ?? {};
    const ports: Record<string, CompiledPort> = {};

    for ( const [name, binding] of Object.entries(given) ) {

        const port = manifest.ports[name];

        if ( !port ) {

            walk.issues.push(`${where}: feature ${entry.name} has no port ${name}.`);

            continue;

        }

        const compiled = compilePort(walk, name, port, binding, `${where}.ports.${name}`);

        if ( compiled ) ports[name] = compiled;

    }

    for ( const [name, port] of Object.entries(manifest.ports) ) {

        if ( port.required !== false && !Object.hasOwn(given, name) ) {

            walk.issues.push(`${where}: feature ${entry.name} needs its ${name} port bound.`);

        }

    }

    return ports;

}

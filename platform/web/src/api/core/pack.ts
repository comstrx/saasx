import { mapValues } from "../../lib/std/object.ts";
import type { Contract, Wire } from "./wire.ts";

type Operation = Contract["features"][string][string];
type Disabled = Extract<Operation, { enabled: false }>;
type Tables = { request: Wire["request"][]; response: Wire["response"][] };
type Indexes = { [K in keyof Tables]: Map<string, number> };
type PackedWire = Omit<Wire, keyof Tables> & { [K in keyof Tables]: number };

export type PackedContract = {
    values: Contract["values"];
    tables: Tables;
    features: Record<string, Record<string, PackedWire | Disabled>>;
};

function intern<T> ( table: T[], index: Map<string, number>, value: T ): number {

    const key = JSON.stringify(value);
    const found = index.get(key);

    if ( found !== undefined ) return found;

    const position = table.push(value) - 1;

    index.set(key, position);

    return position;

}
function entry<T> ( table: T[], position: number ): T {

    const value = table[position];

    if ( value === undefined ) throw new Error(`Packed contract has no table entry ${position}.`);

    return value;

}
function packWire ( wire: Operation, tables: Tables, indexes: Indexes ): PackedWire | Disabled {

    if ( !wire.enabled ) return wire;

    return {
        ...wire,
        request: intern(tables.request, indexes.request, wire.request),
        response: intern(tables.response, indexes.response, wire.response),
    };

}
function unpackWire ( wire: PackedWire | Disabled, tables: Tables ): Operation {

    if ( !wire.enabled ) return wire;

    return {
        ...wire,
        request: entry(tables.request, wire.request),
        response: entry(tables.response, wire.response),
    };

}
export function packContract ( contract: Contract ): PackedContract {

    const tables: Tables = { request: [], response: [] };
    const indexes: Indexes = { request: new Map(), response: new Map() };
    const features = mapValues(contract.features, ( operations ) => mapValues(operations, ( wire ) => packWire(wire, tables, indexes)));

    return { values: contract.values, tables, features };

}
export function unpackContract ( packed: PackedContract ): Contract {

    return {
        values: packed.values,
        features: mapValues(packed.features, ( operations ) => mapValues(operations, ( wire ) => unpackWire(wire, packed.tables))),
    };

}

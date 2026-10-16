import { removeBy, upsertBy } from "engine/array";
import { isRecord, pathGet } from "engine/base";
import type { Patch } from "engine/spec";
import { row, rows } from "./port.ts";

export type Patched = { value: unknown; applied: boolean };

function newer ( current: unknown, incoming: unknown, version: string | undefined ): boolean {

    if ( !version || !isRecord(current) || !isRecord(incoming) ) return true;

    const before = current[version];
    const after = incoming[version];

    if ( before === undefined || after === undefined ) return true;

    return String(after) >= String(before);

}
export function applyPatch ( current: unknown, many: boolean, event: string, data: unknown, patch: Patch ): Patched {

    const incoming = pathGet(data, patch.path);
    const untouched = { value: current, applied: false };

    if ( !isRecord(incoming) || incoming[patch.key] === undefined ) return untouched;

    const id = incoming[patch.key];
    const gone = event.endsWith(".deleted") || incoming.deleted === true;

    if ( many ) {

        const list = rows(current);
        const held = list.find(( item ) => item[patch.key] === id);

        if ( !held ) return untouched;
        if ( gone ) return { value: removeBy(list, patch.key, id), applied: true };
        if ( !newer(held, incoming, patch.version) ) return untouched;

        return { value: upsertBy(list, { ...held, ...incoming }, patch.key, false).items, applied: true };

    }

    const held = row(current);

    if ( !held || held[patch.key] !== id || gone || !newer(held, incoming, patch.version) ) return untouched;

    return { value: { ...held, ...incoming }, applied: true };

}

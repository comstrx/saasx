import { isRecord, isScalar } from "./object.ts";

export type UploadLimits = { fileBytes: number; totalBytes: number; count: number };

type Form = { body: FormData; sizes: number[]; limits: UploadLimits; depth: number };

const mebibyte = 1024 * 1024;
const formReserve = 256 * 1024;

export const uploadLimits = limitsOf(2 * mebibyte, 8 * mebibyte, 20);

function withinLimits ( sizes: readonly number[], limits: UploadLimits ): boolean {

    const total = sizes.reduce(( sum, size ) => sum + size, 0);

    return sizes.length <= limits.count && sizes.every(( size ) => size <= limits.fileBytes) && total <= limits.totalBytes;

}
export function limitsOf ( fileBytes: number, requestBytes: number, count: number ): UploadLimits {

    const totalBytes = Math.max(0, requestBytes - formReserve);

    return { fileBytes: Math.min(fileBytes, totalBytes), totalBytes, count };

}
function appendFile ( form: Form, key: string, file: Blob ): void {

    form.sizes.push(file.size);

    if ( !withinLimits(form.sizes, form.limits) ) throw new RangeError("Upload exceeds the allowed size.");

    form.body.append(key, file);

}
function append ( form: Form, key: string, item: unknown, level: number ): void {

    if ( level > form.depth ) throw new RangeError("Form data nests too deeply.");
    if ( item === undefined || item === null ) return;

    if ( item instanceof Blob ) {

        appendFile(form, key, item);
        return;

    }
    if ( Array.isArray(item) ) {

        item.forEach(( entry, index ) => { append(form, `${key}[${index}]`, entry, level + 1); });
        return;

    }
    if ( isRecord(item) ) {

        for ( const [part, entry] of Object.entries(item) ) {

            append(form, key ? `${key}[${part}]` : part, entry, level + 1);

        }
        return;

    }

    if ( !isScalar(item) ) throw new TypeError(`Unsupported form value: ${key}`);

    form.body.append(key, typeof item === "boolean" ? (item ? "1" : "0") : String(item));

}
export function toFormData ( value: Record<string, unknown>, limits = uploadLimits, depth = 12 ): FormData {

    const form: Form = { body: new FormData(), sizes: [], limits, depth };

    for ( const [key, item] of Object.entries(value) ) {

        append(form, key, item, 0);

    }

    return form.body;

}

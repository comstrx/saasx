import { Failure } from "engine/error";
import { formatBytes } from "engine/parse";

export type Limits = { maxBytes: number; maxFiles: number; types?: readonly string[] | undefined };
export type FileRef = { uri: string; name: string; type: string };
export type Part = Blob | FileRef | string | number | boolean;

const mimes: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    avif: "image/avif",
    gif: "image/gif",
    svg: "image/svg+xml",
    pdf: "application/pdf",
    json: "application/json",
    txt: "text/plain",
    csv: "text/csv",
    mp4: "video/mp4",
    webm: "video/webm",
    mp3: "audio/mpeg",
    m4a: "audio/mp4",
    woff2: "font/woff2",
    woff: "font/woff",
    ttf: "font/ttf",
    otf: "font/otf",
};

export const uploadLimits: Limits = { maxBytes: 10485760, maxFiles: 10 };

export function extensionOf ( name: string ): string {

    const index = name.lastIndexOf(".");

    return index === -1 ? "" : name.slice(index + 1).toLowerCase();

}
export function mimeOf ( name: string ): string {

    return mimes[extensionOf(name)] ?? "application/octet-stream";

}
export function isFileRef ( value: unknown ): value is FileRef {

    const ref = value as Partial<FileRef> | null;

    return (
        typeof ref === "object" &&
        ref !== null &&
        typeof ref.uri === "string" &&
        typeof ref.name === "string" &&
        typeof ref.type === "string"
    );

}
export function checkFile ( file: Blob, limits: Limits = uploadLimits, field = "file" ): void {

    if ( file.size > limits.maxBytes ) {

        throw new Failure("input", {
            errors: { [field]: [`Larger than ${formatBytes(limits.maxBytes)}.`] },
            reason: "file_too_large",
        });

    }

    if (
        limits.types &&
        !limits.types.some(( type ) =>
            type.endsWith("/*") ? file.type.startsWith(type.slice(0, -1)) : file.type === type,
        )
    ) {

        throw new Failure("input", { errors: { [field]: ["Unsupported file type."] }, reason: "file_type" });

    }

}
function append ( data: FormData, key: string, item: Part, limits: Limits, count: { files: number } ): void {

    if ( item instanceof Blob || isFileRef(item) ) {

        count.files += 1;

        if ( count.files > limits.maxFiles ) throw new Failure("input", { reason: "too_many_files" });
        if ( item instanceof Blob ) checkFile(item, limits, key);

        data.append(key, item as Blob);

        return;

    }

    data.append(key, String(item));

}
export function toFormData ( value: Record<string, unknown>, limits: Limits = uploadLimits ): FormData {

    const data = new FormData();
    const count = { files: 0 };

    for ( const [key, item] of Object.entries(value) ) {

        if ( item === null || item === undefined ) continue;

        if ( Array.isArray(item) ) {

            for ( const entry of item )
                append(data, `${key}[]`, entry instanceof Blob ? entry : (entry as Part), limits, count);

            continue;

        }

        if ( item instanceof Blob || isFileRef(item) || typeof item !== "object" ) {

            append(data, key, item as Part, limits, count);

            continue;

        }

        data.append(key, JSON.stringify(item));

    }

    return data;

}
export function dataUri ( type: string, base64: string ): string {

    return `data:${type};base64,${base64}`;

}

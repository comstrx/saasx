import { webUrl } from "./url.ts";

type File = {
    id?: number; name?: string | null; type?: string | null; url?: string | null; path?: string | null; bytes?: number | null;
};
type Asset = { name?: string | null; type?: string | null; path?: string | null; size?: number | null };
export type FileItem = { key: string; name: string | null; type: string | null; href?: string; bytes?: number | null };

export function fileItems ( files: readonly File[] ): FileItem[] {

    return files.map(( file, index ) => ({
        key: String(file.id ?? index), name: file.name ?? null, type: file.type ?? null,
        href: webUrl(file.url), bytes: file.bytes,
    }));

}
export function deliveredFiles ( assets: readonly Asset[], files: readonly File[] ): FileItem[] {

    return assets.map(( asset, index ) => ({
        key: String(index), name: asset.name ?? null, type: asset.type ?? null, bytes: asset.size,
        href: asset.path ? webUrl(files.find(( file ) => file.path === asset.path)?.url) : undefined,
    }));

}
export function fileSize ( bytes: number | null | undefined, locale: string ): string | undefined {

    if ( bytes == null || !Number.isFinite(bytes) || bytes < 0 ) return undefined;

    const units = ["byte", "kilobyte", "megabyte", "gigabyte"] as const;
    const index = Math.min(units.length - 1, Math.max(0, Math.floor(Math.log10(bytes || 1) / 3)));

    return new Intl.NumberFormat(locale, {
        style: "unit", unit: units[index], maximumFractionDigits: 1, numberingSystem: "latn",
    }).format(bytes / 1000 ** index);

}

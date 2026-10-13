import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { compare, walk } from "./core.ts";

export type Files = Map<string, Uint8Array>;
export type AssetFolder = { path: string; brand: string };
export type Skip = ( name: string, base: string, publicFiles: boolean ) => boolean;

export function assetFiles ( folder: string, skip: Skip, publicFiles = false ): Files {

    const files: Files = new Map();

    if ( !existsSync(folder) ) return files;

    for (const { entry, path, name } of walk(folder, ( _, item ) =>
        skip(item, item.slice(item.lastIndexOf("/") + 1), publicFiles),
    )) {

        if ( entry.isSymbolicLink() ) throw new Error(`Asset symlinks are not supported: ${path}`);
        if ( entry.isFile() ) files.set(name, readFileSync(path));

    }

    return files;

}
export function composeAssets ( folders: readonly AssetFolder[], shared: string, brand: string, skip: Skip ): Files {

    const assets = folders.flatMap(( folder ) => {

        const files = new Map([
            ...assetFiles(resolve(shared, folder.path), skip),
            ...assetFiles(resolve(brand, folder.brand), skip),
        ]);

        return [...files].map(( [name, bytes] ): [string, Uint8Array] => [`${folder.path}/${name}`, bytes]);

    });

    return new Map(assets.sort(( [a], [b] ) => compare(a, b)));

}

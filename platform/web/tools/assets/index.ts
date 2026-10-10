import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { compare, walk } from "../core/index.ts";

type Files = Map<string, Buffer>;

const folders = [
    { path: "assets/images/brand", brand: "images" },
    { path: "assets/videos/brand", brand: "videos" },
    { path: "assets/audios/brand", brand: "audios" },
    { path: "assets/fonts", brand: "fonts" },
    { path: "assets/licenses", brand: "licenses" },
    { path: ".well-known", brand: "well-known" },
] as const;

export const specPaths = folders.map(( folder ) => folder.path);
export const brandFolders = [...folders.map(( folder ) => folder.brand), "messages"];

function skipped ( name: string, publicFiles: boolean ): boolean {

    const wellKnown = publicFiles && name === ".well-known";
    const base = name.slice(name.lastIndexOf("/") + 1);

    return (base.startsWith(".") && !wellKnown) || base === "_generated";

}
export function assetFiles ( folder: string, publicFiles = false ): Files {

    const files: Files = new Map();

    if ( !existsSync(folder) ) return files;

    for ( const { entry, path, name } of walk(folder, ( _, item ) => skipped(item, publicFiles)) ) {

        if ( entry.isSymbolicLink() ) throw new Error(`Asset symlinks are not supported: ${path}`);
        if ( entry.isFile() ) files.set(name, readFileSync(path));

    }

    return files;

}
export function composeAssets ( publicFolder: string, brand: string ): Files {

    const assets = folders.flatMap(( folder ) => {

        const files = new Map([...assetFiles(resolve(publicFolder, folder.path)), ...assetFiles(resolve(brand, folder.brand))]);

        return [...files].map(( [name, bytes] ): [string, Buffer] => [`${folder.path}/${name}`, bytes]);

    });

    return new Map(assets.sort(( [a], [b] ) => compare(a, b)));

}
